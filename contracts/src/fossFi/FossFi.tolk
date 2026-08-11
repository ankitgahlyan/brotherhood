import "@stdlib/tvm-lowlevel"

import "@gen/FossFiWallet.code"
import "@contracts/common/errors"
import "@contracts/common/fees-management"
import "@contracts/common/internal-transfer"
import "@contracts/common/messages"
import "@contracts/common/sharding"
import "@contracts/fossFi/consts"
import "@contracts/fossFi/jetton-utils"
import "@contracts/fossFi/storage"
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
    | SetLocationAddresses
    | ChangeDaoAddress
    | RequestTotalAccounts
    | TopUpTons
    | InformMinterInviteInternal
    | InformMinterChangeCity
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

fun assertAdminOrDao(
    sender: address,
    adminAddress: address,
    daoAddress: address,
    errCode: int = Errors.NotOwner,
): void {
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
            assertCorrectSender(in.senderAddress, msg.sender, store.adminAddress);
            others.totalAccounts += 1;
            store.totalSupply += MBRP_AMOUNT; // note: broadcast id for explorers or dbs

            val loc = others.locationAddrs.get(msg.cityLetter);
            // if (loc.isFound) {
            val locMsg = createMessage({
                bounce: BounceMode.NoBounce,
                dest: loc.loadValue(),
                value: 0,
                body: LocationRegisterCity {
                    queryId: msg.queryId,
                    ownerAddress: msg.sender,
                    cityName: msg.city,
                    sendExcessesTo: msg.invitor,
                },
            });
            locMsg.send(
                SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_IGNORE_ERRORS,
            );
        }

        InformMinterChangeCity => {
            assertCorrectSender(in.senderAddress, msg.owner, store.adminAddress);

            val oldLoc = others.locationAddrs.get(msg.oldCityLetter);
            val oldLocMsg = createMessage({
                bounce: BounceMode.NoBounce,
                dest: oldLoc.loadValue(),
                value: 0,
                body: LocationUnregisterCity {
                    queryId: msg.queryId,
                    ownerAddress: msg.owner,
                    cityName: msg.oldCity,
                    sendExcessesTo: msg.owner,
                },
            });
            oldLocMsg.send(SEND_MODE_PAY_FEES_SEPARATELY | SEND_MODE_IGNORE_ERRORS);

            val newLoc = others.locationAddrs.get(msg.newCityLetter);
            val newLocMsg = createMessage({
                bounce: BounceMode.NoBounce,
                dest: newLoc.loadValue(),
                value: 0,
                body: LocationRegisterCity {
                    queryId: msg.queryId,
                    ownerAddress: msg.owner,
                    cityName: msg.newCity,
                    sendExcessesTo: msg.owner,
                },
            });
            newLocMsg.send(
                SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_IGNORE_ERRORS,
            );
        }

        NotifyMinter => {
            assertCorrectSender(in.senderAddress, msg.burnInitiator, store.adminAddress);

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
                walletAddress = getAutoAddress(msg.owner, store.adminAddress).calculateAddress();
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
                SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
            );
        }

        MintNewJettons => {
            // assert (false) throw Errors.IncorrectReceiver; // just for fun/standard
            assertAdminOrDao(
                in.senderAddress,
                store.adminAddress,
                store.daoAddress,
                Errors.NotOwner,
            );
            assert (msg.mintRecipient.getWorkchain() == MY_WORKCHAIN) throw Errors.WrongWorkchain;

            val internalTransferMsg = lazy msg
                .internalTransferMsg
                .load({ throwIfOpcodeDoesNotMatch: Errors.InvalidOp });
            val forwardTonAmount = internalTransferMsg.forwardTonAmount;
            internalTransferMsg.forwardPayload.checkIsCorrectTlbEither();

            checkAmountIsEnoughToTransfer(msg.tonAmount, forwardTonAmount, in.originalForwardFee);

            store.totalSupply += internalTransferMsg.jettonAmount;

            reserveGramsOnBalance(
                ton("0.01"),
                RESERVE_MODE_EXACT_AMOUNT,
            );

            val deployMsg = createMessage({
                bounce: BounceMode.Only256BitsOfBody,
                dest: getAutoAddress(
                    msg.mintRecipient,
                    store.adminAddress,
                ),
                value: msg.tonAmount,
                body: msg.internalTransferMsg,
            });
            deployMsg.send(SEND_MODE_PAY_FEES_SEPARATELY | SEND_MODE_BOUNCE_ON_ACTION_FAIL);
        }

        ChangeMinterAdmin => {
            assertAdminOrDao(
                in.senderAddress,
                store.adminAddress,
                store.daoAddress,
                Errors.NotOwner,
            );
            // a handoff is already pending; the current admin must drop it first
            assert (store.adminHandoff == null) throw Errors.WaitMore;

            store.adminHandoff = AdminHandoff {
                newAdminAddress: msg.newAdminAddress,
                timestamp: blockchain.now(),
            }.toCell();
        }

        DropMinterAdmin => {
            assertAdminOrDao(
                in.senderAddress,
                store.adminAddress,
                store.daoAddress,
                Errors.NotOwner,
            );
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
            assertAdminOrDao(
                in.senderAddress,
                store.adminAddress,
                store.daoAddress,
                Errors.NotOwner,
            );
            store.metadata = msg.newMetadata;
        }

        SetLocationAddresses => {
            assertAdminOrDao(
                in.senderAddress,
                store.adminAddress,
                store.daoAddress,
                Errors.NotOwner,
            );
            others.locationAddrs = msg.locationAddrs;
        }

        ChangeDaoAddress => {
            assertAdminOrDao(
                in.senderAddress,
                store.adminAddress,
                store.daoAddress,
                Errors.NotOwner,
            );
            store.daoAddress = msg.newDaoAddress;
        }

        Upgrade => {
            assertAdminOrDao(
                in.senderAddress,
                store.adminAddress,
                store.daoAddress,
                Errors.IncorrectSender,
            );
            assert (others.currentRequest == null) throw Errors.WaitMore;

            others.currentRequest = CurrentRequest {
                newUpgrade: msg,
                timestamp: blockchain.now(),
            }.toCell();
        }

        RejectUpgrade => {
            assertAdminOrDao(
                in.senderAddress,
                store.adminAddress,
                store.daoAddress,
                Errors.IncorrectSender,
            );
            assert (others.currentRequest != null) throw Errors.WaitMore; // todo: better error code

            others.currentRequest = null;
        }

        ApproveUpgrade => {
            assertAdminOrDao(
                in.senderAddress,
                store.adminAddress,
                store.daoAddress,
                Errors.IncorrectSender,
            );
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
                            store.adminAddress,
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
            assertCorrectSender(in.senderAddress, msg.sender, store.adminAddress);
            if (msg.version < store.walletVersion) {
                // sendUpgradeMinter(in.senderAddress, store);
                val upgradeMsg = createMessage({
                    // bounce for collecting fees back
                    bounce: BounceMode.NoBounce,
                    value: 0,
                    dest: in.senderAddress,
                    body: Upgrade {
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
            if (in.senderAddress == store.adminAddress || in.senderAddress == store.daoAddress) {
                store.totalSupply += ton("1");
                val deployTopUpMsg = createMessage({
                    // bounce for collecting fees back
                    bounce: BounceMode.Only256BitsOfBody,
                    value: 0,
                    dest: getAutoAddress(in.senderAddress, in.senderAddress),
                    body: TopUpTons {},
                });
                deployTopUpMsg.send(
                    SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
                );
            }
        }

        EnterLottery => {
            assertCorrectSender(in.senderAddress, msg.sender, store.adminAddress);
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

            reserveGramsOnBalance(
                ton("0.01"),
                RESERVE_MODE_EXACT_AMOUNT,
            );

            val deployMsg = createMessage({
                bounce: BounceMode.Only256BitsOfBody,
                dest: getAutoAddress(
                    msg.winner,
                    store.adminAddress,
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
            assertAdminOrDao(in.senderAddress, store.adminAddress, store.daoAddress);

            others.lotteryCode = msg.newCode;
        }

        HotUpgrade => {
            assertAdminOrDao(
                in.senderAddress,
                store.adminAddress,
                store.daoAddress,
                Errors.IncorrectSender,
            );

            contract.setCodePostponed(msg.code);

            // SAFETY
            setTvmRegisterC3(transformSliceToContinuation(msg.code.beginParse()));
            hotUpgradeFiData(msg.additionalData);

            // early return to avoid saving storage below 
            return;
        }

        // testnetOnly
        Destroy => {
            assertAdminOrDao(
                in.senderAddress,
                store.adminAddress,
                store.daoAddress,
                Errors.IncorrectSender,
            );

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
        jettonWalletCode: fossFiWalletCompiledCodeLibraryRef(),
    };
}

get fun get_jetton_data_all(): FiStore {
    return FiStore.load(); // todo: return contract code + data also
}

get fun get_wallet_address(owner: address): address {
    val store = lazy FiStore.load();
    return getAutoAddress(owner, store.adminAddress).calculateAddress();
}

fun assertCorrectSender(sender: address, owner: address, treasury: address): void {
    assert (
        sender == getAutoAddress(owner, treasury).calculateAddress()
    ) throw Errors.NotValidWallet;
}

fun getAutoAddress(owner: address, treasury: address): AutoDeployAddress {
    return calcDeployFiWallet(
        owner,
        treasury,
        contract.getAddress(),
        fossFiWalletCompiledCodeLibraryRef(),
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
        totalSupply: oldStorage.totalSupply,
        walletVersion: oldStorage.walletVersion,
        adminAddress: oldStorage.adminAddress,
        adminHandoff: oldStorage.adminHandoff,
        metadata: oldStorage.metadata,
        others: oldStorage.others,
    };
    storage.save();
}

get fun get_location_addresses(): map<uint8, address> {
    val store = lazy FiStore.load();
    return store.others.load().locationAddrs;
}

get fun get_dao_address(): address? {
    val store = lazy FiStore.load();
    return store.daoAddress;
}
