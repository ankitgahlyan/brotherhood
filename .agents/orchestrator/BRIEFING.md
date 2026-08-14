# BRIEFING — 2026-08-11T12:47:00Z

## Mission
Lead and execute the replacement of TonConnect across the application with an embedded in-app TON wallet management and transaction signing system supporting WalletV5R1 standard adapted from demo-wallet.

## 🔒 My Identity
- Archetype: project_orchestrator
- Roles: orchestrator, user_liaison, human_reporter, successor
- Working directory: /home/zeta/jetton/.agents/orchestrator
- Original parent: parent
- Original parent conversation ID: d488bd68-ccf7-4e4f-b5ef-6e807eb0f795

## 🔒 My Workflow
- **Pattern**: Project Pattern
- **Scope document**: /home/zeta/jetton/PROJECT.md
1. **Decompose**: Survey initial codebase and demo-wallet reference, decompose into modular milestones in PROJECT.md.
2. **Dispatch & Execute**:
   - **Direct (iteration loop)**: For milestones, run Explorer -> Worker -> Reviewer -> Challenger -> Auditor gate loop.
3. **On failure**: Retry -> Replace -> Skip -> Redistribute -> Redesign -> Escalate.
4. **Succession**: Self-succeed at 20 spawns.
- **Work items**:
  1. Survey phase (3 parallel explorers) [done]
  2. E2E Testing Track (`sub_orch_e2e_testing`) [in-progress]
  3. Milestone 1 Wallet Core (`sub_orch_m1_wallet_core`) [done]
  4. Milestone 2 Wallet Context & UI (`sub_orch_m2_wallet_ui`) [in-progress]
  5. Milestone 3 Direct Transaction Engine (`sub_orch_m3_tx_engine`) [planned]
  6. Milestone 4 Manage Tabs & TonConnect Removal (`sub_orch_m4_tabs_refactor`) [planned]
  7. Milestone 5 E2E Verification & Build Certification [planned]
- **Current phase**: 2 (Milestone Execution)
- **Current focus**: Monitoring M2 Wallet Context & UI Setup (`sub_orch_m2_wallet_ui`) and E2E Testing Track (`sub_orch_e2e_testing`)

## 🔒 Key Constraints
- NEVER write, modify, or create source code files directly.
- NEVER run build/test commands yourself — require workers to do so.
- NEVER investigate or explore the problem at the code level — dispatch Explorers for technical investigation.
- All implementation must be genuine — zero tolerance for integrity violations or cheating.
- Must satisfy all requirements R1-R4 and acceptance criteria.
- `nub run typecheck` and `nub run build` must pass cleanly.

## Current Parent
- Conversation ID: d488bd68-ccf7-4e4f-b5ef-6e807eb0f795
- Updated: not yet

## Key Decisions Made
- Milestone 1 (Wallet Core) verified complete with zero typecheck errors.
- Dispatched Milestone 2 Sub-orchestrator (`sub_orch_m2_wallet_ui`, conv ID: `e9532a3f-4b0a-4eca-ba26-571238ce4763`).

## Team Roster
| Agent | Type | Work Item | Status | Conv ID |
|-------|------|-----------|--------|---------|
| explorer_tonconnect | teamwork_preview_explorer | Survey TonConnect Usage | completed | dbcbbd34-f546-40c4-b242-d0b8897821ec |
| explorer_demowallet | teamwork_preview_explorer | Survey Demo Wallet & WalletV5R1 | completed | e2de2d86-b4b4-4790-b8eb-53b18c6ce71c |
| explorer_tabs | teamwork_preview_explorer | Survey Contract Operations in Tabs | completed | f7983c2e-9263-45b7-86cf-e4c6ebda31e4 |
| sub_orch_e2e_testing | self | E2E Testing Track Orchestrator | in-progress | d410398d-074b-4edd-ba87-c0fbf159eb7f |
| sub_orch_m1_wallet_core | self | M1 Sub-orchestrator (Wallet Core) | completed | 77bac7fc-aff9-4d7d-a52e-0c18ad06d520 |
| sub_orch_m2_wallet_ui | self | M2 Sub-orchestrator (Wallet Context & UI) | network_error | e9532a3f-4b0a-4eca-ba26-571238ce4763 |
| sub_orch_m2_wallet_ui_gen2 | self | M2 Sub-orchestrator Gen2 (Wallet Context & UI) | in-progress | 758b6f14-d290-47d4-82c9-c27a0fa5b79e |

## Succession Status
- Succession required: no
- Spawn count: 7 / 20
- Pending subagents: d410398d-074b-4edd-ba87-c0fbf159eb7f, 758b6f14-d290-47d4-82c9-c27a0fa5b79e
- Predecessor: none
- Successor: not yet spawned

## Active Timers
- Heartbeat cron: pending
- Safety timer: none

## Artifact Index
- /home/zeta/jetton/.agents/ORIGINAL_REQUEST.md — Original User Request
- /home/zeta/jetton/.agents/orchestrator/DISPATCH.md — Orchestrator Dispatch Record
- /home/zeta/jetton/.agents/orchestrator/BRIEFING.md — Persistent Working Memory
- /home/zeta/jetton/.agents/orchestrator/progress.md — Liveness Heartbeat & Progress Checkpoints
- /home/zeta/jetton/.agents/orchestrator/plan.md — Orchestration Plan
