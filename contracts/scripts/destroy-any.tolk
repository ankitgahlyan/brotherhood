import "@acton/io"
import "@acton/prompts"
import "@acton/emulation/network"
import "@acton/emulation/scripts"

import "@contracts/common/messages"

import "utils/common"

// Opcode used by BrotherHood personal minters and wallets for destruction
const OP_DESTROY = 0x00001059 // 'dest' or match your contract's specific op::destroy

fun main() {
    // 1. Prompt for sender ActonWallet
    val sender = promptJettonWallet("SENDE", "Select sender ActonWallet to authorize destroy");
    val targetAddress = promptAddress("Enter target contract address to destroy");

    val genericMsg = createMessage({
        bounce: true,
        value: grams("0.1"),
        dest: targetAddress,
        body: Destroy {},
    });
    return net.send(sender.address, genericMsg);

    println("Destroy message dispatched to target contract.");
}
