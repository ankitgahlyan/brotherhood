import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@acton/testing/expect"

import "@gen/Following.code"
import "@wrappers/Followers.gen"
import "@wrappers/FossFi.gen"
import "@wrappers/FossFiWallet.gen"
import "@wrappers/utils"
import "@contracts/common/errors"
import "@contracts/common/messages"
import "@contracts/followers/consts"
import "@contracts/followers/following-utils"
import "@contracts/followers/messages"
import "@contracts/followers/store"
import "@contracts/fossFi/consts"
import "@contracts/fossFi/storage"

import "test-utils"

fun sendFollow(
    wallet: FossFiWallet,
    from: address,
    followeeWalletAddr: address,
    queryId: uint64 = 1,
): SendResultList {
    return wallet.sendFollow(from, queryId, followeeWalletAddr, { value: ton("0.6") });
}

fun sendUnfollow(
    wallet: FossFiWallet,
    from: address,
    initiator: address,
    followeeWalletAddr: address,
    queryId: uint64 = 0,
): SendResultList {
    return wallet.sendUnfollow(from, queryId, initiator, followeeWalletAddr, { value: ton("0.6") });
}

fun setupFollowingTest(): (FossFi, Treasury, Treasury, FossFiWallet, FossFiWallet) {
    val (minter, deployer, notDeployer) = setupTest();
    val followerWallet = userWallet(minter, deployer.address);
    val followeeWallet = activateUser(minter, followerWallet, deployer, notDeployer.address);
    return (minter, deployer, notDeployer, followerWallet, followeeWallet);
}

get fun `test follow: follower deploys following child, followee receives 1000 FI and counters update`() {
    val (minter, deployer, _notDeployer, followerWallet, followeeWallet) = setupFollowingTest();

    val followerBalanceBefore = followerWallet.getJettonBalance();
    val followeeBalanceBefore = followeeWallet.getJettonBalance();
    val supplyBefore = minter.getTotalSupply();

    val res = sendFollow(followerWallet, deployer.address, followeeWallet.address);
    expect(res).toHaveAllSuccessfulTxs();

    // Follower balance remains unchanged, followee receives minted 1000 FI
    expect(followerWallet.getJettonBalance()).toEqual(followerBalanceBefore);
    expect(followeeWallet.getJettonBalance()).toEqual(followeeBalanceBefore + FOLLOW_MINT_AMOUNT);
    expect(minter.getTotalSupply()).toEqual(supplyBefore + FOLLOW_MINT_AMOUNT);

    expect(followerWallet.getFollowingCount()).toEqual(1);
    expect(followeeWallet.getFollowersCount()).toEqual(1);

    val followingChildAddr = calcDeployFollowing(
        followerWallet.address,
        followeeWallet.address,
        followingCompiledCodeLibraryRef(),
        FOLLOW_MINT_AMOUNT,
    ).calculateAddress();
    val followingChild = Followers.fromAddress(followingChildAddr);
    expect(followingChild.getIsFollowing()).toBeTrue();
}

get fun `test follow: following child contract data and lifecycle`() {
    val (_minter, deployer, _notDeployer, followerWallet, followeeWallet) = setupFollowingTest();

    sendFollow(followerWallet, deployer.address, followeeWallet.address);

    val followingChildAddr = calcDeployFollowing(
        followerWallet.address,
        followeeWallet.address,
        followingCompiledCodeLibraryRef(),
        FOLLOW_MINT_AMOUNT,
    ).calculateAddress();

    val followingChild = Followers.fromAddress(followingChildAddr);
    val data = followingChild.getFollowingData();
    expect(data.follower).toEqual(followerWallet.address);
    expect(data.followee).toEqual(followeeWallet.address);
    expect(data.mintAmount).toEqual(FOLLOW_MINT_AMOUNT);
    expect(data.isFollowing).toBeTrue();
}

