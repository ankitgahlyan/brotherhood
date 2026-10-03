import "@acton/build"
import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@acton/testing/expect"

import "@wrappers/FossFi.gen"
import "@wrappers/FossFiWallet.gen"
import "@wrappers/Personal.gen"
import "@wrappers/PersonalMinter.gen"
import "@wrappers/PersonalWallet.gen"
import "@wrappers/utils"
import "@contracts/common/errors"
import "@contracts/common/messages"
import "@contracts/personalMinter/storage"

import "test-utils"

// Deploy an issuer's Personal Token minter backed by the issuer's FI account via BasePersonalMinter proxy.
fun deployPersonalMinter(issuerWallet: address, admin: address): Personal {
    val baseStore: BasePersonalMinterStore = {
        fiJettonAddress: issuerWallet,
        adminAddress: admin,
        version: 0,
    };
    val stateInit = ContractState {
        code: build("BasePersonalMinter"),
        data: baseStore.toCell(),
    };
    val toShard: AddressShardingOptions = { fixedPrefixLength: 8, closeTo: admin };
    val pmAddress = AutoDeployAddress {
        workchain: BASECHAIN,
        stateInit,
        toShard,
    }.calculateAddress();
    val deployMsg = createMessage({
        bounce: false,
        value: grams("1"),
        dest: {
            workchain: BASECHAIN,
            stateInit,
            toShard,
        },
        body: TopUpTons { latestFiWalletCode: build("PersonalMinter") },
    });
    val res = net.send(admin, deployMsg);
    expect(res).toHaveSuccessfulDeploy({ to: pmAddress });
    return Personal.fromAddress(pmAddress);
}

// Point the issuer's FI wallet at its Personal Token minter and personal wallet (ton("0.6") owner message).
fun pointIssuerAtPersonalMinter(
    issuer: FossFiWallet,
    owner: address,
    personalMinter: address,
    personalWallet: address,
): SendResultList {
    return issuer.sendActSetPersonalJetton(
        owner,
        personalMinter,
        personalWallet,
        { value: grams("0.6") }, // must exceed the > ton("0.5") owner-action gate
    );
}

fun personalSupply(pm: Personal): coins {
    return pm.getJettonData().totalSupply;
}

fun personalWalletForOwner(pm: Personal, owner: address): PersonalWallet {
    return PersonalWallet.fromAddress(pm.getWalletAddress(owner));
}

fun onboardPersonalWallet(pm: Personal, admin: Treasury, owner: address): PersonalWallet {
    pm.sendMint(admin.address, owner, grams("1"));
    return personalWalletForOwner(pm, owner);
}

fun setupPersonalScenario(): (
    FossFi,
    Treasury,
    Treasury,
    FossFiWallet,
    FossFiWallet,
    Personal,
) {
    testing.setNow(1_800_000_000);
    val (minter, deployer, notDeployer) = setupTest();

    // buyer: the treasury wallet (funded with FI to lend)
    val buyerWallet = mintTo(minter, deployer, deployer.address, grams("1000"));

    // issuer: a distinct active member, activated via deployer's invite
    val issuerWallet = activateUser(
        minter,
        buyerWallet,
        deployer,
        notDeployer.address,
    );

    // deploy the issuer's Personal Token minter and point the issuer's FI wallet at it
    val pm = deployPersonalMinter(issuerWallet.address, notDeployer.address);
    val issuerPersonalWallet = pm.getWalletAddress(notDeployer.address);
    pointIssuerAtPersonalMinter(
        issuerWallet,
        notDeployer.address,
        pm.address,
        issuerPersonalWallet,
    );
    issuerWallet.sendSetLoanRequirement(
        notDeployer.address,
        0,
        grams("1000"),
        1_800_000_000 + 86400,
        null,
        { value: grams("0.1") },
    );

    // Onboard buyer's personal token wallet with 1 GRAM deploy signal
    onboardPersonalWallet(pm, notDeployer, deployer.address);

    return (
        minter,
        deployer,
        notDeployer,
        buyerWallet,
        issuerWallet,
        pm,
    );
}

