import "@stdlib/tvm-lowlevel"

import "@contracts/common/errors"
import "@contracts/common/fi-wallet-code"
import "@contracts/common/messages"
import "@contracts/common/utils"
import "@contracts/credit/credit-utils"
import "@contracts/credit/messages"
import "@contracts/credit/storage"
import "@contracts/personalMinter/jetton-utils"
import "@contracts/personalMinter/personal-wallet-code"

type AllowedMessageToCreditProxy =
    | CreditProxySetNeed
    | CreditProxyRemoveNeed
    | HotUpgrade
    | Destroy

contract CreditProxy {
    author: "zeta"
    version: "0.1.0"
    description: "Credit Proxy coordinating credit requests to LocationCredit contracts"
    storage: CreditProxyStore
    incomingMessages: AllowedMessageToCreditProxy
}

fun verifySender(
    senderAddress: address,
    owner: address,
    tokenInfo: Cell<CreditTokenInfo>?,
    fiMinterAddress: address,
): void {
    if (tokenInfo == null) {
        val expectedFiWallet = calcDeployBaseFiWallet(
            owner,
            fiMinterAddress,
            getBaseFiWalletCode(),
        ).calculateAddress();
        assert (senderAddress == expectedFiWallet) throw Errors.IncorrectSender;
    } else {
        val info = tokenInfo.load();
        if (info.tokenMinter == null || info.tokenMinter == fiMinterAddress) {
            val expectedFiWallet = calcDeployBaseFiWallet(
                owner,
                fiMinterAddress,
                getBaseFiWalletCode(),
            ).calculateAddress();
            assert (senderAddress == expectedFiWallet) throw Errors.IncorrectSender;
        } else {
            val dep = info.deployer != null ? info.deployer : owner;
            val expectedPersonalWallet = calcDeployPriWallet(
                owner,
                dep,
                info.tokenMinter,
                getBasePersonalWalletCode(),
            ).calculateAddress();
            assert (senderAddress == expectedPersonalWallet) throw Errors.IncorrectSender;
        }
    }
}

fun onInternalMessage(in: InMessage): void {
    if (in.body.isEmpty()) {
        return;
    }
    val msg = lazy AllowedMessageToCreditProxy.fromSlice(in.body);
    val store = lazy CreditProxyStore.load();

    match (msg) {
        CreditProxySetNeed => {
            verifySender(in.senderAddress, msg.owner, msg.tokenInfo, store.fiMinterAddress);

            val locDeploy = calcDeployLocationCredit(
                msg.h3Cell,
                contract.getAddress(),
                store.adminAddress,
                store.locationCreditCode,
            );
            val forwardMsg = createMessage({
                bounce: BounceMode.NoBounce,
                dest: locDeploy,
                value: 0,
                body: AddLocationCreditEntry {
                    queryId: msg.queryId,
                    tokenWalletAddress: in.senderAddress,
                    borrowerAddress: msg.owner,
                    terms: msg.terms,
                    sendExcessesTo: msg.owner,
                },
            });
            forwardMsg.send(
                SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_IGNORE_ERRORS,
            );
        }

        CreditProxyRemoveNeed => {
            verifySender(in.senderAddress, msg.owner, msg.tokenInfo, store.fiMinterAddress);

            val locDeploy = calcDeployLocationCredit(
                msg.h3Cell,
                contract.getAddress(),
                store.adminAddress,
                store.locationCreditCode,
            );
            val forwardMsg = createMessage({
                bounce: BounceMode.NoBounce,
                dest: locDeploy.calculateAddress(),
                value: 0,
                body: RemoveLocationCreditEntry {
                    queryId: msg.queryId,
                    tokenWalletAddress: in.senderAddress,
                    sendExcessesTo: msg.owner,
                },
            });
            forwardMsg.send(
                SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_IGNORE_ERRORS,
            );
        }

        HotUpgrade => {
            assert (in.senderAddress == store.adminAddress) throw Errors.NotOwner;
            contract.setCodePostponed(msg.code);
            // safety
            setTvmRegisterC3(transformSliceToContinuation(msg.code.beginParse()));
            if (msg.additionalData != null) {
                contract.setData(msg.additionalData);
            }
            return;
        }

        Destroy => {
            assert (in.senderAddress == store.adminAddress) throw Errors.NotOwner;
            destroyContract(in.senderAddress);
        }

        else => {
            assert (in.body.isEmpty()) throw 0xFFFF;
        }
    }
}

get fun getState(): CreditProxyStore {
    return CreditProxyStore.load();
}
