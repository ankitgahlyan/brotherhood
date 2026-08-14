# Scope: Milestone 1 — Wallet Core & Crypto Infrastructure

## Milestone Description
Implementation and verification of TON Wallet V5R1 core contracts, mnemonic generation, seed derivation, ED25519 signing/keypair derivation, RPC client integration, local secure storage abstraction, and unit/integration tests for wallet operations.

## Target Files
- `src/lib/wallet/crypto.ts`
- `src/lib/wallet/mnemonic.ts`
- `src/lib/wallet/rpc-client.ts`
- `src/lib/wallet/storage.ts`
- `src/lib/wallet/wallet-v5-r1.ts`
- `src/lib/wallet/index.ts`
- `src/lib/wallet/__tests__/*`

## Verification Requirements
- `nub run typecheck` must pass with zero errors.
- Tests for `src/lib/wallet/` must pass 100%.
- Cryptographically sound implementation of Wallet V5R1 signing, payload construction, and RPC interaction.
- Independent verification by 2 Reviewers, 2 Challengers, and 1 Forensic Auditor.
