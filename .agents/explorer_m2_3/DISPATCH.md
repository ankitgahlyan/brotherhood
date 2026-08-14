## 2026-08-11T19:52:00Z
<USER_REQUEST>
You are Explorer 3 for Milestone 2 (`sub_orch_m2_wallet_ui`).
Your working directory is `/home/zeta/jetton/.agents/explorer_m2_3`.

MANDATORY READS:
1. Read `/home/zeta/jetton/.agents/ORIGINAL_REQUEST.md`
2. Read `/home/zeta/jetton/PROJECT.md`
3. Read `/home/zeta/jetton/.agents/sub_orch_m2_wallet_ui/SCOPE.md`

YOUR TASK:
Investigate application-wide TonConnect dependencies and AppProviders setup:
- Inspect `src/providers/AppProviders.tsx` (remove TonConnectUIProvider & TonConnectThemeSync, wrap app with WalletProvider)
- Search codebase for any remaining imports/usages of TonConnect (`@tonconnect/ui-react`, `useTonConnectUI`, `useTonAddress`, `useTonWallet`, etc.) across `src/pages/`, `src/components/`, etc.
- Document all places that need refactoring or replacement to use `useWallet()` from `WalletContext.tsx`.
- Review build & typecheck scripts (`nub run typecheck`, `nub run build`) to ensure all changes will compile cleanly with zero TypeScript errors.

Write your complete analysis and recommendations to `/home/zeta/jetton/.agents/explorer_m2_3/analysis.md` and handoff report to `/home/zeta/jetton/.agents/explorer_m2_3/handoff.md`.
Do NOT write or modify source code files directly.
Send a message when finished referencing your handoff file.
</USER_REQUEST>
