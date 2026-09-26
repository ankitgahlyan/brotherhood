struct BasePersonalWalletStore {
    owner: address
    deployer: address
    minterAddress: address
    version: uint10 = 0
}

struct PersonalWalletStore {
    jettonBalance: coins = 0
    owner: address
    deployer: address
    minterAddress: address
    version: uint10 = 1
}

struct PersonalStore {
    totalSupply: coins = 0
    fiJettonAddress: address
    adminAddress: address
    metadataUri: cell? = null // null on deploy for deterministic address calculation
    version: uint10 = 1
}

fun PersonalStore.load(): PersonalStore {
    return PersonalStore.fromCell(contract.getData());
}

fun PersonalStore.save(self) {
    contract.setData(self.toCell());
}

fun PersonalWalletStore.load(): PersonalWalletStore {
    return PersonalWalletStore.fromCell(contract.getData());
}

fun PersonalWalletStore.save(self) {
    contract.setData(self.toCell());
}
