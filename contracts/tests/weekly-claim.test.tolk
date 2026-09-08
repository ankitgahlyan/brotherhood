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
    testing.setNow(1_800_000_000);
    val (minter, owner, _outsider) = setupTest();
    val user = testing.treasury("claim-user-1");

    val activeWallet = activateUser(minter, userWallet(minter, owner.address), owner, user.address);

    // Set time to 12 hours after accountInit (less than 1 day ACTIVATION_WAIT)
    testing.setNow(1_800_000_000 + 43200);

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

get fun `test weekly claim: after activation wait mints fixed 11111 FI when receivedVotes is 0`() {
    testing.setNow(1_800_000_000);
    val (minter, owner, _outsider) = setupTest();
    val user = testing.treasury("claim-user-2");

    val activeWallet = activateUser(minter, userWallet(minter, owner.address), owner, user.address);

    // Advance time past activation wait (1 day)
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

get fun `test weekly claim: within 2 years mints 11111 FI plus 10 FI per received vote`() {
    testing.setNow(1_800_000_000);
    val (minter, owner, _outsider) = setupTest();
    val rootWallet = userWallet(minter, owner.address);

    val candidate = testing.treasury("claim-cand");
    val voter = testing.treasury("claim-voter");

    val candidateWallet = activateUser(minter, rootWallet, owner, candidate.address);
    val voterWallet = activateUser(minter, rootWallet, owner, voter.address);

    // Voter casts 5 votes for candidate
    voterWallet.sendActVote(
        voter.address,
        candidate.address,
        5,
        { value: ton("0.2") },
    );
    expect(candidateWallet.getWalletDataAll().receivedVotes).toEqual(5);

    // Advance time past activation wait (1 day)
    testing.setNow(1_800_000_000 + ACTIVATION_WAIT + 100);

    val balanceBefore = candidateWallet.getJettonBalance();

    val claimTx = candidateWallet.sendActClaimWeeklyGrant(
        candidate.address,
        0,
        null,
        { value: ton("1") },
    );

    expect(claimTx).toHaveSuccessfulTx<ActClaimWeeklyGrant>({
        from: candidate.address,
        to: candidateWallet.address,
    });

    val balanceAfter = candidateWallet.getJettonBalance();
    // 11,111 FI base + (5 votes * 10 FI) = 11,161 FI
    val expectedMint = WEEKLY_CLAIM_AMOUNT + (5 * VOTE_GRANT_RATE);
    expect(balanceAfter - balanceBefore).toEqual(expectedMint);
}

get fun `test weekly claim: post 2-years mints 500 FI baseline floor plus reputation grant`() {
    testing.setNow(1_800_000_000);
    val (minter, owner, _outsider) = setupTest();
    val rootWallet = userWallet(minter, owner.address);

    val candidate = testing.treasury("claim-post2yr-cand");
    val voter = testing.treasury("claim-post2yr-voter");

    val candidateWallet = activateUser(minter, rootWallet, owner, candidate.address);
    val voterWallet = activateUser(minter, rootWallet, owner, voter.address);

    // Voter casts 8 votes for candidate
    voterWallet.sendActVote(
        voter.address,
        candidate.address,
        8,
        { value: ton("0.2") },
    );
    expect(candidateWallet.getWalletDataAll().receivedVotes).toEqual(8);

    // Advance time past 2 years (MAX_CLAIM_PERIOD + 100)
    testing.setNow(1_800_000_000 + MAX_CLAIM_PERIOD + 100);

    val balanceBefore = candidateWallet.getJettonBalance();

    val claimTx = candidateWallet.sendActClaimWeeklyGrant(
        candidate.address,
        0,
        null,
        { value: ton("1") },
    );

    expect(claimTx).toHaveSuccessfulTx<ActClaimWeeklyGrant>({
        from: candidate.address,
        to: candidateWallet.address,
    });

    val balanceAfter = candidateWallet.getJettonBalance();
    // 500 FI base floor + (8 votes * 10 FI = 80 FI) = 580 FI
    val expectedMint = POST_2YR_BASELINE_CLAIM + (8 * VOTE_GRANT_RATE);
    expect(balanceAfter - balanceBefore).toEqual(expectedMint);
}

get fun `test weekly claim: claiming twice in same period fails with WaitMore`() {
    testing.setNow(1_800_000_000);
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

    // Attempt second claim 1 day later (less than 7 days CLAIM_INTERVAL)
    testing.setNow(1_800_000_000 + ACTIVATION_WAIT + 86400);

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

get fun `test weekly claim: debt is automatically repaid first before crediting balance`() {
    testing.setNow(1_800_000_000);
    val (minter, deployer, notDeployer) = setupTest();
    val followerWallet = userWallet(minter, deployer.address);
    val followeeWallet = activateUser(minter, followerWallet, deployer, notDeployer.address);

    // Follower follows followee -> followee receives 1000 FI
    followerWallet.sendFollow(deployer.address, 1, followeeWallet.address, { value: ton("0.6") });
    expect(followeeWallet.getFollowersCount()).toEqual(1);

    // Followee burns all balance to reach 0
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
    followerWallet.sendUnfollow(
        deployer.address,
        0,
        deployer.address,
        followeeWallet.address,
        { value: ton("0.6") },
    );
    expect(followeeWallet.getWalletDataAll().debt).toEqual(FOLLOW_MINT_AMOUNT);
    expect(followeeWallet.getWalletDataAll().debts).toEqual(true);

    // Advance time past activation wait (1 day)
    testing.setNow(1_800_000_000 + ACTIVATION_WAIT + 100);

    // Claim weekly grant (11,111 FI): should pay off 1,000 FI debt completely and credit 10,111 FI to balance
    val claimTx = followeeWallet.sendActClaimWeeklyGrant(
        notDeployer.address,
        0,
        null,
        { value: ton("1") },
    );

    expect(claimTx).toHaveSuccessfulTx<ActClaimWeeklyGrant>({
        from: notDeployer.address,
        to: followeeWallet.address,
    });

    val walletData = followeeWallet.getWalletDataAll();
    expect(walletData.debt).toEqual(0);
    expect(walletData.debts).toEqual(false);
    expect(walletData.jettonBalance).toEqual(WEEKLY_CLAIM_AMOUNT - FOLLOW_MINT_AMOUNT);
}
