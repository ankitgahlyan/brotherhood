struct (0x716a4d21) ClaimDeferredPayment {
    queryId: uint64 = 0
}

struct (0x38b4c81a) CancelDeferredPayment {
    queryId: uint64 = 0
}

struct (0x24d8b9e1) PenalizeDeferredRequester {
    queryId: uint64 = 0
    payer: address
    amount: coins
}

struct (0x19a4f210) DeferredPaymentInitiated {
    queryId: uint64 = 0
    holdingAddress: address
    amount: coins
}

struct (0x49f2b801) PullDeferredFunds {
    queryId: uint64 = 0
    payee: address
    amount: coins
}

struct (0x6a1bc924) RequestDeferredPayment {
    queryId: uint64 = 0
    payer: address
    amount: coins
}

struct (0x7c49e102) ActCancelDeferredPayment {
    queryId: uint64 = 0
    holdingAddress: address
}

struct (0x531b70a2) AcceptDeferredTransfer {
    queryId: uint64 = 0
    payer: address
    payee: address
    amount: coins
}

struct (0x1f84b29c) ActClaimDeferredPayment {
    queryId: uint64 = 0
    holdingAddress: address
}

struct (0x576f30a1) ToggleDeferredPayment {
    queryId: uint64 = 0
    enabled: bool
}
