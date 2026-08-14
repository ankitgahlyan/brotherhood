# BRIEFING — 2026-08-11T19:58:00Z

## Mission
Investigate and design replacement of TonConnect with embedded `WalletContext` across AppProviders, Header, wallet-selector, and WalletRequired components.

## 🔒 My Identity
- Archetype: Teamwork Explorer
- Roles: Read-only investigator & analyst
- Working directory: /home/zeta/jetton/.agents/explorer_m2_3_gen2
- Original parent: 758b6f14-d290-47d4-82c9-c27a0fa5b79e
- Milestone: M2 - Embedded Wallet UI Integration

## 🔒 Key Constraints
- Read-only investigation — do NOT implement code outside .agents/explorer_m2_3_gen2
- Zero broken imports or references to `@tonconnect/ui-react` in target integration components

## Current Parent
- Conversation ID: 758b6f14-d290-47d4-82c9-c27a0fa5b79e
- Updated: 2026-08-11T19:58:00Z

## Investigation State
- **Explored paths**: `src/providers/AppProviders.tsx`, `src/components/Header.tsx`, `src/components/wallet-selector.tsx`, `src/pages/manage/common.tsx`, `src/lib/wallet/index.ts`, `.agents/explorer_tonconnect/handoff.md`
- **Key findings**: Complete mapping of TonConnect removal and `WalletContext` integration for all 4 target files. Zero broken imports verified.
- **Unexplored areas**: None for M2 integration scope.

## Key Decisions Made
- `AppProviders`: `WalletProvider` placed inside `QueryClientProvider`.
- `Header`: In-app status button handling 3 dynamic states (Disconnected / Locked / Connected & Unlocked).
- `wallet-selector`: Refactored from remote TonConnect modal trigger to embedded local wallet list switcher & modal opener.
- `common.tsx`: `WalletRequired` updated to dynamically present setup vs unlock prompts based on `activeWallet` and `isUnlocked`.

## Artifact Index
- /home/zeta/jetton/.agents/explorer_m2_3_gen2/DISPATCH.md — Dispatch log
- /home/zeta/jetton/.agents/explorer_m2_3_gen2/BRIEFING.md — Working memory briefing
- /home/zeta/jetton/.agents/explorer_m2_3_gen2/progress.md — Heartbeat progress log
- /home/zeta/jetton/.agents/explorer_m2_3_gen2/handoff.md — 5-component handoff report
