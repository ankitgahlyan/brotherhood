import "@contracts/dao/storage"

fun calcDeployDaoVoter(
    voterOwner: address,
    daoAddress: address,
    daoVoterCode: cell,
): AutoDeployAddress {
    val store: DaoVoterStore = {
        voterOwner,
        daoAddress,
        votes: [],
    };
    return { stateInit: { code: daoVoterCode, data: store.toCell() }, toShard: null };
}

fun calcDeployDao(
    proposal: Proposal,
    daoCode: cell,
): AutoDeployAddress {
    val store: DaoStore = { proposal };
    return { stateInit: { code: daoCode, data: store.toCell() }, toShard: null };
}
