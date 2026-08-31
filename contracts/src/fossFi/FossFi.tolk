import "@stdlib/tvm-lowlevel"

import "@gen/Location.code"
import "@contracts/common/errors"
import "@contracts/common/fees-management"
import "@contracts/common/fi-wallet-code"
import "@contracts/common/internal-transfer"
import "@contracts/common/messages"
import "@contracts/common/sharding"
import "@contracts/common/utils"
import "@contracts/fossFi/consts"
import "@contracts/fossFi/jetton-utils"
import "@contracts/fossFi/storage"
import "@contracts/location/location-utils"
import "@contracts/lottery/messages"
import "@contracts/lottery/storage"

type AllowedMessageToMinter =
    | MintNewJettons
    | NotifyMinter
    | RequestWalletAddress
    | ChangeMinterAdmin
    | ClaimMinterAdmin
    | DropMinterAdmin
    | ChangeMinterMetadata
    | ChangeDaoAddress
    | RequestTotalAccounts
    | TopUpTons
    | InformMinterInviteInternal
    | InformMinterChangeLocation
    | RequestUpgradeCode
    | EnterLottery
    | LotteryWin
    | UpgradeLotteryCode
    | HotUpgrade
    | Upgrade
    | RejectUpgrade
    | ApproveUpgrade
    | Destroy

type BounceOpToHandle =
    | InternalTransferStep
    | TopUpTons

contract FossFi {
    author: "zeta"
    version: "0.1.0"
    description: "minter contract for fossFi with personal token, voting, invite system and more"
    storage: FiStore
    incomingMessages: AllowedMessageToMinter
}

fun onBouncedMessage(in: InMessageBounced): void {
    in.bouncedBody.skipBouncedPrefix();
    val msg = lazy BounceOpToHandle.fromSlice(in.bouncedBody);
    var store = lazy FiStore.load();

    match (msg) {
        InternalTransferStep => {
            // minted supply that never landed (or was sent back) is restored
            store.totalSupply -= msg.jettonAmount;
        }

        TopUpTons => {
            store.totalSupply -= ton("1");
        }
    }
    store.save();
}

fun assertAdmin(
    sender: address,
    errCode: int = Errors.NotOwner,
): void {
    val store = lazy FiStore.load();
    val adminAddress = store.adminAddress;
    val daoAddress = store.daoAddress;
    if (sender == adminAddress) {
        return;
    }
    if (sender == daoAddress) {
        return;
    }
    throw errCode;
}

