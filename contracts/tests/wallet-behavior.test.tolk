import "@acton/build"
import "@acton/io"
import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@acton/testing/expect"
import "@acton/types/transaction"

import "@wrappers/FossFi.gen"
import "@wrappers/FossFiWallet.gen"
import "@wrappers/utils"
import "@contracts/common/errors"
import "@contracts/common/fi-wallet-code"
import "@contracts/common/messages"
import "@contracts/fossFi/jetton-utils"
import "@contracts/fossFi/storage"

import "test-utils"

get fun `test wallet: kitchenSink`() {
    val (minter, deployer, notDeployer) = setupTest();
    val transferAmount = ton("100");
    val senderWallet = userWallet(minter, deployer.address);
    val receiverWallet = userWallet(minter, notDeployer.address);

    expect(senderWallet.getJettonBalance()).toEqual(ton("1"));

    val invite = senderWallet.sendActInvite(
        deployer.address,
        0,
        notDeployer.address,
        "alice",
        "8828308281fffff",
        0,
        { value: ton("1") }, // todo: bounce?
    );
    invite.giveName("inviteMsg");

    expect(invite).toHaveSuccessfulDeploy<InternalInvite>({
        from: senderWallet.address,
        to: receiverWallet.address,
    });
    expect(invite).toHaveAllSuccessfulTxs();

    expect(senderWallet.getJettonBalance()).toEqual(ton("1000"));
    expect(receiverWallet.getJettonBalance()).toEqual(ton("1"));

    val res = senderWallet.sendTransferPayloadInline(
        deployer.address,
        DEFAULT_TRANSFER_MSG_VALUE,
        transferAmount,
        notDeployer.address,
        deployer.address,
        null,
        DEFAULT_FORWARD_TON_AMOUNT,
        createEmptySlice(),
    );

    expect(res).toHaveSuccessfulTx<AskToTransfer>({
        from: deployer.address,
        to: senderWallet.address,
    });

    expect(senderWallet.getJettonBalance()).toEqual(ton("900"));
    expect(receiverWallet.getJettonBalance()).toEqual(transferAmount + ton("1"));

    // upgrades test
    val newCode = build("FossFiWallet");
    val _upg = minter.sendUpgrade(
        deployer.address,
        true,
        0,
        deployer.address,
        null,
        newCode,
    );

    // upg.waitForTrace();
    val minterDataAll = minter.getJettonDataAll();
    expect(
        minterDataAll.others.load().currentRequest!.load().newUpgrade.walletUpgrade,
    ).toBeTrue();

    val _time = testing.getNow();

    testing.setNow(TEST_NOW_BASELINE + 1000); // 1000 seconds from now

    // val approveReq = minter.sendApproveUpgrade(deployer.address);
    // println(approveReq);
    // expect(approveReq).toHaveSuccessfulTx<ApproveUpgrade>({
    //     from: deployer.address,
    //     to: minter.address,
    // });
    // expect(minter.getJettonDataAll().others.load().currentRequest).toBeNull();
    // expect(senderWallet.getWalletDataAll().version).toEqual(1);

    // send HotUpgrade
    // val newFiCode = build("FossFi");
    val sendHotUpgrade = minter.sendHotUpgrade(
        deployer.address,
        null,
        build("FossFi"),
    );
    sendHotUpgrade.giveName("HotUpgrade");

    sendHotUpgrade.waitForTrace();

    val minterData = minter.getJettonData();
    expect(minterData.totalSupply).toEqual(ton("12112"));
}

get fun `test : hotUpgrade`() {
    val (minter, deployer, _) = setupTest();
    // send HotUpgrade
    // val newFiCode = build("FossFi");
    val sendHotUpgrade = minter.sendHotUpgrade(
        deployer.address,
        null,
        build("FossFi"),
    );
    sendHotUpgrade.giveName("HotUpgrade");

    println(sendHotUpgrade);
    val minterData = minter.getJettonData();
    expect(minterData.totalSupply).toEqual(ton("11112"));
}

