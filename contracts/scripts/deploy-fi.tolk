import "@acton/emulation/scripts"

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

    // deploy and initialize daoProxy
    val _daoProxy = deployDaoProxy(deployer, admin, minter.address);

    printJettonMinterInfo(minter, "JETTON");
    printJettonWalletInfo(minter, admin, "JETTON_ADMIN");
    // update FI_ADDRESS for frontend and interaction scripts
    // comment all libRefs
    // refactor code and send initial upgrade to fiWallet to replace code to lib ref
}
