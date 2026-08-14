# Project: Brotherhood Embedded TON Wallet Migration (WalletV5R1)

## Architecture
Replace `@tonconnect/ui-react` completely across the application (`/home/zeta/jetton`) with an embedded in-app TON wallet management and transaction signing system supporting the `WalletV5R1` standard adapted from reference implementations (`demo-wallet`, `@demo/wallet-core`, `@ton/walletkit`).

The architecture consists of four core layers:
1. **Wallet Core & Cryptography**: Mnemonic seed generation (12/24 words via `@ton/crypto` / `@scure/bip39`), keypair derivation, `WalletV5R1` contract instantiation (workchain 0, subwallet ID `2147483409`), AES-GCM client key encryption & PBKDF2-SHA512 key derivation, and `localStorage` credential persistence.
2. **Wallet Context & State Management (`WalletContext`)**: React Context provider managing active wallet, wallet list, unlock/lock state, active address/balance, and RPC broadcaster client (`TonClient`).
3. **In-App Wallet UI Components**: Components for Create Wallet, Import Seed, View Seed, Switch Active Wallet, Lock/Unlock, and Wallet Status Header trigger adapted from `demo-wallet`.
4. **Direct In-App Transaction Construction, Signing, & RPC Submission**: `useSendFiTransaction` and `DeployPage` construct `WalletV5R1` transfer action cells, sign with local secret key, wrap into external messages, and broadcast BOCs directly via `TonClient` RPC.

---

## Feature Inventory

| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | WalletV5R1 Contract & Key Derivation | Workchain 0, subwallet ID 2147483409, 12/24 word seed derivation via `@ton/crypto` / `@scure/bip39` | M1 | R2 |
| 2 | AES-GCM Key Persistence & Session Security | Web Crypto AES-GCM + PBKDF2-SHA512 (100k iterations), session lock/unlock, localStorage schema | M1 | R4 |
| 3 | Direct RPC Broadcaster | Construct WalletV5R1 transfer cell, Ed25519 secret key sign, broadcast BOC via `TonClient` | M1 | R3 |
| 4 | Wallet Context & Provider (`WalletProvider`) | React Context managing active wallet, wallet list, lock/unlock, balance, RPC client | M2 | R1 |
| 5 | In-App Wallet Setup UI (Create & Import) | 24-word seed creation, 12/24-word seed import, seed phrase reveal modal | M2 | R1 |
| 6 | In-App Wallet Management UI (Switch & Seed) | Switch active wallet, view decrypted seed, rename/remove wallet | M2 | R1 |
| 7 | Header & Common UI Integration | Replace `<TonConnectButton />` in `Header.tsx`, refactor `wallet-selector.tsx` & `common.tsx` | M2 | R1 |
| 8 | `AppProviders` Provider Update | Remove `TonConnectUIProvider` & `TonConnectThemeSync` from `AppProviders.tsx` | M2 | R1 |
| 9 | In-App `useSendFiTransaction` Hook | Refactor `useSendFiTransaction` to sign with active WalletV5R1 key and broadcast via RPC | M3 | R3 |
| 10 | `DeployPage.tsx` Transaction Signing | Refactor `DeployPage.tsx` to use embedded WalletV5R1 state and direct transaction signing | M3 | R3 |
| 11 | `ManagePage.tsx` & Tab Prop Clean Up | Remove `tonConnectUI` prop from `ManagePage` and all 10 sub-tabs | M4 | R1, R3 |
| 12 | 10 Manage Tabs Transaction Conversion | Update `AdminTab`, `AllowanceTab`, `BurnTab`, `CreditTab`, `DestroyTab`, `InviteTab`, `IssueTokenTab`, `MintTab`, `TransferTab`, `VoteTab` | M4 | R3 |
| 13 | TonConnect Dependency & Config Cleanup | Remove `@tonconnect/ui-react` from `package.json`, `vite.config.ts`, and `public/tonconnect-manifest.json` | M4 | R1 |
| 14 | E2E Validation & Build Checks | Passing `nub run typecheck` and `nub run build`, verification across all tabs and deploy page | M5 | Acceptance Criteria |

