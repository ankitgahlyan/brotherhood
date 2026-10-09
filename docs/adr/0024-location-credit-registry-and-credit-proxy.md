# Location Credit Registry and Credit Proxy

## Context
When members set their `creditNeed` in `FossFiWallet` (FI) or `PersonalWallet` (Reserve Token or personal jettons), discovering who needs credit across the network currently requires searching or indexing individual member wallet contracts. To enable localized, single-query credit discovery by geographic area (Uber H3 cell), we need an on-chain indexing mechanism.

## Decision
1. **Dedicated Per-H3-Cell `LocationCredit` Contract**: Each H3 cell can have an on-chain `LocationCredit` child contract deployed lazily, indexing active credit requests keyed by `tokenWalletAddress` with entries `(borrowerAddress, amount, multiplier, cutoffDate, maturityDate)`. It exposes a single `getState()` get-method returning full contract storage for frontend extraction. It is decoupled from the existing `Location` member residency contract to preserve separation of concerns and avoid cell size limits.
2. **`CreditProxy` Coordinator**: A singleton `CreditProxy` contract receives credit listing announcements from `FossFiWallet` and `PersonalWallet`, verifies the authenticity of the sender via deterministic address derivations, and forwards the listing/delisting to the corresponding `LocationCredit` contract.
3. **Payload Routing**: Borrowers pass `creditProxyAddress` and `h3Cell` in `SetLoanRequirement`. De-listing on full fulfillment via `BuyCredit` is optionally triggered by the lender providing the `creditProxyAddress` payload. Member relocations do not trigger automated migration of credit listings.
4. **Hot-Upgradability & Testnet Destruction**: Both `CreditProxy` and `LocationCredit` implement `HotUpgrade` and `Destroy` gated to the admin/deployer of FI to facilitate rapid iteration and bug-fixing.

## Considered Options
- **Overloading `Location` Member Residency Contract**: Rejected to avoid bloating general membership storage and mixing minter-governed residence tracking with wallet-governed lending state.
- **Per-Borrower Registry Contracts**: Rejected because off-chain search by location would still require aggregating distributed contracts, defeating the purpose of on-chain spatial indexing.
- **Direct Wallet-to-`LocationCredit` Dispatch**: Rejected in favor of `CreditProxy` to centralize sender verification logic and keep child `LocationCredit` contracts lightweight.