get fun `test : addrs r same`() {
    val (minter, deployer, _notDeployer) = setupTest();
    val wallet = userWallet(minter, deployer.address);

    val _storage: FiWalletStore = FiWalletStore {
        addresses: Addresses {
            owner: deployer.address,
            // baseFiWalletCode: fossFiWalletCompiledCodeLibraryRef(),
            nomInAddrs: NomInAddrs {}.toCell(),
            trustedJettonAddrs: TrustedAddrs {
                minterAddr: minter.address,
                authorisedAccs: [],
            }.toCell(),
        }.toCell(),
        maps: Maps {
            allowances: [],
            invited: [],
            social: SocialMaps { votedFor: [] }.toCell(),
            reportInfo: ReportInfo { reports: [] }.toCell(),
        }.toCell(), // todo: learn how to set it default
        profile: ProfileInfo {}.toCell(),
        timestamps: TimeStamps {}.toCell(),
    };
    val calcAddr = calcDeployFiWallet(
        deployer.address,
        minter.address,
        getFiWalletCode(),
    ).calculateAddress();

    expect(wallet.address).toEqual(calcAddr);
}

get fun `test wallet: owner can send jettons`() {
    val (minter, deployer, notDeployer) = setupTest();
    val transferAmount = ton("5");
    val senderWallet = mintTo(minter, deployer, deployer.address, ton("20"));
    // minted 20 on top of the 1 baseline => 21; activate receiver via invite (mints 999 to inviter)
    val receiverWallet = activateUser(minter, senderWallet, deployer, notDeployer.address);
    // sender: 21 + 999 = 1020; receiver active with 1
    expect(senderWallet.getJettonBalance()).toEqual(ton("1020"));

    val res = senderWallet.sendTransfer(
        deployer.address,
        DEFAULT_TRANSFER_MSG_VALUE,
        transferAmount,
        notDeployer.address,
        deployer.address,
        null,
        DEFAULT_FORWARD_TON_AMOUNT,
        null,
    );
    expect(res).toHaveSuccessfulTx<AskToTransfer>({
        from: deployer.address,
        to: senderWallet.address,
    });

    expect(senderWallet.getJettonBalance()).toEqual(ton("1015"));
    expect(receiverWallet.getJettonBalance()).toEqual(transferAmount + ton("1"));
}

get fun `test wallet: non-owner cannot send jettons`() {
    val (minter, deployer, notDeployer) = setupTest();
    val wallet = mintTo(minter, deployer, deployer.address, ton("7"));
    val balanceBefore = wallet.getJettonBalance();

    val res = wallet.sendTransfer(
        notDeployer.address,
        DEFAULT_TRANSFER_MSG_VALUE,
        ton("3"),
        notDeployer.address,
        deployer.address,
        null,
        DEFAULT_FORWARD_TON_AMOUNT,
        null,
    );
    expect(res).toHaveFailedTx<AskToTransfer>({
        from: notDeployer.address,
        to: wallet.address,
        exitCode: Errors.NotOwner,
    });

    expect(wallet.getJettonBalance()).toEqual(balanceBefore);
}

get fun `test wallet: cannot send more jettons than balance`() {
    val (minter, deployer, notDeployer) = setupTest();
    val wallet = mintTo(minter, deployer, deployer.address, ton("2"));
    val balanceBefore = wallet.getJettonBalance();

    val res = wallet.sendTransfer(
        deployer.address,
        DEFAULT_TRANSFER_MSG_VALUE,
        ton("5"),
        notDeployer.address,
        deployer.address,
        null,
        DEFAULT_FORWARD_TON_AMOUNT,
        null,
    );
    expect(res).toHaveFailedTx<AskToTransfer>({
        from: deployer.address,
        to: wallet.address,
        exitCode: Errors.BalanceError,
    });

    expect(wallet.getJettonBalance()).toEqual(balanceBefore);
}

get fun `test wallet: zero forward ton means no transfer notification`() {
    val (minter, deployer, notDeployer) = setupTest();
    val senderWallet = mintTo(minter, deployer, deployer.address, ton("2"));
    val receiverWallet = userWallet(minter, notDeployer.address);

    val res = senderWallet.sendTransfer(
        deployer.address,
        DEFAULT_TRANSFER_MSG_VALUE,
        ton("1"),
        notDeployer.address,
        deployer.address,
        null,
        0,
        null,
    );
    expect(res).toHaveSuccessfulTx<AskToTransfer>({
        from: deployer.address,
        to: senderWallet.address,
    });
    expect(res).toNotHaveTx<TransferNotificationForRecipient>({
        from: receiverWallet.address,
        to: notDeployer.address,
    });
}

