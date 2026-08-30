import "@acton/build"
import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@acton/testing/expect"

import "@gen/PersonalWallet.code"
import "@wrappers/FossFi.gen"
import "@wrappers/FossFiWallet.gen"
import "@wrappers/Personal.gen"
import "@wrappers/PersonalWallet.gen"
import "@wrappers/utils"
import "@contracts/common/errors"
import "@contracts/common/messages"
import "@contracts/personalMinter/storage"

import "test-utils"

// Deploy an issuer's Personal Token minter backed by the issuer's FI account.
fun deployPersonalMinter(issuerWallet: address, admin: address): Personal {
    val priStore: PriStore = {
        totalSupply: 0,
        fiJettonAddress: issuerWallet,
        adminAddress: admin,
        latestWalletCodeLibRef: personalWalletCompiledCodeLibraryRef(),
        metadataUri: createEmptyCell(),
    };
    val stateInit = ContractState {
        code: build("PersonalMinter"),
        data: priStore.toCell(),
    };
    val address = AutoDeployAddress {
        workchain: BASECHAIN,
        stateInit,
    }.calculateAddress();
    val pm = Personal { address, stateInit };
    val res = pm.deploy(admin, { value: ton("1") });
    expect(res).toHaveSuccessfulDeploy({ to: address });
    return pm;
}

// Point the issuer's FI wallet at its Personal Token minter (ton("0.777") owner message).
fun pointIssuerAtPersonalMinter(
    issuer: FossFiWallet,
    owner: address,
    personalMinter: address,
): SendResultList {
    return issuer.sendActSetPersonalJettonMinter(
        owner,
        personalMinter,
        { value: ton("0.6") }, // must exceed the > ton("0.5") owner-action gate
    );
}

fun personalSupply(pm: Personal): coins {
    return pm.getJettonData().totalSupply;
}

