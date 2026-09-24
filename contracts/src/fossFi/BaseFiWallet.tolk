import "@stdlib/tvm-lowlevel"

import "@contracts/common/errors"
import "@contracts/common/messages"
import "@contracts/common/utils"

import "storage"

type AllowedMessageToBaseWallet =
    | TopUpTons
    | InternalInvite

contract BaseFiWallet {
    author: "zeta"
    version: "0.1.0"
    description: "minimal deployment proxy for FiWallet establishing deterministic address calculation"
    storage: BaseFiWalletStore
    incomingMessages: AllowedMessageToBaseWallet
}

@method_id(2223)
fun migrateFiWalletFromBase(
    _body: slice,
    _senderAddress: address,
    _baseStore: BaseFiWalletStore,
): void {
    // Stub in BaseFiWallet. After setTvmRegisterC3, TVM resolves
    // method_id 2223 from the new code (FossFiWallet).
}

fun onInternalMessage(in: InMessage): void {
    val store = BaseFiWalletStore.fromCell(contract.getData());
    var codeToUpgrade: cell? = null;

    val msg = lazy AllowedMessageToBaseWallet.fromSlice(in.body);
    match (msg) {
        InternalInvite => {
            if (
                in.senderAddress ==
                calcDeployBaseFiWallet(
                    msg.sender,
                    store.minterAddr,
                    contract.getCode(),
                ).calculateAddress()
            ) {
                codeToUpgrade = msg.latestFiWalletCode;
            }
        }

        TopUpTons => {
            assert (in.senderAddress == store.minterAddr) throw Errors.IncorrectSender;
            codeToUpgrade = msg.latestFiWalletCode!;
        }
    }

    if (codeToUpgrade != null) {
        contract.setCodePostponed(codeToUpgrade);
        // SAFETY: codeToUpgrade verified by sender assertion
        setTvmRegisterC3(transformSliceToContinuation(codeToUpgrade.beginParse()));
        migrateFiWalletFromBase(in.body, in.senderAddress, store);
    }
}
