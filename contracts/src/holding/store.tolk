struct HoldingStore {
    payer: address
    payee: address
    amount: coins
    createdAt: uint32
}

fun HoldingStore.load(): HoldingStore {
    return HoldingStore.fromCell(contract.getData());
}

fun HoldingStore.save(self): void {
    contract.setData(self.toCell());
}
