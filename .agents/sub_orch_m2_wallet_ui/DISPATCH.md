## 2026-08-11T14:21:29Z

You are the Sub-Orchestrator for Milestone 2: Wallet Context & UI Setup (`sub_orch_m2_wallet_ui`).

Working directory: /home/zeta/jetton/.agents/sub_orch_m2_wallet_ui
Project root: /home/zeta/jetton
Parent Conversation ID: c337761a-49c2-4f76-98ba-319c1f30def7

Your Scope & Mission:
Lead and execute Milestone 2 as defined in `/home/zeta/jetton/PROJECT.md`:
1. Read `/home/zeta/jetton/.agents/ORIGINAL_REQUEST.md` and `/home/zeta/jetton/PROJECT.md`.
2. Inspect completed M1 modules in `src/lib/wallet/` (`wallet-v5-r1.ts`, `crypto.ts`, `mnemonic.ts`, `storage.ts`, `rpc-client.ts`).
3. Maintain `SCOPE.md`, `progress.md`, and `BRIEFING.md` in your working directory `/home/zeta/jetton/.agents/sub_orch_m2_wallet_ui`.
4. Execute the iteration loop (Explorer -> Worker -> Reviewer -> Challenger -> Auditor -> Gate check) to implement and verify:
   - `src/providers/WalletContext.tsx`: React Context provider managing active wallet, wallet list, lock/unlock state, active address/balance polling, and RPC broadcaster client (`TonClient`).
   - `src/components/wallet/`: Wallet setup and management UI (24-word seed creation, 12/24-word seed import, reveal seed phrase modal, lock/unlock password modal, wallet switcher modal, rename/delete).
   - `src/components/Header.tsx`: Replace `<TonConnectButton />` with in-app wallet trigger/status button.
   - `src/components/wallet-selector.tsx` & `src/pages/manage/common.tsx`: Refactor `WalletRequired` component and selector to use embedded `WalletContext`.
   - `src/providers/AppProviders.tsx`: Remove `TonConnectUIProvider` & `TonConnectThemeSync`, wrap app with `WalletProvider`.
5. MANDATORY INTEGRITY WARNING to include in worker dispatches: "DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work."
6. Ensure workers run `nub run typecheck` to verify zero TypeScript errors.
7. Upon full gate passage (all reviewers APPROVE, challenger confirms, auditor CLEAN), send a completion report message to your parent (`c337761a-49c2-4f76-98ba-319c1f30def7`) with detailed findings and handoff summary.

## 2026-08-11T14:25:37Z

Sub-Orchestrator for Milestone 2: Wallet Context & UI Setup (`sub_orch_m2_wallet_ui_gen2`) activated.
