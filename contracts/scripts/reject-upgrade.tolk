import "@acton/emulation/scripts"

import "@wrappers/FossFi.gen"

import "utils/common"

fun main() {
    val admin = promptJettonWallet("JETTON_ADMIN", "Select Jetton Admin ActonWallet");
    val minter = FossFi.fromAddress(address(FI_ADDRESS));

    minter.sendRejectUpgrade(admin.address);
}
