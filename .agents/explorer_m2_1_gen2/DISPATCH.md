## 2026-08-11T14:26:36Z
You are explorer_m2_1_gen2. Working directory: /home/zeta/jetton/.agents/explorer_m2_1_gen2.
Project root: /home/zeta/jetton.

Task:
Read the following authoritative specification files:
- /home/zeta/jetton/.agents/ORIGINAL_REQUEST.md
- /home/zeta/jetton/PROJECT.md
- /home/zeta/jetton/.agents/sub_orch_m2_wallet_ui/SCOPE.md

Inspect the completed M1 core wallet modules in `src/lib/wallet/`:
- `src/lib/wallet/wallet-v5-r1.ts`
- `src/lib/wallet/crypto.ts`
- `src/lib/wallet/mnemonic.ts`
- `src/lib/wallet/storage.ts`
- `src/lib/wallet/rpc-client.ts`

Investigate the implementation specifications for `src/providers/WalletContext.tsx`:
1. What state needs to be managed in `WalletContext` (active wallet, wallet list, secret key / decrypted credentials when unlocked, isUnlocked flag, balance in nanotons, active network, TonClient instance)?
2. What context API methods need to be exposed (`createWallet(name, password)`, `importWallet(name, mnemonic, password)`, `unlockWallet(password)`, `lockWallet()`, `switchWallet(id)`, `renameWallet(id, name)`, `deleteWallet(id)`, `revealMnemonic(password)`, `refreshBalance()`)?
3. How should RPC client (`TonClient`) be instantiated, balance polling be managed (interval polling on active wallet address), and errors handled?
4. What TypeScript interfaces/types are needed?
5. How should `WalletContext` read/write stored wallets via `src/lib/wallet/storage.ts` and handle session unlock persistence/lock timeout?

Write your comprehensive findings and implementation strategy to `/home/zeta/jetton/.agents/explorer_m2_1_gen2/handoff.md` and send a summary message when finished.
