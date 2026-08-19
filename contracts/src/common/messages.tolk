import "@stdlib/strings"

type ForwardPayloadRemainder = RemainingBitsAndRefs

// ============================================================================
// JETTON REPLIES & METADATA (Shared Data Layouts)
// ============================================================================

struct JettonWalletDataReply {
    jettonBalance: coins
    ownerAddress: address
    minterAddress: address
    jettonWalletCode: cell
}

struct JettonDataReply {
    totalSupply: int
    mintable: bool
    adminAddress: address?
    jettonContent: Cell<OnchainMetadataReply>
    jettonWalletCode: cell
}

struct (0x00) SnakeDataReply {
    string: string
}

struct (0x00) OnchainMetadataReply {
    contentDict: map<uint256, string_prefixed0x>
}

struct (0b0) PayloadInline {
    value: RemainingBitsAndRefs
}

struct (0b1) PayloadInRef {
    value: Cell<RemainingBitsAndRefs>
}

// ============================================================================
// STANDARD JETTON OPCODES (TEP-74 & TEP-89 Standards - Unchanged)
// ============================================================================

struct (0x0f8a7ea5) AskToTransfer {
    queryId: uint64
    jettonAmount: coins
    transferRecipient: address
    sendExcessesTo: address?
    customPayload: cell?
    forwardTonAmount: coins
    @abi.clientType(PayloadInline | PayloadInRef)
    forwardPayload: ForwardPayloadRemainder
}

struct (0x7362d09c) TransferNotificationForRecipient {
    queryId: uint64
    jettonAmount: coins
    transferInitiator: address
    @abi.clientType(PayloadInline | PayloadInRef)
    forwardPayload: ForwardPayloadRemainder
}

struct (0x178d4519) InternalTransferStep {
    queryId: uint64
    jettonAmount: coins
    version: uint10
    transferredAsCredit: bool = false
    transferInitiator: address
    sendExcessesTo: address?
    forwardTonAmount: coins
    @abi.clientType(PayloadInline | PayloadInRef)
    forwardPayload: ForwardPayloadRemainder
}

struct (0xd53276db) ReturnExcessesBack {
    queryId: uint64
}

struct (0x595f07bc) AskToBurn {
    queryId: uint64
    jettonAmount: coins
    sendExcessesTo: address?
    customPayload: cell?
}

struct (0x7bdd97de) NotifyMinter {
    queryId: uint64
    jettonAmount: coins
    burnInitiator: address
    sendExcessesTo: address?
}

struct (0x2c76b972) RequestWalletAddress {
    queryId: uint64
    owner: address
    includeOwnerAddress: bool
}

struct (0xd1735466) ResponseWalletAddress {
    queryId: uint64
    jettonWalletAddress: address?
    owner: Cell<address>?
}

// Forward payload TL-B validation helper
fun ForwardPayloadRemainder.checkIsCorrectTlbEither(self) {
    var mutableCopy = self;
    if (mutableCopy.loadMaybeRef() != null) {
        mutableCopy.assertEnd();
    }
}

// ============================================================================
// GROUP 1: GOVERNANCE & ADMIN MESSAGES (Range: 0x00001000 - 0x0000104F)
// Buffer: 50 reserved opcodes for future governance features
// ============================================================================

struct (0x00001001) MintNewJettons {
    queryId: uint64
    mintRecipient: address
    tonAmount: coins
    internalTransferMsg: Cell<InternalTransferStep>
}

struct (0x00001002) ChangeMinterAdmin {
    queryId: uint64
    newAdminAddress: address
}

struct (0x00001003) ClaimMinterAdmin {
    queryId: uint64
}

struct (0x00001004) DropMinterAdmin {
    queryId: uint64
}

struct (0x00001005) ChangeMinterMetadata {
    queryId: uint64
    newMetadata: cell
}

struct (0x00001006) Upgrade {
    walletUpgrade: bool = true
    walletVersion: uint10
    sender: address
    newData: cell? = null
    newCode: cell? = null
}

struct (0x00001007) TopUpTons

