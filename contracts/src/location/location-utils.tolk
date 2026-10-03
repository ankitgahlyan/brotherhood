import "@contracts/common/sharding"

struct BaseLocationStore {
    h3Cell: string
    minterAddress: address
    version: uint10 = 0
}

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
    baseLocationCode: cell,
): AutoDeployAddress {
    val store: BaseLocationStore = {
        h3Cell,
        minterAddress,
        version: 0,
    };
    return {
        workchain: MY_WORKCHAIN,
        stateInit: { code: baseLocationCode, data: store.toCell() },
        toShard: { fixedPrefixLength: SHARD_DEPTH, closeTo: minterAddress },
    };
}