fun onInternalMessage(in: InMessage): void {
    val msg = lazy AllowedMessageToMinter.fromSlice(in.body);
    var store = lazy FiStore.load();
    var others = lazy store.others.load(); // todo: move to internal msg

    match (msg) {
        InformMinterInviteInternal => {
            // note: use notifyMinter but forwardPayload?
            assertCorrectSender(in.senderAddress, msg.sender);
            others.totalAccounts += 1;
            store.totalSupply += MBRP_AMOUNT; // note: broadcast id for explorers or dbs

            val locDeploy = calcDeployLocation(
                msg.h3Cell,
                contract.getAddress(),
                getLocationCode(),
            );
            val locMsg = createMessage({
                bounce: BounceMode.NoBounce,
                dest: locDeploy,
                value: 0,
                body: LocationAddMember {
                    queryId: msg.queryId,
                    userAddress: msg.sender,
                    sendExcessesTo: msg.invitor,
                },
            });
            locMsg.send(
                SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_IGNORE_ERRORS,
            );
        }

        InformMinterChangeLocation => {
            assertCorrectSender(in.senderAddress, msg.owner);
            reserveForMinterBalance(in.valueCoins);

            val oldLocDeploy = calcDeployLocation(
                msg.oldH3Cell,
                contract.getAddress(),
                getLocationCode(),
            );
            val oldLocMsg = createMessage({
                bounce: BounceMode.NoBounce,
                dest: oldLocDeploy,
                value: ton("0.05"),
                body: LocationRemoveMember {
                    queryId: msg.queryId,
                    userAddress: msg.owner,
                    sendExcessesTo: null,
                },
            });
            oldLocMsg.send(SEND_MODE_PAY_FEES_SEPARATELY | SEND_MODE_IGNORE_ERRORS);

            val newLocDeploy = calcDeployLocation(
                msg.newH3Cell,
                contract.getAddress(),
                getLocationCode(),
            );
            val newLocMsg = createMessage({
                bounce: BounceMode.NoBounce,
                dest: newLocDeploy,
                value: 0,
                body: LocationAddMember {
                    queryId: msg.queryId,
                    userAddress: msg.owner,
                    sendExcessesTo: msg.owner,
                },
            });
            // SAFETY: forwards remaining balance above reserve to location indexer
            newLocMsg.send(SEND_MODE_CARRY_ALL_BALANCE | SEND_MODE_IGNORE_ERRORS);
        }

        NotifyMinter => {
            // todo: fixme for Following supply contract
            assertCorrectSender(in.senderAddress, msg.burnInitiator);

            // determine whether MINT or BURN
            msg.queryId != 0
                ? store.totalSupply += msg.jettonAmount
                : store.totalSupply -= msg.jettonAmount;

            // sendExcessesTo null: still persist the supply change (bottom save runs)
            if (msg.sendExcessesTo != null) {
                val excessesMsg = createMessage({
                    bounce: BounceMode.NoBounce,
                    dest: msg.sendExcessesTo,
                    value: 0,
                    body: ReturnExcessesBack { queryId: msg.queryId },
                });
                excessesMsg.send(
                    SEND_MODE_IGNORE_ERRORS | SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE,
                );
            }
        }

        RequestWalletAddress => {
            val owner: Cell<address>? = msg.includeOwnerAddress ? msg.owner.toCell() : null;

            var walletAddress: address? = null;
            if (msg.owner.getWorkchain() == MY_WORKCHAIN) {
                walletAddress = getAutoAddress(msg.owner).calculateAddress();
            }

            val respondMsg = createMessage({
                bounce: BounceMode.NoBounce,
                dest: in.senderAddress,
                value: 0,
                body: ResponseWalletAddress {
                    queryId: msg.queryId,
                    jettonWalletAddress: walletAddress,
                    owner,
                },
            });
            respondMsg.send(
                SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_IGNORE_ERRORS,
            );
        }

        MintNewJettons => {
            // assert (false) throw Errors.IncorrectReceiver; // just for fun/standard
            assertAdmin(in.senderAddress);
            assert (msg.mintRecipient.getWorkchain() == MY_WORKCHAIN) throw Errors.WrongWorkchain;

            val internalTransferMsg = lazy msg
                .internalTransferMsg
                .load({ throwIfOpcodeDoesNotMatch: Errors.InvalidOp });
            val forwardTonAmount = internalTransferMsg.forwardTonAmount;
            internalTransferMsg.forwardPayload.checkIsCorrectTlbEither();

            checkAmountIsEnoughToTransfer(msg.tonAmount, forwardTonAmount, in.originalForwardFee);

            store.totalSupply += internalTransferMsg.jettonAmount;

            reserveMinterStorageFee();

            val deployMsg = createMessage({
                bounce: BounceMode.Only256BitsOfBody,
                dest: getAutoAddress(msg.mintRecipient),
                value: msg.tonAmount,
                body: msg.internalTransferMsg,
            });
            deployMsg.send(SEND_MODE_PAY_FEES_SEPARATELY | SEND_MODE_BOUNCE_ON_ACTION_FAIL);
        }

        ChangeMinterAdmin => {
            assertAdmin(in.senderAddress);
            // a handoff is already pending; the current admin must drop it first
            assert (store.adminHandoff == null) throw Errors.WaitMore;

            store.adminHandoff = AdminHandoff {
                newAdminAddress: msg.newAdminAddress,
                timestamp: blockchain.now(),
            }.toCell();
        }

        DropMinterAdmin => {
            assertAdmin(in.senderAddress);
            assert (store.adminHandoff != null) throw Errors.WaitMore;

            store.adminHandoff = null;
        }

        ClaimMinterAdmin => {
            // the proposed next admin must claim it themselves
            assert (store.adminHandoff != null) throw Errors.WaitMore;
            val handoff = store.adminHandoff.load();
            assert (in.senderAddress == handoff.newAdminAddress) throw Errors.IncorrectSender;
            // can only be claimed after the 1-week reject window elapses
            assert (
                handoff.timestamp + ADMIN_HANDOVER_WAIT < blockchain.now()
            ) throw Errors.WaitMore;

            store.adminAddress = handoff.newAdminAddress;
            store.adminHandoff = null;
        }

        ChangeMinterMetadata => {
            assertAdmin(in.senderAddress);
            store.metadata = msg.newMetadata;
        }

        ChangeDaoAddress => {
            assertAdmin(in.senderAddress);
            store.daoAddress = msg.newDaoAddress;
        }

        Upgrade => {
            assertAdmin(in.senderAddress);
            assert (others.currentRequest == null) throw Errors.WaitMore;

            others.currentRequest = CurrentRequest {
                newUpgrade: msg,
                timestamp: blockchain.now(),
            }.toCell();
        }

        RejectUpgrade => {
            assertAdmin(in.senderAddress);
            assert (others.currentRequest != null) throw Errors.WaitMore; // todo: better error code

            others.currentRequest = null;
        }

        ApproveUpgrade => {
            assertAdmin(in.senderAddress);
            // todo: redundant check (why would admin do this?)
            assert (others.currentRequest != null) throw Errors.WaitMore;
            val currentRequest = others.currentRequest.load();
            // testnetOnly, wait period is over
            assert (currentRequest.timestamp + 1 < blockchain.now()) throw Errors.WaitMore;

            val code = currentRequest.newUpgrade.newCode;
            val data = currentRequest.newUpgrade.newData;

            match (currentRequest.newUpgrade.walletUpgrade) {
                true => {
                    // for jettonWallet of FOSSFIAT/MINT
                    store.walletVersion += 1;
                    others.latestFiWalletCode = code!; // shouldn't be null for other than minterUpgrade
                    // todo: remove on mainnet to keep contracts deployer agnostic
                    val upgradeMsg = createMessage({
                        bounce: BounceMode.NoBounce,
                        value: 0,
                        dest: getAutoAddress(
                            in.senderAddress,
                        ).calculateAddress(),
                        body: Upgrade {
                            walletVersion: store.walletVersion,
                            sender: store.adminAddress, // or use contract.getAddress()
                            newData: data,
                            newCode: code,
                        },
                    });
                    upgradeMsg.send(
                        SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_IGNORE_ERRORS,
                    );
                }

                false => {
                    // for minter
                    if (code != null) {
                        contract.setCodePostponed(code);
                    }

                    if (data != null) {
                        contract.setData(data);
                    }
                }
            }

            others.currentRequest = null;
        }

        RequestUpgradeCode => {
            assertCorrectSender(in.senderAddress, msg.sender);
            if (msg.version < store.walletVersion) {
                // sendUpgradeMinter(in.senderAddress, store);
                val upgradeMsg = createMessage({
                    // bounce for collecting fees back
                    bounce: BounceMode.NoBounce,
                    value: 0,
                    dest: in.senderAddress,
                    body: Upgrade {
                        // todo: fixme: send HotUpgrades only to support state migration
                        walletVersion: store.walletVersion,
                        sender: store.adminAddress,
                        newCode: others.latestFiWalletCode,
                    },
                });
                upgradeMsg.send(
                    SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_IGNORE_ERRORS,
                );
            }
        }

        TopUpTons => {
            // deploy + accept tons + deploy jettonWallet
            if (in.senderAddress == store.adminAddress) {
                store.totalSupply += ton("1");
                val deployTopUpMsg = createMessage({
                    // bounce for collecting fees back
                    bounce: BounceMode.Only256BitsOfBody,
                    value: 0,
                    dest: getAutoAddress(in.senderAddress),
                    body: TopUpTons {},
                });
                deployTopUpMsg.send(
                    SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
                );
            }
        }

        EnterLottery => {
            assertCorrectSender(in.senderAddress, msg.sender);
            val enterMsg = createMessage({
                bounce: BounceMode.RichBounce, // todo handle deepBounces
                value: 0,
                dest: calcDeployLottery(
                    // deploy
                    contract.getAddress(),
                    msg.amount,
                    others.lotteryCode,
                ),
                body: msg,
            });
            enterMsg.send(
                SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
            );
        }

        LotteryWin => {
            assert (
                in.senderAddress ==
                calcDeployLottery(
                    contract.getAddress(),
                    msg.entryAmount,
                    others.lotteryCode,
                ).calculateAddress()
            ) throw Errors.IncorrectSender;

            // mint the prize to the winner (mirrors MintNewJettons)
            store.totalSupply += msg.amt;

            reserveMinterStorageFee();

            val deployMsg = createMessage({
                bounce: BounceMode.Only256BitsOfBody,
                dest: getAutoAddress(
                    msg.winner,
                ),
                value: in.valueCoins, // lottery forwards its pot to fund the mint
                body: makeInternalTransferStep(
                    0,                     // queryId
                    msg.amt,               // jettonAmount
                    contract.getAddress(), // transferInitiator (minter mints)
                    contract.getAddress(), // sendExcessesTo
                ),
            });
            deployMsg.send(SEND_MODE_PAY_FEES_SEPARATELY | SEND_MODE_BOUNCE_ON_ACTION_FAIL);
        }

        UpgradeLotteryCode => {
            assertAdmin(in.senderAddress);

            others.lotteryCode = msg.newCode;
        }

        HotUpgrade => {
            assertAdmin(in.senderAddress);

            contract.setCodePostponed(msg.code);

            // SAFETY
            setTvmRegisterC3(transformSliceToContinuation(msg.code.beginParse()));
            hotUpgradeFiData(msg.additionalData);

            // early return to avoid saving storage below 
            return;
        }

        // testnetOnly
        Destroy => {
            assertAdmin(in.senderAddress);

            destroyContract(in.senderAddress);
        }

        RequestTotalAccounts => {
            val replyMsg = createMessage({
                bounce: BounceMode.NoBounce,
                value: 0,
                dest: in.senderAddress,
                body: ResponseTotalAccounts {
                    queryId: msg.queryId,
                    totalAccounts: others.totalAccounts,
                },
            });
            replyMsg.send(SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_IGNORE_ERRORS);
        }

        else => {
            // invalid input; a typical reaction is:
            // ignore empty messages, "wrong opcode" if not
            assert (in.body.isEmpty()) throw 0xFFFF;
        }
    }
    store.others = others.toCell();
    store.save();
}

