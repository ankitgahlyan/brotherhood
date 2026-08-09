struct (0x000010f8) UnFollow {
    queryId: uint64
    follow: bool
    followee: address
}

struct (0x000010f9) UnFollowInternal {
    queryId: uint64
    follow: bool
    sender: address
}
