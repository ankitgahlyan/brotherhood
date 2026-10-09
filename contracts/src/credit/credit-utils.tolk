import "@contracts/common/sharding"

import "storage"

fun calcDeployLocationCredit(
    h3Cell: string,
    proxyAddress: address,
    adminAddress: address,
    locationCreditCode: cell,
): AutoDeployAddress {
    val store: LocationCreditStore = {
        h3Cell,
        proxyAddress,
        adminAddress,
        entryCount: 0,
        entries: [],
        version: 1,
    };
    return {
        workchain: MY_WORKCHAIN,
        stateInit: { code: locationCreditCode, data: store.toCell() },
        toShard: { fixedPrefixLength: SHARD_DEPTH, closeTo: proxyAddress },
    };
}
