import "@acton/emulation/scripts"

import "@wrappers/FossFi.gen"

import "@wrappers/FossFiWallet.gen"

import "utils/common"

fun main() {
    val admin = promptJettonWallet("JETTON_ADMIN", "Select Jetton Admin ActonWallet");

    val minter = promptJettonMinter("Enter Jetton Minter address");
    val fiWalletAddress = minter.getWalletAddress(admin.address);
    val fiWallet = FossFiWallet.fromAddress(fiWalletAddress);

    fiWallet.sendDestroy(admin.address);
    minter.sendDestroy(admin.address);
}
