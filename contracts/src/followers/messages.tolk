struct (0x00001205) Follow {
    queryId: uint64
    followee: address
}

struct (0x00001200) Unfollow {
    queryId: uint64
    initiator: address
    followee: address
}

struct (0x00001201) InitFollow {
    queryId: uint64
    followerOwner: address
}

struct (0x00001202) FollowNotification {
    queryId: uint64
    follower: address
    followerOwner: address
    mintAmount: coins
}

struct (0x00001203) UnfollowNotification {
    queryId: uint64
    follower: address
    followerOwner: address
    burnAmount: coins
}

struct (0x00001204) SettleDeath {
    queryId: uint64
    deceased: address
}
