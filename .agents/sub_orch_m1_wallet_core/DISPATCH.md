# DISPATCH — Sub-orchestrator M1: Wallet Core & Crypto Infrastructure

## 2026-08-11T18:41:00Z

<USER_REQUEST>
You are the Sub-orchestrator for Milestone 1 (Wallet Core & Crypto Infrastructure).
Your working directory is /home/zeta/jetton/.agents/sub_orch_m1_wallet_core.
Scope Document: /home/zeta/jetton/PROJECT.md
Original Request: /home/zeta/jetton/.agents/ORIGINAL_REQUEST.md
Reference Report: /home/zeta/jetton/.agents/explorer_demowallet/handoff.md

Task:
Lead and execute Milestone 1: Implement the Wallet Core & Cryptography Infrastructure in src/lib/wallet/:
1. `src/lib/wallet/wallet-v5-r1.ts`: WalletV5R1 contract implementation & adapter (workchain 0, default subwallet ID 2147483409), transfer cell payload builder (`0x7369676e`), Ed25519 signature wrapping, and external message formatting.
2. `src/lib/wallet/mnemonic.ts`: 12 and 24 word mnemonic seed generation, validation, and keypair derivation using `@ton/crypto` (`mnemonicToWalletKey`) and `@scure/bip39`.
3. `src/lib/wallet/crypto.ts`: Web Crypto AES-GCM encryption/decryption (`SimpleEncryption`) with PBKDF2-SHA512 key derivation (100k iterations, 16B salt, 12B IV), and password hash verification (`SHA-256(password + 'wallet_salt')`).
4. `src/lib/wallet/storage.ts`: `localStorage` encrypted credential persistence schema (`brotherhood_wallet_store`, schema v2: `SavedWallet` array with base64 `encryptedMnemonic`).
5. `src/lib/wallet/rpc-client.ts`: Direct BOC submission via `TonClient` (`sendBoc` / `/api/v3/message`), seqno fetching, and balance queries.
6. `src/lib/wallet/index.ts`: Export clear unified API for M2 and M3.

Procedure & Instructions:
- Create SCOPE.md in your working directory (/home/zeta/jetton/.agents/sub_orch_m1_wallet_core/SCOPE.md).
- Dispatch Worker(s) (teamwork_preview_worker) to build the files in src/lib/wallet/.
  Include MANDATORY INTEGRITY WARNING in worker dispatches:
  "DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work."
- Dispatch 2 Reviewer(s) (teamwork_preview_reviewer) and 2 Challenger(s) (teamwork_preview_challenger) to verify code quality, type correctness, and cryptographically sound behavior.
- Dispatch 1 Forensic Auditor (teamwork_preview_auditor) for integrity verification.
- Enforce Gate (Build + Tests pass, all Reviewers APPROVE, Challengers confirm, Auditor CLEAN).
- Ensure `nub run typecheck` passes cleanly for M1 code.
- Write your handoff report to /home/zeta/jetton/.agents/sub_orch_m1_wallet_core/handoff.md upon gate pass.
- Send a completion message back to parent orchestrator.
</USER_REQUEST>
