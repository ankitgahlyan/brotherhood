import "@contracts/common/sharding"

import "store"

fun calcDeployHolding(
    payer: address,
    payee: address,
    holdingCodeLibRef: cell,
    amount: coins,
    queryId: uint64,
): AutoDeployAddress {
    val store: HoldingStore = {
        payer,
        payee,
        amount,
        queryId,
        createdAt: 0,
    };
    return {
        stateInit: { code: holdingCodeLibRef, data: store.toCell() },
        toShard: { fixedPrefixLength: SHARD_DEPTH, closeTo: payer },
    };
}

fun calculateHoldingAddress(
    payer: address,
    payee: address,
    holdingCodeLibRef: cell,
    amount: coins,
    queryId: uint64,
): address {
    return calcDeployHolding(
        payer,
        payee,
        holdingCodeLibRef,
        amount,
        queryId,
    ).calculateAddress();
}