get fun get_total_accounts(): uint33 {
    val store = lazy FiStore.load();
    return store.others.load().totalAccounts;
}

get fun get_dao_address(): address? {
    val store = lazy FiStore.load();
    return store.daoAddress == RAW_ZERO_ADDRESS ? null : store.daoAddress;
}

get fun get_jetton_data(): JettonDataReply {
    val store = lazy FiStore.load();

    // var metadata: OnchainMetadataReply = { contentDict: createEmptyMap() };
    // // if (store.metadata != null) {
    // metadata.contentDict.set(
    //     stringSha256("uri"),
    //     SnakeDataReply { string: store.metadata.load() }.toCell()
    // );
    // metadata.contentDict.set(stringSha256("decimals"), SnakeDataReply { string: "9" }.toCell());
    // // }
    return {
        totalSupply: store.totalSupply,
        mintable: true,                                              // but by peers only & not minter
        adminAddress: store.adminAddress,
        jettonContent: store.metadata as Cell<OnchainMetadataReply>, // metadata.toCell(),
        jettonWalletCode: getFiWalletCode(),
    };
}

get fun get_jetton_data_all(): FiStore {
    return FiStore.load(); // todo: return contract code + data also
}

get fun get_wallet_address(owner: address): address {
    return getAutoAddress(owner).calculateAddress();
}