get fun `test follow: unfollow burns 1000 FI from followee and decrements counters`() {
    val (minter, deployer, _notDeployer, followerWallet, followeeWallet) = setupFollowingTest();

    val followeeBalanceBefore = followeeWallet.getJettonBalance();
    val supplyBefore = minter.getTotalSupply();

    sendFollow(followerWallet, deployer.address, followeeWallet.address);
    val res = sendUnfollow(
        followerWallet,
        deployer.address,
        deployer.address,
        followeeWallet.address,
    );
    expect(res).toHaveSuccessfulTx<Unfollow>({
        from: deployer.address,
        to: followerWallet.address,
    });

    // Followee balance and supply are restored after unfollow burn
    expect(followeeWallet.getJettonBalance()).toEqual(followeeBalanceBefore);
    expect(minter.getTotalSupply()).toEqual(supplyBefore);

    expect(followerWallet.getFollowingCount()).toEqual(0);
    expect(followeeWallet.getFollowersCount()).toEqual(0);

    val followingChildAddr = calcDeployFollowing(
        followerWallet.address,
        followeeWallet.address,
        followingCompiledCodeLibraryRef(),
        FOLLOW_MINT_AMOUNT,
    ).calculateAddress();
    val followingChild = Followers.fromAddress(followingChildAddr);
    expect(followingChild.getIsFollowing()).toBeFalse();
}

get fun `test follow: following an already followed followee bounces and rolls back state`() {
    val (minter, deployer, _notDeployer, followerWallet, followeeWallet) = setupFollowingTest();

    // Initial follow
    sendFollow(followerWallet, deployer.address, followeeWallet.address);
    expect(followerWallet.getFollowingCount()).toEqual(1);
    expect(followeeWallet.getFollowersCount()).toEqual(1);
    val followeeBalanceAfterFirst = followeeWallet.getJettonBalance();
    val supplyAfterFirst = minter.getTotalSupply();

    // Duplicate follow attempt
    sendFollow(followerWallet, deployer.address, followeeWallet.address);

    // State rolls back to 1 follow, no extra tokens minted
    expect(followerWallet.getFollowingCount()).toEqual(1);
    expect(followeeWallet.getFollowersCount()).toEqual(1);
    expect(followeeWallet.getJettonBalance()).toEqual(followeeBalanceAfterFirst);
    expect(minter.getTotalSupply()).toEqual(supplyAfterFirst);
}

get fun `test follow: unfollowing a non-followed followee bounces and rolls back state`() {
    val (minter, deployer, _notDeployer, followerWallet, followeeWallet) = setupFollowingTest();

    val followeeBalanceBefore = followeeWallet.getJettonBalance();
    val supplyBefore = minter.getTotalSupply();

    // Unfollow without following first
    val res = sendUnfollow(
        followerWallet,
        deployer.address,
        deployer.address,
        followeeWallet.address,
    );
    expect(res).toHaveFailedTx<Unfollow>({
        from: deployer.address,
        to: followerWallet.address,
        exitCode: FollowingErrors.NotFollowing,
    });

    // State remains 0, no tokens burned
    expect(followerWallet.getFollowingCount()).toEqual(0);
    expect(followeeWallet.getFollowersCount()).toEqual(0);
    expect(followeeWallet.getJettonBalance()).toEqual(followeeBalanceBefore);
    expect(minter.getTotalSupply()).toEqual(supplyBefore);
}

get fun `test follow: following inactive account bounces and rolls back followingCount`() {
    val (minter, deployer, notDeployer, followerWallet, inactiveFollowee) = setupFollowingTest();

    // Deactivate followee
    followerWallet.sendActDeactivate(deployer.address, notDeployer.address, { value: ton("0.1") });

    val followerBalanceBefore = followerWallet.getJettonBalance();
    val supplyBefore = minter.getTotalSupply();

    sendFollow(followerWallet, deployer.address, inactiveFollowee.address);

    // Followee rejects and bounces back to follower, reverting followingCount
    expect(followerWallet.getFollowingCount()).toEqual(0);
    expect(followerWallet.getJettonBalance()).toEqual(followerBalanceBefore);
    expect(minter.getTotalSupply()).toEqual(supplyBefore);
}

get fun `test follow: unfollowing inactive account bounces and rolls back followingCount`() {
    val (_minter, deployer, notDeployer, followerWallet, followeeWallet) = setupFollowingTest();

    sendFollow(followerWallet, deployer.address, followeeWallet.address);
    expect(followerWallet.getFollowingCount()).toEqual(1);
    expect(followeeWallet.getFollowersCount()).toEqual(1);

    // Followee becomes inactive
    followerWallet.sendActDeactivate(deployer.address, notDeployer.address, { value: ton("0.1") });

    // Unfollow request bounces from inactive followee
    sendUnfollow(followerWallet, deployer.address, deployer.address, followeeWallet.address);

    // FollowingCount is rolled back to 1
    expect(followerWallet.getFollowingCount()).toEqual(1);
}

