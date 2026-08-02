import "@acton/build"
import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@acton/testing/expect"

import "@contracts/lottery/consts"
import "@contracts/lottery/messages"
import "@contracts/lottery/storage"

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
        }
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

    val lotteryAddress = deployLotteryContract(deployer.address, ENTRY_FEE);

    val enterResult = net.send(
        player.address,
        createMessage({
            bounce: true,
            value: ENTRY_FEE,
            dest: lotteryAddress,
            body: EnterLottery { sender: player.address, amount: ENTRY_FEE },
        }),
    );

    expect(enterResult).toHaveSuccessfulTx<EnterLottery>({
        from: player.address,
        to: lotteryAddress,
    });
}

get fun `test lottery: reject entry with incorrect amount`() {
    val deployer = testing.treasury("deployer");
    val player = testing.treasury("player2");
    val lotteryAddress = deployLotteryContract(deployer.address, ENTRY_FEE);

    val badResult = net.send(
        player.address,
        createMessage({
            bounce: true,
            value: ton("1"),
            dest: lotteryAddress,
            body: EnterLottery { sender: player.address, amount: ton("1") },
        }),
    );

    expect(badResult).toHaveFailedTx<EnterLottery>({
        from: player.address,
        to: lotteryAddress,
        exitCode: 202,
    });
}
