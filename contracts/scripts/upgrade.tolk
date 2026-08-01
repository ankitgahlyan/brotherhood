import "@acton/build"
import "@acton/emulation/network"
import "@acton/emulation/scripts"
import "@wrappers/FossFi.gen"
import "utils/common"

fun main() {
    val admin = promptJettonWallet("JETTON_ADMIN", "Select Jetton Admin ActonWallet");
    val minter = promptJettonMinter("Enter Jetton Minter address");

    val walletUpgrade = promptWalletUpgrade(
        "JETTON_WALLET_UPGRADE",
    );

    // val newCode = walletUpgrade ? fossFiWalletCompiledCode() : fossFiCompiledCode();
    val newCode = walletUpgrade ? build("fossFiWallet") : build("fossFi");

    val res = minter.sendUpgrade(
        admin.address,
        walletUpgrade,
        0, // ignored by minter
        admin.address,
        null,
        newCode,
        { value: ton("0.2") },
    );
    res.waitForFirstTransaction();

    // todo: let the time pass on mainnet (send separate msg)
    val res2 = minter.sendApproveUpgrade(admin.address);
    res2.waitForFirstTransaction();
}
