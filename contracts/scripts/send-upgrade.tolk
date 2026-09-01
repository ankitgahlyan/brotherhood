import "@acton/build"
import "@acton/emulation/network"
import "@acton/emulation/scripts"

import "@wrappers/FossFi.gen"

import "utils/common"

fun main() {
    val admin = promptJettonWallet("JETTON_ADMIN", "Select Jetton Admin ActonWallet");
    val minter = FossFi.fromAddress(address(FI_ADDRESS));
    // val minter = promptJettonMinter("Enter Jetton Minter address");

    val walletUpgrade = promptWalletUpgrade(
        "JETTON_WALLET_UPGRADE",
    );

    val newCode = walletUpgrade ? build("FossFiWallet") : build("FossFi");

    minter.sendUpgrade(
        admin.address,
        walletUpgrade,
        0, // ignored by minter
        admin.address,
        null,
        newCode,
        { value: ton("0.2") },
    );
}
