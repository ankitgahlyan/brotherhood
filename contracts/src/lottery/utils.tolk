// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Select winner based on random seed
fun selectWinner(seed: uint256, participants: map<address, ()>, count: int32): address {
    // Use the seed to select an index
    val winnerIndex = seed % count;

    var currentIndex: int32 = 0;
    var entry = participants.findFirst();

    while (entry.isFound) {
        if (currentIndex == winnerIndex) {
            return entry.getKey();
        }
        currentIndex += 1;
        entry = participants.iterateNext(entry);
    }

    // Fallback (should never reach here)
    throw 999;
}
