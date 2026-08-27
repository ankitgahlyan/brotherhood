import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@acton/testing/expect"

import "@wrappers/FossFiWallet.gen"
import "@wrappers/utils"
import "@contracts/common/errors"
import "@contracts/common/messages"
import "@contracts/followers/consts"
import "@contracts/fossFi/storage"

import "test-utils"

fun allowanceEntryOf(wallet: FossFiWallet, grantee: address): (bool, coins) {
    val entry = wallet.getWalletDataAll().maps.load().allowances.get(grantee);
    if (!entry.isFound) {
        return (false, 0);
    }
    return (true, entry.loadValue());
}

fun sendSetAllowance(
    wallet: FossFiWallet,
    from: address,
    grantee: address,
    amount: coins,
    queryId: uint64 = 1,
): SendResultList {
    return wallet.sendSetAllowance(from, queryId, grantee, amount, { value: ton("0.3") });
}

fun sendSpend(
    wallet: FossFiWallet,
    from: address,
    amount: coins,
    receiver: address,
    sendExcessesTo: address,
    queryId: uint64 = 1,
): SendResultList {
    return wallet.sendSpendAllowance(
        from,
        queryId,
        amount,
        receiver,
        sendExcessesTo,
        { value: ton("0.3") },
    );
}

get fun `test allowance: only the owner can grant an allowance`() {
    val (minter, deployer, notDeployer) = setupTest();
    val wallet = userWallet(minter, deployer.address);

    val res = sendSetAllowance(wallet, notDeployer.address, notDeployer.address, ton("5"));
    expect(res).toHaveFailedTx<SetAllowance>({
        from: notDeployer.address,
        to: wallet.address,
        exitCode: Errors.NotOwner,
    });
    expect(allowanceEntryOf(wallet, notDeployer.address)).toEqual((false, 0));
}

get fun `test allowance: grant records the spendable amount`() {
    val (minter, deployer, notDeployer) = setupTest();
    val wallet = userWallet(minter, deployer.address);

    val res = sendSetAllowance(wallet, deployer.address, notDeployer.address, ton("10"));
    expect(res).toHaveSuccessfulTx<SetAllowance>({
        from: deployer.address,
        to: wallet.address,
    });
    expect(allowanceEntryOf(wallet, notDeployer.address)).toEqual((true, ton("10")));
}

get fun `test allowance: revoke with amount zero removes the grant`() {
    val (minter, deployer, notDeployer) = setupTest();
    val wallet = userWallet(minter, deployer.address);

    sendSetAllowance(wallet, deployer.address, notDeployer.address, ton("10"));
    val (exists, _) = allowanceEntryOf(wallet, notDeployer.address);
    expect(exists).toBeTrue();

    val res = sendSetAllowance(wallet, deployer.address, notDeployer.address, 0);
    expect(res).toHaveSuccessfulTx<SetAllowance>({
        from: deployer.address,
        to: wallet.address,
    });
    expect(allowanceEntryOf(wallet, notDeployer.address)).toEqual((false, 0));
}

get fun `test allowance: re-grant overwrites the previous amount`() {
    val (minter, deployer, notDeployer) = setupTest();
    val wallet = userWallet(minter, deployer.address);

    sendSetAllowance(wallet, deployer.address, notDeployer.address, ton("10"));
    sendSetAllowance(wallet, deployer.address, notDeployer.address, ton("25"));
    expect(allowanceEntryOf(wallet, notDeployer.address)).toEqual((true, ton("25")));
}

get fun `test allowance: grantee can spend and the allowance decrements`() {
    val (minter, deployer, notDeployer) = setupTest();
    val grantor = mintTo(minter, deployer, deployer.address, ton("100"));
    val grantee = activateUser(minter, grantor, deployer, notDeployer.address);
    val balanceBefore = grantor.getJettonBalance();
    sendSetAllowance(grantor, deployer.address, notDeployer.address, ton("10"));

    val res = sendSpend(
        grantor,
        notDeployer.address,
        ton("4"),
        notDeployer.address,
        notDeployer.address,
    );
    expect(res).toHaveSuccessfulTx<SpendAllowance>({
        from: notDeployer.address,
        to: grantor.address,
    });

    expect(grantor.getJettonBalance()).toEqual(balanceBefore - ton("4"));
    expect(grantee.getJettonBalance()).toEqual(ton("1") + ton("4"));
    expect(allowanceEntryOf(grantor, notDeployer.address)).toEqual((true, ton("6")));
}

get fun `test allowance: spending exactly the full amount clears the entry`() {
    val (minter, deployer, notDeployer) = setupTest();
    val grantor = mintTo(minter, deployer, deployer.address, ton("100"));
    activateUser(minter, grantor, deployer, notDeployer.address);
    sendSetAllowance(grantor, deployer.address, notDeployer.address, ton("7"));

    val res = sendSpend(
        grantor,
        notDeployer.address,
        ton("7"),
        notDeployer.address,
        deployer.address,
    );
    expect(res).toHaveSuccessfulTx<SpendAllowance>({
        from: notDeployer.address,
        to: grantor.address,
    });
    expect(allowanceEntryOf(grantor, notDeployer.address)).toEqual((false, 0));
}

get fun `test allowance: non-grantee cannot spend`() {
    val (minter, deployer, notDeployer) = setupTest();
    val wallet = mintTo(minter, deployer, deployer.address, ton("100"));
    val balanceBefore = wallet.getJettonBalance();
    sendSetAllowance(wallet, deployer.address, notDeployer.address, ton("10"));

    val stranger = testing.treasury("stranger");
    val res = sendSpend(wallet, stranger.address, ton("1"), stranger.address, deployer.address);
    expect(res).toHaveFailedTx<SpendAllowance>({
        from: stranger.address,
        to: wallet.address,
        exitCode: FollowingErrors.NotFollowing,
    });
    expect(wallet.getJettonBalance()).toEqual(balanceBefore);
    expect(allowanceEntryOf(wallet, notDeployer.address)).toEqual((true, ton("10")));
}

get fun `test allowance: cannot spend more than the granted amount`() {
    val (minter, deployer, notDeployer) = setupTest();
    val wallet = mintTo(minter, deployer, deployer.address, ton("100"));
    sendSetAllowance(wallet, deployer.address, notDeployer.address, ton("10"));

    val res = sendSpend(
        wallet,
        notDeployer.address,
        ton("11"),
        notDeployer.address,
        deployer.address,
    );
    expect(res).toHaveFailedTx<SpendAllowance>({
        from: notDeployer.address,
        to: wallet.address,
        exitCode: Errors.InsufficientBalance,
    });
    expect(allowanceEntryOf(wallet, notDeployer.address)).toEqual((true, ton("10")));
}

get fun `test allowance: cannot spend more than the wallet balance`() {
    val (minter, deployer, notDeployer) = setupTest();
    val wallet = mintTo(minter, deployer, deployer.address, ton("3"));
    sendSetAllowance(wallet, deployer.address, notDeployer.address, ton("10"));

    val res = sendSpend(
        wallet,
        notDeployer.address,
        ton("5"),
        notDeployer.address,
        deployer.address,
    );
    expect(res).toHaveFailedTx<SpendAllowance>({
        from: notDeployer.address,
        to: wallet.address,
        exitCode: Errors.BalanceError,
    });
    expect(allowanceEntryOf(wallet, notDeployer.address)).toEqual((true, ton("10")));
}
