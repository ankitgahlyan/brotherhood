# Brotherhood Embedded TON Wallet Migration (WalletV5R1)
## Test Infrastructure & Quality Assurance Specification

---

## 1. Test Philosophy & Architecture

### 1.1 Core Testing Principles
The testing framework for the Brotherhood Embedded TON Wallet Migration strictly adheres to an **Opaque-Box, Requirement-Driven Testing Philosophy**.

1. **Opaque-Box Verification**: Tests inspect and validate software behavior solely through public module interfaces, exported functional contracts, cell structures, and observable user workflows. No test relies on private variable access, internal monkey-patching, or volatile implementation details.
2. **Requirement-Driven Assertions**: Every test case is directly traceable to functional specifications defined in `PROJECT.md`, `ORIGINAL_REQUEST.md`, and TL-B/TVM smart contract standards for TON `WalletV5R1`.
3. **Strict Independence & Isolation**: Each test case sets up its own isolated environment (mock state, memory storage, test fixtures), executes deterministically regardless of execution order, and performs comprehensive cleanup upon completion.
4. **Authoritative Expected Output Derivation**:
   - **Cell & Opcode Verification**: Target cell hashes, slice opcodes, subwallet IDs (`2147483409`), and payload structures are derived directly from TVM specifications and generated contract wrappers (`@wrappers/FossFi.gen`, `@wrappers/FossFiWallet.gen`, `@wrappers/Personal.gen`).
   - **Cryptographic Determinism**: Public keys, contract deployment addresses, and AES-GCM payloads are verified against standards-compliant reference implementations (`@ton/crypto`, `@scure/bip39`, Web Crypto API).
5. **Adversarial Verification Strategy**:
   - **Encoding & Escaping Integrity**: Testing inputs containing unicode strings, empty strings, max-length buffers, corrupted base64 payloads, and invalid hex formats.
   - **Invalid Input Combinations**: Submitting out-of-range sequence numbers, invalid seed lengths (e.g. 11, 13, 25 words), incorrect passwords, and malformed contract addresses.
   - **Boundary & Resource Stress**: Testing empty payload transfers, zero-amount minting, extreme nano-TON values, and storage state corruption.

---

## 2. Feature Inventory Mapping (Features 1–14)

The table below maps all 14 project features from `PROJECT.md` to their corresponding component code, test tier coverage, expected inputs/outputs, and error handling contracts.

