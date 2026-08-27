import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@acton/testing/expect"

import "@gen/Location.code"
import "@wrappers/FossFi.gen"
import "@wrappers/FossFiWallet.gen"
import "@wrappers/Location.gen"
import "@contracts/common/errors"
import "@contracts/common/messages"
import "@contracts/location/location-utils"

import "test-utils"

const H3_NYC = "882a100d31fffff"
const H3_SF = "8828308281fffff"

fun getLocationContract(minterAddress: address, h3Cell: string): Location {
    val deployInfo = calcDeployLocation(h3Cell, minterAddress, locationCompiledCodeLibraryRef());
    return Location.fromAddress(deployInfo.calculateAddress());
}

get fun `test location: lazy deploy on invite and membership tracking`() {
    val (minter, deployer, _) = setupTest();
    val rootWallet = userWallet(minter, deployer.address);

    val alice = testing.treasury("alice-location");
    val aliceWallet = userWallet(minter, alice.address);

    val locationNyc = getLocationContract(minter.address, H3_NYC);

    // Before invite, location contract is deployed on invite
    val inviteAlice = rootWallet.sendActInvite(
        deployer.address,
        0,
        alice.address,
        "alice",
        H3_NYC,
        840,
        { value: ton("1") },
    );
    expect(inviteAlice).toHaveSuccessfulDeploy<InternalInvite>({
        from: rootWallet.address,
        to: aliceWallet.address,
    });
    expect(inviteAlice).toHaveSuccessfulDeploy<LocationAddMember>({
        from: minter.address,
        to: locationNyc.address,
    });

    expect(locationNyc.getH3Cell()).toEqual(H3_NYC);
    expect(locationNyc.getMinterAddress()).toEqual(minter.address);
    expect(locationNyc.getMemberCount()).toEqual(1);
    expect(locationNyc.isMember(alice.address)).toBeTrue();

    // Invite a second user to same H3 cell
    val bob = testing.treasury("bob-location");
    val _bobWallet = userWallet(minter, bob.address);

    val inviteBob = rootWallet.sendActInvite(
        deployer.address,
        0,
        bob.address,
        "bob",
        H3_NYC,
        840,
        { value: ton("1") },
    );
    expect(inviteBob).toHaveSuccessfulTx<LocationAddMember>({
        from: minter.address,
        to: locationNyc.address,
    });

    expect(locationNyc.getMemberCount()).toEqual(2);
    expect(locationNyc.isMember(alice.address)).toBeTrue();
    expect(locationNyc.isMember(bob.address)).toBeTrue();
}

get fun `test location: change location migrates between H3 cells`() {
    val (minter, deployer, _) = setupTest();
    val rootWallet = userWallet(minter, deployer.address);

    val alice = testing.treasury("alice-moving");
    val aliceWallet = userWallet(minter, alice.address);

    rootWallet.sendActInvite(
        deployer.address,
        0,
        alice.address,
        "alice",
        H3_NYC,
        840,
        { value: ton("1") },
    );

    val locationNyc = getLocationContract(minter.address, H3_NYC);
    val locationSf = getLocationContract(minter.address, H3_SF);

    expect(locationNyc.getMemberCount()).toEqual(1);
    expect(locationNyc.isMember(alice.address)).toBeTrue();

    // Alice moves from NYC to SF
    val moveRes = aliceWallet.sendChangeLocation(
        alice.address,
        0,
        H3_SF,
        { value: ton("0.2") },
    );
    expect(moveRes).toHaveSuccessfulTx<ChangeLocation>({
        from: alice.address,
        to: aliceWallet.address,
    });
    expect(moveRes).toHaveSuccessfulTx<LocationRemoveMember>({
        from: minter.address,
        to: locationNyc.address,
    });
    expect(moveRes).toHaveSuccessfulDeploy<LocationAddMember>({
        from: minter.address,
        to: locationSf.address,
    });

    expect(locationNyc.getMemberCount()).toEqual(0);
    expect(locationNyc.isMember(alice.address)).toBeFalse();

    expect(locationSf.getMemberCount()).toEqual(1);
    expect(locationSf.isMember(alice.address)).toBeTrue();
    expect(aliceWallet.getH3Cell()).toEqual(H3_SF);
}

get fun `test location: reject direct unauthorized member addition`() {
    val (minter, deployer, _) = setupTest();
    val imposter = testing.treasury("imposter");
    val targetUser = testing.treasury("target-user");

    val locationNyc = Location.fromStorage(
        LocationStore {
            h3Cell: H3_NYC,
            minterAddress: minter.address,
            memberCount: 0,
            members: [],
            version: 0,
        },
    );
    locationNyc.deploy(deployer.address, { value: ton("0.5") });

    val unauthorizedRes = locationNyc.sendLocationAddMember(
        imposter.address,
        1,
        targetUser.address,
        imposter.address,
        { value: ton("0.1") },
    );
    expect(unauthorizedRes).toHaveFailedTx<LocationAddMember>({
        from: imposter.address,
        to: locationNyc.address,
        exitCode: Errors.NotOwner,
    });
}