get fun `test wallet: transfer notification should preserve forward payload`() {
    val (minter, deployer, notDeployer) = setupTest();
    val senderWallet = mintTo(minter, deployer, deployer.address, ton("2"));
    val receiverWallet = activateUser(minter, senderWallet, deployer, notDeployer.address);
    val sentAmount = ton("0.5");
    val forwardPayload = beginCell().storeUint(0x1234567890abcdef, 128).endCell();

    val res = senderWallet.sendTransfer(
        deployer.address,
        DEFAULT_TRANSFER_MSG_VALUE,
        sentAmount,
        notDeployer.address,
        deployer.address,
        null,
        DEFAULT_FORWARD_TON_AMOUNT,
        forwardPayload,
    );
    expect(res).toHaveSuccessfulTx<AskToTransfer>({
        from: deployer.address,
        to: senderWallet.address,
    });

    val notificationTx = res.findTransaction<TransferNotificationForRecipient>({
        from: receiverWallet.address,
        to: notDeployer.address,
        success: true,
        exitCode: 0,
    });
    expect(notificationTx).toBeNotNull();

    val notification = notificationTx!.loadBody<TransferNotificationForRecipient>();
    var payloadSlice = notification.forwardPayload;
    val payloadRef = payloadSlice.loadMaybeRef();
    expect(payloadRef).toBeNotNull();
    if (payloadRef == null) {
        return;
    }

    var payloadBody = payloadRef.beginParse();
    if (
        payloadBody.remainingBitsCount() == 1 && payloadBody.preloadUint(1) == 1 &&
        payloadBody.remainingRefsCount() == 1
    ) {
        payloadBody.loadUint(1);
        expect(payloadBody.loadRef().hash()).toEqual(forwardPayload.hash());
    } else {
        expect(payloadRef.hash()).toEqual(forwardPayload.hash());
    }
}

get fun `test wallet: transfer to inactive recipient bounces and restores sender`() {
    val (minter, deployer, _) = setupTest();
    val senderWallet = mintTo(minter, deployer, deployer.address, ton("2"));
    val balanceBefore = senderWallet.getJettonBalance();
    val recipientOwner = randomAddress();
    val recipientWallet = userWallet(minter, recipientOwner);
    val sentAmount = ton("0.5");

    val res = senderWallet.sendTransfer(
        deployer.address,
        DEFAULT_TRANSFER_MSG_VALUE,
        sentAmount,
        recipientOwner,
        deployer.address,
        null,
        0,
        null,
    );

    expect(res).toHaveSuccessfulTx<AskToTransfer>({
        from: deployer.address,
        to: senderWallet.address,
    });
    expect(recipientWallet.getJettonBalance()).toEqual(0);
    expect(senderWallet.getJettonBalance()).toEqual(balanceBefore);
}

get fun `test wallet: owner can burn jettons`() {
    val (minter, deployer, _) = setupTest();
    val burnAmount = ton("3");
    val wallet = mintTo(minter, deployer, deployer.address, ton("10"));
    val balanceBefore = wallet.getJettonBalance();
    val supplyBefore = minter.getTotalSupply();

    val res = wallet.sendAskToBurn(
        deployer.address,
        0,
        burnAmount,
        deployer.address,
        null,
        { bounce: false, value: DEFAULT_BURN_MSG_VALUE },
    );
    expect(res).toHaveSuccessfulTx<AskToBurn>({
        from: deployer.address,
        to: wallet.address,
    });

    expect(wallet.getJettonBalance()).toEqual(balanceBefore - burnAmount);
    expect(minter.getTotalSupply()).toEqual(supplyBefore - burnAmount);
}

get fun `test wallet: non-owner cannot burn jettons`() {
    val (minter, deployer, notDeployer) = setupTest();
    val wallet = mintTo(minter, deployer, deployer.address, ton("6"));
    val balanceBefore = wallet.getJettonBalance();
    val supplyBefore = minter.getTotalSupply();

    val res = wallet.sendAskToBurn(
        notDeployer.address,
        0,
        ton("2"),
        deployer.address,
        null,
        { bounce: false, value: DEFAULT_BURN_MSG_VALUE },
    );
    expect(res).toHaveFailedTx<AskToBurn>({
        from: notDeployer.address,
        to: wallet.address,
        exitCode: Errors.NotOwner,
    });

    expect(wallet.getJettonBalance()).toEqual(balanceBefore);
    expect(minter.getTotalSupply()).toEqual(supplyBefore);
}

