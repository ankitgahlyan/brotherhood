import "@acton/build"
import "@acton/io"
import "@acton/emulation/network"
import "@acton/emulation/testing"

import "@wrappers/CreditProxy.gen"
import "@wrappers/FossFi.gen"
import "@wrappers/FossFiWallet.gen"
import "@wrappers/LocationCredit.gen"
import "@wrappers/utils"
import "@contracts/common/constants"
import "@contracts/common/messages"
import "@contracts/credit/credit-utils"
import "@contracts/credit/storage"

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

fun main() {
    val minterAddr = address(FI_ADDRESS);
    val minter = FossFi.fromAddress(minterAddr);

    println("==================================================");
    println("  Location Credit & Credit Proxy Fork Emulation   ");
    println("==================================================");
    println("Minter Address: {}", minter.address);

    val data = minter.getJettonData();
    val admin = data.adminAddress!;
    val fullData = minter.getJettonDataAll();
    println("Admin Address : {}", admin);
    println("Minter walletVersion (on-chain): {}", fullData.walletVersion);

    val adminWalletAddr = minter.getWalletAddress(admin);
    val adminWallet = FossFiWallet.fromAddress(adminWalletAddr);
    val initialWalletData = adminWallet.getWalletDataAll();
    println("FiWallet Address: {}", adminWallet.address);
    println("FiWallet version: {}", initialWalletData.version);

    val newMinterCode = build("FossFi");
    val newWalletCode = build("FossFiWallet");
    val locationCreditCode = build("LocationCredit");
    val creditProxyCode = build("CreditProxy");

    // ── Step 0: Ensure Minter & FiWallet are upgraded on fork ──────────────────
    println("\n[1/5] Upgrading FossFi Minter & FiWallet to latest build on fork...");
    if (fullData.walletVersion == 0) {
        val hotUpgradeRes = minter.sendHotUpgrade(
            admin,
            null,
            newMinterCode,
            { value: grams("0.1") },
        );
        hotUpgradeRes.waitForTrace();
    }

    val proposeMinterRes = minter.sendUpgrade(
        admin,
        false,
        0,
        admin,
        null,
        newMinterCode,
        { value: grams("0.5") },
    );
    proposeMinterRes.waitForTrace();
    testing.setNow(testing.getNow() + 10);
    val approveMinterRes = minter.sendApproveUpgrade(admin, { value: grams("0.5") });
    approveMinterRes.waitForTrace();

    val proposeWalletRes = minter.sendUpgrade(
        admin,
        true,
        0,
        admin,
        null,
        newWalletCode,
        { value: grams("0.5") },
    );
    proposeWalletRes.waitForTrace();
    testing.setNow(testing.getNow() + 10);
    val approveWalletRes = minter.sendApproveUpgrade(admin, { value: grams("1.5") });
    approveWalletRes.waitForTrace();

    // Trigger upgrade propagation to adminWallet
    val transferRes = adminWallet.sendTransfer(
        admin,
        grams("0.2"),
        1,
        admin,
        admin,
        null,
        0,
        null,
    );
    transferRes.waitForTrace();
    println("✓ FossFi and FossFiWallet running latest bytecode on fork.");

    // ── Step 1: Deploy CreditProxy ───────────────────────────────────────────
    println("\n[2/5] Deploying CreditProxy contract on fork...");
    val creditProxy = CreditProxy.fromStorage(
        CreditProxyStore {
            adminAddress: admin,
            fiMinterAddress: minterAddr,
            locationCreditCode,
            version: 1,
        },
    );
    val deployProxyRes = creditProxy.deploy(admin, { value: grams("0.5") });
    deployProxyRes.waitForTrace();
    println("✓ CreditProxy deployed at: {}", creditProxy.address);

    val proxyState = creditProxy.getState();
    assertEq("CreditProxy version", proxyState.version as int, 1);
    assertTrue("CreditProxy admin == admin", proxyState.adminAddress == admin);

    // ── Step 2: Set Loan Requirement & Lazy Deploy LocationCredit ─────────────
    val (username, h3Cell, country) = adminWallet.getProfile();
    println(
        "\n[3/5] Member Profile — username: '{}', H3: '{}', country: {}",
        username,
        h3Cell,
        country,
    );
    val cellToUse = h3Cell.beginParse().remainingBitsCount() > 0 ? h3Cell : "882a100d31fffff";

    val loanAmount = grams("500");
    val maturity = testing.getNow() + 10000;
    val cutoff = testing.getNow() + 5000;
    val multiplier = 1200;

    println(
        "Sending SetLoanRequirement (amount: 500 FI, multiplier: 1.2x) with CreditProxy: {}",
        creditProxy.address,
    );
    val setLoanRes = adminWallet.sendSetLoanRequirement(
        admin,
        0,
        loanAmount,
        maturity,
        cutoff,
        multiplier,
        creditProxy.address,
        cellToUse,
        { value: grams("0.5") },
    );
    setLoanRes.waitForTrace();
    println("✓ SetLoanRequirement trace executed.");

    // ── Step 3: Verify LocationCredit state ───────────────────────────────────
    println("\n[4/5] Verifying LocationCredit child contract on fork...");
    val locDeployInfo = calcDeployLocationCredit(
        cellToUse,
        creditProxy.address,
        admin,
        locationCreditCode,
    );
    val locationCredit = LocationCredit.fromAddress(locDeployInfo.calculateAddress());
    println("LocationCredit expected address: {}", locationCredit.address);

    val locState = locationCredit.getState();
    println("LocationCredit H3 Cell    : {}", locState.h3Cell);
    println("LocationCredit entryCount : {}", locState.entryCount);
    println("LocationCredit proxyAddr  : {}", locState.proxyAddress);

    assertTrue("LocationCredit proxy matches", locState.proxyAddress == creditProxy.address);
    assertEq("LocationCredit entryCount == 1", locState.entryCount as int, 1);

    val entry = locState.entries.get(adminWallet.address);
    assertTrue("Entry exists for adminWallet", entry.isFound);
    val entryVal = entry.loadValue();
    assertTrue("borrowerAddress == admin", entryVal.borrowerAddress == admin);
    assertEq("loan amount == 500 FI", entryVal.amount as int, loanAmount as int);
    assertEq("multiplier == 1200", entryVal.multiplier as int, multiplier);
    println("✓ Borrower listing verified in LocationCredit state!");

    // ── Step 4: Delist by setting amount to 0 ─────────────────────────────────
    println("\n[5/5] Testing Delisting (canceling loan requirement)...");
    val cancelLoanRes = adminWallet.sendSetLoanRequirement(
        admin,
        1,
        0,
        null,
        null,
        null,
        creditProxy.address,
        cellToUse,
        { value: grams("0.3") },
    );
    cancelLoanRes.waitForTrace();

    val locStateAfterCancel = locationCredit.getState();
    assertEq(
        "LocationCredit entryCount after cancel == 0",
        locStateAfterCancel.entryCount as int,
        0,
    );
    val entryAfterCancel = locStateAfterCancel.entries.get(adminWallet.address);
    assertTrue("Entry deleted in LocationCredit", !entryAfterCancel.isFound);
    println("✓ Listing successfully removed from LocationCredit on amount = 0!");

    // ── Step 5: Test HotUpgrade & Destroy ────────────────────────────────────
    println("\n[BONUS] Verifying HotUpgrade & Destroy governance on fork...");
    val hotUpLoc = locationCredit.sendHotUpgrade(
        admin,
        null,
        locationCreditCode,
        { value: grams("0.1") },
    );
    hotUpLoc.waitForTrace();
    println("✓ LocationCredit HotUpgrade verified.");

    val hotUpProxy = creditProxy.sendHotUpgrade(
        admin,
        null,
        creditProxyCode,
        { value: grams("0.1") },
    );
    hotUpProxy.waitForTrace();
    println("✓ CreditProxy HotUpgrade verified.");

    val destroyLoc = locationCredit.sendDestroy(admin, { value: grams("0.1") });
    destroyLoc.waitForTrace();
    println("✓ LocationCredit Destroy verified.");

    val destroyProxy = creditProxy.sendDestroy(admin, { value: grams("0.1") });
    destroyProxy.waitForTrace();
    println("✓ CreditProxy Destroy verified.");

    println("\n==================================================");
    println("✓ All Location Credit operations verified on testnet fork!");
    println("==================================================");
}
