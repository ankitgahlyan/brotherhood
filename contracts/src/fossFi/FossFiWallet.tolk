import "@stdlib/tvm-lowlevel"

import "@gen/Following.code"
import "@contracts/common/errors"
import "@contracts/common/fi-wallet-code"
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

import "fees-management"

type AllowedMessageToWallet =
// owner-initiated actions (invite, vote, claim, lottery, destroy, ...)
    | ActClaimWeeklyGrant
    | ActInvite
    | ActVote
    | ActUnvote
    | DeActivateCircleRing
    | DeActivateCircleRingInternal
    | ActDispatchAuthorityAction
    | ActJoinLottery
    | ActSetPersonalJetton
    | ActDestroyAccount
    | ActSubmitProposal
    | ActVoteProposal
    | AskToTransfer
    | AskToBurn
    | BuyCredit
    | AuthorityAction
    | ChangeProfile
    | InternalTransferStep
    | InternalInvite
    | Payback
    | RequestState
    | RequestUpgradeCode
    | SetStatus
    | TopUpTons
    | TransferNotificationForRecipient // forwards invite notif invitor0 owner
    | Upgrade
    | HotUpgrade
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
    | ActPayEmi
    | TriggerDefaultEmi
    | SetLoanRequirement
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
    | InitPoll

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
        InitPoll => {
            restoreAmount = PROPOSAL_FEE;
        }

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
                val exists = social.votedFor.get(in.senderAddress);
                if (exists.isFound) {
                    val current: uint4 = exists.loadValue();
                    if (current <= msg.count) {
                        social.votedFor.delete(in.senderAddress);
                    } else {
                        social.votedFor.set(in.senderAddress, current - msg.count);
                    }
                }
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

    // if ((msg != TopUpTons) | (msg != ActInvite)) {
    //     assert (store.active) throw Errors.AccountInactive;
    // }

    match (msg) {
        ChangeProfile => {
            if (in.senderAddress != addrs.owner) {
                throw Errors.IncorrectSender;
            }
            assert (in.valueCoins >= ton("1")) throw Errors.NotEnoughGas;
            assert (
                msg.username != null || msg.h3Cell != null || msg.country != null ||
                msg.nominee != null
            ) throw Errors.InvalidMessage;

            if (msg.username != null) {
                assert (isNonEmptyString(msg.username)) throw Errors.ProvideCoordinates;
                profile.username = msg.username;
            }

            if (msg.country != null) {
                assert (store.votes == 10) throw Errors.HasActiveVotes;
                profile.country = msg.country;
            }

            if (msg.nominee != null) {
                nomins.nominee = msg.nominee;
            }

            if (msg.h3Cell != null) {
                assert (isNonEmptyString(msg.h3Cell)) throw Errors.ProvideCoordinates;

                val oldH3Cell = profile.h3Cell;
                profile.h3Cell = msg.h3Cell;

                val notifyMinterMsg = createMessage({
                    bounce: BounceMode.NoBounce,
                    dest: trustedAddrs.minterAddr,
                    value: 0,
                    body: InformMinterChangeLocation {
                        queryId: msg.queryId,
                        owner: addrs.owner,
                        oldH3Cell,
                        newH3Cell: msg.h3Cell,
                    },
                });
                notifyMinterMsg.send(
                    SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
                );
            } else {
                returnExcessesBack(msg.queryId, addrs.owner);
            }
        }

        ActClaimWeeklyGrant => {
            // can be claimed for others no owner checks required
            assert (in.valueCoins >= grams("0.05")) throw Errors.NotEnoughGas;
            assert (store.active) throw Errors.AccountInactive;
            // claim weekly grant
            val now = blockchain.now();
            assert (
                now > (time.accountInit + ACTIVATION_WAIT)
            ) throw Errors.WaitMore;                                                   // claim starts after 1 day
            assert (now > (CLAIM_INTERVAL + time.lastClaim)) throw Errors.WaitMore;

            // 11,111 FI for first 2 years, then 500 FI lifetime baseline floor; plus 10 FI per received vote uncapped
            val baseGrant = (now < MAX_CLAIM_PERIOD + time.accountInit)
                ? WEEKLY_CLAIM_AMOUNT
                : POST_2YR_BASELINE_CLAIM;
            val reputationGrant = store.receivedVotes * VOTE_GRANT_RATE;
            val totalClaimAmount = baseGrant + reputationGrant;

            // if account is in debt, auto-repay debt first
            if (store.debt > 0) {
                val debtReduction = min(store.debt, totalClaimAmount);
                store.debt -= debtReduction;
                if (store.debt == 0) {
                    store.debts = false;
                }
                val netCredited = totalClaimAmount - debtReduction;
                store.jettonBalance += netCredited;
            } else {
                store.jettonBalance += totalClaimAmount;
            }

            time.lastClaim = now;
            // inform minter about new tokens mint
            val notifyMinterMsg = createMessage({
                bounce: BounceMode.NoBounce,
                dest: trustedAddrs.minterAddr,
                value: 0,
                body: NotifyMinter {
                    queryId: msg.queryId != 0 ? msg.queryId : 1, // to inform about MINT
                    jettonAmount: totalClaimAmount,
                    burnInitiator: in.senderAddress,
                    sendExcessesTo: in.senderAddress,
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
            // every 4 hours, spam protection
            assert (
                ((now > (time.lastInvite + INVITE_WAIT)) &
                (now > (time.accountInit + ACTIVATION_WAIT))) |
                (store.isPrevilegedAccount)
            ) throw Errors.WaitMore;
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
                    getFiWalletCode(),
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
            assert (msg.count > 0 && store.votes >= msg.count) throw Errors.NoVotesAvailable;
            // no self-voting
            assert (msg.transferRecipient != in.senderAddress) throw Errors.IncorrectReceiver;
            val candidate = msg.transferRecipient.getAddrFiWallet();
            store.votes -= msg.count;
            val exists = social.votedFor.get(candidate);
            val prevVotes: uint4 = exists.isFound ? exists.loadValue() : 0;
            social.votedFor.set(candidate, prevVotes + msg.count);

            val votingMsg = createMessage({
                bounce: BounceMode.Only256BitsOfBody,
                dest: candidate,
                value: 0,
                body: VotingAction {
                    positiveVote: true,
                    count: msg.count,
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
            assert (msg.count > 0) throw Errors.NoVotesAvailable;
            val candidate = msg.transferRecipient.getAddrFiWallet();
            val exists = social.votedFor.get(candidate);
            assert (exists.isFound) throw Errors.NotVotedYet;
            val votedCount: uint4 = exists.loadValue();
            assert (msg.count <= votedCount) throw Errors.NoVotesAvailable;

            if (msg.count == votedCount) {
                social.votedFor.delete(candidate);
            } else {
                social.votedFor.set(candidate, votedCount - msg.count);
            }
            store.votes += msg.count;

            val votingMsg = createMessage({
                bounce: BounceMode.NoBounce,
                dest: candidate,
                value: 0,
                body: VotingAction {
                    positiveVote: false,
                    count: msg.count,
                    sender: addrs.owner,
                },
            });
            votingMsg.send(
                SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
            );
        }

        // For control of circle and ring
        DeActivateCircleRing => {
            checkOwnerAction(in.senderAddress, in.valueCoins, addrs.owner);
            checkActionRecipient(msg.transferRecipient);
            // just use single for both txn
            // todo fixme use jettonAddrs directly to save gas on calculations

            assert (store.active) throw Errors.AccountInactive;
            val internalDeActivate = createMessage({
                bounce: BounceMode.Only256BitsOfBody,
                dest: msg.transferRecipient.getAddrFiWallet(),
                value: 0,
                body: DeActivateCircleRingInternal {}, // emptybody as jettonAddrs are stored
            });
            // todo: instead of send bounce, why not keep fees of attackers when possible
            internalDeActivate.send(
                SEND_MODE_BOUNCE_ON_ACTION_FAIL | SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE,
            );
        }

        // deactivate and funds all confiscate
        ActDispatchAuthorityAction => {
            // checkOwnerAction(in.senderAddress, in.valueCoins, addrs.owner);
            // checkActionRecipient(msg.transferRecipient);
            assert (in.senderAddress == addrs.owner) throw Errors.IncorrectSender;
            assert (
                store.isAuthorityAccount || store.isPrevilegedAccount
            ) throw Errors.IncorrectSender;

            // send AuthorityAction
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

        ActSetPersonalJetton => {
            checkOwnerAction(in.senderAddress, in.valueCoins, addrs.owner);

            trustedAddrs.personalJettonMinter = msg.personalJettonMinter;
            trustedAddrs.personalJettonWallet = msg.personalJettonWallet;
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
                requestUpgrade(in.senderAddress);
            }
            // val incomingTransfersLocked = ((self.status & 2) == 2);
            // val incomingTransfersLocked = (store.locked != false);
            // require(!incomingTransfersLocked, "Incoming transfers are locked");
            store.jettonBalance += msg.jettonAmount;

            if (msg.transferredAsCredit) {
                // Credit Need gate (#23)
                assert (
                    trustedAddrs.personalJettonMinter != ZERO_ADDRESS
                ) throw Errors.CreditNeedExceeded;
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
                    tonAmount: ton("0.7"),
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
                    value: ton("0.75"),
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
            transferMsg.send(
                SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
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
                    msg.sender,
                    0,
                    createEmptySlice(),
                    store.version,
                ),
            });
            // todo: what if this bounces?
            transferMsg.send(
                SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
            );
        }

        InternalInvite => {
            // assert (store.jettonBalance == ton("1")) throw Errors.AlreadyInvited;
            // assert (!store.active) throw Errors.AlreadyInvited; // cheap calc first/failFast
            assert (time.accountInit == 0) throw Errors.AlreadyInvited;
            assert (in.senderAddress == msg.sender.getAddrFiWallet()) throw Errors.IncorrectSender;

            store.active = true;
            store.jettonBalance = ton("1");
            time.accountInit = blockchain.now();
            nomins.nominee = msg.sender;       // must be null at init
            profile.username = msg.username;
            profile.h3Cell = msg.h3Cell;
            profile.country = msg.country;
            nomins.invitor = in.senderAddress; // contract addr
            nomins.invitor0 = msg.invitor;     // todo: null, can deactivate acc

            store.version = msg.version;
            contract.setCodePostponed(msg.currentWalletCode);
            // todo: storage migration can be tricky here

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
        DeActivateCircleRingInternal => {
            // need to check correctInternalSender() for STORED jettonAddrs
            assert (
                (in.senderAddress == nomins.invitor0!) | (in.senderAddress == nomins.invitor!)
            ) throw Errors.InviteFirst;                                                                                       // throws if invitor0 null

            store.active = !store.active;
        }

        // todo: DeActivate accounts by authority and confiscate funds
        AuthorityAction => {
            checkCorrectSenderInternal(in.senderAddress, msg.sender);
            // not allowed to block authority, but previledged can be deactivated
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
                        msg.sender,                     // sendExcessesTo
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
            val upgradeMsg = createMessage({
                dest: in.senderAddress,
                value: 0,
                bounce: false,
                body: Upgrade {
                    walletVersion: store.version,
                    sender: addrs.owner,
                    newCode: contract.getCode(),
                },
            });
            upgradeMsg.send(
                SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_IGNORE_ERRORS,
            );
        }

        Upgrade => {
            checkCorrectSenderInternal(in.senderAddress, msg.sender);
            // ignore if manually upgraded
            if (store.version < msg.walletVersion) {
                store.version = msg.walletVersion;
                contract.setCodePostponed(msg.newCode!);
            }
            returnExcessesBack(msg.walletVersion as uint64, addrs.owner);
        }

        HotUpgrade => {
            assert (in.senderAddress == trustedAddrs.minterAddr) throw Errors.IncorrectSender;
            contract.setCodePostponed(msg.code);
            // SAFETY: update continuation register C3 for new code
            setTvmRegisterC3(transformSliceToContinuation(msg.code.beginParse()));
            hotUpgradeFiWalletData(msg.additionalData);
            return;
        }

        VotingAction => {
            checkCorrectSenderInternal(in.senderAddress, msg.sender);
            if (msg.positiveVote) {
                assert (msg.country == profile.country) throw Errors.CountryMismatch;
                store.receivedVotes += msg.count;
            } else {
                store.receivedVotes = store.receivedVotes >= msg.count
                    ? store.receivedVotes - msg.count
                    : 0;
            }
            if (!store.isPrevilegedAccount) {
                store.isAuthorityAccount = store.receivedVotes > AUTHORITY_THRESHOLD ? true : false;
            }
            // todo: if remaining    
            returnExcessesBack(0, msg.sender);
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
                msg.targetMsg,
                expiresAt,
                msg.pollCode, // todo: can v supply libRef in msg?
            );

            val deployPollMsg = createMessage({
                bounce: BounceMode.Only256BitsOfBody,
                value: 0,
                dest: pollDeploy,
                body: InitPoll { queryId: msg.queryId },
            });
            deployPollMsg.send(
                SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
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
                // todo: set profile
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
                getFollowingCode(),
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
                getFollowingCode(),
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
            // todo: don't allow to revoke existing allowance
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

        SetLoanRequirement => {
            assert (in.senderAddress == addrs.owner) throw Errors.NotOwner;
            assert (
                trustedAddrs.personalJettonMinter != ZERO_ADDRESS &&
                trustedAddrs.personalJettonMinter != RAW_ZERO_ADDRESS
            ) throw Errors.PersonalJettonNotRegistered;
            assert (
                msg.amount != null || msg.maturityDate != null || msg.multiplier != null
            ) throw Errors.InvalidMessage;

            if (msg.multiplier != null) {
                assert (msg.multiplier >= 1) throw Errors.InvalidMessage;
                store.multiplier = msg.multiplier;
            }

            if (msg.amount != null) {
                if (msg.amount > 0) {
                    val effectiveMaturity = msg.maturityDate != null
                        ? msg.maturityDate
                        : store.creditMaturity;
                    assert (effectiveMaturity > blockchain.now()) throw Errors.InvalidMessage;
                    if (store.creditMaturity > blockchain.now()) {
                        assert (
                            effectiveMaturity >= store.creditMaturity
                        ) throw Errors.InvalidMessage;
                    }
                    store.creditMaturity = effectiveMaturity;
                }
                store.creditNeed = msg.amount;
            } else if (msg.maturityDate != null) {
                if (store.creditNeed > 0) {
                    assert (msg.maturityDate > blockchain.now()) throw Errors.InvalidMessage;
                    if (store.creditMaturity > blockchain.now()) {
                        assert (
                            msg.maturityDate >= store.creditMaturity
                        ) throw Errors.InvalidMessage;
                    }
                    store.creditMaturity = msg.maturityDate;
                }
            }

            returnExcessesBack(msg.queryId, addrs.owner);
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

        ActPayEmi => {
            checkOwnerAction(in.senderAddress, in.valueCoins, addrs.owner);
            val now = blockchain.now();
            val baseTime: int = time.lastDecay != 0
                ? (time.lastDecay as int)
                : (time.accountInit != 0 ? (time.accountInit as int) : now);
            assert (now >= baseTime + DECAY_MONTH_SECONDS) throw Errors.WaitMore;

            assert (store.jettonBalance >= EMI_AMOUNT) throw Errors.InsufficientBalance;

            store.jettonBalance -= EMI_AMOUNT;
            time.lastDecay = baseTime + DECAY_MONTH_SECONDS;

            val notifyMinterMsg = createMessage({
                bounce: BounceMode.NoBounce,
                dest: trustedAddrs.minterAddr,
                value: 0,
                body: NotifyMinter {
                    queryId: 0, // to inform about BURN
                    jettonAmount: EMI_AMOUNT,
                    burnInitiator: in.senderAddress,
                    sendExcessesTo: msg.sendExcessesTo != null
                        ? msg.sendExcessesTo
                        : in.senderAddress,
                },
            });
            notifyMinterMsg.send(
                SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
            );
        }

        TriggerDefaultEmi => {
            // keeper-triggered or outsider-triggered when overdue > 24 hours
            val now = blockchain.now();
            val baseTime: int = time.lastDecay != 0
                ? (time.lastDecay as int)
                : (time.accountInit != 0 ? (time.accountInit as int) : now);
            assert (now > baseTime + DECAY_MONTH_SECONDS + EMI_GRACE_PERIOD) throw Errors.WaitMore;

            val burnAmount = min(store.jettonBalance, EMI_AMOUNT);
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
                        sendExcessesTo: in.senderAddress,
                    },
                });
                notifyMinterMsg.send(
                    SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
                );
            } else {
                returnExcessesBack(msg.queryId, in.senderAddress);
            }

            val unpaid = EMI_AMOUNT - burnAmount;
            if (unpaid > 0) {
                store.debt += unpaid;
                store.debts = true;
            }

            // apply 5% penalty of all debt
            if (store.debt > 0) {
                val penalty = store.debt * EMI_PENALTY_PERCENT / 100;
                store.debt += penalty;
                store.debts = true;
            }

            time.lastDecay = baseTime + DECAY_MONTH_SECONDS;
        }

        TriggerDecay => {
            // Legacy keeper trigger: processes default EMI logic
            val now = blockchain.now();
            val baseTime: int = time.lastDecay != 0
                ? (time.lastDecay as int)
                : (time.accountInit != 0 ? (time.accountInit as int) : now);
            assert (now >= baseTime + DECAY_MONTH_SECONDS) throw Errors.WaitMore;

            val burnAmount = min(store.jettonBalance, EMI_AMOUNT);
            if (burnAmount > 0) {
                store.jettonBalance -= burnAmount;
                val notifyMinterMsg = createMessage({
                    bounce: BounceMode.NoBounce,
                    dest: trustedAddrs.minterAddr,
                    value: 0,
                    body: NotifyMinter {
                        queryId: 0,
                        jettonAmount: burnAmount,
                        burnInitiator: addrs.owner,
                        sendExcessesTo: in.senderAddress,
                    },
                });
                notifyMinterMsg.send(
                    SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
                );
            } else {
                returnExcessesBack(0, in.senderAddress);
            }

            val unpaid = EMI_AMOUNT - burnAmount;
            if (unpaid > 0) {
                store.debt += unpaid;
                store.debts = true;
            }
            if (now > baseTime + DECAY_MONTH_SECONDS + EMI_GRACE_PERIOD && store.debt > 0) {
                val penalty = store.debt * EMI_PENALTY_PERCENT / 100;
                store.debt += penalty;
                store.debts = true;
            }
            time.lastDecay = baseTime + DECAY_MONTH_SECONDS;
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

fun getFollowingCode(): cell {
    return followingCompiledCodeLibraryRef();
}

get fun get_wallet_data(): JettonWalletDataReply {
    val store = lazy FiWalletStore.load();
    val addrs = lazy store.addresses.load();

    return {
        jettonBalance: store.jettonBalance,
        ownerAddress: addrs.owner,
        minterAddress: addrs.trustedJettonAddrs.load().minterAddr,
        jettonWalletCode: getFiWalletCode(),
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