get fun `test wallet: cannot burn more than balance`() {
    val (minter, deployer, _) = setupTest();
    val wallet = mintTo(minter, deployer, deployer.address, ton("1"));
    val balanceBefore = wallet.getJettonBalance();
    val supplyBefore = minter.getTotalSupply();

    val res = wallet.sendAskToBurn(
        deployer.address,
        0,
        ton("5"),
        deployer.address,
        null,
        { bounce: false, value: DEFAULT_BURN_MSG_VALUE },
    );
    expect(res).toHaveFailedTx<AskToBurn>({
        from: deployer.address,
        to: wallet.address,
        exitCode: Errors.BalanceError,
    });

    expect(wallet.getJettonBalance()).toEqual(balanceBefore);
    expect(minter.getTotalSupply()).toEqual(supplyBefore);
}

get fun `test wallet: profile country and get_profile getter`() {
    val (minter, deployer, _notDeployer) = setupTest();
    val senderWallet = userWallet(minter, deployer.address);
    val user2 = testing.treasury("user-country-test");
    val user2Wallet = userWallet(minter, user2.address);

    val invite = senderWallet.sendActInvite(
        deployer.address,
        0,
        user2.address,
        "bob",
        "8828308281fffff",
        840,
        { value: ton("1") },
    );
    expect(invite).toHaveSuccessfulDeploy<InternalInvite>({
        from: senderWallet.address,
        to: user2Wallet.address,
    });

    val (username, h3Cell, country) = user2Wallet.getProfile();
    expect(username).toEqual("bob");
    expect(h3Cell).toEqual("8828308281fffff");
    expect(country).toEqual(840);
}

get fun `test wallet: change country succeeds when no active votes`() {
    val (minter, deployer, _) = setupTest();
    val user = testing.treasury("user-change-country");
    val userWallet2 = userWallet(minter, user.address);
    val rootWallet = userWallet(minter, deployer.address);

    rootWallet.sendActInvite(
        deployer.address,
        0,
        user.address,
        "charlie",
        "8828308281fffff",
        250,
        { value: ton("1") },
    );

    val changeRes = userWallet2.sendChangeCountry(user.address, 0, 356, { value: ton("0.1") });
    expect(changeRes).toHaveSuccessfulTx<ChangeCountry>({
        from: user.address,
        to: userWallet2.address,
    });

    val (_, _, country) = userWallet2.getProfile();
    expect(country).toEqual(356);
}

get fun `test wallet: voting succeeds between accounts with matching country`() {
    val (minter, deployer, _) = setupTest();
    val rootWallet = userWallet(minter, deployer.address);

    val voter = testing.treasury("voter-same-country");
    val candidate = testing.treasury("candidate-same-country");
    val voterWallet = userWallet(minter, voter.address);
    val candidateWallet = userWallet(minter, candidate.address);

    rootWallet.sendActInvite(
        deployer.address,
        0,
        voter.address,
        "voter1",
        "8828308281fffff",
        826,
        { value: ton("1") },
    );
    rootWallet.sendActInvite(
        deployer.address,
        0,
        candidate.address,
        "cand1",
        "8828308281fffff",
        826,
        { value: ton("1") },
    );

    val voteRes = voterWallet.sendActVote(
        voter.address,
        candidate.address,
        10,
        { value: ton("0.2") },
    );
    expect(voteRes).toHaveSuccessfulTx<VotingAction>({
        from: voterWallet.address,
        to: candidateWallet.address,
    });

    val candidateData = candidateWallet.getWalletDataAll();
    expect(candidateData.receivedVotes).toEqual(10);
    val voterData = voterWallet.getWalletDataAll();
    expect(voterData.votes).toEqual(0);
}

