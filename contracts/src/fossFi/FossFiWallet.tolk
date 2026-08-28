import "@stdlib/tvm-lowlevel"

import "@gen/Following.code"
import "@gen/Poll.code"
import "@contracts/common/errors"
import "@contracts/common/fees-management"
import "@contracts/common/internal-transfer"
import "@contracts/common/messages"
import "@contracts/common/sharding"
import "@contracts/common/utils"
import "@contracts/dao/dao-utils"
import "@contracts/followers/consts"
import "@contracts/followers/following-utils"
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
    | ChangeLocation
    | ChangeCountry
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
    | Follow
    | Unfollow
    | RequestFollow
    | RequestUnfollow
    | FollowRevertedNotification
    | UnfollowRevertedNotification
    | SettleDeath
    | Destroy
    | SetAllowance
    | SpendAllowance
    | AskGoldCoinsTransfer
    | InternalGoldCoinsTransfer
    | TriggerDecay
    | SetCreditNeed
    | SetMultiplier
    | RepayDebt
    | ActCloseAccount
    | AuthorityCloseAccount

type BounceOpToHandle =
    | EnterLottery
    | InternalTransferStep
    | InternalInvite
    | VotingAction
    | InternalGoldCoinsTransfer
    | RequestFollow
    | RequestUnfollow
    | BouncedInitFollow
    | BouncedUnfollow

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
    val addrs = lazy store.addresses.load();
    val trustedAddrs = lazy addrs.trustedJettonAddrs.load();
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

        VotingAction => {
            if (msg.positiveVote) {
                store.votes += msg.count;
                var maps = store.maps.load();
                var social = maps.social.load();
                social.votedFor.delete(in.senderAddress);
                maps.social = social.toCell();
                store.maps = maps.toCell();
            }
        }

        InternalGoldCoinsTransfer => {
            restoreGoldCoins = msg.amount;
        }

        RequestFollow => {
            var maps = store.maps.load();
            var social = maps.social.load();
            if (social.followingCount > 0) {
                social.followingCount -= 1;
            }
            maps.social = social.toCell();
            store.maps = maps.toCell();
        }

        RequestUnfollow => {
            var maps = store.maps.load();
            var social = maps.social.load();
            social.followingCount += 1;
            maps.social = social.toCell();
            store.maps = maps.toCell();
        }

        BouncedInitFollow => {
            var maps = store.maps.load();
            var social = maps.social.load();
            if (social.followersCount > 0) {
                social.followersCount -= 1;
            }
            maps.social = social.toCell();
            store.maps = maps.toCell();

            restoreAmount = -FOLLOW_MINT_AMOUNT;

            val notifyMinterMsg = createMessage({
                bounce: BounceMode.NoBounce,
                dest: trustedAddrs.minterAddr,
                value: ton("0.05"),
                body: NotifyMinter {
                    queryId: 0, // zero = BURN in minter
                    jettonAmount: FOLLOW_MINT_AMOUNT,
                    burnInitiator: addrs.owner,
                    sendExcessesTo: null,
                },
            });
            notifyMinterMsg.send(SEND_MODE_IGNORE_ERRORS);
        }

        BouncedUnfollow => {
            var maps = store.maps.load();
            var social = maps.social.load();
            social.followersCount += 1;
            maps.social = social.toCell();
            store.maps = maps.toCell();

            val debtReduction = min(store.debt, FOLLOW_MINT_AMOUNT);
            store.debt -= debtReduction;
            if (store.debt == 0) {
                store.debts = false;
            }
            restoreAmount = FOLLOW_MINT_AMOUNT - debtReduction;

            val mintedBack = FOLLOW_MINT_AMOUNT - debtReduction;
            if (mintedBack > 0) {
                val notifyMinterMsg = createMessage({
                    bounce: BounceMode.NoBounce,
                    dest: trustedAddrs.minterAddr,
                    value: ton("0.05"),
                    body: NotifyMinter {
                        queryId: 1, // nonzero = MINT in minter
                        jettonAmount: mintedBack,
                        burnInitiator: addrs.owner,
                        sendExcessesTo: null,
                    },
                });
                notifyMinterMsg.send(SEND_MODE_IGNORE_ERRORS);
            }
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
    var social = lazy maps.social.load();

    // force destroy
    // val forceDestroy = false;
    // forceDestroy ? destroyContract(in.senderAddress) :

    match (msg) {
        ChangeUsername => {
            assert (in.valueCoins > ton("0.05")) throw Errors.NotEnoughGas;
            assert (isNonEmptyString(msg.newUsername)) throw Errors.ProvideCoordinates;

            if (in.senderAddress != addrs.owner) {
                throw Errors.IncorrectSender;
            }
            profile.username = msg.newUsername;
        }

        ChangeLocation => {
            assert (in.valueCoins > ton("0.05")) throw Errors.NotEnoughGas;
            if (in.senderAddress != addrs.owner) {
                throw Errors.IncorrectSender;
            }
            assert (isNonEmptyString(msg.newH3Cell)) throw Errors.ProvideCoordinates;

            val oldH3Cell = profile.h3Cell;
            profile.h3Cell = msg.newH3Cell;

            val notifyMinterMsg = createMessage({
                bounce: BounceMode.NoBounce,
                dest: trustedAddrs.minterAddr,
                value: 0,
                body: InformMinterChangeLocation {
                    queryId: msg.queryId,
                    owner: addrs.owner,
                    oldH3Cell,
                    newH3Cell: msg.newH3Cell,
                },
            });
            notifyMinterMsg.send(
                SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
            );
        }

        ChangeCountry => {
            assert (in.valueCoins > ton("0.05")) throw Errors.NotEnoughGas;
            if (in.senderAddress != addrs.owner) {
                throw Errors.IncorrectSender;
            }
            assert (store.votes == 10) throw Errors.HasActiveVotes;

            profile.country = msg.newCountry;
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
                    queryId: msg.queryId != 0 ? msg.queryId : 1, // to inform about MINT
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
            assert (
                isNonEmptyString(msg.username) && isNonEmptyString(msg.h3Cell)
            ) throw Errors.ProvideCoordinates;

            val now = blockchain.now();
            assert (
                ((now > (time.lastInvite + INVITE_WAIT)) &
                (now > (time.accountInit + ACTIVATION_WAIT))) |
                (store.isPrevilegedAccount)
            ) throw Errors.WaitMore;                                                                                                                               // every 4 hours, spam protection
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
                    trustedAddrs.minterAddr,
                    contract.getCode(), // todo: fixme: change to fossFiWalletCompiledCodeLibraryRef() after first upgrade at all places to avoid storage costs and now it creates a curcular dep
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
                    h3Cell: msg.h3Cell,
                    country: msg.country,
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
            social
                .votedFor
                .set(
                    candidate,
                    10,
                );                                                                             // store to unVoteLater + total votes sent

            val votingMsg = createMessage({
                bounce: BounceMode.Only256BitsOfBody,
                dest: candidate,
                value: 0,
                body: VotingAction {
                    // positiveVote: true, // default
                    // count: 10, // default
                    sender: addrs.owner,
                    country: profile.country,
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
            val exists = social.votedFor.deleteAndGetDeleted(candidate);
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
                store.isAuthorityAccount || store.isPrevilegedAccount
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
            if (trustedAddrs.personalJettonMinter == ZERO_ADDRESS) {
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
                // Credit Need gate (#23)
                assert (store.creditNeed > 0) throw Errors.CreditNeedExceeded;
                val acceptedAmount = min(msg.jettonAmount, store.creditNeed);
                val refundAmount = msg.jettonAmount - acceptedAmount;
                store.creditNeed -= acceptedAmount;

                if (refundAmount > 0) {
                    store.jettonBalance -= refundAmount;

                    // refund excess FI jettons back to buyer
                    val refundMsg = createMessage({
                        bounce: BounceMode.Only256BitsOfBody,
                        dest: msg.transferInitiator.getAddrFiWallet(),
                        value: ton("0.05"),
                        body: makeInternalTransferStep(
                            msg.queryId,
                            refundAmount,
                            addrs.owner,
                            msg.sendExcessesTo,
                            0,
                            createEmptySlice(),
                            store.version,
                            false,
                        ),
                    });
                    refundMsg.send(SEND_MODE_PAY_FEES_SEPARATELY | SEND_MODE_IGNORE_ERRORS);
                }

                // trigger personal token minting
                val mintPersonalAmount = acceptedAmount * store.multiplier;
                val mintBody = MintNewJettons {
                    queryId: msg.queryId,
                    mintRecipient: msg.transferInitiator,
                    tonAmount: ton("0.1"),
                    internalTransferMsg: makeInternalTransferStep(
                        msg.queryId,
                        mintPersonalAmount,
                        msg.transferInitiator, // the buyer
                        null,                  // sendExcessesTo,
                        ton("0.0001"),
                        beginCell().storeMaybeRef(null).endCell().beginParse(),
                        0,                     // version
                        true,                  // transferredAsCredit
                    ),
                };
                val mintMsg = createMessage({
                    bounce: BounceMode.NoBounce,
                    value: ton("0.1"),
                    dest: trustedAddrs.personalJettonMinter, // fails if not set
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
            assert (in.senderAddress == addrs.owner) throw Errors.NotOwner;
            checkDebts(store);
            msg.forwardPayload.checkIsCorrectTlbEither();
            assert (
                msg.transferRecipient.getWorkchain() == MY_WORKCHAIN
            ) throw Errors.WrongWorkchain;

            checkAmountIsEnoughToTransfer(
                in.valueCoins,
                msg.forwardTonAmount,
                in.originalForwardFee,
            );

            assert (store.jettonBalance >= msg.jettonAmount) throw Errors.BalanceError;
            store.jettonBalance -= msg.jettonAmount;

            reserveForBalance(in.valueCoins);
            val transferMsg = createMessage({
                bounce: BounceMode.Only256BitsOfBody,
                dest: msg.transferRecipient.getAddrFiWallet(),
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
            // safety:
            transferMsg.send(
                SEND_MODE_CARRY_ALL_BALANCE | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
            );
        }

        BuyCredit => {
            assert (in.senderAddress == addrs.owner) throw Errors.NotOwner;
            checkDebts(store);
            assert (
                msg.transferRecipient.getWorkchain() == MY_WORKCHAIN
            ) throw Errors.WrongWorkchain;
            checkAmountIsEnoughToTransfer(in.valueCoins, 0, in.originalForwardFee);
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
                in.senderAddress == trustedAddrs.personalJettonMinter
            ) throw Errors.IncorrectSender;

            assert (blockchain.now() >= store.creditMaturity) throw Errors.CreditNotMatured;
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
                profile.h3Cell = msg.h3Cell;
                profile.country = msg.country;

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
                    h3Cell: msg.h3Cell,
                    country: msg.country,
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
            assert (
                (trustedAddrs.authorisedAccs.exists(in.senderAddress)) |
                (in.senderAddress == trustedAddrs.minterAddr)
            ) throw Errors.IncorrectSender;
            store.status = msg.status;
        }

        RequestUpgradeCode => {
            checkCorrectSenderInternal(in.senderAddress, msg.sender);
            sendUpgrade(in.senderAddress, addrs.owner, store.version);
        }

        Upgrade => {
            checkCorrectSenderInternal(in.senderAddress, msg.sender);
            if (store.version < msg.walletVersion) {
                // ignore if manually upgraded
                store.version = msg.walletVersion;
                contract.setCodePostponed(msg.newCode!);
                // safety
                setTvmRegisterC3(transformSliceToContinuation(msg.newCode!.beginParse()));
                // any migration logic
                hotUpgradeFiWalletData(msg.newData);
            }
        }

        VotingAction => {
            checkCorrectSenderInternal(in.senderAddress, msg.sender);
            if (msg.positiveVote) {
                assert (msg.country == profile.country) throw Errors.CountryMismatch;
                store.receivedVotes += msg.count;
            } else {
                store.receivedVotes -= msg.count;
            }
            if (!store.isPrevilegedAccount) {
                store.isAuthorityAccount = store.receivedVotes > AUTHORITY_THRESHOLD ? true : false;
            }
        }

        ActSubmitProposal => {
            assert (in.senderAddress == addrs.owner) throw Errors.NotOwner;
            assert (store.active) throw Errors.AccountInactive;
            val proposalFee = ton("1000");
            assert (store.jettonBalance >= proposalFee) throw Errors.ProposalFeeInsufficient;

            store.jettonBalance -= proposalFee;

            val expiresAt = blockchain.now() + 604800;
            val pollDeploy = calcDeployPoll(
                msg.queryId,
                addrs.owner,
                msg.daoProxyAddress,
                trustedAddrs.minterAddr,
                contract.getCode(),
                msg.targetMsg,
                expiresAt,
                pollCompiledCodeLibraryRef(),
            );

            val deployPollMsg = createMessage({
                bounce: BounceMode.NoBounce,
                value: 0,
                dest: pollDeploy,
                body: InitPoll { queryId: msg.queryId },
            });
            deployPollMsg.send(
                SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_IGNORE_ERRORS,
            );
        }

        ActVoteProposal => {
            assert (in.senderAddress == addrs.owner) throw Errors.NotOwner;
            assert (store.active) throw Errors.AccountInactive;

            val forwardVoteMsg = createMessage({
                bounce: BounceMode.Only256BitsOfBody,
                dest: msg.pollAddress,
                value: 0,
                body: VoteProposal {
                    queryId: msg.queryId,
                    proposalId: msg.proposalId,
                    voterOwner: addrs.owner,
                    oldVote: msg.oldVote,
                    newVote: msg.vote,
                },
            });
            forwardVoteMsg.send(
                SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
            );
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
                store.isPrevilegedAccount = true;
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

        Follow => {
            assert (in.senderAddress == addrs.owner) throw Errors.IncorrectSender;
            idActionChecks(store); // active + not Under Review
            assert (msg.followee != addrs.owner.getAddrFiWallet()) throw Errors.IncorrectReceiver;

            social.followingCount += 1;

            // todo: notify minter here optimistically for fast txn updates

            val reqMsg = createMessage({
                bounce: BounceMode.Only256BitsOfBody,
                dest: msg.followee,
                value: 0,
                body: RequestFollow {
                    queryId: msg.queryId != 0 ? msg.queryId : 1,
                    followerOwner: addrs.owner,
                    mintAmount: FOLLOW_MINT_AMOUNT,
                },
            });
            reqMsg.send(
                SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
            );
        }

        RequestFollow => {
            idActionChecks(
                store,
            ); // active + not Under Review (throws if inactive, causing bounce back to follower!)

            social.followersCount += 1;
            store.jettonBalance += msg.mintAmount;

            val mintMsg = createMessage({
                bounce: BounceMode.NoBounce,
                dest: trustedAddrs.minterAddr,
                value: ton("0.05"),
                body: NotifyMinter {
                    queryId: 1, // nonzero = MINT in minter
                    jettonAmount: msg.mintAmount,
                    burnInitiator: addrs.owner,
                    sendExcessesTo: msg.followerOwner,
                },
            });
            mintMsg.send(SEND_MODE_IGNORE_ERRORS);

            val followingChild = calcDeployFollowing(
                in.senderAddress,
                contract.getAddress(),
                followingCompiledCodeLibraryRef(),
                msg.mintAmount,
            );

            val initMsg = createMessage({
                bounce: BounceMode.Only256BitsOfBody,
                dest: followingChild,
                value: 0,
                body: InitFollow {
                    queryId: msg.queryId,
                    followerOwner: msg.followerOwner,
                },
            });
            // SAFETY: forward remaining balance to deploy and initialize following child contract
            initMsg.send(
                SEND_MODE_CARRY_ALL_BALANCE | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
            );
        }

        Unfollow => {
            val isOwner = in.senderAddress == addrs.owner;
            val isAuth = in.senderAddress == msg.initiator.getAddrFiWallet();
            assert (isOwner || isAuth) throw Errors.IncorrectSender;
            assert (social.followingCount > 0) throw FollowingErrors.NotFollowing;

            social.followingCount -= 1;

            val reqMsg = createMessage({
                bounce: BounceMode.Only256BitsOfBody,
                dest: msg.followee,
                value: 0,
                body: RequestUnfollow {
                    queryId: msg.queryId,
                    initiator: msg.initiator,
                    followerOwner: addrs.owner,
                    burnAmount: FOLLOW_MINT_AMOUNT,
                },
            });
            reqMsg.send(
                SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
            );
        }

        RequestUnfollow => {
            idActionChecks(
                store,
            ); // active + not Under Review (throws if inactive, causing bounce back to follower!)
            assert (social.followersCount > 0) throw FollowingErrors.NotFollowing;

            social.followersCount -= 1;

            var actualBurn: coins = 0;
            if (store.jettonBalance >= msg.burnAmount) {
                store.jettonBalance -= msg.burnAmount;
                actualBurn = msg.burnAmount;
            } else {
                val available = store.jettonBalance;
                store.debt += (msg.burnAmount - available);
                store.debts = true;
                store.jettonBalance = 0;
                actualBurn = available;
            }

            if (actualBurn > 0) {
                val burnMsg = createMessage({
                    bounce: BounceMode.NoBounce,
                    dest: trustedAddrs.minterAddr,
                    value: ton("0.05"),
                    body: NotifyMinter {
                        queryId: 0, // zero = BURN in minter
                        jettonAmount: actualBurn,
                        burnInitiator: addrs.owner,
                        sendExcessesTo: msg.followerOwner,
                    },
                });
                burnMsg.send(SEND_MODE_IGNORE_ERRORS);
            }

            val followingChild = calcDeployFollowing(
                in.senderAddress,
                contract.getAddress(),
                followingCompiledCodeLibraryRef(),
                msg.burnAmount,
            ).calculateAddress();

            val forwardUnfollowMsg = createMessage({
                bounce: BounceMode.Only256BitsOfBody,
                dest: followingChild,
                value: 0,
                body: Unfollow {
                    queryId: msg.queryId,
                    initiator: msg.initiator,
                    followee: contract.getAddress(),
                },
            });
            // SAFETY: forward remaining balance to unfollow child contract
            forwardUnfollowMsg.send(
                SEND_MODE_CARRY_ALL_BALANCE | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
            );
        }

        FollowRevertedNotification => {
            if (msg.followerOwner == addrs.owner) {
                if (social.followingCount > 0) {
                    social.followingCount -= 1;
                }
            } else {
                if (social.followersCount > 0) {
                    social.followersCount -= 1;
                }
                store.jettonBalance -= FOLLOW_MINT_AMOUNT;
                val notifyMinterMsg = createMessage({
                    bounce: BounceMode.NoBounce,
                    dest: trustedAddrs.minterAddr,
                    value: ton("0.05"),
                    body: NotifyMinter {
                        queryId: 0, // zero = BURN in minter
                        jettonAmount: FOLLOW_MINT_AMOUNT,
                        burnInitiator: addrs.owner,
                        sendExcessesTo: null,
                    },
                });
                notifyMinterMsg.send(SEND_MODE_IGNORE_ERRORS);
            }
        }

        UnfollowRevertedNotification => {
            if (msg.followerOwner == addrs.owner) {
                social.followingCount += 1;
            } else {
                social.followersCount += 1;
                val debtReduction = min(store.debt, FOLLOW_MINT_AMOUNT);
                store.debt -= debtReduction;
                if (store.debt == 0) {
                    store.debts = false;
                }
                val restoreAmount = FOLLOW_MINT_AMOUNT - debtReduction;
                store.jettonBalance += restoreAmount;

                if (restoreAmount > 0) {
                    val notifyMinterMsg = createMessage({
                        bounce: BounceMode.NoBounce,
                        dest: trustedAddrs.minterAddr,
                        value: ton("0.05"),
                        body: NotifyMinter {
                            queryId: 1, // nonzero = MINT in minter
                            jettonAmount: restoreAmount,
                            burnInitiator: addrs.owner,
                            sendExcessesTo: null,
                        },
                    });
                    notifyMinterMsg.send(SEND_MODE_IGNORE_ERRORS);
                }
            }
        }

        SettleDeath => {
            // settlement order from authority or peer
            val isAuth = store.isAuthorityAccount || store.isPrevilegedAccount;
            val isPeer = in.senderAddress == msg.deceased.getAddrFiWallet();
            assert (isAuth || isPeer) throw Errors.IncorrectSender;

            if (social.followersCount > 0) {
                social.followersCount -= 1;
            }

            var actualBurn: coins = 0;
            if (store.jettonBalance >= FOLLOW_MINT_AMOUNT) {
                store.jettonBalance -= FOLLOW_MINT_AMOUNT;
                actualBurn = FOLLOW_MINT_AMOUNT;
            } else {
                val available = store.jettonBalance;
                store.debt += (FOLLOW_MINT_AMOUNT - available);
                store.debts = true;
                store.jettonBalance = 0;
                actualBurn = available;
            }

            if (actualBurn > 0) {
                val burnMsg = createMessage({
                    bounce: BounceMode.NoBounce,
                    dest: trustedAddrs.minterAddr,
                    value: ton("0.05"),
                    body: NotifyMinter {
                        queryId: 0,
                        jettonAmount: actualBurn,
                        burnInitiator: addrs.owner,
                        sendExcessesTo: in.senderAddress,
                    },
                });
                burnMsg.send(
                    SEND_MODE_IGNORE_ERRORS,
                );
            }
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
            assert (granted.isFound) throw FollowingErrors.NotFollowing;
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
            checkDebts(store);
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

        SetCreditNeed => {
            assert (in.senderAddress == addrs.owner) throw Errors.NotOwner;
            if (msg.amount > 0) {
                assert (msg.maturityDate > blockchain.now()) throw Errors.InvalidMessage;
                if (store.creditMaturity > blockchain.now()) {
                    assert (msg.maturityDate >= store.creditMaturity) throw Errors.InvalidMessage;
                }
                store.creditMaturity = msg.maturityDate;
            }
            store.creditNeed = msg.amount;
        }

        SetMultiplier => {
            assert (in.senderAddress == addrs.owner) throw Errors.NotOwner;
            // todo: multiplier > 1 makes sense
            assert (msg.multiplier > 0) throw Errors.InvalidMessage;
            store.multiplier = msg.multiplier;
        }

        RepayDebt => {
            assert (in.senderAddress == addrs.owner) throw Errors.NotOwner;
            assert (msg.amount > 0) throw Errors.InvalidMessage;
            assert (store.jettonBalance >= msg.amount) throw Errors.BalanceError;
            if (store.debt > 0) {
                val pay = min(msg.amount, store.debt);
                store.debt -= pay;
                store.jettonBalance -= pay;
                if (store.debt == 0) {
                    store.debts = false;
                }
            }
        }

        ActCloseAccount => {
            checkOwnerAction(in.senderAddress, in.valueCoins, addrs.owner);
            val remainingFi = store.jettonBalance;
            val remainingGold = store.goldCoins;
            val nomineeAddr = nomins.nominee;

            store.jettonBalance = 0;
            store.goldCoins = 0;
            store.active = false;

            if (nomineeAddr != null) {
                if (remainingFi > 0) {
                    val transferMsg = createMessage({
                        bounce: BounceMode.NoBounce,
                        dest: nomineeAddr,
                        value: 0,
                        body: makeInternalTransferStep(
                            msg.queryId,
                            remainingFi,
                            addrs.owner,
                            addrs.owner,
                            0,
                            createEmptySlice(),
                            store.version,
                        ),
                    });
                    transferMsg.send(
                        SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_IGNORE_ERRORS,
                    );
                }

                if (remainingGold > 0) {
                    val transferGoldMsg = createMessage({
                        bounce: BounceMode.NoBounce,
                        dest: nomineeAddr,
                        value: 0,
                        body: InternalGoldCoinsTransfer {
                            queryId: msg.queryId,
                            amount: remainingGold,
                            transferInitiator: addrs.owner,
                        },
                    });
                    transferGoldMsg.send(
                        SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_IGNORE_ERRORS,
                    );
                }
            }
        }

        AuthorityCloseAccount => {
            checkCorrectSenderInternal(in.senderAddress, msg.target);
            assert (
                store.isAuthorityAccount || store.isPrevilegedAccount
            ) throw Errors.IncorrectSender;
            val remainingFi = store.jettonBalance;
            val remainingGold = store.goldCoins;
            val nomineeAddr = nomins.nominee;

            store.jettonBalance = 0;
            store.goldCoins = 0;
            store.active = false;

            if (nomineeAddr != null) {
                if (remainingFi > 0) {
                    val transferMsg = createMessage({
                        bounce: BounceMode.NoBounce,
                        dest: nomineeAddr,
                        value: 0,
                        body: makeInternalTransferStep(
                            msg.queryId,
                            remainingFi,
                            addrs.owner,
                            addrs.owner,
                            0,
                            createEmptySlice(),
                            store.version,
                        ),
                    });
                    transferMsg.send(
                        SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_IGNORE_ERRORS,
                    );
                }

                if (remainingGold > 0) {
                    val transferGoldMsg = createMessage({
                        bounce: BounceMode.NoBounce,
                        dest: nomineeAddr,
                        value: 0,
                        body: InternalGoldCoinsTransfer {
                            queryId: msg.queryId,
                            amount: remainingGold,
                            transferInitiator: addrs.owner,
                        },
                    });
                    transferGoldMsg.send(
                        SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_IGNORE_ERRORS,
                    );
                }
            }
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
    maps.social = social.toCell();
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
        jettonWalletCode: contract.getCode(),
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

get fun get_h3_cell(): string {
    val store = lazy FiWalletStore.load();
    val profile = lazy store.profile.load();
    return profile.h3Cell;
}

get fun get_profile(): (string, string, uint16) {
    val store = lazy FiWalletStore.load();
    val profile = lazy store.profile.load();
    return (profile.username, profile.h3Cell, profile.country);
}

get fun get_following_count(): uint32 {
    val store = lazy FiWalletStore.load();
    val maps = lazy store.maps.load();
    val social = lazy maps.social.load();
    return social.followingCount;
}

get fun get_followers_count(): uint32 {
    val store = lazy FiWalletStore.load();
    val maps = lazy store.maps.load();
    val social = lazy maps.social.load();
    return social.followersCount;
}
