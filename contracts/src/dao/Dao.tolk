import "@gen/DaoVoter.code"
import "@contracts/common/errors"
import "@contracts/common/internal-transfer"
import "@contracts/common/messages"

import "@contracts/dao/dao-utils"

import "storage"

type AllowedMessageToDao =
    | SubmitProposal
    | ResponseTotalAccounts
    | VoteProposal
    | CleanupProposalVotes
    | TopUpTons

contract Dao {
    author: "zeta"
    version: "0.1.0"
    description: "DAO contract for BrotherHood Network governing FossFi administrative operations"
    storage: DaoStore
    incomingMessages: AllowedMessageToDao
}

fun onInternalMessage(in: InMessage): void {
    if (in.body.isEmpty()) {
        return;
    }

    val msg = lazy AllowedMessageToDao.fromSlice(in.body);
    var store = lazy DaoStore.load();

    match (msg) {
        SubmitProposal => {
            val proposalId = store.proposalCount + 1;
            store.proposalCount = proposalId;

            val proposal: Proposal = {
                id: proposalId,
                proposerOwner: msg.proposerOwner,
                targetMsg: msg.targetMsg,
                expiresAt: blockchain.now() + 604800,
            };
            store.proposals.set(proposalId, proposal);
            store.save();

            val reqMsg = createMessage({
                bounce: BounceMode.NoBounce,
                value: 0,
                dest: store.fiAddress,
                body: RequestTotalAccounts { queryId: proposalId },
            });
            reqMsg.send(SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_IGNORE_ERRORS);
        }

        ResponseTotalAccounts => {
            assert (in.senderAddress == store.fiAddress) throw Errors.IncorrectSender;
            store.totalAccounts = msg.totalAccounts;
            store.save();
        }

        VoteProposal => {
            val expectedVoterChild = calcDeployDaoVoter(
                msg.voterOwner,
                contract.getAddress(),
                daoVoterCompiledCodeLibraryRef(),
            ).calculateAddress();
            assert (in.senderAddress == expectedVoterChild) throw Errors.InvalidDaoVoter;

            val propEntry = store.proposals.get(msg.proposalId);
            assert (propEntry.isFound) throw Errors.ProposalNotFound;
            var proposal = propEntry.loadValue();

            assert (blockchain.now() < proposal.expiresAt) throw Errors.ProposalExpired;

            if (msg.oldVote == null) {
                if (msg.newVote) {
                    proposal.yesVotes += 1;
                } else {
                    proposal.noVotes += 1;
                }
            } else if (msg.oldVote != msg.newVote) {
                if (msg.newVote) {
                    proposal.yesVotes += 1;
                    proposal.noVotes -= 1;
                } else {
                    proposal.yesVotes -= 1;
                    proposal.noVotes += 1;
                }
            }

            val threshold: uint33 = store.totalAccounts == 0
                ? 1
                : (store.totalAccounts * 2 + 2) / 3;

            if (proposal.yesVotes >= threshold) {
                reserveGramsOnBalance(
                    ton("0.01"),
                    RESERVE_MODE_EXACT_AMOUNT,
                );

                val rewardAmount = ton("10000"); // 10x proposal fee reward (10 * 1000 FI)
                val rewardMsg = createMessage({
                    bounce: BounceMode.NoBounce,
                    value: ton("0.1"),
                    dest: store.fiAddress,
                    body: MintNewJettons {
                        queryId: msg.proposalId,
                        mintRecipient: proposal.proposerOwner,
                        tonAmount: ton("0.05"),
                        internalTransferMsg: makeInternalTransferStep(
                            msg.proposalId,
                            rewardAmount,
                            contract.getAddress(),
                            proposal.proposerOwner,
                            0,
                        ),
                    },
                });
                rewardMsg.send(
                    SEND_MODE_PAY_FEES_SEPARATELY | SEND_MODE_IGNORE_ERRORS,
                );

                val forwardMsg = createMessage({
                    bounce: BounceMode.NoBounce,
                    value: 0,
                    dest: store.fiAddress,
                    body: proposal.targetMsg.beginParse(),
                });
                forwardMsg.send(
                    SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_IGNORE_ERRORS,
                );

                store.proposals.delete(msg.proposalId);
            } else {
                store.proposals.set(msg.proposalId, proposal);
            }

            store.save();
        }

        CleanupProposalVotes => {
            val propEntry = store.proposals.get(msg.proposalId);
            if (propEntry.isFound) {
                val proposal = propEntry.loadValue();
                if (blockchain.now() >= proposal.expiresAt) {
                    store.proposals.delete(msg.proposalId);
                    store.save();
                }
            }
        }

        TopUpTons => {
            // accept tons
        }

        else => {
            // invalid input; a typical reaction is:
            // ignore empty messages, "wrong opcode" if not
            assert (in.body.isEmpty()) throw 0xFFFF;
        }
    }
}

fun onBouncedMessage(_in: InMessageBounced): void {
    // Gracefully handle bounced messages
}

// ============================================================================
// GETTERS
// ============================================================================

get fun get_dao_data(): DaoStore {
    return DaoStore.load();
}

get fun get_proposal(proposalId: uint64): Proposal? {
    val store = lazy DaoStore.load();
    val propEntry = store.proposals.get(proposalId);
    if (propEntry.isFound) {
        return propEntry.loadValue();
    }
    return null;
}

get fun get_dao_voter_address(voterOwner: address): address {
    return calcDeployDaoVoter(
        voterOwner,
        contract.getAddress(),
        daoVoterCompiledCodeLibraryRef(),
    ).calculateAddress();
}
