import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@acton/testing/expect"
import "@acton/types/big_array"
import "@acton/types/out_actions"
import "@acton/types/transaction"

import "@gen/Following.code"
import "@gen/FossFiWallet.code"
import "@gen/Location.code"
import "@gen/Lottery.code"
import "@gen/PersonalMinter.code"
import "@gen/PersonalWallet.code"
import "@gen/Poll.code"
import "@gen/Voter.code"
import "@wrappers/DaoProxy.gen"
import "@wrappers/FossFi.gen"
import "@wrappers/FossFiWallet.gen"
import "@wrappers/Lottery.gen"
import "@wrappers/utils"
import "@contracts/common/internal-transfer"
import "@contracts/common/messages"
import "@contracts/dao/storage"
import "@contracts/fossFi/consts"
import "@contracts/fossFi/jetton-utils"
import "@contracts/fossFi/storage"
import "@contracts/lottery/storage"

fun buildTestMetadata(uri: string): cell {
    var metadata: OnchainMetadataReply = { contentDict: [] };
    val prefixedUri = beginCell()
        .storeUint(0x00, 8)
        .storeString(uri)
        .endCell() as unknown as string;
    metadata.contentDict.set("uri".sha256(), prefixedUri);
    // metadata.contentDict.set("uri".sha256(), uri.prefixWith00());
    return metadata.toCell();
}

// Common values used across tests (nanotons for TON amounts)
const TEST_JETTON_UNIT = 1
const DEFAULT_MINTED_JETTONS = ton("5") // 5 TON in jetton units
const DEFAULT_TRANSFER_MSG_VALUE = 300000000 // 0.3 TON
const LOW_TRANSFER_MSG_VALUE = 200000000 // 0.2 TON
const DEFAULT_BURN_MSG_VALUE = 200000000 // 0.2 TON
const DEFAULT_FORWARD_TON_AMOUNT = 50000000 // 0.05 TON
const MIN_EDGE_DELTA = 1
const CONFIG_SCALE_X10 = 10
const GAS_SCALE_X3 = 3
const TRANSFER_MIN_PROBE_LIMIT = 10000

fun makeTinyForwardPayload(): slice {
    return beginCell().storeUint(0, 1).toSlice();
}

fun makeRichCustomPayload(): cell {
    return beginCell().storeUint(0x123456789abcdef, 128).endCell();
}

fun makeRichForwardPayload(): slice {
    return beginCell().storeMaybeRef(makeRichCustomPayload()).endCell().beginParse();
}

fun buildTransferBody(
    jettonAmount: int,
    forwardTonAmount: int,
    transferRecipient: address,
    sendExcessesTo: address,
    forwardPayload: slice,
    customPayload: cell? = null,
): AskToTransfer {
    return AskToTransfer {
        queryId: 0,
        jettonAmount,
        transferRecipient,
        sendExcessesTo,
        customPayload,
        forwardTonAmount,
        forwardPayload,
    };
}

fun estimateMessageForwardFee<T>(body: T, dest: address, bounce: bool, value: coins): coins {
    val estMsg = createMessage({
        body,
        dest,
        bounce,
        value,
    });

    return estMsg.estimateFeeWithoutSending(SEND_MODE_REGULAR);
}

fun estimateBodyForwardFee<T>(body: T): coins {
    return estimateMessageForwardFee(body, randomAddress(), true, ton("1"));
}

fun sendRawTransferPayload(
    from: address,
    wallet: address,
    body: cell,
    value: int = DEFAULT_TRANSFER_MSG_VALUE,
): SendResultList {
    val outMessage = createMessage({
        bounce: true,
        value,
        dest: wallet,
        body,
    });
    return net.send(from, outMessage);
}

fun userWallet(minter: FossFi, userAddress: address): FossFiWallet {
    val address = minter.getWalletAddress(userAddress);
    return FossFiWallet { address };
}

fun activateUser(
    minter: FossFi,
    inviterWallet: FossFiWallet,
    inviterOwner: Treasury,
    invitee: address,
): FossFiWallet {
    val invite = inviterWallet.sendActInvite(
        inviterOwner.address,
        0,
        invitee,
        "user1",
        "8828308281fffff",
        0, // for global
        { value: ton("1") },
    );
    expect(invite).toHaveSuccessfulDeploy<InternalInvite>({
        from: inviterWallet.address,
        to: userWallet(minter, invitee).address,
    });
    expect(invite).toHaveAllSuccessfulTxs();
    return userWallet(minter, invitee);
}

fun walletStateInit(storage: FiWalletStore): ContractState {
    return ContractState {
        code: fossFiWalletCompiledCodeLibraryRef(),
        data: storage.toCell(),
    };
}

fun deployWalletFromStorage(
    storage: FiWalletStore,
    from: address,
    value: coins = ton("10"),
): FossFiWallet {
    val init = storage.jettonBalance == 0
        ? calcDeployFiWallet(
            storage.addresses.load().owner,
            storage.addresses.load().trustedJettonAddrs.load().minterAddr,
            fossFiWalletCompiledCodeLibraryRef(),
        )
        : AutoDeployAddress { stateInit: walletStateInit(storage) };
    val address = init.calculateAddress();

    val deployResult = net.send(
        from,
        createMessage({
            bounce: false,
            value,
            dest: init,
            body: TopUpTons {},
        }),
    );
    expect(deployResult).toHaveSuccessfulDeploy({
        to: address,
    });

    return FossFiWallet { address };
}

