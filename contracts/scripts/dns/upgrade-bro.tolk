import "@acton/build"
import "@acton/io"
import "@acton/emulation/network"
import "@acton/emulation/scripts"

import "@wrappers/DnsItem.gen"
import "@contracts/common/constants"
import "@contracts/common/messages"
import "@contracts/dns/dns-utils"
import "@contracts/dns/messages"
import "@contracts/dns/storage"

import "../utils/common"

fun main() {
    val deployer = promptJettonWallet("JETTON_ADMIN", "Select Jetton Admin ActonWallet");
    val collectionAddr = address("kQDqjJ7tPgsD3_s0v_PLzyLKUe1pu-rtOQyk6Tf8NfdgOlli");
    val oldABroAddr = address("kQBOFuhbLfXBlhRivIZMhgN4XTYj5XPAKb3nsx8uJI6Smx_f");

    println("==================================================");
    println("Upgrading .bro DnsCollection & a.bro in-place");
    println("Admin / Treasury: {}", deployer.address);
    println("Collection Address: {}", collectionAddr);
    println("==================================================");

    // 1. Destroy old a.bro item (deployed with old DnsItem code) to recover ~0.8 TON
    println("1. Recovering TON from old a.bro ({})...", oldABroAddr);
    val destroyOldRes = net.send(
        deployer.address,
        createMessage({
            bounce: false,
            value: grams("0.08"),
            dest: collectionAddr,
            body: DestroyDnsItem {
                queryId: 1,
                itemAddress: oldABroAddr,
                recipient: deployer.address,
            },
        }),
    );
    if (destroyOldRes.waitForFirstTransaction() != null) {
        println("   Old a.bro destroyed and TON recovered.");
    }

    // 2. HotUpgrade DnsCollection with fixed TEP-64 content and updated DnsItem code
    val collectionUri = "https://ankitgahlyan.github.io/brotherhood/dns/bro-collection.json";
    val newCollectionData = CollectionStorage {
        treasuryAddress: deployer.address,
        content: makeBroOffchainContentCell(collectionUri.beginParse()),
        nftItemCode: build("DnsItem"),
        deploymentTime: 1790927732,
        fiMinterAddress: DEPLOYED_FI_MINTER_ADDRESS,
    }.toCell();

    println("2. Sending HotUpgrade to DnsCollection ({})...", collectionAddr);
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
    println("   DnsCollection upgraded successfully!");

    // 3. Re-mint a.bro with the upgraded DnsItem code (includes TEP-64 name, image, description)
    println("3. Minting upgraded a.bro to Treasury...");
    val mintRes = net.send(
        deployer.address,
        createMessage({
            bounce: true,
            value: grams("0.25"),
            dest: collectionAddr,
            body: MintDomainFor {
                queryId: 2,
                targetOwner: deployer.address,
                payload: "a".beginParse(),
            },
        }),
    );
    if (mintRes.waitForFirstTransaction() == null) {
        println("ERROR: a.bro mint was not confirmed");
        return;
    }

    val newABro = DnsItem.fromStorage(ItemStorageNotInitialized {
        index: "a".literalSlice().hash(),
        collectionAddress: collectionAddr,
    });
    println("   Upgraded a.bro deployed at: {}", newABro.address);

    // 4. Restore a.bro wallet and SimpleX URI records
    val walletRecordCell = beginCell()
        .storeUint(0x9fd3, 16)
        .storeAddress(deployer.address)
        .storeUint(0, 8)
        .endCell();
    println("4. Restoring wallet & SimpleX contact records on a.bro...");
    val setWalletRes = net.send(
        deployer.address,
        createMessage({
            bounce: true,
            value: grams("0.05"),
            dest: newABro.address,
            body: ChangeDnsRecord {
                queryId: 3,
                key: "wallet".sha256(),
                value: beginCell().storeRef(walletRecordCell).endCell().beginParse(),
            },
        }),
    );
    setWalletRes.waitForFirstTransaction();

    val simplexUri = "https://smp15.simplex.im/a#GI3a66zgUDFl2EGNKsJGq9kIiAbuoccIsO-HOOQEnY4";
    val uriCell = beginCell().storeUint(0, 8).storeSlice(simplexUri.beginParse()).endCell();
    val setUriRes = net.send(
        deployer.address,
        createMessage({
            bounce: true,
            value: grams("0.05"),
            dest: newABro.address,
            body: ChangeDnsRecord {
                queryId: 4,
                key: "uri".sha256(),
                value: beginCell().storeRef(uriCell).endCell().beginParse(),
            },
        }),
    );
    setUriRes.waitForFirstTransaction();

    println("==================================================");
    println("Upgrade Complete! Collection: {}, a.bro: {}", collectionAddr, newABro.address);
    println("==================================================");
}