get fun `test personal token: buying moves buyer FI to issuer and mints the Personal Token`() {
    val (
        _minter,
        deployer,
        notDeployer,
        buyerWallet,
        issuerWallet,
        pm,
    ) = setupPersonalScenario();

    val loan = grams("100");
    val buyerFiBefore = buyerWallet.getJettonBalance();
    val issuerFiBefore = issuerWallet.getJettonBalance();
    val supplyBefore = personalSupply(pm);

    val res = buyerWallet.sendBuyCredit(
        deployer.address,
        0,
        loan,
        notDeployer.address, // issuer owner; resolved to issuer's FI account via getAddrFiWallet
        deployer.address,
        { value: grams("1.5") },
    );
    expect(res).toHaveSuccessfulTx<BuyCredit>({
        from: deployer.address,
        to: buyerWallet.address,
    });

    // buyer's FI moved to the issuer ...
    expect(buyerWallet.getJettonBalance()).toEqual(buyerFiBefore - loan);
    expect(issuerWallet.getJettonBalance()).toEqual(issuerFiBefore + loan);
    // ... and the issuer's Personal Token was minted to the buyer
    expect(personalSupply(pm)).toEqual(supplyBefore + loan);
    expect(personalBalanceOf(pm, deployer.address)).toEqual(grams("1") + loan);

    val trusted = issuerWallet.getWalletDataAll().addresses.load().trustedJettonAddrs.load();
    expect(trusted.personalJettonMinter).toEqual(pm.address);
    expect(trusted.personalJettonWallet).toEqual(pm.getWalletAddress(notDeployer.address));
}

get fun `test personal token: cannot buy more FI than the buyer holds`() {
    val (
        _minter,
        deployer,
        notDeployer,
        buyerWallet,
        _issuerWallet,
        _pm,
    ) = setupPersonalScenario();

    val res = buyerWallet.sendBuyCredit(
        deployer.address,
        0,
        grams("5000"), // exceeds buyer's balance
        notDeployer.address,
        deployer.address,
        { value: grams("1.5") },
    );
    expect(res).toHaveFailedTx<BuyCredit>({
        from: deployer.address,
        to: buyerWallet.address,
        exitCode: Errors.BalanceError,
    });
}

get fun `test personal token: lending leaves balances and supply stable while held`() {
    val (
        _minter,
        deployer,
        notDeployer,
        buyerWallet,
        issuerWallet,
        pm,
    ) = setupPersonalScenario();

    val loan = grams("100");
    buyerWallet.sendBuyCredit(
        deployer.address,
        0,
        loan,
        notDeployer.address,
        deployer.address,
        { value: grams("1.5") },
    );

    val buyerFiAfterBuy = buyerWallet.getJettonBalance();
    val issuerFiAfterBuy = issuerWallet.getJettonBalance();
    val personalBal = personalBalanceOf(pm, deployer.address);

    // nothing moves while the loan is held
    expect(buyerWallet.getJettonBalance()).toEqual(buyerFiAfterBuy);
    expect(issuerWallet.getJettonBalance()).toEqual(issuerFiAfterBuy);
    expect(personalBalanceOf(pm, deployer.address)).toEqual(personalBal);
    expect(personalSupply(pm)).toEqual(personalBal);
}

// Buyer burns their Personal Token, which makes the issuer return the loan's FI.
fun sendPayback(
    buyerOwner: address,
    buyerPriWallet: PersonalWallet,
    amount: coins,
): SendResultList {
    val burnBody = AskToBurn {
        queryId: 0,
        jettonAmount: amount,
        sendExcessesTo: buyerOwner, // non-null triggers the issuer's payback leg
        customPayload: null,
    }.toCell();
    return buyerPriWallet.sendAny(
        buyerOwner,
        burnBody,
        { bounce: false, value: grams("0.5") },
    );
}

