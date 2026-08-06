import "@stdlib/strings"
import "@acton/build"
import "@acton/env"
import "@acton/fmt"
import "@acton/io"
import "@acton/prompts"
import "@acton/emulation/network"
import "@acton/emulation/scripts"
import "@wrappers/FossFi.gen"
import "@wrappers/FossFiWallet.gen"
import "@wrappers/utils"
import "@contracts/common/messages"
import "@contracts/fossFi/storage"

const FI_ADDRESS = "kQCPnceJsnacJr4XNVq52TC5Sw4E1MrqWCMdd82KJJNenoOT"
const JETTON_DEFAULT_NAME = "BroTherHOOD"
const JETTON_DEFAULT_SYMBOL = "HD"
const JETTON_DEFAULT_DESCRIPTION = "token with social minting + debt-free credit claims capabilities & supply is controlled by scarcity of humans & value is backed by paybacks by connections + lifetime emi & unique humans are ensured by peer reporting & genuine reports will be rewarded & lookout for your circle and rings to find potential valid reports"
// const JETTON_DEFAULT_IMAGE = "https://github.com/Cryptofonts/cryptoicons/blob/master/SVG/ton.svg"
// const JETTON_DEFAULT_IMAGE = "https://ankitgahlyan.github.io/fossfiat/icon1.png"
const JETTON_DEFAULT_IMAGE = "https://raw.githubusercontent.com/ankitgahlyan/fossfiat/refs/heads/main/public/icon1.png"

const JETTON_IMAGE = "https://raw.githubusercontent.com/ankitgahlyan/fossfiat/refs/heads/main/public/tiger.svg"

const JETTON_DEFAULT_DECIMALS = "9"
const JETTON_DEFAULT_UPDATED_DESCRIPTION = "Sample jetton (metadata updated from acton-contracts scripts)"

const JETTON_DEFAULT_INITIAL_SUPPLY = "0"
const JETTON_DEFAULT_MINT_AMOUNT = "100000000000"
const JETTON_DEFAULT_TRANSFER_AMOUNT = "10000000000"

struct JettonMetadata {
    name: string
    symbol: string
    description: string
    image: string
    decimals: string
}

fun promptWalletUpgrade(message: string): bool {
    val walletUpgrade = prompt(message, "wallet upgrade?", "y");
    return walletUpgrade.equalTo("y");
}

fun promptJettonString(envName: string, message: string, default: string): string {
    val fromEnv = env<string>(envName);
    if (fromEnv != null) {
        return fromEnv;
    }
    return prompt(message, "", default);
}

fun promptJettonAddress(envName: string, message: string, default: address? = null): address {
    val fromEnv = env<address>(envName);
    if (fromEnv != null) {
        return fromEnv;
    }
    if (default != null) {
        return parseAddress(prompt(message, "", format("{}", default)));
    }
    return parseAddress(prompt(message, "", ""));
}

fun promptJettonAddressRequired(envName: string, message: string): address {
    val fromEnv = env<address>(envName);
    if (fromEnv != null) {
        return fromEnv;
    }
    return parseAddress(prompt(message, "EQ... / kQ...", FI_ADDRESS));
}

fun promptJettonCoins(envName: string, message: string, default: string): coins {
    val fromEnv = env<coins>(envName);
    if (fromEnv != null) {
        return fromEnv;
    }
    return parseInt(prompt(message, "in nanotons/nano-jettons", default));
}

fun promptJettonWallet(envName: string, message: string): ActonWallet {
    val nameFromEnv = env<string>(envName);
    if (nameFromEnv != null) {
        return scripts.wallet(nameFromEnv);
    }
    return scripts.wallet(promptWallet(message));
}

fun promptJettonMinter(message: string): FossFi {
    val addr = promptJettonAddressRequired("JETTON_MINTER_ADDRESS", message);
    return FossFi.fromAddress(addr);
}

