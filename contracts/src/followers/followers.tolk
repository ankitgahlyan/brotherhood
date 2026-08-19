import "@contracts/common/errors"

import "messages"
import "store"

type FollowingAllowedMsg =
    | InitFollow
    | Unfollow
    | SettleDeath

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
    val store = lazy FollowingStore.load();

    match (msg) {
        InitFollow => {
            assert (in.senderAddress == store.follower) throw Errors.IncorrectSender;

            val notifyMsg = createMessage({
                bounce: BounceMode.NoBounce,
                dest: store.followee,
                value: 0,
                body: FollowNotification {
                    queryId: msg.queryId,
                    follower: store.follower,
                    followerOwner: msg.followerOwner,
                    mintAmount: store.mintAmount,
                },
            });
            notifyMsg.send(
                SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
            );
        }

        Unfollow => {
            assert (in.senderAddress == store.follower) throw Errors.IncorrectSender;

            val notifyMsg = createMessage({
                bounce: BounceMode.NoBounce,
                dest: store.followee,
                value: 0,
                body: UnfollowNotification {
                    queryId: msg.queryId,
                    follower: store.follower,
                    followerOwner: in.senderAddress,
                    burnAmount: store.mintAmount,
                },
            });
            notifyMsg.send(SEND_MODE_BOUNCE_ON_ACTION_FAIL);

            val destroyMsg = createMessage({
                bounce: BounceMode.NoBounce,
                dest: store.follower,
                value: 0,
                body: createEmptySlice(),
            });
            // todo: fixme: safety: maintain enough balance to process bounces when followee is inactive or change route 
            destroyMsg.send(
                SEND_MODE_CARRY_ALL_BALANCE | SEND_MODE_DESTROY,
            );
        }

        SettleDeath => {
            assert (in.senderAddress == store.follower) throw Errors.IncorrectSender;

            val notifyMsg = createMessage({
                bounce: BounceMode.NoBounce,
                dest: store.followee,
                value: 0,
                body: UnfollowNotification {
                    queryId: msg.queryId,
                    follower: store.follower,
                    followerOwner: in.senderAddress,
                    burnAmount: store.mintAmount,
                },
            });
            notifyMsg.send(SEND_MODE_BOUNCE_ON_ACTION_FAIL);

            val destroyMsg = createMessage({
                bounce: BounceMode.NoBounce,
                dest: store.follower,
                value: 0,
                body: createEmptySlice(),
            });
            // safety:
            destroyMsg.send(
                SEND_MODE_CARRY_ALL_BALANCE | SEND_MODE_DESTROY,
            );
        }
    }
}

get fun get_following_data(): FollowingStore {
    return FollowingStore.load();
}
