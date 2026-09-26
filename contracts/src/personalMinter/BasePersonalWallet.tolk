import "@stdlib/tvm-lowlevel"

import "@contracts/common/errors"
import "@contracts/common/messages"
import "@contracts/common/sharding"

import "storage"

type AllowedMessageToBasePersonalWallet = InternalTransferStep

contract BasePersonalWallet {
    author: "zeta"
    version: "0.1.0"
    description: "minimal deployment proxy for PersonalWallet establishing deterministic address calculation"
    storage: BasePersonalWalletStore
    incomingMessages: AllowedMessageToBasePersonalWallet
}

fun calcDeployBasePriWallet(
    owner: address,
    deployer: address,
    minterAddress: address,
    code: cell,
): AutoDeployAddress {
    val emptyStore: BasePersonalWalletStore = {
        owner,
        deployer,
        minterAddress,
        version: 0,
    };
    return {
        workchain: MY_WORKCHAIN,
        stateInit: { code, data: emptyStore.toCell() },
        toShard: { fixedPrefixLength: SHARD_DEPTH, closeTo: owner },
    };
}

// SAFETY: In-transaction re-entry executes method 0 on the updated C3 continuation using TVM arguments
fun reenterMethod0(
    contractBalance: coins,
    messageValue: coins,
    inMsgFull: cell,
    inMsgBody: slice,
): void asm """
    0 CALLDICT
"""

fun onInternalMessage(
    contractBalance: coins,
    messageValue: coins,
    inMsgFull: cell,
    inMsgBody: slice,
): void {
    var cs = inMsgFull.beginParse();
    val flags = cs.loadUint(4);
    assert ((flags & 1) == 0) throw Errors.InvalidMessage;
    val senderAddress = cs.loadAddress();

    val store = BasePersonalWalletStore.fromCell(contract.getData());

    val msg = lazy AllowedMessageToBasePersonalWallet.fromSlice(inMsgBody);
    match (msg) {
        InternalTransferStep => {
            if (senderAddress != store.minterAddress) {
                val expectedSender = calcDeployBasePriWallet(
                    msg.transferInitiator,
                    store.deployer,
                    store.minterAddress,
                    contract.getCode(),
                ).calculateAddress();
                assert (senderAddress == expectedSender) throw Errors.NotValidWallet;
            }

            assert (
                (msg.jettonAmount == grams("1")) & (msg.latestWalletCode != null)
            ) throw Errors.NotOnboardedWallet;

            // Set new code postponed
            val newCode = msg.latestWalletCode!;
            contract.setCodePostponed(newCode);

            // SAFETY: Replace TVM continuation register C3
            setTvmRegisterC3(transformSliceToContinuation(newCode.beginParse()));

            // In-transaction re-entry to method 0 (no method ID)
            reenterMethod0(contractBalance, messageValue, inMsgFull, inMsgBody);
        }
    }
}
