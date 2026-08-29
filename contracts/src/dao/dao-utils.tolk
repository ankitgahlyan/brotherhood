import "@contracts/dao/storage"

fun calcDeployDaoProxy(
    fiAddress: address,
    daoProxyCode: cell,
): AutoDeployAddress {
    val store: DaoProxyStore = { fiAddress };
    return { stateInit: { code: daoProxyCode, data: store.toCell() }, toShard: null };
}

fun calcDeployPoll(
    proposalId: uint64,
    proposerOwner: address,
    daoProxyAddress: address,
    fiAddress: address,
    targetMsg: cell,
    expiresAt: uint32,
    pollCode: cell,
): AutoDeployAddress {
    val store: PollStore = {
        proposalId,
        proposerOwner,
        daoProxyAddress,
        fiAddress,
        targetMsg,
        yesVotes: 0,
        noVotes: 0,
        totalAccounts: 0,
        expiresAt,
        executed: false,
    };
    return { stateInit: { code: pollCode, data: store.toCell() }, toShard: null };
}

fun calcDeployVoter(
    voterOwner: address,
    pollAddress: address,
    voterCode: cell,
): AutoDeployAddress {
    val store: VoterStore = {
        voterOwner,
        pollAddress,
        voted: false,
        vote: false,
    };
    return { stateInit: { code: voterCode, data: store.toCell() }, toShard: null };
}
