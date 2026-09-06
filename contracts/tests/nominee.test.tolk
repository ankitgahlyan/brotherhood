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
    val setTx = wallet.sendChangeNominee(
        owner.address,
        0,
        nominee1.address,
        { value: ton("0.1") },
    );

    expect(setTx).toHaveSuccessfulTx<ChangeNominee>({
        from: owner.address,
        to: wallet.address,
    });

    val afterData = wallet.getWalletDataAll();
    val afterNomins = afterData.addresses.load().nomInAddrs.load();
    expect(afterNomins.nominee! == nominee1.address).toBeTrue();

    // Owner updates nominee to another address
    val nominee2 = testing.treasury("nominee-second");
    val updateTx = wallet.sendChangeNominee(
        owner.address,
        0,
        nominee2.address,
        { value: ton("0.1") },
    );

    expect(updateTx).toHaveSuccessfulTx<ChangeNominee>({
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

    val tx = wallet.sendChangeNominee(
        outsider.address, // non-owner
        0,
        nominee.address,
        { value: ton("0.1") },
    );

    expect(tx).toHaveFailedTx({
        to: wallet.address,
        exitCode: Errors.IncorrectSender,
    });
}

get fun `test nominee: nominating owner or self wallet fails with InvalidMessage`() {
    val (wallet, owner, _minter, _outsider) = setupDirectWallet(ton("10"));

    // Attempt to nominate owner
    val txOwner = wallet.sendChangeNominee(
        owner.address,
        0,
        owner.address,
        { value: ton("0.1") },
    );

    expect(txOwner).toHaveFailedTx({
        to: wallet.address,
        exitCode: Errors.InvalidMessage,
    });

    // Attempt to nominate contract itself
    val txSelf = wallet.sendChangeNominee(
        owner.address,
        0,
        wallet.address,
        { value: ton("0.1") },
    );

    expect(txSelf).toHaveFailedTx({
        to: wallet.address,
        exitCode: Errors.InvalidMessage,
    });
}

get fun `test nominee: closure transfers remaining assets to updated nominee`() {
    val (minter, deployer, notDeployer) = setupTest();
    val ownerWallet = userWallet(minter, deployer.address);
    val userWallet = activateUser(minter, ownerWallet, deployer, notDeployer.address);

    // Initial nominee of userWallet was ownerWallet (set by InternalInvite)
    val chosenNominee = testing.treasury("chosen-nominee");

    // Change nominee to chosenNominee
    val changeTx = userWallet.sendChangeNominee(
        notDeployer.address,
        0,
        chosenNominee.address,
        { value: ton("0.1") },
    );
    expect(changeTx).toHaveSuccessfulTx<ChangeNominee>({
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
