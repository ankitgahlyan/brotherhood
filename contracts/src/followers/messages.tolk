struct (0x00001205) Follow {
    queryId: uint64
    followee: address
}

struct (0x00001200) Unfollow {
    queryId: uint64
    initiator: address
    followee: address
}

struct (0x00001206) RequestFollow {
    queryId: uint64
    followerOwner: address
    mintAmount: coins
}

struct (0x00001207) RequestUnfollow {
    queryId: uint64
    initiator: address
    followerOwner: address
    burnAmount: coins
}

struct (0x00001201) InitFollow {
    queryId: uint64
    followerOwner: address
}

struct (0x00001204) SettleDeath {
    queryId: uint64
    deceased: address
}

struct (0x00001208) FollowRevertedNotification {
    queryId: uint64
    reason: uint16
    followerOwner: address
}

struct (0x00001209) UnfollowRevertedNotification {
    queryId: uint64
    reason: uint16
    followerOwner: address
}

struct (0x00001201) BouncedInitFollow {
    queryId: uint64
}

struct (0x00001200) BouncedUnfollow {
    queryId: uint64
}
