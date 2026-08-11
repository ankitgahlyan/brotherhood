import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@acton/testing/expect"

import "@wrappers/FossFiWallet.gen"
import "@contracts/common/errors"
import "@contracts/common/messages"

import "test-utils"

get fun `test credit need: allows setting and updating creditNeed`() {
    val (wallet, owner, _minter, _borrower) = setupDirectWallet(ton("10"));

    val setTx = wallet.sendSetCreditNeed(
        owner.address,
        0,
        ton("50"),
        { value: ton("0.1") },
    );

    expect(setTx).toHaveSuccessfulTx<SetCreditNeed>({
        from: owner.address,
        to: wallet.address,
    });
}

get fun `test credit need: non-owner set creditNeed fails with NotOwner`() {
    val (wallet, _owner, _minter, borrower) = setupDirectWallet(ton("10"));

    val setTx = wallet.sendSetCreditNeed(
        borrower.address, // non-owner
        0,
        ton("50"),
        { value: ton("0.1") },
    );

    expect(setTx).toHaveFailedTx({
        to: wallet.address,
        exitCode: Errors.NotOwner,
    });
}