fun personalWalletForOwner(pm: Personal, owner: address): PersonalWallet {
    return PersonalWallet.fromAddress(pm.getWalletAddress(owner));
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
    val buyerWallet = mintTo(minter, deployer, deployer.address, ton("1000"));

    // issuer: a distinct active member, activated via deployer's invite
    val issuerWallet = activateUser(
        minter,
        buyerWallet,
        deployer,
        notDeployer.address,
    );

    // deploy the issuer's Personal Token minter and point the issuer's FI wallet at it
    val pm = deployPersonalMinter(issuerWallet.address, notDeployer.address);
    pointIssuerAtPersonalMinter(issuerWallet, notDeployer.address, pm.address);
    issuerWallet.sendSetCreditNeed(
        notDeployer.address,
        0,
        ton("1000"),
        1_800_000_000 + 86400,
        { value: ton("0.1") },
    );

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

    val loan = ton("100");
    val buyerFiBefore = buyerWallet.getJettonBalance();
    val issuerFiBefore = issuerWallet.getJettonBalance();
    val supplyBefore = personalSupply(pm);

    val res = buyerWallet.sendBuyCredit(
        deployer.address,
        0,
        loan,
        notDeployer.address, // issuer owner; resolved to issuer's FI account via getAddrFiWallet
        deployer.address,
        { value: ton("1.5") },
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
    expect(personalBalanceOf(pm, deployer.address)).toEqual(loan);
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
        ton("5000"), // exceeds buyer's balance
        notDeployer.address,
        deployer.address,
        { value: ton("1.5") },
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

    val loan = ton("100");
    buyerWallet.sendBuyCredit(
        deployer.address,
        0,
        loan,
        notDeployer.address,
        deployer.address,
        { value: ton("1.5") },
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
        { bounce: false, value: DEFAULT_BURN_MSG_VALUE },
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

    val loan = ton("100");
    buyerWallet.sendBuyCredit(
        deployer.address,
        0,
        loan,
        notDeployer.address,
        deployer.address,
        { value: ton("1.5") },
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
    expect(personalBalanceOf(pm, deployer.address)).toEqual(loan);
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

    val loan = ton("100");
    buyerWallet.sendBuyCredit(
        deployer.address,
        0,
        loan,
        notDeployer.address,
        deployer.address,
        { value: ton("1.5") },
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
    expect(personalBalanceOf(pm, deployer.address)).toEqual(ton("0"));
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

    val loan = ton("100");
    buyerWallet.sendBuyCredit(
        deployer.address,
        0,
        loan,
        notDeployer.address,
        deployer.address,
        { value: ton("1.5") },
    );

    val repaid = ton("40");
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

    expect(personalBalanceOf(pm, deployer.address)).toEqual(loan - repaid);
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

    val loan = ton("100");
    buyerWallet.sendBuyCredit(
        deployer.address,
        0,
        loan,
        notDeployer.address,
        deployer.address,
        { value: ton("1.5") },
    );

    val buyerPriWallet = personalWalletForOwner(pm, deployer.address);

    val res = sendPayback(deployer.address, buyerPriWallet, ton("5000"));
    expect(res).toHaveFailedTx<AskToBurn>({
        from: deployer.address,
        to: buyerPriWallet.address,
        exitCode: Errors.BalanceError,
    });

    // nothing moves when the burn fails
    expect(personalBalanceOf(pm, deployer.address)).toEqual(loan);
    expect(personalSupply(pm)).toEqual(loan);
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

    val loan = ton("100");
    buyerWallet.sendBuyCredit(
        deployer.address,
        0,
        loan,
        notDeployer.address,
        deployer.address,
        { value: ton("1.5") },
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
    expect(issuerWallet.getJettonBalance()).toEqual(ton("0"));

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
    expect(personalBalanceOf(pm, deployer.address)).toEqual(loan);
    expect(personalSupply(pm)).toEqual(supplyBefore);
    expect(buyerWallet.getJettonBalance()).toEqual(buyerFiAfterBuy);
    expect(issuerWallet.getJettonBalance()).toEqual(ton("0"));
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

    val loan = ton("100");
    buyerWallet.sendBuyCredit(
        deployer.address,
        0,
        loan,
        notDeployer.address,
        deployer.address,
        { value: ton("1.5") },
    );

    // the issuer spends its 1 FI activation bonus, holding exactly the loan
    val burnIssuer = issuerWallet.sendAskToBurn(
        notDeployer.address,
        0,
        ton("1"),
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

    expect(personalBalanceOf(pm, deployer.address)).toEqual(ton("0"));
    expect(personalSupply(pm)).toEqual(supplyBefore - loan);
    expect(buyerWallet.getJettonBalance()).toEqual(buyerFiBefore + loan);
    expect(issuerWallet.getJettonBalance()).toEqual(ton("0"));
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

    val loan = ton("100");
    buyerWallet.sendBuyCredit(
        deployer.address,
        0,
        loan,
        notDeployer.address,
        deployer.address,
        { value: ton("1.5") },
    );

    val buyerPriWallet = personalWalletForOwner(pm, deployer.address);
    val friend = testing.treasury("personal-token-recipient");

    // Transfer 30 personal tokens to friend while still before maturity
    testing.setNow(1_800_000_000 + 1000);
    val transferRes = buyerPriWallet.sendAskToTransfer(
        deployer.address,
        0,
        ton("30"),
        friend.address,
        deployer.address,
        null,
        0,
        PayloadInline { value: createEmptySlice() },
        { value: ton("0.5") },
    );
    expect(transferRes).toHaveSuccessfulTx<AskToTransfer>({
        from: deployer.address,
        to: buyerPriWallet.address,
    });

    expect(personalBalanceOf(pm, deployer.address)).toEqual(ton("70"));
    expect(personalBalanceOf(pm, friend.address)).toEqual(ton("30"));
}

fun personalBalanceOf(pm: Personal, owner: address): coins {
    return personalWalletForOwner(pm, owner).getWalletData().jettonBalance;
}
