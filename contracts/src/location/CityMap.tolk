import "@stdlib/tvm-lowlevel"

import "@contracts/common/errors"
import "@contracts/common/messages"

type AllowedMessageToCityMap =
    | RegisterCityMember
    | UnregisterCityMember
    | HotUpgrade
    | Upgrade

struct CityMapStore {
    cityName: string
    version: uint10 = 0
    locationAddress: address
    members: map<address, bool>
}

fun CityMapStore.save(self) {
    contract.setData(self.toCell());
}

contract CityMap {
    author: "zeta"
    version: "0.1.0"
    description: "City index contract storing owner addresses for a specific city"
    storage: CityMapStore
    incomingMessages: AllowedMessageToCityMap
}

fun onInternalMessage(in: InMessage): void {
    val msg = lazy AllowedMessageToCityMap.fromSlice(in.body);
    var store = lazy CityMapStore.fromSlice(contract.getData().beginParse());

    match (msg) {
        RegisterCityMember => {
            assert (in.senderAddress == store.locationAddress) throw Errors.NotOwner;
            if (msg.version > store.version) {
                val req = createMessage({
                    bounce: BounceMode.NoBounce,
                    value: 0,
                    dest: store.locationAddress,
                    body: RequestUpgradeCode {
                        sender: contract.getAddress(),
                        version: store.version,
                    },
                });
                req.send(SEND_MODE_PAY_FEES_SEPARATELY | SEND_MODE_IGNORE_ERRORS);
            }
            store.members.set(msg.ownerAddress, true);
            store.save();
        }

        UnregisterCityMember => {
            assert (in.senderAddress == store.locationAddress) throw Errors.NotOwner;
            if (msg.version > store.version) {
                val req = createMessage({
                    bounce: BounceMode.NoBounce,
                    value: 0,
                    dest: store.locationAddress,
                    body: RequestUpgradeCode {
                        sender: contract.getAddress(),
                        version: store.version,
                    },
                });
                req.send(SEND_MODE_PAY_FEES_SEPARATELY | SEND_MODE_IGNORE_ERRORS);
            }
            store.members.delete(msg.ownerAddress);
            store.save();
        }

        HotUpgrade => {
            assert (in.senderAddress == store.locationAddress) throw Errors.NotOwner;
            contract.setCodePostponed(msg.code);
            // SAFETY: updating continuation register C3 for new code
            setTvmRegisterC3(transformSliceToContinuation(msg.code.beginParse()));
            hotUpgradeCityMapData(msg.additionalData);
            return;
        }

        Upgrade => {
            assert (in.senderAddress == store.locationAddress) throw Errors.NotOwner;
            if (store.version < msg.walletVersion) {
                store.version = msg.walletVersion;
                if (msg.newCode != null) {
                    contract.setCodePostponed(msg.newCode);
                    // SAFETY: updating continuation register C3 for new code
                    setTvmRegisterC3(transformSliceToContinuation(msg.newCode.beginParse()));
                }
                hotUpgradeCityMapData(msg.newData);
            }
        }
    }
}

fun hotUpgradeCityMapData(_additionalData: cell?) {
    var oldStore = CityMapStore.fromSlice(contract.getData().beginParse());
    oldStore.version += 1;
    oldStore.save();
}

get fun get_version(): uint10 {
    val store = lazy CityMapStore.fromSlice(contract.getData().beginParse());
    return store.version;
}

get fun get_city_name(): string {
    val store = lazy CityMapStore.fromSlice(contract.getData().beginParse());
    return store.cityName;
}

get fun get_location_address(): address {
    val store = lazy CityMapStore.fromSlice(contract.getData().beginParse());
    return store.locationAddress;
}

get fun get_members(): map<address, bool> {
    val store = lazy CityMapStore.fromSlice(contract.getData().beginParse());
    return store.members;
}