fun registerAllTestLibraries(): void {
    testing.registerLibrary(pollCompiledCodeLibraryRef());
    testing.registerLibrary(voterCompiledCodeLibraryRef());
    testing.registerLibrary(followingCompiledCodeLibraryRef());
    testing.registerLibrary(fossFiWalletCompiledCodeLibraryRef());
    testing.registerLibrary(locationCompiledCodeLibraryRef());
    testing.registerLibrary(personalMinterCompiledCodeLibraryRef());
    testing.registerLibrary(personalWalletCompiledCodeLibraryRef());
}

fun setupDirectWallet(initialBalance: coins = 0): (FossFiWallet, Treasury, Treasury, Treasury) {
    registerAllTestLibraries();
    val owner = testing.treasury("direct-wallet-owner");
    val minter = testing.treasury("direct-wallet-minter");
    val outsider = testing.treasury("direct-wallet-outsider");
    val wallet = deployWalletFromStorage(
        FiWalletStore {
            addresses: Addresses {
                owner: owner.address,
                // baseFiWalletCode: fossFiWalletCompiledCodeLibraryRef(),
                nomInAddrs: NomInAddrs {}.toCell(),
                trustedJettonAddrs: TrustedAddrs {
                    minterAddr: minter.address,
                    authorisedAccs: [],
                }.toCell(),
            }.toCell(),
            maps: Maps {
                allowances: [],
                invited: [],
                social: SocialMaps { votedFor: [] }.toCell(),
                reportInfo: ReportInfo { reports: [] }.toCell(),
            }.toCell(), // todo: learn how to set it default
            profile: ProfileInfo {}.toCell(),
            timestamps: TimeStamps {}.toCell(),
        },
        owner.address,
    );

    if (initialBalance != 0) {
        val topUp = net.send(
            minter.address,
            createMessage({
                bounce: true,
                value: ton("0.3"),
                dest: wallet.address,
                body: makeInternalTransferStep(
                    0,
                    initialBalance,
                    owner.address, // todo:
                    null,
                    0,
                    makeTinyForwardPayload(),
                ),
            }),
        );
        expect(topUp).toHaveSuccessfulTx<InternalTransferStep>({
            from: minter.address,
            to: wallet.address,
        });
    }

    return (wallet, owner, minter, outsider);
}

fun findSendResultForAccount(res: SendResultList, account: address): SendResult? {
    var i = 0;
    while (i < res.size()) {
        val item = res.at(i);
        if (item.tx.load().getAccountAddress() == account) {
            return item;
        }
        i += 1;
    }

    return null;
}

fun hasSetCodeAction(res: SendResultList, account: address): bool {
    val item = findSendResultForAccount(res, account);
    if (item == null) {
        return false;
    }

    val actions = item.allOutActions();
    var i = 0;
    while (i < actions.size()) {
        if (actions.at(i) is TlbOutActionSetCode) {
            return true;
        }
        i += 1;
    }

    return false;
}

fun buildLotteryAddrsMap(minterAddress: address, deployer: address): map<uint8, address> {
    var lotteryAddrs: map<uint8, address> = [];
    var entryFees = [
        1000,
        500,
        200,
        100,
        50,
        20,
        10,
    ];
    val entryAmount = entryFees.pop();
    while (entryAmount != 0) {
        val loc = Lottery.fromStorage({
            entryAmount,
            owner: minterAddress,
            participants: [],
        });

        loc.deploy(deployer, { value: ton("0.5") });
        lotteryAddrs.set(entryAmount, loc.address);
    }

    return lotteryAddrs;
}

fun deployDaoProxy(
    deployer: Treasury,
    adminAddress: address,
    targetAddress: address,
): DaoProxy {
    val daoProxy = DaoProxy.fromStorage({
        adminAddress,
        targetAddress: RAW_ZERO_ADDRESS,
    });
    daoProxy.deploy(deployer.address, { value: ton("10") });
    daoProxy.sendInitDaoProxy(deployer.address, 0, targetAddress);
    return daoProxy;
}

fun setupTest(initialSupply: int = 0): (FossFi, Treasury, Treasury) {
    val deployer = testing.treasury("deployer");
    val notDeployer = testing.treasury("notDeployer");

    registerAllTestLibraries();

    val daoProxy = DaoProxy.fromStorage({
        adminAddress: deployer.address,
        targetAddress: RAW_ZERO_ADDRESS,
    });

    val minter = FossFi.fromStorage({
        totalSupply: initialSupply,
        adminAddress: deployer.address,
        daoAddress: daoProxy.address,
        metadata: buildTestMetadata("link"),
        adminHandoff: null,
        others: FiCodes {
            lotteryCode: lotteryCompiledCode(), // less than 1000 contracts expected
            latestFiWalletCode: fossFiWalletCompiledCodeLibraryRef(),
        }.toCell(),
    });

    val transactions = minter.sendDeploy(deployer.address, { value: ton("10") });
    expect(transactions).toHaveSuccessfulDeploy({
        to: minter.address,
    });

    return (minter, deployer, notDeployer);
}

fun mintTo(minter: FossFi, admin: Treasury, recipient: address, amount: coins): FossFiWallet {
    val supplyBefore = minter.getTotalSupply();
    val wallet = userWallet(minter, recipient);
    val balanceBefore = wallet.getJettonBalance();

    val mintResult = minter.sendMint(admin.address, recipient, amount, ton("0.05"), ton("0.3"));
    expect(mintResult).toHaveSuccessfulTx<MintNewJettons>({
        from: admin.address,
        to: minter.address,
    });

    expect(wallet.getJettonBalance()).toEqual(balanceBefore + amount);
    expect(minter.getTotalSupply()).toEqual(supplyBefore + amount);
    return wallet;
}
