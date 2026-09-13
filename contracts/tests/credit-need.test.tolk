import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@acton/testing/expect"

import "@wrappers/FossFiWallet.gen"
import "@contracts/common/errors"
import "@contracts/common/messages"

import "test-utils"

get fun `test loan requirement: allows setting and updating creditNeed`() {
    testing.setNow(1_800_000_000);
    val (wallet, owner, _minter, _borrower) = setupDirectWalletWithPersonal(ton("10"));

    val setTx = wallet.sendSetLoanRequirement(
        owner.address,
        0,
        ton("50"),
        1_800_000_000 + 86400,
        null,
        { value: ton("0.1") },
    );

    expect(setTx).toHaveSuccessfulTx<SetLoanRequirement>({
        from: owner.address,
        to: wallet.address,
    });

    val store = wallet.getWalletDataAll();
    expect(store.creditNeed).toEqual(ton("50"));
    expect(store.creditMaturity).toEqual(1_800_000_000 + 86400);
}

get fun `test loan requirement: fails with PersonalJettonNotRegistered when personal token not registered`() {
    testing.setNow(1_800_000_000);
    val (wallet, owner, _minter, _borrower) = setupDirectWallet(ton("10"));

    val setTx = wallet.sendSetLoanRequirement(
        owner.address,
        0,
        ton("50"),
        1_800_000_000 + 86400,
        null,
        { value: ton("0.1") },
    );

    expect(setTx).toHaveFailedTx({
        to: wallet.address,
        exitCode: Errors.PersonalJettonNotRegistered,
    });
}

get fun `test loan requirement: non-owner set loan requirement fails with NotOwner`() {
    testing.setNow(1_800_000_000);
    val (wallet, _owner, _minter, borrower) = setupDirectWalletWithPersonal(ton("10"));

    val setTx = wallet.sendSetLoanRequirement(
        borrower.address, // non-owner
        0,
        ton("50"),
        1_800_000_000 + 86400,
        null,
        { value: ton("0.1") },
    );

    expect(setTx).toHaveFailedTx({
        to: wallet.address,
        exitCode: Errors.NotOwner,
    });
}

get fun `test loan requirement: setting maturity in past fails with InvalidMessage`() {
    testing.setNow(1_800_000_000);
    val (wallet, owner, _minter, _borrower) = setupDirectWalletWithPersonal(ton("10"));

    // maturityDate <= blockchain.now() must throw InvalidMessage
    val setTx = wallet.sendSetLoanRequirement(
        owner.address,
        0,
        ton("50"),
        1_800_000_000,
        null,
        { value: ton("0.1") },
    );

    expect(setTx).toHaveFailedTx({
        to: wallet.address,
        exitCode: Errors.InvalidMessage,
    });
}

get fun `test loan requirement: shortening active future maturity fails with InvalidMessage`() {
    testing.setNow(1_800_000_000);
    val (wallet, owner, _minter, _borrower) = setupDirectWalletWithPersonal(ton("10"));

    // Set initial credit need with maturity at +2 days
    wallet.sendSetLoanRequirement(
        owner.address,
        0,
        ton("50"),
        1_800_000_000 + 172800,
        null,
        { value: ton("0.1") },
    );

    // Trying to shorten maturity to +1 day should fail
    val shortenTx = wallet.sendSetLoanRequirement(
        owner.address,
        0,
        ton("60"),
        1_800_000_000 + 86400,
        null,
        { value: ton("0.1") },
    );

    expect(shortenTx).toHaveFailedTx({
        to: wallet.address,
        exitCode: Errors.InvalidMessage,
    });

    // Extending maturity to +3 days should succeed
    val extendTx = wallet.sendSetLoanRequirement(
        owner.address,
        0,
        ton("60"),
        1_800_000_000 + 259200,
        null,
        { value: ton("0.1") },
    );

    expect(extendTx).toHaveSuccessfulTx<SetLoanRequirement>({
        from: owner.address,
        to: wallet.address,
    });

    val store = wallet.getWalletDataAll();
    expect(store.creditNeed).toEqual(ton("60"));
    expect(store.creditMaturity).toEqual(1_800_000_000 + 259200);
}

get fun `test loan requirement: setting amount 0 preserves existing future maturity`() {
    testing.setNow(1_800_000_000);
    val (wallet, owner, _minter, _borrower) = setupDirectWalletWithPersonal(ton("10"));

    // Set initial credit need with maturity at +2 days
    wallet.sendSetLoanRequirement(
        owner.address,
        0,
        ton("50"),
        1_800_000_000 + 172800,
        null,
        { value: ton("0.1") },
    );

    // Cancel credit need by setting amount = 0
    val cancelTx = wallet.sendSetLoanRequirement(
        owner.address,
        0,
        0,
        null,
        null,
        { value: ton("0.1") },
    );

    expect(cancelTx).toHaveSuccessfulTx<SetLoanRequirement>({
        from: owner.address,
        to: wallet.address,
    });

    val store = wallet.getWalletDataAll();
    expect(store.creditNeed).toEqual(0);
    expect(store.creditMaturity).toEqual(1_800_000_000 + 172800);
}
