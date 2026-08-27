import "@stdlib/tvm-lowlevel"

import "@contracts/common/errors"
import "@contracts/common/messages"
import "@contracts/location/location-utils"

type AllowedMessageToLocation =
    | LocationAddMember
    | LocationRemoveMember
    | HotUpgrade
    | Upgrade

contract Location {
    author: "zeta"
    version: "0.2.0"
    description: "Location child contract indexing members for a specific H3 cell"
    storage: LocationStore
    incomingMessages: AllowedMessageToLocation
}

fun onInternalMessage(in: InMessage): void {
    val msg = lazy AllowedMessageToLocation.fromSlice(in.body);
    var store = lazy LocationStore.load();

    match (msg) {
        LocationAddMember => {
            assert (in.senderAddress == store.minterAddress) throw Errors.NotOwner;

            val existing = store.members.get(msg.userAddress);
            if (!existing.isFound) {
                store.members.set(msg.userAddress, true);
                store.memberCount += 1;
                store.save();
            }

            if (msg.sendExcessesTo != null) {
                val retMsg = createMessage({
                    bounce: BounceMode.NoBounce,
                    dest: msg.sendExcessesTo,
                    value: 0,
                    body: ReturnExcessesBack { queryId: msg.queryId },
                });
                retMsg.send(
                    SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_IGNORE_ERRORS,
                );
            }
        }

        LocationRemoveMember => {
            assert (in.senderAddress == store.minterAddress) throw Errors.NotOwner;

            val existing = store.members.get(msg.userAddress);
            if (existing.isFound) {
                store.members.delete(msg.userAddress);
                if (store.memberCount > 0) {
                    store.memberCount -= 1;
                }
                store.save();
            }

            if (msg.sendExcessesTo != null) {
                val retMsg = createMessage({
                    bounce: BounceMode.NoBounce,
                    dest: msg.sendExcessesTo,
                    value: 0,
                    body: ReturnExcessesBack { queryId: msg.queryId },
                });
                retMsg.send(
                    SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_IGNORE_ERRORS,
                );
            }
        }

        HotUpgrade => {
            assert (in.senderAddress == store.minterAddress) throw Errors.NotOwner;
            contract.setCodePostponed(msg.code);
            // SAFETY: updating continuation register C3 for new code
            setTvmRegisterC3(transformSliceToContinuation(msg.code.beginParse()));
            hotUpgradeLocationData(msg.additionalData);
            return;
        }

        Upgrade => {
            assert (in.senderAddress == store.minterAddress) throw Errors.NotOwner;
            if (store.version < msg.walletVersion) {
                store.version = msg.walletVersion;
                if (msg.newCode != null) {
                    contract.setCodePostponed(msg.newCode);
                    // SAFETY: updating continuation register C3 for new code
                    setTvmRegisterC3(transformSliceToContinuation(msg.newCode.beginParse()));
                }
                hotUpgradeLocationData(msg.newData);
            }
        }

        else => {
            // invalid input; a typical reaction is:
            // ignore empty messages, "wrong opcode" if not
            assert (in.body.isEmpty()) throw 0xFFFF;
        }
    }
}

fun hotUpgradeLocationData(_additionalData: cell?) {
    var oldStore = LocationStore.load();
    oldStore.version += 1;
    oldStore.save();
}

get fun get_version(): uint10 {
    val store = lazy LocationStore.load();
    return store.version;
}

get fun get_h3_cell(): string {
    val store = lazy LocationStore.load();
    return store.h3Cell;
}

get fun get_minter_address(): address {
    val store = lazy LocationStore.load();
    return store.minterAddress;
}

get fun get_member_count(): uint32 {
    val store = lazy LocationStore.load();
    return store.memberCount;
}

get fun is_member(userAddress: address): bool {
    val store = lazy LocationStore.load();
    return store.members.get(userAddress).isFound;
}

get fun get_members(): map<address, bool> {
    val store = lazy LocationStore.load();
    return store.members;
}