get fun `test personal token: payback before maturity fails with CreditNotMatured and unwinds`() {
    val (
        _minter,
        deployer,
        notDeployer,
        buyerWallet,
        issuerWallet,
        pm,
    ) = setupPersonalScenario();

    val loan = grams("100");
    buyerWallet.sendBuyCredit(
        deployer.address,
        0,
        loan,
        notDeployer.address,
        deployer.address,
        { value: grams("1.5") },
    );

    val buyerFiAfterBuy = buyerWallet.getJettonBalance();
    val issuerFiAfterBuy = issuerWallet.getJettonBalance();
    val supplyBefore = personalSupply(pm);
    val buyerPriWallet = personalWalletForOwner(pm, deployer.address);

    // Time is still before maturity (maturity is 1_800_000_000 + 86400)
    testing.setNow(1_800_000_000 + 3600);

    val res = sendPayback(deployer.address, buyerPriWallet, loan);
    expect(res).toHaveSuccessfulTx<AskToBurn>({
        from: deployer.address,
        to: buyerPriWallet.address,
    });

    // FossFiWallet throws CreditNotMatured and bounces back to PersonalMinter
    expect(res).toHaveFailedTx<Payback>({
        from: pm.address,
        to: issuerWallet.address,
        exitCode: Errors.CreditNotMatured,
    });
    expect(res).toHaveBouncedTx({
        from: issuerWallet.address,
        to: pm.address,
    });

    // Personal tokens are restored to the buyer and no FI is transferred
    expect(personalBalanceOf(pm, deployer.address)).toEqual(grams("1") + loan);
    expect(personalSupply(pm)).toEqual(supplyBefore);
    expect(buyerWallet.getJettonBalance()).toEqual(buyerFiAfterBuy);
    expect(issuerWallet.getJettonBalance()).toEqual(issuerFiAfterBuy);
}

get fun `test personal token: payback burns the loan and returns FI to the buyer after maturity`() {
    val (
        _minter,
        deployer,
        notDeployer,
        buyerWallet,
        issuerWallet,
        pm,
    ) = setupPersonalScenario();

    val loan = grams("100");
    buyerWallet.sendBuyCredit(
        deployer.address,
        0,
        loan,
        notDeployer.address,
        deployer.address,
        { value: grams("1.5") },
    );

    // Advance time past maturity
    testing.setNow(1_800_000_000 + 86400 + 10);

    val buyerFiBefore = buyerWallet.getJettonBalance();
    val issuerFiBefore = issuerWallet.getJettonBalance();
    val supplyBefore = personalSupply(pm);
    val buyerPriWallet = personalWalletForOwner(pm, deployer.address);

    val res = sendPayback(deployer.address, buyerPriWallet, loan);
    expect(res).toHaveSuccessfulTx<AskToBurn>({
        from: deployer.address,
        to: buyerPriWallet.address,
    });

    // the loan is written off: the Personal Token is burned and the FI returned
    expect(personalBalanceOf(pm, deployer.address)).toEqual(grams("1"));
    expect(personalSupply(pm)).toEqual(supplyBefore - loan);
    expect(buyerWallet.getJettonBalance()).toEqual(buyerFiBefore + loan);
    expect(issuerWallet.getJettonBalance()).toEqual(issuerFiBefore - loan);
}

get fun `test personal token: partial payback returns FI for the repaid amount only`() {
    val (
        _minter,
        deployer,
        notDeployer,
        buyerWallet,
        issuerWallet,
        pm,
    ) = setupPersonalScenario();

    val loan = grams("100");
    buyerWallet.sendBuyCredit(
        deployer.address,
        0,
        loan,
        notDeployer.address,
        deployer.address,
        { value: grams("1.5") },
    );

    val repaid = grams("40");
    val buyerFiBefore = buyerWallet.getJettonBalance();
    val issuerFiBefore = issuerWallet.getJettonBalance();
    val supplyBefore = personalSupply(pm);
    val buyerPriWallet = personalWalletForOwner(pm, deployer.address);

    // Advance time past maturity
    testing.setNow(1_800_000_000 + 86400 + 10);

    val res = sendPayback(deployer.address, buyerPriWallet, repaid);
    expect(res).toHaveSuccessfulTx<AskToBurn>({
        from: deployer.address,
        to: buyerPriWallet.address,
    });

    expect(personalBalanceOf(pm, deployer.address)).toEqual(grams("1") + loan - repaid);
    expect(personalSupply(pm)).toEqual(supplyBefore - repaid);
    expect(buyerWallet.getJettonBalance()).toEqual(buyerFiBefore + repaid);
    expect(issuerWallet.getJettonBalance()).toEqual(issuerFiBefore - repaid);
}

