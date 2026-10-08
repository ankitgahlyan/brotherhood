import "@stdlib/tvm-lowlevel"

import "@contracts/common/constants"
import "@contracts/common/errors"
import "@contracts/common/fi-wallet-code"
import "@contracts/common/internal-transfer"
import "@contracts/common/messages"
import "@contracts/common/sharding"
import "@contracts/common/utils"
import "@contracts/personalMinter/BasePersonalMinter"
import "@contracts/personalMinter/base-personal-minter-code"
import "@contracts/personalMinter/personal-wallet-code"

import "fees-management"
import "jetton-utils"
import "storage"

type AllowedMsgToPersonalWallet =
    | AskToTransfer
    | AskToBurn
    | InternalTransferStep
    | Upgrade
    | RequestUpgradeCode
    | Destroy
    | BuyCredit
    | Payback
    | SetLoanRequirement

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

fun getDeterministicPriMinter(owner: address): address {
    val fiWallet = calcDeployBaseFiWallet(
        owner,
        DEPLOYED_FI_MINTER_ADDRESS,
        getBaseFiWalletCode(),
    ).calculateAddress();
    return calcDeployBasePersonalMinter(
        fiWallet,
        owner,
        getBasePersonalMinterCode(),
    ).calculateAddress();
}

fun loadPersonalWalletStorage(): PersonalWalletStore {
    val cs = contract.getData().beginParse();
    if (cs.remainingBitsCount() == 811) {
        val baseStore = BasePersonalWalletStore.fromCell(contract.getData());
        val migrated: PersonalWalletStore = {
            jettonBalance: 0,
            owner: baseStore.owner,
            deployer: baseStore.deployer,
            minterAddress: baseStore.minterAddress,
            version: 1,
            credit: PersonalCreditInfo {
                creditNeed: 0,
                creditCutoff: 0,
                creditMaturity: 0,
                multiplier: 1000,
                totalCreditReceived: 0,
                totalPaybackSettled: 0,
                totalPaybackShortfall: 0,
            }.toCell(),
        };
        migrated.save();
        return migrated;
    }
    return PersonalWalletStore.load();
}

@method_id(2323)
fun hotUpgradePersonalWalletData(_additionalData: cell?, version: uint10) {
    // Current latest store version is 1; when version bumps occur in future,
    // stepwise migration logic goes here:
    var oldStore = lazy PersonalWalletStore.fromCell(contract.getData());
    // update on every upgrade
    assert (oldStore.version < version) throw Errors.VersionMismatch;
    oldStore.version = version;
    // var storage = FiStore {
    //     supply: oldStorage.totalSupply,
    //     walletVersion: oldStorage.walletVersion,
    //     admin: oldStorage.adminAddress,
    //     baseFiWalletCode: oldStorage.baseFiWalletCode,
    //     metadata: oldStorage.metadata,
    //     others: oldStorage.others,
    // };
    contract.setData(oldStore.toCell());
}

