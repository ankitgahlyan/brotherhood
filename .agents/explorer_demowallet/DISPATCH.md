## 2026-08-11T18:19:04Z
<USER_REQUEST>
You are teamwork_preview_explorer for Demo Wallet & WalletV5R1 reference analysis.
Your working directory is /home/zeta/jetton/.agents/explorer_demowallet.
Read /home/zeta/jetton/.agents/ORIGINAL_REQUEST.md first.

Task:
Investigate the repository and system for demo-wallet reference implementations, @demo/wallet-core, or related wallet modules, as well as @ton/crypto, @ton/ton, and @ton/core utilities.

Deliverables:
1. Locate demo-wallet / @demo/wallet-core reference code, packages, or submodules in the workspace or system.
2. Analyze how WalletV5R1 contract instances (workchain 0) are initialized, derived from 12 or 24 word mnemonics, and how public key/address calculation works.
3. Analyze the AES-GCM client key persistence / session unlock mechanism (encryption, decryption, localStorage schemas).
4. Analyze how in-app wallet UI components (Create Wallet, Import Mnemonic, View Seed, Switch Active Wallet, Unlock Wallet) are structured and integrated.
5. Analyze transaction payload construction, WalletV5R1 secret key signing, and BOC submission via TonClient / Toncenter RPC.
6. Write your comprehensive analysis and handoff report to /home/zeta/jetton/.agents/explorer_demowallet/handoff.md.
7. Send a completion message back with a concise summary and path to your handoff.md.
</USER_REQUEST>
