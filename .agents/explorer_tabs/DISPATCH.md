## 2026-08-11T18:19:04Z

<USER_REQUEST>
You are teamwork_preview_explorer for Contract Interactions & Tabs analysis.
Your working directory is /home/zeta/jetton/.agents/explorer_tabs.
Read /home/zeta/jetton/.agents/ORIGINAL_REQUEST.md first.

Task:
Audit all 11 Manage tabs (AdminTab, AllowanceTab, BurnTab, CreditTab, DestroyTab, InviteTab, IssueTokenTab, MintTab, TransferTab, VoteTab, ManagePage.tsx) and DeployPage.tsx under /home/zeta/jetton/src/.

Deliverables:
1. Map every single contract action / transaction trigger across all 11 tabs and DeployPage.
2. Document the exact parameters, payload format, target smart contract address, value attached, and message structure for each action.
3. Detail how each tab currently gets the wallet connection / sender / TonConnect UI and how transaction submission should be refactored to use the embedded WalletV5R1 state & RPC broadcaster.
4. Write your comprehensive analysis and handoff report to /home/zeta/jetton/.agents/explorer_tabs/handoff.md.
5. Send a completion message back with a concise summary and path to your handoff.md.
</USER_REQUEST>
