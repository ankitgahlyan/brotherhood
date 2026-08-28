import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@acton/testing/expect"

import "@gen/FossFiWallet.code"
import "@gen/Lottery.code"
import "@gen/Poll.code"
import "@gen/Voter.code"
import "@wrappers/DaoProxy.gen"
import "@wrappers/FossFi.gen"
import "@wrappers/FossFiWallet.gen"
import "@wrappers/Poll.gen"
import "@wrappers/utils"

import "@contracts/common/errors"
import "@contracts/common/internal-transfer"
import "@contracts/common/messages"
import "@contracts/dao/dao-utils"
import "@contracts/dao/storage"
import "@contracts/fossFi/storage"

import "test-utils"

struct TestSetup {
    minter: FossFi
    daoProxy: DaoProxy
    deployer: Treasury
    deployerWallet: FossFiWallet
    walletLibRef: cell
    pollCodeLibRef: cell
    voterCodeLibRef: cell
}

fun setupDaoTest(): TestSetup {
    val deployer = testing.treasury("dao-deployer");
    registerAllTestLibraries();

    val minter = FossFi.fromStorage({
        totalSupply: 0,
        adminAddress: deployer.address,
        metadata: buildTestMetadata("dao-test"),
        adminHandoff: null,
        others: FiCodes {
            lotteryCode: lotteryCompiledCode(),
            latestFiWalletCode: fossFiWalletCompiledCodeLibraryRef(),
        }.toCell(),
    });
    minter.sendDeploy(deployer.address, { value: ton("10") });

    val deployerWallet = userWallet(minter, deployer.address);

    val daoProxy = DaoProxy.fromStorage({
        fiAddress: minter.address,
    });
    daoProxy.deploy(deployer.address, { value: ton("10") });

    minter.sendChangeDaoAddress(deployer.address, 1, daoProxy.address);

    return {
        minter,
        daoProxy,
        deployer,
        deployerWallet,
        walletLibRef: fossFiWalletCompiledCodeLibraryRef(),
        pollCodeLibRef: pollCompiledCodeLibraryRef(),
        voterCodeLibRef: voterCompiledCodeLibraryRef(),
    };
}

fun createMemberWallet(
    setup: TestSetup,
    member: address,
): FossFiWallet {
    val w = activateUser(setup.minter, setup.deployerWallet, setup.deployer, member);
    mintTo(setup.minter, setup.deployer, member, ton("2000"));
    return w;
}

get fun `test dao: member proposal submission deducts 1000 FI fee and deploys Poll`() {
    val setup = setupDaoTest();
    val member1 = testing.treasury("proposer-member");
    val wallet1 = createMemberWallet(setup, member1.address);

    val initialBal = wallet1.getJettonBalance();
    expect(initialBal >= ton("1000")).toBeTrue();

    val targetMsg = MintNewJettons {
        queryId: 100,
        mintRecipient: setup.deployer.address,
        tonAmount: ton("1"),
        internalTransferMsg: makeInternalTransferStep(100, ton("50"), setup.deployer.address),
    }.toCell();

    val res = wallet1.sendActSubmitProposal(
        member1.address,
        1,
        setup.daoProxy.address,
        targetMsg,
        { value: ton("0.5") },
    );
    expect(res).toHaveAllSuccessfulTxs();

    val newBal = wallet1.getJettonBalance();
    expect(newBal).toEqual(initialBal - ton("1000"));

    val expiresAt = blockchain.now() + 604800;
    val expectedPollAddr = calcDeployPoll(
        1,
        member1.address,
        setup.daoProxy.address,
        setup.minter.address,
        setup.walletLibRef,
        targetMsg,
        expiresAt,
        setup.pollCodeLibRef,
    ).calculateAddress();

    val poll = Poll.fromAddress(expectedPollAddr);
    val pollData = poll.getPollData();
    expect(pollData.proposalId).toEqual(1);
    expect(pollData.proposerOwner).toEqual(member1.address);
    expect(pollData.executed).toBeFalse();
}

