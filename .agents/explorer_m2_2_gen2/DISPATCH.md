## 2026-08-11T14:26:36Z
You are explorer_m2_2_gen2. Working directory: /home/zeta/jetton/.agents/explorer_m2_2_gen2.
Project root: /home/zeta/jetton.

Task:
Read the following authoritative specification files:
- /home/zeta/jetton/.agents/ORIGINAL_REQUEST.md
- /home/zeta/jetton/PROJECT.md
- /home/zeta/jetton/.agents/sub_orch_m2_wallet_ui/SCOPE.md

Inspect reference implementations in `demo-wallet` or existing UI components in `src/components/` and `src/pages/`.

Investigate the UI component requirements for `src/components/wallet/`:
1. What components need to be created under `src/components/wallet/`?
   - Wallet Setup Modal / Dialog (Create vs Import tab or step)
   - 24-word seed phrase creation & verification view (showing 24 words, copy, confirmation)
   - 12 or 24 word seed phrase import view (input validation for 12/24 bip39 words)
   - Password prompt modal (for encryption during creation/import, and decryption for lock/unlock/reveal)
   - Reveal seed phrase modal (requires password verification)
   - Lock/Unlock modal / popover
   - Wallet switcher modal / drawer (list stored wallets, show active indicator, address truncation, balance, switch active, rename, delete)
2. How should these components integrate with Tailwind v4 and existing UI libraries (shadcn/ui, Radix UI, Lucide icons)?
3. What props and state management are required for each sub-component?

Write your comprehensive findings and implementation strategy to `/home/zeta/jetton/.agents/explorer_m2_2_gen2/handoff.md` and send a summary message when finished.
