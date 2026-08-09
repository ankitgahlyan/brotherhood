import "@stdlib/tvm-lowlevel"
import "@contracts/common/errors"
import "@contracts/common/fees-management"
import "@contracts/common/internal-transfer"
import "@contracts/common/messages"
import "@contracts/common/sharding"
import "jetton-utils"
import "storage"

type AllowedMsgToPersonalWallet =
    | AskToTransfer
    | AskToBurn
    | InternalTransferStep
    | TopUpTons
    | HotUpgrade
    | Upgrade
    | RequestUpgradeCode

type BounceOpToHandle = InternalTransferStep | NotifyMinter

contract PersonalWallet {
    author: "zeta"
    version: "0.1.0"
    description: "Jetton wallet contract for personal token"
    storage: PriWalletStore
    incomingMessages: AllowedMsgToPersonalWallet
}

fun onBouncedMessage(in: InMessageBounced) {
    in.bouncedBody.skipBouncedPrefix();

    val msg = lazy BounceOpToHandle.fromSlice(in.bouncedBody);
    val restoreAmount = match (msg) {
        InternalTransferStep => msg.jettonAmount, // safe to fetch jettonAmount, because
        NotifyMinter => msg.jettonAmount,         // it's in the beginning of a message
    };

    var storage = lazy PriWalletStore.load();
    storage.jettonBalance += restoreAmount;
    storage.save();
}

fun onInternalMessage(in: InMessage) {
    val msg = lazy AllowedMsgToPersonalWallet.fromSlice(in.body);
    var storage = lazy PriWalletStore.load();
    match (msg) {
        InternalTransferStep => {
            if (in.senderAddress != storage.minterAddress) {
                // TODO: or treasury
                assert (
                    in.senderAddress == addrPriWallet(msg.transferInitiator)
                ) throw Errors.NotValidWallet;
            }

            if (msg.version > storage.version) {
                val reqMsg = createMessage({
                    bounce: BounceMode.NoBounce,
                    value: 0,
                    dest: storage.minterAddress,
                    body: RequestUpgradeCode {
                        sender: contract.getAddress(),
                        version: storage.version,
                    },
                });
                reqMsg.send(SEND_MODE_PAY_FEES_SEPARATELY | SEND_MODE_IGNORE_ERRORS);
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
                    SEND_MODE_PAY_FEES_SEPARATELY | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
                );
            }

            if (msg.sendExcessesTo != null) {
                reserveForBalance(in.valueCoins);

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
            checkAmountIsEnoughToTransfer(
                in.valueCoins,
                msg.forwardTonAmount,
                in.originalForwardFee,
            );

            // var storage = lazy PriWalletStore.load();
            assert (in.senderAddress == storage.owner) throw Errors.NotOwner;
            assert (storage.jettonBalance >= msg.jettonAmount) throw Errors.BalanceError;
            storage.jettonBalance -= msg.jettonAmount;
            storage.save();

            // self-transfer means payback
            if (
                (in.senderAddress == msg.transferRecipient) |
                (msg.transferRecipient == storage.minterAddress)
            ) {
                // burn for payback
                val paybackMsg = createMessage({
                    bounce: BounceMode.Only256BitsOfBody,
                    dest: storage.minterAddress,
                    value: 0,
                    body: NotifyMinter {
                        queryId: msg.queryId,
                        jettonAmount: msg.jettonAmount,
                        burnInitiator: in.senderAddress,
                        sendExcessesTo: in.senderAddress == msg.transferRecipient
                            ? msg.sendExcessesTo
                            : null,
                    },
                });
                paybackMsg.send(
                    SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
                );

                return; // no further execution required
            }
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
            checkAmountIsEnoughToBurn(in.valueCoins);
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

        HotUpgrade => {
            assert (
                (in.senderAddress == storage.minterAddress) | (in.senderAddress == storage.owner)
            ) throw Errors.IncorrectSender;
            contract.setCodePostponed(msg.code);
            // SAFETY: updating continuation register C3 for new code
            setTvmRegisterC3(transformSliceToContinuation(msg.code.beginParse()));
            hotUpgradePersonalWalletData(msg.additionalData);
            return;
        }

        Upgrade => {
            assert (in.senderAddress == storage.minterAddress) throw Errors.IncorrectSender;
            if (storage.version < msg.walletVersion) {
                storage.version = msg.walletVersion;
                if (msg.newCode != null) {
                    contract.setCodePostponed(msg.newCode);
                    // SAFETY: updating continuation register C3 for new code
                    setTvmRegisterC3(transformSliceToContinuation(msg.newCode.beginParse()));
                }
                hotUpgradePersonalWalletData(msg.newData);
            }
        }

        RequestUpgradeCode => {
            val reqMsg = createMessage({
                bounce: BounceMode.NoBounce,
                value: 0,
                dest: storage.minterAddress,
                body: RequestUpgradeCode {
                    sender: contract.getAddress(),
                    version: storage.version,
                },
            });
            reqMsg.send(SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_IGNORE_ERRORS);
        }

        TopUpTons => {
            // just accept tons
        }

        else => {
            // invalid input; a typical reaction is:
            // ignore empty messages, "wrong opcode" if not
            assert (in.body.isEmpty()) throw 0xFFFF;
        }
    }
    storage.save();
}

fun hotUpgradePersonalWalletData(_additionalData: cell?) {
    var oldStore = PriWalletStore.load();
    oldStore.version += 1;
    oldStore.save();
}

get fun get_version(): uint10 {
    val storage = lazy PriWalletStore.load();
    return storage.version;
}

get fun get_personal_wallet_state(): PriWalletStore {
    return PriWalletStore.load();
}

get fun get_wallet_data(): JettonWalletDataReply {
    val storage = lazy PriWalletStore.load();

    return {
        jettonBalance: storage.jettonBalance,
        ownerAddress: storage.owner,
        minterAddress: storage.minterAddress,
        jettonWalletCode: contract.getCode(),
    };
}
