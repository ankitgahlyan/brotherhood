import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@acton/testing/expect"

import "@wrappers/FossFiWallet.gen"
import "@wrappers/utils"

import "@contracts/common/errors"
import "@contracts/common/messages"
import "@contracts/fossFi/consts"

import "test-utils"

get fun `test monthly due: owner pays 2500 FI on time after 30 days`() {
    testing.setNow(1_800_000_000);
    val (wallet, owner, _minter, _outsider) = setupDirectWallet(ton("5000"));
    val balanceBefore = wallet.getJettonBalance();

    // Advance time by 30 days (1 month)
    testing.setNow(1_800_000_000 + DECAY_MONTH_SECONDS + 10);

    val payTx = wallet.sendActPayEmi(
        owner.address,
        0,
        owner.address,
        { value: ton("0.1") },
    );

    expect(payTx).toHaveSuccessfulTx<ActPayEmi>({
        from: owner.address,
        to: wallet.address,
    });

    // Balance reduced by EMI_AMOUNT (2500 FI)
    expect(wallet.getJettonBalance()).toEqual(balanceBefore - EMI_AMOUNT);
}

get fun `test monthly due: paying before 30 days fails with WaitMore`() {
    testing.setNow(1_800_000_000);
    val (wallet, owner, _minter, _outsider) = setupDirectWallet(ton("5000"));

    // Advance time by only 15 days
    testing.setNow(1_800_000_000 + (DECAY_MONTH_SECONDS / 2));

    val payTx = wallet.sendActPayEmi(
        owner.address,
        0,
        owner.address,
        { value: ton("0.1") },
    );

    expect(payTx).toHaveFailedTx({
        to: wallet.address,
        exitCode: Errors.WaitMore,
    });
}

get fun `test monthly due: paying with insufficient balance fails with InsufficientBalance`() {
    testing.setNow(1_800_000_000);
    val (wallet, owner, _minter, _outsider) = setupDirectWallet(ton("1000"));

    // Advance time by 30 days
    testing.setNow(1_800_000_000 + DECAY_MONTH_SECONDS + 10);

    val payTx = wallet.sendActPayEmi(
        owner.address,
        0,
        owner.address,
        { value: ton("0.1") },
    );

    expect(payTx).toHaveFailedTx({
        to: wallet.address,
        exitCode: Errors.InsufficientBalance,
    });
}

get fun `test overdue EMI: keeper triggers default, burns balance, adds shortfall to debt with 5 percent penalty`() {
    testing.setNow(1_800_000_000);
    val (wallet, _owner, _minter, outsider) = setupDirectWallet(ton("1000"));
    val balanceBefore = wallet.getJettonBalance();

    // Advance time past 30 days + 24 hours grace (e.g. +30 hours)
    testing.setNow(1_800_000_000 + DECAY_MONTH_SECONDS + EMI_GRACE_PERIOD + 3600);

    val defaultTx = wallet.sendTriggerDefaultEmi(
        outsider.address,
        0,
        outsider.address,
        { value: ton("0.1") },
    );

    expect(defaultTx).toHaveSuccessfulTx<TriggerDefaultEmi>({
        from: outsider.address,
        to: wallet.address,
    });

    val walletData = wallet.getWalletDataAll();
    // Available balance burned
    expect(walletData.jettonBalance).toEqual(0);

    val expectedShortfall = EMI_AMOUNT - balanceBefore;
    val expectedPenalty = expectedShortfall * 5 / 100;
    val expectedTotalDebt = expectedShortfall + expectedPenalty;

    expect(walletData.debt).toEqual(expectedTotalDebt);
    expect(walletData.debts).toEqual(true);
}

get fun `test legacy TriggerDecay: works as keeper trigger for backward compatibility`() {
    testing.setNow(1_800_000_000);
    val (wallet, _owner, _minter, outsider) = setupDirectWallet(ton("5000"));
    val balanceBefore = wallet.getJettonBalance();

    // Advance time by 30 days
    testing.setNow(1_800_000_000 + DECAY_MONTH_SECONDS + 10);

    val triggerTx = wallet.sendTriggerDecay(
        outsider.address,
        outsider.address,
        { value: ton("0.1") },
    );

    expect(triggerTx).toHaveSuccessfulTx<TriggerDecay>({
        from: outsider.address,
        to: wallet.address,
    });

    expect(wallet.getJettonBalance()).toEqual(balanceBefore - EMI_AMOUNT);
}
