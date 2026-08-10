import "@acton/build"
import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@acton/testing/expect"

import "@gen/FossFiWallet.code"
import "@gen/Lottery.code"
import "@wrappers/FossFi.gen"
import "@wrappers/Lottery.gen"
import "@wrappers/utils"

import "@contracts/fossFi/consts"
import "@contracts/fossFi/storage"

import "@contracts/lottery/consts"
import "@contracts/lottery/messages"
import "@contracts/lottery/storage"

import "test-utils"

// Realistic absolute time past the reveal deadline. Must be a future
// absolute timestamp (not testing.getNow() + delta): before any setNow,
// testing.getNow() is 0, so a delta would land in the unix epoch and break
// the emulator's storage phase with error -669.
const FUTURE_ABSOLUTE_TIME: uint32 = 1_800_000_000

fun deployLotteryContract(owner: address, entryAmount: coins): address {
    val init: AutoDeployAddress = {
        stateInit: {
            code: build("Lottery"),
            data: LotteryStorage {
                owner,
                entryAmount,
                participants: [],
                participantCount: 0,
                revealDeadline: 0,
                prizePool: 0,
                randomSeed: 0,
            }.toCell(),
        },
    };

    val lotteryAddress = init.calculateAddress();
    val deployResult = net.send(
        owner,
        createMessage({
            bounce: false,
            value: ton("10"),
            dest: init,
            body: beginCell().endCell().beginParse(),
        }),
    );

    expect(deployResult).toHaveSuccessfulDeploy({
        to: lotteryAddress,
    });

    return lotteryAddress;
}

get fun `test lottery: deploy contract and accept correct entry fee`() {
    val deployer = testing.treasury("deployer");
    val player = testing.treasury("player1");

    val lotteryAddress = deployLotteryContract(deployer.address, LOTTERY_ENTRY_AMT);

    val enterResult = net.send(
        deployer.address, // entries are routed through the minter (owner)
        createMessage({
            bounce: true,
            value: LOTTERY_ENTRY_AMT,
            dest: lotteryAddress,
            body: EnterLottery {
                sender: player.address,
                amount: LOTTERY_ENTRY_AMT,
            },
        }),
    );

    expect(enterResult).toHaveSuccessfulTx<EnterLottery>({
        from: deployer.address,
        to: lotteryAddress,
    });
}

get fun `test lottery: reject entry with incorrect amount`() {
    val deployer = testing.treasury("deployer");
    val player = testing.treasury("player2");
    val lotteryAddress = deployLotteryContract(deployer.address, LOTTERY_ENTRY_AMT);

    val badResult = net.send(
        deployer.address, // entries are routed through the minter (owner)
        createMessage({
            bounce: true,
            value: ton("1"),
            dest: lotteryAddress,
            body: EnterLottery {
                sender: player.address,
                amount: ton("1"),
            },
        }),
    );

    expect(badResult).toHaveFailedTx<EnterLottery>({
        from: deployer.address,
        to: lotteryAddress,
        exitCode: 202,
    });
}

get fun `test lottery: draw winner mints FI to the winner`() {
    val deployer = testing.treasury("deployer");
    val winner = testing.treasury("winner");

    // minter with lottery code set so LotteryWin passes the sender assert
    val minter = FossFi.fromStorage({
        totalSupply: 0,
        adminAddress: deployer.address,
        metadata: buildTestMetadata("link"),
        adminHandoff: null,
        others: FiCodes {
            lotteryCode: lotteryCompiledCode(),
            latestFiWalletCode: fossFiWalletCompiledCodeLibraryRef(),
        }.toCell(),
    });

    // empty-body deploy keeps the top-up value on the minter
    val minterDeploy = minter.deploy(deployer.address, { value: ton("50") });
    expect(minterDeploy).toHaveSuccessfulDeploy({
        to: minter.address,
    });

    // lottery must live at the address the minter computes via calcDeployLottery
    val lottery = Lottery.fromStorage({
        owner: minter.address,
        entryAmount: LOTTERY_ENTRY_AMT,
        participants: [],
    });
    val lotteryDeploy = lottery.deploy(minter.address, { value: ton("10") });
    expect(lotteryDeploy).toHaveSuccessfulDeploy({
        to: lottery.address,
    });

    // one player enters through the minter (the lottery's owner)
    val enterResult = net.send(
        minter.address,
        createMessage({
            bounce: true,
            value: LOTTERY_ENTRY_AMT,
            dest: lottery.address,
            body: EnterLottery {
                sender: winner.address,
                amount: LOTTERY_ENTRY_AMT,
            },
        }),
    );
    expect(enterResult).toHaveSuccessfulTx<EnterLottery>({
        from: minter.address,
        to: lottery.address,
    });

    // past the reveal deadline
    testing.setNow(FUTURE_ABSOLUTE_TIME + REVEAL_DEADLINE_SECONDS + 1);

    val supplyBefore = minter.getTotalSupply();
    val winnerWallet = userWallet(minter, winner.address);
    val balanceBefore = winnerWallet.getJettonBalance();

    val drawResult = net.send(
        deployer.address,
        createMessage({
            bounce: true,
            value: ton("0.2"),
            dest: lottery.address,
            body: DrawWinner { queryId: 0 },
        }),
    );
    expect(drawResult).toHaveSuccessfulTx<LotteryWin>({
        from: lottery.address,
        to: minter.address,
    });

    expect(winnerWallet.getJettonBalance()).toEqual(balanceBefore + LOTTERY_ENTRY_AMT);
    expect(minter.getTotalSupply()).toEqual(supplyBefore + LOTTERY_ENTRY_AMT);
}
