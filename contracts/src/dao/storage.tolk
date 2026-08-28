struct DaoProxyStore {
    fiAddress: address
}

fun DaoProxyStore.load(): DaoProxyStore {
    return DaoProxyStore.fromCell(contract.getData());
}

fun DaoProxyStore.save(self): void {
    contract.setData(self.toCell());
}

struct PollStore {
    proposalId: uint64
    proposerOwner: address
    daoProxyAddress: address
    fiAddress: address
    walletLibRef: cell
    targetMsg: cell
    yesVotes: uint33 = 0
    noVotes: uint33 = 0
    totalAccounts: uint33 = 0
    expiresAt: uint32 = 0
    executed: bool = false
}

fun PollStore.load(): PollStore {
    return PollStore.fromCell(contract.getData());
}

fun PollStore.save(self): void {
    contract.setData(self.toCell());
}

struct VoterStore {
    voterOwner: address
    pollAddress: address
    voted: bool = false
    vote: bool = false
}

fun VoterStore.load(): VoterStore {
    return VoterStore.fromCell(contract.getData());
}

fun VoterStore.save(self): void {
    contract.setData(self.toCell());
}
