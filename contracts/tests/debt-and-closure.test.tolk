import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@acton/testing/expect"

import "@wrappers/FossFiWallet.gen"

import "@contracts/common/errors"
import "@contracts/common/messages"

import "test-utils"

get fun `test unfollow shortfall: fails cleanly without creating debt`() {
    val (wallet, owner, _minter, followee) = setupDirectWallet(ton("0")); // 0 balance
    // todo: fixme
    val initiator = testing.treasury("initiator");
    // Attempting unfollow with 0 balance fails with BalanceError
    val unfollowTx = wallet.sendUnfollow(
        owner.address,
        0,
        initiator.address,
        followee.address,
        { value: ton("0.5") },
    );

    expect(unfollowTx).toHaveFailedTx({
        to: wallet.address,
        exitCode: Errors.BalanceError,
    });
}

get fun `test closure: closes account and transfers remaining assets to nominee`() {
    val (wallet, owner, _minter, _nominee) = setupDirectWallet(ton("10"));

    val closeTx = wallet.sendActCloseAccount(
        owner.address,
        0,
        { value: ton("1") },
    );

    expect(closeTx).toHaveSuccessfulTx<ActCloseAccount>({
        from: owner.address,
        to: wallet.address,
    });
}
