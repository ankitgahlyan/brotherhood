import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@acton/testing/expect"

import "@wrappers/FossFiWallet.gen"
import "@wrappers/utils"

import "@contracts/common/messages"
import "@contracts/followers/messages"
import "@contracts/fossFi/consts"
import "@contracts/fossFi/storage"

import "test-utils"

get fun `test unfollow shortfall: followee with insufficient balance incurs debt`() {
    val (minter, deployer, notDeployer) = setupTest();
    val followerWallet = userWallet(minter, deployer.address);
    val followeeWallet = activateUser(minter, followerWallet, deployer, notDeployer.address);

    // Follower follows followee -> followee receives 1000 FI
    followerWallet.sendFollow(deployer.address, 1, followeeWallet.address, { value: ton("0.6") });
    expect(followeeWallet.getFollowersCount()).toEqual(1);

    // Followee spends all 1000 FI + initial balance down to 0
    val followeeBal = followeeWallet.getJettonBalance();
    followeeWallet.sendAskToBurn(
        notDeployer.address,
        0,
        followeeBal,
        notDeployer.address,
        null,
        { bounce: false, value: DEFAULT_BURN_MSG_VALUE },
    );
    expect(followeeWallet.getJettonBalance()).toEqual(0);

    // Unfollow occurs -> followee incurs 1000 FI debt
    val unfollowTx = followerWallet.sendUnfollow(
        deployer.address,
        0,
        deployer.address,
        followeeWallet.address,
        { value: ton("0.6") },
    );
    expect(unfollowTx).toHaveSuccessfulTx<Unfollow>({
        from: deployer.address,
        to: followerWallet.address,
    });

    val followeeData = followeeWallet.getWalletDataAll();
    expect(followeeData.jettonBalance).toEqual(0);
    expect(followeeData.debt).toEqual(FOLLOW_MINT_AMOUNT);
    expect(followeeData.debts).toBeTrue();
}

get fun `test closure: closes account and transfers remaining assets to nominee`() {
    val (minter, deployer, notDeployer) = setupTest();
    val ownerWallet = userWallet(minter, deployer.address);
    val _nomineeWallet = activateUser(minter, ownerWallet, deployer, notDeployer.address);

    val closeTx = ownerWallet.sendActCloseAccount(
        deployer.address,
        0,
        { value: ton("1") },
    );

    expect(closeTx).toHaveSuccessfulTx<ActCloseAccount>({
        from: deployer.address,
        to: ownerWallet.address,
    });
}
