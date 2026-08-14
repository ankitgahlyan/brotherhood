## 2026-08-11T14:20:19Z
You are the replacement Sub-orchestrator for Milestone 1 (Wallet Core & Crypto Infrastructure).
Your working directory is /home/zeta/jetton/.agents/sub_orch_m1_wallet_core_gen2.
Scope Document: /home/zeta/jetton/PROJECT.md
Original Request: /home/zeta/jetton/.agents/ORIGINAL_REQUEST.md
Predecessor Progress: /home/zeta/jetton/.agents/sub_orch_m1_wallet_core/progress.md

Context & Status:
Predecessor M1 sub-orchestrator stopped due to a network glitch after generating the core wallet implementation files under `src/lib/wallet/` (`crypto.ts`, `index.ts`, `mnemonic.ts`, `rpc-client.ts`, `storage.ts`, `wallet-v5-r1.ts`, and `__tests__/`).

Task & Gate Verification:
1. Create SCOPE.md and BRIEFING.md in your working directory.
2. Review the generated files under `src/lib/wallet/`. If any fixes or type errors need resolution, dispatch a Worker (`teamwork_preview_worker`) with the MANDATORY INTEGRITY WARNING:
   "DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work."
3. Dispatch 2 Reviewer(s) (`teamwork_preview_reviewer`) and 2 Challenger(s) (`teamwork_preview_challenger`) to verify code quality, type correctness (`nub run typecheck`), and cryptographically sound WalletV5R1 behavior.
4. Dispatch 1 Forensic Auditor (`teamwork_preview_auditor`) for integrity verification.
5. Enforce Gate (Build + Tests pass, all Reviewers APPROVE, Challengers confirm, Auditor CLEAN).
6. Write your handoff report to /home/zeta/jetton/.agents/sub_orch_m1_wallet_core_gen2/handoff.md upon gate pass.
7. Send a completion message back to parent orchestrator.
