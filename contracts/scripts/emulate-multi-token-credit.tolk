import "@acton/build"
import "@acton/io"
import "@acton/emulation/network"
import "@acton/emulation/testing"

import "@wrappers/FossFi.gen"
import "@wrappers/FossFiWallet.gen"
import "@wrappers/PersonalMinter.gen"
import "@wrappers/PersonalWallet.gen"

import "@contracts/common/constants"
import "@contracts/common/messages"
import "@contracts/fossFi/storage"
import "@contracts/personalMinter/base-personal-minter-code"
import "@contracts/personalMinter/storage"

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

fun deployPersonalToken(
    owner: address,
    issuerFiWallet: address,
): address {
    val baseStore: BasePersonalMinterStore = {
        fiJettonAddress: issuerFiWallet,
        adminAddress: owner,
        version: 0,
    };
    val stateInit = ContractState {
        code: getBasePersonalMinterCode(),
        data: baseStore.toCell(),
    };
    val toShard: AddressShardingOptions = { fixedPrefixLength: 8, closeTo: owner };
    val pmAddress = AutoDeployAddress {
        workchain: BASECHAIN,
        stateInit,
        toShard,
    }.calculateAddress();

    val internalMsg: InternalTransferStep = {
        queryId: 0,
        jettonAmount: grams("1000"),
        version: 0,
        transferredAsCredit: false,
        transferInitiator: owner,
        sendExcessesTo: owner,
        forwardTonAmount: grams("0.02"),
        latestWalletCode: build("PersonalWallet"),
        forwardPayload: beginCell().storeUint(0, 1).toSlice(),
    };

    val deployMsg = createMessage({
        bounce: false,
        value: grams("1.5"),
        dest: {
            workchain: BASECHAIN,
            stateInit,
            toShard,
        },
        body: MintNewJettons {
            queryId: 0,
            mintRecipient: owner,
            tonAmount: grams("0.7"),
            internalTransferMsg: internalMsg.toCell(),
        },
    });
    val deployRes = net.send(owner, deployMsg);
    deployRes.waitForTrace();

    val personalWalletAddress = PersonalMinter.fromAddress(pmAddress).getWalletAddress(owner);
    val pointRes = FossFiWallet
        .fromAddress(issuerFiWallet)
        .sendActSetPersonalJetton(
            owner,
            pmAddress,
            personalWalletAddress,
            { value: grams("0.6") },
        );
    pointRes.waitForTrace();

    return pmAddress;
}

