import "@acton/build"
import "@acton/io"
import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@acton/testing/expect"
import "@acton/types/transaction"
import "@gen/FossFiWallet.code"
import "@wrappers/FossFi.gen"
import "@wrappers/FossFiWallet.gen"
import "@wrappers/utils"
import "@contracts/common/errors"
import "@contracts/common/messages"
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
        "username@lat,long",
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
    expect(minterDataAll.currentRequest!.newUpgrade.walletUpgrade).toBeTrue();

    val time = testing.getNow();
    // testing.setNow(time + 1000); // 1000 seconds from now

    // val approveReq = minter.sendApproveUpgrade(deployer.address);
    // println(approveReq);
    // expect(approveReq).toHaveSuccessfulTx<ApproveUpgrade>({
    //     from: deployer.address,
    //     to: minter.address,
    // });
    // expect(minter.getJettonDataAll().currentRequest).toBeNull();
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

    val storage: FiWalletStore = FiWalletStore {
        addresses: Addresses {
            owner: deployer.address,
            treasury: deployer.address,
            baseFiWalletCode: fossFiWalletCompiledCode(),
            nomInAddrs: NomInAddrs {}.toCell(),
            trustedJettonAddrs: TrustedAddrs {
                minterAddr: minter.address,
                authorisedAccs: [],
            }.toCell(),
        }.toCell(),
        maps: Maps {
            allowances: [],
            invited: [],
            social: SocialMaps { votedFor: [], followings: [] }.toCell(),
            reportInfo: ReportInfo { reports: [] }.toCell(),
        }.toCell(), // todo: learn how to set it default
        timestamps: TimeStamps {}.toCell(),
    };
    val calcAddr = AutoDeployAddress {
        stateInit: walletStateInit(storage),
        toShard: { fixedPrefixLength: 8, closeTo: deployer.address },
    }.calculateAddress();

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