get fun `test personal token: cannot pay back more than the buyer holds`() {
    val (
        _minter,
        deployer,
        notDeployer,
        buyerWallet,
        _issuerWallet,
        pm,
    ) = setupPersonalScenario();

    val loan = grams("100");
    buyerWallet.sendBuyCredit(
        deployer.address,
        0,
        loan,
        notDeployer.address,
        deployer.address,
        { value: grams("1.5") },
    );

    val buyerPriWallet = personalWalletForOwner(pm, deployer.address);

    val res = sendPayback(deployer.address, buyerPriWallet, grams("5000"));
    expect(res).toHaveFailedTx<AskToBurn>({
        from: deployer.address,
        to: buyerPriWallet.address,
        exitCode: Errors.BalanceError,
    });

    // nothing moves when the burn fails
    expect(personalBalanceOf(pm, deployer.address)).toEqual(grams("1") + loan);
    expect(personalSupply(pm)).toEqual(grams("1") + loan);
}

get fun `test personal token: payback unwinds when the issuer cannot cover the loan`() {
    val (
        _minter,
        deployer,
        notDeployer,
        buyerWallet,
        issuerWallet,
        pm,
    ) = setupPersonalScenario();

    val loan = grams("100");
    buyerWallet.sendBuyCredit(
        deployer.address,
        0,
        loan,
        notDeployer.address,
        deployer.address,
        { value: grams("1.5") },
    );

    // the issuer spends all its FI, so it can no longer cover the payback
    val issuerFiAfterBuy = issuerWallet.getJettonBalance(); // 1 + loan
    val burnIssuer = issuerWallet.sendAskToBurn(
        notDeployer.address,
        0,
        issuerFiAfterBuy,
        notDeployer.address,
        null,
        { bounce: false, value: DEFAULT_BURN_MSG_VALUE },
    );
    expect(burnIssuer).toHaveSuccessfulTx<AskToBurn>({
        from: notDeployer.address,
        to: issuerWallet.address,
    });
    expect(issuerWallet.getJettonBalance()).toEqual(grams("0"));

    val buyerFiAfterBuy = buyerWallet.getJettonBalance();
    val supplyBefore = personalSupply(pm);
    val buyerPriWallet = personalWalletForOwner(pm, deployer.address);

    // Advance time past maturity
    testing.setNow(1_800_000_000 + 86400 + 10);

    // the buyer tries to pay back; the issuer bounces the Payback, unwinding the burn
    val res = sendPayback(deployer.address, buyerPriWallet, loan);
    expect(res).toHaveSuccessfulTx<AskToBurn>({
        from: deployer.address,
        to: buyerPriWallet.address,
    });

    // the buyer keeps their Personal Token and gets no FI; supply is restored
    expect(res).toHaveFailedTx<Payback>({
        from: pm.address,
        to: issuerWallet.address,
        exitCode: Errors.InsufficientBalance,
    });
    expect(res).toHaveBouncedTx({
        from: issuerWallet.address,
        to: pm.address,
    });
    expect(personalBalanceOf(pm, deployer.address)).toEqual(grams("1") + loan);
    expect(personalSupply(pm)).toEqual(supplyBefore);
    expect(buyerWallet.getJettonBalance()).toEqual(buyerFiAfterBuy);
    expect(issuerWallet.getJettonBalance()).toEqual(grams("0"));
}

get fun `test personal token: payback succeeds when the issuer holds exactly the loan`() {
    val (
        _minter,
        deployer,
        notDeployer,
        buyerWallet,
        issuerWallet,
        pm,
    ) = setupPersonalScenario();

    val loan = grams("100");
    buyerWallet.sendBuyCredit(
        deployer.address,
        0,
        loan,
        notDeployer.address,
        deployer.address,
        { value: grams("1.5") },
    );

    // the issuer spends its 1 FI activation bonus, holding exactly the loan
    val burnIssuer = issuerWallet.sendAskToBurn(
        notDeployer.address,
        0,
        grams("1"),
        notDeployer.address,
        null,
        { bounce: false, value: DEFAULT_BURN_MSG_VALUE },
    );
    expect(burnIssuer).toHaveSuccessfulTx<AskToBurn>({
        from: notDeployer.address,
        to: issuerWallet.address,
    });
    expect(issuerWallet.getJettonBalance()).toEqual(loan);

    val buyerFiBefore = buyerWallet.getJettonBalance();
    val supplyBefore = personalSupply(pm);
    val buyerPriWallet = personalWalletForOwner(pm, deployer.address);

    // Advance time past maturity
    testing.setNow(1_800_000_000 + 86400 + 10);

    // the buyer repays the full loan; the issuer can cover it exactly
    val res = sendPayback(deployer.address, buyerPriWallet, loan);
    expect(res).toHaveSuccessfulTx<AskToBurn>({
        from: deployer.address,
        to: buyerPriWallet.address,
    });

    expect(personalBalanceOf(pm, deployer.address)).toEqual(grams("1"));
    expect(personalSupply(pm)).toEqual(supplyBefore - loan);
    expect(buyerWallet.getJettonBalance()).toEqual(buyerFiBefore + loan);
    expect(issuerWallet.getJettonBalance()).toEqual(grams("0"));
}

