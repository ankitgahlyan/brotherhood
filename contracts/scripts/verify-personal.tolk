import "@acton/build"
import "@acton/emulation/network"
import "@acton/emulation/scripts"
import "@acton/emulation/testing"
import "@acton/io"
import "@acton/prompts"
import "@wrappers/FossFi.gen"
import "@wrappers/FossFiWallet.gen"
import "@wrappers/utils"
import "@gen/PersonalWallet.code"
import "@contracts/common/messages"
import "@contracts/fossFi/storage"
import "@contracts/personalMinter/storage"
import "utils/common"

fun deployTestMinter(admin: address): FossFi {
    val minter = FossFi.fromStorage({
        totalSupply: 0,
        adminAddress: admin,
        metadata: buildJettonMetadataCell({
            name: "BroTherHOOD",
            symbol: "HD",
            description: "test",
            image: "",
            decimals: "9",
        }),
        nextAdminAddress: null,
        others: FiCodes {}.toCell(),
    });
    val res = minter.sendDeploy(admin, { value: ton("10") });
    res.waitForFirstTransaction();
    return minter;
}

fun mintTo(minter: FossFi, from: address, recipient: address, amount: coins): address {
    val res = minter.sendMint(from, recipient, amount, ton("0.05"), ton("0.3"));
    res.waitForFirstTransaction();
    return minter.getWalletAddress(recipient);
}

fun activateIssuer(minter: FossFi, inviterWallet: address, inviterOwner: address, issuer: address): address {
    val invite = FossFiWallet.fromAddress(inviterWallet).sendOthersActions(
        inviterOwner,
        0,
        ton("0.1"),
        issuer,
        inviterOwner,
        null,
        ton("0.05"),
        "user@lat,long",
        { value: ton("1") },
    );
    invite.waitForFirstTransaction();
    return minter.getWalletAddress(issuer);
}

fun main() {
    val deployer = testing.treasury("deployer").address;
    val issuerOwner = testing.treasury("issuer").address;

    // 1. fresh jetton minter + an active issuer FI account
    val minter = deployTestMinter(deployer);
    val buyerWallet = mintTo(minter, deployer, deployer, ton("1000"));
    val issuerWallet = activateIssuer(minter, buyerWallet, deployer, issuerOwner);
    println("MINTER={}", minter.address);
    println("ISSUER_WALLET={}", issuerWallet);

    // 2. the deploy-personal recipe steps: deploy the PM and point the issuer wallet at it
    val priStore: PriStore = {
        totalSupply: 0,
        fiJettonAddress: issuerWallet,
        adminAddress: deployer,
        jettonWalletCode: personalWalletCompiledCode(),
        metadataUri: buildJettonMetadataCell({
            name: "Issuer Token",
            symbol: "IT",
            description: "test",
            image: "",
            decimals: "9",
        }),
    };
    val stateInit = ContractState {
        code: build("PersonalMinter"),
        data: priStore.toCell(),
    };
    val pmAddress = AutoDeployAddress { workchain: BASECHAIN, stateInit }.calculateAddress();

    val deployMsg = createMessage({
        bounce: false,
        value: ton("1"),
        dest: {
            workchain: BASECHAIN,
            stateInit,
            toShard: null,
        },
    });
    net.send(deployer, deployMsg).waitForFirstTransaction();
    println("PERSONAL_MINTER={}", pmAddress);

    val pointRes = FossFiWallet.fromAddress(issuerWallet).sendOthersActions(
        issuerOwner,
        0,
        ton("0.777"),
        pmAddress,
        issuerOwner,
        null,
        ton("0.05"),
        "",
        { value: ton("0.6") },
    );
    pointRes.waitForFirstTransaction();

    val walletData = FossFiWallet.fromAddress(issuerWallet).getWalletDataAll();
    val trustedMinter = walletData.addresses.load().trustedJettonAddrs.load().personalJettonMinter;
    println("ISSUER_TRUSTED_MINTER={}", trustedMinter);
    if (trustedMinter != null && trustedMinter == pmAddress) {
        println("VERIFY_OK: issuer wallet points at the Personal Token minter");
    } else {
        println("VERIFY_FAIL: trusted minter mismatch");
    }

    // 3. buy credit end-to-end: the buyer's FI moves to the issuer
    val loan = ton("100");
    val buyerFiBefore = FossFiWallet.fromAddress(buyerWallet).getJettonBalance();
    val issuerFiBefore = FossFiWallet.fromAddress(issuerWallet).getJettonBalance();

    val buyerRes = FossFiWallet.fromAddress(buyerWallet).sendBuyCredit(
        deployer,
        0,
        loan,
        issuerOwner,
        deployer,
        { value: ton("1.5") },
    );
    buyerRes.waitForFirstTransaction();

    val buyerFiAfter = FossFiWallet.fromAddress(buyerWallet).getJettonBalance();
    val issuerFiAfter = FossFiWallet.fromAddress(issuerWallet).getJettonBalance();
    println("BUYER_FI {} -> {}", buyerFiBefore, buyerFiAfter);
    println("ISSUER_FI {} -> {}", issuerFiBefore, issuerFiAfter);
    if (buyerFiAfter == buyerFiBefore - loan && issuerFiAfter == issuerFiBefore + loan) {
        println("VERIFY_OK: buy credit moved the loan to the issuer");
    } else {
        println("VERIFY_FAIL: balances did not move as expected");
    }
}