---

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Wallet Core & Crypto Infrastructure | `src/lib/wallet/` (WalletV5R1 adapter, seed derivation, AES-GCM crypto, storage, RPC sender) | none | PLANNED |
| M2 | Wallet Context & UI Setup | `src/providers/WalletContext.tsx`, `src/providers/AppProviders.tsx`, `src/components/Header.tsx`, `src/components/wallet-selector.tsx`, `src/pages/manage/common.tsx` | M1 | PLANNED |
| M3 | Direct Transaction Engine | `src/lib/useSendFiTransaction.ts`, `src/pages/DeployPage.tsx` | M1, M2 | PLANNED |
| M4 | Manage Tabs Refactoring & TonConnect Removal | `src/pages/manage/ManagePage.tsx`, 10 Manage tabs, `package.json`, `vite.config.ts`, `public/tonconnect-manifest.json` | M2, M3 | PLANNED |
| M5 | E2E Verification & Build Certification | E2E testing track verification, `typecheck` & `build` validation | M1, M2, M3, M4 | PLANNED |

---

## Interface Contracts

### M1 ↔ M2: `WalletCore` & `WalletContext` Contract
```ts
export interface WalletCredentials {
  id: string;
  name: string;
  address: string; // User-friendly EQ... address
  publicKey: string; // Hex string
  encryptedMnemonic: string; // AES-GCM base64 payload
  network: 'mainnet' | 'testnet';
  createdAt: number;
}

export interface ActiveWalletState {
  wallet: WalletCredentials | null;
  secretKey: Buffer | null; // Available when unlocked
  isUnlocked: boolean;
  balance: bigint; // Nanotons
  subwalletId: number; // 2147483409
  contractAddress: Address;
}

export interface WalletCoreAPI {
  generateMnemonic(): Promise<string[]>; // 24 words
  validateMnemonic(mnemonic: string[]): boolean; // 12 or 24 words
  deriveWalletV5R1(mnemonic: string[], network?: 'mainnet' | 'testnet'): Promise<{
    address: Address;
    publicKey: Buffer;
    secretKey: Buffer;
    subwalletId: number;
  }>;
  encryptMnemonic(mnemonic: string[], password: string): Promise<string>;
  decryptMnemonic(encrypted: string, password: string): Promise<string[]>;
}
```

### M2 / M3 ↔ Transaction Engine: `useSendFiTransaction`
```ts
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

---

## Code Layout

```
src/
├── lib/
│   ├── wallet/                      # [M1] Wallet Core & Crypto Infrastructure
│   │   ├── wallet-v5-r1.ts          # WalletV5R1 contract & adapter
│   │   ├── crypto.ts                # AES-GCM & PBKDF2-SHA512 utilities
│   │   ├── mnemonic.ts              # Mnemonic derivation & validation
│   │   ├── storage.ts               # LocalStorage encrypted wallet schema
│   │   └── rpc-client.ts            # TonClient RPC BOC submission
│   ├── useSendFiTransaction.ts      # [M3] Refactored transaction hook
│   └── deploy.ts                    # Payload builders (existing, unedited)
├── providers/
│   ├── WalletContext.tsx            # [M2] Wallet Context & Provider
│   └── AppProviders.tsx            # [M2] Provider root (TonConnect removed)
├── components/
│   ├── Header.tsx                   # [M2] Header with in-app wallet button
│   ├── wallet-selector.tsx          # [M2] In-app wallet management modal/picker
│   └── wallet/                      # [M2] Wallet UI sub-components (Create, Import, Unlock, Switch)
├── pages/
│   ├── DeployPage.tsx               # [M3] Refactored deploy page
│   └── manage/
│       ├── ManagePage.tsx           # [M4] Manage page container (tonConnectUI removed)
│       ├── common.tsx               # [M2] WalletRequired component
│       ├── AdminTab.tsx             # [M4]
│       ├── AllowanceTab.tsx         # [M4]
│       ├── BurnTab.tsx              # [M4]
│       ├── CreditTab.tsx            # [M4]
│       ├── DestroyTab.tsx           # [M4]
│       ├── InviteTab.tsx            # [M4]
│       ├── IssueTokenTab.tsx        # [M4]
│       ├── MintTab.tsx              # [M4]
│       ├── TransferTab.tsx          # [M4]
│       └── VoteTab.tsx              # [M4]
```
