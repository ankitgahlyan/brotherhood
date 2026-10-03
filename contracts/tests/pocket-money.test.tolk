import "@acton/build"
import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@acton/testing/expect"

import "@wrappers/FossFiWallet.gen"
import "@wrappers/utils"
import "@contracts/common/constants"
import "@contracts/common/errors"
import "@contracts/common/messages"
import "@contracts/fossFi/storage"

import "test-utils"

fun pocketMoneyEntryOf(wallet: FossFiWallet, grantee: address): (bool, coins) {
    val entry = wallet.getWalletDataAll().maps.load().pocketMoney.get(grantee);
    if (!entry.isFound) {
        return (false, 0);
    }
    return (true, wallet.getPocketMoney(grantee));
}

fun sendSetOpenPocketMoney(
    wallet: FossFiWallet,
    from: address,
    grantee: address,
    amount: coins,
    period: uint32 = 0,
    startTime: uint32 = 0,
    queryId: uint64 = 1,
): SendResultList {
    return wallet.sendSetPocketMoney(
        from,
        queryId,
        grantee,
        null,
        null,
        null,
        OpenRecurringConfig {
            limit: amount,
            period,
            startTime,
        },
        { value: grams("0.3") },
    );
}

fun sendSpend(
    wallet: FossFiWallet,
    from: address,
    amount: coins,
    receiver: address,
    sendExcessesTo: address,
    queryId: uint64 = 1,
): SendResultList {
    return wallet.sendSpendPocketMoney(
        from,
        queryId,
        amount,
        receiver,
        sendExcessesTo,
        { value: grams("0.3") },
    );
}

get fun `test pocketMoney: only the owner can grant pocket money`() {
    val (minter, deployer, notDeployer) = setupTest();
    val wallet = userWallet(minter, deployer.address);

    val res = sendSetOpenPocketMoney(wallet, notDeployer.address, notDeployer.address, grams("5"));
    expect(res).toHaveFailedTx<SetPocketMoney>({
        from: notDeployer.address,
        to: wallet.address,
        exitCode: Errors.NotOwner,
    });
    expect(pocketMoneyEntryOf(wallet, notDeployer.address)).toEqual((false, 0));
}

get fun `test pocketMoney: open limit grant, overwrite, and revoke with zero`() {
    val (minter, deployer, notDeployer) = setupTest();
    val wallet = userWallet(minter, deployer.address);

    val res = sendSetOpenPocketMoney(wallet, deployer.address, notDeployer.address, grams("10"));
    expect(res).toHaveSuccessfulTx<SetPocketMoney>({
        from: deployer.address,
        to: wallet.address,
    });
    expect(pocketMoneyEntryOf(wallet, notDeployer.address)).toEqual((true, grams("10")));

    // Overwrite open limit freely
    sendSetOpenPocketMoney(wallet, deployer.address, notDeployer.address, grams("25"));
    expect(pocketMoneyEntryOf(wallet, notDeployer.address)).toEqual((true, grams("25")));

    // Revoke open limit with amount = 0
    val revokeRes = sendSetOpenPocketMoney(wallet, deployer.address, notDeployer.address, 0);
    expect(revokeRes).toHaveSuccessfulTx<SetPocketMoney>({
        from: deployer.address,
        to: wallet.address,
    });
    expect(pocketMoneyEntryOf(wallet, notDeployer.address)).toEqual((false, 0));
}

get fun `test pocketMoney: one-time cheque is irrevocable while active but allows upward upgrade and post-dated startTime`() {
    val (minter, deployer, notDeployer) = setupTest();
    testing.setNow(1_800_000_000);
    val grantor = mintTo(minter, deployer, deployer.address, grams("100"));
    activateUser(minter, grantor, deployer, notDeployer.address);

    val futureStart: uint32 = 1_800_001_000;
    val expiry: uint32 = 1_800_010_000;

    // Set post-dated one-time cheque
    val setRes = grantor.sendSetPocketMoney(
        deployer.address,
        1,
        notDeployer.address,
        null,
        OneTimePocketMoney {
            remaining: grams("10"),
            startTime: futureStart,
            validUntil: expiry,
        },
        null,
        null,
        { value: grams("0.3") },
    );
    expect(setRes).toHaveSuccessfulTx<SetPocketMoney>({
        from: deployer.address,
        to: grantor.address,
    });

    // Before startTime, spendable is 0 and SpendPocketMoney fails
    expect(grantor.getPocketMoney(notDeployer.address)).toEqual(0);
    val earlySpend = sendSpend(
        grantor,
        notDeployer.address,
        grams("1"),
        notDeployer.address,
        notDeployer.address,
    );
    expect(earlySpend).toHaveFailedTx<SpendPocketMoney>({
        from: notDeployer.address,
        to: grantor.address,
        exitCode: Errors.InsufficientBalance,
    });

    // Attempting to revoke or reduce one-time cheque fails with PocketMoneyLocked
    val downgradeRes = grantor.sendSetPocketMoney(
        deployer.address,
        2,
        notDeployer.address,
        null,
        OneTimePocketMoney {
            remaining: grams("5"),
            startTime: futureStart,
            validUntil: expiry,
        },
        null,
        null,
        { value: grams("0.3") },
    );
    expect(downgradeRes).toHaveFailedTx<SetPocketMoney>({
        from: deployer.address,
        to: grantor.address,
        exitCode: Errors.PocketMoneyLocked,
    });

    // Upward upgrade: increase remaining to 15 FI, move startTime earlier to now, extend validUntil
    val upgradeRes = grantor.sendSetPocketMoney(
        deployer.address,
        3,
        notDeployer.address,
        null,
        OneTimePocketMoney {
            remaining: grams("15"),
            startTime: 1_800_000_000,
            validUntil: expiry + 5000,
        },
        null,
        null,
        { value: grams("0.3") },
    );
    expect(upgradeRes).toHaveSuccessfulTx<SetPocketMoney>({
        from: deployer.address,
        to: grantor.address,
    });
    expect(grantor.getPocketMoney(notDeployer.address)).toEqual(grams("15"));

    // Spend 15 FI completely clears the one-time slot
    val fullSpend = sendSpend(
        grantor,
        notDeployer.address,
        grams("15"),
        notDeployer.address,
        notDeployer.address,
    );
    expect(fullSpend).toHaveSuccessfulTx<SpendPocketMoney>({
        from: notDeployer.address,
        to: grantor.address,
    });
    expect(pocketMoneyEntryOf(grantor, notDeployer.address)).toEqual((false, 0));
}

