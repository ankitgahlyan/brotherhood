# ADR 0015: Account Suspension and Authority Sanction with Fund Confiscation

## Status
Accepted

## Context
BrotherHood relies on social accountability and invite lineages for Sybil-resistance and network security. When bad actors behave maliciously or members become inactive or compromised, two distinct tiers of enforcement are required:

1. **Lineage Accountability (Circle & Ring Management)**: Inviters (`invitor`) and upstream inviters (`invitor0`) vouch for their invitees and bear reputational and financial responsibility for them. If an invitee turns out to be abusive, spamming, or compromised, their direct inviter or upstream inviter needs a reversible mechanism to suspend or reactivate the member's account without destroying their funds or permanently closing the account.
2. **Protocol Authority Enforcement (Malicious Account Confiscation)**: When an account engages in systemic attacks, fraudulent activities, or malicious exploits, elevated Authority accounts (`isAuthorityAccount` or `isPrevilegedAccount`) require a punitive, high-severity action to revoke active status and immediately confiscate all FI tokens held in the offending wallet back to the authority's wallet for restitution or protocol safeguarding.

Previously, `FossFiWallet` only had `AuthorityCloseAccount` (which closes a deceased member's account and passes assets to their nominated successor) and a generic `SetStatus` call. It lacked dedicated opcodes for direct lineage suspension and authority fund confiscation.

## Decision

### 1. Circle/Ring Member Active State Toggle (`DeActivateCircleRing`)
- **Opcode**: `0x00001055` (`DeActivateCircleRing`), with internal message `0x00001056` (`DeActivateCircleRingInternal`).
- **Initiator**: Account owner of an active member wallet (`store.active == true`).
- **Target**: Specified recipient address (`transferRecipient.getAddrFiWallet()`).
- **Verification at Target**:
  The target `FossFiWallet` checks `in.senderAddress == nomins.invitor0 || in.senderAddress == nomins.invitor`. If verified, toggles `store.active = !store.active`.
- **Properties**:
  - Reversible: Inviter or upstream inviter can toggle active back on if the dispute is resolved.
  - Non-destructive: Member balances, gold coins, and network relations are preserved intact while actions are blocked.
  - Gas: Minimal forward fee covered via standard `GAS.AUTHORITY` / `GAS.INVITE` allocation (`0.1 TON`).

### 2. Authority Sanction with Fund Confiscation (`ActDispatchAuthorityAction`)
- **Opcode**: `0x000010f4` (`ActDispatchAuthorityAction`), triggering internal message `0x000010f5` (`AuthorityAction`).
- **Initiator**: Account owner of an authorized Authority account (`store.isAuthorityAccount || store.isPrevilegedAccount`).
- **Target**: Specified recipient address (`transferRecipient.getAddrFiWallet()`).
- **Verification at Target**:
  - Target must not be an authority account (`assert (!store.isAuthorityAccount)`).
  - Toggles target's active state (`store.active = !store.active`).
  - If target has a positive FI balance (`store.jettonBalance > 0`), transfers 100% of the target's balance back to the dispatching authority's `FiWallet` via `InternalTransferStep` with forwardPayload `"authorityFreeze"`.
- **Properties**:
  - Punitive & Restitutive: Confiscates malicious assets to authority control for remediation or burning.
  - Gas: `GAS.AUTHORITY` (`0.1 TON`) with remaining message value forwarded to complete the internal transfer.

### 3. Frontend & Architecture Integration
- **`useDeactivateMember`**: Dedicated hook accepting target member address and managing the `DeActivateCircleRing` transaction flow.
- **`useAuthorityActions`**: Extended with `dispatchAuthorityAction` to trigger `ActDispatchAuthorityAction` alongside existing `setStatus` and `closeAccount`.
- **User Interface**:
  - `MemberDetailView`: Displays dynamic "Suspend Member" / "Reactivate Member" button for members belonging to the user's Circle or Ring, with a confirmation modal explaining the effects.
  - `CircleTab` & `RingTab`: Member cards indicate active / suspended status clearly and link into the detail view.
  - `Authority Panel`: Exposes a dedicated "Sanction & Confiscate Funds" sub-tab with clear security warnings and target input.

## Consequences
- Lineage inviters can enforce local discipline over their invitees without requiring minter or authority escalation.
- Authorities have immediate on-chain power to confiscate balances from malicious actors before funds can be drained or laundered.
- All wrapper interfaces (`FossFiWallet.gen.tolk`, `FossFiWallet.gen.ts`) and test suites maintain strict TL-B alignment.
