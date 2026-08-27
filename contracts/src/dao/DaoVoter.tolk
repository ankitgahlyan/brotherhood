import "@contracts/common/errors"
import "@contracts/common/messages"
import "@contracts/common/utils"
import "@contracts/dao/storage"

type AllowedMessageToDaoVoter =
    | VoteProposalChild
    | CleanupProposalVotes

contract DaoVoter {
    author: "zeta"
    version: "0.1.0"
    description: "Child contract for storing voter state on DAO proposal"
    storage: DaoVoterStore
    incomingMessages: AllowedMessageToDaoVoter
}

fun onInternalMessage(in: InMessage): void {
    val msg = lazy AllowedMessageToDaoVoter.fromSlice(in.body);
    var store = lazy DaoVoterStore.load();

    match (msg) {
        VoteProposalChild => {
            assert (msg.voterOwner == store.voterOwner) throw Errors.IncorrectSender;

            val existing = store.votes.get(msg.proposalId);
            var oldVote: bool? = null;

            if (existing.isFound) {
                val current = existing.loadValue();
                if (current == msg.vote) {
                    throw Errors.DuplicateVote;
                }
                oldVote = current;
            }

            store.votes.set(msg.proposalId, msg.vote);
            store.save();

            val forwardVoteMsg = createMessage({
                bounce: BounceMode.NoBounce,
                dest: store.daoAddress,
                value: 0,
                body: VoteProposal {
                    queryId: msg.queryId,
                    proposalId: msg.proposalId,
                    voterOwner: msg.voterOwner,
                    oldVote,
                    newVote: msg.vote,
                },
            });
            forwardVoteMsg.send(SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE);
        }

        CleanupProposalVotes => {
            assert (in.senderAddress == store.voterOwner) throw Errors.IncorrectSender;
            destroyContract(store.voterOwner);
        }

        else => {
            // invalid input; a typical reaction is:
            // ignore empty messages, "wrong opcode" if not
            assert (in.body.isEmpty()) throw 0xFFFF;
        }
    }
}
