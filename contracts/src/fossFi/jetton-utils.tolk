import "@stdlib/gas-payments"
import "@contracts/common/fees-management"
import "@contracts/common/messages"
import "@contracts/common/sharding"
import "@contracts/common/errors"
import "@contracts/lottery/messages"
import "storage"

fun calcDeployFiWallet(
    owner: address,
    treasury: address,
    minterAddress: address,
    baseFiWalletCode: cell,
): AutoDeployAddress {
    val emptyFiWalletStore: FiWalletStore = {
        addresses: Addresses {
            owner,
            treasury,
            baseFiWalletCode,
            nomInAddrs: NomInAddrs {}.toCell(),
            trustedJettonAddrs: TrustedAddrs {
                minterAddr: minterAddress,
                authorisedAccs: [],
            }.toCell(),
        }.toCell(),
        maps: Maps {
            allowances: [],
            invited: [],
            social: SocialMaps { votedFor: [], followings: [] }.toCell(),
            reportInfo: ReportInfo { reports: [] }.toCell(),
        }.toCell(), // todo: learn how to set it default
        timestamps: TimeStamps {}.toCell(),
    };

    return {
        stateInit: { code: baseFiWalletCode, data: emptyFiWalletStore.toCell() },
        toShard: { fixedPrefixLength: SHARD_DEPTH, closeTo: owner },
    };                                                                                                                                                // todo: remove code dep just deploy empty wallet and then upgrade it to the latest code
}

fun address.getAddrFiWallet(self): address {
    // used by: wallet txn sending
    val store = lazy FiWalletStore.load();
    val addrs = lazy store.addresses.load();
    return calcDeployFiWallet(
        self,
        addrs.treasury,
        addrs.trustedJettonAddrs.load().minterAddr,
        addrs.baseFiWalletCode,
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
    assert (valueCoins > ton("0.5")) throw Errors.NotEnoughGas;
}

fun checkActionRecipient(recipient: address) {
    assert (recipient.getWorkchain() == MY_WORKCHAIN) throw Errors.WrongWorkchain;
}

fun idActionChecks(store: FiWalletStore) {
    val reports = lazy store.maps.load();
    val reportInfo = lazy reports.reportInfo.load();
    assert (
        store.active
    ) throw Errors.AccountInactive;                                     // mint/burn actions allowed only for active/ID accounts
    assert (reportInfo.reporterCount < 1) throw Errors.AlreadyReported; // reported IDs can't act
}

fun address.deActivate(self, _commandAmount: coins, store: FiWalletStore) {
    assert (store.active) throw Errors.AccountInactive;
    val internalDeActivate = createMessage({
        bounce: BounceMode.Only256BitsOfBody,
        dest: self.getAddrFiWallet(),
        value: 0,
        body: InternalDeActivate {}, // emptybody as jettonAddrs are stored
    });
    internalDeActivate.send(
        SEND_MODE_BOUNCE_ON_ACTION_FAIL | SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE,
    );
}

@inline
fun requestUpgrade(from: address, sender: address, version: uint10) {
    val outMsg = createMessage({
        dest: from,
        bounce: BounceMode.NoBounce,
        value: ton("0.1"),
        body: RequestUpgradeCode { sender, version },
    });
    outMsg.send(SEND_MODE_PAY_FEES_SEPARATELY | SEND_MODE_IGNORE_ERRORS);
}

@inline
fun sendUpgrade(to: address, sender: address, walletVersion: uint10) {
    val outMsg = createMessage({
        dest: to,
        value: ton("0.1"),
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
    reserveForBalance(inValue);

    val outMsg = createMessage({
        bounce: BounceMode.NoBounce,
        dest: to,
        value: 0,
        body: ReturnExcessesBack { queryId },
    });
    // safety
    outMsg.send(SEND_MODE_CARRY_ALL_BALANCE | SEND_MODE_IGNORE_ERRORS);
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
        value: ton("0.001"),
        body: TransferNotificationForRecipient {
            queryId,
            jettonAmount,
            transferInitiator,
            forwardPayload,
        },
    });
    outMsg.send(SEND_MODE_PAY_FEES_SEPARATELY | SEND_MODE_IGNORE_ERRORS); // bounce back to sender
}

@method_id(2222)
fun hotUpgradeFiWalletData(_additionalData: cell?) {
    // var oldStorage = lazy FiStore.fromCell(contract.getData());
    // assert (additionalData != null) throw 1112;
    // var storage = FiStore {
    //     supply: oldStorage.totalSupply,
    //     walletVersion: oldStorage.walletVersion,
    //     admin: oldStorage.adminAddress,
    //     baseFiWalletCode: oldStorage.baseFiWalletCode,
    //     metadata: oldStorage.metadata,
    //     others: oldStorage.others,
    // };
    // contract.setData(storage.toCell());
}

@inline
fun destroyContract(dest: address) {
    val outMsg = createMessage({
        bounce: BounceMode.NoBounce,
        value: 0,
        dest,
        body: ReturnExcessesBack { queryId: 0 },
    });
    // safety
    outMsg.send(SEND_MODE_CARRY_ALL_BALANCE | SEND_MODE_DESTROY);
}