struct (0x00001008) RequestUpgradeCode {
    sender: address
    version: uint10
}

struct (0x00001009) ApproveUpgrade {}

struct (0x0000100a) RejectUpgrade {}

struct (0x0000100b) HotUpgrade {
    additionalData: cell?
    code: cell
}

struct (0x0000100c) SetLocationAddresses {
    queryId: uint64
    locationAddrs: map<uint8, address>
}

struct (0x0000100d) ChangeDaoAddress {
    queryId: uint64
    newDaoAddress: address
}

struct (0x0000100e) RequestTotalAccounts {
    queryId: uint64
}

struct (0x0000100f) ResponseTotalAccounts {
    queryId: uint64
    totalAccounts: uint33
}

// ============================================================================
// GROUP 2: ACCOUNT LIFECYCLE & ONBOARDING (Range: 0x00001050 - 0x0000109F)
// Buffer: 50 reserved opcodes for future lifecycle features
// ============================================================================

struct (0x00001051) ActInvite {
    queryId: uint64
    transferRecipient: address
    username: string
    city: string
    cityLetter: uint8 = 0
    country: uint16 = 0
}

struct (0x00001052) InternalInvite {
    queryId: uint64 = 0
    version: uint10
    sender: address
    invitor: address
    currentWalletCode: cell
    currentStorage: cell?
    username: string
    city: string
    cityLetter: uint8 = 0
    country: uint16 = 0
}

struct (0x00001053) InternalInviteApproval {
    sender: address
}

struct (0x00001054) InformMinterInviteInternal {
    queryId: uint64
    sender: address
    invitor: address
    username: string
    city: string
    cityLetter: uint8 = 0
    country: uint16 = 0
}

struct (0x00001055) ActDeactivate {
    transferRecipient: address
}

struct (0x00001056) InternalDeActivate {}

struct (0x00001057) ActRequestUpgrade {}

struct (0x00001058) ActDestroyAccount {}

struct (0x00001059) Destroy {}

type ActAction =
    | ActClaimWeeklyGrant
    | ActInvite
    | ActVote
    | ActUnvote
    | ActDeactivate
    | ActRequestUpgrade
    | ActDispatchAuthorityAction
    | ActJoinLottery
    | ActSetPersonalJettonMinter
    | ActDestroyAccount
    | ActSubmitProposal
    | ActVoteProposal

// ============================================================================
// GROUP 3: PROFILE & LOCATION INDEXING (Range: 0x000010A0 - 0x000010EF)
// Buffer: 50 reserved opcodes for future location & profile features
// ============================================================================

struct (0x000010a1) ChangeUsername {
    newUsername: string
}

struct (0x000010a2) ChangeCity {
    queryId: uint64 = 0
    newCity: string
    oldCityLetter: uint8 = 0
    newCityLetter: uint8 = 0
}

struct (0x000010a3) InformMinterChangeCity {
    queryId: uint64
    owner: address
    oldCity: string
    newCity: string
    oldCityLetter: uint8 = 0
    newCityLetter: uint8 = 0
}

struct (0x000010a4) LocationRegisterCity {
    queryId: uint64
    ownerAddress: address
    cityName: string
    sendExcessesTo: address?
}

struct (0x000010a5) LocationUnregisterCity {
    queryId: uint64
    ownerAddress: address
    cityName: string
    sendExcessesTo: address?
}

struct (0x000010a6) RegisterCityMember {
    queryId: uint64
    ownerAddress: address
    cityName: string
    sendExcessesTo: address?
    version: uint10 = 0
}

struct (0x000010a7) UnregisterCityMember {
    queryId: uint64
    ownerAddress: address
    cityName: string
    sendExcessesTo: address?
    version: uint10 = 0
}

struct (0x000010a8) ChangeCountry {
    queryId: uint64 = 0
    newCountry: uint16
}

// ============================================================================
// GROUP 4: SOCIAL, VOTING, & AUTHORITY (Range: 0x000010F0 - 0x0000113F)
// Buffer: 50 reserved opcodes for future social & governance features
// ============================================================================

struct (0x000010f1) ActVote {
    transferRecipient: address
}

