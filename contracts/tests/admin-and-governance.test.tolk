import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@acton/testing/expect"
import "@acton/types/transaction"

import "@gen/FossFiWallet.code"
import "@gen/Lottery.code"
import "@wrappers/FossFi.gen"
import "@wrappers/FossFiWallet.gen"
import "@wrappers/utils"

import "@contracts/common/errors"
import "@contracts/common/messages"
import "@contracts/common/sharding"
import "@contracts/fossFi/consts"
import "@contracts/fossFi/storage"

import "test-utils"

get fun `test admin: deploy should create minter without bounce`() {
    val deployer = testing.treasury("deployer-manual-deploy");

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

    val deployResult = minter.sendDeploy(deployer.address, { value: ton("10") });
    expect(deployResult).toHaveSuccessfulDeploy<TopUpTons>({
        from: deployer.address,
        to: minter.address,
    });
    expect(deployResult).toNotHaveTx({
        from: minter.address,
        to: deployer.address,
        bounced: true,
    });
}

get fun `test admin: minter admin should be able to mint jettons`() {
    val (minter, deployer, notDeployer) = setupTest();
    val supplyBefore = minter.getTotalSupply();
    val deployerMint = ton("25");
    val otherMint = ton("7");

    val deployerWallet = mintTo(minter, deployer, deployer.address, deployerMint);
    val otherWallet = mintTo(minter, deployer, notDeployer.address, otherMint);

    expect(deployerWallet.getJettonBalance()).toEqual(deployerMint + ton("1"));
    expect(otherWallet.getJettonBalance()).toEqual(otherMint);
    expect(minter.getTotalSupply()).toEqual(supplyBefore + deployerMint + otherMint);
    assertSameShardPrefix(notDeployer.address, otherWallet.address);
}

get fun `test admin: non-admin should not be able to mint jettons`() {
    val (minter, deployer, notDeployer) = setupTest();
    val supplyBefore = minter.getTotalSupply();

    val mintResult = minter.sendMint(
        notDeployer.address,
        deployer.address,
        ton("5"),
        ton("0.05"),
        ton("0.3"),
    );
    expect(mintResult).toHaveFailedTx<MintNewJettons>({
        from: notDeployer.address,
        to: minter.address,
        exitCode: Errors.NotOwner,
    });

    val deployerWallet = userWallet(minter, deployer.address);
    expect(deployerWallet.getJettonBalance()).toEqual(ton("1"));
    expect(minter.getTotalSupply()).toEqual(supplyBefore);
}

get fun `test admin: proposed admin claims after the 1-week window and can then change back`() {
    testing.setNow(1_800_000_000);
    val (minter, deployer, notDeployer) = setupTest();
    expect(minter.getAdminAddress()).toEqual(deployer.address);

    // propose notDeployer as next admin; admin does not change yet
    val changeResult = minter.sendChangeMinterAdmin(
        deployer.address,
        0,
        notDeployer.address,
        { bounce: false, value: ton("0.05") },
    );
    expect(changeResult).toHaveSuccessfulTx<ChangeMinterAdmin>({
        from: deployer.address,
        to: minter.address,
    });
    expect(minter.getAdminAddress()).toEqual(deployer.address);

    // a new proposal cannot overwrite a pending one
    val redundantPropose = minter.sendChangeMinterAdmin(
        deployer.address,
        0,
        deployer.address,
        { bounce: false, value: ton("0.05") },
    );
    expect(redundantPropose).toHaveFailedTx<ChangeMinterAdmin>({
        from: deployer.address,
        to: minter.address,
        exitCode: Errors.WaitMore,
    });

    // someone who is not the proposed admin cannot claim
    val wrongClaimer = minter.sendClaimMinterAdmin(
        deployer.address,
        0,
        { bounce: false, value: ton("0.05") },
    );
    expect(wrongClaimer).toHaveFailedTx<ClaimMinterAdmin>({
        from: deployer.address,
        to: minter.address,
        exitCode: Errors.IncorrectSender,
    });

    // the proposed admin cannot claim before the 1-week window elapses
    val earlyClaim = minter.sendClaimMinterAdmin(
        notDeployer.address,
        0,
        { bounce: false, value: ton("0.05") },
    );
    expect(earlyClaim).toHaveFailedTx<ClaimMinterAdmin>({
        from: notDeployer.address,
        to: minter.address,
        exitCode: Errors.WaitMore,
    });

    // after the window, the proposed admin can claim and become admin
    testing.setNow(1_800_000_000 + ADMIN_HANDOVER_WAIT + 1);
    val lateClaim = minter.sendClaimMinterAdmin(
        notDeployer.address,
        0,
        { bounce: false, value: ton("0.05") },
    );
    expect(lateClaim).toHaveSuccessfulTx<ClaimMinterAdmin>({
        from: notDeployer.address,
        to: minter.address,
    });
    expect(minter.getAdminAddress()).toEqual(notDeployer.address);

    // the new admin can now propose a handoff back to the old admin
    minter.sendChangeMinterAdmin(
        notDeployer.address,
        0,
        deployer.address,
        { bounce: false, value: ton("0.05") },
    );
    testing.setNow(1_800_000_000 + 2 * ADMIN_HANDOVER_WAIT + 2);
    minter.sendClaimMinterAdmin(
        deployer.address,
        0,
        { bounce: false, value: ton("0.05") },
    );
    expect(minter.getAdminAddress()).toEqual(deployer.address);
}

