# Handoff Report — Milestone 2.1: WalletContext Provider Specification & Strategy

## 1. Observation

Direct observations from inspecting authoritative spec files and the completed M1 core wallet modules in `src/lib/wallet/`:

1. **Specification & Scope Files**:
   - `/home/zeta/jetton/.agents/ORIGINAL_REQUEST.md`: R1 requires complete TonConnect removal and direct in-app wallet management (create, import via 12/24-word seed, switch, storage, balance display). R2 requires standard `WalletV5R1` contract instances (workchain 0, subwallet ID `2147483409`). R4 requires secure local storage key persistence with AES-GCM encryption and session unlock mechanisms.
   - `/home/zeta/jetton/PROJECT.md`: Feature 4 defines `WalletContext` & `WalletProvider` managing active wallet, wallet list, lock/unlock state, active address/balance, and RPC broadcaster client (`TonClient`). Interface contracts (lines 50-82) specify `SavedWallet`/`WalletCredentials` and `ActiveWalletState`.
   - `/home/zeta/jetton/.agents/sub_orch_m2_wallet_ui/SCOPE.md`: `src/providers/WalletContext.tsx` is the React Context provider managing state, active balance polling, and `TonClient` instance.

2. **Completed M1 Core Modules (`src/lib/wallet/`)**:
   - `wallet-v5-r1.ts`:
     - `DEFAULT_SUBWALLET_ID` = `2147483409` (line 21).
     - `WalletV5R1.createFromPublicKey(publicKey: Buffer, subwalletId = DEFAULT_SUBWALLET_ID, workchain = 0)` instantiates contract with `Address` (lines 204-218).
     - `createTransferPayload(options: CreateTransferPayloadOptions): Promise<Cell>` and `createExternalMessage(options: CreateExternalMessageOptions): Promise<Cell>` construct signed external messages (lines 242-326).
   - `crypto.ts`:
     - `SimpleEncryption.encrypt(data: string, password: string): Promise<string>` encrypts plaintext using Web Crypto AES-GCM + PBKDF2-SHA512 (lines 44-67).
     - `SimpleEncryption.decrypt(encryptedData: string, password: string): Promise<string>` decrypts payload (lines 72-98).
     - `hashPassword(password: string): Promise<string>` computes SHA-256 password hash (lines 112-118).
     - `verifyPassword(password: string, storedHash: string): Promise<boolean>` verifies password against stored hash (lines 123-129).
   - `mnemonic.ts`:
     - `generateMnemonic(wordsCount: 12 | 24 = 24): Promise<string[]>` generates seed phrase (lines 27-31).
     - `validateMnemonic(mnemonic: string[] | string): Promise<boolean>` checks validity (lines 36-48).
     - `mnemonicToKeyPair(mnemonic: string[] | string, mnemonicType?: MnemonicType): Promise<KeyPair>` derives Ed25519 `publicKey` and `secretKey` (lines 58-93).
     - `deriveWalletV5R1(...)` derives `address`, `publicKey`, `secretKey`, `subwalletId`, and `WalletV5R1` contract instance (lines 106-126).
   - `storage.ts`:
     - Keys: `WALLET_STORE_KEY = 'brotherhood_wallet_store'`, `PASSWORD_HASH_KEY = 'brotherhood_password_hash'`, `ACTIVE_WALLET_ID_KEY = 'brotherhood_active_wallet_id'`.
     - Data models: `SavedWallet` (lines 5-15) and `WalletCredentials` (lines 17-25).
     - Storage helpers: `getSavedWallets()`, `saveWallet(wallet)`, `removeWallet(id)`, `getWalletById(id)`, `getActiveWalletId()`, `setActiveWalletId(id)`, `getPasswordHash()`, `setPasswordHash(hash)`, `clearWalletStore()`.
   - `rpc-client.ts`:
     - `WalletRpcClient` class wraps `@ton/ton` `TonClient` (lines 75-245).
     - `getTonClient(): TonClient` returns underlying `TonClient` instance (lines 97-99).
     - `getBalance(address: Address | string): Promise<bigint>` queries nanotons (lines 179-188).
     - `getRpcClient(network?: NetworkMode): WalletRpcClient` returns singleton instance (lines 253-260).

