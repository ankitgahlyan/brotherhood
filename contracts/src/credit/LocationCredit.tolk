import "@stdlib/tvm-lowlevel"

import "@contracts/common/errors"
import "@contracts/common/messages"
import "@contracts/common/utils"
import "@contracts/credit/messages"
import "@contracts/credit/storage"

import "fees-management"

type AllowedMessageToLocationCredit =
    | AddLocationCreditEntry
    | RemoveLocationCreditEntry
    | HotUpgrade
    | Destroy

contract LocationCredit {
    author: "zeta"
    version: "0.1.0"
    description: "Location Credit child contract indexing credit requests for a specific H3 cell"
    storage: LocationCreditStore
    incomingMessages: AllowedMessageToLocationCredit
}

fun onInternalMessage(in: InMessage): void {
    if (in.body.isEmpty()) {
        return;
    }
    val msg = lazy AllowedMessageToLocationCredit.fromSlice(in.body);
    var store = lazy LocationCreditStore.load();

    match (msg) {
        AddLocationCreditEntry => {
            assert (in.senderAddress == store.proxyAddress) throw Errors.IncorrectSender;
            val existing = store.entries.get(msg.tokenWalletAddress);
            if (!existing.isFound) {
                store.entryCount += 1;
            }
            val terms = msg.terms.load();
            store
                .entries
                .set(
                    msg.tokenWalletAddress,
                    {
                        borrowerAddress: msg.borrowerAddress,
                        amount: terms.amount,
                        multiplier: terms.multiplier,
                        cutoffDate: terms.cutoffDate,
                        maturityDate: terms.maturityDate,
                    },
                );
            reserveForLocationCreditBalance(in.valueCoins);
            store.save();

            if (msg.sendExcessesTo != null) {
                val retMsg = createMessage({
                    bounce: BounceMode.NoBounce,
                    dest: msg.sendExcessesTo,
                    value: 0,
                    body: ReturnExcessesBack { queryId: msg.queryId },
                });
                retMsg.send(
                    SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_IGNORE_ERRORS,
                );
            }
        }

        RemoveLocationCreditEntry => {
            assert (in.senderAddress == store.proxyAddress) throw Errors.IncorrectSender;
            val existing = store.entries.get(msg.tokenWalletAddress);
            if (existing.isFound) {
                store.entries.delete(msg.tokenWalletAddress);
                if (store.entryCount > 0) {
                    store.entryCount -= 1;
                }
                reserveForLocationCreditBalance(in.valueCoins);
                store.save();
            }

            if (msg.sendExcessesTo != null) {
                val retMsg = createMessage({
                    bounce: BounceMode.NoBounce,
                    dest: msg.sendExcessesTo,
                    value: 0,
                    body: ReturnExcessesBack { queryId: msg.queryId },
                });
                retMsg.send(
                    SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_IGNORE_ERRORS,
                );
            }
        }

        HotUpgrade => {
            assert (in.senderAddress == store.adminAddress) throw Errors.NotOwner;
            contract.setCodePostponed(msg.code);
            // safety
            setTvmRegisterC3(transformSliceToContinuation(msg.code.beginParse()));
            if (msg.additionalData != null) {
                contract.setData(msg.additionalData);
            }
            return;
        }

        Destroy => {
            assert (in.senderAddress == store.adminAddress) throw Errors.NotOwner;
            destroyContract(in.senderAddress);
        }

        else => {
            assert (in.body.isEmpty()) throw 0xFFFF;
        }
    }
}

get fun getState(): LocationCreditStore {
    return LocationCreditStore.load();
}
