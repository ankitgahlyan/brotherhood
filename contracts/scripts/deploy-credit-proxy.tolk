import "@acton/io"

import "@acton/emulation/scripts"

import "@contracts/common/constants"

import "utils/common"

fun main() {
    val deployer = promptJettonWallet("DEPLOYER", "Select Deployer");
    val admin = promptJettonAddress(
        "ADMIN_ADDRESS",
        "Enter admin address",
        deployer.address,
    );
    val fiMinter = promptJettonAddress(
        "FI_MINTER_ADDRESS",
        "Enter FossFi minter address",
        DEPLOYED_FI_MINTER_ADDRESS,
    );

    val creditProxy = deployCreditProxy(deployer, admin, fiMinter);
    println("\n==================================================");
    println("  CreditProxy Deployed Successfully!             ");
    println("==================================================");
    println("CREDIT_PROXY_ADDRESS={}", creditProxy.address);
    println("ADMIN_ADDRESS={}", admin);
    println("FI_MINTER_ADDRESS={}", fiMinter);
}