get fun `test admin: current admin can drop a pending handoff within the window`() {
    testing.setNow(1_800_000_000);
    val (minter, deployer, notDeployer) = setupTest();

    minter.sendChangeMinterAdmin(
        deployer.address,
        0,
        notDeployer.address,
        { bounce: false, value: ton("0.05") },
    );
    expect(minter.getAdminAddress()).toEqual(deployer.address);

    // the current admin drops the pending handoff, keeping admin
    val dropResult = minter.sendDropMinterAdmin(
        deployer.address,
        0,
        { bounce: false, value: ton("0.05") },
    );
    expect(dropResult).toHaveSuccessfulTx<DropMinterAdmin>({
        from: deployer.address,
        to: minter.address,
    });
    expect(minter.getAdminAddress()).toEqual(deployer.address);

    // the dropped-appointee cannot claim (no pending handoff)
    val droppedClaim = minter.sendClaimMinterAdmin(
        notDeployer.address,
        0,
        { bounce: false, value: ton("0.05") },
    );
    expect(droppedClaim).toHaveFailedTx<ClaimMinterAdmin>({
        from: notDeployer.address,
        to: minter.address,
        exitCode: Errors.WaitMore,
    });

    // a fresh proposal replaces the cleared slot
    val rePropose = minter.sendChangeMinterAdmin(
        deployer.address,
        0,
        notDeployer.address,
        { bounce: false, value: ton("0.05") },
    );
    expect(rePropose).toHaveSuccessfulTx<ChangeMinterAdmin>({
        from: deployer.address,
        to: minter.address,
    });

    testing.setNow(1_800_000_000 + ADMIN_HANDOVER_WAIT + 1);
    minter.sendClaimMinterAdmin(
        notDeployer.address,
        0,
        { bounce: false, value: ton("0.05") },
    );
    expect(minter.getAdminAddress()).toEqual(notDeployer.address);
}

get fun `test admin: non-admin cannot change admin`() {
    val (minter, deployer, notDeployer) = setupTest();

    val changeResult = minter.sendChangeMinterAdmin(
        notDeployer.address,
        0,
        deployer.address,
        { bounce: false, value: ton("0.05") },
    );
    expect(changeResult).toHaveFailedTx<ChangeMinterAdmin>({
        from: notDeployer.address,
        to: minter.address,
        exitCode: Errors.NotOwner,
    });
    expect(minter.getAdminAddress()).toEqual(deployer.address);
}

get fun `test admin: admin can change metadata uri`() {
    val (minter, deployer, _) = setupTest();
    val newUri = "https://new.meta.example/jetton.json";

    val oldUri = extractUriString(minter.getContent());
    expect(oldUri).toBeNotNull();

    val changeResult = minter.sendChangeMinterMetadata(
        deployer.address,
        0,
        buildTestMetadata(newUri),
        { bounce: false, value: ton("0.05") },
    );
    expect(changeResult).toHaveSuccessfulTx<ChangeMinterMetadata>({
        from: deployer.address,
        to: minter.address,
    });

    val updatedUri = extractUriString(minter.getContent());
    expect(updatedUri).toBeNotNull();
    if (updatedUri == null) {
        return;
    }
    expect(updatedUri).toEqual(newUri);
}

