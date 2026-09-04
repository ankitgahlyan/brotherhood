struct PersonalWalletStore {
    jettonBalance: coins = 0
    owner: address
    deployer: address
    minterAddress: address
}

struct PersonalStore {
    totalSupply: coins = 0
    fiJettonAddress: address
    adminAddress: address
    metadataUri: cell // for on-chain deployment or use default
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
