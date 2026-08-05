import "@acton/io"
import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@acton/testing/expect"
import "@acton/types/big_array"
import "@acton/types/transaction"

import "@gen/FossFiWallet.code"
import "@contracts/common/fees-management"
import "@contracts/common/messages"
import "@contracts/common/internal-transfer"
import "@contracts/fossFi/storage"
import "@wrappers/FossFi.gen"
import "@wrappers/FossFiWallet.gen"
import "@wrappers/utils"

import "test-utils"

fun maxGasOnAccount(res: SendResultList, account: address): int {
    var best = 0;
    var i = 0;
    while (i < res.size()) {
        val item = res.at(i);
        val tx = item.tx.load();
        if (tx.getAccountAddress() == account) {
            val descr = tx.description.load();
            if (descr is TlbTransOrd) {
                if (descr.computePh is TlbTrComputeVm) {
                    if (item.gasUsed > best) {
                        best = item.gasUsed;
                    }
                }
            }
        }
        i += 1;
    }
    return best;
}

get fun `test bench: measure storage, init-state, and message sizes`() {
    val (minter, deployer, notDeployer) = setupTest();

    // ---- wallet storage at max: fill heavy maps so we capture upper bounds ----
    var invitedMap: map<address, coins> = [];
    invitedMap.set(randomAddress(), ton("1"));
    invitedMap.set(randomAddress(), ton("1"));
    invitedMap.set(randomAddress(), ton("1"));
    var allowancesMap: map<address, coins> = [];
    allowancesMap.set(randomAddress(), ton("5"));
    allowancesMap.set(randomAddress(), ton("5"));
    var votedForMap: map<address, uint4> = [];
    votedForMap.set(randomAddress(), 10);
    votedForMap.set(randomAddress(), 10);
    var reportsMap: map<address, bool> = [];
    reportsMap.set(randomAddress(), true);
    reportsMap.set(randomAddress(), true);
    reportsMap.set(randomAddress(), true);
    var authMap: map<address, address> = [];
    authMap.set(randomAddress(), randomAddress());
    authMap.set(randomAddress(), randomAddress());

    val heavyMaps = Maps {
        invited: invitedMap,
        allowances: allowancesMap,
        social: SocialMaps { votedFor: votedForMap, followings: invitedMap }.toCell(),
        reportInfo: ReportInfo {
            reports: reportsMap,
            tosBreach: false,
            reporterCount: 3,
            disputerCount: 0,
            reportResolutionTime: 0,
        }.toCell(),
    }.toCell();

    val heavyStore = FiWalletStore {
        jettonBalance: ton("100000"),
        goldCoins: 1000,
        id: "user@example.com,{40.7128,-74.0060}",
        txnCount: 255,
        status: 3,
        isAuthorityAccount: true,
        creditNeed: ton("100"),
        accumulatedFees: ton("50"),
        debt: ton("10"),
        debts: true,
        votes: 10,
        receivedVotes: 1000000,
        connections: 10,
        active: true,
        mintable: true,
        version: 1,
        storeVersion: 1,
        timestamps: TimeStamps { accountInit: 1000, lastInvite: 1000, lastClaim: 1000, lastDecay: 1000 }.toCell(),
        addresses: Addresses {
            owner: deployer.address,
            treasury: deployer.address,
            baseFiWalletCode: fossFiWalletCompiledCode(),
            nomInAddrs: NomInAddrs {
                nominee: notDeployer.address,
                invitor: notDeployer.address,
                invitor0: notDeployer.address,
            }.toCell(),
            trustedJettonAddrs: TrustedAddrs {
                minterAddr: minter.address,
                personalJettonMinter: notDeployer.address,
                personalJettonWallet: notDeployer.address,
                authorisedAccs: authMap,
            }.toCell(),
        }.toCell(),
        maps: heavyMaps,
    };
    val storeCell = heavyStore.toCell();
    val (storeCells, storeBits, _) = storeCell.calculateSizeStrict(4096);

    val walletInitStateCell = AutoDeployAddress {
        stateInit: { code: fossFiWalletCompiledCode(), data: storeCell },
        toShard: { fixedPrefixLength: 8, closeTo: deployer.address },
    }.toCell();
    val (initCells, initBits, _) = walletInitStateCell.calculateSizeStrict(4096);

    // ---- outgoing message bodies ----
    val transferBody = AskToTransfer {
        queryId: 1,
        jettonAmount: ton("100"),
        transferRecipient: notDeployer.address,
        sendExcessesTo: deployer.address,
        customPayload: null,
        forwardTonAmount: DEFAULT_FORWARD_TON_AMOUNT,
        forwardPayload: makeRichForwardPayload(),
    }.toCell();
    val (trCells, trBits, _) = transferBody.calculateSizeStrict(4096);

    val internalTransferBody = makeInternalTransferStep(
        1,
        ton("100"),
        deployer.address,
        deployer.address, // sendExcessesTo
        DEFAULT_FORWARD_TON_AMOUNT,
        makeRichForwardPayload(),
        1, // version
    );    val (inTrCells, inTrBits, _) = internalTransferBody.calculateSizeStrict(4096);

    val burnBody = AskToBurn {
        queryId: 1,
        jettonAmount: ton("100"),
        sendExcessesTo: deployer.address,
        customPayload: null,
    }.toCell();
    val (burnCells, burnBits, _) = burnBody.calculateSizeStrict(4096);

    val notifyMinterBody = NotifyMinter {
        queryId: 0,
        jettonAmount: ton("100"),
        burnInitiator: deployer.address,
        sendExcessesTo: deployer.address,
    }.toCell();
    val (nmCells, nmBits, _) = notifyMinterBody.calculateSizeStrict(4096);

    println("=== FEES-MGMT CONSTANT BENCH ===");
    println("STORAGE_SIZE_MAX_WALLET_BITS  := "); println(storeBits); println(" (const="); println(STORAGE_SIZE_MAX_WALLET_BITS); println(")");
    println("STORAGE_SIZE_MAX_WALLET_CELLS  := "); println(storeCells); println(" (const="); println(STORAGE_SIZE_MAX_WALLET_CELLS); println(")");
    println("STORAGE_SIZE_INIT_STATE_BITS   := "); println(initBits); println(" (const="); println(STORAGE_SIZE_INIT_STATE_WALLET_BITS); println(")");
    println("STORAGE_SIZE_INIT_STATE_CELLS  := "); println(initCells); println(" (const="); println(STORAGE_SIZE_INIT_STATE_WALLET_CELLS); println(")");
    println("AskToTransfer BITS             := "); println(trBits); println(" CELLS := "); println(trCells);
    println("InternalTransferStep BITS      := "); println(inTrBits); println(" CELLS := "); println(inTrCells);
    println("AskToBurn BITS                 := "); println(burnBits); println(" CELLS := "); println(burnCells);
    println("NotifyMinter BITS              := "); println(nmBits); println(" CELLS := "); println(nmCells);

    val computedMinStorage = calculateJettonWalletMinStorageFee();
    println("calculateJettonWalletMinStorageFee() := "); println(computedMinStorage);
    println("forwardInitStateOverhead() := "); println(forwardInitStateOverhead());

    // ---- real gas consumption per flow ----
    val senderWallet = mintTo(minter, deployer, deployer.address, ton("5"));
    val dest = notDeployer.address;
    val destWallet = mintTo(minter, deployer, dest, ton("5"));

    val transferRes = senderWallet.sendTransfer(
        deployer.address,
        ton("1"),
        ton("1"),
        dest,
        deployer.address,
        null,
        DEFAULT_FORWARD_TON_AMOUNT,
        makeRichCustomPayload(),
    );
    println("gas AskToTransfer (JETTON_TRANSFER)   := "); println(maxGasOnAccount(transferRes, senderWallet.address));

    println("gas InternalTransferStep (JETTON_RECEIVE) := "); println(maxGasOnAccount(transferRes, destWallet.address));

    val burnRes = senderWallet.sendBurn(deployer.address, ton("1"), ton("1"), deployer.address, null);
    println("gas AskToBurn (BURN_REQUEST)         := "); println(maxGasOnAccount(burnRes, senderWallet.address));
    println("gas NotifyMinter (BURN_NOTIFICATION) := "); println(maxGasOnAccount(burnRes, minter.address));

    expect(true).toEqual(true);
}