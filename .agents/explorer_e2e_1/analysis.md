# Comprehensive E2E Testing & Specification Mining Analysis Report

## Executive Summary

This report documents the findings of the **E2E Testing Track Specification Mining** phase for the Brotherhood Embedded TON Wallet Migration (`WalletV5R1`). It analyzes the available test runner and Node execution environment, enumerates the key interfaces and data flows of the core wallet modules, maps all 19 transaction triggers across 11 Manage tabs and the Deploy page, and details an opaque-box testing strategy that exercises all components without modifying production source code.

---

## 1. Test Runners & Node Execution Environment

| Tool / Runner | Command | Installation Status | Capabilities & Suitability |
|---|---|---|---|
| **Bun Test** | `bun test` | Installed (`bun@1.3.14`) | **Primary Unit & Integration Runner**. Zero-config TypeScript execution (`.test.ts`, `.spec.ts`), built-in assertions (`expect`), mocks/spies (`bun:test`), sub-millisecond execution. |
| **Vitest** | `bunx vitest` / `npx vitest` | Installed (`vitest@4.1.10`) | Vite-native test runner with support for jsdom/happy-dom. Ideal for React component rendering tests and custom React hook tests (`@testing-library/react`). |
| **TSX** | `bunx tsx` / `npx tsx` | Installed (`tsx@4.23.11`) | Direct TypeScript script runner on Node.js without ahead-of-time compilation. Useful for running standalone integration scripts or verification harnesses. |
| **Node.js** | `node` / `node --import` | Installed (`v22.23.2`) | Native Node environment for running ES modules (`.mjs`, `.js`), smoke test scripts, and build post-processing. |
| **Playwright** | `bunx playwright` | Installed (`playwright@1.62.1`) | Headless browser automation runner (Chromium installed in `~/.cache/ms-playwright`). Used for end-to-end browser user interface and transaction workflow testing. |
| **Acton Test** | `acton test` | Installed | Smart contract Tolk test runner for smart contract tests under `contracts/tests/*.test.tolk`. |
| **Smoke Test** | `node scripts/smoke-test.mjs` | Custom Script | Verifies frontend dev server rendering and client-side bundle route hydration. |

---

## 2. Key Modules, Interfaces, & Data Flows

### 2.1 WalletV5R1 Key Derivation & Contract Building (`mnemonic.ts`, `wallet-v5-r1.ts`)

#### Exports & Interfaces
```ts
// src/lib/wallet/mnemonic.ts
export function generateMnemonic(): Promise<string[]>; // 24 words via @ton/crypto mnemonicNew
export function validateMnemonic(mnemonic: string[]): boolean; // 12 or 24 words
export function mnemonicToKeyPair(mnemonic: string[]): Promise<{ publicKey: Buffer; secretKey: Buffer }>;
export function deriveWalletV5R1(mnemonic: string[], network?: 'mainnet' | 'testnet'): Promise<{
  address: Address;
  publicKey: Buffer;
  secretKey: Buffer;
  subwalletId: number; // 2147483409
}>;

// src/lib/wallet/wallet-v5-r1.ts
export const defaultWalletIdV5R1 = 2147483409;

export interface WalletV5Config {
  signatureAllowed: boolean;
  seqno: number;
  walletId: number;
  publicKey: bigint;
  extensions: Dictionary<bigint, bigint>;
}

export function walletV5ConfigToCell(config: WalletV5Config): Cell;

export class WalletV5R1Contract implements Contract {
  readonly address: Address;
  readonly init?: { code: Cell; data: Cell };
  readonly subwalletId: number;

  static createFromConfig(config: WalletV5Config, workchain?: number): WalletV5R1Contract;
  createTransferCell(options: {
    seqno: number;
    secretKey: Buffer;
    timeout?: number;
    messages: SendTransactionMessage[];
  }): Cell;
}
```

#### Data Flow
1. User provides or generates a 12/24-word seed phrase array.
2. `mnemonicToKeyPair` uses `@ton/crypto` `mnemonicToWalletKey` to derive Ed25519 `{ publicKey, secretKey }`.
3. `walletV5ConfigToCell` packs `signatureAllowed` (true), `seqno` (0), `subwalletId` (2147483409), `publicKey` (256-bit BigInt), and an empty extensions dictionary into the contract data cell.
4. `contractAddress(0, { code: WalletV5R1CodeCell, data })` calculates the deterministic workchain 0 user address (`EQ...`).
5. When creating transactions, `createTransferCell` constructs an action list cell of internal transfer messages, prepends opcode `0x7369676e` + `walletId` + `validUntil` + `seqno`, signs the payload hash with `secretKey` (Ed25519), and returns the outer external message cell (`Cell`).

