struct PriWalletStore {
    jettonBalance: coins = 0
    version: uint10 = 0
    owner: address
    deployer: address
    minterAddress: address
}

struct PriStore {
    totalSupply: coins = 0
    version: uint10 = 0
    walletVersion: uint10 = 0
    fiJettonAddress: address
    adminAddress: address
    jettonWalletCode: cell
    metadataUri: cell? = null
}

fun PriStore.load(): PriStore {
    return PriStore.fromCell(contract.getData());
}

fun PriStore.save(self) {
    contract.setData(self.toCell());
}

fun PriWalletStore.load(): PriWalletStore {
    return PriWalletStore.fromCell(contract.getData());
}

fun PriWalletStore.save(self) {
    contract.setData(self.toCell());
}