get fun `test wallet: voting succeeds for globalist accounts with country 0`() {
    val (minter, deployer, _) = setupTest();
    val rootWallet = userWallet(minter, deployer.address);

    val voter = testing.treasury("voter-globalist");
    val candidate = testing.treasury("candidate-globalist");
    val voterWallet = userWallet(minter, voter.address);
    val candidateWallet = userWallet(minter, candidate.address);

    rootWallet.sendActInvite(
        deployer.address,
        0,
        voter.address,
        "voterG",
        "8828308281fffff",
        0,
        { value: ton("1") },
    );
    rootWallet.sendActInvite(
        deployer.address,
        0,
        candidate.address,
        "candG",
        "8828308281fffff",
        0,
        { value: ton("1") },
    );

    val voteRes = voterWallet.sendActVote(
        voter.address,
        candidate.address,
        10,
        { value: ton("0.2") },
    );
    expect(voteRes).toHaveSuccessfulTx<VotingAction>({
        from: voterWallet.address,
        to: candidateWallet.address,
    });

    val candidateData = candidateWallet.getWalletDataAll();
    expect(candidateData.receivedVotes).toEqual(10);
}

get fun `test wallet: voting fails and bounces when country mismatches, restoring voter votes`() {
    val (minter, deployer, _) = setupTest();
    val rootWallet = userWallet(minter, deployer.address);

    val voter = testing.treasury("voter-us");
    val candidate = testing.treasury("candidate-in");
    val voterWallet = userWallet(minter, voter.address);
    val candidateWallet = userWallet(minter, candidate.address);

    rootWallet.sendActInvite(
        deployer.address,
        0,
        voter.address,
        "voterUS",
        "8828308281fffff",
        840,
        { value: ton("1") },
    );
    rootWallet.sendActInvite(
        deployer.address,
        0,
        candidate.address,
        "candIN",
        "8828308281fffff",
        356,
        { value: ton("1") },
    );

    val voteRes = voterWallet.sendActVote(
        voter.address,
        candidate.address,
        10,
        { value: ton("0.2") },
    );
    expect(voteRes).toHaveFailedTx<VotingAction>({
        from: voterWallet.address,
        to: candidateWallet.address,
        exitCode: Errors.CountryMismatch,
    });

    val candidateData = candidateWallet.getWalletDataAll();
    expect(candidateData.receivedVotes).toEqual(0);

    // Voter receives bounce and recovers voting power
    val voterData = voterWallet.getWalletDataAll();
    expect(voterData.votes).toEqual(10);
}

get fun `test wallet: change country fails when active votes exist`() {
    val (minter, deployer, _) = setupTest();
    val rootWallet = userWallet(minter, deployer.address);

    val voter = testing.treasury("voter-active-votes");
    val candidate = testing.treasury("candidate-active-votes");
    val voterWallet = userWallet(minter, voter.address);
    val _candidateWallet = userWallet(minter, candidate.address);

    rootWallet.sendActInvite(
        deployer.address,
        0,
        voter.address,
        "voterA",
        "8828308281fffff",
        392,
        { value: ton("1") },
    );
    rootWallet.sendActInvite(
        deployer.address,
        0,
        candidate.address,
        "candA",
        "8828308281fffff",
        392,
        { value: ton("1") },
    );

    voterWallet.sendActVote(voter.address, candidate.address, 10, { value: ton("0.2") });

    val failChange = voterWallet.sendChangeCountry(voter.address, 0, 840, { value: ton("0.1") });
    expect(failChange).toHaveFailedTx<ChangeCountry>({
        from: voter.address,
        to: voterWallet.address,
        exitCode: Errors.HasActiveVotes,
    });
}

