import "@gen/FossFiWallet.code"
import "@gen/Voter.code"
import "@contracts/common/errors"
import "@contracts/common/messages"
import "@contracts/dao/dao-utils"
import "@contracts/fossFi/jetton-utils"

import "storage"

type AllowedMessageToPoll =
    | InitPoll
    | ResponseTotalAccounts
    | VoteProposal
    | CleanupProposalVotes
    | TopUpTons

contract Poll {
    author: "zeta"
    version: "0.1.0"
    description: "Poll contract for BrotherHood Network governing a single proposal"
    storage: PollStore
    incomingMessages: AllowedMessageToPoll
}

fun onInternalMessage(in: InMessage): void {
    if (in.body.isEmpty()) {
        return;
    }

    val msg = lazy AllowedMessageToPoll.fromSlice(in.body);
    var store = lazy PollStore.load();

    match (msg) {
        InitPoll => {
            val reqMsg = createMessage({
                bounce: BounceMode.NoBounce,
                value: 0,
                dest: store.fiAddress,
                body: RequestTotalAccounts { queryId: store.proposalId },
            });
            reqMsg.send(SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_IGNORE_ERRORS);
        }

        // lazy elections - convince voters to pass law
        ResponseTotalAccounts => {
            assert (in.senderAddress == store.fiAddress) throw Errors.IncorrectSender;
            store.totalAccounts = msg.totalAccounts;
            store.save();
        }

        VoteProposal => {
            val expectedWallet = calcDeployFiWallet(
                msg.voterOwner,
                store.fiAddress,
                fossFiWalletCompiledCodeLibraryRef(),
            ).calculateAddress();
            assert (in.senderAddress == expectedWallet) throw Errors.IncorrectSender;

            assert (!store.executed) throw Errors.ProposalNotFound;
            assert (blockchain.now() < store.expiresAt) throw Errors.ProposalExpired;

            if (msg.oldVote == null) {
                if (msg.newVote) {
                    store.yesVotes += 1;
                } else {
                    store.noVotes += 1;
                }
            } else if (msg.oldVote != msg.newVote) {
                if (msg.newVote) {
                    store.yesVotes += 1;
                    store.noVotes -= 1;
                } else {
                    store.yesVotes -= 1;
                    store.noVotes += 1;
                }
            }

            val voterDeploy = calcDeployVoter(
                msg.voterOwner,
                contract.getAddress(),
                voterCompiledCodeLibraryRef(),
            );
            val voterMsg = createMessage({
                bounce: BounceMode.Only256BitsOfBody,
                dest: voterDeploy,
                value: ton("0.02"),
                body: VoteProposalChild {
                    queryId: msg.queryId,
                    proposalId: msg.proposalId,
                    vote: msg.newVote,
                    voterOwner: msg.voterOwner,
                },
            });
            voterMsg.send(SEND_MODE_PAY_FEES_SEPARATELY | SEND_MODE_BOUNCE_ON_ACTION_FAIL);

            val threshold: uint33 = store.totalAccounts == 0
                ? 1
                : (store.totalAccounts * 2 + 2) / 3;

            if (store.yesVotes >= threshold && !store.executed) {
                store.executed = true;

                val execMsg = createMessage({
                    bounce: BounceMode.NoBounce,
                    value: 0,
                    dest: store.daoProxyAddress,
                    body: ExecuteDaoProposal {
                        queryId: msg.queryId,
                        proposalId: store.proposalId,
                        proposerOwner: store.proposerOwner,
                        expiresAt: store.expiresAt,
                        walletLibRef: fossFiWalletCompiledCodeLibraryRef(),
                        targetMsg: store.targetMsg,
                    },
                });
                // safety:
                execMsg.send(
                    SEND_MODE_CARRY_ALL_BALANCE | SEND_MODE_BOUNCE_ON_ACTION_FAIL |
                    SEND_MODE_DESTROY,
                );
            }

            store.save();
        }

        CleanupProposalVotes => {
            assert (in.senderAddress == store.proposerOwner) throw Errors.IncorrectSender;

            val excessesMsg = createMessage({
                bounce: BounceMode.NoBounce,
                value: 0,
                dest: store.proposerOwner,
                body: ReturnExcessesBack { queryId: msg.queryId },
            });
            // safety:
            excessesMsg.send(
                SEND_MODE_CARRY_ALL_BALANCE | SEND_MODE_DESTROY,
            );
        }

        TopUpTons => {
            // accept tons
        }

        else => {
            assert (in.body.isEmpty()) throw 0xFFFF;
        }
    }
}

fun onBouncedMessage(in: InMessageBounced): void {
    in.bouncedBody.skipBouncedPrefix();
    var slice = in.bouncedBody;
    if (slice.remainingBitsCount() >= 32) {
        val op = slice.loadUint(32);
        if (op == 0x000010fd) {
            // VoteProposalChild
            val _queryId = slice.loadUint(64);
            val _proposalId = slice.loadUint(64);
            val vote = slice.loadBool();

            var store = lazy PollStore.load();
            if (vote) {
                if (store.yesVotes > 0) {
                    store.yesVotes -= 1;
                }
            } else {
                if (store.noVotes > 0) {
                    store.noVotes -= 1;
                }
            }
            store.save();
        }
    }
}

// ============================================================================
// GETTERS
// ============================================================================

get fun get_poll_data(): PollStore {
    return PollStore.load();
}

get fun get_voter_address(voterOwner: address): address {
    return calcDeployVoter(
        voterOwner,
        contract.getAddress(),
        voterCompiledCodeLibraryRef(),
    ).calculateAddress();
}
