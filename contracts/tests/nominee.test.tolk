import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@acton/testing/expect"

import "@wrappers/FossFiWallet.gen"
import "@contracts/common/errors"
import "@contracts/common/messages"

import "test-utils"

get fun `test nominee: allows setting nominee when unset and updating by owner`() {
    val (wallet, owner, _minter, nominee1) = setupDirectWallet(ton("10"));

    // Verify initial nominee is null
    val initData = wallet.getWalletDataAll();
    val initNomins = initData.addresses.load().nomInAddrs.load();
    expect(initNomins.nominee == null).toBeTrue();

    // Owner sets nominee to nominee1
    val setTx = wallet.sendChangeProfile(
        owner.address,
        0,
        null,
        null,
        null,
        nominee1.address,
        { value: ton("1") },
    );

    expect(setTx).toHaveSuccessfulTx<ChangeProfile>({
        from: owner.address,
        to: wallet.address,
    });

    val afterData = wallet.getWalletDataAll();
    val afterNomins = afterData.addresses.load().nomInAddrs.load();
    expect(afterNomins.nominee! == nominee1.address).toBeTrue();

    // Owner updates nominee to another address
    val nominee2 = testing.treasury("nominee-second");
    val updateTx = wallet.sendChangeProfile(
        owner.address,
        0,
        null,
        null,
        null,
        nominee2.address,
        { value: ton("1") },
    );

    expect(updateTx).toHaveSuccessfulTx<ChangeProfile>({
        from: owner.address,
        to: wallet.address,
    });

    val finalData = wallet.getWalletDataAll();
    val finalNomins = finalData.addresses.load().nomInAddrs.load();
    expect(finalNomins.nominee! == nominee2.address).toBeTrue();
}

get fun `test nominee: non-owner change nominee fails with IncorrectSender`() {
    val (wallet, _owner, _minter, outsider) = setupDirectWallet(ton("10"));
    val nominee = testing.treasury("nominee-target");

    val tx = wallet.sendChangeProfile(
        outsider.address, // non-owner
        0,
        null,
        null,
        null,
        nominee.address,
        { value: ton("1") },
    );

    expect(tx).toHaveFailedTx({
        to: wallet.address,
        exitCode: Errors.IncorrectSender,
    });
}

get fun `test nominee: allows setting nominee to self or owner address`() {
    val (wallet, owner, _minter, _outsider) = setupDirectWallet(ton("10"));

    // Setting nominee to owner
    val txOwner = wallet.sendChangeProfile(
        owner.address,
        0,
        null,
        null,
        null,
        owner.address,
        { value: ton("1") },
    );

    expect(txOwner).toHaveSuccessfulTx<ChangeProfile>({
        from: owner.address,
        to: wallet.address,
    });

    val dataOwner = wallet.getWalletDataAll();
    expect(dataOwner.addresses.load().nomInAddrs.load().nominee! == owner.address).toBeTrue();

    // Setting nominee to wallet self contract
    val txSelf = wallet.sendChangeProfile(
        owner.address,
        0,
        null,
        null,
        null,
        wallet.address,
        { value: ton("1") },
    );

    expect(txSelf).toHaveSuccessfulTx<ChangeProfile>({
        from: owner.address,
        to: wallet.address,
    });

    val dataSelf = wallet.getWalletDataAll();
    expect(dataSelf.addresses.load().nomInAddrs.load().nominee! == wallet.address).toBeTrue();
}

get fun `test nominee: closure transfers remaining assets to updated nominee`() {
    val (minter, deployer, notDeployer) = setupTest();
    val ownerWallet = userWallet(minter, deployer.address);
    val userWallet = activateUser(minter, ownerWallet, deployer, notDeployer.address);

    // Initial nominee of userWallet was ownerWallet (set by InternalInvite)
    val chosenNominee = testing.treasury("chosen-nominee");

    // Change nominee to chosenNominee
    val changeTx = userWallet.sendChangeProfile(
        notDeployer.address,
        0,
        null,
        null,
        null,
        chosenNominee.address,
        { value: ton("1") },
    );
    expect(changeTx).toHaveSuccessfulTx<ChangeProfile>({
        from: notDeployer.address,
        to: userWallet.address,
    });

    // Close account and verify closure message sends assets to chosenNominee
    val closeTx = userWallet.sendActCloseAccount(
        notDeployer.address,
        0,
        { value: ton("1") },
    );

    expect(closeTx).toHaveSuccessfulTx<ActCloseAccount>({
        from: notDeployer.address,
        to: userWallet.address,
    });
}
