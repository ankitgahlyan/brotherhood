# Scope: Milestone 2 — Wallet Context & UI Setup

## Architecture
Milestone 2 connects the completed M1 core wallet modules (`src/lib/wallet/`: `wallet-v5-r1.ts`, `crypto.ts`, `mnemonic.ts`, `storage.ts`, `rpc-client.ts`) into the TanStack Start React UI layer.
It provides `WalletContext` for React state management, in-app wallet setup & management UI components, replaces TonConnect in the Header and AppProviders, and updates dependent components (`WalletRequired` and wallet selector).

## Target Files & Components
1. `src/providers/WalletContext.tsx`: React Context provider managing active wallet, wallet list, lock/unlock state, active address/balance polling, and RPC broadcaster client (`TonClient`).
2. `src/components/wallet/`: Wallet setup and management UI components:
   - 24-word seed phrase creation
   - 12/24-word seed phrase import
   - Reveal seed phrase modal
   - Lock/unlock password modal
   - Wallet switcher modal
   - Rename/delete wallet functionality
3. `src/components/Header.tsx`: Replace `<TonConnectButton />` with in-app wallet trigger/status button.
4. `src/components/wallet-selector.tsx` & `src/pages/manage/common.tsx`: Refactor `WalletRequired` component and selector to use embedded `WalletContext`.
5. `src/providers/AppProviders.tsx`: Remove `TonConnectUIProvider` & `TonConnectThemeSync`, wrap application with `WalletProvider`.

## Feature Inventory Alignment
From `/home/zeta/jetton/PROJECT.md`:
- M2 Scope: In-App Embedded Wallet UI & Context setup.
- Dependencies: M1 Core Wallet Logic (`src/lib/wallet/`).

## Verification Requirements
- `nub run typecheck` passes with zero errors.
- `nub run build` (or relevant build script) succeeds.
- Frontend smoke tests / tests pass.
- Reviewer approval, Challenger empirical confirmation, Auditor CLEAN integrity verification.
