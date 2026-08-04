struct PriWalletStore {
    jettonBalance: coins = 0
    owner: address
    deployer: address
    minterAddress: address
}

struct PriStore {
    // not upgradable
    totalSupply: coins = 0
    // creditRequired: coins = 0
    // fiFields: Cell<FiFields>
    fiJettonAddress: address
    adminAddress: address
    readonly jettonWalletCode: cell
    metadataUri: cell? = null //Cell<SnakeString>? // to deploy directly from MINT wallet & calc minter addr onchain
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
