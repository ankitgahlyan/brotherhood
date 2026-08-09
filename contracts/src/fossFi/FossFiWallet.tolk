import "@stdlib/tvm-lowlevel"
import "@contracts/common/errors"
import "@contracts/common/fees-management"
import "@contracts/common/internal-transfer"
import "@contracts/common/messages"
import "@contracts/common/sharding"
import "@contracts/followers/messages"
import "@contracts/fossFi/consts"
import "@contracts/fossFi/jetton-utils"
import "@contracts/fossFi/storage"
import "@contracts/lottery/messages"

type AllowedMessageToWallet =
    | AskToTransfer
    | AskToBurn
    | BuyCredit
    | AuthorityAction
    | ChangeUsername
    | ChangeCity
    | InternalTransferStep
    | InternalInvite
    | InternalDeActivate
    | ActAction // owner-initiated actions (invite, vote, claim, lottery, destroy, ...)
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
    | SetAllowance
    | SpendAllowance
    | AskGoldCoinsTransfer
    | InternalGoldCoinsTransfer
    | TriggerDecay

type BounceOpToHandle =
    | EnterLottery
    | InternalTransferStep
    | InternalInvite
    | VotingAction
    | UnFollowInternal
    | InternalGoldCoinsTransfer

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
    var restoreGoldCoins: uint32 = 0;
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

        InternalGoldCoinsTransfer => {
            restoreGoldCoins = msg.amount;
        }
    }

    store.jettonBalance += restoreAmount;
    store.goldCoins += restoreGoldCoins;
    store.save(); // todo learn: where to call this
}

