import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@acton/testing/expect"

import "@wrappers/FossFiWallet.gen"

import "@contracts/common/errors"
import "@contracts/common/messages"

import "test-utils"

get fun `test gold coins: transfers gold coins between accounts`() {
    val (wallet, owner, _minter, receiver) = setupDirectWallet(ton("10"));

    val transferTx = wallet.sendAskGoldCoinsTransfer(
        owner.address,
        0,
        1,
        receiver.address,
        null,
        { value: ton("1") },
    );

    expect(transferTx).toHaveSuccessfulTx<AskGoldCoinsTransfer>({
        from: owner.address,
        to: wallet.address,
    });
}

get fun `test gold coins: non-owner transfer fails with NotOwner`() {
    val (wallet, _owner, _minter, receiver) = setupDirectWallet(ton("10"));

    val transferTx = wallet.sendAskGoldCoinsTransfer(
        receiver.address, // wrong sender
        0,
        1,
        receiver.address,
        null,
        { value: ton("1") },
    );

    expect(transferTx).toHaveFailedTx({
        to: wallet.address,
        exitCode: Errors.NotOwner,
    });
}

get fun `test gold coins: transfer exceeding balance fails with BalanceError`() {
    val (wallet, owner, _minter, receiver) = setupDirectWallet(ton("10"));

    // Default wallet has 1 gold coin; trying to transfer 5 fails
    val transferTx = wallet.sendAskGoldCoinsTransfer(
        owner.address,
        0,
        5,
        receiver.address,
        null,
        { value: ton("1") },
    );

    expect(transferTx).toHaveFailedTx({
        to: wallet.address,
        exitCode: Errors.BalanceError,
    });
}
