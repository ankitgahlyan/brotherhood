import "@stdlib/tvm-lowlevel"

import "@gen/PersonalWallet.code"
import "@contracts/common/errors"
import "@contracts/common/fees-management"
import "@contracts/common/internal-transfer"
import "@contracts/common/messages"
import "@contracts/common/sharding"

import "@contracts/common/utils"

import "jetton-utils"
import "storage"

type AllowedMsgToPersonalMinter =
    | MintNewJettons
    | NotifyMinter
    | RequestWalletAddress
    | ChangeMinterAdmin
    | ChangeMinterMetadata
    | Upgrade
    | HotUpgrade
    | TopUpTons
    | Destroy

type AllowedBounced = InternalTransferStep | Payback

contract PersonalMinter {
    author: "zeta"
    version: "0.1.0"
    description: "minter contract for personal token of BrotherHood Network"
    storage: PersonalStore
    incomingMessages: AllowedMsgToPersonalMinter
}

fun onBouncedMessage(in: InMessageBounced) {
    // The minter sends bouncable messages with two different bounce modes:
    //  - the MintNewJettons deploy (an InternalTransferStep) uses Only256BitsOfBody,
    //    so its bounced body is "0xffffffff" + the first 256 bits of the body;
    //  - the Payback message uses RichBounceOnlyRootCell, so its bounced body is a
    //    RichBounceBody (prefix 0xfffffffe) whose originalBody holds the Payback.
    // Detect the format by the first 32 bits instead of parsing blindly.
    if (in.bouncedBody.preloadUint(32) == 0xfffffffe) {
        val rich = lazy RichBounceBody.fromSlice(in.bouncedBody);
        val payback = lazy Payback.fromSlice(rich.originalBody.beginParse());

        var store = lazy PersonalStore.load();
        store.totalSupply += payback.amount;
        store.save();

        val mintMsg = createMessage({
            bounce: BounceMode.NoBounce,
            value: 0,
            dest: autoAddrPriWalletMinter(payback.sender),
            body: makeInternalTransferStep(
                payback.queryId,
                payback.amount,
                payback.sender, // or deployer or minter
            ),
        });
        mintMsg.send(SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_IGNORE_ERRORS);
    } else {
        // process only mint bounces; on other messages, an exception will be thrown, it's okay
        in.bouncedBody.skipBouncedPrefix();
        val msg = lazy AllowedBounced.fromSlice(in.bouncedBody);

        match (msg) {
            InternalTransferStep => {
                var storage = lazy PersonalStore.load();
                storage.totalSupply -= msg.jettonAmount;
                storage.save();
            }

            Payback => {
                // unreachable: Payback bounces arrive as RichBounceBody (handled above)
                throw Errors.InvalidMessage;
            }
        }
    }
}

fun onInternalMessage(in: InMessage) {
    val msg = lazy AllowedMsgToPersonalMinter.fromSlice(in.body);
    var storage = lazy PersonalStore.load();

    match (msg) {
        NotifyMinter => {
            assert (
                in.senderAddress == autoAddrPriWalletMinter(msg.burnInitiator)
            ) throw Errors.NotValidWallet;
            storage.totalSupply -= msg.jettonAmount;

            // now transfer MINTS if payback
            if (msg.sendExcessesTo != null) {
                val paybackMsg = createMessage({
                    bounce: BounceMode.RichBounceOnlyRootCell, // todo: ok?
                    value: 0,
                    dest: storage.fiJettonAddress,
                    body: Payback {
                        queryId: msg.queryId,
                        amount: msg.jettonAmount,
                        sender: msg.burnInitiator,
                    },
                });
                paybackMsg.send(
                    SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
                );
            }
        }

        RequestWalletAddress => {
            val owner: Cell<address>? = msg.includeOwnerAddress ? msg.owner.toCell() : null;

            var jettonWalletAddress: address? = null;
            if (msg.owner.getWorkchain() == MY_WORKCHAIN) {
                jettonWalletAddress = autoAddrPriWalletMinter(msg.owner);
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
                SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_IGNORE_ERRORS,
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

            reservePersonalMinterStorageFee();

            val deployMsg = createMessage({
                bounce: BounceMode.Only256BitsOfBody,
                dest: calcDeployPriWallet(
                    msg.mintRecipient,
                    storage.adminAddress,
                    contract.getAddress(),
                    getPersonalWalletCode(),
                ),
                value: msg.tonAmount,
                body: msg.internalTransferMsg,
            });
            deployMsg.send(
                SEND_MODE_PAY_FEES_SEPARATELY | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
            );
        }

        ChangeMinterAdmin => {
            assert (in.senderAddress == storage.adminAddress) throw Errors.IncorrectSender;
            storage.adminAddress = msg.newAdminAddress;
        }

        ChangeMinterMetadata => {
            assert (in.senderAddress == storage.adminAddress) throw Errors.IncorrectSender;
            storage.metadataUri = msg.newMetadata;
        }

        HotUpgrade => {
            assert (
                (in.senderAddress == storage.fiJettonAddress) |
                (in.senderAddress == storage.adminAddress)
            ) throw Errors.IncorrectSender;
            contract.setCodePostponed(msg.code);
            // SAFETY: updating continuation register C3 for new code
            setTvmRegisterC3(transformSliceToContinuation(msg.code.beginParse()));
            hotUpgradePersonalMinterData(msg.additionalData);
            return;
        }

        Upgrade => {
            assert (
                (in.senderAddress == storage.fiJettonAddress) |
                (in.senderAddress == storage.adminAddress)
            ) throw Errors.IncorrectSender;

            if (msg.newCode != null) {
                contract.setCodePostponed(msg.newCode);
            }

            if (msg.newData != null) {
                contract.setData(msg.newData);
                return;
            }
        }

        TopUpTons => {
            // just accept tons
        }

        Destroy => {
            assert (
                (in.senderAddress == storage.adminAddress) |
                (in.senderAddress == storage.fiJettonAddress)
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

@method_id(2525)
fun hotUpgradePersonalMinterData(_additionalData: cell?) {}

get fun get_state(): PersonalStore {
    return PersonalStore.load();
}

get fun get_jetton_data(): JettonDataReply {
    val storage = lazy PersonalStore.load();

    return {
        totalSupply: storage.totalSupply,
        mintable: true,
        adminAddress: storage.adminAddress,
        jettonContent: storage.metadataUri as Cell<OnchainMetadataReply>,
        jettonWalletCode: getPersonalWalletCode(),
    };
}

get fun get_wallet_address(owner: address): address {
    return autoAddrPriWalletMinter(owner);
}

// used in minter
fun autoAddrPriWalletMinter(owner: address): address {
    // wallet calls this when deploy and checking on incoming
    val st = lazy PersonalStore.load();
    return calcDeployPriWallet(
        owner,
        st.adminAddress,
        contract.getAddress(),
        getPersonalWalletCode(),
    ).calculateAddress();
}

fun getPersonalWalletCode(): cell {
    return personalWalletCompiledCodeLibraryRef();
}