get fun `test follow: only the owner can initiate a follow`() {
    val (_minter, _deployer, notDeployer, followerWallet, followeeWallet) = setupFollowingTest();

    val res = sendFollow(followerWallet, notDeployer.address, followeeWallet.address);
    expect(res).toHaveFailedTx<Follow>({
        from: notDeployer.address,
        to: followerWallet.address,
        exitCode: Errors.IncorrectSender,
    });
}

get fun `test follow: cannot follow self`() {
    val (_minter, deployer, _notDeployer, followerWallet, _followeeWallet) = setupFollowingTest();

    val res = sendFollow(followerWallet, deployer.address, followerWallet.address);
    expect(res).toHaveFailedTx<Follow>({
        from: deployer.address,
        to: followerWallet.address,
        exitCode: Errors.IncorrectReceiver,
    });
}

get fun `test follow: survivor settlement on follower death burns from living followee`() {
    val (minter, deployer, _notDeployer, followerWallet, followeeWallet) = setupFollowingTest();

    val followeeBalanceBefore = followeeWallet.getJettonBalance();
    val supplyBefore = minter.getTotalSupply();

    sendFollow(followerWallet, deployer.address, followeeWallet.address);
    expect(followeeWallet.getJettonBalance()).toEqual(followeeBalanceBefore + FOLLOW_MINT_AMOUNT);

    // Follower dies/closes -> settlement burn sent to living followee
    val settleRes = followeeWallet.sendSettleDeath(
        followerWallet.address,
        1,
        deployer.address,
        { value: ton("0.2") },
    );
    expect(settleRes).toHaveSuccessfulTx<SettleDeath>({
        from: followerWallet.address,
        to: followeeWallet.address,
    });

    expect(followeeWallet.getJettonBalance()).toEqual(followeeBalanceBefore);
    expect(minter.getTotalSupply()).toEqual(supplyBefore);
    expect(followeeWallet.getFollowersCount()).toEqual(0);
}

get fun `test follow: survivor settlement with insufficient balance creates debt on living wallet`() {
    val (_minter, deployer, notDeployer, followerWallet, followeeWallet) = setupFollowingTest();

    sendFollow(followerWallet, deployer.address, followeeWallet.address);

    // Followee spends all tokens down to 100 FI
    val currentBalance = followeeWallet.getJettonBalance();
    val burnExcess = followeeWallet.sendAskToBurn(
        notDeployer.address,
        0,
        currentBalance - ton("100"),
        notDeployer.address,
        null,
        { bounce: false, value: DEFAULT_BURN_MSG_VALUE },
    );
    expect(burnExcess).toHaveSuccessfulTx<AskToBurn>({
        from: notDeployer.address,
        to: followeeWallet.address,
    });
    expect(followeeWallet.getJettonBalance()).toEqual(ton("100"));

    // Settlement burn arrives for 1000 FI: 100 FI burned, remaining 900 FI becomes debt
    val settleRes = followeeWallet.sendSettleDeath(
        followerWallet.address,
        1,
        deployer.address,
        { value: ton("0.2") },
    );
    expect(settleRes).toHaveSuccessfulTx<SettleDeath>({
        from: followerWallet.address,
        to: followeeWallet.address,
    });

    val walletData = followeeWallet.getWalletDataAll();
    expect(walletData.jettonBalance).toEqual(0);
    expect(walletData.debt).toEqual(ton("900"));
    expect(walletData.debts).toBeTrue();
}

get fun `test follow: unauthorized sender cannot trigger unfollow`() {
    val (_minter, _deployer, _notDeployer, followerWallet, followeeWallet) = setupFollowingTest();
    val randomAccount = testing.treasury("random");

    val res = followerWallet.sendUnfollow(
        randomAccount.address,
        0,
        randomAccount.address,
        followeeWallet.address,
        { value: ton("0.2") },
    );
    expect(res).toHaveFailedTx<Unfollow>({
        from: randomAccount.address,
        to: followerWallet.address,
        exitCode: Errors.IncorrectSender,
    });
}
