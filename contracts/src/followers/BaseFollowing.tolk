import "@stdlib/tvm-lowlevel"

import "@contracts/common/errors"

import "messages"
import "store"

type AllowedMessageToBaseFollowing = InitFollow

contract BaseFollowing {
    author: "zeta"
    version: "0.1.0"
    description: "minimal deployment proxy for Following establishing deterministic address calculation"
    storage: BaseFollowingStore
    incomingMessages: AllowedMessageToBaseFollowing
}

@method_id(2223)
fun migrateFollowingFromBase(
    _body: slice,
    _senderAddress: address,
    _baseStore: BaseFollowingStore,
): void {
    // Stub in BaseFollowing. After setTvmRegisterC3, TVM resolves
    // method_id 2223 from the new code (Following).
}

fun onInternalMessage(in: InMessage): void {
    val store = BaseFollowingStore.fromCell(contract.getData());
    assert (
        (in.senderAddress == store.followee) | (in.senderAddress == store.follower)
    ) throw Errors.IncorrectSender;

    val msg = lazy AllowedMessageToBaseFollowing.fromSlice(in.body);
    match (msg) {
        InitFollow => {
            val codeToUpgrade = msg.latestFollowingCode;
            assert (codeToUpgrade != null) throw Errors.NotOnboardedWallet;
            contract.setCodePostponed(codeToUpgrade);
            // SAFETY: codeToUpgrade verified by follower/followee sender assertion
            setTvmRegisterC3(transformSliceToContinuation(codeToUpgrade.beginParse()));
            migrateFollowingFromBase(in.body, in.senderAddress, store);
        }
    }
}
