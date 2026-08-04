// Decentralized Lottery Contract using Commit-Reveal(noNo evenBetter) Scheme
// Addresses are used as part of the commitment to ensure uniqueness

import "@stdlib/common"
import "consts"
import "messages"
import "storage"
import "utils"

// import "@stdlib/exotic-cells"
// import "@stdlib/tvm-dicts"
// import "@stdlib/tvm-lowlevel"

contract Lottery {
    author: "zeta"
    version: "0.1.0"
    description: "Decentralized Lottery Contract"
    storage: LotteryStorage
    incomingMessages: AllowedMessageToLottery
}

type AllowedMessageToLottery = EnterLottery | DrawWinner

// ============================================================================
// MESSAGE HANDLERS
// ============================================================================

fun onInternalMessage(in: InMessage) {
    // ignore empty bodies (e.g. plain deploys)
    if (in.body.isEmpty()) {
        return;
    }

    val msg = AllowedMessageToLottery.fromSlice(in.body);
    var storage = lazy LotteryStorage.load();

    match (msg) {
        EnterLottery => {
            // correct sender
            assert (in.senderAddress == storage.owner) throw 700; // todo: incorrectSender

            if (storage.revealDeadline == 0) {
                storage.revealDeadline = blockchain.now() + REVEAL_DEADLINE_SECONDS;
            } else {
                assert (blockchain.now() <= storage.revealDeadline) throw 201;
            }

            assert (msg.amount == storage.entryAmount) throw 202;

            // add if not already entered
            if (!storage.participants.exists(msg.sender)) {
                // Add participant
                storage.participants.set(msg.sender, ());
                storage.participantCount += 1;
            }

            storage.prizePool += msg.amount;
            val addrHash = msg.sender.toCell().hash();
            storage.randomSeed ^= addrHash;
        }

        DrawWinner => {
            // Phase check
            assert (blockchain.now() > storage.revealDeadline) throw 400;
            assert (storage.participantCount > 0) throw 401;

            // Select winner
            val winner = selectWinner(
                storage.randomSeed,
                storage.participants,
                storage.participantCount,
            );
            // Send prize to winner
            val prizeMsg = createMessage({
                bounce: BounceMode.NoBounce,
                dest: storage.owner,
                value: 0,
                body: LotteryWin {
                    entryAmount: storage.entryAmount,
                    amt: storage.prizePool,
                    winner,
                },
            });
            prizeMsg.send(SEND_MODE_REGULAR | SEND_MODE_IGNORE_ERRORS); // todo:

            // Reset storage for new lottery
            storage.participants = [];
            storage.prizePool = 0;
            storage.participantCount = 0;
            storage.randomSeed = 0;
            storage.revealDeadline = 0;
        }
    }

    storage.save();
}

// ============================================================================
// GET METHODS
// ============================================================================

get fun getParticipantCount(): int32 {
    val storage = lazy LotteryStorage.load();
    return storage.participantCount;
}

get fun isParticipant(addr: address): bool {
    val storage = lazy LotteryStorage.load();
    return storage.participants.exists(addr);
}

get fun getDeadline(): int32 {
    val storage = lazy LotteryStorage.load();
    return storage.revealDeadline;
}

get fun getCurrentPhase(): int8 {
    val storage = lazy LotteryStorage.load();
    if (storage.revealDeadline == 0) {
        return PHASE_ENTRY;
    }
    if (blockchain.now() <= storage.revealDeadline) {
        return PHASE_REVEAL;
    }
    return PHASE_COMPLETE;
}

get fun getPrizePool(): coins {
    val storage = lazy LotteryStorage.load();
    return storage.prizePool;
}
