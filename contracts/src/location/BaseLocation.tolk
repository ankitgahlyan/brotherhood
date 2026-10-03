import "@stdlib/tvm-lowlevel"

import "@contracts/common/errors"
import "@contracts/common/messages"
import "@contracts/location/location-utils"

type AllowedMessageToBaseLocation = LocationAddMember

contract BaseLocation {
    author: "zeta"
    version: "0.1.0"
    description: "minimal deployment proxy for Location establishing deterministic address calculation"
    storage: BaseLocationStore
    incomingMessages: AllowedMessageToBaseLocation
}

@method_id(2223)
fun migrateLocationFromBase(
    _body: slice,
    _senderAddress: address,
    _baseStore: BaseLocationStore,
): void {
    // Stub in BaseLocation. After setTvmRegisterC3, TVM resolves
    // method_id 2223 from the new code (Location).
}

fun onInternalMessage(in: InMessage): void {
    val store = BaseLocationStore.fromCell(contract.getData());
    assert (in.senderAddress == store.minterAddress) throw Errors.NotOwner;

    val msg = lazy AllowedMessageToBaseLocation.fromSlice(in.body);
    match (msg) {
        LocationAddMember => {
            val codeToUpgrade = msg.latestLocationCode;
            assert (codeToUpgrade != null) throw Errors.NotOnboardedWallet;
            contract.setCodePostponed(codeToUpgrade);
            // SAFETY: codeToUpgrade verified by minter sender assertion
            setTvmRegisterC3(transformSliceToContinuation(codeToUpgrade.beginParse()));
            migrateLocationFromBase(in.body, in.senderAddress, store);
        }
    }
}
