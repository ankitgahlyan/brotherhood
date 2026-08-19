import "@acton/build"
import "@acton/io"
import "@acton/emulation/network"
import "@acton/emulation/scripts"

import "@gen/PersonalWallet.code"
import "@wrappers/FossFi.gen"
import "@wrappers/FossFiWallet.gen"
import "@contracts/personalMinter/storage"

import "utils/common"

fun main() {
    // the account that pays to deploy the Personal Token minter
    val deployer = promptJettonWallet("PERSONAL_DEPLOYER", "Select Personal Token deployer");

    // the minter admin (can change metadata/admin, and receives mint excesses)
    val admin = promptJettonAddress(
        "PERSONAL_ADMIN_ADDRESS",
        "Enter Personal Token minter admin address",
        deployer.address,
    );

    // the issuer: the Member whose FI account backs the Personal Token
    val issuerOwner = promptJettonAddress(
        "PERSONAL_ISSUER_OWNER",
        "Enter the issuer's owner address",
        admin,
    );

    val minter = promptJettonMinter("Enter FI jetton minter address");
    val issuerWallet = minter.getWalletAddress(issuerOwner);

    if (!scripts.isContractDeployed(issuerWallet)) {
        println(
            "ISSUER_WALLET_NOT_DEPLOYED: the issuer's FI account {} does not exist yet; deploy and activate it first",
            issuerWallet,
        );
        return;
    }

    val metadata = promptJettonMetadata("Personal Token");

    val priStore: PriStore = {
        totalSupply: 0,
        fiJettonAddress: issuerWallet,
        adminAddress: admin,
        jettonWalletCode: personalWalletCompiledCodeLibraryRef(),
        metadataUri: buildJettonMetadataCell(metadata),
    };
    val stateInit = ContractState {
        code: build("PersonalMinter"),
        data: priStore.toCell(),
    };
    val pmAddress = AutoDeployAddress {
        workchain: BASECHAIN,
        stateInit,
    }.calculateAddress();

    // deploy the Personal Token minter
    val deployMsg = createMessage({
        bounce: false,
        value: ton("1"),
        dest: {
            workchain: BASECHAIN,
            stateInit,
            toShard: null,
        },
    });
    val deployRes = net.send(deployer.address, deployMsg);
    deployRes.waitForFirstTransaction();

    // point the issuer's FI wallet at the Personal Token minter (ActSetPersonalJettonMinter signal)
    val pointRes = FossFiWallet
        .fromAddress(issuerWallet)
        .sendActSetPersonalJettonMinter(
            issuerOwner,
            pmAddress,
            { value: ton("0.6") },
        );
    pointRes.waitForFirstTransaction();

    println("PERSONAL_MINTER_ADDRESS={}", pmAddress);
    println("PERSONAL_ADMIN_ADDRESS={}", admin);
    println("ISSUER_OWNER_ADDRESS={}", issuerOwner);
    println("ISSUER_WALLET_ADDRESS={}", issuerWallet);
    printJettonWalletInfo(minter, issuerOwner, "ISSUER");

    val walletData = FossFiWallet.fromAddress(issuerWallet).getWalletDataAll();
    println(
        "ISSUER_PERSONAL_MINTER={}",
        walletData.addresses.load().trustedJettonAddrs.load().personalJettonMinter,
    );
}
