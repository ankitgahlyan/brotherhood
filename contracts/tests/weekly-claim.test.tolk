import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@acton/testing/expect"

import "@wrappers/FossFiWallet.gen"
import "@wrappers/utils"

import "@contracts/common/errors"
import "@contracts/common/messages"
import "@contracts/fossFi/consts"

import "test-utils"

get fun `test weekly claim: before activation wait fails with WaitMore`() {
    val (minter, owner, _outsider) = setupTest();
    val user = testing.treasury("claim-user-1");

    val activeWallet = activateUser(minter, userWallet(minter, owner.address), owner, user.address);

    // Set time to 1 day after accountInit (less than 7 days ACTIVATION_WAIT)
    testing.setNow(1_800_000_000 + 86400);

    val claimTx = activeWallet.sendActClaimWeeklyGrant(
        user.address,
        0,
        null,
        { value: ton("1") },
    );

    expect(claimTx).toHaveFailedTx({
        to: activeWallet.address,
        exitCode: Errors.WaitMore,
    });
}

get fun `test weekly claim: after activation wait mints fixed 11111 FI without receivedVotes boost`() {
    val (minter, owner, _outsider) = setupTest();
    val user = testing.treasury("claim-user-2");

    val activeWallet = activateUser(minter, userWallet(minter, owner.address), owner, user.address);

    // Advance time past activation wait (7 days)
    testing.setNow(1_800_000_000 + ACTIVATION_WAIT + 100);

    val balanceBefore = activeWallet.getJettonBalance();

    val claimTx = activeWallet.sendActClaimWeeklyGrant(
        user.address,
        0,
        null,
        { value: ton("1") },
    );

    expect(claimTx).toHaveSuccessfulTx<ActClaimWeeklyGrant>({
        from: user.address,
        to: activeWallet.address,
    });

    val balanceAfter = activeWallet.getJettonBalance();
    expect(balanceAfter - balanceBefore).toEqual(WEEKLY_CLAIM_AMOUNT);
}

get fun `test weekly claim: claiming twice in same period fails with WaitMore`() {
    val (minter, owner, _outsider) = setupTest();
    val user = testing.treasury("claim-user-3");

    val activeWallet = activateUser(minter, userWallet(minter, owner.address), owner, user.address);

    testing.setNow(1_800_000_000 + ACTIVATION_WAIT + 100);

    activeWallet.sendActClaimWeeklyGrant(
        user.address,
        0,
        null,
        { value: ton("1") },
    );

    // Attempt second claim 1 hour later
    testing.setNow(1_800_000_000 + ACTIVATION_WAIT + 3700);

    val claimTx2 = activeWallet.sendActClaimWeeklyGrant(
        user.address,
        0,
        null,
        { value: ton("1") },
    );

    expect(claimTx2).toHaveFailedTx({
        to: activeWallet.address,
        exitCode: Errors.WaitMore,
    });
}
