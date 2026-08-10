struct Proposal {
    id: uint64
    proposerOwner: address
    targetMsg: cell
    yesVotes: uint33 = 0
    noVotes: uint33 = 0
    expiresAt: uint32 = 0
}

struct DaoStore {
    totalAccounts: uint33 = 0
    fiAddress: address
    proposalCount: uint64 = 0
    proposals: map<uint64, Proposal> = []
}

fun DaoStore.load(): DaoStore {
    return DaoStore.fromCell(contract.getData());
}

fun DaoStore.save(self): void {
    contract.setData(self.toCell());
}
