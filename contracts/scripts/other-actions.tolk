import "@acton/emulation/network"
import "@acton/emulation/scripts"
import "@wrappers/FossFi.gen"
import "@wrappers/FossFiWallet.gen"
import "utils/common"

fun main() {
    val sender = promptJettonWallet("JETTON_SENDER", "Select Jetton Sender ActonWallet").address;
    // val sender = address(JETTON_DEFAULT_DEPLOYER);
    val minter = promptJettonMinter("Enter Jetton Minter address");
    val recipient = promptJettonAddressRequired(
        "JETTON_TRANSFER_RECIPIENT",
        "Enter transfer recipient",
    );
    val transferAmount = promptJettonCoins(
        "JETTON_TRANSFER_AMOUNT",
        "Enter transfer amount",
        JETTON_DEFAULT_TRANSFER_AMOUNT,
    );

    val senderWallet = FossFiWallet { address: minter.getWalletAddress(sender) };
    // val res = senderWallet.sendTransferPayloadInline(
    val res = senderWallet.sendOthersActions(
        sender,
        111,
        transferAmount,
        recipient,
        sender,
        null,
        1,
        "from_script",
        { value: ton("0.55") },
    );
    res.waitForFirstTransaction();

    printJettonMinterInfo(minter, "JETTON");
    printJettonWalletInfo(minter, sender, "JETTON_SENDER");
    printJettonWalletInfo(minter, recipient, "JETTON_RECIPIENT");
}
