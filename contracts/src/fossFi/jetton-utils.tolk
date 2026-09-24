import "@contracts/common/errors"
import "@contracts/common/fi-wallet-code"
import "@contracts/common/messages"
import "@contracts/common/sharding"
import "@contracts/common/utils"
import "@contracts/lottery/messages"

import "fees-management"
import "storage"

fun address.getAddrFiWallet(self): address {
    // used by: wallet txn sending
    val store = lazy FiWalletStore.load();
    val addrs = lazy store.addresses.load();
    return calcDeployBaseFiWallet(
        self,
        addrs.trustedJettonAddrs.load().minterAddr,
        getFiWalletCode(),
    ).calculateAddress();
}

fun checkCorrectSenderInternal(sender: address, owner: address) {
    val store = lazy FiWalletStore.load();
    if (sender == owner.getAddrFiWallet()) {
        assert (store.active) throw Errors.AccountInactive;
    } else {
        assert (
            sender == store.addresses.load().trustedJettonAddrs.load().minterAddr
        ) throw Errors.NotValidWallet;
    }
}

// shared guard for all owner-initiated "Act*" actions
fun checkOwnerAction(senderAddress: address, valueCoins: coins, owner: address) {
    assert (senderAddress == owner) throw Errors.NotOwner;
    assert (valueCoins >= grams("0.05")) throw Errors.NotEnoughGas;
    // todo: assert (store.Active) throw Errors.AccountInactive;
}

fun checkActionRecipient(recipient: address) {
    assert (recipient.getWorkchain() == MY_WORKCHAIN) throw Errors.WrongWorkchain;
}

fun idActionChecks(store: FiWalletStore) {
    val reports = lazy store.maps.load();
    val reportInfo = lazy reports.reportInfo.load();
    assert (
        store.active || store.isPrevilegedAccount
    ) throw Errors.AccountInactive;                                                  // mint/burn actions allowed only for active/ID accounts
    assert (
        reportInfo.reporterCount < 1
    ) throw Errors.AlreadyReported;                                                  // reported IDs can't act
    assert (store.debt == 0) throw Errors.AccountInDebt;
}

fun checkDebts(store: FiWalletStore) {
    assert (store.debt == 0) throw Errors.AccountInDebt;
}

@inline
fun requestUpgrade(dest: address) {
    val outMsg = createMessage({
        dest,
        bounce: BounceMode.NoBounce,
        value: grams("0.1"),
        body: RequestUpgradeCode {},
    });
    outMsg.send(SEND_MODE_PAY_FEES_SEPARATELY | SEND_MODE_IGNORE_ERRORS);
}

@inline
fun sendUpgrade(to: address, sender: address, walletVersion: uint10) {
    val outMsg = createMessage({
        dest: to,
        value: grams("0.1"),
        bounce: false,
        body: Upgrade {
            walletVersion,
            sender,
            newCode: contract.getCode(),
        },
    });
    outMsg.send(SEND_MODE_PAY_FEES_SEPARATELY | SEND_MODE_IGNORE_ERRORS);
}

@inline
fun enterLottery(sender: address, dest: address, amount: coins) {
    val enterLottery = createMessage({
        bounce: BounceMode.Only256BitsOfBody,
        dest, // through minter
        value: 0,
        body: EnterLottery { sender, amount },
    });
    enterLottery.send(
        SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
    );
}

fun sendExcesses(queryId: uint64, inValue: coins, to: address) {
    reserveForWalletBalance(inValue);

    val outMsg = createMessage({
        bounce: BounceMode.NoBounce,
        dest: to,
        value: 0,
        body: ReturnExcessesBack { queryId },
    });
    // safety
    outMsg.send(SEND_MODE_CARRY_ALL_BALANCE | SEND_MODE_IGNORE_ERRORS);
}

fun returnExcessesBack(queryId: uint64, to: address) {
    val outMsg = createMessage({
        bounce: BounceMode.NoBounce,
        dest: to,
        value: 0,
        body: ReturnExcessesBack { queryId },
    });
    outMsg.send(SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_IGNORE_ERRORS);
}

fun notifyOwner(
    queryId: uint64,
    transferInitiator: address,
    dest: address,
    jettonAmount: coins,
    forwardPayload: slice,
) {
    val outMsg = createMessage({
        bounce: BounceMode.NoBounce, // cause receiver can have uninitialized contract
        dest,                        // notify current owner
        value: grams("0.001"),
        body: TransferNotificationForRecipient {
            queryId,
            jettonAmount,
            transferInitiator,
            forwardPayload,
        },
    });
    outMsg.send(SEND_MODE_PAY_FEES_SEPARATELY | SEND_MODE_IGNORE_ERRORS); // bounce back to sender
}

fun isNonEmptyString(str: string): bool {
    return str.beginParse().remainingBitsCount() > 0;
}