get fun `test personal token: secondary market transfer succeeds before maturity`() {
    val (
        _minter,
        deployer,
        notDeployer,
        buyerWallet,
        _issuerWallet,
        pm,
    ) = setupPersonalScenario();

    val loan = grams("100");
    buyerWallet.sendBuyCredit(
        deployer.address,
        0,
        loan,
        notDeployer.address,
        deployer.address,
        { value: grams("1.5") },
    );

    val buyerPriWallet = personalWalletForOwner(pm, deployer.address);
    val friend = testing.treasury("personal-token-recipient");
    onboardPersonalWallet(pm, notDeployer, friend.address);

    // Transfer 30 personal tokens to friend while still before maturity
    testing.setNow(1_800_000_000 + 1000);
    val transferRes = buyerPriWallet.sendAskToTransfer(
        deployer.address,
        0,
        grams("30"),
        friend.address,
        deployer.address,
        null,
        0,
        PayloadInline { value: createEmptySlice() },
        { value: grams("0.5") },
    );
    expect(transferRes).toHaveSuccessfulTx<AskToTransfer>({
        from: deployer.address,
        to: buyerPriWallet.address,
    });
    expect(transferRes).toHaveAllSuccessfulTxs();

    expect(personalBalanceOf(pm, deployer.address)).toEqual(grams("1") + loan - grams("30"));
    expect(personalBalanceOf(pm, friend.address)).toEqual(grams("1") + grams("30"));
}

get fun `test personal token: admin can directly mint personal tokens with 0.7 ton gas`() {
    val (
        _minter,
        _deployer,
        notDeployer,
        _buyerWallet,
        _issuerWallet,
        pm,
    ) = setupPersonalScenario();

    val recipient = testing.treasury("direct-mint-recipient");
    onboardPersonalWallet(pm, notDeployer, recipient.address);
    val mintAmount = grams("50");

    val mintRes = pm.sendMint(
        notDeployer.address,
        recipient.address,
        mintAmount,
        grams("0.02"),
        grams("0.7"),
    );

    expect(mintRes).toHaveSuccessfulTx<MintNewJettons>({
        from: notDeployer.address,
        to: pm.address,
    });

    expect(personalBalanceOf(pm, recipient.address)).toEqual(grams("1") + mintAmount);
    expect(personalSupply(pm)).toEqual(grams("1") + grams("1") + mintAmount);
}

fun personalBalanceOf(pm: Personal, owner: address): coins {
    return personalWalletForOwner(pm, owner).getWalletData().jettonBalance;
}

get fun `test personal token: request upgrade code returns Upgrade message`() {
    val (
        _minter,
        deployer,
        _notDeployer,
        _buyerWallet,
        _issuerWallet,
        pm,
    ) = setupPersonalScenario();

    val buyerPriWallet = personalWalletForOwner(pm, deployer.address);
    val minterWrapper = PersonalMinter.fromAddress(pm.address);

    // 1. Request from minter
    val minterReqRes = minterWrapper.sendRequestUpgradeCode(
        deployer.address,
        null,
        { value: grams("0.2") },
    );
    expect(minterReqRes).toHaveSuccessfulTx<RequestUpgradeCode>({
        from: deployer.address,
        to: pm.address,
    });
    expect(minterReqRes).toHaveSuccessfulTx<Upgrade>({
        from: pm.address,
        to: deployer.address,
    });

    // 2. Request from personal wallet
    val walletReqRes = buyerPriWallet.sendRequestUpgradeCode(
        deployer.address,
        null,
        { value: grams("0.2") },
    );
    expect(walletReqRes).toHaveSuccessfulTx<RequestUpgradeCode>({
        from: deployer.address,
        to: buyerPriWallet.address,
    });
    expect(walletReqRes).toHaveSuccessfulTx<Upgrade>({
        from: buyerPriWallet.address,
        to: deployer.address,
    });
}