fun promptJettonMetadata(descriptionDefault: string): JettonMetadata {
    return {
        name: promptJettonString("JETTON_NAME", "Enter jetton name", JETTON_DEFAULT_NAME),
        symbol: promptJettonString("JETTON_SYMBOL", "Enter jetton symbol", JETTON_DEFAULT_SYMBOL),
        description: promptJettonString(
            "JETTON_DESCRIPTION",
            "Enter jetton description",
            descriptionDefault,
        ),
        image: promptJettonString("JETTON_IMAGE", "Enter jetton image URL", JETTON_DEFAULT_IMAGE),
        decimals: promptJettonString(
            "JETTON_DECIMALS",
            "Enter jetton decimals",
            JETTON_DEFAULT_DECIMALS,
        ),
    };
}

fun buildJettonMetadataCell(info: JettonMetadata): cell {
    var metadata: OnchainMetadataReply = { contentDict: [] };
    metadata.contentDict.set("name".sha256(), info.name.prefixWith00());
    metadata.contentDict.set("symbol".sha256(), info.symbol.prefixWith00());
    metadata.contentDict.set("description".sha256(), info.description.prefixWith00());
    metadata.contentDict.set("image".sha256(), info.image.prefixWith00());
    metadata.contentDict.set("decimals".sha256(), info.decimals.prefixWith00());
    return metadata.toCell();
}

fun promptJettonMinterStorage(admin: address): FiStore {
    return {
        totalSupply: promptJettonCoins(
            "JETTON_INITIAL_SUPPLY",
            "Enter initial supply",
            JETTON_DEFAULT_INITIAL_SUPPLY,
        ),
        walletVersion: 0,
        adminAddress: admin,
        metadata: buildJettonMetadataCell(promptJettonMetadata(JETTON_DEFAULT_DESCRIPTION)),
        others: FiCodes {
            lotteryCode: build("Lottery"),
            latestFiWalletCode: null,
            currentRequest: null,
        }.toCell(),
    };
}

fun deployJettonMinter(deployer: ActonWallet, storage: FiStore): FossFi {
    val minter = FossFi.fromStorage(storage);
    val res = minter.deploy(deployer.address, { value: ton("0.55") });
    res.waitForFirstTransaction();
    val result = minter.sendTopUpTons(deployer.address, { value: ton("0.55") });
    result.waitForFirstTransaction();
    return minter;
}

fun readOnchainMetadataField(metadata: OnchainMetadataReply, key: uint256): string? {
    val entry = metadata.contentDict.get(key);
    if (!entry.isFound) {
        return null;
    }
    val prefixed = entry.loadValue();
    var s = (prefixed as unknown as cell).beginParse();
    s.loadUint(8);
    return s.loadString();
}

fun printMetadataField(label: string, fieldName: string, value: string?) {
    if (value == null) {
        println("{} METADATA_{}=<unavailable>", label, fieldName);
    } else {
        println("{} METADATA_{}={}", label, fieldName, value);
    }
}

fun printJettonMinterInfo(minter: FossFi, label: string) {
    val data = minter.getJettonData();
    println("{} MINTER_ADDRESS={}", label, minter.address);
    println("{} TOTAL_SUPPLY={}", label, data.totalSupply);
    println("{} MINTABLE={}", label, data.mintable);
    println("{} ADMIN_ADDRESS={}", label, data.adminAddress);
    val metadata = OnchainMetadataReply.fromCell(data.jettonContent);
    printMetadataField(label, "name", readOnchainMetadataField(metadata, "name".sha256()));
    printMetadataField(label, "symbol", readOnchainMetadataField(metadata, "symbol".sha256()));
    printMetadataField(
        label,
        "description",
        readOnchainMetadataField(metadata, "description".sha256()),
    );
    printMetadataField(label, "image", readOnchainMetadataField(metadata, "image".sha256()));
    printMetadataField(label, "decimals", readOnchainMetadataField(metadata, "decimals".sha256()));
}

fun printJettonWalletInfo(minter: FossFi, owner: address, label: string) {
    val wallet = FossFiWallet { address: minter.getWalletAddress(owner) };
    val hasCode = scripts.isContractDeployed(wallet.address);
    println("{} OWNER_ADDRESS={}", label, owner);
    println("{} WALLET_ADDRESS={}", label, wallet.address);
    println("{} WALLET_DEPLOYED={}", label, hasCode);
    if (hasCode) {
        println("{} WALLET_BALANCE={}", label, wallet.getJettonBalance());
    } else {
        println("{} WALLET_BALANCE=<unavailable>", label);
    }
}
