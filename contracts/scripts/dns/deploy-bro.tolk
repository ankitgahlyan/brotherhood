import "@stdlib/strings"

import "@acton/build"
import "@acton/env"
import "@acton/io"
import "@acton/emulation/network"
import "@acton/emulation/scripts"

import "@wrappers/DnsCollection.gen"
import "@contracts/common/constants"
import "@contracts/dns/messages"
import "@contracts/dns/storage"

import "../utils/common"

fun main() {
    val deployer = promptJettonWallet("JETTON_ADMIN", "Select Jetton Admin ActonWallet");

    val collectionUri: string = env("BRO_DNS_COLLECTION_URI") ??
        "https://ankitgahlyan.github.io/brotherhood/dns/bro-collection.json";

    val nowTime = blockchain.now() as uint32;

    val collection = DnsCollection.fromStorage(CollectionStorage {
        treasuryAddress: deployer.address,
        content: collectionUri.prefixWith01().toCell(),
        nftItemCode: build("DnsItem"),
        deploymentTime: nowTime,
        fiMinterAddress: DEPLOYED_FI_MINTER_ADDRESS,
    });

    println("==================================================");
    println("Deploying Brotherhood .bro Authoritative DNS Zone");
    println("Deployer / Treasury: {}", deployer.address);
    println("FI Minter Address: {}", DEPLOYED_FI_MINTER_ADDRESS);
    println("Collection URI: {}", collectionUri);
    println("Deployment Time: {}", nowTime);
    println("==================================================");

    val deployResult = net.send(
        deployer.address,
        createMessage({
            bounce: false,
            value: grams("1"),
            dest: { stateInit: collection.stateInit! },
            body: FillUp { queryId: 0 },
        }),
    );

    if (deployResult.waitForFirstTransaction() == null) {
        println("ERROR: .bro Collection deployment was not confirmed");
        return;
    }

    println(".bro DNS Collection deployed at: {}", collection.address);
    println("BRO_DNS_COLLECTION_ADDRESS={}", collection.address);

    val data = collection.getCollectionData();
    println("Treasury/Owner Address: {}", data.ownerAddress);

    // Pre-mint genesis domain "genesis.bro" to the Treasury via MintDomainFor
    println("Registering genesis domain: genesis.bro");
    val mintRes = net.send(
        deployer.address,
        createMessage({
            bounce: true,
            value: grams("0.5"),
            dest: collection.address,
            body: MintDomainFor {
                queryId: 1,
                targetOwner: deployer.address,
                payload: "genesis".beginParse(),
            },
        }),
    );

    if (mintRes.waitForFirstTransaction() != null) {
        println("genesis.bro successfully minted to Treasury!");
    }

    println("==================================================");
    println(".bro DNS Zone Setup Complete!");
    println("==================================================");
}