get fun `test personal token: upgrade personal wallet from minter succeeds and updates version`() {
    val (
        _minter,
        deployer,
        _notDeployer,
        _buyerWallet,
        _issuerWallet,
        pm,
    ) = setupPersonalScenario();

    val buyerPriWallet = personalWalletForOwner(pm, deployer.address);
    val initialVersion = buyerPriWallet.getPersonalWalletState().version;
    expect(initialVersion).toEqual(1);

    // Minter upgrades wallet
    val upgradeRes = buyerPriWallet.sendUpgrade(
        pm.address,
        true,
        2, // new version
        pm.address,
        null,
        null,
        { value: grams("0.3") },
    );
    expect(upgradeRes).toHaveSuccessfulTx<Upgrade>({
        from: pm.address,
        to: buyerPriWallet.address,
    });

    val updatedVersion = buyerPriWallet.getPersonalWalletState().version;
    expect(updatedVersion).toEqual(2);
}

get fun `test personal token: upgrade personal wallet from peer personal wallet succeeds`() {
    val (
        _minter,
        deployer,
        notDeployer,
        _buyerWallet,
        _issuerWallet,
        pm,
    ) = setupPersonalScenario();

    val buyerPriWallet = personalWalletForOwner(pm, deployer.address);
    val peer = testing.treasury("peer-wallet-owner");
    val peerPriWallet = onboardPersonalWallet(pm, notDeployer, peer.address);

    expect(buyerPriWallet.getPersonalWalletState().version).toEqual(1);

    // Peer personal wallet sends Upgrade to buyerPriWallet with sender: peer.address
    val upgradeRes = buyerPriWallet.sendUpgrade(
        peerPriWallet.address,
        true,
        2,
        peer.address,
        null,
        null,
        { value: grams("0.3") },
    );
    expect(upgradeRes).toHaveSuccessfulTx<Upgrade>({
        from: peerPriWallet.address,
        to: buyerPriWallet.address,
    });

    expect(buyerPriWallet.getPersonalWalletState().version).toEqual(2);
}

get fun `test personal token: upgrade personal wallet from unauthorized address fails with IncorrectSender`() {
    val (
        _minter,
        deployer,
        _notDeployer,
        _buyerWallet,
        _issuerWallet,
        pm,
    ) = setupPersonalScenario();

    val buyerPriWallet = personalWalletForOwner(pm, deployer.address);
    val attacker = testing.treasury("attacker");

    // Attacker tries to send Upgrade directly
    val fakeUpgradeRes = buyerPriWallet.sendUpgrade(
        attacker.address,
        true,
        5,
        attacker.address,
        null,
        null,
        { value: grams("0.3") },
    );
    expect(fakeUpgradeRes).toHaveFailedTx<Upgrade>({
        from: attacker.address,
        to: buyerPriWallet.address,
        exitCode: Errors.IncorrectSender,
    });

    // Even the wallet owner cannot directly invoke Upgrade (must be minter or verified peer)
    val ownerUpgradeRes = buyerPriWallet.sendUpgrade(
        deployer.address,
        true,
        5,
        deployer.address,
        null,
        null,
        { value: grams("0.3") },
    );
    expect(ownerUpgradeRes).toHaveFailedTx<Upgrade>({
        from: deployer.address,
        to: buyerPriWallet.address,
        exitCode: Errors.IncorrectSender,
    });

    expect(buyerPriWallet.getPersonalWalletState().version).toEqual(1);
}

