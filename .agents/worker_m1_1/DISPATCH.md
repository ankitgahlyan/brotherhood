## 2026-08-11T13:13:36Z
You are worker_m1_1, assigned to implement Milestone 1: Wallet Core & Cryptography Infrastructure for the project.

Working directory: /home/zeta/jetton/.agents/worker_m1_1
Target files to create in /home/zeta/jetton/src/lib/wallet/:
1. `src/lib/wallet/wallet-v5-r1.ts`: WalletV5R1 contract & adapter (workchain 0, default subwallet ID 2147483409), transfer cell payload builder (`0x7369676e`), Ed25519 signature wrapping, external message formatting, and seqno/walletId getters.
2. `src/lib/wallet/mnemonic.ts`: 12 and 24 word mnemonic seed generation, validation (`validateMnemonic`), and keypair derivation using `@ton/crypto` (`mnemonicToWalletKey`) and `@scure/bip39`.
3. `src/lib/wallet/crypto.ts`: Web Crypto AES-GCM encryption/decryption (`SimpleEncryption`) with PBKDF2-SHA512 key derivation (100k iterations, 16B salt, 12B IV), and password hash verification (`SHA-256(password + 'wallet_salt')`).
4. `src/lib/wallet/storage.ts`: `localStorage` encrypted credential persistence schema (`brotherhood_wallet_store`, schema v2: `SavedWallet` array with base64 `encryptedMnemonic`), helper functions to load/save/remove wallets.
5. `src/lib/wallet/rpc-client.ts`: Direct BOC submission via `TonClient` (`sendBoc` / `/api/v3/message`), seqno fetching (`getSeqno`), balance queries (`getBalance`), and Toncenter / TonClient configuration using `TONCENTER_MAINNET_API_KEY` / `TONCENTER_TESTNET_API_KEY`.
6. `src/lib/wallet/index.ts`: Export clear unified API for M2 (WalletContext) and M3 (Direct Transaction Engine).

Key Reference Documents & Implementation Sources:
- `/home/zeta/jetton/PROJECT.md`
- `/home/zeta/jetton/.agents/sub_orch_m1_wallet_core/SCOPE.md`
- `/home/zeta/jetton/.agents/ORIGINAL_REQUEST.md`
- `/home/zeta/jetton/.agents/explorer_demowallet/handoff.md`
- Reference code in `/home/zeta/kit/`:
  - `/home/zeta/kit/packages/walletkit/src/contracts/w5/WalletV5R1.ts`
  - `/home/zeta/kit/packages/walletkit/src/contracts/w5/WalletV5R1Adapter.ts`
  - `/home/zeta/kit/packages/walletkit/src/utils/mnemonic.mts`
  - `/home/zeta/kit/demo/wallet-core/src/utils/crypto.ts`
  - `/home/zeta/kit/demo/wallet-core/src/store/createWalletStore.ts`
  - `/home/zeta/kit/packages/walletkit/src/clients/toncenter/ApiClientToncenter.ts`

Verification requirement:
Run `nub run typecheck` (or `npx tsc --noEmit`) to verify that all code in `src/lib/wallet/` compiles cleanly with zero type errors.
