// ============================================================================
// MESSAGE OPCODES (Group 6 Mini-Apps Range)
// ============================================================================

struct (0x00001198) EnterLottery {
    sender: address
    amount: coins
}

struct (0x00001199) LotteryWin {
    entryAmount: coins
    amt: coins
    winner: address
}

struct (0x0000119a) DrawWinner {
    queryId: uint64
}