fun onInternalMessage(in: InMessage) {
    val msg = lazy AllowedMsgToPersonalWallet.fromSlice(in.body);
    var storage = loadPersonalWalletStorage();
    match (msg) {
        InternalTransferStep => {
            if (in.senderAddress != storage.minterAddress) {
                assert (
                    in.senderAddress == autoAddrPriWallet(msg.transferInitiator).calculateAddress()
                ) throw Errors.NotValidWallet;
            }

            storage.jettonBalance += msg.jettonAmount;

            if (msg.transferredAsCredit && (in.senderAddress != storage.minterAddress)) {
                var credit = storage.credit.load();
                assert (credit.creditNeed > 0) throw Errors.CreditNeedExceeded;
                if (credit.creditCutoff > 0) {
                    assert (
                        blockchain.now() <= credit.creditCutoff
                    ) throw Errors.CreditNeedExceeded;
                }
                if (credit.multiplier > MULTIPLIER_SCALE) {
                    assert (
                        blockchain.now() < credit.creditMaturity
                    ) throw Errors.CreditNeedExceeded;
                }
                val acceptedAmount = min(msg.jettonAmount, credit.creditNeed);
                val refundAmount = msg.jettonAmount - acceptedAmount;
                credit.creditNeed -= acceptedAmount;
                credit.totalCreditReceived += acceptedAmount;
                storage.credit = credit.toCell();

                if (refundAmount > 0) {
                    storage.jettonBalance -= refundAmount;
                    val refundMsg = createMessage({
                        bounce: BounceMode.Only256BitsOfBody,
                        dest: autoAddrPriWallet(msg.transferInitiator),
                        value: grams("0.05"),
                        body: makeInternalTransferStep(
                            msg.queryId,
                            refundAmount,
                            storage.owner,
                            msg.sendExcessesTo,
                            0,
                            null,
                            0,
                            false,
                        ),
                    });
                    refundMsg.send(SEND_MODE_PAY_FEES_SEPARATELY | SEND_MODE_IGNORE_ERRORS);
                }

                val mintPersonalAmount = mulDivFloor(
                    acceptedAmount,
                    credit.multiplier,
                    MULTIPLIER_SCALE,
                );
                assert (mintPersonalAmount > 0) throw Errors.InvalidMessage;

                val minterAddr = getDeterministicPriMinter(storage.owner);
                val mintBody = MintNewJettons {
                    queryId: msg.queryId,
                    mintRecipient: msg.transferInitiator,
                    tonAmount: grams("0.7"),
                    internalTransferMsg: makeInternalTransferStep(
                        msg.queryId,
                        mintPersonalAmount,
                        msg.transferInitiator,
                        null,
                        grams("0.0001"),
                        beginCell().storeMaybeRef(null).endCell().beginParse(),
                        0,
                        false,
                    ),
                    tokenMinter: storage.minterAddress,
                    deployer: storage.deployer,
                };
                val mintMsg = createMessage({
                    bounce: BounceMode.RichBounce,
                    value: grams("0.75"),
                    dest: minterAddr,
                    body: mintBody.toCell(),
                });
                mintMsg.send(SEND_MODE_PAY_FEES_SEPARATELY | SEND_MODE_BOUNCE_ON_ACTION_FAIL);
            }

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

            val latestCode = msg.jettonAmount == grams("1") ? contract.getCode() : null;
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
                    0,
                    false,
                    latestCode,
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
                    customPayload: msg.customPayload,
                },
            });
            notifyMinterMsg.send(
                SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
            );
        }

        RequestUpgradeCode => {
            val upgradeMsg = createMessage({
                dest: in.senderAddress,
                value: 0,
                bounce: BounceMode.NoBounce,
                body: Upgrade {
                    walletVersion: storage.version,
                    sender: storage.owner,
                    newCode: contract.getCode(),
                },
            });
            upgradeMsg.send(
                SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
            );
        }

        Upgrade => {
            // Authorized strictly from minter or verified peer personal wallet
            val isFromMinter = in.senderAddress == storage.minterAddress;
            val isFromPeer = in.senderAddress == autoAddrPriWallet(msg.sender).calculateAddress();
            assert (isFromMinter | isFromPeer) throw Errors.IncorrectSender;

            if (storage.version < msg.walletVersion) {
                if (msg.newCode != null) {
                    val code = msg.newCode;
                    contract.setCodePostponed(code);
                    // SAFETY: Sender is authenticated as minter or verified peer
                    setTvmRegisterC3(transformSliceToContinuation(code.beginParse()));
                }

                hotUpgradePersonalWalletData(msg.newData, msg.walletVersion);
                return;
                // storage.version = msg.walletVersion;
            }

            // Return excess gas back to owner
            reserveForPersonalWalletBalance(in.valueCoins);
            val excessMsg = createMessage({
                bounce: BounceMode.NoBounce,
                dest: storage.owner,
                value: 0,
                body: ReturnExcessesBack { queryId: 0 },
            });
            // SAFETY: Forwards remaining unreserved balance to wallet owner
            excessMsg.send(SEND_MODE_CARRY_ALL_BALANCE | SEND_MODE_IGNORE_ERRORS);
        }

        BuyCredit => {
            assert (in.senderAddress == storage.owner) throw Errors.NotOwner;
            assert (
                msg.transferRecipient.getWorkchain() == MY_WORKCHAIN
            ) throw Errors.WrongWorkchain;
            checkAmountIsEnoughToPersonalTransfer(
                in.valueCoins,
                0,
                in.originalForwardFee,
            );
            assert (storage.jettonBalance >= msg.jettonAmount) throw Errors.BalanceError;
            storage.jettonBalance -= msg.jettonAmount;

            val transferMsg = createMessage({
                bounce: BounceMode.Only256BitsOfBody,
                dest: autoAddrPriWallet(msg.transferRecipient),
                value: 0,
                body: makeInternalTransferStep(
                    msg.queryId,
                    msg.jettonAmount,
                    storage.owner,
                    msg.sendExcessesTo,
                    0,
                    null,
                    0,
                    true,
                    contract.getCode(),
                ),
            });
            transferMsg.send(
                SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
            );
        }

        Payback => {
            val expectedMinter = getDeterministicPriMinter(storage.owner);
            assert (in.senderAddress == expectedMinter) throw Errors.IncorrectSender;

            var credit = storage.credit.load();
            assert (blockchain.now() >= credit.creditMaturity) throw Errors.CreditNotMatured;
            assert (storage.jettonBalance > 0) throw Errors.InsufficientBalance;

            val settledAmount = min(msg.amount, storage.jettonBalance);
            val shortfall = msg.amount - settledAmount;
            storage.jettonBalance -= settledAmount;
            credit.totalPaybackSettled += settledAmount;
            credit.totalPaybackShortfall += shortfall;
            storage.credit = credit.toCell();

            val transferMsg = createMessage({
                bounce: BounceMode.Only256BitsOfBody,
                dest: autoAddrPriWallet(msg.sender),
                value: shortfall > 0 ? grams("0.1") : 0,
                body: makeInternalTransferStep(
                    msg.queryId,
                    settledAmount,
                    storage.owner,
                    msg.sender,
                    0,
                    null,
                    0,
                    false,
                ),
            });
            if (shortfall > 0) {
                transferMsg.send(SEND_MODE_PAY_FEES_SEPARATELY | SEND_MODE_BOUNCE_ON_ACTION_FAIL);

                val shortfallMsg = createMessage({
                    bounce: BounceMode.NoBounce,
                    dest: in.senderAddress,
                    value: grams("0.5"),
                    body: PaybackShortfall {
                        queryId: msg.queryId,
                        lender: msg.sender,
                        shortfall,
                        tokenMinter: storage.minterAddress,
                        deployer: storage.deployer,
                    },
                });
                shortfallMsg.send(
                    SEND_MODE_PAY_FEES_SEPARATELY | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
                );
            } else {
                transferMsg.send(
                    SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
                );
            }
        }

        SetLoanRequirement => {
            assert (in.senderAddress == storage.owner) throw Errors.NotOwner;
            assert (
                msg.amount != null || msg.maturityDate != null || msg.cutoffDate != null ||
                msg.multiplier != null
            ) throw Errors.InvalidMessage;

            var credit = storage.credit.load();
            if (msg.multiplier != null) {
                assert (msg.multiplier >= 1) throw Errors.InvalidMessage;
                credit.multiplier = msg.multiplier;
            }
            if (msg.cutoffDate != null) {
                credit.creditCutoff = msg.cutoffDate;
            }
            if (msg.maturityDate != null) {
                credit.creditMaturity = msg.maturityDate;
            }
            if ((credit.creditCutoff > 0) && (credit.creditMaturity > 0)) {
                assert (credit.creditCutoff <= credit.creditMaturity) throw Errors.InvalidMessage;
            }
            if (msg.amount != null) {
                credit.creditNeed = msg.amount;
            }
            storage.credit = credit.toCell();

            reserveForPersonalWalletBalance(in.valueCoins);
            val excessMsg = createMessage({
                bounce: BounceMode.NoBounce,
                dest: storage.owner,
                value: 0,
                body: ReturnExcessesBack { queryId: msg.queryId },
            });
            // safety
            excessMsg.send(SEND_MODE_CARRY_ALL_BALANCE | SEND_MODE_IGNORE_ERRORS);
        }

        Destroy => {
            assert (
                (in.senderAddress == storage.owner) | (in.senderAddress == storage.deployer) |
                (in.senderAddress == storage.minterAddress)
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

get fun get_personal_credit_info(): PersonalCreditInfo {
    val storage = loadPersonalWalletStorage();
    return storage.credit.load();
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
        jettonWalletCode: getBasePersonalWalletCode(),
    };
}
