struct Proposal {
    id: uint64
    proposerOwner: address
    targetAddr: address
    targetMsg: cell
    yesVotes: uint33 = 0
    noVotes: uint33 = 0
    expiresAt: uint32 = 0
}

struct DaoStore {
    totalAccounts: uint33 = 0
    proposal: Proposal
}

fun DaoStore.load(): DaoStore {
    return DaoStore.fromCell(contract.getData());
}

fun DaoStore.save(self): void {
    contract.setData(self.toCell());
}

struct DaoVoterStore {
    voterOwner: address
    daoAddress: address
    votes: map<uint64, bool> = []
}

fun DaoVoterStore.load(): DaoVoterStore {
    return DaoVoterStore.fromCell(contract.getData());
}

fun DaoVoterStore.save(self): void {
    contract.setData(self.toCell());
}