struct (0x000010f2) ActUnvote {
    transferRecipient: address
}

struct (0x000010f3) VotingAction {
    positiveVote: bool = true
    count: uint4 = 10
    sender: address
    country: uint16 = 0
}

struct (0x000010f4) ActDispatchAuthorityAction {
    transferRecipient: address
}

struct (0x000010f5) AuthorityAction {
    sender: address
}

struct (0x000010f6) SetStatus {
    sender: address
    status: uint2
}

struct (0x000010f7) TransferByAuthority {
    amount: coins
    receiver: address
    @abi.clientType(PayloadInline | PayloadInRef)
    forwardPayload: ForwardPayloadRemainder
}

struct (0x000010fa) ActSubmitProposal {
    queryId: uint64
    daoAddress: address
    targetMsg: cell
}

struct (0x000010fb) SubmitProposal {
    queryId: uint64
    proposerOwner: address
    targetMsg: cell
}

struct (0x000010fc) ActVoteProposal {
    queryId: uint64
    daoAddress: address
    proposalId: uint64
    vote: bool
}

struct (0x000010fd) VoteProposalChild {
    queryId: uint64
    proposalId: uint64
    voterOwner: address
    vote: bool
}

struct (0x000010fe) VoteProposal {
    queryId: uint64
    proposalId: uint64
    voterOwner: address
    oldVote: bool?
    newVote: bool
}

struct (0x000010ff) CleanupProposalVotes {
    queryId: uint64
    proposalId: uint64
}

// ============================================================================
// GROUP 5: ECONOMY, ALLOWANCES, & CREDIT (Range: 0x00001140 - 0x0000118F)
// Buffer: 50 reserved opcodes for future financial features
// ============================================================================

struct (0x00001141) ActClaimWeeklyGrant {
    queryId: uint64
    sendExcessesTo: address?
}

struct (0x00001142) TriggerDecay {
    sender: address
}

struct (0x00001143) SetAllowance {
    queryId: uint64
    grantee: address
    amount: coins
}

struct (0x00001144) SpendAllowance {
    queryId: uint64
    amount: coins
    receiver: address
    sendExcessesTo: address?
}

struct (0x00001145) AskGoldCoinsTransfer {
    queryId: uint64
    amount: uint32
    receiver: address
    sendExcessesTo: address?
}

struct (0x00001146) InternalGoldCoinsTransfer {
    queryId: uint64
    amount: uint32
    transferInitiator: address
}

struct (0x00001147) BuyCredit {
    queryId: uint64
    jettonAmount: coins
    transferRecipient: address
    sendExcessesTo: address?
}

struct (0x00001148) Payback {
    queryId: uint64
    amount: coins
    sender: address
}

struct (0x00001149) ActSetPersonalJettonMinter {
    transferRecipient: address
}

struct (0x0000114a) SetCreditNeed {
    queryId: uint64 = 0
    amount: coins
}

struct (0x0000114c) SetMultiplier {
    queryId: uint64 = 0
    multiplier: uint16
}

struct (0x0000114b) RepayDebt {
    queryId: uint64 = 0
    amount: coins
}

struct (0x0000105a) ActCloseAccount {
    queryId: uint64 = 0
}

struct (0x0000105b) AuthorityCloseAccount {
    queryId: uint64 = 0
    target: address
}

// ============================================================================
// GROUP 6: MINI-APPS & EXTENSIONS (Range: 0x00001190 - 0x000011DF)
// Buffer: 50 reserved opcodes for future mini-apps & state extensions
// ============================================================================

struct (0x00001191) ActJoinLottery {}

struct (0x00001192) RequestState {}

struct (0x00001193) ProvideState {
    state: cell
}

struct (0x00001194) CustomPayloadMsg {
    queryId: uint64
}

// Auxiliary data structs
struct IdInfo {
    username: string
    lattitude: string
    longitude: string
    address: address
}

struct CurrentRequest {
    newUpgrade: Upgrade
    timestamp: uint32
}

struct AdminHandoff {
    newAdminAddress: address
    timestamp: uint32
}
