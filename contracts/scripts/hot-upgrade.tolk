import "@acton/build"
import "@acton/emulation/network"
import "@acton/emulation/scripts"
import "@wrappers/FossFi.gen"
import "utils/common"

fun main() {
    val admin = promptJettonWallet("JETTON_ADMIN", "Select Jetton Admin ActonWallet");
    val minter = promptJettonMinter("Enter Jetton Minter address");

    val res = minter.sendHotUpgrade(
        admin.address,
        null,
        build("fossFi"),
        { value: ton("0.1") },
    );

    res.waitForTrace();

    printJettonMinterInfo(minter, "After HotUpgrade");
}
