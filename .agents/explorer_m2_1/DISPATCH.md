## 2026-08-11T19:51:59Z
You are Explorer 1 for Milestone 2 (`sub_orch_m2_wallet_ui`).
Your working directory is `/home/zeta/jetton/.agents/explorer_m2_1`.

MANDATORY READS:
1. Read `/home/zeta/jetton/.agents/ORIGINAL_REQUEST.md`
2. Read `/home/zeta/jetton/PROJECT.md`
3. Read `/home/zeta/jetton/.agents/sub_orch_m2_wallet_ui/SCOPE.md`

YOUR TASK:
Investigate M1 core wallet modules in `src/lib/wallet/`:
- `wallet-v5-r1.ts`
- `crypto.ts`
- `mnemonic.ts`
- `storage.ts`
- `rpc-client.ts`

Analyze existing React providers in `src/providers/AppProviders.tsx`.
Design the exact specification and implementation plan for `src/providers/WalletContext.tsx`.
`WalletContext` MUST manage:
- Active wallet state (address, public key, encrypted wallet data, wallet name)
- Wallet list (multiple wallets stored securely via storage.ts)
- Lock/unlock password state in-memory (encrypting/decrypting sensitive wallet data)
- Active address & balance polling (using rpc-client.ts `TonClient`)
- RPC broadcaster client (`TonClient`) for sending messages/transactions
- Helper methods: create wallet, import wallet, unlock wallet, lock wallet, select active wallet, rename wallet, delete wallet, sign/send transfer.

Write your complete analysis and recommendations to `/home/zeta/jetton/.agents/explorer_m2_1/analysis.md` and handoff report to `/home/zeta/jetton/.agents/explorer_m2_1/handoff.md`.
Do NOT write or modify source code files directly.
Send a message when finished referencing your handoff file.
