struct UnFollowStore {
    admin: address
    follow: bool
    follower: address
    followee: address
}

fun UnFollowStore.load(): UnFollowStore {
    return UnFollowStore.fromCell(contract.getData());
}

fun UnFollowStore.save(self) {
    contract.setData(self.toCell());
}
