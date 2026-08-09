import "@contracts/common/errors"
import "@contracts/common/messages"

type AllowedMessageToCityMap =
    | RegisterCityMember
    | UnregisterCityMember

struct CityMapStore {
    cityName: string
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
            store.members.set(msg.ownerAddress, true);
            store.save();
        }

        UnregisterCityMember => {
            assert (in.senderAddress == store.locationAddress) throw Errors.NotOwner;
            store.members.delete(msg.ownerAddress);
            store.save();
        }
    }
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
