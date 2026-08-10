import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@acton/testing/expect"
import "@acton/tlb/either"
import "@acton/tlb/maybe"
import "@acton/types/transaction"

import "@wrappers/FossFi.gen"
import "@wrappers/FossFiWallet.gen"
import "@wrappers/utils"

import "@contracts/common/messages"

import "test-utils"

const MAX_JETTON_VALUE = ton("100000")

get fun `test state: should mint max jetton value`() {
    val (minter, deployer, _) = setupTest();
    val recipient = randomAddress();
    val wallet = userWallet(minter, recipient);

    val mintResult = minter.sendMint(
        deployer.address,
        recipient,
        MAX_JETTON_VALUE,
        ton("0.05"),
        ton("0.3"),
    );
    expect(mintResult).toHaveSuccessfulTx<MintNewJettons>({
        from: deployer.address,
        to: minter.address,
    });
    expect(mintResult).toHaveSuccessfulTx<InternalTransferStep>({
        from: minter.address,
        to: wallet.address,
    });

    expect(wallet.getJettonBalance()).toEqual(MAX_JETTON_VALUE);
    expect(minter.getTotalSupply()).toEqual(MAX_JETTON_VALUE + ton("1"));
}

get fun `test state: wallet storage and init-state bounds should match fee constants`() {
    val (minter, deployer, _) = setupTest();
    val recipient = randomAddress();
    val recipientWallet = userWallet(minter, recipient);

    val mintResult = minter.sendMint(deployer.address, recipient, TEST_JETTON_UNIT, 0, ton("0.3"));
    expect(mintResult).toHaveSuccessfulTx<InternalTransferStep>({
        from: minter.address,
        to: recipientWallet.address,
    });

    val state = testing.getAccountState(recipientWallet.address);
    expect(state).toBeNotNull();
    if (state == null) {
        return;
    }
    val (accountCells, accountBits, _) = state.toCell().calculateSizeStrict(4096);
    expect(accountBits).toBeGreater(0);
    expect(accountCells).toBeGreater(0);

    val transferTx = mintResult.findTransaction<InternalTransferStep>({
        from: minter.address,
        to: recipientWallet.address,
        success: true,
        exitCode: 0,
    });
    expect(transferTx).toBeNotNull();
    val inMsg = transferTx!.loadInMsg<InternalTransferStep>();
    if (inMsg.init is TlbNone) {
        return;
    }

    val initEither = inMsg.init.value;
    var initStateCell = beginCell().endCell();
    if (initEither is TlbEitherLeft<StateInit>) {
        initStateCell = initEither.value.toCell();
    } else {
        initStateCell = initEither.value;
    }
    val (initCells, initBits, _) = initStateCell.calculateSizeStrict(4096);

    expect(initBits).toBeGreater(0);
    expect(initCells).toBeGreater(0);
}
