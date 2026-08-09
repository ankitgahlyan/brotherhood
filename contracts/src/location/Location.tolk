import "@contracts/common/errors"
import "@contracts/common/messages"
import "CityMap"

type AllowedMessageToLocation =
    | LocationRegisterCity
    | LocationUnregisterCity

struct LocationStore {
    letterKey: uint8
    minterAddress: address
    cityMapCode: cell
    cities: map<uint256, string>
}

fun LocationStore.save(self) {
    contract.setData(self.toCell());
}

fun calcDeployCityMap(
    cityName: string,
    locationAddress: address,
    cityMapCode: cell,
): AutoDeployAddress {
    val store: CityMapStore = {
        cityName,
        locationAddress,
        members: [],
    };
    return { stateInit: { code: cityMapCode, data: store.toCell() }, toShard: null };
}

contract Location {
    author: "zeta"
    version: "0.1.0"
    description: "Location aggregator contract for cities starting with a particular letter"
    storage: LocationStore
    incomingMessages: AllowedMessageToLocation
}

fun onInternalMessage(in: InMessage): void {
    val msg = lazy AllowedMessageToLocation.fromSlice(in.body);
    var store = lazy LocationStore.fromSlice(contract.getData().beginParse());

    match (msg) {
        LocationRegisterCity => {
            assert (in.senderAddress == store.minterAddress) throw Errors.NotOwner;

            store.cities.set(msg.cityName.beginParse().hash(), msg.cityName);
            store.save();

            val forwardMsg = createMessage({
                bounce: BounceMode.NoBounce,
                dest: calcDeployCityMap(msg.cityName, contract.getAddress(), store.cityMapCode),
                value: 0,
                body: RegisterCityMember {
                    queryId: msg.queryId,
                    ownerAddress: msg.ownerAddress,
                    cityName: msg.cityName,
                    sendExcessesTo: msg.sendExcessesTo,
                },
            });
            forwardMsg.send(SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE);
        }

        LocationUnregisterCity => {
            assert (in.senderAddress == store.minterAddress) throw Errors.NotOwner;

            val forwardMsg = createMessage({
                bounce: BounceMode.NoBounce,
                dest: calcDeployCityMap(msg.cityName, contract.getAddress(), store.cityMapCode),
                value: 0,
                body: UnregisterCityMember {
                    queryId: msg.queryId,
                    ownerAddress: msg.ownerAddress,
                    cityName: msg.cityName,
                    sendExcessesTo: msg.sendExcessesTo,
                },
            });
            forwardMsg.send(SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE);
        }
    }
}

get fun get_letter_key(): uint8 {
    val store = lazy LocationStore.fromSlice(contract.getData().beginParse());
    return store.letterKey;
}

get fun get_minter_address(): address {
    val store = lazy LocationStore.fromSlice(contract.getData().beginParse());
    return store.minterAddress;
}

get fun city_exists(cityName: string): bool {
    val store = lazy LocationStore.fromSlice(contract.getData().beginParse());
    return store.cities.get(cityName.beginParse().hash()).isFound;
}

get fun get_cities(): map<uint256, string> {
    val store = lazy LocationStore.fromSlice(contract.getData().beginParse());
    return store.cities;
}

get fun get_city_map_address(cityName: string): address {
    val store = lazy LocationStore.fromSlice(contract.getData().beginParse());
    val deployable = calcDeployCityMap(cityName, contract.getAddress(), store.cityMapCode);
    return deployable.calculateAddress();
}
