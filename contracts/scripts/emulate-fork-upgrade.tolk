import "@acton/build"
import "@acton/io"
import "@acton/emulation/network"
import "@acton/emulation/testing"

import "@wrappers/FossFi.gen"
import "@wrappers/FossFiWallet.gen"
import "@wrappers/utils"
import "@contracts/common/constants"
import "@contracts/common/messages"

fun assertEq(label: string, got: int, want: int) {
    if (got != want) {
        println("FAIL [{}]: expected {} but got {}", label, want, got);
        throw 999;
    }
    println("  ✓ {}: {}", label, got);
}

fun assertTrue(label: string, got: bool) {
    if (!got) {
        println("FAIL [{}]: expected true but got false", label);
        throw 999;
    }
    println("  ✓ {}: true", label);
}

fun assertGt(label: string, got: int, floor: int) {
    if (got <= floor) {
        println("FAIL [{}]: expected > {} but got {}", label, floor, got);
        throw 999;
    }
    println("  ✓ {}: {} > {}", label, got, floor);
}

fun main() {
    val minterAddr = address(FI_ADDRESS);
    val minter = FossFi.fromAddress(minterAddr);

    println("==================================================");
    println("  FossFi Protocol Upgrade Emulation (Fork-Net)    ");
    println("==================================================");
    println("Minter Address: {}", minter.address);

    // ── Pre-upgrade snapshot ──────────────────────────────────────────────────
    println("\n[PRE-UPGRADE] Reading on-chain state...");
    val data = minter.getJettonData();
    println("Total Supply   : {}", data.totalSupply);
    println("Admin Address  : {}", data.adminAddress);

    val admin = data.adminAddress!;
    val fullData = minter.getJettonDataAll();
    println("Minter walletVersion (on-chain): {}", fullData.walletVersion);

    val adminWalletAddr = minter.getWalletAddress(admin);
    val adminWallet = FossFiWallet.fromAddress(adminWalletAddr);
    val initialWalletData = adminWallet.getWalletDataAll();
    println("FiWallet version (on-chain)     : {}", initialWalletData.version);
    println("FiWallet storeVersion (on-chain): {}", initialWalletData.storeVersion);
    println("FiWallet jettonBalance          : {}", initialWalletData.jettonBalance);
    println("FiWallet active                 : {}", initialWalletData.active);

    val newMinterCode = build("FossFi");
    val newWalletCode = build("FossFiWallet");

    println("\nCurrent Time: {}", testing.getNow());

    // ── Step 0: HotUpgrade — bump minter walletVersion if 0 ───────────────────
    var expectedAfterHot = fullData.walletVersion as int;
    if (fullData.walletVersion == 0) {
        expectedAfterHot = 1;
        println("\n[0/5] HotUpgrade: bumping minter walletVersion 0 → 1...");
        val hotUpgradeRes = minter.sendHotUpgrade(
            admin,
            null,
            newMinterCode,
            { value: grams("0.1") },
        );
        hotUpgradeRes.waitForTrace();
        val afterHotUpgrade = minter.getJettonDataAll();
        println("Minter walletVersion after HotUpgrade: {}", afterHotUpgrade.walletVersion);
        assertEq(
            "minter.walletVersion after HotUpgrade",
            afterHotUpgrade.walletVersion as int,
            expectedAfterHot,
        );
        println("✓ HotUpgrade complete.");
    } else {
        println(
            "\n[0/5] Skipping HotUpgrade (minter.walletVersion is already {})",
            fullData.walletVersion,
        );
    }

    // ── Step 1: Propose Minter Code Upgrade ──────────────────────────────────
    println("\n[1/5] Proposing FossFi Minter Upgrade...");
    val proposeMinterRes = minter.sendUpgrade(
        admin,
        false, // minter upgrade
        0,
        admin,
        null,
        newMinterCode,
        { value: grams("0.5") },
    );
    proposeMinterRes.waitForTrace();
    println("✓ Minter upgrade proposal sent.");

    // Advance past approval wait window
    testing.setNow(testing.getNow() + 10);

    // ── Step 2: Approve Minter Code Upgrade ──────────────────────────────────
    println("\n[2/5] Approving FossFi Minter Upgrade...");
    val approveMinterRes = minter.sendApproveUpgrade(admin, { value: grams("0.5") });
    approveMinterRes.waitForTrace();
    println("✓ Minter upgrade approved.");

    // ── Step 3: Propose FiWallet Child Upgrade ────────────────────────────────
    println("\n[3/5] Proposing FossFiWallet Child Upgrade...");
    val proposeWalletRes = minter.sendUpgrade(
        admin,
        true, // wallet upgrade
        0,
        admin,
        null,
        newWalletCode,
        { value: grams("0.5") },
    );
    proposeWalletRes.waitForTrace();
    println("✓ Wallet upgrade proposal sent.");

    testing.setNow(testing.getNow() + 10);

    // ── Step 4: Approve FiWallet Child Upgrade ────────────────────────────────
    println("\n[4/5] Approving FossFiWallet Child Upgrade...");
    val approveWalletRes = minter.sendApproveUpgrade(admin, { value: grams("1.5") });
    approveWalletRes.waitForTrace();
    println("✓ Wallet upgrade approved.");

    // ── Step 5: Post-upgrade transfer smoke test ──────────────────────────────
    println("\n[5/5] Post-upgrade transfer smoke test (1 nanoFI self-transfer)...");
    val transferRes = adminWallet.sendTransfer(
        admin,
        grams("0.2"), // TON value
        1,            // 1 nanoFI
        admin,        // recipient = self
        admin,        // excesses back to admin
        null,         // no custom payload
        0,            // no forward TON
        null,         // no forward payload
    );
    transferRes.waitForTrace();
    println("✓ Post-upgrade transfer executed without error.");

    // ── Post-upgrade deep assertions ──────────────────────────────────────────
    println("\n[ASSERTIONS] Validating post-upgrade state...");

    val expectedFinalVersion = expectedAfterHot + 1;
    val updatedMinterData = minter.getJettonDataAll();
    println("Minter walletVersion (post): {}", updatedMinterData.walletVersion);
    assertEq("minter.walletVersion", updatedMinterData.walletVersion as int, expectedFinalVersion);
    assertEq(
        "minter.totalSupply unchanged",
        updatedMinterData.totalSupply as int,
        fullData.totalSupply as int,
    );

    val updatedBasicWallet = adminWallet.getWalletData();
    val updatedFullWallet = adminWallet.getWalletDataAll();
    println("FiWallet version (post)      : {}", updatedFullWallet.version);
    println("FiWallet storeVersion (post) : {}", updatedFullWallet.storeVersion);
    println("FiWallet jettonBalance (post): {}", updatedFullWallet.jettonBalance);
    println("FiWallet active (post)       : {}", updatedFullWallet.active);

    assertEq("wallet.version", updatedFullWallet.version as int, expectedFinalVersion);
    assertEq("wallet.storeVersion", updatedFullWallet.storeVersion as int, 2);
    assertGt("wallet.jettonBalance", updatedFullWallet.jettonBalance as int, 0);
    assertTrue("wallet.active", updatedFullWallet.active);
    assertTrue(
        "wallet.ownerAddress == admin",
        updatedBasicWallet.ownerAddress == admin,
    );

    // ── Verify invitee wallet (tst1) auto-upgraded via teleg fan-out ──────────
    val updatedMaps = updatedFullWallet.maps.load();
    val inviteeEntry = updatedMaps.invited.findFirst();
    assertTrue("teleg has invited tst1 in maps.invited", inviteeEntry.isFound);
    val tst1FiWalletAddr = inviteeEntry.getKey();
    val tst1Wallet = FossFiWallet.fromAddress(tst1FiWalletAddr);
    val tst1Basic = tst1Wallet.getWalletData();
    val tst1Full = tst1Wallet.getWalletDataAll();
    println("\n[INVITEE TST1] FiWallet Address : {}", tst1FiWalletAddr);
    println("[INVITEE TST1] Owner Address    : {}", tst1Basic.ownerAddress);
    println("[INVITEE TST1] version (post)   : {}", tst1Full.version);
    println("[INVITEE TST1] storeVersion     : {}", tst1Full.storeVersion);
    println("[INVITEE TST1] jettonBalance    : {}", tst1Full.jettonBalance);
    assertEq("tst1.version", tst1Full.version as int, expectedFinalVersion);
    assertEq("tst1.storeVersion", tst1Full.storeVersion as int, 2);
    assertTrue("tst1.active", tst1Full.active);

    // ── Verify PocketMoney grant from teleg to tst1 & spend by tst1 ───────────
    println("\n[POCKET MONEY] Testing SetPocketMoney & SpendPocketMoney between teleg and tst1...");
    val setPmRes = adminWallet.sendSetPocketMoney(
        admin,
        10,
        tst1Basic.ownerAddress,
        false,
        OneTimePocketMoney {
            remaining: grams("5"),
            startTime: 0,
            validUntil: 0,
        },
        null,
        OpenRecurringConfig {
            limit: grams("3"),
            period: ONE_WEEK,
            startTime: 0,
        },
        { value: grams("0.2") },
    );
    setPmRes.waitForTrace();
    val spendableBefore = adminWallet.getPocketMoney(tst1Basic.ownerAddress);
    assertEq(
        "spendable pocketMoney (5 oneTime + 3 openRecurring)",
        spendableBefore as int,
        grams("8") as int,
    );

    val tst1BalBefore = tst1Wallet.getJettonBalance();
    val spendPmRes = adminWallet.sendSpendPocketMoney(
        tst1Basic.ownerAddress,
        11,
        grams("4"),
        tst1Basic.ownerAddress,
        tst1Basic.ownerAddress,
        { value: grams("0.3") },
    );
    spendPmRes.waitForTrace();
    val spendableAfter = adminWallet.getPocketMoney(tst1Basic.ownerAddress);
    assertEq("spendable pocketMoney after spending 4 FI", spendableAfter as int, grams("4") as int);
    assertEq(
        "tst1 balance increased by 4 FI",
        tst1Wallet.getJettonBalance() as int,
        (tst1BalBefore + grams("4")) as int,
    );
    println("✓ PocketMoney grant and waterfall spend between teleg and tst1 verified!");

    val (username, h3Cell, country) = adminWallet.getProfile();
    println("Profile — username: {}, h3: {}, country: {}", username, h3Cell, country);

    println("\n[6/6] Verifying ChangeProfile deploys BaseLocation for h3: {}...", h3Cell);
    val locRes = adminWallet.sendChangeProfile(
        admin,
        1,
        null,
        h3Cell,
        null,
        null,
        { value: grams("1.0") },
    );
    locRes.waitForTrace();
    println("✓ ChangeProfile (BaseLocation deployment) executed without error.");

    println("\n==================================================");
    println("✓ All upgrade steps verified successfully on testnet fork!");
    println("==================================================");
}
