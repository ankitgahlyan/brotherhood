## 2026-08-11T18:41:31Z
You are explorer_e2e_1 (teamwork_preview_spec_miner) for the E2E Testing Track.
Working directory: /home/zeta/jetton/.agents/explorer_e2e_1

Task:
Read /home/zeta/jetton/.agents/ORIGINAL_REQUEST.md and /home/zeta/jetton/PROJECT.md.
Investigate the project setup at /home/zeta/jetton (package.json, vitest/jest/playwright/tsx configs, scripts/, src/lib/wallet/, src/lib/useSendFiTransaction.ts, src/pages/DeployPage.tsx, and src/pages/manage/).

Determine:
1. What test runners / node execution tools are installed and working in this repository (e.g. vitest, jest, tsx, node --import, bun test, playwright)?
2. What are the key exports, interfaces, functions, and data flows for:
   - WalletV5R1 key derivation & contract building (`mnemonic.ts`, `wallet-v5-r1.ts`)
   - Key storage & AES-GCM encryption/decryption (`crypto.ts`, `storage.ts`)
   - RPC broadcasting (`rpc-client.ts`)
   - Direct transaction hook & payload builders (`useSendFiTransaction.ts`, `deploy.ts`, etc.)
   - All 11 Manage tabs / DeployPage transaction triggers.
3. How to construct opaque-box tests that exercise these modules without modifying implementation code.

Write your report to `/home/zeta/jetton/.agents/explorer_e2e_1/analysis.md` and deliver your handoff report to `/home/zeta/jetton/.agents/explorer_e2e_1/handoff.md`. Communicate back to parent when complete.
