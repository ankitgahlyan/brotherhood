import "@contracts/common/sharding"

struct LocationStore {
    h3Cell: string
    minterAddress: address
    memberCount: uint32 = 0
    members: map<address, bool> = []
    version: uint10 = 0
}

fun LocationStore.load(): LocationStore {
    return LocationStore.fromCell(contract.getData());
}

fun LocationStore.save(self): void {
    contract.setData(self.toCell());
}

fun calcDeployLocation(
    h3Cell: string,
    minterAddress: address,
    locationCodeLibRef: cell,
): AutoDeployAddress {
    val store: LocationStore = {
        h3Cell,
        minterAddress,
        memberCount: 0,
        members: [],
        version: 0,
    };
    return {
        stateInit: { code: locationCodeLibRef, data: store.toCell() },
        toShard: { fixedPrefixLength: SHARD_DEPTH, closeTo: minterAddress },
    };
}
