import "@stdlib/gas-payments"
import "@stdlib/tvm-lowlevel"
import "@contracts/common/fees-management"
import "@contracts/common/messages"
import "@contracts/common/sharding"
import "@contracts/common/errors"
import "@contracts/followers/messages"
import "@contracts/lottery/messages"
import "@contracts/fossFi/jetton-utils"
import "@contracts/fossFi/storage"
import "@contracts/fossFi/consts"

type AllowedMessageToWallet =
    | AskToTransfer
    | AskToBurn
    | AuthorityAction
    | ChangeId
    | InternalTransferStep
    | InternalInvite
    | InternalDeActivate
    | OthersActions // for future use of new features without upgrade
    | Payback
    | RequestState
    | RequestUpgradeCode
    | SetStatus
    | TopUpTons
    | TransferNotificationForRecipient // forwards invite notif invitor0 owner
    | Upgrade
    | VotingAction
    | EnterLottery
    | UnFollow
    | UnFollowInternal
    | Destroy

type BounceOpToHandle =
    | EnterLottery
    | InternalTransferStep
    | InternalInvite
    | VotingAction
    | UnFollowInternal

// type BounceRich = InternalInvite
// global store: FiWalletStore = lazy FiWalletStore.load();
// global code: cell?; // todo: authorityActionUpgradables 

contract FossFiWallet {
    author: "zeta"
    version: "0.1.0"
    description: "wallet contract for fossFi with personal token, voting, invite system and more"
    storage: FiWalletStore
    incomingMessages: AllowedMessageToWallet
}

fun onBouncedMessage(in: InMessageBounced): void {
    // todo: do we need to check correct sender here?
    in.bouncedBody.skipBouncedPrefix();
    val msg = lazy BounceOpToHandle.fromSlice(in.bouncedBody);
    var store = lazy FiWalletStore.load();
    var restoreAmount: coins = 0;
    match (msg) {
        EnterLottery => {
            restoreAmount = LOTTERY_ENTRY_AMT;
        }

        // todo fixme: ignore < 1 ton symantic txns
        InternalTransferStep => {
            restoreAmount = msg.jettonAmount; // safe to fetch jettonAmount, because it's in the beginning of a message
        }

        // NotifyMinter => restoreAmount = msg.jettonAmount,
        InternalInvite => {
            var maps = store.maps.load();

            restoreAmount = -MBRP_AMOUNT + ton("1"); // 
            maps.invited.delete(in.senderAddress);
            store.connections -= 1;
        }

        VotingAction => {} // todo: need?

        UnFollowInternal => {
            restoreAmount = -MBRP_AMOUNT;
        }
    }

    // todo: need? to burnForce for async reasons
    store.jettonBalance += restoreAmount;
    store.save(); // todo learn: where to call this
}

