import "@acton/emulation/scripts"
import "@wrappers/FossFi.gen"
import "utils/common"

fun main() {
    val admin = promptJettonWallet("JETTON_ADMIN", "Select Jetton Admin ActonWallet");
    val minter = promptJettonMinter("Enter Jetton Minter address");

    minter.sendDestroy(admin.address);
}
