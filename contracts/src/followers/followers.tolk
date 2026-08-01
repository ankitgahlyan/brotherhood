import "consts"
import "messages"
import "store"

type UnFollowersMsg = UnFollowInternal

fun onBouncedMessage(_in: InMessageBounced) {}

fun onInternalMessage(in: InMessage) {
    val msg = lazy UnFollowersMsg.fromSlice(in.body);
    var store = lazy UnFollowStore.load();

    match (msg) {
        UnFollowInternal => {
            assert (in.senderAddress == store.admin) throw 700;          // incorrect sender
            assert (msg.follow != store.follow) throw ALREADY_FOLLOWING; // or unfollowed

            store.follow = msg.follow;
        }
    }
}

get fun get_followers_data(): UnFollowStore {
    return UnFollowStore.load();
}