fun main() {
    println("==================================================");
    println(" Multi-Token Credit Purchase & Payback Emulation  ");
    println("==================================================");

    val minterAddr = address(FI_ADDRESS);
    val minter = FossFi.fromAddress(minterAddr);
    val fullData = minter.getJettonDataAll();
    val admin = fullData.adminAddress;

    val adminWalletAddr = minter.getWalletAddress(admin);
    val adminWallet = FossFiWallet.fromAddress(adminWalletAddr);

    val _newMinterCode = build("FossFi");
    val newWalletCode = build("FossFiWallet");

    // Upgrade protocol to ensure latest FossFiWallet code is active
    val proposeWalletRes = minter.sendUpgrade(
        admin,
        true, // wallet upgrade
        9,
        admin,
        null,
        newWalletCode,
        { value: grams("0.5") },
    );
    proposeWalletRes.waitForTrace();

    testing.setNow(testing.getNow() + 10);
    val approveWalletRes = minter.sendApproveUpgrade(admin, { value: grams("1.5") });
    val tApprove = approveWalletRes.waitForTrace();
    println("approveWalletTrace: {}", tApprove);
    println("✓ FossFiWallet child code upgraded.");

    // Verify FossFiWallet credit cutoff on upgraded FiWallet
    val testFiCutoff = testing.getNow() + 3600;
    val testFiMaturity = testing.getNow() + 7200;
    val setFiLoanRes = adminWallet.sendSetLoanRequirement(
        admin,
        999,
        grams("100"),
        testFiMaturity,
        testFiCutoff,
        1000,
        null,
        null,
        { value: grams("0.2") },
    );
    setFiLoanRes.waitForTrace();
    val fiCutoffAfter = adminWallet.getCreditCutoff();
    assertEq("FiWallet creditCutoff stored in timestamps", fiCutoffAfter as int, testFiCutoff);
    println("✓ FossFiWallet in-place migration to storeVersion 3 and creditCutoff in TimeStamps verified.");

    // Retrieve tst1 from teleg's invite map
    val adminWalletData = adminWallet.getWalletDataAll();
    val updatedMaps = adminWalletData.maps.load();
    val inviteeEntry = updatedMaps.invited.findFirst();
    assertTrue("teleg has invited tst1 in maps.invited", inviteeEntry.isFound);
    val tst1FiWalletAddr = inviteeEntry.getKey();
    val tst1Wallet = FossFiWallet.fromAddress(tst1FiWalletAddr);
    val tst1Owner = tst1Wallet.getWalletData().ownerAddress;

    // tst2 address from testnet registry
    val tst2Owner = address("0:d697e62a36c552db7089b1d86430eabc76d53c5309bad217ccfcbaf08fc2b827");
    val tst2FiWalletAddr = minter.getWalletAddress(tst2Owner);
    val tst2Wallet = FossFiWallet.fromAddress(tst2FiWalletAddr);

    println("Admin (teleg): {}", admin);
    println("Member (tst1): {}", tst1Owner);
    println("Member (tst2): {}", tst2Owner);

    // If tst2 is not yet an active member on testnet fork, teleg invites tst2
    val tst2Full = tst2Wallet.getWalletDataAll();
    if (!tst2Full.active) {
        println("Inviting tst2 into brotherhood...");
        val inviteRes = adminWallet.sendInternalInvite(
            admin,
            1,
            adminWalletData.version,
            admin,
            admin,
            newWalletCode,
            null,
            "tst2_user",
            "893d1250e6bffff",
            356,
            { value: grams("1.2") },
        );
        inviteRes.waitForTrace();
        println("✓ tst2 invited successfully.");
    } else {
        println("✓ tst2 is already an active member.");
    }

    // ── STEP 1: Deploy Personal Tokens for teleg and tst1 ─────────────────────
    println("\n[1/5] Deploying Personal Tokens for teleg and tst1...");
    val telegPersonalMinterAddr = deployPersonalToken(admin, adminWalletAddr);
    println("✓ teleg Personal Minter deployed at: {}", telegPersonalMinterAddr);

    val tst1PersonalMinterAddr = deployPersonalToken(tst1Owner, tst1FiWalletAddr);
    println("✓ tst1 Personal Minter deployed at: {}", tst1PersonalMinterAddr);

    val telegPm = PersonalMinter.fromAddress(telegPersonalMinterAddr);
    val tst1Pm = PersonalMinter.fromAddress(tst1PersonalMinterAddr);

    // Upgrade personal minters and child wallet code to ensure latest bytecode is active
    val newPmCode = build("PersonalMinter");
    val newPwCode = build("PersonalWallet");
    val u1 = telegPm
        .sendUpgrade(
            admin,
            false,
            0,
            admin,
            null,
            newPmCode,
            { value: grams("0.5") },
        )
        .waitForTrace();
    println("upgrade telegPM code trace: {}", u1);
    val u2 = telegPm
        .sendUpgrade(
            admin,
            true,
            0,
            admin,
            null,
            newPwCode,
            { value: grams("0.5") },
        )
        .waitForTrace();
    println("upgrade telegPM wallet trace: {}", u2);
    val u3 = tst1Pm
        .sendUpgrade(
            tst1Owner,
            false,
            0,
            tst1Owner,
            null,
            newPmCode,
            { value: grams("0.5") },
        )
        .waitForTrace();
    println("upgrade tst1PM code trace: {}", u3);
    val u4 = tst1Pm
        .sendUpgrade(
            tst1Owner,
            true,
            0,
            tst1Owner,
            null,
            newPwCode,
            { value: grams("0.5") },
        )
        .waitForTrace();
    println("upgrade tst1PM wallet trace: {}", u4);
    println("✓ Personal minters and child wallet bytecode upgraded.");

    // Ensure owner personal wallets are onboarded and funded under latest bytecode
    val mintToAdminMsg: InternalTransferStep = {
        queryId: 1,
        jettonAmount: grams("1000"),
        version: 0,
        transferredAsCredit: false,
        transferInitiator: admin,
        sendExcessesTo: admin,
        forwardTonAmount: grams("0.02"),
        latestWalletCode: newPwCode,
        forwardPayload: beginCell().storeUint(0, 1).toSlice(),
    };
    val tMintAdmin = telegPm
        .sendMintNewJettons(
            admin,
            1,
            admin,
            grams("0.7"),
            mintToAdminMsg,
            null,
            null,
            { value: grams("1.5") },
        )
        .waitForTrace();
    println("mintToAdminTrace: {}", tMintAdmin);

    val mintToTst1Msg: InternalTransferStep = {
        queryId: 1,
        jettonAmount: grams("1000"),
        version: 0,
        transferredAsCredit: false,
        transferInitiator: tst1Owner,
        sendExcessesTo: tst1Owner,
        forwardTonAmount: grams("0.02"),
        latestWalletCode: newPwCode,
        forwardPayload: beginCell().storeUint(0, 1).toSlice(),
    };
    val tMintTst1 = tst1Pm
        .sendMintNewJettons(
            tst1Owner,
            1,
            tst1Owner,
            grams("0.7"),
            mintToTst1Msg,
            null,
            null,
            { value: grams("1.5") },
        )
        .waitForTrace();
    println("mintToTst1Trace: {}", tMintTst1);

    // Wallet addresses
    val telegWalletOfTelegToken = PersonalWallet.fromAddress(telegPm.getWalletAddress(admin));
    val tst1WalletOfTelegToken = PersonalWallet.fromAddress(telegPm.getWalletAddress(tst1Owner));
    val _tst2WalletOfTelegToken = PersonalWallet.fromAddress(telegPm.getWalletAddress(tst2Owner));

    val telegWalletOfTst1Token = PersonalWallet.fromAddress(tst1Pm.getWalletAddress(admin));
    val tst1WalletOfTst1Token = PersonalWallet.fromAddress(tst1Pm.getWalletAddress(tst1Owner));

    adminWallet
        .sendActSetPersonalJetton(
            admin,
            telegPersonalMinterAddr,
            telegWalletOfTelegToken.address,
            { value: grams("0.6") },
        )
        .waitForTrace();

    tst1Wallet
        .sendActSetPersonalJetton(
            tst1Owner,
            tst1PersonalMinterAddr,
            tst1WalletOfTst1Token.address,
            { value: grams("0.6") },
        )
        .waitForTrace();

    println("Onboarding tst1's wallet of teleg's token...");
    val onboardRes = telegWalletOfTelegToken.sendAskToTransfer(
        admin,
        1,
        grams("1"),
        tst1Owner,
        admin,
        null,
        0,
        PayloadInline { value: createEmptySlice() },
        { value: grams("0.5") },
    );
    val tOnboard = onboardRes.waitForTrace();
    println("onboardTrace: {}", tOnboard);
    println("tst1WalletOfTelegToken addr: {}", tst1WalletOfTelegToken.address);
    println("✓ tst1's wallet of teleg's token onboarded on-chain.");

    // ── STEP 2: Configure Loan Requirement on Personal Wallet ─────────────────
    println("\n[2/5] Configuring Loan Requirement on tst1's wallet of teleg's token...");
    val now = testing.getNow();
    val cutoff = now + 3600;   // 1 hour
    val maturity = now + 7200; // 2 hours

    val setLoanRes = tst1WalletOfTelegToken.sendSetLoanRequirement(
        tst1Owner,
        100,
        grams("50"), // creditNeed: 50 tokens
        maturity,
        cutoff,
        1000,        // 1.000x multiplier
        null,
        null,
        { value: grams("0.2") },
    );
    setLoanRes.waitForTrace();

    val creditInfo1 = tst1WalletOfTelegToken.getPersonalCreditInfo();
    assertEq("creditNeed configured", creditInfo1.creditNeed as int, grams("50") as int);
    assertEq("creditCutoff configured", creditInfo1.creditCutoff as int, cutoff);
    assertEq("creditMaturity configured", creditInfo1.creditMaturity as int, maturity);
    assertEq("multiplier configured", creditInfo1.multiplier as int, 1000);
    println("✓ Loan requirement successfully stored on PersonalWallet.");

    // ── STEP 3: BuyCredit using Personal Tokens ───────────────────────────────
    println("\n[3/5] teleg purchases 20 tokens of credit from tst1 via BuyCredit...");
    val _telegPersonalBalBefore = telegWalletOfTelegToken.getWalletData().jettonBalance;
    val tst1PersonalBalBefore = tst1WalletOfTelegToken.getWalletData().jettonBalance;
    val telegTst1BalBefore: coins = 0;

    val buyCreditRes = telegWalletOfTelegToken.sendBuyCredit(
        admin,
        101,
        grams("20"),
        tst1Owner,
        admin,
        null,
        null,
        { value: grams("1.5") },
    );
    val tBuy = buyCreditRes.waitForTrace();
    println("buyCreditTrace: {}", tBuy);

    val tst1CreditAfter = tst1WalletOfTelegToken.getPersonalCreditInfo();
    assertEq("creditNeed reduced by 20", tst1CreditAfter.creditNeed as int, grams("30") as int);
    assertEq(
        "totalCreditReceived recorded",
        tst1CreditAfter.totalCreditReceived as int,
        grams("20") as int,
    );

    val tst1BalAfter = tst1WalletOfTelegToken.getWalletData().jettonBalance;
    assertEq(
        "tst1 received 20 lent tokens",
        (tst1BalAfter - tst1PersonalBalBefore) as int,
        grams("20") as int,
    );

    val telegTst1BalAfter = telegWalletOfTst1Token.getWalletData().jettonBalance;
    assertEq(
        "teleg received 20 minted personal tokens of tst1",
        (telegTst1BalAfter - telegTst1BalBefore) as int,
        grams("20") as int,
    );
    println("✓ Credit purchase executed and borrower's personal tokens minted to lender!");

    // ── STEP 4: Test Credit Cutoff Rejection ───────────────────────────────────
    println("\n[4/5] Testing Credit Cutoff enforcement...");
    testing.setNow(cutoff + 10); // advance past cutoff
    val lateCreditRes = telegWalletOfTelegToken.sendBuyCredit(
        admin,
        102,
        grams("5"),
        tst1Owner,
        admin,
        null,
        null,
        { value: grams("1.5") },
    );
    val _lateTrace = lateCreditRes.waitForTrace();
    // Verify transaction failed at recipient due to CreditNeedExceeded (760)
    val lateCreditInfo = tst1WalletOfTelegToken.getPersonalCreditInfo();
    assertEq(
        "creditNeed unchanged after expired BuyCredit",
        lateCreditInfo.creditNeed as int,
        grams("30") as int,
    );
    println("✓ BuyCredit rejected past credit cutoff!");

    // ── STEP 5: Multi-Token Payback & Shortfall Handling ──────────────────────
    println("\n[5/5] Testing Multi-Token Payback and Partial Payback Shortfall...");
    testing.setNow(maturity + 10); // advance past maturity

    // teleg redeems 20 personal tokens of tst1 for teleg's tokens
    // But tst1 holds 21 teleg tokens (1 from onboarding + 20 from credit).
    // Let's make tst1 transfer 13 tokens away to admin so tst1 only has 8 tokens left
    // to simulate a partial payback liquidity shortfall!
    println("Simulating liquidity shortfall: tst1 transfers 13 tokens to admin...");
    val tst1TransferRes = tst1WalletOfTelegToken.sendAskToTransfer(
        tst1Owner,
        103,
        grams("13"),
        admin,
        tst1Owner,
        null,
        0,
        PayloadInline { value: createEmptySlice() },
        { value: grams("0.6") },
    );
    val tShortfallTransfer = tst1TransferRes.waitForTrace();
    println("shortfallTransferTrace: {}", tShortfallTransfer);
    val tst1BalBeforePayback = tst1WalletOfTelegToken.getWalletData().jettonBalance;
    assertEq(
        "tst1 remaining balance before payback is 8",
        tst1BalBeforePayback as int,
        grams("8") as int,
    );

    // teleg burns 20 tst1 tokens with customPayload pointing to tst1's teleg wallet
    val customPayload = beginCell().storeAddress(tst1WalletOfTelegToken.address).endCell();

    println("teleg requests Payback of 20 tokens (available = 8, shortfall = 12)...");
    val telegTelegBalBeforePayback = telegWalletOfTelegToken.getWalletData().jettonBalance;
    val paybackRes = telegWalletOfTst1Token.sendAskToBurn(
        admin,
        104,
        grams("20"),
        admin,
        customPayload,
        { value: grams("1.5") },
    );
    val tPayback = paybackRes.waitForTrace();
    println("paybackTrace: {}", tPayback);

    val tst1CreditPostPayback = tst1WalletOfTelegToken.getPersonalCreditInfo();
    assertEq(
        "totalPaybackSettled is 8",
        tst1CreditPostPayback.totalPaybackSettled as int,
        grams("8") as int,
    );
    assertEq(
        "totalPaybackShortfall is 12",
        tst1CreditPostPayback.totalPaybackShortfall as int,
        grams("12") as int,
    );

    val telegTelegBalAfterPayback = telegWalletOfTelegToken.getWalletData().jettonBalance;
    assertEq(
        "teleg received 8 repaid tokens",
        (telegTelegBalAfterPayback - telegTelegBalBeforePayback) as int,
        grams("8") as int,
    );

    val telegTst1BalFinal = telegWalletOfTst1Token.getWalletData().jettonBalance;
    assertEq(
        "teleg received 12 re-minted personal tokens for the shortfall",
        telegTst1BalFinal as int,
        grams("12") as int,
    );
    println("✓ Partial payback settled 8 tokens, recorded 12 shortfall, and re-minted 12 tokens to lender!");

    println("\n==================================================");
    println("✓ ALL MULTI-TOKEN CREDIT & PAYBACK FLOWS VERIFIED! ");
    println("==================================================");
}