fun onInternalMessage(in: InMessage): void {
    val msg = lazy AllowedMessageToWallet.fromSlice(in.body);
    var store = lazy FiWalletStore.load();
    var time = lazy store.timestamps.load();
    var addrs = lazy store.addresses.load();
    var trustedAddrs = lazy addrs.trustedJettonAddrs.load();
    var maps = lazy store.maps.load();
    var nomins = lazy addrs.nomInAddrs.load();

    match (msg) {
        ChangeId => {
            assert (
                in.valueCoins > ton("0.5")
            ) throw Errors.NotEnoughGas;                                   // todo : bench and update
            // alternate to assert
            if (in.senderAddress != addrs.owner) {
                throw Errors.IncorrectSender;
            }
            store.id = msg.newId;
        },

        OthersActions => {
            assert (in.senderAddress == addrs.owner) throw Errors.NotOwner;
            // assert (false, 0); // todo what it does?
            // msg.forwardPayload.checkIsCorrectTLBEither();
            assert (
                msg.transferRecipient.getWorkchain() == MY_WORKCHAIN
            ) throw Errors.WrongWorkchain;
            assert(in.valueCoins > ton("0.5"), Errors.NotEnoughGas); // todo : bench and update

            match (msg.jettonAmount) {
                ton("0.101") => {
                    // todo: maybe mint all on init?
                    // claim weekly grant
                    val now = blockchain.now();
                    assert (
                        now > (time.accountInit + ACTIVATION_WAIT)
                    ) throw Errors.WaitMore;                                                   // claim starts after a week
                    assert (
                        // for 2 years, weekly 11,111 tokens can be claimed
                        (now < MAX_CLAIM_PERIOD + time.accountInit) &&
                        (now > ACTIVATION_WAIT + time.lastClaim)
                    ) throw Errors.WaitMore;

                    // todo: votingPower based mint continue after 2 years
                    val claimAmount = ton("11111") + (ton("1") * store.receivedVotes);

                    store.jettonBalance += claimAmount;
                    time.lastClaim = now;
                    // inform minter about new tokens mint
                    val notifyMinterMsg = createMessage({
                        bounce: BounceMode.NoBounce,
                        dest: trustedAddrs.minterAddr,
                        value: 0,
                        body: NotifyMinter {
                            queryId: msg.queryId, // to inform about MINT
                            jettonAmount: claimAmount,
                            burnInitiator: addrs.owner,
                            sendExcessesTo: msg.sendExcessesTo,
                        },
                    });
                    notifyMinterMsg.send(
                        SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE |
                        SEND_MODE_BOUNCE_ON_ACTION_FAIL,
                    );
                }

                ton("0.1") => {
                    // todo: ensure enough fees sent only in vulnerable msg calls (at sending side)
                    // active, !reported
                    idActionChecks(store);
                    val now = blockchain.now();
                    assert (
                        ((now > (time.lastInvite + INVITE_WAIT)) &
                        (now > (time.accountInit + ACTIVATION_WAIT))) |
                        (in.senderAddress == addrs.treasury)
                    ) throw Errors.WaitMore;                                                                                                                                        // invite every 4 hours, spam protection
                    assert (store.connections < 11) throw Errors.MaxConnections;
                    store.connections += 1;
                    time.lastInvite = now;
                    // todo: need incoming ton value to be 10 for spam protection
                    // assert (in.valueCoins >= ton("10")) throw Errors.InsufficientGasSent;

                    // jettonAddrs are saved for easy bounceHandling 
                    maps.invited.set(msg.transferRecipient.getAddrFiWallet(), ton("999"));
                    // 1 goes to invitee
                    store.jettonBalance += MBRP_AMOUNT - ton("1");

                    val inviteInternal = createMessage({
                        bounce: BounceMode.Only256BitsOfBody, // 
                        dest: calcDeployFiWallet(
                            msg.transferRecipient,
                            addrs.treasury,
                            trustedAddrs.minterAddr,
                            addrs.baseFiWalletCode,
                        ),
                        // deploy in invite + standalone for idLess accounts
                        value: 0,
                        body: InternalInvite {
                            queryId: msg.queryId,
                            version: store.version,
                            sender: addrs.owner,
                            invitor: nomins.invitor!, // todo null for dead?
                            currentWalletCode: contract.getCode(),
                            currentStorage: null,
                            id: msg.forwardPayload,
                        },
                    });
                    inviteInternal.send(
                        SEND_MODE_BOUNCE_ON_ACTION_FAIL |
                        SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE,
                    );
                }

                // voting
                ton("0.11") => {
                    // check if votingPower exists
                    assert (store.votes != 0) throw Errors.NoVotesAvailable;
                    assert (
                        msg.transferRecipient != in.senderAddress
                    ) throw Errors.IncorrectReceiver;                                                  // no self-voting
                    val candidate = msg.transferRecipient.getAddrFiWallet();
                    store.votes = 0;
                    maps
                        .votedFor
                        .set(
                            candidate,
                            10,
                        );                                                                             // store to unVoteLater + total votes sent

                    val votingMsg = createMessage({
                        bounce: BounceMode.NoBounce, // todo: ok?
                        dest: candidate,
                        value: 0,
                        body: VotingAction {
                            // positiveVote: true, // default
                            // count: 10, // default
                            sender: addrs.owner,
                        },
                    });
                    votingMsg.send(
                        SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE |
                        SEND_MODE_BOUNCE_ON_ACTION_FAIL,
                    );
                }

                // claim votes back
                ton("0.12") => {
                    val candidate = msg.transferRecipient.getAddrFiWallet();
                    val exists = maps.votedFor.deleteAndGetDeleted(candidate);
                    assert (exists.isFound) throw Errors.NotVotedYet;
                    store.votes += exists.loadValue();

                    val votingMsg = createMessage({
                        bounce: BounceMode.NoBounce,
                        dest: candidate,
                        value: 0,
                        body: VotingAction {
                            positiveVote: false,
                            sender: addrs.owner,
                        },
                    });
                    votingMsg.send(
                        SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE |
                        SEND_MODE_BOUNCE_ON_ACTION_FAIL,
                    );
                }

                ton("0.23") => {
                    // just use single for both txn
                    msg
                        .transferRecipient
                        .deActivate(
                            msg.jettonAmount,
                            store,
                        ); // todo fixme when implementing native ui then use jettonAddrs directly
                }

                ton("0.999") => {
                    // todo: fixme redundant
                    requestUpgrade(
                        trustedAddrs.minterAddr,
                        addrs.owner,
                        store.version,
                    );
                }

                ton("0.404") => {
                    // send AuthorityAction
                    assert (
                        store.isAuthorityAccount || in.senderAddress == addrs.treasury
                    ) throw Errors.IncorrectSender;

                    val authorityMsg = createMessage({
                        bounce: BounceMode.Only256BitsOfBody,
                        dest: msg.transferRecipient.getAddrFiWallet(),
                        value: 0,
                        body: AuthorityAction { sender: addrs.owner },
                    });
                    authorityMsg.send(
                        SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE |
                        SEND_MODE_BOUNCE_ON_ACTION_FAIL,
                    );
                }

                // todo: implement
                ton("0.99") => {
                    store.jettonBalance -= LOTTERY_ENTRY_AMT; // todo: fixme check all deductions
                    enterLottery(
                        addrs.owner,
                        trustedAddrs.minterAddr,
                        LOTTERY_ENTRY_AMT,
                    );                                        // todo: fixme: use lottery addr
                }

                // todo: implement
                ton("0.777") => {
                    if (trustedAddrs.personalJettonMinter == null) {
                        trustedAddrs.personalJettonMinter = msg.transferRecipient;
                    } // else ignore
                }

                ton("0.888") => {
                    // fixme: assert balance is as much as claimed
                    destroyContract(in.senderAddress);
                }

                else => {}
            }
        },

        InternalTransferStep => {
            checkCorrectSenderInternal(in.senderAddress, msg.transferInitiator);
            // sync version
            // assert (msg.version == store.version) throw Errors.UPGRADE;
            if (msg.version == store.version) {
                // continue
            } else if (msg.version < store.version) {
                sendUpgrade(in.senderAddress, addrs.owner, store.version);
            } else {
                requestUpgrade(in.senderAddress, addrs.owner, store.version);
            }
            // val incomingTransfersLocked = ((self.status & 2) == 2);
            // val incomingTransfersLocked = (store.locked != false);
            // require(!incomingTransfersLocked, "Incoming transfers are locked");
            store.jettonBalance += msg.jettonAmount;

            if (msg.transferredAsCredit) {
                // trigger personal token minting
                val mintBody = MintNewJettons {
                    queryId: msg.queryId,
                    mintRecipient: msg.transferInitiator,
                    tonAmount: ton("0.1"), // todo: need for deployment
                    internalTransferMsg: InternalTransferStep {
                        queryId: msg.queryId,
                        jettonAmount: msg.jettonAmount,
                        version: 0,
                        transferredAsCredit: true,
                        transferInitiator: createAddressNone().castToInternal(), // doesn't matter
                        sendExcessesTo: null,
                        forwardTonAmount: ton("0.0001"),
                        forwardPayload: msg.forwardPayload,
                    }.toCell(),
                };
                val outMsg = createMessage({
                    bounce: BounceMode.NoBounce,
                    value: ton("0.1"),
                    dest: trustedAddrs.personalJettonMinter!, // fails if not set
                    body: mintBody,
                });
                outMsg.send(SEND_MODE_PAY_FEES_SEPARATELY | SEND_MODE_IGNORE_ERRORS);
            }

            notifyOwner(
                msg.queryId,
                msg.transferInitiator,
                addrs.owner,
                msg.jettonAmount,
                msg.forwardPayload,
            );

            val excessesTo = msg.sendExcessesTo != null
                ? msg.sendExcessesTo
                : msg.transferInitiator;
            sendExcesses(msg.queryId, in.valueCoins, excessesTo);
        },

        AskToTransfer => {
            // todo: lock transfers initially unless stable
            // assert (false) throw 5;
            // todo : or sender == authorityAccount/minter for force transfer in disputes USDT like control
            // val isFromMaster = in.senderAddress == trustedAddrs.minterAddr;
            // val outgoingTransfersAllowed = ((store.status & 1) == 0);
            // val outgoingTransfersAllowed = (store.locked != true);
            // require(outgoingTransfersAllowed || isFromMaster, "Contract is locked");
            // require(sender() == self.owner || isFromMaster, "Incorrect sender");
            assert (in.senderAddress == addrs.owner) throw Errors.NotOwner;
            // assert (false, 0); // todo what it does?
            msg.forwardPayload.checkIsCorrectTlbEither();
            assert (
                msg.transferRecipient.getWorkchain() == MY_WORKCHAIN
            ) throw Errors.WrongWorkchain;

            checkAmountIsEnoughToTransfer(
                in.valueCoins,
                msg.forwardTonAmount,
                in.originalForwardFee,
            );

            // no self-transfer
            // normal txn
            // todo: fixed fees for now. use subscription based instead that'll be like credit score
            var burnAmount = 0;
            if (store.txnCount > 100) {
                store.txnCount = 0;
                burnAmount = ton("101");
                val notifyMinterMsg = createMessage({
                    bounce: BounceMode.NoBounce,
                    dest: trustedAddrs.minterAddr,
                    value: ton("0.01"),
                    body: NotifyMinter {
                        queryId: 0, // to inform about BURN
                        jettonAmount: burnAmount,
                        burnInitiator: addrs.owner,
                        sendExcessesTo: msg.sendExcessesTo,
                    },
                });
                notifyMinterMsg.send(
                    SEND_MODE_PAY_FEES_SEPARATELY | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
                );
            } else {
                store.txnCount += 1;
            }

            assert (store.jettonBalance >= msg.jettonAmount + burnAmount) throw Errors.BalanceError;
            store.jettonBalance -= msg.jettonAmount + burnAmount;

            val toLeaveOnBalance = contract.getOriginalBalance() - in.valueCoins +
            contract.getStorageDuePayment();
            reserveToncoinsOnBalance(
                max(toLeaveOnBalance, calculateJettonWalletMinStorageFee()),
                RESERVE_MODE_AT_MOST,
            );
            val transferMsg = createMessage({
                bounce: BounceMode.Only256BitsOfBody,
                dest: msg.transferRecipient.getAddrFiWallet(), // only id accounts allowed
                value: 0,
                body: InternalTransferStep {
                    queryId: msg.queryId,
                    jettonAmount: msg.jettonAmount,
                    version: store.version,
                    transferredAsCredit: false, // for now only mint can set this true, can be used for future features like credit system etc.
                    transferInitiator: addrs.owner,
                    sendExcessesTo: msg.sendExcessesTo,
                    forwardTonAmount: msg.forwardTonAmount,
                    forwardPayload: msg.forwardPayload,
                },
            });
            // safety
            transferMsg.send(
                SEND_MODE_CARRY_ALL_BALANCE | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
            ); // return;
        },

        Payback => {
            assert (
                in.senderAddress == trustedAddrs.personalJettonMinter!
            ) throw Errors.IncorrectSender;

            assert (msg.amount < store.jettonBalance) throw Errors.InsufficientBalance;
            store.jettonBalance -= msg.amount; // goes to -ve if required

            val transferMsg = createMessage({
                bounce: BounceMode.Only256BitsOfBody,
                dest: msg.sender.getAddrFiWallet(), // only id accounts allowed
                value: 0,
                body: InternalTransferStep {
                    queryId: msg.queryId,
                    jettonAmount: msg.amount,
                    version: store.version,
                    transferInitiator: addrs.owner,
                    sendExcessesTo: null,
                    forwardTonAmount: 0,
                    forwardPayload: createEmptySlice(),
                },
            });
            transferMsg.send(SEND_MODE_REGULAR | SEND_MODE_IGNORE_ERRORS);
        },

        InternalInvite => {
            // assert (store.jettonBalance == ton("1")) throw Errors.AlreadyInvited;
            assert (!store.active) throw Errors.AlreadyInvited; // cheap calc first/failFast
            assert (in.senderAddress == msg.sender.getAddrFiWallet()) throw Errors.IncorrectSender;

            store.active = true;
            store.jettonBalance = ton("1");
            if (time.accountInit == 0) {
                time.accountInit = blockchain.now();
                nomins.nominee = in.senderAddress; // must be null at init
                // addrs.id = msg.forwardPayload.toCell();
                store.id = msg.id;                 // for future use, can be empty

                if (msg.version > store.version) {
                    store.version = msg.version;
                    contract.setCodePostponed(msg.currentWalletCode);
                    setTvmRegisterC3(
                        // safety
                        transformSliceToContinuation(msg.currentWalletCode.beginParse()),
                    );
                    hotUpgradeFiWalletData(msg.currentStorage);
                }
            }

            nomins.invitor = in.senderAddress; // contract addr
            nomins.invitor0 = msg.invitor;     // todo: null, can deactivate acc

            // notifyOwner(msg.queryId, msg.sender, msg.invitor, ton("0.1"), msg.forwardPayload);

            val notifyMinterMsg = createMessage({
                bounce: BounceMode.NoBounce,
                dest: trustedAddrs.minterAddr,
                value: 0,
                body: InformMinterInviteInternal {
                    queryId: msg.queryId,
                    sender: addrs.owner, // different for mint for addr calc
                    invitor: msg.sender, // just invitor not invitor0
                    id: msg.id,          // for broadcast, ledger update
                },
            });
            notifyMinterMsg.send(
                SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
            );
            // send excesses
            // sendExcesses(msg.queryId, in.valueCoins, msg.sender);
        },

        // both invitor & invitor0 can deactivate
        InternalDeActivate => {
            // need to check correctInternalSender() for STORED jettonAddrs
            assert (
                (in.senderAddress == nomins.invitor0!) | (in.senderAddress == nomins.invitor!)
            ) throw Errors.InviteFirst;                                                                                       // throws if invitor0 null

            store.active = !store.active;
        },

        // DeActivate accounts
        AuthorityAction => {
            checkCorrectSenderInternal(in.senderAddress, msg.sender);
            // not allowed to block authority
            assert (!store.isAuthorityAccount) throw Errors.IncorrectReceiver;
            store.active = !store.active; // todo fixme: action override by others(invitor0 etc)
            if (store.jettonBalance != 0) {
                val transferMsg = createMessage({
                    bounce: BounceMode.Only256BitsOfBody,
                    dest: in.senderAddress, // to authority
                    value: 0,
                    body: InternalTransferStep {
                        queryId: 0,
                        jettonAmount: store.jettonBalance,              // all coins
                        version: store.version,
                        transferInitiator: addrs.owner,
                        sendExcessesTo: addrs.owner,
                        forwardTonAmount: 0,
                        forwardPayload: "authorityFreeze".beginParse(), // todo
                    },
                });
                transferMsg.send(
                    SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
                );
            }
        },

        // for granular control
        SetStatus => {
            // todo fixme : check correct sender
            store.status = msg.status;
        },

        RequestUpgradeCode => {
            // todo: need? this check
            checkCorrectSenderInternal(in.senderAddress, msg.sender);
            sendUpgrade(in.senderAddress, addrs.owner, store.version);
        },

        Upgrade => {
            // todo: acc active is checked, need this for upgrades?
            checkCorrectSenderInternal(in.senderAddress, msg.sender);
            if (store.version < msg.walletVersion) {
                // ignore if manually upgraded
                store.version = msg.walletVersion;
                contract.setCodePostponed(msg.newCode!);
                // safety
                setTvmRegisterC3(transformSliceToContinuation(msg.newCode!.beginParse()));
                // any migration logic
                hotUpgradeFiWalletData(msg.newData);

                // send upgrade to all invitees
                val invitees = maps.invited;
                var invitee = invitees.findFirst();
                while (invitee.isFound) {
                    // ...
                    val upgradeMsg = createMessage({
                        bounce: BounceMode.NoBounce,
                        value: ton("0.1"),
                        dest: invitee.getKey(),
                        body: msg, // same upgrade msg
                    });
                    upgradeMsg.send(
                        SEND_MODE_PAY_FEES_SEPARATELY | SEND_MODE_IGNORE_ERRORS,
                    ); // todo: fees mode & enough grams remaining or fund more

                    invitee = invitees.iterateNext(invitee);
                }
            }
        },

        VotingAction => {
            checkCorrectSenderInternal(in.senderAddress, msg.sender);
            msg.positiveVote ? store.receivedVotes += msg.count : store.receivedVotes -= msg.count;
            if (addrs.owner != addrs.treasury) {
                store.isAuthorityAccount = store.receivedVotes > AUTHORITY_THRESHOLD ? true : false;
            }
        },

        AskToBurn => {
            assert (false) throw Errors.InvalidMessage; // not allowed
        },

        TopUpTons => {
            // deploy + just accept tons
            if (time.accountInit == 0 && (in.senderAddress == trustedAddrs.minterAddr)) {
                store.active = true;
                store.jettonBalance += ton("1");
                store.isAuthorityAccount = true;
                time.accountInit = blockchain.now();
                nomins.invitor = contract.getAddress();
                nomins.invitor0 = contract.getAddress();
            }
        },

        TransferNotificationForRecipient => {
            // noNeed2check correctSender in harmless(non state changing) msg
            notifyOwner(
                msg.queryId,
                msg.transferInitiator,
                addrs.owner,
                msg.jettonAmount,
                msg.forwardPayload,
            );
        },

        EnterLottery => {
            checkCorrectSenderInternal(in.senderAddress, msg.sender);
            enterLottery(addrs.owner, trustedAddrs.minterAddr, msg.amount);
        },

        UnFollow => {
            assert (in.senderAddress == addrs.owner) throw Errors.IncorrectSender;
            // todo: fixme: check fees
            // todo: implement via minter as proxy
            // createMessage({
            //     bounce: BounceMode.Only256BitsOfBody, // for fees back
            //     value: 0,
            //     dest: msg.followee.getAddrFiWallet(),
            //     body: UnFollowInternal {
            //         queryId: msg.queryId,
            //         follow: msg.follow,
            //         sender: addrs.owner,
            //     },
            // }).send(SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_BOUNCE_ON_ACTION_FAIL);
        },

        UnFollowInternal => {
            checkCorrectSenderInternal(in.senderAddress, msg.sender);
            // store.jettonBalance += MBRP_AMOUNT;
            // var to;
            // msg.follow ?
            //     to = msg.followee.calcDeployUnFollow(msg.sender) :
            //     to = msg.followee.calcDeployUnFollow(msg.sender).calculateAddress();
            // createMessage({
            //     bounce: BounceMode.Only256BitsOfBody, // deduct balance
            //     value: 0,
            //     dest: to,
            //     body: msg,
            // }).send(SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_BOUNCE_ON_ACTION_FAIL);
        },

        // testnetOnly
        Destroy => {
            assert (in.senderAddress == addrs.owner) throw Errors.IncorrectSender;
            // todo: or authrity can destroy
            // todo: assert(store.jettonBalance == store.claimedAmount)
            destroyContract(in.senderAddress);
            // todo: full invite chain destroy
        },

        // for migration to other network states
        RequestState => {
            assert (in.valueCoins == ton("1")) throw Errors.InsufficientGasSent;

            val stateMsg = createMessage({
                bounce: BounceMode.NoBounce,
                dest: in.senderAddress,
                value: 0,
                body: ProvideState {
                    state: store.toCell(),
                },
            });
            stateMsg.send(SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_IGNORE_ERRORS);
        }

        else => {
            // invalid input; a typical reaction is:
            // ignore empty messages, "wrong opcode" if not
            assert (in.body.isEmpty()) throw Errors.InvalidMessage;
        }
    }

    addrs.nomInAddrs = nomins.toCell();
    addrs.trustedJettonAddrs = trustedAddrs.toCell();
    store.timestamps = time.toCell();
    store.addresses = addrs.toCell();
    store.maps = maps.toCell();
    store.save(); // save once for any matches above
}

get fun get_wallet_data(): JettonWalletDataReply {
    val store = lazy FiWalletStore.load();
    val addrs = lazy store.addresses.load();

    return {
        jettonBalance: store.jettonBalance,
        ownerAddress: addrs.owner,
        minterAddress: addrs.trustedJettonAddrs.load().minterAddr,
        jettonWalletCode: addrs.baseFiWalletCode, // embeded init code
    };
}

get fun get_wallet_data_all(): FiWalletStore {
    return FiWalletStore.load();
}

get fun get_id(): string {
    val store = lazy FiWalletStore.load();
    return store.id;
}
