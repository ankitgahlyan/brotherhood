struct BasePersonalWalletStore {
    owner: address
    deployer: address
    minterAddress: address
    version: uint10 = 0
}

struct BasePersonalMinterStore {
    fiJettonAddress: address
    adminAddress: address
    version: uint10 = 0
}

struct PersonalCreditInfo {
    creditNeed: coins = 0
    creditCutoff: uint32 = 0
    creditMaturity: uint32 = 0
    multiplier: uint16 = 1000
    totalCreditReceived: coins = 0
    totalPaybackSettled: coins = 0
    totalPaybackShortfall: coins = 0
}

struct PersonalWalletStore {
    jettonBalance: coins = 0
    owner: address
    deployer: address
    minterAddress: address
    version: uint10 = 1
    credit: Cell<PersonalCreditInfo>
}

struct PersonalCodes {
    latestPersonalWalletCode: cell
}

struct PersonalStore {
    totalSupply: coins = 0
    fiJettonAddress: address
    adminAddress: address
    metadataUri: cell? = null // null on deploy for deterministic address calculation
    version: uint10 = 1
    codes: PersonalCodes
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
