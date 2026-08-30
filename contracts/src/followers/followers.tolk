import "@stdlib/tvm-lowlevel"

import "@contracts/common/errors"
import "@contracts/common/messages"

import "messages"
import "store"

type FollowingAllowedMsg =
    | InitFollow
    | Unfollow
    | HotUpgrade

contract Following {
    author: "zeta"
    version: "0.1.0"
    description: "following tracking for a fi wallet"
    storage: FollowingStore
    incomingMessages: FollowingAllowedMsg
}

fun onBouncedMessage(_in: InMessageBounced) {}

fun onInternalMessage(in: InMessage) {
    val msg = lazy FollowingAllowedMsg.fromSlice(in.body);
    var store = lazy FollowingStore.load();

    match (msg) {
        InitFollow => {
            assert (
                in.senderAddress == store.followee || in.senderAddress == store.follower
            ) throw Errors.IncorrectSender;
            if (store.isFollowing) {
                val revFollower = createMessage({
                    bounce: BounceMode.NoBounce,
                    dest: store.follower,
                    value: ton("0.05"),
                    body: FollowRevertedNotification {
                        queryId: msg.queryId,
                        reason: 750,
                        followerOwner: msg.followerOwner,
                    },
                });
                revFollower.send(SEND_MODE_PAY_FEES_SEPARATELY | SEND_MODE_BOUNCE_ON_ACTION_FAIL);

                val revFollowee = createMessage({
                    bounce: BounceMode.NoBounce,
                    dest: store.followee,
                    value: 0,
                    body: FollowRevertedNotification {
                        queryId: msg.queryId,
                        reason: 750,
                        followerOwner: msg.followerOwner,
                    },
                });
                // SAFETY: refund remaining balance to followee when reverting
                revFollowee.send(SEND_MODE_CARRY_ALL_BALANCE | SEND_MODE_IGNORE_ERRORS);
                return;
            }

            store.isFollowing = true;

            // Follow contract is deployed and active; refund any excess gas to followerOwner
            val refundMsg = createMessage({
                bounce: BounceMode.NoBounce,
                dest: msg.followerOwner,
                value: 0,
                body: createEmptySlice(),
            });
            refundMsg.send(
                SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
            );
        }

        Unfollow => {
            assert (
                in.senderAddress == store.followee || in.senderAddress == store.follower
            ) throw Errors.IncorrectSender;
            if (!store.isFollowing) {
                val revFollower = createMessage({
                    bounce: BounceMode.NoBounce,
                    dest: store.follower,
                    value: ton("0.05"),
                    body: UnfollowRevertedNotification {
                        queryId: msg.queryId,
                        reason: 751,
                        followerOwner: msg.initiator,
                    },
                });
                revFollower.send(SEND_MODE_PAY_FEES_SEPARATELY | SEND_MODE_IGNORE_ERRORS);

                val revFollowee = createMessage({
                    bounce: BounceMode.NoBounce,
                    dest: store.followee,
                    value: 0,
                    body: UnfollowRevertedNotification {
                        queryId: msg.queryId,
                        reason: 751,
                        followerOwner: msg.initiator,
                    },
                });
                // SAFETY: refund remaining balance to followee when reverting
                revFollowee.send(SEND_MODE_CARRY_ALL_BALANCE | SEND_MODE_IGNORE_ERRORS);
                return;
            }

            store.isFollowing = false;

            val refundMsg = createMessage({
                bounce: BounceMode.NoBounce,
                dest: store.follower,
                value: 0,
                body: createEmptySlice(),
            });
            refundMsg.send(
                SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_IGNORE_ERRORS,
            );
        }

        HotUpgrade => {
            assert (
                in.senderAddress == store.follower || in.senderAddress == store.followee
            ) throw Errors.IncorrectSender;
            contract.setCodePostponed(msg.code);
            // SAFETY: update continuation register C3 for new code
            setTvmRegisterC3(transformSliceToContinuation(msg.code.beginParse()));
            hotUpgradeFollowingData(msg.additionalData);
            return;
        }

        else => {
            // invalid input; a typical reaction is:
            // ignore empty messages, "wrong opcode" if not
            assert (in.body.isEmpty()) throw 0xFFFF;
        }
    }
    store.save();
}

@method_id(2828)
fun hotUpgradeFollowingData(_additionalData: cell?) {
    val oldStore = FollowingStore.load();
    oldStore.save();
}

get fun get_following_data(): FollowingStore {
    return FollowingStore.load();
}

get fun get_is_following(): bool {
    return FollowingStore.load().isFollowing;
}
