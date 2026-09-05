import "@acton/emulation/scripts"

import "@wrappers/Personal.gen"

import "@wrappers/PersonalWallet.gen"

import "utils/common"

fun main() {
    val admin = promptJettonWallet("JETTON_ADMIN", "Select Jetton Admin ActonWallet");

    val minter = promptPersonalMinter("Enter Jetton Minter address");
    val personalWalletAddress = minter.getWalletAddress(admin.address);
    val personalWallet = PersonalWallet.fromAddress(personalWalletAddress);

    personalWallet.sendDestroy(admin.address);
    minter.sendDestroy(admin.address);
}
