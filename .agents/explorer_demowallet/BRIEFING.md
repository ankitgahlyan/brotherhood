# BRIEFING — 2026-08-11T18:19:04Z

## Mission
Investigate demo-wallet reference implementations, @demo/wallet-core, WalletV5R1 contract initialization, AES-GCM key persistence, UI components, and transaction payload signing/submission.

## 🔒 My Identity
- Archetype: Teamwork explorer
- Roles: Demo Wallet & WalletV5R1 reference analysis
- Working directory: /home/zeta/jetton/.agents/explorer_demowallet
- Original parent: d764eebc-7e13-4678-b47a-3c0dc325d0ef
- Milestone: Explorer Analysis

## 🔒 Key Constraints
- Read-only investigation — do NOT implement code in project source directories.
- Write analysis report and handoff to /home/zeta/jetton/.agents/explorer_demowallet/handoff.md.

## Current Parent
- Conversation ID: d764eebc-7e13-4678-b47a-3c0dc325d0ef
- Updated: 2026-08-11T18:33:45Z

## Investigation State
- **Explored paths**:
  - `/home/zeta/kit/apps/demo-wallet`
  - `/home/zeta/kit/demo/wallet-core`
  - `/home/zeta/kit/packages/walletkit`
- **Key findings**:
  - Located demo-wallet and wallet-core in `/home/zeta/kit`.
  - WalletV5R1 initial configuration: subwalletId 2147483409, workchain 0, seqno 0, signatureAllowed true.
  - Key derivation handles 12 and 24 word TON mnemonics (`mnemonicToWalletKey`) and BIP39 mnemonics (`bip39ToPrivateKey` + `[44, 607, 0]`).
  - AES-GCM key persistence via Web Crypto API with PBKDF2-SHA512 (100,000 iterations, 16B salt, 12B IV) stored in `localStorage` under `demo-wallet-store` (v2).
  - UI components for Create, Import, Unlock, Switch, and View Seed phrases fully documented.
  - Direct transaction signing uses opcode `0x7369676e` (`auth_signed`), packs actions list, signs Ed25519 hash, wraps external BOC, and submits via `/api/v3/message`.
- **Unexplored areas**: None.

## Key Decisions Made
- Completed read-only investigation and compiled comprehensive handoff report to `handoff.md`.

## Artifact Index
- /home/zeta/jetton/.agents/explorer_demowallet/DISPATCH.md — Dispatch instructions
- /home/zeta/jetton/.agents/explorer_demowallet/BRIEFING.md — Working memory index
- /home/zeta/jetton/.agents/explorer_demowallet/progress.md — Progress log
- /home/zeta/jetton/.agents/explorer_demowallet/handoff.md — Final analysis and handoff report