| # | Feature Name | Description | Source Components | Test Tier Coverage | Expected Inputs | Expected Outputs | Error Handling Behavior |
|---|--------------|-------------|-------------------|-------------------|-----------------|------------------|-------------------------|
| 1 | WalletV5R1 Contract & Key Derivation | Workchain 0, subwallet ID `2147483409`, 12/24 word seed derivation via `@ton/crypto` & `@scure/bip39` | `src/lib/wallet/mnemonic.ts`, `src/lib/wallet/wallet-v5-r1.ts` | Tier 1, Tier 2, Tier 3 | 12 or 24 word mnemonic seed array | Derived keypair (`publicKey`, `secretKey`), deterministic `WalletV5R1` address (`EQ...`) | Throws descriptive error for invalid word counts (e.g., 11 or 25 words) |
| 2 | AES-GCM Key Persistence & Session Security | Web Crypto AES-GCM + PBKDF2-SHA512 (100k iterations), session lock/unlock, localStorage schema v2 | `src/lib/wallet/crypto.ts`, `src/lib/wallet/storage.ts` | Tier 1, Tier 2, Tier 3 | Seed phrase string/array, password string | Base64 salt+iv+ciphertext payload, SHA-256 password hash | Decryption with incorrect password throws `DOMException` / `OperationError` |
| 3 | Direct RPC Broadcaster | Construct `WalletV5R1` transfer cell, Ed25519 secret key sign, broadcast BOC via `TonClient` | `src/lib/wallet/rpc-client.ts`, `src/lib/wallet/wallet-v5-r1.ts` | Tier 1, Tier 2, Tier 3 | Signed BOC string/buffer/cell, target Address | Message hash string, seqno integer, balance bigint | Returns default `seqno: 0` for non-existent contracts; throws on RPC rejection |
| 4 | Wallet Context & Provider (`WalletProvider`) | React Context managing active wallet, wallet list, lock/unlock, balance, RPC client | `src/providers/WalletContext.tsx` | Tier 1, Tier 2, Tier 3, Tier 4 | Password, active wallet ID, new wallet parameters | Context state update, unlocked secret key buffer | Returns `isUnlocked: false` when locked; handles empty storage state cleanly |
| 5 | In-App Wallet Setup UI (Create & Import) | 24-word seed creation, 12/24-word seed import, seed phrase reveal modal | `src/components/wallet/CreateWalletModal.tsx`, `ImportWalletModal.tsx` | Tier 1, Tier 2, Tier 4 | Password, custom name, seed input | New `SavedWallet` persisted to `localStorage` | Rejects invalid seed phrases with inline UI error message |
| 6 | In-App Wallet Management UI (Switch & Seed) | Switch active wallet, view decrypted seed, rename/remove wallet | `src/components/wallet-selector.tsx` | Tier 1, Tier 2, Tier 4 | Wallet selection event, password verification | Active wallet switch, updated list | Restricts seed reveal without valid password confirmation |
| 7 | Header & Common UI Integration | Replace `<TonConnectButton />` in `Header.tsx`, refactor `wallet-selector.tsx` & `common.tsx` | `src/components/Header.tsx`, `src/pages/manage/common.tsx` | Tier 1, Tier 4 | Wallet state change, route navigation | Rendered trigger button with wallet balance & user address | Displays "Connect Wallet" trigger when no active wallet exists |
| 8 | `AppProviders` Provider Update | Remove `TonConnectUIProvider` & `TonConnectThemeSync` from `AppProviders.tsx` | `src/providers/AppProviders.tsx` | Tier 1, Tier 4 | React subtree children | Rendered application tree wrapped in `WalletProvider` | Zero dependency on TonConnect context hooks |
| 9 | In-App `useSendFiTransaction` Hook | Refactor `useSendFiTransaction` to sign with active WalletV5R1 key and broadcast via RPC | `src/lib/useSendFiTransaction.ts` | Tier 1, Tier 2, Tier 3, Tier 4 | Array of `SendTransactionMessage` objects | Transaction result `{ boc, hash }` | Throws error if wallet is locked or secret key is missing |
| 10 | `DeployPage.tsx` Transaction Signing | Refactor `DeployPage.tsx` to use embedded WalletV5R1 state and direct transaction signing | `src/pages/DeployPage.tsx` | Tier 1, Tier 2, Tier 4 | Jetton symbol, name, decimals, mint amount | Executed deployment transaction & minter state init | Validates inputs prior to payload building |
| 11 | `ManagePage.tsx` & Tab Prop Clean Up | Remove `tonConnectUI` prop from `ManagePage` and all 10 sub-tabs | `src/pages/manage/ManagePage.tsx` | Tier 1, Tier 4 | Active tab URL query parameter (`?tab=`) | Cleanly rendered tab component | Tab components fetch wallet state from `useWallet()` directly |
| 12 | 10 Manage Tabs Transaction Conversion | Update Admin, Allowance, Burn, Credit, Destroy, Invite, IssueToken, Mint, Transfer, Vote tabs | `src/pages/manage/*Tab.tsx` | Tier 1, Tier 2, Tier 3, Tier 4 | Specific tab form inputs (address, amount, metadata) | Executed transaction hash & UI feedback toast | Catches transaction failures and displays descriptive error notifications |
| 13 | TonConnect Dependency & Config Cleanup | Remove `@tonconnect/ui-react` from `package.json`, `vite.config.ts`, and manifest | `package.json`, `vite.config.ts` | Tier 1, Tier 4 | Clean installation tree | Successful TypeScript typecheck and Vite build | Zero broken imports or missing module resolutions |
| 14 | E2E Validation & Build Checks | Passing `nub run typecheck` and `nub run build`, verification across all tabs | `scripts/smoke-test.mjs`, Playwright E2E | Tier 1, Tier 2, Tier 3, Tier 4 | Project build pipeline trigger | Pristine typecheck output and static assets in `dist/client` | Non-zero exit code on build or typecheck warnings/errors |

---

## 3. Test Architecture & Runner Guide

### 3.1 Test Framework Architecture
```
                         ┌────────────────────────────────────────┐
                         │         Test Execution Suite           │
                         └───────────────────┬────────────────────┘
                                             │
      ┌──────────────────────────────────────┼──────────────────────────────────────┐
      │                                      │                                      │
      ▼                                      ▼                                      ▼
┌───────────┐                          ┌───────────┐                          ┌───────────┐
│ Tier 1 & 2│                          │  Tier 3   │                          │  Tier 4   │
│ Unit &    │                          │ Integration│                          │ Headless  │
│ Contract  │                          │  Testing  │                          │ Browser   │
└─────┬─────┘                          └─────┬─────┘                          └─────┬─────┘
      │                                      │                                      │
      ▼                                      ▼                                      ▼
┌───────────────────────────┐  ┌───────────────────────────┐  ┌───────────────────────────┐
│ `bun test`                │  │ `bun test`                │  │ `bunx playwright test`    │
│ - tier1-wallet-core.test  │  │ - tier3-integration.test  │  │ - e2e/wallet-ui.spec.ts   │
│ - tier1-crypto-storage    │  │ - pairwise workflow test  │  │ - e2e/transactions.spec   │
│ - tier1-signing-rpc.test  │  │                           │  │ - node smoke-test.mjs     │
│ - tier1-payload-builders  │  │                           │  │                           │
└───────────────────────────┘  └───────────────────────────┘  └───────────────────────────┘
```

