# DISPATCH — Worker E2E Tiers 2, 3, 4 & TEST_READY.md

## Task
You are worker_e2e_tier234 for the E2E Testing Track.
Working directory: /home/zeta/jetton/.agents/worker_e2e_tier234

Read /home/zeta/jetton/.agents/ORIGINAL_REQUEST.md, /home/zeta/jetton/PROJECT.md, /home/zeta/jetton/TEST_INFRA.md, and existing Tier 1 test files in `src/lib/wallet/__tests__/`.

Responsibilities:
1. Create Tier 2 test file: `src/lib/wallet/__tests__/tier2-boundary-corner.test.ts`
   - Test invalid mnemonics (11, 13, 25 words, invalid vocabulary words, mixed whitespace, non-lowercase).
   - Test AES-GCM crypto decryption with wrong password, corrupted base64 payloads, empty passwords, truncated IV/salts.
   - Test empty payload transactions, 0 nanotons transfers, maximum nano-TON values, out-of-range sequence numbers.
   - Test multi-message batching (up to 255 messages in WalletV5R1 transfer actions).
   - Include ≥5 test cases per feature category.

2. Create Tier 3 test file: `src/lib/wallet/__tests__/tier3-cross-feature.test.ts`
   - Test complete end-to-end lifecycle flow: Wallet creation -> AES-GCM encryption -> localStorage persistence -> Session unlock -> WalletV5R1 transfer cell building -> Ed25519 signing -> External message BOC wrapping -> RPC broadcast payload formatting.
   - Test pairwise feature interactions: wallet create -> lock -> unlock -> transaction signing -> tab actions.
   - Test active wallet switching between multiple saved wallets.

3. Create Tier 4 test file & Playwright E2E spec: `src/lib/wallet/__tests__/tier4-realworld.test.ts` and `e2e/wallet-ui.spec.ts`
   - Test end-to-end user application workflows across DeployPage and all 11 Manage tabs (Admin, Allowance, Burn, Credit, Destroy, Invite, IssueToken, Mint, Transfer, Vote, Deploy).
   - Verify zero dependency on TonConnect modal or API calls.

4. Create and publish `/home/zeta/jetton/TEST_READY.md`:
   - Test Runner invocation instructions (`bun test`, `nub run typecheck`, `nub run build`, `nub run smoke`, `bunx playwright test`).
   - Expected results (all tests pass with exit code 0).
   - Coverage Summary table across Tiers 1-4.
   - Feature Checklist table (features 1-14 mapped across Tiers 1-4).

5. Execute `bun test` to verify all test suites execute and pass cleanly.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