get fun `test pocketMoney: fixedRecurring resets each period, blocks revocation before validUntil, and allows upward upgrade`() {
    val start: uint32 = 1_800_000_000;
    val (minter, deployer, notDeployer) = setupTest();
    testing.setNow(start);
    val grantor = mintTo(minter, deployer, deployer.address, grams("100"));
    activateUser(minter, grantor, deployer, notDeployer.address);

    val validUntil: uint32 = start + 3 * ONE_WEEK;

    // Set weekly fixedRecurring of 10 FI for 3 weeks
    val setRes = grantor.sendSetPocketMoney(
        deployer.address,
        1,
        notDeployer.address,
        null,
        null,
        FixedRecurringConfig {
            limit: grams("10"),
            period: ONE_WEEK,
            startTime: start,
            validUntil,
        },
        null,
        { value: grams("0.3") },
    );
    expect(setRes).toHaveSuccessfulTx<SetPocketMoney>({
        from: deployer.address,
        to: grantor.address,
    });
    expect(grantor.getPocketMoney(notDeployer.address)).toEqual(grams("10"));

    // Grantee spends full 10 FI in week 1; entry remains for next cycle
    val spendWeek1 = sendSpend(
        grantor,
        notDeployer.address,
        grams("10"),
        notDeployer.address,
        notDeployer.address,
    );
    expect(spendWeek1).toHaveSuccessfulTx<SpendPocketMoney>({
        from: notDeployer.address,
        to: grantor.address,
    });
    expect(grantor.getPocketMoney(notDeployer.address)).toEqual(0);

    // Owner cannot revoke fixedRecurring before validUntil
    val revokeAttempt = grantor.sendSetPocketMoney(
        deployer.address,
        2,
        notDeployer.address,
        null,
        null,
        FixedRecurringConfig {
            limit: 0,
            period: ONE_WEEK,
            startTime: start,
            validUntil,
        },
        null,
        { value: grams("0.3") },
    );
    expect(revokeAttempt).toHaveFailedTx<SetPocketMoney>({
        from: deployer.address,
        to: grantor.address,
        exitCode: Errors.PocketMoneyLocked,
    });

    // Advance 1 week: cycle resets automatically back to 10 FI
    testing.setNow(start + ONE_WEEK + 10);
    expect(grantor.getPocketMoney(notDeployer.address)).toEqual(grams("10"));

    // Upward upgrade in week 2: increase limit to 20 FI
    val upwardRes = grantor.sendSetPocketMoney(
        deployer.address,
        3,
        notDeployer.address,
        null,
        null,
        FixedRecurringConfig {
            limit: grams("20"),
            period: ONE_WEEK,
            startTime: 0,
            validUntil: validUntil + ONE_WEEK,
        },
        null,
        { value: grams("0.3") },
    );
    expect(upwardRes).toHaveSuccessfulTx<SetPocketMoney>({
        from: deployer.address,
        to: grantor.address,
    });
    expect(grantor.getPocketMoney(notDeployer.address)).toEqual(grams("20"));
}

