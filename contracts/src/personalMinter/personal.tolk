import "@contracts/common/fees-management"
import "@contracts/common/messages"
import "@contracts/common/sharding"
import "@contracts/common/errors"
import "@contracts/fossFi/storage"
import "jetton-utils"
import "storage"

type AllowedMessageToMinter =
    | MintNewJettons
    | NotifyMinter
    | RequestWalletAddress
    | ChangeMinterAdmin
    | ChangeMinterMetadata
    | Upgrade
    | TopUpTons

type AllowedBounced = InternalTransferStep | Payback

fun onBouncedMessage(in: InMessageBounced) {
    in.bouncedBody.skipBouncedPrefix();
    // process only mint bounces; on other messages, an exception will be thrown, it's okay
    val msg = lazy AllowedBounced.fromSlice(in.bouncedBody);

    match (msg) {
        InternalTransferStep => {
            var storage = lazy PriStore.load();
            storage.totalSupply -= msg.jettonAmount;
            storage.save();
        }

        Payback => {
            var store = lazy PriStore.load();
            store.totalSupply += msg.amount;
            store.save();

            createMessage({
                bounce: BounceMode.NoBounce,
                value: 0,
                dest: calcAddrPriWallet(
                    msg.sender,
                    store.adminAddress,
                    contract.getAddress(),
                    store.jettonWalletCode,
                ),
                body: InternalTransferStep {
                    queryId: msg.queryId,
                    jettonAmount: msg.amount,
                    version: 0,
                    transferredAsCredit: false,
                    transferInitiator: msg.sender, // or deployer or minter
                    sendExcessesTo: null,
                    forwardTonAmount: 0,
                    forwardPayload: createEmptySlice(),
                },
            }).send(SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_IGNORE_ERRORS);
        }
    }
}

fun onInternalMessage(in: InMessage) {
    val msg = lazy AllowedMessageToMinter.fromSlice(in.body);
    var storage = lazy PriStore.load();

    match (msg) {
        NotifyMinter => {
            assert (
                in.senderAddress ==
                calcAddrPriWallet(
                    msg.burnInitiator,
                    storage.adminAddress,
                    contract.getAddress(),
                    storage.jettonWalletCode,
                )
            ) throw Errors.NotValidWallet;
            storage.totalSupply -= msg.jettonAmount;

            // now transfer MINTS if payback
            if (msg.sendExcessesTo != null) {
                createMessage({
                    bounce: BounceMode.RichBounceOnlyRootCell,
                    value: 0,
                    dest: storage.fiJettonAddress,
                    body: Payback {
                        queryId: msg.queryId,
                        amount: msg.jettonAmount,
                        sender: msg.burnInitiator,
                    },
                }).send(
                    SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
                );
            }
        }

        RequestWalletAddress => {
            val owner: Cell<address>? = msg.includeOwnerAddress ? msg.owner.toCell() : null;

            var jettonWalletAddress: address? = null;
            if (msg.owner.getWorkchain() == MY_WORKCHAIN) {
                jettonWalletAddress = calcAddrPriWallet(
                    msg.owner,
                    storage.adminAddress,
                    contract.getAddress(),
                    storage.jettonWalletCode,
                );
            }

            val respondMsg = createMessage({
                bounce: BounceMode.NoBounce,
                dest: in.senderAddress,
                value: 0,
                body: ResponseWalletAddress {
                    queryId: msg.queryId,
                    jettonWalletAddress,
                    owner,
                },
            });
            respondMsg.send(
                SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
            );
        }

        MintNewJettons => {
            assert (
                (in.senderAddress == storage.fiJettonAddress) |
                (in.senderAddress == storage.adminAddress)
            ) throw Errors.IncorrectSender;
            assert (msg.mintRecipient.getWorkchain() == MY_WORKCHAIN) throw Errors.WrongWorkchain;

            val internalTransferMsg = lazy msg
                .internalTransferMsg
                .load({
                    throwIfOpcodeDoesNotMatch: Errors.InvalidMessage,
                });
            val forwardTonAmount = internalTransferMsg.forwardTonAmount;
            internalTransferMsg.forwardPayload.checkIsCorrectTlbEither();

            // a little more than needed, it’s ok since it’s sent by the admin and excesses will return back
            checkAmountIsEnoughToTransfer(msg.tonAmount, forwardTonAmount, in.originalForwardFee);

            storage.totalSupply += internalTransferMsg.jettonAmount;

            reserveToncoinsOnBalance(
                ton("0.01"),
                RESERVE_MODE_EXACT_AMOUNT,
            ); // reserve for storage fees

            val deployMsg = createMessage({
                bounce: BounceMode.Only256BitsOfBody,
                dest: calcDeployPriWallet(
                    msg.mintRecipient,
                    storage.adminAddress,
                    contract.getAddress(),
                    storage.jettonWalletCode,
                ),
                value: msg.tonAmount,
                body: msg.internalTransferMsg,
            });
            deployMsg.send(
                SEND_MODE_PAY_FEES_SEPARATELY | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
            ); // todo: bounce?
        }

        ChangeMinterAdmin => {
            assert (in.senderAddress == storage.adminAddress) throw Errors.IncorrectSender;
            storage.adminAddress = msg.newAdminAddress;
        }

        ChangeMinterMetadata => {
            assert (in.senderAddress == storage.adminAddress) throw Errors.IncorrectSender;
            storage.metadataUri = msg.newMetadata;
        }

        Upgrade => {
            assert (in.senderAddress == storage.fiJettonAddress) throw Errors.IncorrectSender;

            if (msg.newCode != null) {
                contract.setCodePostponed(msg.newCode);
            }

            if (msg.newData != null) {
                contract.setData(msg.newData);
            }
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

struct State {
    supply: int
    admin: address
    fiJetton: address
}

get fun get_state(): State {
    val store = lazy PriStore.load();
    return {
        supply: store.totalSupply,
        admin: store.adminAddress,
        fiJetton: store.fiJettonAddress,
    };
}

get fun get_jetton_data(): JettonDataReply {
    val storage = lazy PriStore.load();

    return {
        totalSupply: storage.totalSupply,
        mintable: true,
        adminAddress: storage.adminAddress,
        jettonContent: storage.metadataUri! as Cell<OnchainMetadataReply>, // todo nullCheck
        jettonWalletCode: storage.jettonWalletCode,
    };
}

get fun get_wallet_address(owner: address): address {
    val storage = lazy PriStore.load();

    return calcAddrPriWallet(
        owner,
        storage.adminAddress,
        contract.getAddress(),
        storage.jettonWalletCode,
    );
}
