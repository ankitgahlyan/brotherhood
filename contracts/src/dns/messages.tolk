import "storage"

type TransferForwardPayload = RemainingBitsAndRefs

struct (0x370fec51) FillUp {
    queryId: uint64
}

struct (0x557cea20) OutbidNotification {
    queryId: uint64
}

struct (0x05138d91) OwnershipAssigned {
    queryId: uint64
    oldOwnerAddress: address?
    payload: TransferForwardPayload
}

struct (0xd53276db) Excesses {
    queryId: uint64
}

struct (0x2fcb26a2) GetStaticData {
    queryId: uint64
}

struct (0x8b771735) ReportStaticData {
    queryId: uint64
    itemIndex: uint256
    collectionAddress: address
}

struct (0xba93) DnsNextResolver {
    resolver: address
}

struct TransferOwnershipData {
    newOwnerAddress: address
    responseDestination: address?
    customPayload: cell?
    forwardAmount: coins
    forwardPayload: TransferForwardPayload
}

struct (0x5fcc3d14) TransferOwnership {
    queryId: uint64
    transferData: TransferOwnershipData
}

struct (0x1a0b9d51) EditContent {
    queryId: uint64
    newContent: Cell<DnsRecords>
}

struct (0x4eb1f0f9) ChangeDnsRecord {
    queryId: uint64
    key: uint256
    // func impl uses imperative parsing here
    // value: cell?
    value: RemainingBitsAndRefs
}

struct (0x44beae41) ProcessGovernanceDecision {
    queryId: uint64
}

struct (0x4ed14b65) DnsRecordRelease {
    queryId: uint64
}

struct (0x59a3c821) WithdrawFees {
    queryId: uint64
    amount: coins
    recipient: address
}

struct (0x2c159bf4) MintDomainFor {
    queryId: uint64
    targetOwner: address
    payload: RemainingBitsAndRefs
}

struct (0x646e7375) UpgradeDnsItem {
    queryId: uint64 = 0
    itemAddress: address
    code: cell
    additionalData: cell? = null
}

struct (0x646e7364) DestroyContract {
    queryId: uint64 = 0
    recipient: address? = null
}

struct (0x646e7378) DestroyDnsItem {
    queryId: uint64 = 0
    itemAddress: address
    recipient: address? = null
}

struct ItemInitData {
    fromAddress: address
    domain: Cell<RemainingBitsAndRefs>
    isInstant: bool = false
    fiAmount: coins = 0
    fiMinterAddress: address? = null
}

struct (0x00) GovernanceTransfer {
    transferData: TransferOwnershipData
}

struct (0x01) GovernanceRelease {}

struct (0x00000000) Op0WithQuery {
    queryId: uint64
}

struct MessageHeader {
    op: uint32
    queryId: uint64
    rest: RemainingBitsAndRefs
}

struct (0x62696430) DnsBidRequest {
    queryId: uint64
    domain: Cell<RemainingBitsAndRefs>
    fiBidAmount: coins
    collectionAddress: address
}

struct (0x62696431) BidBroDomain {
    queryId: uint64
    bidder: address
    fiAmount: coins
    domain: Cell<RemainingBitsAndRefs>
    collectionAddress: address
}

struct (0x6f757462) DnsOutbidNotification {
    queryId: uint64
    outbidAddress: address
    fiAmount: coins
    domain: Cell<RemainingBitsAndRefs>
}

struct (0x66696e61) FinalizeAuction {
    queryId: uint64
}

struct (0x6275726e) DnsAuctionFinalized {
    queryId: uint64
    winner: address
    winningFiAmount: coins
    domain: Cell<RemainingBitsAndRefs>
}

struct (0x72656e30) DnsRenewRequest {
    queryId: uint64
    itemAddress: address
    fiAmount: coins
}

struct (0x72656e65) RenewBroDomain {
    queryId: uint64
    renewer: address
    fiAmount: coins
    itemAddress: address
}
