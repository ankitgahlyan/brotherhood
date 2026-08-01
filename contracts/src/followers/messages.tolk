struct (0x00000051) UnFollow {
    queryId: uint64
    follow: bool
    followee: address
}

struct (0x00000052) UnFollowInternal {
    queryId: uint64
    follow: bool
    sender: address
}
