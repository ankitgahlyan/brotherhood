import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@acton/testing/expect"

import "@wrappers/FossFiWallet.gen"
import "@wrappers/utils"
import "@contracts/common/errors"
import "@contracts/common/messages"

import "personal-token.test"
import "test-utils"

get fun `test credit multiplier: allows setting and updating multiplier by owner`() {
    val (wallet, owner, _minter, _borrower) = setupDirectWallet(ton("10"));

    val setTx = wallet.sendSetMultiplier(
        owner.address,
        0,
        2,
        { value: ton("0.1") },
    );

    expect(setTx).toHaveSuccessfulTx<SetMultiplier>({
        from: owner.address,
        to: wallet.address,
    });
}

get fun `test credit multiplier: non-owner set multiplier fails with NotOwner`() {
    val (wallet, _owner, _minter, borrower) = setupDirectWallet(ton("10"));

    val setTx = wallet.sendSetMultiplier(
        borrower.address, // non-owner
        0,
        2,
        { value: ton("0.1") },
    );

    expect(setTx).toHaveFailedTx({
        to: wallet.address,
        exitCode: Errors.NotOwner,
    });
}

get fun `test credit multiplier: setting multiplier to 0 fails with InvalidMessage`() {
    val (wallet, owner, _minter, _borrower) = setupDirectWallet(ton("10"));

    val setTx = wallet.sendSetMultiplier(
        owner.address,
        0,
        0, // invalid multiplier 0
        { value: ton("0.1") },
    );

    expect(setTx).toHaveFailedTx({
        to: wallet.address,
        exitCode: Errors.InvalidMessage,
    });
}

get fun `test credit multiplier: multiplier=2 mints 2x personal tokens`() {
    val (
        _minter,
        deployer,
        notDeployer,
        buyerWallet,
        issuerWallet,
        pm,
    ) = setupPersonalScenario();

    // set multiplier to 2
    issuerWallet.sendSetMultiplier(
        notDeployer.address,
        0,
        2,
        { value: ton("0.1") },
    );

    val loan = ton("100");
    val buyerFiBefore = buyerWallet.getJettonBalance();
    val issuerFiBefore = issuerWallet.getJettonBalance();
    val supplyBefore = personalSupply(pm);

    val res = buyerWallet.sendBuyCredit(
        deployer.address,
        0,
        loan,
        notDeployer.address,
        deployer.address,
        { value: ton("1.5") },
    );
    expect(res).toHaveSuccessfulTx<BuyCredit>({
        from: deployer.address,
        to: buyerWallet.address,
    });

    // buyer's 100 FI moved to issuer ...
    expect(buyerWallet.getJettonBalance()).toEqual(buyerFiBefore - loan);
    expect(issuerWallet.getJettonBalance()).toEqual(issuerFiBefore + loan);

    // ... and 2x (200) Personal Tokens were minted to buyer
    val expectedPersonalMinted = loan * 2;
    expect(personalSupply(pm)).toEqual(supplyBefore + expectedPersonalMinted);
    expect(personalBalanceOf(pm, deployer.address)).toEqual(expectedPersonalMinted);
}

get fun `test credit multiplier: sent tokens > creditNeed mints required and returns excess`() {
    val (
        _minter,
        deployer,
        notDeployer,
        buyerWallet,
        issuerWallet,
        pm,
    ) = setupPersonalScenario();

    // Set creditNeed to 100 FI and multiplier to 2
    val creditNeedAmount = ton("100");
    issuerWallet.sendSetCreditNeed(
        notDeployer.address,
        0,
        creditNeedAmount,
        1_800_000_000 + 86400,
        { value: ton("0.1") },
    );
    issuerWallet.sendSetMultiplier(
        notDeployer.address,
        0,
        2,
        { value: ton("0.1") },
    );

    val buyerFiBefore = buyerWallet.getJettonBalance();
    val issuerFiBefore = issuerWallet.getJettonBalance();
    val sentAmount = ton("150"); // exceeds creditNeed of 100

    val res = buyerWallet.sendBuyCredit(
        deployer.address,
        0,
        sentAmount,
        notDeployer.address,
        deployer.address,
        { value: ton("1.5") },
    );
    expect(res).toHaveSuccessfulTx<BuyCredit>({
        from: deployer.address,
        to: buyerWallet.address,
    });

    // Only creditNeedAmount (100 FI) is retained by issuer, 50 FI excess refunded back to buyer
    expect(buyerWallet.getJettonBalance()).toEqual(buyerFiBefore - creditNeedAmount);
    expect(issuerWallet.getJettonBalance()).toEqual(issuerFiBefore + creditNeedAmount);

    // Personal tokens minted equal 2x of accepted creditNeedAmount (100 * 2 = 200)
    val expectedPersonalMinted = creditNeedAmount * 2;
    expect(personalBalanceOf(pm, deployer.address)).toEqual(expectedPersonalMinted);
}
