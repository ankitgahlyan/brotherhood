import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@acton/testing/expect"

import "@gen/DaoVoter.code"
import "@gen/FossFiWallet.code"
import "@gen/Lottery.code"
import "@wrappers/Dao.gen"
import "@wrappers/FossFi.gen"
import "@wrappers/FossFiWallet.gen"
import "@wrappers/utils"

import "@contracts/common/errors"
import "@contracts/common/internal-transfer"
import "@contracts/common/messages"
import "@contracts/fossFi/storage"

import "test-utils"

struct TestSetup {
    minter: FossFi
    dao: Dao
    deployer: Treasury
    deployerWallet: FossFiWallet
    walletLibRef: cell
    daoVoterCodeLibRef: cell
}

fun setupDaoTest(): TestSetup {
    val deployer = testing.treasury("dao-deployer");
    val walletCode = fossFiWalletCompiledCodeLibraryRef();
    val daoVoterCode = daoVoterCompiledCodeLibraryRef();
    testing.registerLibrary(daoVoterCode);

    val minter = FossFi.fromStorage({
        totalSupply: 0,
        adminAddress: deployer.address,
        metadata: buildTestMetadata("dao-test"),
        adminHandoff: null,
        others: FiCodes {
            totalAccounts: 0,
            lotteryCode: lotteryCompiledCode(),
            latestFiWalletCode: fossFiWalletCompiledCodeLibraryRef(),
        }.toCell(),
    });
    minter.sendDeploy(deployer.address, { value: ton("10") });

    val deployerWallet = userWallet(minter, deployer.address);

    val dao = Dao.fromStorage({
        fiAddress: minter.address,
        proposalCount: 0,
        proposals: [],
    });
    dao.deploy(deployer.address, { value: ton("10") });

    minter.sendChangeDaoAddress(deployer.address, 1, dao.address);

    return {
        minter,
        dao,
        deployer,
        deployerWallet,
        walletLibRef: walletCode,
        daoVoterCodeLibRef: daoVoterCode,
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

get fun `test dao: member proposal submission deducts 1000 FI fee and creates proposal`() {
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

    val res = wallet1.sendActSubmitProposal(member1.address, 1, setup.dao.address, targetMsg);
    expect(res).toHaveAllSuccessfulTxs();

    val newBal = wallet1.getJettonBalance();
    expect(newBal).toEqual(initialBal - ton("1000"));

    val prop = setup.dao.getProposal(1);
    expect(prop != null).toBeTrue();
    val p = prop!;
    expect(p.id).toEqual(1);
    expect(setup.dao.getDaoData().totalAccounts >= 0).toBeTrue();
}

get fun `test dao: multi-proposal voting with DaoVoter and vote switching`() {
    val setup = setupDaoTest();

    // Create 3 member accounts BEFORE submitting proposals so totalAccounts = 3
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

    val targetMsg2 = MintNewJettons {
        queryId: 201,
        mintRecipient: member2.address,
        tonAmount: ton("1"),
        internalTransferMsg: makeInternalTransferStep(201, ton("100"), member2.address),
    }.toCell();

    wallet1.sendActSubmitProposal(member1.address, 200, setup.dao.address, targetMsg1);
    wallet2.sendActSubmitProposal(member2.address, 201, setup.dao.address, targetMsg2);

    val prop1 = setup.dao.getProposal(1)!;
    val prop2 = setup.dao.getProposal(2)!;
    expect(prop1.id).toEqual(1);
    expect(prop2.id).toEqual(2);
    expect(setup.dao.getDaoData().totalAccounts).toEqual(3);

    // Member 1 votes YES on proposal 1 (threshold is ceil(3 * 2 / 3) = 3 votes)
    wallet1.sendActVoteProposal(
        member1.address,
        301,
        setup.dao.address,
        1,
        true,
    );

    var p1 = setup.dao.getProposal(1)!;
    expect(p1.yesVotes).toEqual(1);
    expect(p1.noVotes).toEqual(0);

    // Member 1 switches vote to NO on proposal 1
    val res2 = wallet1.sendActVoteProposal(
        member1.address,
        302,
        setup.dao.address,
        1,
        false,
    );
    expect(res2).toHaveAllSuccessfulTxs();

    p1 = setup.dao.getProposal(1)!;
    expect(p1.yesVotes).toEqual(0);
    expect(p1.noVotes).toEqual(1);

    // Member 2 votes YES on proposal 1
    wallet2.sendActVoteProposal(
        member2.address,
        303,
        setup.dao.address,
        1,
        true,
    );

    p1 = setup.dao.getProposal(1)!;
    expect(p1.yesVotes).toEqual(1);

    // Member 3 votes YES on proposal 1 -> 2 YES votes >= threshold (2) -> executed & deleted!
    val res304 = wallet3.sendActVoteProposal(
        member3.address,
        304,
        setup.dao.address,
        1,
        true,
    );
    expect(res304).toHaveAllSuccessfulTxs();

    expect(setup.dao.getProposal(1) == null).toBeTrue();
    // Proposer (member1) gets 10x proposal fee (10,000 FI) reward: initial 2001 FI - 1000 fee + 100 targetMsg + 10000 reward = 11101 FI
    expect(wallet1.getJettonBalance()).toEqual(ton("11101"));
}

get fun `test dao: duplicate vote on same option is rejected`() {
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

    wallet1.sendActSubmitProposal(member1.address, 300, setup.dao.address, targetMsg);

    // First vote YES succeeds
    wallet1.sendActVoteProposal(
        member1.address,
        401,
        setup.dao.address,
        1,
        true,
    );

    // Second vote YES on same option throws DuplicateVote (757) on DaoVoter child
    val res2 = wallet1.sendActVoteProposal(
        member1.address,
        402,
        setup.dao.address,
        1,
        true,
    );
    expect(res2).toHaveTx({
        exitCode: Errors.DuplicateVote,
    });
}
