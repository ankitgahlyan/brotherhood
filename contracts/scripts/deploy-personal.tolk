import "@acton/build"
import "@acton/io"
import "@acton/emulation/network"
import "@acton/emulation/scripts"

import "@wrappers/FossFi.gen"
import "@wrappers/FossFiWallet.gen"
import "@wrappers/Personal.gen"
import "@contracts/common/messages"
import "@contracts/personalMinter/base-personal-minter-code"
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
    val metadataCell = buildJettonMetadataCell(metadata);

    val baseStore: BasePersonalMinterStore = {
        fiJettonAddress: issuerWallet,
        adminAddress: admin,
        version: 0,
    };
    val stateInit = ContractState {
        code: getBasePersonalMinterCode(),
        data: baseStore.toCell(),
    };
    val toShard: AddressShardingOptions = { fixedPrefixLength: 8, closeTo: admin };
    val pmAddress = AutoDeployAddress {
        workchain: BASECHAIN,
        stateInit,
        toShard,
    }.calculateAddress();

    val mintAmount = promptJettonCoins(
        "PERSONAL_MINT_AMOUNT",
        "Enter initial Personal Token mint amount",
        "1000000000000",
    );

    val internalMsg: InternalTransferStep = {
        queryId: 0,
        jettonAmount: mintAmount,
        version: 0,
        transferredAsCredit: false,
        transferInitiator: admin,
        sendExcessesTo: admin,
        forwardTonAmount: grams("0.02"),
        latestWalletCode: build("PersonalMinter"),
        forwardPayload: (PayloadInRef {
            value: (metadataCell.beginParse() as RemainingBitsAndRefs).toCell(),
        })
            .toCell()
            .beginParse(),
    };

    // deploy the Personal Token minter + set metadata + onboard/mint PersonalWallet in one message via BasePersonalMinter proxy
    val deployMsg = createMessage({
        bounce: false,
        value: grams("1.5"),
        dest: {
            workchain: BASECHAIN,
            stateInit,
            toShard,
        },
        body: MintNewJettons {
            queryId: 0,
            mintRecipient: issuerOwner,
            tonAmount: grams("0.7"),
            internalTransferMsg: internalMsg.toCell(),
        },
    });
    val deployRes = net.send(admin, deployMsg);
    println(deployRes.waitForTrace());

    val personalWalletAddress = Personal.fromAddress(pmAddress).getWalletAddress(issuerOwner);
    // point the issuer's FI wallet at the Personal Token minter and personal wallet (ActSetPersonalJetton signal)
    val pointRes = FossFiWallet
        .fromAddress(issuerWallet)
        .sendActSetPersonalJetton(
            issuerOwner,
            pmAddress,
            personalWalletAddress,
            { value: grams("0.6") },
        );
    println(pointRes.waitForTrace());

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
