# Orchestration Plan

## Overview
Replace TonConnect across the application with an embedded in-app TON wallet management and transaction signing system supporting WalletV5R1 standard adapted from demo-wallet.

## Phased Approach

### Phase 0: Survey & Discovery
- Dispatch 3 parallel Explorers:
  1. `explorer_tonconnect_usage`: Audit all files, hooks, providers, and components referencing `@tonconnect/ui-react`, `TonConnectButton`, `useTonConnectUI`, `useSendFiTransaction`, `TonClient`, etc.
  2. `explorer_demo_wallet_ref`: Audit demo-wallet reference and `@demo/wallet-core` assets/packages/utilities in the codebase or environment, focusing on WalletV5R1 keypair derivation, mnemonic validation, AES-GCM storage/persistence, and transaction construction/signing.
  3. `explorer_tab_contract_ops`: Map contract interaction points across DeployPage and all 11 Manage tabs (AdminTab, AllowanceTab, BurnTab, CreditTab, DestroyTab, InviteTab, IssueTokenTab, MintTab, TransferTab, VoteTab), identifying payload builders and wallet requirements.

### Phase 1: PROJECT.md Specification & Milestone Decomposition
- Aggregate explorer findings into `PROJECT.md` at root.
- Define feature inventory, modular milestones, interface contracts, and code layout.

### Phase 2: Execution & Verification (Dual Track)
- Implementation Track: Milestone sub-orchestrators executing Explorer -> Worker -> Reviewer -> Challenger -> Auditor gate loops.
- E2E Testing Track: Opaque-box E2E test suite creation (`TEST_READY.md`).
- Final Milestone: Pass 100% of E2E test suite and adversarial coverage hardening.

### Phase 3: Victory Claim
- Verify `nub run typecheck` and `nub run build` pass cleanly.
- Report victory to Sentinel parent.
