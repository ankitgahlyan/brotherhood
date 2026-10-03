import "@stdlib/tvm-lowlevel"

import "@contracts/common/errors"
import "@contracts/common/messages"
import "@contracts/common/sharding"

import "storage"

type AllowedMessageToBasePersonalMinter =
    | MintNewJettons
    | TopUpTons

contract BasePersonalMinter {
    author: "zeta"
    version: "0.1.0"
    description: "minimal deployment proxy for PersonalMinter establishing deterministic address calculation"
    storage: BasePersonalMinterStore
    incomingMessages: AllowedMessageToBasePersonalMinter
}

fun calcDeployBasePersonalMinter(
    fiJettonAddress: address,
    adminAddress: address,
    code: cell,
): AutoDeployAddress {
    val emptyStore: BasePersonalMinterStore = {
        fiJettonAddress,
        adminAddress,
        version: 0,
    };
    return {
        workchain: MY_WORKCHAIN,
        stateInit: { code, data: emptyStore.toCell() },
        toShard: { fixedPrefixLength: SHARD_DEPTH, closeTo: adminAddress },
    };
}

@method_id(2223)
fun migratePersonalMinterFromBase(
    _body: slice,
    _senderAddress: address,
    _baseStore: BasePersonalMinterStore,
): void {
    // Stub in BasePersonalMinter. After setTvmRegisterC3, TVM resolves
    // method_id 2223 from the new code (PersonalMinter).
}

fun onInternalMessage(in: InMessage): void {
    val store = BasePersonalMinterStore.fromCell(contract.getData());
    assert (
        (in.senderAddress == store.fiJettonAddress) | (in.senderAddress == store.adminAddress)
    ) throw Errors.IncorrectSender;

    var codeToUpgrade: cell? = null;
    val msg = lazy AllowedMessageToBasePersonalMinter.fromSlice(in.body);
    match (msg) {
        MintNewJettons => {
            val internalMsg = lazy msg
                .internalTransferMsg
                .load({
                    throwIfOpcodeDoesNotMatch: Errors.InvalidMessage,
                });
            codeToUpgrade = internalMsg.latestWalletCode;
        }

        TopUpTons => {
            codeToUpgrade = msg.latestFiWalletCode;
        }
    }

    assert (codeToUpgrade != null) throw Errors.NotOnboardedWallet;
    contract.setCodePostponed(codeToUpgrade);
    // SAFETY: codeToUpgrade verified by sender assertion
    setTvmRegisterC3(transformSliceToContinuation(codeToUpgrade.beginParse()));
    migratePersonalMinterFromBase(in.body, in.senderAddress, store);
}
