import "@acton/build"
import "@acton/emulation/network"
import "@acton/emulation/scripts"

import "@wrappers/Personal.gen"

import "utils/common"

fun main() {
    val admin = promptJettonWallet("JETTON_ADMIN", "Select Jetton Admin ActonWallet");
    val minter = promptPersonalMinter("Enter Jetton Minter address");

    minter.sendUpgrade(
        admin.address,
        false,
        0, // ignored by minter
        admin.address,
        null,
        build("PersonalMinter"),
        { value: ton("0.2") },
    );
}