### 3.2 Execution Commands

1. **Unit & Integration Suite (Tiers 1–3)**:
   ```bash
   bun test
   ```
   *Runs all Bun test suites in `src/lib/wallet/__tests__/` with real-time assertion reporting.*

2. **TypeScript Typecheck Verification**:
   ```bash
   nub run typecheck
   ```
   *Verifies zero type errors across the contract wrappers, wallet core, and React components.*

3. **Frontend Bundle Build & Prerender Certification**:
   ```bash
   nub run build
   ```
   *Executes Vite production build and outputs static prerendered client application to `dist/client`.*

4. **Static Route Hydration & Client Bundle Smoke Test**:
   ```bash
   nub run smoke
   ```
   *Executes `scripts/smoke-test.mjs` against static client build.*

5. **Headless Browser E2E Suite (Tier 4)**:
   ```bash
   bunx playwright test
   ```
   *Launches Playwright headless Chromium tests against local dev server.*

---

## 4. Test Tier Breakdown

### Tier 1: Unit & Component Feature Coverage (≥5 test cases / feature category)
- **Coverage Goal**: Verify fundamental functional building blocks under ideal conditions.
- **Focus Areas**:
  - `WalletV5R1` address derivation, subwallet ID `2147483409`, 24-word seed generation.
  - Mnemonic import (12 & 24 words), BIP39/TON derivation validation.
  - AES-GCM encryption/decryption, PBKDF2 100k iteration key derivation, salt/IV structure.
  - `localStorage` persistence (`brotherhood_wallet_store`, `brotherhood_active_wallet_id`, `brotherhood_password_hash`).
  - Action cell construction, Ed25519 signing (`0x7369676e`), external message wrapping.
  - RPC broadcaster client URL derivation, API key headers, seqno/balance queries.
  - All 19 transaction payload builders in `src/lib/deploy.ts` (Mint, Transfer, Burn, Admin, Allowance, Credit, Destroy, Invite, IssueToken, Vote, Deploy).

### Tier 2: Boundary & Corner Cases (≥5 test cases / feature category)
- **Coverage Goal**: Stress error handling, edge cases, and unexpected input conditions.
- **Focus Areas**:
  - Mnemonic validation with 11, 13, 23, 25 words, invalid dictionary words, mixed whitespace.
  - AES-GCM decryption with wrong passwords, truncated payloads, corrupted base64.
  - `localStorage` with corrupted JSON state, missing keys, browser environments without `localStorage`.
  - RPC queries on non-existent or uninitialized account addresses (`seqno: 0`, `balance: 0n`).
  - Out-of-range token amounts, negative nanotons, empty addresses in payload builders.

### Tier 3: Pairwise Cross-Feature Combinations & State Transitions
- **Coverage Goal**: Validate multi-component workflows and state transitions.
- **Focus Areas**:
  - Full creation-to-signing pipeline: Mnemonic -> Keypair -> WalletV5R1 -> AES Encrypt -> Storage Save -> Unlock -> Transfer Payload Build -> Ed25519 Sign -> External Message -> RPC Serialization.
  - Active wallet switching and multi-account state updates.
  - Password change & re-encryption workflow across saved wallets.

### Tier 4: Real-World E2E Scenarios
- **Coverage Goal**: End-to-end user experience in browser runtime.
- **Focus Areas**:
  - In-app wallet onboarding (Create 24-word wallet vs Import 12-word wallet).
  - Session lock/unlock modal flow.
  - Transaction submission across all 11 Manage tabs and Deploy page without TonConnect modal popups.

---

## 5. Coverage Metrics & Threshold Targets

To certify codebase quality and prevent regressions, all automated test runs must meet or exceed the following coverage thresholds:

| Metric Target | Threshold | Description |
|---------------|-----------|-------------|
| **Feature Coverage** | **100%** | All 14 features from `PROJECT.md` covered in Tier 1–4 suites |
| **Statement Coverage** | **≥ 85%** | Core wallet modules (`src/lib/wallet/*`) statement execution |
| **Branch Coverage** | **≥ 80%** | Conditional branch execution across crypto and payload builders |
| **Function Coverage** | **≥ 90%** | Exported function execution rate |
| **Line Coverage** | **≥ 85%** | Line coverage rate across `src/lib/wallet/` and `src/lib/deploy.ts` |
| **Payload Opcode Integrity** | **100%** | All 19 payload builders verified for exact TVM cell opcodes |

---
