import "@stdlib/tvm-lowlevel"

import "@contracts/common/errors"
import "@contracts/common/messages"

import "consts"
import "messages"
import "storage"
import "utils"

contract Lottery {
    author: "zeta"
    version: "0.1.0"
    description: "Decentralized Lottery Contract"
    storage: LotteryStorage
    incomingMessages: AllowedMessageToLottery
}

type AllowedMessageToLottery = EnterLottery | DrawWinner | HotUpgrade | Upgrade

// ============================================================================
// MESSAGE HANDLERS
// ============================================================================

fun onInternalMessage(in: InMessage) {
    // ignore empty bodies (e.g. plain deploys)
    if (in.body.isEmpty()) {
        return;
    }

    val msg = lazy AllowedMessageToLottery.fromSlice(in.body);
    var storage = lazy LotteryStorage.load();

    match (msg) {
        EnterLottery => {
            // correct sender
            assert (in.senderAddress == storage.owner) throw Errors.IncorrectSender;

            if (storage.revealDeadline == 0) {
                storage.revealDeadline = blockchain.now() + REVEAL_DEADLINE_SECONDS;
            } else {
                assert (blockchain.now() <= storage.revealDeadline) throw Errors.WaitMore;
            }

            assert (msg.amount == storage.entryAmount) throw Errors.InvalidMessage;

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
            assert (blockchain.now() > storage.revealDeadline) throw Errors.WaitMore;
            assert (storage.participantCount > 0) throw Errors.InvalidMessage;

            // Initialize PRNG for secure random winner selection
            random.initialize();

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
            // forward the pot so the minter can mint + deploy the winner's wallet
            prizeMsg.send(SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_IGNORE_ERRORS);

            // Reset storage for new lottery
            storage.participants = [];
            storage.prizePool = 0;
            storage.participantCount = 0;
            storage.randomSeed = 0;
            storage.revealDeadline = 0;
        }

        HotUpgrade => {
            assert (in.senderAddress == storage.owner) throw Errors.IncorrectSender;
            contract.setCodePostponed(msg.code);
            // SAFETY: updating continuation register C3 for new code
            setTvmRegisterC3(transformSliceToContinuation(msg.code.beginParse()));
            hotUpgradeLotteryData(msg.additionalData);
            return;
        }

        Upgrade => {
            assert (in.senderAddress == storage.owner) throw Errors.IncorrectSender;
            if (storage.version < msg.walletVersion) {
                storage.version = msg.walletVersion;
                if (msg.newCode != null) {
                    contract.setCodePostponed(msg.newCode);
                    // SAFETY: updating continuation register C3 for new code
                    setTvmRegisterC3(transformSliceToContinuation(msg.newCode.beginParse()));
                }
                hotUpgradeLotteryData(msg.newData);
            }
        }

        else => {
            // invalid input; a typical reaction is:
            // ignore empty messages, "wrong opcode" if not
            assert (in.body.isEmpty()) throw 0xFFFF;
        }
    }

    storage.save();
}

fun hotUpgradeLotteryData(_additionalData: cell?) {
    var oldStore = LotteryStorage.load();
    oldStore.version += 1;
    oldStore.save();
}

// ============================================================================
// GET METHODS
// ============================================================================

get fun getVersion(): uint10 {
    val storage = lazy LotteryStorage.load();
    return storage.version;
}

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
