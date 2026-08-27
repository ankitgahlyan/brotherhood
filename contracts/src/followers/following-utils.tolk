import "@contracts/common/sharding"
import "@contracts/followers/store"

fun calcDeployFollowing(
    follower: address,
    followee: address,
    followingCodeLibRef: cell,
    mintAmount: coins = ton("1000"),
): AutoDeployAddress {
    val store: FollowingStore = {
        follower,
        followee,
        mintAmount,
        isFollowing: false,
    };
    return {
        stateInit: { code: followingCodeLibRef, data: store.toCell() },
        toShard: { fixedPrefixLength: SHARD_DEPTH, closeTo: follower },
    };
}