---

### 2.2 Key Storage & AES-GCM Encryption (`crypto.ts`, `storage.ts`)

#### Exports & Interfaces
```ts
// src/lib/wallet/crypto.ts
export class SimpleEncryption {
  static deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey>; // PBKDF2-SHA512 (100k iter, 32-byte key)
  static encrypt(data: string, password: string): Promise<string>; // returns salt(16) + iv(12) + ciphertext in base64
  static decrypt(encryptedBase64: string, password: string): Promise<string>;
  static hashPassword(password: string): Promise<string>; // SHA-256(password + 'wallet_salt')
}

// src/lib/wallet/storage.ts
export interface SavedWallet {
  id: string; // `wallet_${timestamp}_${random}`
  name: string;
  address: string; // User-friendly EQ... address
  publicKey: string; // Hex string
  encryptedMnemonic: string; // AES-GCM base64 string
  walletType: 'mnemonic';
  version: 'v5r1';
  network: 'mainnet' | 'testnet';
  createdAt: number;
}

export function loadSavedWallets(): SavedWallet[];
export function saveWallets(wallets: SavedWallet[]): void;
export function addWallet(wallet: SavedWallet): void;
export function removeWallet(id: string): void;
export function getActiveWalletId(): string | null;
export function setActiveWalletId(id: string): void;
```

#### Data Flow
1. On wallet creation/import, the user supplies a session password.
2. `SimpleEncryption.encrypt(mnemonic.join(' '), password)` generates a 16-byte random salt and 12-byte IV, derives an AES-256 key via PBKDF2-SHA512 (100,000 iterations), encrypts the seed string, and outputs a base64 string.
3. The encrypted payload and wallet metadata are saved to `localStorage` under key `brotherhood_wallet_store` (schema version 2).
4. Unlocking the session verifies `SHA-256(password + 'wallet_salt')` against the stored password hash and decrypts `encryptedMnemonic` into memory (`secretKey` buffer held in active React context).

---

### 2.3 RPC Broadcasting (`rpc-client.ts`)

#### Exports & Interfaces
```ts
// src/lib/wallet/rpc-client.ts
export interface RpcClientConfig {
  network: 'mainnet' | 'testnet';
  apiKey?: string;
}

export function getRpcClient(network: 'mainnet' | 'testnet'): TonClient;
export function fetchSeqno(address: Address, network?: 'mainnet' | 'testnet'): Promise<number>;
export function fetchBalance(address: Address, network?: 'mainnet' | 'testnet'): Promise<bigint>;
export function broadcastBoc(bocBase64: string, network?: 'mainnet' | 'testnet'): Promise<{ messageHash: string }>;
```

#### Data Flow
1. Configures `TonClient` with mainnet (`https://toncenter.com/api/v2/jsonRPC`) or testnet (`https://testnet.toncenter.com/api/v2/jsonRPC`) RPC endpoints using `TONCENTER_MAINNET_API_KEY` or `TONCENTER_TESTNET_API_KEY`.
2. `fetchSeqno` executes `runMethod` `'seqno'` on the user's `WalletV5R1` contract address to retrieve the next valid sequence number (returns 0 if contract is not yet deployed).
3. `broadcastBoc` submits the signed external BOC payload to `/api/v3/message` or via `TonClient.sendExternalMessage` / `client.sendFile()`, returning the message hash.

---

### 2.4 Direct Transaction Hook & Payload Builders (`useSendFiTransaction.ts`, `deploy.ts`)

#### Exports & Interfaces
```ts
// src/lib/useSendFiTransaction.ts
export interface SendTransactionMessage {
  address: string;
  amount: bigint;
  payload?: Cell;
  stateInit?: Cell;
}

export interface TransactionResult {
  boc: string;
  hash: string;
}

export function useSendFiTransaction(): {
  sendTransaction: (messages: SendTransactionMessage[]) => Promise<TransactionResult>;
  isSending: boolean;
  error: Error | null;
};
```

#### Data Flow
1. Tab components invoke `sendTransaction(messages)`.
2. `useSendFiTransaction` obtains the unlocked `secretKey`, `contractAddress`, and `subwalletId` from `WalletContext`.
3. Calls `fetchSeqno` to get the current account `seqno`.
4. Constructs the signed transfer BOC cell using `WalletV5R1Contract.createTransferCell({ seqno, secretKey, messages })`.
5. Calls `broadcastBoc(boc.toBoc().toString('base64'))` to broadcast the transaction directly to TON RPC.

---

### 2.5 All 19 Transaction Triggers Across 11 Manage Tabs & Deploy Page

