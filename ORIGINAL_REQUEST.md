# Original User Request

## 2026-08-11T12:45:20Z

<USER_REQUEST>
Replace TonConnect across the application with an embedded in-app TON wallet management and transaction signing system (supporting WalletV5R1 standard) adapted from the reference application at demo-wallet.

Working directory: /home/zeta/jetton
Integrity mode: development

## Requirements

### R1. Complete TonConnect Removal & Direct In-App Wallet Management
Replace `@tonconnect/ui-react` completely across the application (Header, Manage tab pages, Deploy page, providers). Implement in-app wallet creation, import (via 12 or 24 word mnemonic), wallet switching, key storage, and balance/address display adapted from `demo-wallet` and `@demo/wallet-core`.

### R2. Standardized WalletV5R1 Contract Implementation
All newly created or imported wallets must instantiate TON `WalletV5R1` contract instances (workchain 0). Calculate public keys and wallet contract addresses using `@ton/crypto` / `@ton/ton` / `@ton/core` mnemonic-to-key-pair utilities.

### R3. Direct In-App Transaction Construction, Signing, & RPC Broadcast
Replace `useSendFiTransaction` and TonConnect UI transaction calls across all contract interactions (DeployPage, AdminTab, AllowanceTab, BurnTab, CreditTab, DestroyTab, InviteTab, IssueTokenTab, MintTab, TransferTab, VoteTab) with direct internal transaction building, secret key signing using the active WalletV5R1 instance, and BOC submission via TonClient / Toncenter RPC.

### R4. Key Persistence & Client Security
Persist stored wallet credentials securely in client `localStorage` with AES-GCM encryption / session unlock mechanisms so private keys remain protected while allowing seamless transaction signing during active sessions.

## Acceptance Criteria

### Wallet Management UI & State
- [ ] `@tonconnect/ui-react` dependencies and TonConnectButton are removed from all components (`Header.tsx`, `AppProviders.tsx`, `ManagePage.tsx`, `DeployPage.tsx`, and all Manage tabs).
- [ ] Wallet setup UI (Create Wallet, Import Mnemonic, View Seed, Switch Active Wallet) is integrated using components adapted from `demo-wallet`.
- [ ] Mnemonic generation creates valid 24-word seeds that derive correct WalletV5R1 addresses.
- [ ] Wallet import accepts valid 12 or 24 word seed phrases and initializes a WalletV5R1 instance.

### Direct Transaction Signing & Contract Operations
- [ ] Contract transactions across all tabs (Mint, Transfer, Burn, Issue Token, Credit, Allowance, Admin, Invite, Destroy, Vote, Deploy) build transfer payloads, sign with the local wallet secret key, and broadcast to the TON network.
- [ ] Transactions execute and succeed without opening external wallet modals or calling TonConnect APIs.
- [ ] Typecheck (`nub run typecheck`) and build (`nub run build`) pass cleanly.

</USER_REQUEST>
