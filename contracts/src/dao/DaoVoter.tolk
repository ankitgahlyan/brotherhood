import "@contracts/common/errors"
import "@contracts/common/messages"

type AllowedMessageToDaoVoter =
    | VoteProposalChild
    | CleanupProposalVotes

struct DaoVoterStore {
    voterOwner: address
    daoAddress: address
    votes: map<uint64, bool> = []
}

fun DaoVoterStore.save(self): void {
    contract.setData(self.toCell());
}

contract DaoVoter {
    author: "zeta"
    version: "0.1.0"
    description: "Child contract for storing voter state on multiple DAO proposals"
    storage: DaoVoterStore
    incomingMessages: AllowedMessageToDaoVoter
}

fun onInternalMessage(in: InMessage): void {
    val msg = lazy AllowedMessageToDaoVoter.fromSlice(in.body);
    var store = lazy DaoVoterStore.fromSlice(contract.getData().beginParse());

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
            assert (
                (in.senderAddress == store.voterOwner)
            ) throw Errors.IncorrectSender;
            if (store.votes.exists(msg.proposalId)) {
                store.votes.delete(msg.proposalId);
                store.save();
            }
        }
    }
}
