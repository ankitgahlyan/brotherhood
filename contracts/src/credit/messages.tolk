struct LocationCreditTerms {
    amount: coins
    multiplier: uint16
    cutoffDate: uint32
    maturityDate: uint32
}

struct CreditTokenInfo {
    tokenMinter: address? = null
    deployer: address? = null
}

struct CreditDelistPayload {
    proxyAddress: address
    h3Cell: string
}

struct (0x00001160) CreditProxySetNeed {
    queryId: uint64
    owner: address
    h3Cell: string
    terms: Cell<LocationCreditTerms>
    tokenInfo: Cell<CreditTokenInfo>? = null
}

struct (0x00001161) CreditProxyRemoveNeed {
    queryId: uint64
    owner: address
    h3Cell: string
    tokenInfo: Cell<CreditTokenInfo>? = null
}

struct (0x00001162) AddLocationCreditEntry {
    queryId: uint64
    tokenWalletAddress: address
    borrowerAddress: address
    terms: Cell<LocationCreditTerms>
    sendExcessesTo: address? = null
}

struct (0x00001163) RemoveLocationCreditEntry {
    queryId: uint64
    tokenWalletAddress: address
    sendExcessesTo: address? = null
}