get fun `test personal minter: stores latest wallet code and handles wallet upgrade and request upgrade code`() {
    val (
        _minter,
        deployer,
        notDeployer,
        _buyerWallet,
        _issuerWallet,
        pm,
    ) = setupPersonalScenario();

    val initialMinterState = pm.getState();
    expect(initialMinterState.version).toEqual(1);
    expect(initialMinterState.codes.latestPersonalWalletCode).toEqual(build("PersonalWallet"));

    val dummyNewWalletCode = beginCell().storeUint(0x1234, 16).endCell();

    // 1. Upgrade from non-admin/non-fiJetton must fail
    val attacker = testing.treasury("attacker_minter");
    val unauthUpgradeRes = pm.sendUpgrade(
        attacker.address,
        true,
        2,
        attacker.address,
        null,
        dummyNewWalletCode,
        { value: grams("0.5") },
    );
    expect(unauthUpgradeRes).toHaveFailedTx<Upgrade>({
        from: attacker.address,
        to: pm.address,
        exitCode: Errors.IncorrectSender,
    });

    // 2. Admin (notDeployer) upgrades personal wallet code via minter
    val upgradeRes = pm.sendUpgrade(
        notDeployer.address,
        true,
        2,
        notDeployer.address,
        null,
        dummyNewWalletCode,
        { value: grams("0.5") },
    );
    expect(upgradeRes).toHaveSuccessfulTx<Upgrade>({
        from: notDeployer.address,
        to: pm.address,
    });

    val updatedMinterState = pm.getState();
    expect(updatedMinterState.version).toEqual(2);
    expect(updatedMinterState.codes.latestPersonalWalletCode).toEqual(dummyNewWalletCode);

    // 3. Wallets requesting upgrade code receive the updated latestPersonalWalletCode
    val pmWrapper = PersonalMinter.fromAddress(pm.address);
    val reqRes = pmWrapper.sendRequestUpgradeCode(
        deployer.address,
        deployer.address,
        { value: grams("0.2") },
    );
    expect(reqRes).toHaveSuccessfulTx<RequestUpgradeCode>({
        from: deployer.address,
        to: pm.address,
    });
    expect(reqRes).toHaveSuccessfulTx<Upgrade>({
        from: pm.address,
        to: deployer.address,
    });
}

get fun `test personal token: first-time buyer auto-onboards BasePersonalWallet on BuyCredit without 1 GRAM pre-mint`() {
    testing.setNow(1_800_000_000);
    val (minter, deployer, notDeployer) = setupTest();

    val buyerWallet = mintTo(minter, deployer, deployer.address, grams("1000"));
    val issuerWallet = activateUser(minter, buyerWallet, deployer, notDeployer.address);

    val pm = deployPersonalMinter(issuerWallet.address, notDeployer.address);
    val issuerPersonalWallet = pm.getWalletAddress(notDeployer.address);
    pointIssuerAtPersonalMinter(
        issuerWallet,
        notDeployer.address,
        pm.address,
        issuerPersonalWallet,
    );
    // Instant maturity (0) allowed for multiplier = 1000 (1.000x)
    issuerWallet.sendSetLoanRequirement(
        notDeployer.address,
        0,
        grams("500"),
        0,
        1000,
        { value: grams("0.1") },
    );

    // Notice: we DO NOT call onboardPersonalWallet(pm, notDeployer, deployer.address)!
    val loan = grams("100");
    val res = buyerWallet.sendBuyCredit(
        deployer.address,
        0,
        loan,
        notDeployer.address,
        deployer.address,
        { value: grams("1.5") },
    );
    expect(res).toHaveSuccessfulTx<BuyCredit>({
        from: deployer.address,
        to: buyerWallet.address,
    });

    expect(personalBalanceOf(pm, deployer.address)).toEqual(loan);
}

