# Comprehensive Analysis & Handoff Report: Demo Wallet & WalletV5R1 Reference Implementation

## 1. Observation

### 1.1 Reference Code Locations
The reference implementations for `demo-wallet`, `@demo/wallet-core`, and `@ton/walletkit` are located in `/home/zeta/kit`:
- **Demo Wallet App**: `/home/zeta/kit/apps/demo-wallet`
  - Setup screens: `/home/zeta/kit/apps/demo-wallet/src/features/wallet-setup/`
  - Wallets & Seed UI: `/home/zeta/kit/apps/demo-wallet/src/features/wallets/`
  - Auth & Unlock: `/home/zeta/kit/apps/demo-wallet/src/features/auth/`
  - Send UI & Hooks: `/home/zeta/kit/apps/demo-wallet/src/features/send/`
  - Master Hook: `/home/zeta/kit/apps/demo-wallet/src/core/hooks/use-ton-wallet.ts`
- **Wallet Core Library**: `/home/zeta/kit/demo/wallet-core`
  - Zustand store creation: `/home/zeta/kit/demo/wallet-core/src/store/createWalletStore.ts`
  - Wallet management slice: `/home/zeta/kit/demo/wallet-core/src/store/slices/walletManagementSlice.ts`
  - Auth slice: `/home/zeta/kit/demo/wallet-core/src/store/slices/authSlice.ts`
  - Crypto utilities (AES-GCM): `/home/zeta/kit/demo/wallet-core/src/utils/crypto.ts`
  - Wallet adapter factory: `/home/zeta/kit/demo/wallet-core/src/utils/walletAdapterFactory.ts`
- **WalletKit SDK**: `/home/zeta/kit/packages/walletkit`
  - WalletV5R1 contract: `/home/zeta/kit/packages/walletkit/src/contracts/w5/WalletV5R1.ts`
  - WalletV5R1 adapter: `/home/zeta/kit/packages/walletkit/src/contracts/w5/WalletV5R1Adapter.ts`
  - Mnemonic utilities: `/home/zeta/kit/packages/walletkit/src/utils/mnemonic.mts`
  - Signer utility: `/home/zeta/kit/packages/walletkit/src/utils/Signer.ts`
  - Toncenter API client: `/home/zeta/kit/packages/walletkit/src/clients/toncenter/ApiClientToncenter.ts`

---

### 1.2 WalletV5R1 Contract Initialization & Key Derivation
From `/home/zeta/kit/packages/walletkit/src/contracts/w5/WalletV5R1.ts` (lines 21-37, 54, 77-87):
```ts
export const defaultWalletIdV5R1 = 2147483409;

export type WalletV5Config = {
    signatureAllowed: boolean;
    seqno: number;
    walletId: number;
    publicKey: bigint;
    extensions: Dictionary<bigint, bigint>;
};

export function walletV5ConfigToCell(config: WalletV5Config): Cell {
    return beginCell()
        .storeBit(config.signatureAllowed)
        .storeUint(config.seqno, 32)
        .storeUint(config.walletId, 32)
        .storeUint(config.publicKey, 256)
        .storeDict(config.extensions, Dictionary.Keys.BigUint(256), Dictionary.Values.BigInt(1))
        .endCell();
}
```

Address calculation uses `@ton/core` contract address derivation:
```ts
static createFromConfig(config: WalletV5Config, options: WalletOptions) {
    const data = walletV5ConfigToCell(config);
    const init = { code: options.code, data };
    const wallet = new WalletV5(options.client, contractAddress(options.workchain, init), init);
    wallet.subwalletId = config.walletId;
    return wallet;
}
```

Mnemonic derivation from `/home/zeta/kit/packages/walletkit/src/utils/mnemonic.mts` (lines 14-66):
- **12 or 24 Word TON Mnemonic**: Uses `@ton/crypto` `mnemonicToWalletKey(mnemonicArray)` to obtain `{ publicKey, secretKey }`.
- **BIP39 Mnemonic**: Uses `@scure/bip39` `bip39MnemonicToSeed(mnemonic.join(' '))`, followed by derivation path `[44, 607, 0]` via `deriveEd25519Path` and `keyPairFromSeed`.
- **Mnemonic Generation**: `CreateTonMnemonic()` calls `@ton/crypto` `mnemonicNew(24)`.

