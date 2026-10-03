import "@acton/io"
import "@acton/emulation/network"
import "@acton/emulation/scripts"

import "@wrappers/Personal.gen"

import "@wrappers/PersonalWallet.gen"

import "utils/common"

fun main() {
    val admin = promptJettonWallet("JETTON_ADMIN", "Select Jetton Admin ActonWallet");
    val adminAddr = promptJettonAddress(
        "PERSONAL_ADMIN_ADDRESS",
        "Enter Personal Token minter admin address",
        admin.address,
    );

    val minter = promptPersonalMinter("Enter Jetton Minter address");
    val personalWalletAddress = minter.getWalletAddress(adminAddr);
    val personalWallet = PersonalWallet.fromAddress(personalWalletAddress);

    if (scripts.isContractDeployed(personalWalletAddress)) {
        val wRes = personalWallet.sendDestroy(adminAddr);
        println(wRes.waitForTrace());
    }
    if (scripts.isContractDeployed(minter.address)) {
        val mRes = minter.sendDestroy(adminAddr);
        println(mRes.waitForTrace());
    }
}
