type ForwardPayloadRemainder = RemainingBitsAndRefs

struct (0b0) PayloadInline {
    value: RemainingBitsAndRefs
}

struct (0b1) PayloadInRef {
    value: Cell<RemainingBitsAndRefs>
}

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
    transferInitiator: address // todo: need fix?: is null when minting (not initiated by another wallet)
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

struct (0x2c76b973) RequestWalletAddress {
    queryId: uint64
    owner: address
    includeOwnerAddress: bool
}

struct (0xd1735400) ResponseWalletAddress {
    queryId: uint64
    jettonWalletAddress: address?
    owner: Cell<address>?
}

struct (0x642b7d07) MintNewJettons {
    queryId: uint64
    mintRecipient: address
    tonAmount: coins
    internalTransferMsg: Cell<InternalTransferStep>
}

struct (0x6501f354) ChangeMinterAdmin {
    queryId: uint64
    newAdminAddress: address
}

struct (0xfb88e119) ClaimMinterAdmin {
    queryId: uint64
}

struct (0x7431f221) DropMinterAdmin {
    queryId: uint64
}

struct (0x2508d66a) Upgrade {
    walletUpgrade: bool = true
    walletVersion: uint10
    sender: address
    newData: cell? = null
    newCode: cell? = null
}

struct (0xcb862902) ChangeMinterMetadata {
    queryId: uint64
    newMetadata: cell // SnakeString
}

struct (0xd372158c) TopUpTons

// "forward payload" is TL/B `(Either Cell ^Cell)`;
// we want to test, that if ^Cell, no other data exists in a slice
fun ForwardPayloadRemainder.checkIsCorrectTlbEither(self) {
    var mutableCopy = self;
    if (mutableCopy.loadMaybeRef() != null) {
        // throw "cell underflow" if there is data besides a ref
        mutableCopy.assertEnd();
    }
}

// msg for fossFi contracts ================================================================

struct (0x00000001) InternalInvite {
    queryId: uint64 = 0
    version: uint10
    // id: IdInfo? = null
    sender: address
    invitor: address
    currentWalletCode: cell
    currentStorage: cell?
    // @abi.clientType(PayloadInline | PayloadInRef)
    id: string
}

struct (0x00000002) InternalDeActivate {}

struct (0x00000003) InternalInviteApproval {
    sender: address
}

struct (0x00000004) InformMinterInviteInternal {
    queryId: uint64
    sender: address
    invitor: address
    // @abi.clientType(PayloadInline | PayloadInRef)
    id: string
}

struct (0x00000005) AuthorityAction {
    sender: address
}

struct (0x00000006) SetStatus {
    sender: address
    status: uint2
}

struct (0x00000007) TransferByAuthority {
    amount: coins
    receiver: address
    @abi.clientType(PayloadInline | PayloadInRef)
    forwardPayload: ForwardPayloadRemainder // todo: null?
}

struct (0x00000008) VotingAction {
    positiveVote: bool = true
    count: uint4 = 10
    sender: address
}

struct (0x00000009) Payback {
    queryId: uint64
    amount: coins
    sender: address
}

struct (0x00000010) RequestUpgradeCode {
    sender: address
    version: uint10
}

struct (0x00000011) ApproveUpgrade {}

struct (0x00000012) RejectUpgrade {}

struct (0x00000013) HotUpgrade {
    additionalData: cell?
    code: cell
}

struct (0x00000014) Destroy {}

struct (0x00000015) CustomPayloadMsg {
    queryId: uint64
}

struct (0x00000016) OthersActions {
    queryId: uint64
    jettonAmount: coins
    transferRecipient: address
    sendExcessesTo: address?
    customPayload: cell?
    forwardTonAmount: coins
    // @abi.clientType(PayloadInline | PayloadInRef)
    forwardPayload: string
}

struct (0x00000017) ChangeId {
    newId: string
}

struct (0x00000018) RequestState {}

struct (0x00000019) ProvideState {
    state: cell
}

struct (0x0000001a) SetAllowance {
    queryId: uint64
    grantee: address
    amount: coins
}

struct (0x0000001b) SpendAllowance {
    queryId: uint64
    amount: coins
    receiver: address
    sendExcessesTo: address?
}

struct (0x0000001c) AskGoldCoinsTransfer {
    queryId: uint64
    amount: uint32
    receiver: address
    sendExcessesTo: address?
}

struct (0x0000001d) InternalGoldCoinsTransfer {
    queryId: uint64
    amount: uint32
    transferInitiator: address
}

struct (0x0000001e) TriggerDecay {
    sender: address
}

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