get fun `test admin: non-admin cannot change metadata uri`() {
    val (minter, _, notDeployer) = setupTest();
    val oldContentHash = minter.getContent().hash();

    val changeResult = minter.sendChangeMinterMetadata(
        notDeployer.address,
        0,
        buildTestMetadata("https://evil.meta.example/jetton.json"),
        { bounce: false, value: ton("0.05") },
    );
    expect(changeResult).toHaveFailedTx<ChangeMinterMetadata>({
        from: notDeployer.address,
        to: minter.address,
        exitCode: Errors.NotOwner,
    });
    expect(minter.getContent().hash()).toEqual(oldContentHash);
}

get fun `test admin: discovery should return expected wallet and optional owner`() {
    val (minter, deployer, notDeployer) = setupTest();
    mintTo(minter, deployer, deployer.address, ton("1"));

    val expectedDeployerWallet = userWallet(minter, deployer.address).address;
    val withOwnerRes = minter.sendRequestWalletAddress(
        deployer.address,
        0,
        deployer.address,
        true,
        { bounce: false, value: ton("0.1") },
    );
    val withOwnerTx = withOwnerRes.findTransaction<ResponseWalletAddress>({
        from: minter.address,
        to: deployer.address,
        success: true,
        exitCode: 0,
    });
    expect(withOwnerTx).toBeNotNull();
    val withOwnerBody = withOwnerTx!.loadBody<ResponseWalletAddress>();
    expect(withOwnerBody.jettonWalletAddress).toEqual(expectedDeployerWallet);
    expect(withOwnerBody.owner).toBeNotNull();
    if (withOwnerBody.owner == null) {
        return;
    }
    expect(withOwnerBody.owner.load()).toEqual(deployer.address);

    val expectedOtherWallet = userWallet(minter, notDeployer.address).address;
    val withoutOwnerRes = minter.sendRequestWalletAddress(
        deployer.address,
        0,
        notDeployer.address,
        false,
        { bounce: false, value: ton("0.1") },
    );
    val withoutOwnerTx = withoutOwnerRes.findTransaction<ResponseWalletAddress>({
        from: minter.address,
        to: deployer.address,
        success: true,
        exitCode: 0,
    });
    expect(withoutOwnerTx).toBeNotNull();
    val withoutOwnerBody = withoutOwnerTx!.loadBody<ResponseWalletAddress>();
    expect(withoutOwnerBody.jettonWalletAddress).toEqual(expectedOtherWallet);
    expect(withoutOwnerBody.owner).toEqual(null);
}

get fun `test admin: discovery should return none for non-basechain owner`() {
    val (minter, deployer, _) = setupTest();
    val invalidOwner = address.fromWorkchainAndHash(-1, 0);

    val noOwnerRes = minter.sendRequestWalletAddress(
        deployer.address,
        0,
        invalidOwner,
        false,
        { bounce: false, value: ton("0.1") },
    );
    val noOwnerTx = noOwnerRes.findTransaction<ResponseWalletAddress>({
        from: minter.address,
        to: deployer.address,
        success: true,
        exitCode: 0,
    });
    expect(noOwnerTx).toBeNotNull();
    val noOwnerBody = noOwnerTx!.loadBody<ResponseWalletAddress>();
    expect(noOwnerBody.jettonWalletAddress).toEqual(null);
    expect(noOwnerBody.owner).toEqual(null);

    val withOwnerRes = minter.sendRequestWalletAddress(
        deployer.address,
        0,
        invalidOwner,
        true,
        { bounce: false, value: ton("0.1") },
    );
    val withOwnerTx = withOwnerRes.findTransaction<ResponseWalletAddress>({
        from: minter.address,
        to: deployer.address,
        success: true,
        exitCode: 0,
    });
    expect(withOwnerTx).toBeNotNull();
    val withOwnerBody = withOwnerTx!.loadBody<ResponseWalletAddress>();
    expect(withOwnerBody.jettonWalletAddress).toEqual(null);
    expect(withOwnerBody.owner).toBeNotNull();
    if (withOwnerBody.owner == null) {
        return;
    }
    expect(withOwnerBody.owner.load()).toEqual(invalidOwner);
}

