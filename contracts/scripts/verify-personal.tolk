import "@acton/build"
import "@acton/io"
import "@acton/emulation/network"
import "@acton/emulation/testing"

import "@gen/PersonalWallet.code"
import "@wrappers/DaoProxy.gen"
import "@wrappers/FossFi.gen"
import "@wrappers/FossFiWallet.gen"
import "@wrappers/PersonalWallet.gen"
import "@wrappers/utils"
import "@contracts/common/messages"
import "@contracts/dao/storage"
import "@contracts/fossFi/consts"
import "@contracts/fossFi/storage"
import "@contracts/personalMinter/storage"

import "utils/common"

fun deployTestMinter(admin: address): FossFi {
    val daoProxy = DaoProxy.fromStorage({
        adminAddress: admin,
        targetAddress: RAW_ZERO_ADDRESS,
    });
    val minter = FossFi.fromStorage({
        totalSupply: 0,
        adminAddress: admin,
        daoAddress: daoProxy.address,
        metadata: buildJettonMetadataCell({
            name: "BroTherHOOD",
            symbol: "HD",
            description: "test",
            image: "",
            decimals: "9",
        }),
        adminHandoff: null,
        others: FiCodes {
            lotteryCode: build("Lottery"),
            latestFiWalletCode: build("FossFiWallet"),
        }.toCell(),
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

fun activateIssuer(
    minter: FossFi,
    inviterWallet: address,
    inviterOwner: address,
    issuer: address,
): address {
    val invite = FossFiWallet
        .fromAddress(inviterWallet)
        .sendActInvite(
            inviterOwner,
            0,
            issuer,
            "issuer_user",
            "Tokyo", // todo: fixme
            20,
            { value: ton("1") },
        );
    invite.waitForFirstTransaction();
    return minter.getWalletAddress(issuer);
}

fun main() {
    val deployer = testing.treasury("deployer").address;
    val issuerOwner = testing.treasury("issuer").address;

    testing.registerLibrary(build("DaoProxy"));
    testing.registerLibrary(build("Poll"));
    testing.registerLibrary(build("Voter"));
    testing.registerLibrary(build("Following"));
    testing.registerLibrary(build("FossFiWallet"));
    testing.registerLibrary(build("Location"));
    testing.registerLibrary(build("PersonalMinter"));
    testing.registerLibrary(build("PersonalWallet"));

    testing.setNow(1_800_000_000);

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
        jettonWalletCode: personalWalletCompiledCodeLibraryRef(),
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
    val pmAddress = AutoDeployAddress {
        workchain: BASECHAIN,
        stateInit,
    }.calculateAddress();

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

    val pointRes = FossFiWallet
        .fromAddress(issuerWallet)
        .sendActSetPersonalJettonMinter(
            issuerOwner,
            pmAddress,
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

    // Set issuer's credit need with a future maturity date
    val setCreditRes = FossFiWallet
        .fromAddress(issuerWallet)
        .sendSetCreditNeed(
            issuerOwner,
            0,
            ton("1000"),
            1_800_000_000 + 86400,
            { value: ton("0.1") },
        );
    setCreditRes.waitForFirstTransaction();

    // 3. buy credit end-to-end: the buyer's FI moves to the issuer
    val loan = ton("100");
    val buyerFiBefore = FossFiWallet.fromAddress(buyerWallet).getJettonBalance();
    val issuerFiBefore = FossFiWallet.fromAddress(issuerWallet).getJettonBalance();

    val buyerRes = FossFiWallet
        .fromAddress(buyerWallet)
        .sendBuyCredit(
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

    // 4. the buyer should hold the minted personal tokens on the issuer's minter
    val buyerPersonalWallet = net.runGetMethod<address>(
        pmAddress,
        "get_wallet_address",
        [deployer],
    );
    val personalBalance = PersonalWallet
        .fromAddress(buyerPersonalWallet)
        .getWalletData()
        .jettonBalance;
    println("BUYER_PERSONAL_BALANCE={}", personalBalance);
    if (personalBalance == loan) {
        println("VERIFY_OK: buyer received the loan in personal tokens");
    } else {
        println("VERIFY_FAIL: personal token mint did not match the loan");
    }

    // 5. payback: advance time past maturity so payback is allowed
    testing.setNow(1_800_000_000 + 86400 + 10);

    val burnBody = AskToBurn {
        queryId: 0,
        jettonAmount: loan,
        sendExcessesTo: deployer,
        customPayload: null,
    }.toCell();
    val burnRes = PersonalWallet
        .fromAddress(buyerPersonalWallet)
        .sendAny(
            deployer,
            burnBody,
            { value: ton("0.6") },
        );
    burnRes.waitForFirstTransaction();

    val buyerFiFinal = FossFiWallet.fromAddress(buyerWallet).getJettonBalance();
    val issuerFiFinal = FossFiWallet.fromAddress(issuerWallet).getJettonBalance();
    val personalAfter = PersonalWallet
        .fromAddress(buyerPersonalWallet)
        .getWalletData()
        .jettonBalance;
    println(
        "AFTER_PAYBACK BUYER_FI={} ISSUER_FI={} PERSONAL={}",
        buyerFiFinal,
        issuerFiFinal,
        personalAfter,
    );
    if (buyerFiFinal == buyerFiBefore && issuerFiFinal == issuerFiBefore && personalAfter == 0) {
        println("VERIFY_OK: payback returned the loan and burned the personal tokens");
    } else {
        println("VERIFY_FAIL: payback did not unwind the loan");
    }
}
