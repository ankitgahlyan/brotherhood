# BrotherHood

BrotherHood is an invite-only online community on TON that uses cryptocurrency to seek moral and economic consensus, and ultimately to crowdsource physical territory for diplomatic recognition (a "network state"). Its jetton (FI) is the economic and governance instrument; supply is minted through social growth (invites, following) and recurring claims, and decays over a member's lifetime, so value tracks human trust rather than capital.

## Language

### Identity

**Member**:
A human who belongs to BrotherHood. A member can invite, be invited, vote, be reported, and, on death, have their account closed.
_Avoid_: User, person, account holder

**Country** — the numeric ISO 3166-1 country code recorded in a Member's Account profile, scoping governance voting and regional representation.
_Avoid_: Nationality, citizenship, region

**Location** — an on-chain child contract indexing Members residing within a specific Uber H3 spatial area. Deployed on-demand by the Minter using shared TON library code.
_Avoid_: City, CityMap, Region, Geo-index

**H3 Cell** — the string representation of an Uber H3 hexagonal spatial index recorded in a Member's Account profile to position them geographically.
_Avoid_: Coordinate, GPS, City name, Address

**Account** — a member's on-chain record, implemented as a `FossFiWallet` contract. Holds the member's balance, votes, connections, and status. One member owns exactly one account.
_Avoid_: Wallet, jetton wallet (reserved for the TON standard view)

**Owner** — the external TON address that signs for and controls an Account's wallet contract.
_Avoid_: Wallet, signer

**Authority** — an Account elevated through received votes to take admin actions (freezing, burning, closing) on ordinary Accounts.
_Avoid_: Admin, moderator, validator

### Economy

**FI** — the BrotherHood jetton. Minted to reward social growth (an accepted invite, a follow) and recurring claims (weekly); burned through lifetime decay, unfollows, and closure. Its supply is a measure of human trust, not a fixed issuance.
_Avoid_: Token (when the distinction matters), the coin

**Invite** — the act of bringing a new Member into BrotherHood. Only Members can invite; an accepted invite mints FI to reward the network growth it causes.
_Avoid_: Referral, signup, voucher

**Following** — a directional social link from Follower Account to Followee Account, rewarding the Followee with 1,000 minted FI. Implemented as an ephemeral child `Following` contract deployed with shared TON library code.
_Avoid_: Friendship, connection, subscription

**Unfollow** — removing a Following; burns the 1,000 FI from the Followee and self-destructs the child `Following` contract to recover TON storage rent.
_Avoid_: Unfriend, remove

**Settlement** — the required burning of minted FI when either party of an active Following dies/closes. Under the survivor-pays invariant, the surviving counterparty burns 1,000 FI to settle the trust supply (if Follower dies, Followee burns; if Followee dies, Follower burns). Unpaid shortfalls become Debt on the surviving Account and cascade up its Invite Lineage.
_Avoid_: Liquidation, default, clearing

**Lifetime Decay** — a small monthly burn of an Account's FI spread over the expected human lifespan, so minted value converges to zero as a Member ages out. One of the economic counterweights to minting; weekly claims still continue alongside it.
_Avoid_: Inflation, demurrage (too broad), fees

**Weekly Claim** — a recurring mint of FI a Member may claim, subject to claim windows and totals (today: 11111/week for two years). A steady mint stream alongside invites and follows.
_Avoid_: Stipend, allowance (allowance is reserved for friend spending)

**Gold Coin** — a transferrable store-of-value unit held by an Account, used for token-like transfers alongside FI.
_Avoid_: Points, credits

**Allowance** — a spending permission an Account grants to a friend, letting them spend a limited amount of the Account's balance (pocket money).
_Avoid_: Spending limit, delegation

**Credit Need** — an Account's recorded need for credit, checked before a loan to it is processed.
_Avoid_: Credit score, risk rating

**Accumulated Fees** — fees an Account collects and forwards to the minter in a single transaction once a threshold is crossed.
_Avoid_: Fee pool, fees payable

**Nominee** — the Account designated to receive a Member's remaining tokens when that Member's Account closes on death.
_Avoid_: Heir, beneficiary (when precision matters), successor

