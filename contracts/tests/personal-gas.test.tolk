import "@stdlib/gas-payments"

import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@acton/testing/expect"

import "@wrappers/Personal.gen"
import "@wrappers/PersonalWallet.gen"
import "@wrappers/utils"

import "@contracts/common/errors"
import "@contracts/common/fees-management"
import "@contracts/common/messages"

import "@contracts/personalMinter/fees-management"
import "@contracts/personalMinter/storage"

import "test-utils"

fun deployPersonalMinterDirect(admin: address): Personal {
    val personalStore: PersonalStore = {
        totalSupply: 0,
        fiJettonAddress: admin,
        adminAddress: admin,
        metadataUri: createEmptyCell(),
    };
    val pm = Personal.fromStorage(personalStore);
    val res = pm.deploy(admin, { value: ton("1") });
    expect(res).toHaveSuccessfulDeploy({ to: pm.address });
    return pm;
}

get fun `test personal gas: transfer minimal value edge`() {
    val deployer = testing.treasury("deployer");
    val recipient = testing.treasury("recipient");
    val pm = deployPersonalMinterDirect(deployer.address);

    // Mint tokens to deployer
    pm.sendMint(deployer.address, deployer.address, ton("100"), ton("0.02"), ton("0.7"));
    val walletAddr = pm.getWalletAddress(deployer.address);
    val wallet = PersonalWallet.fromAddress(walletAddr);

    val dest = recipient.address;
    val body = buildTransferBody(ton("10"), 0, dest, dest, makeTinyForwardPayload());

    val fwdFee = estimateBodyForwardFee(body);
    val minimalTonValue = calcMinimalPersonalTransferAmount(0, fwdFee) + MIN_EDGE_DELTA;

    val enough = createMessage({
        body,
        bounce: false,
        dest: wallet.address,
        value: minimalTonValue,
    });
    val enoughRes = net.send(deployer.address, enough);
    expect(enoughRes).toHaveSuccessfulTx<AskToTransfer>({
        from: deployer.address,
        to: wallet.address,
    });

    val notEnough = createMessage({
        body,
        bounce: false,
        dest: wallet.address,
        value: minimalTonValue - MIN_EDGE_DELTA,
    });
    val notEnoughRes = net.send(deployer.address, notEnough);
    expect(notEnoughRes).toHaveFailedTx<AskToTransfer>({
        from: deployer.address,
        to: wallet.address,
        exitCode: Errors.NotEnoughGas,
    });
}

get fun `test personal gas: transfer minimal value is message-size aware`() {
    val dest = randomAddress();

    val bodySmall = buildTransferBody(ton("10"), 10, dest, dest, makeTinyForwardPayload());
    val feeSmall = estimateBodyForwardFee(bodySmall);
    val minSmall = calcMinimalPersonalTransferAmount(10, feeSmall) + MIN_EDGE_DELTA;

    val bodyBig = buildTransferBody(
        ton("10"),
        10,
        dest,
        dest,
        beginCell().storeUint(10, 100).toSlice(),
    );
    val feeBig = estimateBodyForwardFee(bodyBig);
    val minBig = calcMinimalPersonalTransferAmount(10, feeBig) + MIN_EDGE_DELTA;

    expect(minSmall).toBeLess(minBig);
}

get fun `test personal gas: transfer with forward amount requires second forward fee`() {
    val deployer = testing.treasury("deployer");
    val recipient = testing.treasury("recipient");
    val pm = deployPersonalMinterDirect(deployer.address);

    pm.sendMint(deployer.address, deployer.address, ton("100"), ton("0.02"), ton("0.7"));
    val walletAddr = pm.getWalletAddress(deployer.address);
    val wallet = PersonalWallet.fromAddress(walletAddr);

    val dest = recipient.address;
    val body = buildTransferBody(
        ton("10"),
        DEFAULT_FORWARD_TON_AMOUNT,
        dest,
        dest,
        makeRichForwardPayload(),
    );

    val fwdFee = estimateBodyForwardFee(body);
    val minWithoutForward = calcMinimalPersonalTransferAmount(0, fwdFee) + MIN_EDGE_DELTA;
    val minMissingSecondFee = minWithoutForward + DEFAULT_FORWARD_TON_AMOUNT;
    val minWithForward = calcMinimalPersonalTransferAmount(DEFAULT_FORWARD_TON_AMOUNT, fwdFee) +
    MIN_EDGE_DELTA;

    expect(minWithForward).toEqual(minWithoutForward + DEFAULT_FORWARD_TON_AMOUNT + fwdFee);

    val missingFeeMsg = createMessage({
        body,
        bounce: false,
        dest: wallet.address,
        value: minMissingSecondFee,
    });
    val missingFeeRes = net.send(deployer.address, missingFeeMsg);
    expect(missingFeeRes).toHaveFailedTx<AskToTransfer>({
        from: deployer.address,
        to: wallet.address,
        exitCode: Errors.NotEnoughGas,
    });

    val enoughMsg = createMessage({
        body,
        bounce: false,
        dest: wallet.address,
        value: minWithForward + fwdFee,
    });
    val enoughRes = net.send(deployer.address, enoughMsg);
    expect(enoughRes).toHaveSuccessfulTx<AskToTransfer>({
        from: deployer.address,
        to: wallet.address,
    });
}

get fun `test personal gas: burn safety floor requires 0.5 TON`() {
    val deployer = testing.treasury("deployer");
    val pm = deployPersonalMinterDirect(deployer.address);

    pm.sendMint(deployer.address, deployer.address, ton("100"), ton("0.02"), ton("0.7"));
    val walletAddr = pm.getWalletAddress(deployer.address);
    val wallet = PersonalWallet.fromAddress(walletAddr);

    // Below 0.5 TON should fail
    val underFloorRes = wallet.sendAskToBurn(
        deployer.address,
        0,
        ton("10"),
        deployer.address,
        null,
        { value: ton("0.49") },
    );
    expect(underFloorRes).toHaveFailedTx<AskToBurn>({
        from: deployer.address,
        to: wallet.address,
        exitCode: Errors.NotEnoughGas,
    });

    // 0.5 TON or above should succeed
    val enoughFloorRes = wallet.sendAskToBurn(
        deployer.address,
        0,
        ton("10"),
        deployer.address,
        null,
        { value: ton("0.5") },
    );
    expect(enoughFloorRes).toHaveSuccessfulTx<AskToBurn>({
        from: deployer.address,
        to: wallet.address,
    });
}

get fun `test personal gas: wallet storage fee should be measurable`() {
    val deployer = testing.treasury("deployer");
    val pm = deployPersonalMinterDirect(deployer.address);

    pm.sendMint(deployer.address, deployer.address, ton("100"), ton("0.02"), ton("0.7"));
    val walletAddr = pm.getWalletAddress(deployer.address);

    val state = testing.getAccountState(walletAddr);
    expect(state).toBeNotNull();
    if (state == null) {
        return;
    }

    val (cells, bits, _) = state.toCell().calculateSizeStrict(4096);
    val storageFee = calculateStorageFee(BASECHAIN, MIN_STORAGE_DURATION, bits, cells);

    expect(storageFee).toBeGreater(0);
    expect(calculatePersonalWalletMinStorageFee()).toBeGreater(0);
}