fun assertCorrectSender(sender: address, owner: address): void {
    assert (sender == getAutoAddress(owner).calculateAddress()) throw Errors.NotValidWallet;
}

fun getAutoAddress(owner: address): AutoDeployAddress {
    return calcDeployFiWallet(
        owner,
        contract.getAddress(),
        getFiWalletCode(),
    );
}

// todo: implement minter deploy(efficient) not jetton(costly stateinit send)
// todo: implement bouncing-lottery also for gamification of network
fun calcDeployLottery(
    owner: address,
    entryAmount: coins,
    lotteryCode: cell, // todo: fixme,,,
): AutoDeployAddress {
    val emptyLotteryStore: LotteryStorage = {
        owner,
        entryAmount,
        participants: [],
    };

    return { stateInit: { code: lotteryCode, data: emptyLotteryStore.toCell() } };
}

@method_id(2121)
fun hotUpgradeFiData(_additionalData: cell?) {
    val oldStorage = FiStore.load();
    val storage = FiStore {
        totalSupply: oldStorage.totalSupply + grams("11111"),
        walletVersion: oldStorage.walletVersion,
        adminAddress: oldStorage.adminAddress,
        adminHandoff: oldStorage.adminHandoff,
        metadata: oldStorage.metadata,
        others: oldStorage.others,
    };
    storage.save();
}

fun getLocationCode(): cell {
    return locationCompiledCodeLibraryRef();
}
