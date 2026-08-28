import "@contracts/common/errors"
import "@contracts/common/messages"
import "@contracts/common/utils"
import "@contracts/dao/storage"

type AllowedMessageToVoter =
    | VoteProposalChild
    | CleanupProposalVotes

contract Voter {
    author: "zeta"
    version: "0.1.0"
    description: "Child contract for storing voter state on a Poll"
    storage: VoterStore
    incomingMessages: AllowedMessageToVoter
}

fun onInternalMessage(in: InMessage): void {
    val msg = lazy AllowedMessageToVoter.fromSlice(in.body);
    var store = lazy VoterStore.load();

    match (msg) {
        VoteProposalChild => {
            assert (in.senderAddress == store.pollAddress) throw Errors.IncorrectSender;
            assert (msg.voterOwner == store.voterOwner) throw Errors.IncorrectSender;

            if (store.voted && store.vote == msg.vote) {
                throw Errors.DuplicateVote;
            }

            store.voted = true;
            store.vote = msg.vote;
            store.save();
        }

        CleanupProposalVotes => {
            assert (in.senderAddress == store.voterOwner) throw Errors.IncorrectSender;
            destroyContract(store.voterOwner);
        }

        else => {
            assert (in.body.isEmpty()) throw 0xFFFF;
        }
    }
}

get fun get_voter_data(): VoterStore {
    return VoterStore.load();
}
