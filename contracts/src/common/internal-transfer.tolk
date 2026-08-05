import "@contracts/common/messages"

// Builds a serialized `InternalTransferStep` body (0x178d4519).
// Centralizes the internal-transfer payload layout so every wallet, minter,
// and test site shares one construction path instead of hand-nesting fields.
fun makeInternalTransferStep(
    queryId: uint64,
    jettonAmount: coins,
    transferInitiator: address,
    sendExcessesTo: address? = null,
    forwardTonAmount: coins = 0,
    forwardPayload: slice? = null,
    version: uint10 = 0,
    transferredAsCredit: bool = false,
): Cell<InternalTransferStep> {
    val payload = forwardPayload != null ? forwardPayload : createEmptySlice();
    return InternalTransferStep {
        queryId,
        jettonAmount,
        version,
        transferredAsCredit,
        transferInitiator,
        sendExcessesTo,
        forwardTonAmount,
        forwardPayload: payload,
    }.toCell();
}
