# BRIEFING — 2026-08-11T13:14:00Z

## Mission
Implement Milestone 1: Wallet Core & Cryptography Infrastructure for Brotherhood wallet in `src/lib/wallet/`.

## 🔒 My Identity
- Archetype: worker_m1_1
- Roles: implementer, qa, specialist
- Working directory: /home/zeta/jetton/.agents/worker_m1_1
- Original parent: 77bac7fc-aff9-4d7d-a52e-0c18ad06d520
- Milestone: Milestone 1 - Wallet Core & Cryptography Infrastructure

## 🔒 Key Constraints
- Target directory: `/home/zeta/jetton/src/lib/wallet/`
- Target files:
  1. `wallet-v5-r1.ts`
  2. `mnemonic.ts`
  3. `crypto.ts`
  4. `storage.ts`
  5. `rpc-client.ts`
  6. `index.ts`
- Must pass `nub run typecheck` (or `npx tsc --noEmit`) cleanly without type errors.
- Genuine implementation required — no hardcoded tests or facade implementations.

## Current Parent
- Conversation ID: 77bac7fc-aff9-4d7d-a52e-0c18ad06d520
- Updated: 2026-08-11T13:14:00Z

## Task Summary
- **What to build**: Full Wallet V5R1 contract adapter, mnemonic generation & BIP39/TON key derivation, AES-GCM credential encryption/decryption, localStorage persistence schema v2, and TonClient RPC client wrapper.
- **Success criteria**: All 6 files implemented in `src/lib/wallet/`, passing typecheck and export test.
- **Interface contracts**: `/home/zeta/jetton/.agents/sub_orch_m1_wallet_core/SCOPE.md`

## Key Decisions Made
- Use reference implementation patterns from `/home/zeta/kit/` adapted to `@ton/ton`, `@ton/core`, `@ton/crypto`, `@scure/bip39`.

## Artifact Index
- `/home/zeta/jetton/.agents/worker_m1_1/DISPATCH.md` — Dispatch log
- `/home/zeta/jetton/.agents/worker_m1_1/BRIEFING.md` — Briefing document
- `/home/zeta/jetton/.agents/worker_m1_1/progress.md` — Progress heartbeat

## Change Tracker
- **Files modified**: None yet
- **Build status**: TBD
- **Pending issues**: None

## Quality Status
- **Build/test result**: TBD
- **Lint status**: TBD
- **Tests added/modified**: TBD

## Loaded Skills
- None