| # | Page / Tab | Action Name | Method / Trigger | Target Contract Address | Value (TON) | Opcode (Hex) | Payload Builder (`src/lib/deploy.ts`) |
|---|---|---|---|---|---|---|---|
| 1 | `DeployPage.tsx` | Deploy Jetton | `handleDeploy` | Derived Minter Address | `0.15 TON` | `0x00001001` | `buildDeployMessage` -> `buildMintBody` |
| 2 | `AdminTab.tsx` | Update Metadata | `handleUpdateContent` | Minter (`FI_ADDRESS`) | `0.05 TON` | `0x00001008` | `buildChangeContentBody` |
| 3 | `AdminTab.tsx` | Transfer Admin | `handleChangeAdmin` | Minter (`FI_ADDRESS`) | `0.05 TON` | `0x00001007` | `buildChangeAdminBody` |
| 4 | `AdminTab.tsx` | Top Up Tons | `handleTopUpTons` | Minter (`FI_ADDRESS`) | `0.10 TON` | `0x0000100b` | `buildTopUpTonsBody` |
| 5 | `AdminTab.tsx` | Approve Upgrade | `handleApproveUpgrade` | Minter (`FI_ADDRESS`) | `0.05 TON` | `0x000010a3` | `buildApproveUpgradeBody` |
| 6 | `AdminTab.tsx` | Reject Upgrade | `handleRejectUpgrade` | Minter (`FI_ADDRESS`) | `0.05 TON` | `0x000010a4` | `buildRejectUpgradeBody` |
| 7 | `MintTab.tsx` | Mint Tokens | `handleMint` | Minter (`FI_ADDRESS`) | `0.10 TON` | `0x00001001` | `buildMintBody` |
| 8 | `AllowanceTab.tsx` | Grant/Revoke Allowance | `handleSetAllowance` | User FI Wallet Address | `0.60 TON` | `0x000010f8` | `buildSetAllowanceBody` |
| 9 | `AllowanceTab.tsx` | Spend Allowance | `handleSpend` | Grantor FI Wallet Address | `0.60 TON` | `0x000010f9` | `buildSpendAllowanceBody` |
| 10 | `BurnTab.tsx` | Burn Tokens | `handleBurn` | User FI Wallet Address | `0.05 TON` | `0x595f07bc` | `buildBurnBody` |
| 11 | `CreditTab.tsx` | Buy Credit | `handleBuyCredit` | User FI Wallet Address | `1.50 TON` | `0x000010a1` | `buildBuyCreditBody` |
| 12 | `CreditTab.tsx` | Pay Back | `handlePayback` | Personal Wallet Address | `0.60 TON` | `0x595f07bc` | `buildBurnBody` |
| 13 | `DestroyTab.tsx` | Destroy Account | `sendDestroy` | User FI Wallet Address | `0.60 TON` | `0x0000105a` | `buildDestroyBody` |
| 14 | `InviteTab.tsx` | Send Invite | `handleInvite` | User FI Wallet Address | `0.60 TON` | `0x00001051` | `buildInviteBody` |
| 15 | `IssueTokenTab.tsx` | Deploy Personal Minter | `handleIssue` (Msg 1) | Personal Minter Address | `1.00 TON` | Deploy | `buildPersonalMinterDeploy` |
| 16 | `IssueTokenTab.tsx` | Point Personal Minter | `handleIssue` (Msg 2) | Issuer FI Wallet Address | `0.60 TON` | `0x0000105b` | `buildPointPersonalMinterBody` |
| 17 | `TransferTab.tsx` | Transfer Tokens | `handleTransfer` | User FI Wallet Address | `0.05 TON` | `0x0f8a7ea5` | `buildTransferBody` |
| 18 | `VoteTab.tsx` | Vote | `sendVote(true)` | User FI Wallet Address | `0.60 TON` | `0x00001058` | `buildVoteBody` |
| 19 | `VoteTab.tsx` | Unvote | `sendVote(false)` | User FI Wallet Address | `0.60 TON` | `0x00001059` | `buildUnvoteBody` |

---

## 3. Opaque-Box E2E Testing Strategy

The opaque-box testing strategy verifies all features across four distinct layers without altering application source code.