---

### 1.3 AES-GCM Key Persistence & Session Unlock
From `/home/zeta/kit/demo/wallet-core/src/utils/crypto.ts` (lines 14-70):
```ts
export class SimpleEncryption {
    static async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
        const keyMaterial = await pbkdf2_sha512(password, Buffer.from(salt), 100000, 32);
        return await crypto.subtle.importKey('raw', new Uint8Array(keyMaterial), { name: 'AES-GCM' }, false, [
            'encrypt',
            'decrypt',
        ]);
    }

    static async encrypt(data: string, password: string): Promise<string> {
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const key = await this.deriveKey(password, salt);
        const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, this.encoder.encode(data));

        const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
        combined.set(salt, 0);
        combined.set(iv, salt.length);
        combined.set(new Uint8Array(encrypted), salt.length + iv.length);
        return Buffer.from(combined).toString('base64');
    }

    static async decrypt(encryptedData: string, password: string): Promise<string> {
        const combined = new Uint8Array(Buffer.from(encryptedData, 'base64'));
        const salt = combined.slice(0, 16);
        const iv = combined.slice(16, 28);
        const data = combined.slice(28);
        const key = await this.deriveKey(password, salt);
        const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
        return this.decoder.decode(decrypted);
    }
}
```

From `/home/zeta/kit/demo/wallet-core/src/store/slices/authSlice.ts` (lines 30-79):
- **Password verification hash**: `SHA-256(password + 'wallet_salt')` using `crypto.subtle.digest`.
- **Unlock**: Verifies entered password hash against stored `passwordHash`. On success, populates `currentPassword` in memory state.
- **Lock**: Resets `currentPassword` to `undefined` and `isUnlocked` to `false`.

From `/home/zeta/kit/demo/wallet-core/src/store/createWalletStore.ts` (lines 158-192):
- **Storage key**: `demo-wallet-store` (version `2`).
- **Persisted Schema (`SavedWallet`)**:
  ```ts
  interface SavedWallet {
      id: string; // `wallet_${timestamp}_${random}`
      name: string; // "Wallet 1"
      address: UserFriendlyAddress;
      publicKey: Hex;
      encryptedMnemonic: string; // AES-GCM base64 payload
      walletType: 'mnemonic' | 'signer' | 'ledger';
      walletInterfaceType: 'mnemonic' | 'signer' | 'ledger';
      version: 'v5r1' | 'v4r2';
      network: 'mainnet' | 'testnet' | 'tetra';
      createdAt: number;
      kitWalletId: string;
  }
  ```

---

### 1.4 In-App Wallet UI Component Architecture
- **Create Wallet**: `CreateWalletScreen` (`create-wallet-screen.tsx`)
  - Generates 24-word seed via `CreateTonMnemonic()`.
  - Displays recovery phrase in a 2-column grid (`mnemonic-grid.tsx`) with blur reveal overlay (`Click to reveal`).
  - Network selector (`NetworkSelector`): Mainnet / Testnet / Tetra.
  - Confirmation modal (`SavePhraseConfirmModal`): Prompts user to confirm seed phrase is saved.
  - Calls `importWallet(mnemonic, 'v5r1', network)`.
- **Import Mnemonic**: `ImportWalletScreen` (`import-wallet-screen.tsx`)
  - 24 input cells (supports 12 or 24 words).
  - Validation via `evaluateBip39Slots(words)` and `isImportableBip39`.
  - Supports pasting full mnemonic string (`extractMnemonicWordsFromPaste` / `applyMnemonicPaste`).
  - Version selector (`Segmented` UI component): `v5r1` / `v4r2`.
  - Interface selector: `mnemonic` / `signer`.
- **View Seed**: `MnemonicDisplay` / `getDecryptedMnemonic`
  - Decrypts stored `encryptedMnemonic` using `currentPassword` in `walletManagementSlice`.
