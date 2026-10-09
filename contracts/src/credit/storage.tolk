struct LocationCreditEntry {
    borrowerAddress: address
    amount: coins
    multiplier: uint16
    cutoffDate: uint32
    maturityDate: uint32
}

struct LocationCreditStore {
    h3Cell: string
    proxyAddress: address
    adminAddress: address
    entryCount: uint32 = 0
    entries: map<address, LocationCreditEntry> = []
    version: uint10 = 1
}

fun LocationCreditStore.load(): LocationCreditStore {
    return LocationCreditStore.fromCell(contract.getData());
}

fun LocationCreditStore.save(self): void {
    contract.setData(self.toCell());
}

struct CreditProxyStore {
    adminAddress: address
    fiMinterAddress: address
    locationCreditCode: cell
    version: uint10 = 1
}

fun CreditProxyStore.load(): CreditProxyStore {
    return CreditProxyStore.fromCell(contract.getData());
}

fun CreditProxyStore.save(self): void {
    contract.setData(self.toCell());
}
