struct FollowingStore {
    follower: address
    followee: address
    mintAmount: coins
}

fun FollowingStore.load(): FollowingStore {
    return FollowingStore.fromCell(contract.getData());
}

fun FollowingStore.save(self) {
    contract.setData(self.toCell());
}
