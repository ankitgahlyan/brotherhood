import "@acton/build"
import "@acton/io"
import "@acton/emulation/network"
import "@acton/emulation/scripts"

import "@contracts/common/constants"
import "@contracts/common/messages"
import "@contracts/dns/dns-utils"
import "@contracts/dns/storage"

import "../utils/common"

fun main() {
    val deployer = promptJettonWallet("JETTON_ADMIN", "Select Jetton Admin ActonWallet");
    val collectionAddr = DEPLOYED_BRO_COLLECTION_RESOLVER;
    println("==================================================");
    println("Upgrading .bro DnsCollection in-place");
    println("Treasury: {}", deployer.address);
    println("Collection Address: {}", collectionAddr);
    println("==================================================");

    // 1. HotUpgrade DnsCollection with updated DnsCollection code and latest DnsItem code
    val collectionUri = "https://ankitgahlyan.github.io/brotherhood/dns/bro-collection.json";
    val newCollectionData = CollectionStorage {
        treasuryAddress: deployer.address,
        content: makeBroOffchainContentCell(collectionUri.beginParse()),
        nftItemCode: build("DnsItem"),
        deploymentTime: 1790927732,
        fiMinterAddress: DEPLOYED_FI_MINTER_ADDRESS,
    }.toCell();

    println("1. Sending HotUpgrade to DnsCollection ({})...", collectionAddr);
    val upgradeCollRes = net.send(
        deployer.address,
        createMessage({
            bounce: true,
            value: grams("0.1"),
            dest: collectionAddr,
            body: HotUpgrade {
                additionalData: newCollectionData,
                code: build("DnsCollection"),
            },
        }),
    );
    if (upgradeCollRes.waitForFirstTransaction() == null) {
        println("ERROR: DnsCollection HotUpgrade was not confirmed");
        return;
    }
    println("   DnsCollection upgraded successfully with latest DnsItem code embedded!");
    println("   DNS Items can now pull upgrades directly from DnsCollection via RequestUpgradeCode.");
    println("==================================================");
    println("DNS Upgrade Complete!");
    println("==================================================");
}
