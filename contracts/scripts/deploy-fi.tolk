import "@acton/build"
import "@acton/emulation/scripts"
import "@acton/emulation/testing"

import "utils/common"

fun main() {
    testing.registerLibrary(build("FossFiWallet"));
    testing.registerLibrary(build("Location"));
    testing.registerLibrary(build("Dao"));
    testing.registerLibrary(build("DaoVoter"));

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

    // deploy and update dao Address in minter

    printJettonMinterInfo(minter, "JETTON");
    printJettonWalletInfo(minter, admin, "JETTON_ADMIN");
    // update FI_ADDRESS
    // comment fossFiWalletLibraryRef
    // refactor code and send initial upgrade to fiWallet to replace code to lib ref
}