fun onInternalMessage(in: InMessage): void {
    val msg = lazy AllowedMessageToWallet.fromSlice(in.body);
    var store = lazy FiWalletStore.load();
    var profile = lazy store.profile.load();
    var time = lazy store.timestamps.load();
    var addrs = lazy store.addresses.load();
    var trustedAddrs = lazy addrs.trustedJettonAddrs.load();
    var maps = lazy store.maps.load();
    var nomins = lazy addrs.nomInAddrs.load();

    match (msg) {
        ChangeUsername => {
            assert (in.valueCoins > ton("0.05")) throw Errors.NotEnoughGas;
            if (in.senderAddress != addrs.owner) {
                throw Errors.IncorrectSender;
            }
            profile.username = msg.newUsername;
        }

        ChangeCity => {
            assert (in.valueCoins > ton("0.05")) throw Errors.NotEnoughGas;
            if (in.senderAddress != addrs.owner) {
                throw Errors.IncorrectSender;
            }
            val oldCity = profile.city;
            profile.city = msg.newCity;

            val notifyMinterMsg = createMessage({
                bounce: BounceMode.NoBounce,
                dest: trustedAddrs.minterAddr,
                value: 0,
                body: InformMinterChangeCity {
                    queryId: msg.queryId,
                    owner: addrs.owner,
                    oldCity,
                    newCity: msg.newCity,
                },
            });
            notifyMinterMsg.send(
                SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
            );
        }

        ActClaimWeeklyGrant => {
            checkOwnerAction(in.senderAddress, in.valueCoins, addrs.owner);
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
            val claimAmount = WEEKLY_CLAIM_AMOUNT;

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
                SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
            );
        }

        ActInvite => {
            checkOwnerAction(in.senderAddress, in.valueCoins, addrs.owner);
            checkActionRecipient(msg.transferRecipient);
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
                    username: msg.username,
                    city: msg.city,
                },
            });
            inviteInternal.send(
                SEND_MODE_BOUNCE_ON_ACTION_FAIL | SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE,
            );
        }

        // voting
        ActVote => {
            checkOwnerAction(in.senderAddress, in.valueCoins, addrs.owner);
            checkActionRecipient(msg.transferRecipient);
            // check if votingPower exists
            assert (store.votes != 0) throw Errors.NoVotesAvailable;
            assert (
                msg.transferRecipient != in.senderAddress
            ) throw Errors.IncorrectReceiver;                                                  // no self-voting
            val candidate = msg.transferRecipient.getAddrFiWallet();
            store.votes = 0;
            var social = lazy maps.social.load();
            social
                .votedFor
                .set(
                    candidate,
                    10,
                );                                                                             // store to unVoteLater + total votes sent
            maps.social = social.toCell();

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
                SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
            );
        }

        // claim votes back
        ActUnvote => {
            checkOwnerAction(in.senderAddress, in.valueCoins, addrs.owner);
            checkActionRecipient(msg.transferRecipient);
            val candidate = msg.transferRecipient.getAddrFiWallet();
            var social = lazy maps.social.load();
            val exists = social.votedFor.deleteAndGetDeleted(candidate);
            assert (exists.isFound) throw Errors.NotVotedYet;
            maps.social = social.toCell();
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
                SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
            );
        }

        ActDeactivate => {
            checkOwnerAction(in.senderAddress, in.valueCoins, addrs.owner);
            checkActionRecipient(msg.transferRecipient);
            // just use single for both txn
            msg
                .transferRecipient
                .deActivate(
                    0,
                    store,
                ); // todo fixme when implementing native ui then use jettonAddrs directly
        }

        ActRequestUpgrade => {
            checkOwnerAction(in.senderAddress, in.valueCoins, addrs.owner);
            // todo: fixme redundant
            requestUpgrade(
                trustedAddrs.minterAddr,
                addrs.owner,
                store.version,
            );
        }

        ActDispatchAuthorityAction => {
            checkOwnerAction(in.senderAddress, in.valueCoins, addrs.owner);
            checkActionRecipient(msg.transferRecipient);
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
                SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
            );
        }

        // todo: implement
        ActJoinLottery => {
            checkOwnerAction(in.senderAddress, in.valueCoins, addrs.owner);
            store.jettonBalance -= LOTTERY_ENTRY_AMT; // todo: fixme check all deductions
            enterLottery(
                addrs.owner,
                trustedAddrs.minterAddr,
                LOTTERY_ENTRY_AMT,
            );                                        // todo: fixme: use lottery addr
        }

        // todo: implement
        ActSetPersonalJettonMinter => {
            checkOwnerAction(in.senderAddress, in.valueCoins, addrs.owner);
            checkActionRecipient(msg.transferRecipient);
            if (trustedAddrs.personalJettonMinter == null) {
                trustedAddrs.personalJettonMinter = msg.transferRecipient;
            } // else ignore
        }

        ActDestroyAccount => {
            checkOwnerAction(in.senderAddress, in.valueCoins, addrs.owner);
            // fixme: assert balance is as much as claimed
            destroyContract(in.senderAddress);
        }

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
                    tonAmount: ton("0.1"),
                    internalTransferMsg: makeInternalTransferStep(
                        msg.queryId,
                        msg.jettonAmount,
                        msg.transferInitiator, // the buyer
                        null,                  // sendExcessesTo
                        ton("0.0001"),
                        beginCell().storeMaybeRef(null).endCell().beginParse(),
                        0,                     // version
                        true,                  // transferredAsCredit
                    ),
                };
                val mintMsg = createMessage({
                    bounce: BounceMode.NoBounce,
                    value: ton("0.1"),
                    dest: trustedAddrs.personalJettonMinter!, // fails if not set
                    body: mintBody.toCell(),
                });
                mintMsg.send(SEND_MODE_PAY_FEES_SEPARATELY | SEND_MODE_IGNORE_ERRORS);
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
        }

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
            assert (store.jettonBalance >= msg.jettonAmount) throw Errors.BalanceError;
            store.jettonBalance -= msg.jettonAmount;

            reserveForBalance(in.valueCoins);
            val transferMsg = createMessage({
                bounce: BounceMode.Only256BitsOfBody,
                dest: msg.transferRecipient.getAddrFiWallet(), // only id accounts allowed
                value: 0,
                body: makeInternalTransferStep(
                    msg.queryId,
                    msg.jettonAmount,
                    addrs.owner,
                    msg.sendExcessesTo,
                    msg.forwardTonAmount,
                    msg.forwardPayload,
                    store.version,
                ),
            });
            // safety
            transferMsg.send(
                SEND_MODE_CARRY_ALL_BALANCE | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
            ); // return;
        }

        BuyCredit => {
            assert (in.senderAddress == addrs.owner) throw Errors.NotOwner;
            assert (
                msg.transferRecipient.getWorkchain() == MY_WORKCHAIN
            ) throw Errors.WrongWorkchain;
            checkAmountIsEnoughToTransfer(in.valueCoins, 0, in.originalForwardFee);
            // no self-credit
            assert (store.jettonBalance >= msg.jettonAmount) throw Errors.BalanceError;
            store.jettonBalance -= msg.jettonAmount;

            reserveForBalance(in.valueCoins);
            val transferMsg = createMessage({
                bounce: BounceMode.Only256BitsOfBody,
                dest: msg.transferRecipient.getAddrFiWallet(), // issuer's account
                value: 0,
                body: makeInternalTransferStep(
                    msg.queryId,
                    msg.jettonAmount,
                    addrs.owner,
                    msg.sendExcessesTo,
                    0,
                    createEmptySlice(),
                    store.version,
                    true, // transferredAsCredit: land in the issuer wallet as a loan, triggers its personal-token mint
                ),
            });
            transferMsg.send(
                SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
            );
        }

        Payback => {
            assert (
                in.senderAddress == trustedAddrs.personalJettonMinter!
            ) throw Errors.IncorrectSender;

            assert (msg.amount <= store.jettonBalance) throw Errors.InsufficientBalance;
            store.jettonBalance -= msg.amount;

            val transferMsg = createMessage({
                bounce: BounceMode.Only256BitsOfBody,
                dest: msg.sender.getAddrFiWallet(), // only id accounts allowed
                value: 0,
                body: makeInternalTransferStep(
                    msg.queryId,
                    msg.amount,
                    addrs.owner,
                    null,
                    0,
                    createEmptySlice(),
                    store.version,
                ),
            });
            // carry the Payback message value so the buyer's wallet can afford the transfer
            transferMsg.send(SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_IGNORE_ERRORS);
        }

        InternalInvite => {
            // assert (store.jettonBalance == ton("1")) throw Errors.AlreadyInvited;
            assert (!store.active) throw Errors.AlreadyInvited; // cheap calc first/failFast
            assert (in.senderAddress == msg.sender.getAddrFiWallet()) throw Errors.IncorrectSender;

            store.active = true;
            store.jettonBalance = ton("1");
            if (time.accountInit == 0) {
                time.accountInit = blockchain.now();
                nomins.nominee = in.senderAddress; // must be null at init
                profile.username = msg.username;
                profile.city = msg.city;

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
                    username: msg.username,
                    city: msg.city,
                },
            });
            notifyMinterMsg.send(
                SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
            );
            // send excesses
            // sendExcesses(msg.queryId, in.valueCoins, msg.sender);
        }

        // both invitor & invitor0 can deactivate
        InternalDeActivate => {
            // need to check correctInternalSender() for STORED jettonAddrs
            assert (
                (in.senderAddress == nomins.invitor0!) | (in.senderAddress == nomins.invitor!)
            ) throw Errors.InviteFirst;                                                                                       // throws if invitor0 null

            store.active = !store.active;
        }

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
                    body: makeInternalTransferStep(
                        0,
                        store.jettonBalance,            // all coins
                        addrs.owner,
                        addrs.owner,                    // sendExcessesTo
                        0,
                        "authorityFreeze".beginParse(), // todo
                        store.version,
                    ),
                });
                transferMsg.send(
                    SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
                );
            }
        }

        // for granular control
        SetStatus => {
            // todo fixme : check correct sender
            store.status = msg.status;
        }

        RequestUpgradeCode => {
            // todo: need? this check
            checkCorrectSenderInternal(in.senderAddress, msg.sender);
            sendUpgrade(in.senderAddress, addrs.owner, store.version);
        }

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
        }

        VotingAction => {
            checkCorrectSenderInternal(in.senderAddress, msg.sender);
            msg.positiveVote ? store.receivedVotes += msg.count : store.receivedVotes -= msg.count;
            if (addrs.owner != addrs.treasury) {
                store.isAuthorityAccount = store.receivedVotes > AUTHORITY_THRESHOLD ? true : false;
            }
        }

        AskToBurn => {
            // assert (false) throw Errors.InvalidMessage; // not allowed
            checkAmountIsEnoughToBurn(in.valueCoins);
            assert (in.senderAddress == addrs.owner) throw Errors.NotOwner;
            assert (store.jettonBalance >= msg.jettonAmount) throw Errors.BalanceError;
            store.jettonBalance -= msg.jettonAmount;

            val notifyMinterMsg = createMessage({
                bounce: BounceMode.Only256BitsOfBody,
                dest: trustedAddrs.minterAddr,
                value: 0,
                body: NotifyMinter {
                    queryId: msg.queryId,
                    jettonAmount: msg.jettonAmount,
                    burnInitiator: addrs.owner,
                    sendExcessesTo: msg.sendExcessesTo,
                },
            });
            notifyMinterMsg.send(
                SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
            );
        }

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
        }

        TransferNotificationForRecipient => {
            // noNeed2check correctSender in harmless(non state changing) msg
            notifyOwner(
                msg.queryId,
                msg.transferInitiator,
                addrs.owner,
                msg.jettonAmount,
                msg.forwardPayload,
            );
        }

        EnterLottery => {
            checkCorrectSenderInternal(in.senderAddress, msg.sender);
            enterLottery(addrs.owner, trustedAddrs.minterAddr, msg.amount);
        }

        UnFollow => {
            assert (in.senderAddress == addrs.owner) throw Errors.IncorrectSender;
            idActionChecks(store); // active + not Under Review
            assert (msg.followee != addrs.owner) throw Errors.IncorrectReceiver;

            val target = msg.followee.getAddrFiWallet();
            var social = lazy maps.social.load();
            if (msg.follow) {
                // follow: mint FI for the link and record it (reversible)
                assert (!social.followings.get(target).isFound) throw Errors.ConnectionExists;
                social.followings.set(target, FOLLOW_MINT_AMOUNT);
                maps.social = social.toCell();
                store.jettonBalance += FOLLOW_MINT_AMOUNT;

                val mintMsg = createMessage({
                    bounce: BounceMode.NoBounce,
                    dest: trustedAddrs.minterAddr,
                    value: 0,
                    body: NotifyMinter {
                        queryId: msg.queryId != 0 ? msg.queryId : 1, // nonzero = MINT in minter
                        jettonAmount: FOLLOW_MINT_AMOUNT,
                        burnInitiator: addrs.owner,
                        sendExcessesTo: null,
                    },
                });
                mintMsg.send(
                    SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
                );
            } else {
                // unfollow: burn exactly what the link minted; shortfall fails cleanly here
                val link = social.followings.get(target);
                assert (link.isFound) throw Errors.NotFollowing;
                assert (store.jettonBalance >= FOLLOW_MINT_AMOUNT) throw Errors.BalanceError;
                social.followings.delete(target);
                maps.social = social.toCell();
                store.jettonBalance -= FOLLOW_MINT_AMOUNT;

                val burnMsg = createMessage({
                    bounce: BounceMode.NoBounce,
                    dest: trustedAddrs.minterAddr,
                    value: 0,
                    body: NotifyMinter {
                        queryId: 0, // zero = BURN in minter
                        jettonAmount: FOLLOW_MINT_AMOUNT,
                        burnInitiator: addrs.owner,
                        sendExcessesTo: null,
                    },
                });
                burnMsg.send(
                    SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
                );
            }
        }

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
        }

        // testnetOnly
        Destroy => {
            assert (in.senderAddress == addrs.owner) throw Errors.IncorrectSender;
            // todo: or authrity can destroy
            // todo: assert(store.jettonBalance == store.claimedAmount)
            destroyContract(in.senderAddress);
            // todo: full invite chain destroy
        }

        SetAllowance => {
            assert (in.senderAddress == addrs.owner) throw Errors.NotOwner;
            if (msg.amount == 0) {
                maps.allowances.delete(msg.grantee);
            } else {
                maps.allowances.set(msg.grantee, msg.amount);
            }
        }

        SpendAllowance => {
            val granted = maps.allowances.get(in.senderAddress);
            assert (granted.isFound) throw Errors.NotFollowing;
            val remaining = granted.loadValue();
            assert (remaining >= msg.amount) throw Errors.InsufficientBalance;
            assert (store.jettonBalance >= msg.amount) throw Errors.BalanceError;

            checkAmountIsEnoughToTransfer(in.valueCoins, 0, in.originalForwardFee);

            if (remaining == msg.amount) {
                maps.allowances.delete(in.senderAddress);
            } else {
                maps.allowances.set(in.senderAddress, remaining - msg.amount);
            }
            store.jettonBalance -= msg.amount;

            val transferMsg = createMessage({
                bounce: BounceMode.Only256BitsOfBody,
                dest: msg.receiver.getAddrFiWallet(),
                value: 0,
                body: makeInternalTransferStep(
                    msg.queryId,
                    msg.amount,
                    addrs.owner,
                    msg.sendExcessesTo,
                    0,
                    createEmptySlice(),
                    store.version,
                ),
            });
            transferMsg.send(
                SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
            );
        }

        AskGoldCoinsTransfer => {
            assert (in.senderAddress == addrs.owner) throw Errors.NotOwner;
            assert (msg.amount > 0) throw Errors.IncorrectReceiver;
            assert (store.goldCoins >= msg.amount) throw Errors.BalanceError;
            store.goldCoins -= msg.amount;

            reserveForBalance(in.valueCoins);
            val transferMsg = createMessage({
                bounce: BounceMode.Only256BitsOfBody,
                dest: msg.receiver.getAddrFiWallet(),
                value: 0,
                body: InternalGoldCoinsTransfer {
                    queryId: msg.queryId,
                    amount: msg.amount,
                    transferInitiator: addrs.owner,
                },
            });
            transferMsg.send(
                SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
            );
        }

        InternalGoldCoinsTransfer => {
            checkCorrectSenderInternal(in.senderAddress, msg.transferInitiator);
            store.goldCoins += msg.amount;
            sendExcesses(msg.queryId, in.valueCoins, in.senderAddress);
        }

        TriggerDecay => {
            // keeper-triggered, no sender auth: burning another's decayed balance is harmless
            val now = blockchain.now();
            if (time.lastDecay == 0) {
                time.lastDecay = now;
            } else {
                val elapsed = now - time.lastDecay;
                val months = elapsed / DECAY_MONTH_SECONDS;
                if (months > 0) {
                    // burn proportional to elapsed time: multiply elapsed seconds by the
                    // total claimed, then divide by the combined period, keeping precision
                    val burnAmount = min(
                        store.jettonBalance,
                        max(
                            months,
                            elapsed * ton("1158718") / (DECAY_MONTH_SECONDS * DECAY_MONTHS_TOTAL),
                        ),
                    ); // total claimed 1158718 ton approx.
                    // todo: if balance is less than burnAmount, then burn whatever available and increase debt to be paid later. This is to avoid negative balance and allow for future minting/transfers to cover the debt.
                    if (burnAmount > 0) {
                        store.jettonBalance -= burnAmount;
                        val notifyMinterMsg = createMessage({
                            bounce: BounceMode.NoBounce,
                            dest: trustedAddrs.minterAddr,
                            value: 0,
                            body: NotifyMinter {
                                queryId: 0, // to inform about BURN
                                jettonAmount: burnAmount,
                                burnInitiator: addrs.owner,
                                sendExcessesTo: null,
                            },
                        });
                        notifyMinterMsg.send(
                            SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE |
                            SEND_MODE_BOUNCE_ON_ACTION_FAIL,
                        );
                    }
                    time.lastDecay = now - elapsed % DECAY_MONTH_SECONDS;
                }
            }
        }

        // for migration to other network states
        RequestState => {
            assert (in.valueCoins == ton("1")) throw Errors.InsufficientGasSent;

            val stateMsg = createMessage({
                bounce: BounceMode.NoBounce,
                dest: in.senderAddress,
                value: 0,
                body: ProvideState { state: store.toCell() },
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
    store.profile = profile.toCell();
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

get fun get_username(): string {
    val store = lazy FiWalletStore.load();
    val profile = lazy store.profile.load();
    return profile.username;
}

get fun get_city(): string {
    val store = lazy FiWalletStore.load();
    val profile = lazy store.profile.load();
    return profile.city;
}
