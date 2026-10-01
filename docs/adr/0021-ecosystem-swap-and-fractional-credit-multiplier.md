# 21. Ecosystem Swap via Credit Buy/Payback and 3-Decimal Fractional Credit Multiplier

Date: 2026-10-01

## Status
Accepted (Updates aspects of [ADR-0017](0017-unified-loan-requirement.md))

## Context
BrotherHood requires a self-contained token exchange mechanism without relying on external decentralized exchanges (STON.fi, DeDust, Omniston) or liquidity pools that expose Members to impermanent loss. Within the network state:
1. **FI** acts as the universal ecosystem base currency ("Gram").
2. **Reserve Token** (the Personal Token deployed by the **Treasury** Account, `BRO_TREASURY_ADDRESS`) acts as the fiat-backed stablecoin and secondary routing hub, purchased off-chain via a fiat checkout link and redeemable for off-chain fiat payouts.
3. Every Member's **Personal Token** already pairs with FI through their Account (`FossFiWallet`) via `BuyCredit` ($\text{FI} \to \text{Personal Token}$) and `Payback` ($\text{Personal Token} \to \text{FI}$).

However, four protocol limitations prevented using `BuyCredit` and `Payback` directly as an ecosystem swap router:
- `FiWalletStore.multiplier` (`uint16`) only supported whole integers $\ge 1$, making it impossible for an issuer or the Treasury to charge a service fee ($0 < \text{multiplier} < 1$) on token issuance.
- `SetLoanRequirement` required `effectiveMaturity > blockchain.now()` whenever setting `creditNeed > 0`, blocking instant two-way swaps (`creditNeed > 0` and `creditMaturity <= now` simultaneously) for $1:1$ or fee-charging tokens (`multiplier <= 1.000x`), while conversely failing to block `BuyCredit` after `creditMaturity` when `multiplier > 1.000x` (creating an instant post-maturity buy-and-payback arbitrage loop).
- `PersonalMinter` only attached `latestPersonalWalletCode` when `jettonAmount == grams("1")`, causing first-time buyers swapping arbitrary amounts via `BuyCredit` to bounce at `BasePersonalWallet` (`Errors.NotOnboardedWallet`).
- Swapping between two Personal Tokens ($P_A \to \text{FI} \to P_B$, including Reserve Token $\leftrightarrow$ Member Personal Token) required two separate manual transactions, and normal burns (`AskToBurn` with `sendExcessesTo == null`) did not forward encrypted bank details to the minter admin for fiat off-ramping.

## Decision

1. **3-Decimal Fixed-Point `multiplier` (`MULTIPLIER_SCALE = 1000`)**:
   - `FiWalletStore.multiplier` (`uint16`, default `1000`) represents a 3-decimal fixed-point ratio (`1000 = 1.000x`, `995 = 0.995x` [0.5% service charge], `1 = 0.001x` minimum, `2000 = 2.000x`, up to `65535 = 65.535x`).
   - On `BuyCredit`, `mintPersonalAmount = mulDivFloor(acceptedAmount, store.multiplier, 1000)`.
   - `creditNeed` is strictly manually configured by the Account owner via `SetLoanRequirement` (no automatic replenishment on `Payback`), ensuring the Treasury never accepts unbacked social FI beyond its explicitly configured limit.

2. **Maturity & Arbitrage Guard (`FossFiWallet`)**:
   - When `effectiveMultiplier <= 1000` ($\le 1.000\times$), `SetLoanRequirement` allows `creditMaturity` to be `0` or `<= blockchain.now()`, enabling simultaneous `BuyCredit` and `Payback` for liquid two-way swaps.
   - When `effectiveMultiplier > 1000` ($> 1.000\times$), `SetLoanRequirement` enforces `effectiveMaturity > blockchain.now()`, and `InternalTransferStep` (`transferredAsCredit == true`) asserts `blockchain.now() < store.creditMaturity` (`Errors.CreditNeedExceeded`), eliminating post-maturity arbitrage drains.

3. **Unconditional First-Time `BasePersonalWallet` Onboarding on Mint**:
   - `PersonalMinter` attaches `storage.codes.latestPersonalWalletCode` on `MintNewJettons` whenever `transferredAsCredit == true` or `jettonAmount == grams("1")`, and `BasePersonalWallet` accepts any `InternalTransferStep` carrying `msg.latestWalletCode != null` from `minterAddress` or a verified peer wallet.

4. **Single-Signature Multi-Hop Routing ($P_A \to \text{FI} \to P_B$) & Bounce Recovery**:
   - `AskToBurn` $\to$ `NotifyMinter` $\to$ `Payback` carries an optional `swapTargetOwner: address?` (via `customPayload`).
   - **Leg 1 ($P_A \to \text{FI}$)**: If `Payback` fails at `FossFiWallet_A`, it bounces (`RichBounceOnlyRootCell`) to `PersonalMinter_A`, which restores `totalSupply` and re-mints $P_A$ to the user's `PersonalWallet_A`.
   - **Leg 2 ($\text{FI} \to P_B$)**: `FossFiWallet_A` delivers the redeemed FI to the user's `FossFiWallet` with `swapTargetOwner = B`. The user's `FossFiWallet` credits `store.jettonBalance` and immediately dispatches `InternalTransferStep(transferredAsCredit = true)` to `FossFiWallet_B`. If `FossFiWallet_B` rejects or partially refunds the credit transfer, the bounce/refund returns directly to the user's `FossFiWallet`.
   - **Mint Bounce Recovery**: `FossFiWallet` sends `MintNewJettons` with `BounceMode.Only256BitsOfBody`; if `PersonalMinter` bounces `MintNewJettons`, `FossFiWallet.onBouncedMessage` restores `store.creditNeed` and refunds the FI to the buyer's `FossFiWallet`.

5. **Fiat On-Ramp & Encrypted Off-Ramp on Reserve Token**:
   - When burning a Personal Token with `sendExcessesTo == null` (normal burn, not `Payback`) and a non-null `customPayload` (containing the burner's bank details encrypted to the minter admin's public key), `PersonalWallet` forwards `customPayload` in `NotifyMinter`, and `PersonalMinter` reduces `totalSupply` and dispatches a `TransferNotificationForRecipient` carrying the encrypted payload to `storage.adminAddress` (`BRO_TREASURY_ADDRESS`).
   - The `/swap` route replaces external DEX providers with the BrotherHood Ecosystem Swap interface supporting **FI**, **Reserve Token** (with external Fiat Buy placeholder link and Encrypted Burn Fiat Off-Ramp), and any Member **Personal Token** (discovered from Circle/Ring/Follows/holdings or resolved via `.bro` domain, `@username`, or address).
