import "@acton/build"
import "@acton/io"
import "@acton/emulation/network"
import "@acton/emulation/scripts"

import "@wrappers/Personal.gen"

import "utils/common"

fun main() {
    val admin = promptJettonWallet("JETTON_ADMIN", "Select Jetton Admin ActonWallet");
    val minter = promptPersonalMinter("Enter Personal Minter address");

    val walletUpgrade = promptWalletUpgrade("WALLET_UPGRADE");
    val newCode = walletUpgrade ? build("PersonalWallet") : build("PersonalMinter");

    minter
        .sendUpgrade(
            admin.address,
            walletUpgrade,
            0, // ignored by minter
            admin.address,
            null,
            newCode,
            { value: grams("0.2") },
        )
        .waitForTrace();
    println("Upgrade trace settled successfully.");
}
