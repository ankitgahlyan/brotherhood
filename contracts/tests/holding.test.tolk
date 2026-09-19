import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@acton/testing/expect"

import "@gen/Holding.code"
import "@wrappers/FossFi.gen"
import "@wrappers/FossFiWallet.gen"
import "@wrappers/Holding.gen"
import "@wrappers/utils"
import "@contracts/common/errors"
import "@contracts/fossFi/storage"

import "@contracts/holding/consts"
import "@contracts/holding/holding-utils"
import "@contracts/holding/messages"

import "test-utils"

fun setupHoldingTest(): (FossFi, Treasury, Treasury, FossFiWallet, FossFiWallet) {
    val (minter, deployer, notDeployer) = setupTest();
    val payerWallet = userWallet(minter, deployer.address);
    val payeeWallet = activateUser(minter, payerWallet, deployer, notDeployer.address);
    return (minter, deployer, notDeployer, payerWallet, payeeWallet);
}

get fun `test deferred payment: pull rejected when allowDeferred is false by default`() {
    val (_minter, deployer, notDeployer, payerWallet, payeeWallet) = setupHoldingTest();

    val amount = ton("100");
    val res = payeeWallet.sendRequestDeferredPayment(
        notDeployer.address,
        1,
        deployer.address,
        amount,
        { value: ton("0.4") },
    );
    expect(res).toHaveFailedTx<PullDeferredFunds>({
        from: payeeWallet.address,
        to: payerWallet.address,
        exitCode: Errors.DeferredPaymentDisabled,
    });
}

get fun `test deferred payment: owner can toggle allowDeferred`() {
    val (_minter, deployer, _notDeployer, payerWallet, _payeeWallet) = setupHoldingTest();

    expect(payerWallet.getWalletDataAll().allowDeferred).toBeFalse();

    val toggleTx = payerWallet.sendToggleDeferredPayment(
        deployer.address,
        1,
        true,
        { value: ton("0.1") },
    );
    expect(toggleTx).toHaveAllSuccessfulTxs();
    expect(payerWallet.getWalletDataAll().allowDeferred).toBeTrue();

    val toggleOffTx = payerWallet.sendToggleDeferredPayment(
        deployer.address,
        2,
        false,
        { value: ton("0.1") },
    );
    expect(toggleOffTx).toHaveAllSuccessfulTxs();
    expect(payerWallet.getWalletDataAll().allowDeferred).toBeFalse();
}

get fun `test deferred payment: pull creates holding, deducts balance from payer`() {
    val (_minter, deployer, notDeployer, payerWallet, payeeWallet) = setupHoldingTest();
    payerWallet.sendToggleDeferredPayment(deployer.address, 0, true, { value: ton("0.1") });

    val payerBalanceBefore = payerWallet.getJettonBalance();
    val amount = ton("100");

    val res = payeeWallet.sendRequestDeferredPayment(
        notDeployer.address,
        1,
        deployer.address,
        amount,
        { value: ton("0.4") },
    );
    expect(res).toHaveAllSuccessfulTxs();

    // Payer's balance was deducted by amount
    expect(payerWallet.getJettonBalance()).toEqual(payerBalanceBefore - amount);
}

get fun `test deferred payment: early claim fails with WaitMore`() {
    val (_minter, deployer, notDeployer, payerWallet, payeeWallet) = setupHoldingTest();
    payerWallet.sendToggleDeferredPayment(deployer.address, 0, true, { value: ton("0.1") });

    val amount = ton("50");
    payeeWallet.sendRequestDeferredPayment(
        notDeployer.address,
        1,
        deployer.address,
        amount,
        { value: ton("0.4") },
    );

    val createdAt = testing.getNow();
    val holdingAddr = calculateHoldingAddress(
        payerWallet.address,
        payeeWallet.address,
        holdingCompiledCodeLibraryRef(),
        amount,
        createdAt,
    );

    val _holding = Holding.fromAddress(holdingAddr);

    // Try claiming immediately (0 seconds elapsed)
    val resEarly = payeeWallet.sendActClaimDeferredPayment(
        notDeployer.address,
        1,
        holdingAddr,
        { value: ton("0.2") },
    );
    expect(resEarly).toHaveFailedTx<ClaimDeferredPayment>({
        from: payeeWallet.address,
        to: holdingAddr,
        exitCode: Errors.WaitMore,
    });
}

