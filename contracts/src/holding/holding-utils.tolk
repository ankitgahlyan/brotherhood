import "@contracts/common/sharding"

import "store"

fun calcDeployHolding(
    payer: address,
    payee: address,
    holdingCodeLibRef: cell,
    amount: coins,
    createdAt: uint32,
): AutoDeployAddress {
    val store: HoldingStore = {
        payer,
        payee,
        amount,
        createdAt,
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
    createdAt: uint32,
): address {
    return calcDeployHolding(
        payer,
        payee,
        holdingCodeLibRef,
        amount,
        createdAt,
    ).calculateAddress();
}
