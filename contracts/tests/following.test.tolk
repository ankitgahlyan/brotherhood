import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@acton/testing/expect"
import "@acton/types/transaction"

import "@wrappers/FossFi.gen"
import "@wrappers/FossFiWallet.gen"
import "@wrappers/utils"
import "@contracts/common/errors"
import "@contracts/common/messages"
import "@contracts/followers/messages"
import "@contracts/fossFi/consts"
import "@contracts/fossFi/storage"

import "test-utils"

fun followingsOf(wallet: FossFiWallet, target: address): bool {
    val social = wallet.getWalletDataAll().maps.load().social.load();
    return social.followings.get(target).isFound;
}

fun sendFollow(
    wallet: FossFiWallet,
    from: address,
    followee: address,
    queryId: uint64 = 1,
): SendResultList {
    return wallet.sendUnFollow(from, queryId, true, followee, { value: ton("0.3") });
}

fun sendUnfollow(
    wallet: FossFiWallet,
    from: address,
    followee: address,
    queryId: uint64 = 0,
): SendResultList {
    return wallet.sendUnFollow(from, queryId, false, followee, { value: ton("0.3") });
}

get fun `test follow: following mints FI and records the link`() {
    val (minter, deployer, notDeployer) = setupTest();
    val wallet = userWallet(minter, deployer.address);
    val target = userWallet(minter, notDeployer.address).address;
    val balanceBefore = wallet.getJettonBalance();
    val supplyBefore = minter.getTotalSupply();

    val res = sendFollow(wallet, deployer.address, notDeployer.address);
    expect(res).toHaveSuccessfulTx<UnFollow>({
        from: deployer.address,
        to: wallet.address,
    });

    expect(wallet.getJettonBalance()).toEqual(balanceBefore + FOLLOW_MINT_AMOUNT);
    expect(minter.getTotalSupply()).toEqual(supplyBefore + FOLLOW_MINT_AMOUNT);
    expect(followingsOf(wallet, target)).toBeTrue();
}

get fun `test follow: unfollow burns exactly the minted amount and removes the link`() {
    val (minter, deployer, notDeployer) = setupTest();
    val wallet = userWallet(minter, deployer.address);
    val target = userWallet(minter, notDeployer.address).address;
    val balanceBefore = wallet.getJettonBalance();
    val supplyBefore = minter.getTotalSupply();

    sendFollow(wallet, deployer.address, notDeployer.address);
    val res = sendUnfollow(wallet, deployer.address, notDeployer.address);
    expect(res).toHaveSuccessfulTx<UnFollow>({
        from: deployer.address,
        to: wallet.address,
    });

    expect(wallet.getJettonBalance()).toEqual(balanceBefore);
    expect(minter.getTotalSupply()).toEqual(supplyBefore);
    expect(followingsOf(wallet, target)).toBeFalse();
}

get fun `test follow: cannot follow twice`() {
    val (minter, deployer, notDeployer) = setupTest();
    val wallet = userWallet(minter, deployer.address);

    sendFollow(wallet, deployer.address, notDeployer.address);
    val res = sendFollow(wallet, deployer.address, notDeployer.address);
    expect(res).toHaveFailedTx<UnFollow>({
        from: deployer.address,
        to: wallet.address,
        exitCode: Errors.ConnectionExists,
    });
}

get fun `test follow: unfollow without a link fails cleanly`() {
    val (minter, deployer, notDeployer) = setupTest();
    val wallet = userWallet(minter, deployer.address);
    val balanceBefore = wallet.getJettonBalance();
    val supplyBefore = minter.getTotalSupply();

    val res = sendUnfollow(wallet, deployer.address, notDeployer.address);
    expect(res).toHaveFailedTx<UnFollow>({
        from: deployer.address,
        to: wallet.address,
        exitCode: Errors.NotFollowing,
    });

    expect(wallet.getJettonBalance()).toEqual(balanceBefore);
    expect(minter.getTotalSupply()).toEqual(supplyBefore);
}

get fun `test follow: unfollow with insufficient balance fails without corrupting state`() {
    val (minter, deployer, notDeployer) = setupTest();
    val wallet = userWallet(minter, deployer.address);
    val target = userWallet(minter, notDeployer.address).address;
    val supplyBefore = minter.getTotalSupply();

    sendFollow(wallet, deployer.address, notDeployer.address);
    expect(wallet.getJettonBalance()).toEqual(ton("1001"));

    // burn most of the balance so the link's minted amount can no longer be repaid
    val burn = wallet.sendAskToBurn(
        deployer.address,
        0,
        ton("2"),
        deployer.address,
        null,
        { bounce: false, value: DEFAULT_BURN_MSG_VALUE },
    );
    expect(burn).toHaveSuccessfulTx<AskToBurn>({
        from: deployer.address,
        to: wallet.address,
    });
    expect(wallet.getJettonBalance()).toEqual(ton("999"));

    val res = sendUnfollow(wallet, deployer.address, notDeployer.address);
    expect(res).toHaveFailedTx<UnFollow>({
        from: deployer.address,
        to: wallet.address,
        exitCode: Errors.BalanceError,
    });

    expect(wallet.getJettonBalance()).toEqual(ton("999"));
    expect(minter.getTotalSupply()).toEqual(supplyBefore + FOLLOW_MINT_AMOUNT - ton("2"));
    expect(followingsOf(wallet, target)).toBeTrue();
}

get fun `test follow: only the owner can follow`() {
    val (minter, deployer, notDeployer) = setupTest();
    val wallet = userWallet(minter, deployer.address);

    val res = sendFollow(wallet, notDeployer.address, notDeployer.address);
    expect(res).toHaveFailedTx<UnFollow>({
        from: notDeployer.address,
        to: wallet.address,
        exitCode: Errors.IncorrectSender,
    });
}