get fun `test pocketMoney: concurrent 3-slot waterfall spends openRecurring -> fixedRecurring -> oneTime and supports unrestricted access`() {
    val start: uint32 = 1_800_000_000;
    val (minter, deployer, notDeployer) = setupTest();
    testing.setNow(start);
    val grantor = mintTo(minter, deployer, deployer.address, grams("100"));
    activateUser(minter, grantor, deployer, notDeployer.address);

    // Configure all 3 slots in one transaction:
    // openRecurring = 4 FI, fixedRecurring = 6 FI, oneTime = 10 FI (total = 20 FI)
    val setAll = grantor.sendSetPocketMoney(
        deployer.address,
        1,
        notDeployer.address,
        false,
        OneTimePocketMoney {
            remaining: grams("10"),
            startTime: 0,
            validUntil: 0,
        },
        FixedRecurringConfig {
            limit: grams("6"),
            period: ONE_WEEK,
            startTime: start,
            validUntil: start + ONE_MONTH,
        },
        OpenRecurringConfig {
            limit: grams("4"),
            period: ONE_WEEK,
            startTime: start,
        },
        { value: grams("0.3") },
    );
    expect(setAll).toHaveSuccessfulTx<SetPocketMoney>({
        from: deployer.address,
        to: grantor.address,
    });
    expect(grantor.getPocketMoney(notDeployer.address)).toEqual(grams("20"));

    // Spend 12 FI: should consume 4 FI from openRecurring, 6 FI from fixedRecurring, and 2 FI from oneTime (leaving 8 FI in oneTime)
    val spendWaterfall = sendSpend(
        grantor,
        notDeployer.address,
        grams("12"),
        notDeployer.address,
        notDeployer.address,
    );
    expect(spendWaterfall).toHaveSuccessfulTx<SpendPocketMoney>({
        from: notDeployer.address,
        to: grantor.address,
    });
    expect(grantor.getPocketMoney(notDeployer.address)).toEqual(grams("8"));
    val pmData = grantor.getPocketMoneyData(notDeployer.address);
    expect(pmData.oneTime!.remaining).toEqual(grams("8"));
    expect(pmData.fixedRecurring!.spent).toEqual(grams("6"));
    expect(pmData.openRecurring!.spent).toEqual(grams("4"));

    // Grant unrestricted access for special one -> can spend beyond remaining slot caps, then revoke unrestricted
    grantor.sendSetPocketMoney(
        deployer.address,
        2,
        notDeployer.address,
        true,
        null,
        null,
        null,
        { value: grams("0.3") },
    );
    expect(grantor.getPocketMoney(notDeployer.address)).toEqual(grantor.getJettonBalance());

    val spendUnrestricted = sendSpend(
        grantor,
        notDeployer.address,
        grams("30"),
        notDeployer.address,
        notDeployer.address,
    );
    expect(spendUnrestricted).toHaveSuccessfulTx<SpendPocketMoney>({
        from: notDeployer.address,
        to: grantor.address,
    });
    // One-time slot was untouched while unrestricted was active
    expect(grantor.getPocketMoneyData(notDeployer.address).oneTime!.remaining).toEqual(grams("8"));

    // Revoke unrestricted access anytime
    grantor.sendSetPocketMoney(
        deployer.address,
        3,
        notDeployer.address,
        false,
        null,
        null,
        null,
        { value: grams("0.3") },
    );
    expect(grantor.getPocketMoney(notDeployer.address)).toEqual(grams("8"));
}

get fun `test pocketMoney: migration from v1 LegacyMapsV1 converts bare coins allowances to PocketMoney`() {
    testing.setNow(1_800_000_000);
    registerAllTestLibraries();
    val owner = testing.treasury("mig-owner");
    val minter = testing.treasury("mig-minter");
    val friend = testing.treasury("mig-friend");

    var legacyAllowances: map<address, coins> = [];
    legacyAllowances.set(friend.address, grams("42"));

    val legacyMapsCell = beginCell()
        .storeDict(null) // empty invited
        .storeDict(legacyAllowances as unknown as cell)
        .storeRef(SocialMaps { votedFor: [] }.toCell())
        .storeRef(ReportInfo { reports: [] }.toCell())
        .endCell();

    val v1Wallet = deployWalletFromStorage(
        FiWalletStore {
            jettonBalance: grams("100"),
            active: true,
            version: 1,
            storeVersion: 1,
            addresses: Addresses {
                owner: owner.address,
                nomInAddrs: NomInAddrs {}.toCell(),
                trustedJettonAddrs: TrustedAddrs {
                    minterAddr: minter.address,
                    authorisedAccs: [],
                }.toCell(),
            }.toCell(),
            maps: legacyMapsCell as unknown as Cell<Maps>,
            profile: ProfileInfo {}.toCell(),
            timestamps: TimeStamps { accountInit: 1_800_000_000 }.toCell(),
        },
        minter.address,
    );

    // Upgrade v1 wallet -> v2 via Upgrade message from minter
    val upgRes = v1Wallet.sendUpgrade(
        minter.address,
        true,
        2,
        minter.address,
        null,
        build("FossFiWallet"),
        { value: grams("0.3") },
    );
    expect(upgRes).toHaveSuccessfulTx<Upgrade>({
        from: minter.address,
        to: v1Wallet.address,
    });

    val migratedData = v1Wallet.getWalletDataAll();
    expect(migratedData.version).toEqual(2);
    expect(migratedData.storeVersion).toEqual(2);
    expect(v1Wallet.getPocketMoney(friend.address)).toEqual(grams("42"));
}
