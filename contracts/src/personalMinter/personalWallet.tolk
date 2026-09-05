import "@contracts/common/errors"
import "@contracts/common/internal-transfer"
import "@contracts/common/messages"
import "@contracts/common/sharding"

import "@contracts/common/utils"

import "fees-management"
import "jetton-utils"
import "storage"

type AllowedMsgToPersonalWallet =
    | AskToTransfer
    | AskToBurn
    | InternalTransferStep
    | Destroy

type BounceOpToHandle = InternalTransferStep | NotifyMinter

contract PersonalWallet {
    author: "zeta"
    version: "0.1.0"
    description: "Jetton wallet contract for personal token"
    storage: PersonalWalletStore
    incomingMessages: AllowedMsgToPersonalWallet
}

fun onBouncedMessage(in: InMessageBounced) {
    in.bouncedBody.skipBouncedPrefix();

    val msg = lazy BounceOpToHandle.fromSlice(in.bouncedBody);
    val restoreAmount = match (msg) {
        InternalTransferStep => msg.jettonAmount, // safe to fetch jettonAmount, because
        NotifyMinter => msg.jettonAmount,         // it's in the beginning of a message
    };

    var storage = lazy PersonalWalletStore.load();
    storage.jettonBalance += restoreAmount;
    storage.save();
}

fun onInternalMessage(in: InMessage) {
    val msg = lazy AllowedMsgToPersonalWallet.fromSlice(in.body);
    var storage = lazy PersonalWalletStore.load();
    match (msg) {
        InternalTransferStep => {
            if (in.senderAddress != storage.minterAddress) {
                assert (
                    in.senderAddress == autoAddrPriWallet(msg.transferInitiator).calculateAddress()
                ) throw Errors.NotValidWallet;
            }

            storage.jettonBalance += msg.jettonAmount;

            if (msg.forwardTonAmount != 0) {
                val notifyOwnerMsg = createMessage({
                    bounce: BounceMode.NoBounce,
                    dest: storage.owner,
                    value: msg.forwardTonAmount,
                    body: TransferNotificationForRecipient {
                        queryId: msg.queryId,
                        jettonAmount: msg.jettonAmount,
                        transferInitiator: msg.transferInitiator,
                        forwardPayload: msg.forwardPayload,
                    },
                });
                notifyOwnerMsg.send(
                    SEND_MODE_PAY_FEES_SEPARATELY | SEND_MODE_IGNORE_ERRORS,
                );
            }

            if (msg.sendExcessesTo != null) {
                reserveForPersonalWalletBalance(in.valueCoins);

                val excessesMsg = createMessage({
                    bounce: BounceMode.NoBounce,
                    dest: msg.sendExcessesTo,
                    value: 0,
                    body: ReturnExcessesBack { queryId: msg.queryId },
                });
                // safety:
                excessesMsg.send(SEND_MODE_CARRY_ALL_BALANCE | SEND_MODE_IGNORE_ERRORS);
            }
        }

        AskToTransfer => {
            msg.forwardPayload.checkIsCorrectTlbEither();
            assert (
                msg.transferRecipient.getWorkchain() == MY_WORKCHAIN
            ) throw Errors.WrongWorkchain;
            checkAmountIsEnoughToPersonalTransfer(
                in.valueCoins,
                msg.forwardTonAmount,
                in.originalForwardFee,
            );

            assert (in.senderAddress == storage.owner) throw Errors.NotOwner;
            assert (storage.jettonBalance >= msg.jettonAmount) throw Errors.BalanceError;
            storage.jettonBalance -= msg.jettonAmount;

            val deployMsg = createMessage({
                bounce: BounceMode.Only256BitsOfBody,
                dest: autoAddrPriWallet(msg.transferRecipient),
                value: 0,
                body: makeInternalTransferStep(
                    msg.queryId,
                    msg.jettonAmount,
                    storage.owner,
                    msg.sendExcessesTo,
                    msg.forwardTonAmount,
                    msg.forwardPayload,
                ),
            });
            deployMsg.send(
                SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
            );
        }

        AskToBurn => {
            assert (in.valueCoins >= grams("0.5")) throw Errors.NotEnoughGas;
            checkAmountIsEnoughToPersonalBurn(in.valueCoins);
            assert (in.senderAddress == storage.owner) throw Errors.NotOwner;
            assert (storage.jettonBalance >= msg.jettonAmount) throw Errors.BalanceError;
            storage.jettonBalance -= msg.jettonAmount;

            val notifyMinterMsg = createMessage({
                bounce: BounceMode.Only256BitsOfBody,
                dest: storage.minterAddress,
                value: 0,
                body: NotifyMinter {
                    queryId: msg.queryId,
                    jettonAmount: msg.jettonAmount,
                    burnInitiator: storage.owner,
                    sendExcessesTo: msg.sendExcessesTo,
                },
            });
            notifyMinterMsg.send(
                SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
            );
        }

        Destroy => {
            assert (
                (in.senderAddress == storage.owner) | (in.senderAddress == storage.deployer)
            ) throw Errors.IncorrectSender;
            destroyContract(in.senderAddress);
        }

        else => {
            // invalid input; a typical reaction is:
            // ignore empty messages, "wrong opcode" if not
            assert (in.body.isEmpty()) throw 0xFFFF;
        }
    }
    storage.save();
}

get fun get_personal_wallet_state(): PersonalWalletStore {
    return PersonalWalletStore.load();
}

get fun get_wallet_data(): JettonWalletDataReply {
    val storage = lazy PersonalWalletStore.load();

    return {
        jettonBalance: storage.jettonBalance,
        ownerAddress: storage.owner,
        minterAddress: storage.minterAddress,
        jettonWalletCode: contract.getCode(),
    };
}