get fun `test dao: voting on Poll with Voter child, vote switching, and threshold execution via DaoProxy`() {
    val setup = setupDaoTest();

    // Create 3 member accounts so totalAccounts = 3
    val member1 = testing.treasury("member-multi-1");
    val member2 = testing.treasury("member-multi-2");
    val member3 = testing.treasury("member-multi-3");

    val wallet1 = createMemberWallet(setup, member1.address);
    val wallet2 = createMemberWallet(setup, member2.address);
    val wallet3 = createMemberWallet(setup, member3.address);

    val targetMsg1 = MintNewJettons {
        queryId: 200,
        mintRecipient: member1.address,
        tonAmount: ton("1"),
        internalTransferMsg: makeInternalTransferStep(200, ton("100"), member1.address),
    }.toCell();

    val submitRes = wallet1.sendActSubmitProposal(
        member1.address,
        200,
        setup.daoProxy.address,
        targetMsg1,
        { value: ton("0.5") },
    );
    expect(submitRes).toHaveAllSuccessfulTxs();

    val expiresAt = blockchain.now() + 604800;
    val pollAddr = calcDeployPoll(
        200,
        member1.address,
        setup.daoProxy.address,
        setup.minter.address,
        setup.walletLibRef,
        targetMsg1,
        expiresAt,
        setup.pollCodeLibRef,
    ).calculateAddress();
    val poll = Poll.fromAddress(pollAddr);

    // Poll receives total accounts (3) from minter
    expect(poll.getPollData().totalAccounts).toEqual(3);

    // Member 1 votes YES on proposal
    val vote1Res = wallet1.sendActVoteProposal(
        member1.address,
        301,
        poll.address,
        200,
        true,
        null,
        { value: ton("0.2") },
    );
    expect(vote1Res).toHaveAllSuccessfulTxs();

    var pData = poll.getPollData();
    expect(pData.yesVotes).toEqual(1);
    expect(pData.noVotes).toEqual(0);

    // Member 1 switches vote to NO
    val voteSwitchRes = wallet1.sendActVoteProposal(
        member1.address,
        302,
        poll.address,
        200,
        false,
        true,
        { value: ton("0.2") },
    );
    expect(voteSwitchRes).toHaveAllSuccessfulTxs();

    pData = poll.getPollData();
    expect(pData.yesVotes).toEqual(0);
    expect(pData.noVotes).toEqual(1);

    // Member 2 votes YES
    val vote2Res = wallet2.sendActVoteProposal(
        member2.address,
        303,
        poll.address,
        200,
        true,
        null,
        { value: ton("0.2") },
    );
    expect(vote2Res).toHaveAllSuccessfulTxs();

    pData = poll.getPollData();
    expect(pData.yesVotes).toEqual(1);

    // Member 3 votes YES -> 2 YES votes >= threshold (2 for 3 totalAccounts) -> executes via DaoProxy!
    val vote3Res = wallet3.sendActVoteProposal(
        member3.address,
        304,
        poll.address,
        200,
        true,
        null,
        { value: ton("0.5") },
    );
    expect(vote3Res).toHaveAllSuccessfulTxs();

    pData = poll.getPollData();
    expect(pData.executed).toBeTrue();

    // Proposer (member1) gets 10x proposal fee (10,000 FI) reward: initial 2001 FI - 1000 fee + 100 targetMsg + 10000 reward = 11101 FI
    expect(wallet1.getJettonBalance()).toEqual(ton("11101"));
}

get fun `test dao: duplicate vote on same option is rejected and bounces back`() {
    val setup = setupDaoTest();

    val member1 = testing.treasury("member-dup-1");
    val member2 = testing.treasury("member-dup-2");
    val wallet1 = createMemberWallet(setup, member1.address);
    val _wallet2 = createMemberWallet(setup, member2.address);

    val targetMsg = MintNewJettons {
        queryId: 300,
        mintRecipient: member1.address,
        tonAmount: ton("1"),
        internalTransferMsg: makeInternalTransferStep(300, ton("50"), member1.address),
    }.toCell();

    wallet1.sendActSubmitProposal(
        member1.address,
        300,
        setup.daoProxy.address,
        targetMsg,
        { value: ton("0.5") },
    );

    val expiresAt = blockchain.now() + 604800;
    val pollAddr = calcDeployPoll(
        300,
        member1.address,
        setup.daoProxy.address,
        setup.minter.address,
        setup.walletLibRef,
        targetMsg,
        expiresAt,
        setup.pollCodeLibRef,
    ).calculateAddress();
    val poll = Poll.fromAddress(pollAddr);

    // First vote YES succeeds
    val firstVoteRes = wallet1.sendActVoteProposal(
        member1.address,
        401,
        poll.address,
        300,
        true,
        null,
        { value: ton("0.2") },
    );
    expect(firstVoteRes).toHaveAllSuccessfulTxs();
    expect(poll.getPollData().yesVotes).toEqual(1);

    // Second vote YES on same option throws DuplicateVote (757) on Voter child, bouncing back to Poll
    val res2 = wallet1.sendActVoteProposal(
        member1.address,
        402,
        poll.address,
        300,
        true,
        null,
        { value: ton("0.2") },
    );
    expect(res2).toHaveTx({
        exitCode: Errors.DuplicateVote,
    });

    // Poll rolls back optimistic count on bounce, remaining at 1 (not 2)
    expect(poll.getPollData().yesVotes).toEqual(1);
}
