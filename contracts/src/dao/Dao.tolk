import "@gen/DaoVoter.code"
import "@contracts/common/errors"
import "@contracts/common/internal-transfer"
import "@contracts/common/messages"
import "@contracts/common/utils"

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
            val now = blockchain.now();

            val newProp: Proposal = {
                id: msg.id,
                proposerOwner: msg.proposerOwner,
                targetAddr: msg.targetAddr,
                targetMsg: msg.targetMsg,
                yesVotes: 0,
                noVotes: 0,
                expiresAt: now + 604800, // 7 days (7 * 86400)
            };
            store.proposal = newProp;
            store.save();

            val reqMsg = createMessage({
                bounce: BounceMode.NoBounce,
                value: 0,
                dest: msg.targetAddr,
                body: RequestTotalAccounts { queryId: msg.id },
            });
            reqMsg.send(SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_IGNORE_ERRORS);
        }

        ResponseTotalAccounts => {
            assert (in.senderAddress == store.proposal.targetAddr) throw Errors.IncorrectSender;
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

            var proposal = store.proposal;

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
                val rewardAmount = ton("10000"); // 10x proposal fee reward (10 * 1000 FI)
                val rewardMsg = createMessage({
                    bounce: BounceMode.NoBounce,
                    value: ton("0.05"),
                    dest: store.proposal.targetAddr,
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
                    dest: store.proposal.targetAddr,
                    body: proposal.targetMsg.beginParse(),
                });
                forwardMsg.send(
                    SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_IGNORE_ERRORS,
                );

                destroyContract(proposal.proposerOwner);
                return;
            }

            store.proposal = proposal;
            store.save();
        }

        CleanupProposalVotes => {
            assert (in.senderAddress == store.proposal.proposerOwner) throw Errors.IncorrectSender;
            assert (blockchain.now() >= store.proposal.expiresAt) throw Errors.WaitMore;

            // Refund the 1000 FI tokens deducted at creation time
            val refundFeeAmount = ton("1000");
            val refundMsg = createMessage({
                bounce: BounceMode.NoBounce,
                value: ton("0.05"),
                dest: store.proposal.targetAddr,
                body: MintNewJettons {
                    queryId: msg.queryId,
                    mintRecipient: store.proposal.proposerOwner,
                    tonAmount: ton("0.05"),
                    internalTransferMsg: makeInternalTransferStep(
                        msg.queryId,
                        refundFeeAmount,
                        contract.getAddress(),
                        store.proposal.proposerOwner,
                        0,
                    ),
                },
            });
            refundMsg.send(
                SEND_MODE_PAY_FEES_SEPARATELY | SEND_MODE_IGNORE_ERRORS,
            );

            // Destroy contract and send remaining TON back to proposer
            destroyContract(store.proposal.proposerOwner);
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

get fun get_proposal(): Proposal {
    val store = lazy DaoStore.load();
    return store.proposal;
}

get fun get_dao_voter_address(voterOwner: address): address {
    return calcDeployDaoVoter(
        voterOwner,
        contract.getAddress(),
        daoVoterCompiledCodeLibraryRef(),
    ).calculateAddress();
}