```
+-------------------------------------------------------------------------+
| Layer 1: Wallet Core & Cryptography Unit Tests (bun test)              |
| - Seed generation (24 words) & validation (12/24 words)                 |
| - Keypair derivation & WalletV5R1 address determinism                   |
| - AES-GCM + PBKDF2 encryption/decryption & password hash validation     |
| - LocalStorage persistence schema (save/load/active wallet switch)      |
+-------------------------------------------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
| Layer 2: Payload Builders & Cell Encoding Integration Tests (bun test) |
| - Serialization & opcode verification for all 19 payload builders       |
| - WalletV5R1 transfer cell construction (opcode 0x7369676e)             |
| - Ed25519 signature payload hashing and verification                    |
+-------------------------------------------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
| Layer 3: Direct Transaction Hook Simulation (bun test / tsx)            |
| - Mock RPC client responses (seqno, balance, BOC submission)            |
| - Mock WalletContext provider state                                     |
| - End-to-end hook execution via useSendFiTransaction                     |
+-------------------------------------------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
| Layer 4: Headless Browser E2E Suite (Playwright & Smoke Script)        |
| - App hydration and route rendering without TonConnect dependencies     |
| - Wallet setup UI flows (Create Wallet, Import Seed, Unlock, Switch)    |
| - UI tab navigation across all 11 Manage tabs & DeployPage              |
| - Transaction form trigger verification                                 |
+-------------------------------------------------------------------------+
```

---

## Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Wallet Core | Mnemonic Generation | Generates 24-word seed phrase using `@ton/crypto` | None | `string[]` (24 words) | Throws if RNG fails | `mnemonic.ts` |
| 2 | Wallet Core | Mnemonic Validation | Validates 12 or 24 word mnemonic list | `mnemonic: string[]` | `boolean` | Returns `false` for invalid words/checksum | `mnemonic.ts` |
| 3 | Wallet Core | Key Derivation | Derives Ed25519 keypair and WalletV5R1 address (workchain 0, subwallet 2147483409) | `mnemonic: string[]`, `network` | `{ address, publicKey, secretKey, subwalletId }` | Throws for invalid seed phrase | `mnemonic.ts`, `wallet-v5-r1.ts` |
| 4 | Security | AES-GCM Encryption | Encrypts seed phrase with Web Crypto AES-GCM + PBKDF2 key derivation (100k iter) | `mnemonic: string[]`, `password: string` | Base64 salt+iv+ciphertext string | Throws on empty password/data | `crypto.ts` |
| 5 | Security | AES-GCM Decryption | Decrypts base64 payload using password | `encrypted: string`, `password: string` | `string[]` (mnemonic array) | Throws DOMException on wrong password | `crypto.ts` |
| 6 | Storage | LocalStorage Persistence | Persists saved wallets under `brotherhood_wallet_store` schema v2 | `SavedWallet[]` | `void` | Handles empty/corrupted localStorage safely | `storage.ts` |
| 7 | RPC | Seqno & Balance Fetching | Queries account sequence number and balance via Toncenter RPC | `address: Address`, `network` | `seqno: number`, `balance: bigint` | Handles network timeout / uninitialized account | `rpc-client.ts` |
| 8 | RPC | BOC Broadcast | Submits signed external message cell to TON network RPC | `bocBase64: string`, `network` | `{ messageHash: string }` | Throws RPC broadcast error on rejected transaction | `rpc-client.ts` |
| 9 | Direct Tx | In-App Tx Hook | Signs messages with active WalletV5R1 secret key and broadcasts BOC | `messages: SendTransactionMessage[]` | `{ boc: string, hash: string }` | Throws if wallet is locked or RPC fails | `useSendFiTransaction.ts` |
| 10 | Contracts | 19 Payload Builders | Encodes contract opcodes and TL-B cells for Jetton/Governance ops | Specific form params | `@ton/core Cell` | Throws on invalid address or negative values | `deploy.ts` |

---

## Edge Cases

| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| 1 | Mnemonic Validation | 11 words or 25 words | `validateMnemonic` returns `false`. |
| 2 | Mnemonic Validation | 12/24 words with invalid BIP39 word | `validateMnemonic` returns `false`. |
| 3 | Key Decryption | Incorrect password | `decryptMnemonic` throws DOMException (`OperationError: The operation failed for an application-specific reason`). |
| 4 | Storage Loading | `localStorage` contains corrupted JSON | `loadSavedWallets` catches JSON parse error and returns empty array `[]`. |
| 5 | WalletV5R1 Seqno | Account not yet deployed on-chain | `fetchSeqno` handles `runMethod` failure or missing account and defaults `seqno` to `0`. |
| 6 | WalletV5R1 Action Batching | `IssueTokenTab` 2-message payload (Deploy + SetPersonalJettonMinter) | Action list packs both internal messages into single V5 external transfer cell. |
| 7 | Unlocked Key Session | Page refresh when `persistPassword` is false | Secret key buffer is cleared from memory state; user is prompted to enter password to unlock. |
