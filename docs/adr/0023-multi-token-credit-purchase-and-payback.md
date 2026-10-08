# 23. Multi-Token Credit Purchase, Payback, and Storage Migration

Date: 2026-10-07

## Status
Accepted (Extends [ADR-0017](0017-unified-loan-requirement.md) and [ADR-0021](0021-ecosystem-swap-and-fractional-credit-multiplier.md))

## Context
Previously, borrowing credit and redemption through Personal Tokens was restricted strictly to **FI**:
1. Members could only configure a `LoanRequirement` on their identity Account (`FossFiWallet`).
2. Credit could only be extended in FI via `BuyCredit` on `FossFiWallet`, minting Personal Tokens to the lender.
3. Holders of a Personal Token could only redeem it for FI (`Payback` routed exclusively to the issuer's `FossFiWallet`).

As BrotherHood expanded to support fiat-backed Reserve Tokens and peer Personal Tokens, this single-currency design caused several friction points:
- Members holding Reserve Tokens or other tokens could not extend credit in those tokens or borrow them directly against their own personal trust.
- There was no mechanism to specify a deadline for loan funding (`creditCutoff`), meaning borrowing remained open indefinitely until maturity even if an issuer only needed funding for a limited window.
- Lenders burning Personal Tokens could not choose the payout currency (e.g. demanding Reserve Tokens instead of FI).
- If an issuer lacked full liquidity to settle a redemption at maturity, the entire transaction would bounce or abort rather than paying out available liquidity and preserving the lender's remaining claim.

## Decision

1. **Per-Personal-Wallet Loan Requirements & Comprehensive Accounting**:
   - Extended `PersonalWalletStore` (version 2) with credit configuration and historical accounting fields:
     - `creditNeed: coins = 0`: Active credit requested in this specific token.
     - `creditCutoff: uint32 = 0`: Cutoff timestamp after which no further credit can be purchased (`now >= creditCutoff` rejects `BuyCredit`).
     - `creditMaturity: uint32 = 0`: Maturity timestamp before which payback cannot be redeemed (`now < creditMaturity` rejects `Payback`).
     - `multiplier: uint16 = 1000`: 3-decimal fixed-point token ratio (`1000 = 1.000x`).
     - `totalCreditReceived: coins = 0`: Cumulative credit tokens borrowed.
     - `totalPaybackSettled: coins = 0`: Cumulative credit tokens repaid.
     - `totalPaybackShortfall: coins = 0`: Cumulative unpaid payback due to liquidity shortfall.
   - Symmetrically added `creditCutoff: uint32 = 0` to `FiWalletStore` in `FossFiWallet` to ensure unified borrowing timeline semantics across all tokens.

2. **Unified `SetLoanRequirement` Struct**:
   - Updated the canonical struct `0x0000114a` to include `cutoffDate: uint32? = null`:
     ```tolk
     struct (0x0000114a) SetLoanRequirement {
         queryId: uint64 = 0
         amount: coins? = null
         maturityDate: uint32? = null
         cutoffDate: uint32? = null
         multiplier: uint16? = null
     }
     ```
   - Enforced validation invariant: whenever both `cutoffDate` and `maturityDate` are non-zero, `cutoffDate <= maturityDate` must hold (throwing `Errors.InvalidMessage`).

3. **Multi-Token Credit Purchase (`BuyCredit` on `PersonalWallet`)**:
   - `PersonalWallet` accepts `BuyCredit { queryId, jettonAmount, transferRecipient, sendExcessesTo }` from its owner.
   - Dispatches `InternalTransferStep(transferredAsCredit = true)` to the recipient's `PersonalWallet`.
   - On incoming credit transfer, `PersonalWallet` verifies `creditNeed > 0`, checks `creditCutoff` and `creditMaturity`, accepts up to `creditNeed`, refunds any excess, and triggers `MintNewJettons` on the borrower's `PersonalMinter`.

4. **Cryptographic Mint Authentication via Deterministic Wallet Derivation**:
   - When Borrower's `PersonalWallet_T` requests `MintNewJettons` from Borrower's `PersonalMinter`, the request includes `tokenMinter` and `deployer`.
   - Borrower's `PersonalMinter` verifies `in.senderAddress == calcDeployPriWallet(storage.adminAddress, msg.deployer, msg.tokenMinter, getBasePersonalWalletCode()).calculateAddress()`, ensuring only authentic Personal Wallets owned by the borrower can trigger token issuance.

5. **Multi-Token Payback Routing & Partial Settlement (`PaybackShortfall`)**:
   - When burning a Personal Token for payback (`AskToBurn`), the holder specifies `targetMinterAddress: address?` and `targetWalletAddress: address?` (packed in `customPayload`). If null, defaults to FI.
   - For Personal Token targets, `PersonalMinter` dispatches `Payback` directly to the borrower's target `PersonalWallet_T`.
   - `PersonalWallet_T` strictly verifies that `in.senderAddress == calcDeployBasePersonalMinter(storage.owner.getAddrFiWallet(), storage.owner, getBasePersonalMinterCode()).calculateAddress()`, preventing unauthorized debits.
   - If `jettonBalance == 0`, `PersonalWallet_T` throws `Errors.InsufficientBalance`, bouncing via `RichBounce` so `PersonalMinter` restores `totalSupply` and re-mints all tokens back to the lender.
   - If `0 < jettonBalance < requestedAmount`, `PersonalWallet_T` transfers available balance to the lender, updates `totalPaybackShortfall`, and dispatches `PaybackShortfall { queryId, lender, shortfall }` to `PersonalMinter` to re-mint the unpaid remainder to the lender.

6. **Storage Migration**:
   - `PersonalWallet` upgrades store from version 1 (or uninitialized base store) to version 2, populating default credit fields (`creditNeed = 0`, `multiplier = 1000`, etc.).
   - `FossFiWallet` migration schema incorporates `creditCutoff = 0`.
