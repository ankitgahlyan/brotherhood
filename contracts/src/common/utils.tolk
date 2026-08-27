import "messages"

// SnakeString describes a (potentially long) string inside a cell;
// short strings are stored as-is, like "my-picture.png";
// long strings are nested refs, like "xxxx".ref("yyyy".ref("zzzz"))
type SnakeString = slice

fun SnakeString.unpackFromSlice(mutate s: slice): slice {
    // obviously, SnakeString can be only the last: it's just "the remainder";
    // for correctness, it's better to validate it has no more refs:
    // assert (s.remainingRefsCount() <= 1) throw 5;
    // but since here we're matching the original FunC implementation, leave no checks
    val snakeRemainder = s;
    s = createEmptySlice(); // no more left to read
    return snakeRemainder;
}

fun SnakeString.packToBuilder(self, mutate b: builder) {
    b.storeSlice(self);
}

@inline
fun destroyContract(dest: address) {
    val outMsg = createMessage({
        bounce: BounceMode.NoBounce,
        value: 0,
        dest,
        body: ReturnExcessesBack { queryId: 0 },
    });
    // SAFETY: Sends entire balance to dest and destroys the contract on finalization
    outMsg.send(SEND_MODE_CARRY_ALL_BALANCE | SEND_MODE_DESTROY);
}
