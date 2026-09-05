import "@acton/io"
import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@acton/testing/expect"
import "@acton/types/big_array"
import "@acton/types/transaction"

import "@gen/PersonalWallet.code"
import "@wrappers/Personal.gen"
import "@wrappers/PersonalWallet.gen"
import "@wrappers/utils"

import "@contracts/common/internal-transfer"
import "@contracts/common/messages"
import "@contracts/personalMinter/fees-management"
import "@contracts/personalMinter/storage"

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

get fun `test bench: measure Personal storage, init-state, and message sizes`() {
    val deployer = testing.treasury("deployer");
    val recipient = testing.treasury("recipient");
    val minter = testing.treasury("personal-minter");

    // ---- 1. PersonalWalletStore storage upper bound ----
    val walletStore = PersonalWalletStore {
        jettonBalance: ton("1000000"),
        owner: recipient.address,
        deployer: deployer.address,
        minterAddress: minter.address,
    };
    val walletStoreCell = walletStore.toCell();
    val (storeCells, storeBits, _) = walletStoreCell.calculateSizeStrict(4096);

    // ---- 2. PersonalWallet stateInit size ----
    val walletInitStateCell = AutoDeployAddress {
        stateInit: { code: personalWalletCompiledCodeLibraryRef(), data: walletStoreCell },
        toShard: { fixedPrefixLength: 8, closeTo: recipient.address },
    }.toCell();
    val (initCells, initBits, _) = walletInitStateCell.calculateSizeStrict(4096);

    // ---- 3. PersonalStore storage bound ----
    val personalMinterStore = PersonalStore {
        totalSupply: ton("1000000"),
        fiJettonAddress: deployer.address,
        adminAddress: deployer.address,
        metadataUri: null,
    };
    val minterStoreCell = personalMinterStore.toCell();
    val (minterCells, minterBits, _) = minterStoreCell.calculateSizeStrict(4096);

    // ---- 4. Outgoing message bodies ----
    val transferBody = AskToTransfer {
        queryId: 1,
        jettonAmount: ton("100"),
        transferRecipient: recipient.address,
        sendExcessesTo: deployer.address,
        customPayload: null,
        forwardTonAmount: DEFAULT_FORWARD_TON_AMOUNT,
        forwardPayload: makeRichForwardPayload(),
    }.toCell();
    val (trCells, trBits, _) = transferBody.calculateSizeStrict(4096);

    val inTransferBody = makeInternalTransferStep(
        1,
        ton("100"),
        deployer.address,
        deployer.address,
        DEFAULT_FORWARD_TON_AMOUNT,
        makeRichForwardPayload(),
    );
    val (inTrCells, inTrBits, _) = inTransferBody.calculateSizeStrict(4096);

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

    println("=== PERSONAL FEES-MGMT CONSTANT BENCH ===");
    println("PERSONAL_WALLET_BITS          := ");
    println(storeBits);
    println(" (const=");
    println(STORAGE_SIZE_MAX_PERSONAL_WALLET_BITS);
    println(")");
    println("PERSONAL_WALLET_CELLS         := ");
    println(storeCells);
    println(" (const=");
    println(STORAGE_SIZE_MAX_PERSONAL_WALLET_CELLS);
    println(")");
    println("PERSONAL_INIT_STATE_BITS      := ");
    println(initBits);
    println(" (const=");
    println(STORAGE_SIZE_INIT_STATE_PERSONAL_WALLET_BITS);
    println(")");
    println("PERSONAL_INIT_STATE_CELLS     := ");
    println(initCells);
    println(" (const=");
    println(STORAGE_SIZE_INIT_STATE_PERSONAL_WALLET_CELLS);
    println(")");
    println("PERSONAL_MINTER_BITS          := ");
    println(minterBits);
    println(" (const=");
    println(STORAGE_SIZE_MAX_PERSONAL_MINTER_BITS);
    println(")");
    println("PERSONAL_MINTER_CELLS         := ");
    println(minterCells);
    println(" (const=");
    println(STORAGE_SIZE_MAX_PERSONAL_MINTER_CELLS);
    println(")");
    println("Personal AskToTransfer BITS   := ");
    println(trBits);
    println(" CELLS := ");
    println(trCells);
    println("Personal InternalTransferStep BITS := ");
    println(inTrBits);
    println(" CELLS := ");
    println(inTrCells);
    println("Personal AskToBurn BITS       := ");
    println(burnBits);
    println(" CELLS := ");
    println(burnCells);
    println("Personal NotifyMinter BITS    := ");
    println(nmBits);
    println(" CELLS := ");
    println(nmCells);

    val computedMinStorage = calculatePersonalWalletMinStorageFee();
    println("calculatePersonalWalletMinStorageFee() := ");
    println(computedMinStorage);
    println("forwardInitStatePersonalWalletOverhead() := ");
    println(forwardInitStatePersonalWalletOverhead());

    // ---- 5. Real gas consumption per flow in PersonalToken ----
    val pm = Personal.fromStorage(personalMinterStore);
    pm.deploy(deployer.address, { value: ton("1") });

    // Mint to deployer and to recipient
    pm.sendMint(deployer.address, deployer.address, ton("50"), ton("0.02"), ton("0.7"));
    pm.sendMint(deployer.address, recipient.address, ton("50"), ton("0.02"), ton("0.7"));

    val senderWalletAddr = pm.getWalletAddress(deployer.address);
    val destWalletAddr = pm.getWalletAddress(recipient.address);
    val senderWallet = PersonalWallet.fromAddress(senderWalletAddr);

    // Measure transfer gas
    val transferRes = senderWallet.sendAskToTransfer(
        deployer.address,
        0,
        ton("10"),
        recipient.address,
        deployer.address,
        null,
        ton("0.01"),
        PayloadInline { value: createEmptySlice() },
        { value: ton("0.7") },
    );
    println("gas Personal AskToTransfer (JETTON_TRANSFER)   := ");
    println(maxGasOnAccount(transferRes, senderWalletAddr));

    println("gas Personal InternalTransferStep (JETTON_RECEIVE) := ");
    println(maxGasOnAccount(transferRes, destWalletAddr));

    // Measure burn gas
    val burnRes = senderWallet.sendAskToBurn(
        deployer.address,
        0,
        ton("5"),
        deployer.address,
        null,
        { value: ton("0.7") },
    );
    println("gas Personal AskToBurn (BURN_REQUEST)         := ");
    println(maxGasOnAccount(burnRes, senderWalletAddr));
    println("gas Personal NotifyMinter (BURN_NOTIFICATION) := ");
    println(maxGasOnAccount(burnRes, pm.address));

    expect(true).toEqual(true);
}