- **Switch Active Wallet**: `WalletSwitcher` (`wallet-switcher.tsx`)
  - Accordion / Dropdown listing all `savedWallets`.
  - Shows name, network badge, formatted address (`EQ...`), interface type, and creation date.
  - Switch action: Calls `switchWallet(walletId)` which updates `activeWalletId`, active `currentWallet` contract instance, subscribes streaming websocket, and fetches balance/events.
  - Wallet rename and remove actions (`renameWallet`, `removeWallet`).
- **Unlock Wallet**: `UnlockScreen` (`unlock-screen.tsx`)
  - Input field for password.
  - Calls `unlock(password)`, then `loadAllWallets()`, and navigates to `/wallet`.
  - Includes Reset Wallet option (`handleReset`), which clears all stored wallets and state.

---

### 1.5 Transaction Payload Construction, Signing, & RPC Submission
From `/home/zeta/kit/packages/walletkit/src/contracts/w5/WalletV5R1Adapter.ts` (lines 178-216, 279-404):
1. **Transaction Request Input**:
   ```ts
   interface TransactionRequest {
       validUntil?: number;
       messages: Array<{
           address: string;
           amount: string; // nanotons
           payload?: string; // base64 cell payload
           stateInit?: string; // base64 stateInit cell
           extraCurrency?: Record<number, string>;
       }>;
   }
   ```
2. **Transfer Action & Message Cell**:
   - `createTransferAction`: Creates `@ton/core` internal message `internal({ to: msg.address, value: BigInt(msg.amount), bounce })`. Loads `msg.body = Cell.fromBase64(msg.payload)` and `msg.init = loadStateInit(...)` if provided.
   - Packs messages into an Action list cell (`packActionsList`).
3. **Payload Structure & Opcode (`createBodyV5`)**:
   - Opcode: `0x7369676e` (`auth_signed` external) or `0x73696e74` (`auth_signed_internal` gasless).
   - Payload cell:
     ```ts
     const payload = beginCell()
         .storeUint(0x7369676e, 32)
         .storeUint(walletId, 32) // subwallet ID (2147483409)
         .storeUint(expireAt, 32) // validUntil timestamp
         .storeUint(seqno, 32) // contract sequence number
         .storeSlice(actionsList.beginParse())
         .endCell();
     ```
4. **Secret Key Signing**:
   - `signingData = domainPrefix ? Buffer.concat([domainPrefix, payload.hash()]) : payload.hash()`.
   - `signature = await this.sign(signingData)`: Calls `DefaultSignature(signingData, keyPair.secretKey)` (Ed25519 sign using `@ton/crypto` / `@noble/curves`).
   - Final transfer body cell: `beginCell().storeSlice(payload.beginParse()).storeBuffer(signatureBuffer).endCell()`.
5. **BOC Envelope Construction**:
   - Creates external message: `external({ to: walletAddress, init: walletContract.init, body: transferBody })`.
   - Serializes to BOC base64: `beginCell().store(storeMessage(ext)).endCell().toBoc().toString('base64')`.
6. **BOC Submission via TonClient / Toncenter**:
   - From `/home/zeta/kit/packages/walletkit/src/clients/toncenter/ApiClientToncenter.ts` (lines 129-137):
     ```ts
     async sendBoc(boc: Base64String): Promise<string> {
         const response = await this.postJson<V2SendMessageResult>('/api/v3/message', { boc });
         return `0x${Base64ToBigInt(response.message_hash_norm).toString(16)}`;
     }
     ```

---

## 2. Logic Chain

1. **Observation 1.1**: Reference code is fully present inside `/home/zeta/kit/apps/demo-wallet`, `/home/zeta/kit/demo/wallet-core`, and `/home/zeta/kit/packages/walletkit`.
2. **Observation 1.2**: `WalletV5R1` contract instances use workchain 0, subwallet ID `2147483409`, `@ton/crypto`'s `mnemonicToWalletKey` for 12/24 word TON mnemonics, and `@scure/bip39` for BIP39 mnemonics. Contract addresses are deterministically derived via `contractAddress(0, { code: WalletV5R1CodeCell, data: walletV5ConfigToCell(...) })`.
   - **Reasoning**: This confirms how standard WalletV5R1 addresses and public keys must be derived when user creates or imports a wallet in our application.
