import "@contracts/common/sharding"
import "@contracts/followers/store"

fun calcDeployFollowing(
    follower: address,
    followee: address,
    baseFollowingCode: cell,
    _mintAmount: coins = grams("1000"),
): AutoDeployAddress {
    val store: BaseFollowingStore = {
        follower,
        followee,
        version: 0,
    };
    return {
        workchain: MY_WORKCHAIN,
        stateInit: { code: baseFollowingCode, data: store.toCell() },
        toShard: { fixedPrefixLength: SHARD_DEPTH, closeTo: follower },
    };
}
