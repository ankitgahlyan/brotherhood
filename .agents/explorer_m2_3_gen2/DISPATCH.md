## 2026-08-11T19:56:40Z

You are explorer_m2_3_gen2. Working directory: /home/zeta/jetton/.agents/explorer_m2_3_gen2.
Project root: /home/zeta/jetton.

Task:
Read the following authoritative specification files:
- /home/zeta/jetton/.agents/ORIGINAL_REQUEST.md
- /home/zeta/jetton/PROJECT.md
- /home/zeta/jetton/.agents/sub_orch_m2_wallet_ui/SCOPE.md

Inspect existing integration files:
- `src/components/Header.tsx`
- `src/components/wallet-selector.tsx`
- `src/pages/manage/common.tsx` (`WalletRequired`)
- `src/providers/AppProviders.tsx`

Investigate the exact changes needed to replace TonConnect and integrate `WalletContext`:
1. In `src/providers/AppProviders.tsx`: How to remove `TonConnectUIProvider` & `TonConnectThemeSync` and wrap the app tree with `WalletProvider`?
2. In `src/components/Header.tsx`: How to replace `<TonConnectButton />` with an in-app wallet status button (showing address/balance when connected/unlocked, lock status, and opening the wallet modal)?
3. In `src/components/wallet-selector.tsx` & `src/pages/manage/common.tsx`: How to refactor `WalletRequired` and wallet selector to use embedded `WalletContext` instead of TonConnect hooks (`useTonAddress`, `useTonConnectUI`, `useTonConnectModal`)?
4. Ensure zero broken imports or references to `@tonconnect/ui-react` in these components.

Write your comprehensive findings and implementation strategy to `/home/zeta/jetton/.agents/explorer_m2_3_gen2/handoff.md` and send a summary message when finished.
