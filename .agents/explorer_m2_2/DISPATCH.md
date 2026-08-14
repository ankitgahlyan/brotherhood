## 2026-08-11T19:52:00Z
You are Explorer 2 for Milestone 2 (`sub_orch_m2_wallet_ui`).
Your working directory is `/home/zeta/jetton/.agents/explorer_m2_2`.

MANDATORY READS:
1. Read `/home/zeta/jetton/.agents/ORIGINAL_REQUEST.md`
2. Read `/home/zeta/jetton/PROJECT.md`
3. Read `/home/zeta/jetton/.agents/sub_orch_m2_wallet_ui/SCOPE.md`

YOUR TASK:
Investigate UI components and existing wallet UI usage across the repo:
- `src/components/Header.tsx` (currently using `<TonConnectButton />`)
- `src/components/wallet-selector.tsx`
- `src/pages/manage/common.tsx` (WalletRequired component)
- Existing shadcn / UI components (dialogs, buttons, inputs, dropdowns, icons) in `src/components/ui/` or `src/components/`

Design the exact specification and layout for `src/components/wallet/`:
1. 24-word seed creation view/modal (with copy/verify seed steps)
2. 12/24-word seed import modal
3. Reveal seed phrase modal (requires entering wallet password)
4. Lock/unlock password modal
5. Wallet switcher modal/dropdown (lists wallets, balance, active indicator, switch button, rename/delete buttons)
6. Trigger/status button to replace `<TonConnectButton />` in `src/components/Header.tsx` (shows active wallet address/name/balance when unlocked, or "Connect/Unlock Wallet" trigger when locked/none)
7. Refactored `WalletRequired` and wallet selector in `src/components/wallet-selector.tsx` and `src/pages/manage/common.tsx` to integrate with embedded `WalletContext`.

Write your complete analysis and recommendations to `/home/zeta/jetton/.agents/explorer_m2_3/analysis.md` and handoff report to `/home/zeta/jetton/.agents/explorer_m2_2/handoff.md`.
Do NOT write or modify source code files directly.
Send a message when finished referencing your handoff file.
