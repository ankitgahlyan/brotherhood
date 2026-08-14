## 2026-08-11T13:21:04Z

<USER_REQUEST>
You are worker_e2e_tier1 (teamwork_preview_test_writer) for the E2E Testing Track.
Working directory: /home/zeta/jetton/.agents/worker_e2e_tier1

Task:
Read /home/zeta/jetton/.agents/ORIGINAL_REQUEST.md, /home/zeta/jetton/PROJECT.md, and /home/zeta/jetton/.agents/explorer_e2e_1/analysis.md.

Responsibilities:
1. Create /home/zeta/jetton/TEST_INFRA.md:
   - Full test philosophy (opaque-box, requirement-driven, zero coupling to implementation internals).
   - Complete feature inventory mapping for features 1-14 from PROJECT.md.
   - Test architecture and runner execution commands (`bun test`, `bunx playwright test`).
   - Tier breakdown (Tier 1: Feature Coverage ≥5/feature, Tier 2: Boundary & Corner Cases ≥5/feature, Tier 3: Pairwise Cross-Feature Combinations, Tier 4: Real-World Scenarios).
   - Coverage thresholds.

2. Create automated Tier 1 unit & integration test files under `src/lib/wallet/__tests__/` (e.g. `tier1-wallet-core.test.ts`, `tier1-payload-builders.test.ts`, `tier1-signing-rpc.test.ts`):
   - Test WalletV5R1 creation, seed generation (24 words), workchain 0, subwallet ID `2147483409`, key derivation. Include ≥5 distinct test cases.
   - Test mnemonic import for both 12-word and 24-word phrases, validation, keypair derivation. Include ≥5 distinct test cases.
   - Test AES-GCM encryption/decryption (`crypto.ts`), PBKDF2 100k iterations, salt/IV handling, session lock/unlock. Include ≥5 distinct test cases.
   - Test localStorage schema persistence and key storage (`storage.ts`). Include ≥5 distinct test cases.
   - Test transaction action cell building, Ed25519 secret key signing, external message cell creation (`wallet-v5-r1.ts`). Include ≥5 distinct test cases.
   - Test RPC broadcasting schema (`rpc-client.ts`). Include ≥5 distinct test cases.
   - Test all 19 payload builders in `src/lib/deploy.ts` (Mint, Transfer, Burn, Admin, Allowance, Credit, Destroy, Invite, IssueToken, Vote, Deploy). Ensure each builder generates expected opcode and cell structures. Include ≥5 distinct test cases per feature category.

3. Run `bun test` to verify all Tier 1 test cases execute and pass cleanly.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Write your handoff report to `/home/zeta/jetton/.agents/worker_e2e_tier1/handoff.md` and communicate back when complete.
</USER_REQUEST>
