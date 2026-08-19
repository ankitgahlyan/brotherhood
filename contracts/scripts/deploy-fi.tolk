import "@acton/emulation/scripts"

import "@wrappers/FossFi.gen"

import "utils/common"

fun main() {
    // make sure to deploy libs first then deploy

    val deployer = promptJettonWallet("JETTON_DEPLOYER", "Select Jetton Deployer");
    val admin = promptJettonAddress(
        "JETTON_ADMIN_ADDRESS",
        "Enter admin address",
        deployer.address,
    );
    val storage = promptJettonMinterStorage(admin);

    val minter = deployJettonMinter(deployer, storage);

    // check if minter is deployed successfully

    // initialize location addrs
    val locationAddrs = buildLocationAddrsMap(minter.address, deployer.address);
    minter.sendSetLocationAddresses(deployer.address, 1, locationAddrs);

    // deploy and update dao Address in minter

    printJettonMinterInfo(minter, "JETTON");
    printJettonWalletInfo(minter, admin, "JETTON_ADMIN");
    // update FI_ADDRESS
    // comment fossFiWalletLibraryRef
    // refactor code and send initial upgrade to fiWallet to replace code to lib ref
}
