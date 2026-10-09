import "@acton/build"
import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@acton/testing/expect"

import "@wrappers/CreditProxy.gen"
import "@wrappers/FossFiWallet.gen"
import "@wrappers/LocationCredit.gen"
import "@contracts/common/messages"
import "@contracts/credit/credit-utils"
import "@contracts/credit/messages"
import "@contracts/credit/storage"

import "test-utils"

const H3_NYC = "882a100d31fffff"

fun getLocationCreditContract(
    proxyAddress: address,
    adminAddress: address,
    h3Cell: string,
): LocationCredit {
    val deployInfo = calcDeployLocationCredit(
        h3Cell,
        proxyAddress,
        adminAddress,
        build("LocationCredit"),
    );
    return LocationCredit.fromAddress(deployInfo.calculateAddress());
}

get fun `test location credit: registration, getState, delisting, upgrade and destroy`() {
    val (minter, deployer, _) = setupTest();
    val rootWallet = userWallet(minter, deployer.address);

    val alice = testing.treasury("alice-location-credit");
    val aliceWallet = userWallet(minter, alice.address);

    // Invite Alice to register profile with H3_NYC
    val inviteAlice = rootWallet.sendActInvite(
        deployer.address,
        0,
        alice.address,
        "alice",
        H3_NYC,
        840,
        { value: grams("1") },
    );
    expect(inviteAlice).toHaveSuccessfulDeploy<InternalInvite>({
        from: rootWallet.address,
        to: aliceWallet.address,
    });

    // Deploy CreditProxy
    val creditProxy = CreditProxy.fromStorage(
        CreditProxyStore {
            adminAddress: deployer.address,
            fiMinterAddress: minter.address,
            locationCreditCode: build("LocationCredit"),
            version: 1,
        },
    );
    val deployProxy = creditProxy.deploy(deployer.address, { value: grams("0.2") });
    expect(deployProxy).toHaveAllSuccessfulTxs();

    val locationCredit = getLocationCreditContract(creditProxy.address, deployer.address, H3_NYC);

    // Alice sets personal jetton registration first so loan requirement is valid
    val setPersonal = aliceWallet.sendActSetPersonalJetton(
        alice.address,
        deployer.address,
        rootWallet.address,
        { value: grams("0.1") },
    );
    expect(setPersonal).toHaveAllSuccessfulTxs();

    // Alice sets loan requirement with creditProxyAddress and H3_NYC
    val maturity = blockchain.now() + 10000;
    val cutoff = blockchain.now() + 5000;
    val setLoan = aliceWallet.sendSetLoanRequirement(
        alice.address,
        0,
        grams("500"),
        maturity,
        cutoff,
        1200,
        creditProxy.address,
        H3_NYC,
        { value: grams("0.3") },
    );
    expect(setLoan).toHaveSuccessfulDeploy<AddLocationCreditEntry>({
        from: creditProxy.address,
        to: locationCredit.address,
    });

    // Verify LocationCredit getState
    val state = locationCredit.getState();
    expect(state.h3Cell).toEqual(H3_NYC);
    expect(state.entryCount).toEqual(1);
    expect(state.proxyAddress).toEqual(creditProxy.address);

    val entry = state.entries.get(aliceWallet.address);
    expect(entry.isFound).toBeTrue();
    val entryVal = entry.loadValue();
    expect(entryVal.borrowerAddress).toEqual(alice.address);
    expect(entryVal.amount).toEqual(grams("500"));
    expect(entryVal.multiplier).toEqual(1200);

    // Alice cancels/delists by setting amount to 0
    val cancelLoan = aliceWallet.sendSetLoanRequirement(
        alice.address,
        1,
        0,
        null,
        null,
        null,
        creditProxy.address,
        H3_NYC,
        { value: grams("0.2") },
    );
    expect(cancelLoan).toHaveSuccessfulTx<RemoveLocationCreditEntry>({
        from: creditProxy.address,
        to: locationCredit.address,
    });

    val stateAfterCancel = locationCredit.getState();
    expect(stateAfterCancel.entryCount).toEqual(0);
    val entryAfterCancel = stateAfterCancel.entries.get(aliceWallet.address);
    expect(entryAfterCancel.isFound).toBeFalse();

    // Test HotUpgrade by admin
    val hotUpProxy = creditProxy.sendHotUpgrade(
        deployer.address,
        null,
        build("CreditProxy"),
        { value: grams("0.1") },
    );
    expect(hotUpProxy).toHaveAllSuccessfulTxs();

    val hotUpLoc = locationCredit.sendHotUpgrade(
        deployer.address,
        null,
        build("LocationCredit"),
        { value: grams("0.1") },
    );
    expect(hotUpLoc).toHaveAllSuccessfulTxs();

    // Test Destroy by admin
    val destroyLoc = locationCredit.sendDestroy(
        deployer.address,
        { value: grams("0.1") },
    );
    expect(destroyLoc).toHaveAllSuccessfulTxs();

    val destroyProxy = creditProxy.sendDestroy(
        deployer.address,
        { value: grams("0.1") },
    );
    expect(destroyProxy).toHaveAllSuccessfulTxs();
}