get fun `test deferred payment: claim after 72 hours transfers funds to payee and destroys holding`() {
    val (_minter, deployer, notDeployer, payerWallet, payeeWallet) = setupHoldingTest();
    payerWallet.sendToggleDeferredPayment(deployer.address, 0, true, { value: ton("0.1") });

    val payeeBalanceBefore = payeeWallet.getJettonBalance();
    val amount = ton("50");

    payeeWallet.sendRequestDeferredPayment(
        notDeployer.address,
        1,
        deployer.address,
        amount,
        { value: ton("0.4") },
    );

    val createdAt = testing.getNow();
    val holdingAddr = calculateHoldingAddress(
        payerWallet.address,
        payeeWallet.address,
        holdingCompiledCodeLibraryRef(),
        amount,
        createdAt,
    );

    // Fast-forward time past 72 hours
    testing.setNow(createdAt + HOLDING_CHALLENGE_DURATION + 10);

    val resClaim = payeeWallet.sendActClaimDeferredPayment(
        notDeployer.address,
        1,
        holdingAddr,
        { value: ton("0.2") },
    );
    expect(resClaim).toHaveAllSuccessfulTxs();

    // Payee received the funds
    expect(payeeWallet.getJettonBalance()).toEqual(payeeBalanceBefore + amount);
}

get fun `test deferred payment: cancel by payer refunds 1x and penalizes payee with 1x burn`() {
    val (minter, deployer, notDeployer, payerWallet, payeeWallet) = setupHoldingTest();
    payerWallet.sendToggleDeferredPayment(deployer.address, 0, true, { value: ton("0.1") });

    val payerBalanceBefore = payerWallet.getJettonBalance();
    val payeeBalanceBefore = payeeWallet.getJettonBalance();
    val supplyBefore = minter.getTotalSupply();
    val amount = ton("100");

    payeeWallet.sendRequestDeferredPayment(
        notDeployer.address,
        1,
        deployer.address,
        amount,
        { value: ton("0.4") },
    );

    val createdAt = testing.getNow();
    val holdingAddr = calculateHoldingAddress(
        payerWallet.address,
        payeeWallet.address,
        holdingCompiledCodeLibraryRef(),
        amount,
        createdAt,
    );

    // Payer cancels during the 72-hour window
    val resCancel = payerWallet.sendActCancelDeferredPayment(
        deployer.address,
        1,
        holdingAddr,
        { value: ton("0.3") },
    );
    expect(resCancel).toHaveAllSuccessfulTxs();

    // Payer balance is fully refunded
    expect(payerWallet.getJettonBalance()).toEqual(payerBalanceBefore);

    // Payee available balance was burned to zero, and deficit became debt
    expect(payeeWallet.getJettonBalance()).toEqual(0);
    val payeeData = payeeWallet.getWalletDataAll();
    expect(payeeData.debt > 0).toEqual(true);
    expect(payeeData.debt).toEqual(amount - payeeBalanceBefore);
    expect(minter.getTotalSupply()).toEqual(supplyBefore - payeeBalanceBefore);
}

get fun `test deferred payment: unauthenticated penalty message rejected`() {
    val (_minter, _deployer, _notDeployer, payerWallet, payeeWallet) = setupHoldingTest();

    val amount = ton("100");
    val createdAt = testing.getNow();

    // Send PenalizeDeferredRequester directly from an attacker address
    val attacker = testing.treasury("attacker");
    val penaltyMsg = createMessage({
        bounce: BounceMode.NoBounce,
        dest: payeeWallet.address,
        value: ton("0.1"),
        body: PenalizeDeferredRequester {
            queryId: 1,
            payer: payerWallet.address,
            amount,
            createdAt,
        },
    });
    val res = net.send(attacker.address, penaltyMsg);
    expect(res).toHaveFailedTx<PenalizeDeferredRequester>({
        from: attacker.address,
        to: payeeWallet.address,
        exitCode: Errors.IncorrectSender,
    });
}

get fun `test deferred payment: fallback reclaim after 30 days`() {
    val (_minter, deployer, notDeployer, payerWallet, payeeWallet) = setupHoldingTest();
    payerWallet.sendToggleDeferredPayment(deployer.address, 0, true, { value: ton("0.1") });

    val payerBalanceBefore = payerWallet.getJettonBalance();
    val amount = ton("50");

    payeeWallet.sendRequestDeferredPayment(
        notDeployer.address,
        1,
        deployer.address,
        amount,
        { value: ton("0.4") },
    );

    val createdAt = testing.getNow();
    val holdingAddr = calculateHoldingAddress(
        payerWallet.address,
        payeeWallet.address,
        holdingCompiledCodeLibraryRef(),
        amount,
        createdAt,
    );

    // Fast-forward time past 30 days
    testing.setNow(createdAt + HOLDING_FALLBACK_DURATION + 10);

    val resFallback = payerWallet.sendActFallbackReclaim(
        deployer.address,
        1,
        holdingAddr,
        { value: ton("0.2") },
    );
    expect(resFallback).toHaveAllSuccessfulTxs();

    // Payer recovers funds without any penalty
    expect(payerWallet.getJettonBalance()).toEqual(payerBalanceBefore);
}