// @test.skip
get fun `test wallet: granular voting, additive endorsements, and partial unvoting`() {
    val (minter, deployer, _) = setupTest();
    val rootWallet = userWallet(minter, deployer.address);

    val voter = testing.treasury("voter-multi");
    val candidateA = testing.treasury("cand-A");
    val candidateB = testing.treasury("cand-B");
    // val voterWallet = activateUser(minter, rootWallet, deployer, voter.address);
    val voterWallet = userWallet(minter, voter.address);
    val candAWallet = userWallet(minter, candidateA.address);
    val candBWallet = userWallet(minter, candidateB.address);

    rootWallet.sendActInvite(
        deployer.address,
        0,
        voter.address,
        "voterM",
        "8828308281fffff",
        840,
        { value: ton("1") },
    );
    rootWallet.sendActInvite(
        deployer.address,
        0,
        candidateA.address,
        "candA",
        "8828308281fffff",
        840,
        { value: ton("1") },
    );
    rootWallet.sendActInvite(
        deployer.address,
        0,
        candidateB.address,
        "candB",
        "8828308281fffff",
        840,
        { value: ton("1") },
    );

    // 1. Granular initial vote: 3 votes for candA, 4 votes for candB
    val voterCodeInit = voterWallet.getWalletData();
    val voterState = voterWallet.stateInit!;
    val voterCodeNow = voterState.code;
    expect(voterCodeInit.jettonWalletCode).toNotEqual(voterCodeNow);
    val candACodeInit = candAWallet.getWalletData();
    val candAState = candAWallet.stateInit!;
    val candACodeNow = candAState.code;
    expect(candACodeInit.jettonWalletCode).toNotEqual(candACodeNow);

    val voterDataBefore = voterWallet.getWalletDataAll();
    expect(voterDataBefore.votes).toEqual(10);

    var vData = voterWallet.getWalletDataAll();
    // println(vData);
    val voteA1 = voterWallet.sendActVote(
        voter.address,
        candidateA.address,
        3,
        { value: ton("0.2") },
    );
    println(voteA1);
    expect(voteA1).toHaveSuccessfulTx<VotingAction>({
        from: voterWallet.address,
        to: candAWallet.address,
    });

    vData = voterWallet.getWalletDataAll();
    // println(vData);
    expect(vData.votes).toEqual(7); // 10 - 3 = 7 remaining

    val voteB1 = voterWallet.sendActVote(
        voter.address,
        candidateB.address,
        4,
        { value: ton("0.2") },
    );
    println(voteB1);
    expect(voteB1).toHaveSuccessfulTx<VotingAction>({
        from: voterWallet.address,
        to: candBWallet.address,
    });

    vData = voterWallet.getWalletDataAll();
    // println(vData);
    expect(vData.votes).toEqual(3); // 10 - 3 - 4 = 3 remaining
    expect(candAWallet.getWalletDataAll().receivedVotes).toEqual(3);
    expect(candBWallet.getWalletDataAll().receivedVotes).toEqual(4);

    // 2. Additive vote: cast 2 more votes for candA
    val voteA2 = voterWallet.sendActVote(
        voter.address,
        candidateA.address,
        2,
        { value: ton("0.2") },
    );
    expect(
        voteA2,
    ).toHaveSuccessfulTx<VotingAction>({ from: voterWallet.address, to: candAWallet.address });

    vData = voterWallet.getWalletDataAll();
    expect(vData.votes).toEqual(1);                                  // 3 - 2 = 1 remaining
    expect(candAWallet.getWalletDataAll().receivedVotes).toEqual(5); // 3 + 2 = 5 total

    // 3. Partial unvote: unvote 2 votes from candA
    val unvoteA1 = voterWallet.sendActUnvote(
        voter.address,
        candidateA.address,
        2,
        { value: ton("0.2") },
    );
    expect(
        unvoteA1,
    ).toHaveSuccessfulTx<VotingAction>({ from: voterWallet.address, to: candAWallet.address });

    vData = voterWallet.getWalletDataAll();
    expect(vData.votes).toEqual(3);                                  // 1 + 2 = 3
    expect(candAWallet.getWalletDataAll().receivedVotes).toEqual(3); // 5 - 2 = 3

    // 4. Over-unvote should fail
    val failOverUnvote = voterWallet.sendActUnvote(
        voter.address,
        candidateA.address,
        5,
        { value: ton("0.2") },
    );
    expect(failOverUnvote).toHaveFailedTx<ActUnvote>({
        from: voter.address,
        to: voterWallet.address,
        exitCode: Errors.NoVotesAvailable,
    });

    // 5. Full unvote of remaining 3 votes from candA
    val unvoteA2 = voterWallet.sendActUnvote(
        voter.address,
        candidateA.address,
        3,
        { value: ton("0.2") },
    );
    expect(
        unvoteA2,
    ).toHaveSuccessfulTx<VotingAction>({ from: voterWallet.address, to: candAWallet.address });

    vData = voterWallet.getWalletDataAll();
    expect(vData.votes).toEqual(6); // 3 + 3 = 6
    expect(candAWallet.getWalletDataAll().receivedVotes).toEqual(0);

    // 6. Unvoting non-endorsed candidate should fail
    val failUnvoteNonEndorsed = voterWallet.sendActUnvote(
        voter.address,
        candidateA.address,
        1,
        { value: ton("0.2") },
    );
    expect(failUnvoteNonEndorsed).toHaveFailedTx<ActUnvote>({
        from: voter.address,
        to: voterWallet.address,
        exitCode: Errors.NotVotedYet,
    });
}