3. **Current Provider Integration**:
   - `src/providers/AppProviders.tsx`: Currently wraps app with `QueryClientProvider` and `TonConnectUIProvider` (lines 68-81).

4. **Repository Build Status**:
   - `nub run typecheck` completed cleanly with exit code 0.

---

## 2. Logic Chain

From the observations above, we step through the design and specification of `src/providers/WalletContext.tsx`:

1. **State Requirements**:
   - To manage active wallet credentials and multiple wallets, `WalletContext` must hold `wallets` (`SavedWallet[]`), `activeWallet` (`SavedWallet | null`), and `activeWalletV5` (`WalletV5R1 | null`).
   - For secure session unlock, secret material (`secretKey`: `Buffer | null`, `mnemonic`: `string[] | null`) must be stored ONLY in React `useState` memory. When `secretKey !== null`, `isUnlocked` is `true`.
   - For wallet initialization state, `isInitialized` should reflect whether a password hash exists (`getPasswordHash() !== null`) and at least one wallet is saved (`wallets.length > 0`).
   - For blockchain state, `balance` (`bigint`) and `isBalanceLoading` (`boolean`) track the active wallet's nanotons.
   - For network and RPC, `network` (`'mainnet' | 'testnet'`) drives the `rpcClient` (`WalletRpcClient`) and exposed `tonClient` (`TonClient`).

2. **Context API Method Specifications**:
   - `createWallet(name, password)`:
     Generates 24-word seed -> derives `WalletV5R1` -> encrypts seed with AES-GCM -> sets/verifies password hash in storage -> persists `SavedWallet` -> updates `wallets`, `activeWallet`, sets `secretKey` & `mnemonic` in memory -> returns `SavedWallet`.
   - `importWallet(name, mnemonic, password, mnemonicType)`:
     Validates seed phrase -> derives `WalletV5R1` -> encrypts normalized seed -> sets/verifies password hash -> persists `SavedWallet` -> unlocks session in memory -> returns `SavedWallet`.
   - `unlockWallet(password)`:
     Verifies password against stored password hash -> decrypts `activeWallet.encryptedMnemonic` -> derives `secretKey` via `mnemonicToKeyPair` -> sets `secretKey`, `mnemonic`, `isUnlocked = true` -> resets auto-lock timer.
   - `lockWallet()`:
     Sets `secretKey = null`, `mnemonic = null`, `isUnlocked = false` -> clears auto-lock timer.
   - `switchWallet(id)`:
     Updates `ACTIVE_WALLET_ID_KEY` -> updates `activeWallet` state -> re-derives `activeWalletV5` -> if unlocked, re-derives keypair for newly active wallet using current session password -> triggers immediate balance refresh.
   - `renameWallet(id, name)`:
     Updates name in `SavedWallet` -> saves to storage -> updates React `wallets` list and `activeWallet` if affected.
   - `deleteWallet(id)`:
     Removes wallet from storage -> updates `wallets` -> if active wallet was deleted, switches to remaining wallet or sets active to null -> if no wallets remain, locks context.
   - `revealMnemonic(password)`:
     Verifies password -> decrypts active wallet's `encryptedMnemonic` -> returns `string[]`.
   - `refreshBalance()`:
     Queries `rpcClient.getBalance(activeWallet.address)` -> updates `balance` -> returns `bigint`.
   - `setNetwork(network)`:
     Updates `network` -> updates `rpcClient = getRpcClient(network)` -> re-queries balance.

3. **RPC Client & Balance Polling Strategy**:
   - `rpcClient` is instantiated via `getRpcClient(network)`.
   - `tonClient` is retrieved via `rpcClient.getTonClient()`.
   - Balance polling runs on a 10-second interval (`10,000ms`) via `useEffect` keyed on `[activeWallet?.address, network]`.
   - When active address or network changes, an immediate `refreshBalance()` is called, followed by setup of `setInterval`.
   - Polling errors are caught silently in try/catch to prevent transient network issues (e.g. rate-limiting or network outage) from crashing React state.

4. **TypeScript Interfaces & Re-exports**:
   - Define `WalletContextType` fully typed with all state fields and async methods.
   - Export custom hook `useWallet(): WalletContextType` with guard throwing friendly error if used outside `WalletProvider`.

