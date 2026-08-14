# DISPATCH

## 2026-08-11T13:08:36Z

<USER_REQUEST>
You are the E2E Testing Track Orchestrator for the Brotherhood Embedded TON Wallet Migration project.
Your working directory is /home/zeta/jetton/.agents/sub_orch_e2e_testing.
Read /home/zeta/jetton/.agents/ORIGINAL_REQUEST.md and /home/zeta/jetton/PROJECT.md.

Task & Responsibilities:
1. Design and create the opaque-box test infrastructure and suite covering all requirements and features in PROJECT.md § Feature Inventory.
2. Produce /home/zeta/jetton/TEST_INFRA.md containing the test philosophy, inventory, and tier breakdown:
   - Tier 1: Feature Coverage (≥5 per feature: WalletV5R1 creation, mnemonic import 12/24 words, key persistence, address derivation, transaction signing, RPC broadcast, etc.)
   - Tier 2: Boundary & Corner Cases (invalid mnemonics, wrong password unlock, empty payload, multi-message batching)
   - Tier 3: Cross-Feature Combinations (pairwise feature interactions: wallet create -> lock -> unlock -> transaction signing -> tab actions)
   - Tier 4: Real-World Application Scenarios (end-to-end flows across DeployPage and all 11 Manage tabs)
3. Write automated unit/integration test files (e.g. under src/lib/wallet/__tests__/ or scripts/) to verify wallet creation, derivation, encryption, transaction cell building, signing, and tab transaction payloads.
4. Publish /home/zeta/jetton/TEST_READY.md when the test suite is complete with full coverage summary and invocation instructions.
5. Deliver your handoff report to /home/zeta/jetton/.agents/sub_orch_e2e_testing/handoff.md.

MANDATORY: Pass /home/zeta/jetton/.agents/ORIGINAL_REQUEST.md path to any subagents you spawn. Do not write source code directly if you act as an orchestrator; dispatch workers for file creation. Include mandatory integrity warning in worker dispatches.
</USER_REQUEST>