get fun `test shard: wallet address should keep owner shard prefix in get/discovery/transfer`() {
    val (minter, deployer, _) = setupTest();
    val _senderWallet = mintTo(minter, deployer, deployer.address, ton("100"));

    var prefix = 0;
    while (prefix < 32) {
        val owner = address.fromWorkchainAndHash(0, prefix << 248);
        val expectedWalletAddress = minter.getWalletAddress(owner);
        assertSameShardPrefix(owner, expectedWalletAddress);

        val discovery = minter.sendRequestWalletAddress(
            deployer.address,
            0,
            owner,
            true,
            { bounce: false, value: ton("0.1") },
        );
        val discoveryTx = discovery.findTransaction<ResponseWalletAddress>({
            from: minter.address,
            to: deployer.address,
            success: true,
            exitCode: 0,
        });
        expect(discoveryTx).toBeNotNull();
        val discoveryBody = discoveryTx!.loadBody<ResponseWalletAddress>();
        expect(discoveryBody.jettonWalletAddress).toEqual(expectedWalletAddress);

        prefix += 1;
    }
}

get fun `test admin: admin or dao can set daoAddress and dao can perform privileged actions`() {
    val (minter, deployer, notDeployer) = setupTest();
    val dao = testing.treasury("dao-account");

    expect(minter.getDaoAddress()).toBeNull();

    val changeDaoResult = minter.sendChangeDaoAddress(
        deployer.address,
        0,
        dao.address,
        { value: ton("0.1") },
    );
    expect(changeDaoResult).toNotHaveTx({ bounced: true });
    expect(minter.getDaoAddress()).toEqual(dao.address);

    val mintAmount = ton("50");
    val daoMintResult = minter.sendMintNewJettons(
        dao.address,
        0,
        notDeployer.address,
        ton("0.1"),
        InternalTransferStep {
            queryId: 0,
            jettonAmount: mintAmount,
            version: 0,
            transferredAsCredit: false,
            transferInitiator: dao.address,
            sendExcessesTo: dao.address,
            forwardTonAmount: 0,
            forwardPayload: createEmptyCell().beginParse(),
        },
        { value: ton("0.2") },
    );
    expect(daoMintResult).toNotHaveTx({ bounced: true });

    val newDao = testing.treasury("new-dao-account");
    val daoChangeResult = minter.sendChangeDaoAddress(
        dao.address,
        0,
        newDao.address,
        { value: ton("0.1") },
    );
    expect(daoChangeResult).toNotHaveTx({ bounced: true });
    expect(minter.getDaoAddress()).toEqual(newDao.address);

    val unauthorizedMintResult = minter.sendMintNewJettons(
        notDeployer.address,
        0,
        notDeployer.address,
        ton("0.1"),
        InternalTransferStep {
            queryId: 0,
            jettonAmount: mintAmount,
            version: 0,
            transferredAsCredit: false,
            transferInitiator: notDeployer.address,
            sendExcessesTo: notDeployer.address,
            forwardTonAmount: 0,
            forwardPayload: createEmptyCell().beginParse(),
        },
        { value: ton("0.2") },
    );
    expect(unauthorizedMintResult).toHaveTx({
        from: notDeployer.address,
        to: minter.address,
        exitCode: Errors.NotOwner,
    });
}

fun extractUriString(contentCell: cell): string? {
    val metadata = OnchainMetadataReply.fromCell(contentCell);
    val uriCell = metadata.contentDict.get("uri".sha256());
    if (!uriCell.isFound) {
        return null;
    }
    val prefixed = uriCell.loadValue();
    var s = (prefixed as unknown as cell).beginParse();
    s.loadUint(8);
    return s.loadString();
}

fun assertSameShardPrefix(owner: address, wallet: address) {
    val (_, ownerHash) = owner.getWorkchainAndHash();
    val (_, walletHash) = wallet.getWorkchainAndHash();
    expect(ownerHash >> (256 - SHARD_DEPTH)).toEqual(walletHash >> (256 - SHARD_DEPTH));
}