5. **Storage & Security Strategy**:
   - `localStorage` stores only `brotherhood_wallet_store` (encrypted payloads), `brotherhood_password_hash`, and `brotherhood_active_wallet_id`.
   - Decrypted `secretKey` and `mnemonic` exist **only in React state memory**.
   - Auto-lock timeout: 15-minute inactivity timer that invokes `lockWallet()`. User actions reset the timer.

---

## 3. Caveats

1. **Memory Cleared on Page Refresh**: Because decrypted keys are held exclusively in React state memory, refreshing the web page or navigating away will automatically lock the wallet. This is security-by-design for non-browser-extension dApps.
2. **Global Password Model**: All wallets in the app share a single master password hash (`PASSWORD_HASH_KEY`). Importing or creating a wallet uses this master password for AES-GCM encryption.
3. **RPC Rate Limits**: Free public Toncenter endpoints without API keys are rate-limited to 1 req/sec. `WalletRpcClient` uses `VITE_TONCENTER_MAINNET_API_KEY` when configured. Polling interval of 10s prevents hitting rate limits.

---

## 4. Conclusion & Proposed Implementation Specifications

`src/providers/WalletContext.tsx` should be implemented as a clean, complete React Context provider exposing the exact API and state below:

```tsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { Address } from '@ton/core';
import { TonClient } from '@ton/ton';

import { SimpleEncryption, hashPassword, verifyPassword } from '../lib/wallet/crypto';
import {
  deriveWalletV5R1,
  generateMnemonic,
  mnemonicToKeyPair,
  normalizeMnemonic,
  validateMnemonic,
  type MnemonicType,
} from '../lib/wallet/mnemonic';
import {
  getRpcClient,
  type NetworkMode,
  type WalletRpcClient,
} from '../lib/wallet/rpc-client';
import {
  clearWalletStore,
  getActiveWalletId,
  getPasswordHash,
  getSavedWallets,
  getWalletById,
  removeWallet,
  saveWallet,
  setActiveWalletId,
  setPasswordHash,
  type SavedWallet,
} from '../lib/wallet/storage';
import { DEFAULT_SUBWALLET_ID, WalletV5R1 } from '../lib/wallet/wallet-v5-r1';

export interface WalletContextType {
  // State
  wallets: SavedWallet[];
  activeWallet: SavedWallet | null;
  activeWalletV5: WalletV5R1 | null;
  secretKey: Buffer | null;
  mnemonic: string[] | null;
  isUnlocked: boolean;
  isInitialized: boolean;
  balance: bigint;
  isBalanceLoading: boolean;
  network: NetworkMode;
  rpcClient: WalletRpcClient;
  tonClient: TonClient;

  // Actions
  createWallet: (name: string, password: string) => Promise<SavedWallet>;
  importWallet: (
    name: string,
    mnemonic: string[] | string,
    password: string,
    mnemonicType?: MnemonicType,
  ) => Promise<SavedWallet>;
  unlockWallet: (password: string) => Promise<boolean>;
  lockWallet: () => void;
  switchWallet: (id: string) => void;
  renameWallet: (id: string, name: string) => void;
  deleteWallet: (id: string) => void;
  revealMnemonic: (password: string) => Promise<string[]>;
  refreshBalance: () => Promise<bigint>;
  setNetwork: (network: NetworkMode) => void;
  clearStore: () => void;
}
```

### Auto-Lock Session Architecture:
- Auto-lock duration: 15 minutes (900,000 ms).
- Managed via `useEffect` with `setTimeout`. Activity reset listeners (`mousemove`, `keydown`, `click`) call `resetAutoLockTimer()`.

### RPC & Polling:
- Default polling interval: 10,000 ms.
- Runs inside `useEffect([activeWallet?.address, network])`. Calls `refreshBalance()`.

---

## 5. Verification Method

To verify the implementation once written by implementer:

1. **Typecheck Verification**:
   ```bash
   nub run typecheck
   ```
   Must complete with 0 errors.

2. **Build Verification**:
   ```bash
   nub run build
   ```
   Must complete static build successfully.

3. **Smoke Verification**:
   ```bash
   nub run smoke
   ```
   Ensures app initializes and renders without runtime errors.
