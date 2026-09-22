import "@contracts/common/errors"

import "consts"
import "messages"
import "store"

type HoldingAllowedMsg =
    | ClaimDeferredPayment
    | CancelDeferredPayment

contract Holding {
    author: "brotherhood"
    version: "0.1.0"
    description: "disposable holding contract for deferred payments"
    storage: HoldingStore
    incomingMessages: HoldingAllowedMsg
}

fun onBouncedMessage(_in: InMessageBounced) {}

fun onInternalMessage(in: InMessage) {
    var store = lazy HoldingStore.load();

    if (in.body.isEmpty()) {
        if (store.createdAt == 0) {
            store.createdAt = blockchain.now();
            store.save();
        }
        return;
    }

    val msg = lazy HoldingAllowedMsg.fromSlice(in.body);

    match (msg) {
        ClaimDeferredPayment => {
            assert (in.senderAddress == store.payee) throw Errors.IncorrectSender;
            assert (
                store.createdAt > 0 &&
                blockchain.now() >= store.createdAt + HOLDING_CHALLENGE_DURATION
            ) throw Errors.WaitMore;

            val transferMsg = createMessage({
                bounce: BounceMode.NoBounce,
                dest: store.payee,
                value: 0,
                body: AcceptDeferredTransfer {
                    queryId: store.queryId,
                    payer: store.payer,
                    payee: store.payee,
                    amount: store.amount,
                },
            });
            // SAFETY: send all remaining balance and tokens to payee and destroy contract
            transferMsg.send(SEND_MODE_CARRY_ALL_BALANCE | SEND_MODE_DESTROY);
        }

        CancelDeferredPayment => {
            assert (in.senderAddress == store.payer) throw Errors.IncorrectSender;
            assert (
                store.createdAt == 0 || blockchain.now() <
                store.createdAt + HOLDING_CHALLENGE_DURATION
            ) throw Errors.WaitMore;

            // Dispatch penalty message to payee account (1x burn fine)
            val penaltyMsg = createMessage({
                bounce: BounceMode.NoBounce,
                dest: store.payee,
                value: grams("0.05"),
                body: PenalizeDeferredRequester {
                    queryId: store.queryId,
                    payer: store.payer,
                    amount: store.amount,
                },
            });
            penaltyMsg.send(SEND_MODE_PAY_FEES_SEPARATELY | SEND_MODE_IGNORE_ERRORS);

            // Refund principal back to payer and destroy contract
            val refundMsg = createMessage({
                bounce: BounceMode.NoBounce,
                dest: store.payer,
                value: 0,
                body: AcceptDeferredTransfer {
                    queryId: store.queryId,
                    payer: store.payer,
                    payee: store.payee,
                    amount: store.amount,
                },
            });
            // SAFETY: refund remaining balance to payer and destroy holding contract
            refundMsg.send(SEND_MODE_CARRY_ALL_BALANCE | SEND_MODE_DESTROY);
        }

        else => {
            assert (in.body.isEmpty()) throw Errors.InvalidOp;
        }
    }
}

get fun get_holding_data(): HoldingStore {
    return HoldingStore.load();
}
