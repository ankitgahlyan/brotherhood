// ============================================================================
// STORAGE
// ============================================================================

struct LotteryStorage {
    owner: address                 // minter
    entryAmount: coins
    participants: map<address, ()> // todo: fixme max participants
    participantCount: int32 = 0
    revealDeadline: int32 = 0
    prizePool: coins = 0
    randomSeed: uint256 = 0
}

fun LotteryStorage.load(): LotteryStorage {
    return LotteryStorage.fromCell(contract.getData());
}

fun LotteryStorage.save(self) {
    contract.setData(self.toCell());
}