**Personal Token** — a jetton minted by a Member against their own trust. Buying it is how another Member extends that Member a loan: the buyer's FI flows to the issuer, and the issuer repays by buying back and burning the token.
_Avoid_: Credit token, IOU, social token

**Loan** — FI owed between Members, collateralized by a borrower's Personal Token.
_Avoid_: Debt (reserved for the Account-level liability below)

**Debt** — an Account's outstanding liability. Arises especially when a followed Account closes on death and the follower lacks enough tokens to burn, leaving a shortfall that must be repaid.
_Avoid_: Loan, balance owed

**Lottery** — a side game within BrotherHood: Accounts pay an entry amount to join a pool; a winner is selected cryptographically (commit-reveal) and receives the pool. A source of fun, not an economic mechanism.
_Avoid_: Gambling, raffle (when precision matters)

**Report** — a complaint by a Member against another. A report is only actionable once a minimum number of Members back it (sybil-resistance), after which the Authority adjudicates; substantiated reports can lead to Closure. A reported Account cannot take actions until resolved.
_Avoid_: Flag, complaint, dispute

**Report Backing** — a Member's endorsement of someone else's Report, counted toward the minimum needed before the Report reaches the Authority.
_Avoid_: Second, agreement, co-sign

### Invites

**Inviter** — the Member whose Account brought this Member into BrotherHood. Vouches for the Invitee, is held accountable for it, and can deactivate it.
_Avoid_: Referrer, sponsor, nominee

**Invitee** — the Member being brought in by an Inviter.

**Invite Lineage** — the ordered chain of Inviters above an Account, making accountability traceable to its root and enabling closure propagation.
_Avoid_: Referral chain, network

### Governance

**Vote** — a unit of reputational endorsement cast by one Account for another within the same Country. Voting power is a fixed endowment per Account, deliberately not weighted by FI balance or staked capital: consensus is moral and regional, not economic.
_Avoid_: Stake, token-weight, reputation (when meaning the tally)

**Candidate** — an active Member Account receiving a Vote endorsement from another Member of the same Country.
_Avoid_: Nominee (reserved for inheritance successor), delegate

**Received Votes** — the tally of votes an Account has collected; crossing the Authority Threshold elevates it to Authority.

**Authority Threshold** — the received-vote count at which an Account becomes Authority.
_Avoid_: Quorum, supermajority

**Authority Action** — a privileged operation an Authority may perform on an ordinary Account: freeze, burn, or close.
_Avoid_: Admin action, moderation

**Poll** — an on-chain contract deployed per governance proposal, tallying Member votes and forwarding successful proposals to the DAO Proxy upon reaching the supermajority threshold.
_Avoid_: DAO contract, Proposal contract, ballot

**Voter** — a child contract of a Poll tracking whether a specific Member Account has cast a vote on that Poll and preventing duplicate voting.
_Avoid_: DaoVoter, Ballot receipt, vote ticket

**DAO Proxy** — the network's canonical governance proxy contract registered in the minter, authenticating and forwarding approved actions from verified Poll contracts to the minter.
_Avoid_: DAO, governance controller, admin proxy

### Account lifecycle

**Active** — the operational state of an Account that can take actions.
_Avoid_: Verified, live

**Suspension** — a temporary, reversible state of an Account, set by its Inviter, Upstream Inviter(invitor0), or an Authority. Softest inactive state; it can be re-activated.
_Avoid_: Freeze, ban, block

**Under Review** — an Account's state while an active Report with insufficient backing prevents it from acting. Distinct from Suspension (reversible by intent) and Closure (permanent).
_Avoid_: Locked, flagged

**Closure** — the permanent end of an Account, on a Member's death or as an Authority sanction. Unfollows all, burns the remaining minted FI, propagates up the Invite Lineage, and transfers the Member's remaining tokens to their Nominee.
_Avoid_: Deletion, destruction

### Organization

**Treasury** — the network's canonical Account, which governs the minter and anchors the Address of every wallet contract. Distinct from an ordinary Member Account.
_Avoid_: Admin wallet, operator

**Identifier** — an offchain identity (email, phone, or username) an Account stores for web integrations and potential social recovery; distinct from the on-chain Account and Owner.
_Avoid_: ID, username, handle