get fun `test personal token: multi-hop swap P_A -> FI -> P_B and Leg-2 bounce recovery`() {
    testing.setNow(1_800_000_000);
    val (minter, deployer, issuerA) = setupTest();
    val issuerB = testing.treasury("issuerB");

    val buyerWallet = mintTo(minter, deployer, deployer.address, grams("2000"));
    val walletA = activateUser(minter, buyerWallet, deployer, issuerA.address);

    // Advance time for second invite
    testing.setNow(1_800_000_000 + 86400);
    val walletB = activateUser(minter, buyerWallet, deployer, issuerB.address);

    // Setup Personal Token A (instant 1:1 liquidity pool, maturity = 0, multiplier = 1000)
    val pmA = deployPersonalMinter(walletA.address, issuerA.address);
    pointIssuerAtPersonalMinter(
        walletA,
        issuerA.address,
        pmA.address,
        pmA.getWalletAddress(issuerA.address),
    );
    walletA.sendSetLoanRequirement(
        issuerA.address,
        0,
        grams("1000"),
        0,
        1000,
        { value: grams("0.1") },
    );

    // Setup Personal Token B (fractional fee 0.950x, maturity = 0, multiplier = 950)
    val pmB = deployPersonalMinter(walletB.address, issuerB.address);
    pointIssuerAtPersonalMinter(
        walletB,
        issuerB.address,
        pmB.address,
        pmB.getWalletAddress(issuerB.address),
    );
    walletB.sendSetLoanRequirement(
        issuerB.address,
        0,
        grams("500"),
        0,
        950,
        { value: grams("0.1") },
    );

    // Step 1: Buyer buys 200 P_A using FI
    buyerWallet.sendBuyCredit(
        deployer.address,
        0,
        grams("200"),
        issuerA.address,
        deployer.address,
        { value: grams("1.5") },
    );
    expect(personalBalanceOf(pmA, deployer.address)).toEqual(grams("200"));

    // Step 2: Single-signature Multi-Hop Swap: Burn 100 P_A -> FI -> BuyCredit P_B
    val buyerPriWalletA = personalWalletForOwner(pmA, deployer.address);
    val swapPayload = beginCell().storeAddress(issuerB.address).endCell();
    val swapBurnBody = AskToBurn {
        queryId: 1,
        jettonAmount: grams("100"),
        sendExcessesTo: deployer.address,
        customPayload: swapPayload,
    }.toCell();

    val swapRes = buyerPriWalletA.sendAny(
        deployer.address,
        swapBurnBody,
        { bounce: false, value: grams("1.5") },
    );
    expect(swapRes).toHaveSuccessfulTx<AskToBurn>({
        from: deployer.address,
        to: buyerPriWalletA.address,
    });

    // Buyer now has 100 P_A left, and received 95 P_B (100 * 950 / 1000)
    expect(personalBalanceOf(pmA, deployer.address)).toEqual(grams("100"));
    expect(personalBalanceOf(pmB, deployer.address)).toEqual(grams("95"));

    // Step 3: Leg-2 Bounce recovery when B's creditNeed is set to 0
    walletB.sendSetLoanRequirement(
        issuerB.address,
        0,
        0,
        null,
        null,
        { value: grams("0.1") },
    );
    val buyerFiBeforeBounceSwap = buyerWallet.getJettonBalance();

    val bounceSwapRes = buyerPriWalletA.sendAny(
        deployer.address,
        swapBurnBody,
        { bounce: false, value: grams("1.5") },
    );
    expect(bounceSwapRes).toHaveSuccessfulTx<AskToBurn>({
        from: deployer.address,
        to: buyerPriWalletA.address,
    });

    // Leg 1 succeeded (100 P_A redeemed for 100 FI), Leg 2 bounced at walletB -> buyer keeps the 100 FI!
    expect(personalBalanceOf(pmA, deployer.address)).toEqual(0);
    expect(buyerWallet.getJettonBalance()).toEqual(buyerFiBeforeBounceSwap + grams("100"));
}

get fun `test personal token: normal burn with customPayload notifies adminAddress for fiat off-ramp`() {
    val (
        _minter,
        deployer,
        notDeployer,
        buyerWallet,
        _issuerWallet,
        pm,
    ) = setupPersonalScenario();

    buyerWallet.sendBuyCredit(
        deployer.address,
        0,
        grams("100"),
        notDeployer.address,
        deployer.address,
        { value: grams("1.5") },
    );

    val buyerPriWallet = personalWalletForOwner(pm, deployer.address);
    val encryptedBankDetails = beginCell()
        .storeUint(0x2167da4b, 32)
        .storeUint(0xdeadbeef, 32)
        .endCell();

    val offRampBurnBody = AskToBurn {
        queryId: 42,
        jettonAmount: grams("50"),
        sendExcessesTo: null, // normal burn (not FI payback)
        customPayload: encryptedBankDetails,
    }.toCell();

    val res = buyerPriWallet.sendAny(
        deployer.address,
        offRampBurnBody,
        { bounce: false, value: grams("0.5") },
    );
    expect(res).toHaveSuccessfulTx<AskToBurn>({
        from: deployer.address,
        to: buyerPriWallet.address,
    });
    expect(res).toHaveSuccessfulTx<TransferNotificationForRecipient>({
        from: pm.address,
        to: notDeployer.address,
    });
    expect(personalBalanceOf(pm, deployer.address)).toEqual(grams("51"));
}
