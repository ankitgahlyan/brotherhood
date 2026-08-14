## 2026-08-11T19:51:30Z

<USER_REQUEST>
You are worker_m1_fix working on Milestone 1 (Wallet Core & Crypto Infrastructure).
Your working directory is /home/zeta/jetton/.agents/worker_m1_fix.

Scope & Context:
- Original Request: /home/zeta/jetton/.agents/ORIGINAL_REQUEST.md
- Project Scope: /home/zeta/jetton/PROJECT.md
- Predecessor progress: /home/zeta/jetton/.agents/sub_orch_m1_wallet_core/progress.md
- Target files: `src/lib/wallet/` (`crypto.ts`, `mnemonic.ts`, `rpc-client.ts`, `storage.ts`, `wallet-v5-r1.ts`, `index.ts`, `__tests__/`)

Objective:
1. Run `nub run typecheck` and test commands (e.g. `bun test src/lib/wallet/` or `npx vitest` / `bun test`) to verify if there are any type errors, syntax issues, or test failures in `src/lib/wallet/`.
2. If any type errors, import bugs, or test failures exist in `src/lib/wallet/`, fix them cleanly.
3. Make sure `src/lib/wallet/` has complete, working, cryptographically sound implementation for Wallet V5R1, mnemonic seed derivation, ED25519 signing, RPC client, local secure storage, and passing unit tests.
4. Document the exact build/test output and your fixes in your handoff report at `/home/zeta/jetton/.agents/worker_m1_fix/handoff.md`.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work.
</USER_REQUEST>