3. **Observation 1.3**: AES-GCM encryption is handled by `SimpleEncryption` using Web Crypto API (`crypto.subtle`) with key derived via `pbkdf2_sha512` (100k iterations, 16-byte salt, 12-byte IV). Auth state persists in `localStorage` under `demo-wallet-store` version 2.
   - **Reasoning**: The active session keeps `currentPassword` in memory to perform decryption/signing, while `localStorage` stores only `encryptedMnemonic` and `passwordHash`. If `persistPassword` is false, locking or refreshing clears `currentPassword` from memory, requiring password unlock.
4. **Observation 1.4**: In-app UI components in `demo-wallet` provide modular screens and modals (`CreateWalletScreen`, `ImportWalletScreen`, `UnlockScreen`, `WalletSwitcher`, `MnemonicDisplay`) powered by `useAuth()` and `useWallet()` store hooks.
   - **Reasoning**: To replace `@tonconnect/ui-react` completely, we can adapt these exact UI component patterns, form states, mnemonic cell grids, and switcher drop-downs into our frontend app structure.
5. **Observation 1.5**: Direct transaction flow builds `TransactionRequest` messages, packs them into V5 actions, appends `0x7369676e` + `walletId` + `expireAt` + `seqno`, signs the payload hash with the Ed25519 secret key, wraps it into an `external` message cell (including `init` stateInit if uninitialized), encodes to base64 BOC, and posts to `/api/v3/message` via Toncenter API client.
   - **Reasoning**: This provides a zero-dependency direct signing and RPC submission mechanism that avoids external wallet popups or TonConnect bridge dependencies.

---

## 3. Caveats

- **Network Mode**: Investigation was performed in read-only mode using existing workspace and kit reference files.
- **Ledger Hardware Wallet Support**: `demo-wallet` includes optional Ledger support (`createWalletV4R2Ledger`), but for our in-app software wallet requirement, `v5r1` mnemonic-based wallets are the primary target standard.
- **Gasless Transfer Relaying**: `WalletV5R1Adapter` supports opcode `0x73696e74` (`auth_signed_internal`) for gasless transfers relayed by a third party. Standard transactions use `0x7369676e` (`auth_signed`) external messages directly.

---

## 4. Conclusion

The reference implementation at `/home/zeta/kit` provides a complete, production-tested blueprint for embedded in-app TON wallet management and WalletV5R1 contract interaction:
1. **Wallet Initialization & Key Derivation**: Fully supported for 12 and 24 word mnemonics using `@ton/crypto` (`mnemonicToWalletKey`) and `@ton/core` (`WalletV5.createFromConfig` with subwallet ID `2147483409` in workchain 0).
2. **Key Security & Persistence**: Secured with Web Crypto AES-GCM + PBKDF2-SHA512 (100k iterations) and Zustand persist middleware in `localStorage` under schema version 2.
3. **UI Integration**: Modular components for Create, Import, Unlock, View Seed, and Switch Wallet are readily adaptable.
4. **Direct Signing & RPC Broadcast**: Transactions build transfer action cells, sign Ed25519 payload hashes locally, wrap external BOCs, and submit directly to Toncenter `/api/v3/message`.

---

## 5. Verification Method

To verify these findings and reference implementation structure independently:
1. **Inspect Kit Packages & Apps**:
   - `view_file /home/zeta/kit/packages/walletkit/src/contracts/w5/WalletV5R1Adapter.ts`
   - `view_file /home/zeta/kit/packages/walletkit/src/contracts/w5/WalletV5R1.ts`
   - `view_file /home/zeta/kit/demo/wallet-core/src/utils/crypto.ts`
   - `view_file /home/zeta/kit/demo/wallet-core/src/store/slices/walletManagementSlice.ts`
   - `view_file /home/zeta/kit/apps/demo-wallet/src/features/wallet-setup/components/create-wallet-screen/create-wallet-screen.tsx`
2. **Check Unit Tests in Kit**:
   - Run tests in `/home/zeta/kit/packages/walletkit`:
     `cd /home/zeta/kit/packages/walletkit && bun test` (or `npm test`)
