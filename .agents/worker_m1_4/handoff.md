# Handoff Report — Milestone 1: Wallet Core & Cryptography Infrastructure

## 1. Observation

All 6 core modules in `src/lib/wallet/` and associated unit test suites were inspected and verified against the specifications in `/home/zeta/jetton/.agents/sub_orch_m1_wallet_core/SCOPE.md` and `/home/zeta/jetton/PROJECT.md`:

### Implementation Files & Key Exports
1. **`src/lib/wallet/wallet-v5-r1.ts`**
   - `DEFAULT_SUBWALLET_ID`: `2147483409` (`0x7f000001`)
   - `WalletV5R1Opcodes`: Opcodes for `auth_signed` (`0x7369676e`), `auth_signed_internal` (`0x73696e74`), `action_send_msg` (`0x0ec3c86d`), `auth_extension` (`0x6578746e`), etc.
   - `WalletV5R1CodeBoc` / `WalletV5R1CodeCell`: Compiled TVM bytecode for Wallet V5R1.
   - `walletV5ConfigToCell`: Storage state serializer for initial contract data.
   - `ActionSendMsg`: Outbound action serializer with SendMode flags.
   - `packActionsList`: TVM action list cell builder.
   - `WalletV5R1`: Contract class with `createFromConfig`, `createFromPublicKey`, `createFromAddress`.
   - `createTransferPayload`: Constructs and Ed25519-signs transfer action cell with seqno, validUntil, subwallet ID, and signature payload.
   - `createExternalMessage`: Wraps signed transfer payload into external message with stateInit when `seqno === 0`.

2. **`src/lib/wallet/mnemonic.ts`**
   - `generateMnemonic`: Generates 12 or 24 word mnemonic phrases via `@ton/crypto` (`mnemonicNew`).
   - `validateMnemonic`: Validates seed phrase word count (12 or 24) and checksum via `@ton/crypto` (`mnemonicValidate`).
   - `normalizeMnemonic`: Trims, converts to lowercase, and splits whitespace.
   - `mnemonicToKeyPair`: Derives Ed25519 keypair for TON standard or BIP39 standard (`m/44'/607'/0'`).
   - `deriveWalletV5R1`: Derives WalletV5R1 contract instance on workchain 0 with default subwallet ID `2147483409`.

3. **`src/lib/wallet/crypto.ts`**
   - `SimpleEncryption`: Web Crypto AES-GCM encryption/decryption with PBKDF2-SHA512 key derivation (100,000 iterations, 16-byte salt, 12-byte IV). Encrypted payload is base64-encoded `[16B salt + 12B IV + ciphertext]`.
   - `generateSalt`: Generates 16-byte random base64 salt string.
   - `hashPassword`: Deterministic SHA-256 password hash using `password + 'wallet_salt'`.
   - `verifyPassword`: Verifies password against stored hex hash.

4. **`src/lib/wallet/storage.ts`**
   - Constants: `WALLET_STORE_KEY` (`brotherhood_wallet_store`), `PASSWORD_HASH_KEY` (`brotherhood_password_hash`), `ACTIVE_WALLET_ID_KEY` (`brotherhood_active_wallet_id`).
   - Storage API: `getSavedWallets`, `saveWallet`, `removeWallet`, `getWalletById`, `getActiveWalletId`, `setActiveWalletId`, `getPasswordHash`, `setPasswordHash`, `clearWalletStore`.
   - Data models: `SavedWallet` (schema v2) and `WalletCredentials`.

5. **`src/lib/wallet/rpc-client.ts`**
   - `WalletRpcClient`: Wrapper around `@ton/ton` `TonClient`.
   - `sendBoc`: Primary submission via `/api/v3/message` endpoint with fallback to `TonClient.sendFile`. Supports Cell, Buffer, base64, and hex string BOC inputs.
   - `getSeqno`: Queries seqno via `runMethod(..., 'seqno')`, returning `0` if account is non-existent/uninitialized.
   - `getBalance`: Queries balance in nanotons.
   - `getAccountState`: Queries account status (`active`, `uninitialized`, `frozen`, `non-existing`), balance, and seqno.
   - `getRpcClient`: Singleton factory for shared RPC client instances.

6. **`src/lib/wallet/index.ts`**
   - Re-exports all types, interfaces (`ActiveWalletState`, `SavedWallet`, `WalletCredentials`, `WalletCoreAPI`), helper functions (`encryptMnemonic`, `decryptMnemonic`), and exports standard `walletCoreAPI` singleton conforming to `WalletCoreAPI` contract in `SCOPE.md`.

7. **`src/lib/wallet/__tests__/`**
   - `tier1-wallet-core.test.ts`: Seed generation (12/24 words), validation, normalization, key derivation, workchain 0, subwallet ID.
   - `tier1-crypto-storage.test.ts`: Web Crypto AES-GCM, PBKDF2-SHA512, password security, localStorage wallet CRUD, active wallet management.
   - `tier1-signing-rpc.test.ts`: Action cell packing, Ed25519 signing, external message stateInit inclusion, RPC client endpoints and fallback logic.
   - `tier1-payload-builders.test.ts`: 19 payload builder serialization and opcode integrity tests.

---

## 2. Logic Chain

1. **Spec Alignment & Completeness**: All 6 core modules match the required interface contracts, opcodes, workchain standards, subwallet IDs, and cryptographic parameters defined in `SCOPE.md` and `PROJECT.md`.
2. **Implementation Veracity**: Standard cryptographic primitives (`@ton/crypto`, Web Crypto API `subtle`) and TON SDK primitives (`@ton/core`, `@ton/ton`) are used directly without facade or mock implementations in production source code.
3. **Type Safety Verification**: Executed `nub run typecheck` (`tsc --noEmit`), which completed cleanly with exit code 0.
4. **Test Suite Verification**: Executed `bun test src/lib/wallet`, resulting in 86 passed tests across 4 test suites with 0 failures.

---

## 3. Caveats

- **Lint script issue**: `npm run lint` fails due to a pre-existing environment conflict between `typescript-eslint@8.66.0` and `typescript@7.0.2`. `nub run typecheck` (`tsc --noEmit`) and `bun test src/lib/wallet` pass 100%.

---

## 4. Conclusion

Milestone 1 (Wallet Core & Cryptography Infrastructure) is fully implemented, verified, type-safe, and ready for use in Milestone 2 (`WalletContext` & UI state management) and Milestone 3 (Direct Transaction Engine).

---

## 5. Verification Method

To independently verify this work:

1. **Typecheck**:
   ```bash
   nub run typecheck
   ```
   *Expected output*: `tsc --noEmit` exits with code 0 and no errors.

2. **Unit Tests**:
   ```bash
   bun test src/lib/wallet
   ```
   *Expected output*: 86 tests pass across 4 test files (`tier1-wallet-core.test.ts`, `tier1-crypto-storage.test.ts`, `tier1-signing-rpc.test.ts`, `tier1-payload-builders.test.ts`).
