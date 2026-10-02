import "@stdlib/strings"

import "@acton/build"
import "@acton/env"
import "@acton/io"
import "@acton/emulation/network"
import "@acton/emulation/scripts"

import "@wrappers/DnsCollection.gen"
import "@wrappers/DnsItem.gen"
import "@contracts/common/constants"
import "@contracts/dns/messages"
import "@contracts/dns/storage"

import "../utils/common"

fun destroyOldCollectionAndGenesis(deployerAddr: address, oldCollectionAddr: address) {
    val oldGenesis = DnsItem.fromStorage(ItemStorageNotInitialized {
        index: "genesis".literalSlice().hash(),
        collectionAddress: oldCollectionAddr,
    });

    println(
        "Destroying old genesis.bro item ({}) via collection ({})...",
        oldGenesis.address,
        oldCollectionAddr,
    );
    val destroyItemRes = net.send(
        deployerAddr,
        createMessage({
            bounce: false,
            value: grams("0.1"),
            dest: oldCollectionAddr,
            body: DestroyDnsItem {
                queryId: 1,
                itemAddress: oldGenesis.address,
                recipient: deployerAddr,
            },
        }),
    );
    if (destroyItemRes.waitForFirstTransaction() != null) {
        println("Old genesis.bro item destroyed and TON recovered.");
    }

    println("Destroying old .bro DNS Collection ({})...", oldCollectionAddr);
    val destroyCollRes = net.send(
        deployerAddr,
        createMessage({
            bounce: false,
            value: grams("0.05"),
            dest: oldCollectionAddr,
            body: DestroyContract {
                queryId: 2,
                recipient: deployerAddr,
            },
        }),
    );
    if (destroyCollRes.waitForFirstTransaction() != null) {
        println("Old .bro DNS Collection destroyed and TON recovered.");
    }
}

fun main() {
    val deployer = promptJettonWallet("JETTON_ADMIN", "Select Jetton Admin ActonWallet");

    val oldCollectionEnv: address? = env("OLD_BRO_COLLECTION_ADDRESS");
    if (oldCollectionEnv != null) {
        destroyOldCollectionAndGenesis(deployer.address, oldCollectionEnv);
    }

    val oldCollectionEnv2: address? = env("OLD_BRO_COLLECTION_ADDRESS_2");
    if (oldCollectionEnv2 != null) {
        destroyOldCollectionAndGenesis(deployer.address, oldCollectionEnv2);
    }

    val collectionUri: string = env("BRO_DNS_COLLECTION_URI") ??
        "https://ankitgahlyan.github.io/brotherhood/dns/bro-collection.json";

    // Use deploymentTime: 0 in StateInit so the collection address is 100% deterministic.
    // DnsCollection records blockchain.now() on-chain upon receiving FillUp { queryId: 1 }.
    val collection = DnsCollection.fromStorage(CollectionStorage {
        treasuryAddress: deployer.address,
        content: collectionUri.prefixWith01().toCell(),
        nftItemCode: build("DnsItem"),
        deploymentTime: 0,
        fiMinterAddress: DEPLOYED_FI_MINTER_ADDRESS,
    });

    println("==================================================");
    println("Deploying Brotherhood .bro Authoritative DNS Zone");
    println("Deployer / Treasury: {}", deployer.address);
    println("FI Minter Address: {}", DEPLOYED_FI_MINTER_ADDRESS);
    println("Collection URI: {}", collectionUri);
    println("Deterministic Collection Address: {}", collection.address);
    println("==================================================");

    val deployResult = net.send(
        deployer.address,
        createMessage({
            bounce: false,
            value: grams("1"),
            dest: { stateInit: collection.stateInit! },
            body: FillUp { queryId: 1 },
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

    // Instant-mint genesis.bro only if deployer is the authorized Treasury/Admin
    if (data.ownerAddress != null && data.ownerAddress == deployer.address) {
        println("Admin instant-mint allowed: registering genesis.bro to Treasury...");
        val mintRes = net.send(
            deployer.address,
            createMessage({
                bounce: true,
                value: grams("0.25"),
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
        } else {
            println("Skipping genesis.bro confirmation (already minted or unavailable).");
        }
    } else {
        println("Deployer is not collection admin; skipping genesis.bro instant mint.");
    }

    println("==================================================");
    println(".bro DNS Zone Setup Complete!");
    println("==================================================");
}
