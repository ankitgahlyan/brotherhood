import "@acton/build"
import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@acton/testing/expect"
import "@acton/types/transaction"

import "@wrappers/DnsCollection.gen"
import "@wrappers/DnsItem.gen"

import "@contracts/common/constants"
import "@contracts/common/messages"
import "@contracts/dns/errors"
import "@contracts/dns/messages"
import "@contracts/dns/storage"

import "test-utils"

fun sendMintDomainFor(
    collection: DnsCollection,
    treasury: address,
    targetOwner: address,
    domain: string,
    queryId: uint64 = 1,
): SendResultList {
    return net.send(
        treasury,
        createMessage({
            dest: collection.address,
            value: grams("1"),
            bounce: true,
            body: MintDomainFor {
                queryId,
                targetOwner,
                payload: makeDomainCell(domain).beginParse(),
            },
        }),
    );
}

get fun `test bro: MintDomainFor grants immediate ownership of 1-char domain with TEP-64 name`() {
    val (collection, treasury, user) = deployBroCollectionContract();

    val deployRes = sendMintDomainFor(collection, treasury.address, user.address, "a");
    expect(deployRes).toHaveSuccessfulTx({ to: collection.address });

    val itemDeployTx = deployRes.findTransaction({ from: collection.address, deploy: true });
    expect(itemDeployTx).toBeNotNull();

    val item = DnsItem.fromAddress(itemDeployTx!.getAccountAddress());
    expect(item.getEditor()).toEqual(user.address);

    val nftData = item.getNftData();
    expect(nftData.isInitialized).toEqual(true);
    expect(nftData.ownerAddress).toEqual(user.address);

    // Verify TEP-64 sha256("name") is pre-populated to "a.bro"
    val nameResolved = item.dnsresolve(makeDotSlice(), "name".sha256());
    expect(nameResolved.resolvedRecord).toBeNotNull();
    expect(nameResolved.resolvedRecord!.hash()).toEqual(makeDnsTextRecord("a.bro").hash());
}

get fun `test bro: FI tier starting bid boundaries across 1 to 9+ char domains`() {
    val (collection, _, user) = deployBroCollectionContract();

    // 1 char: 10000 FI
    val underpay1 = collection.sendAny(
        user.address,
        makeBidBody(user.address, "a", grams("9999"), collection.address),
        { value: grams("1"), bounce: true },
    );
    expect(underpay1).toHaveFailedTx({
        to: collection.address,
        exitCode: ERROR_BID_BELOW_MIN_PRICE,
    });

    val ok1 = collection.sendAny(
        user.address,
        makeBidBody(user.address, "a", grams("10000"), collection.address),
        { value: grams("1"), bounce: true },
    );
    expect(ok1).toHaveSuccessfulTx({ to: collection.address });

    // 2 chars: 5000 FI
    val underpay2 = collection.sendAny(
        user.address,
        makeBidBody(user.address, "ab", grams("4999"), collection.address),
        { value: grams("1"), bounce: true },
    );
    expect(underpay2).toHaveFailedTx({
        to: collection.address,
        exitCode: ERROR_BID_BELOW_MIN_PRICE,
    });

    val ok2 = collection.sendAny(
        user.address,
        makeBidBody(user.address, "ab", grams("5000"), collection.address),
        { value: grams("1"), bounce: true },
    );
    expect(ok2).toHaveSuccessfulTx({ to: collection.address });

    // 3 chars: 2500 FI
    val underpay3 = collection.sendAny(
        user.address,
        makeBidBody(user.address, "abc", grams("2499"), collection.address),
        { value: grams("1"), bounce: true },
    );
    expect(underpay3).toHaveFailedTx({
        to: collection.address,
        exitCode: ERROR_BID_BELOW_MIN_PRICE,
    });

    val ok3 = collection.sendAny(
        user.address,
        makeBidBody(user.address, "abc", grams("2500"), collection.address),
        { value: grams("1"), bounce: true },
    );
    expect(ok3).toHaveSuccessfulTx({ to: collection.address });

    // 4 chars: 1000 FI
    val underpay4 = collection.sendAny(
        user.address,
        makeBidBody(user.address, "abcd", grams("999"), collection.address),
        { value: grams("1"), bounce: true },
    );
    expect(underpay4).toHaveFailedTx({
        to: collection.address,
        exitCode: ERROR_BID_BELOW_MIN_PRICE,
    });

    val ok4 = collection.sendAny(
        user.address,
        makeBidBody(user.address, "abcd", grams("1000"), collection.address),
        { value: grams("1"), bounce: true },
    );
    expect(ok4).toHaveSuccessfulTx({ to: collection.address });

    // 5 chars: 500 FI
    val underpay5 = collection.sendAny(
        user.address,
        makeBidBody(user.address, "abcde", grams("499"), collection.address),
        { value: grams("1"), bounce: true },
    );
    expect(underpay5).toHaveFailedTx({
        to: collection.address,
        exitCode: ERROR_BID_BELOW_MIN_PRICE,
    });

    val ok5 = collection.sendAny(
        user.address,
        makeBidBody(user.address, "abcde", grams("500"), collection.address),
        { value: grams("1"), bounce: true },
    );
    expect(ok5).toHaveSuccessfulTx({ to: collection.address });

    // 9 chars: 100 FI
    val underpay9 = collection.sendAny(
        user.address,
        makeBidBody(user.address, "abcdefghi", grams("99"), collection.address),
        { value: grams("1"), bounce: true },
    );
    expect(underpay9).toHaveFailedTx({
        to: collection.address,
        exitCode: ERROR_BID_BELOW_MIN_PRICE,
    });

    val ok9 = collection.sendAny(
        user.address,
        makeBidBody(user.address, "abcdefghi", grams("100"), collection.address),
        { value: grams("1"), bounce: true },
    );
    expect(ok9).toHaveSuccessfulTx({ to: collection.address });
}

get fun `test bro: wallet and social contact links (uri/description) with expiry preservation`() {
    val (collection, treasury, user) = deployBroCollectionContract();

    val deployRes = sendMintDomainFor(collection, treasury.address, user.address, "vault");
    val itemDeployTx = deployRes.findTransaction({ from: collection.address, deploy: true });
    val item = DnsItem.fromAddress(itemDeployTx!.getAccountAddress());

    // Renew domain for 1 year so lastFillUpTime is in the future (now + ONE_YEAR)
    val renewRes = net.send(
        user.address,
        createMessage({
            bounce: true,
            value: grams("0.1"),
            dest: item.address,
            body: RenewBroDomain {
                queryId: 1,
                renewer: user.address,
                fiAmount: grams("50"),
                itemAddress: item.address,
            },
        }),
    );
    expect(renewRes).toHaveSuccessfulTx({ to: item.address });
    val futureExpiry = item.getLastFillUpTime();
    expect(futureExpiry).toEqual(testing.getNow() + ONE_YEAR);

    // 1. Set wallet record
    val targetWallet = newActor("bro_target_wallet").address;
    val recordPayload = beginCell().storeRef(makeWalletRecord(targetWallet)).endCell();
    val setRecordRes = item.sendChangeDnsRecord(
        user.address,
        2,
        DNS_WALLET_CATEGORY,
        recordPayload.beginParse(),
        { value: grams("0.1"), bounce: true },
    );
    expect(setRecordRes).toHaveSuccessfulTx({ to: item.address });

    // 2. Set social contact link under sha256("uri") (e.g. ThatsApp / SimpleX or Telegram)
    val contactCell = makeDnsTextRecord("simplex:/?v=1-4&smp=smp%3A%2F%2Fexample");
    val setUriRes = item.sendChangeDnsRecord(
        user.address,
        3,
        "uri".sha256(),
        beginCell().storeRef(contactCell).endCell().beginParse(),
        { value: grams("0.1"), bounce: true },
    );
    expect(setUriRes).toHaveSuccessfulTx({ to: item.address });

    // 3. Set channel link under sha256("description")
    val channelCell = makeDnsTextRecord("https://t.me/brotherhood_channel");
    val setDescRes = item.sendChangeDnsRecord(
        user.address,
        4,
        "description".sha256(),
        beginCell().storeRef(channelCell).endCell().beginParse(),
        { value: grams("0.1"), bounce: true },
    );
    expect(setDescRes).toHaveSuccessfulTx({ to: item.address });

    // Verify futureExpiry was preserved and NOT overwritten to now
    expect(item.getLastFillUpTime()).toEqual(futureExpiry);

    // Resolve via collection
    val resolved = collection.dnsresolve(makeLabelDomainSlice("vault"), DNS_WALLET_CATEGORY);
    expect(resolved.resolvedRecord).toBeNotNull();
    val nextResolver = parseNextResolverCell(resolved.resolvedRecord!);
    expect(nextResolver).toEqual(item.address);

    // Resolve wallet, uri, and description directly on item
    val itemResolved = item.dnsresolve(makeDotSlice(), DNS_WALLET_CATEGORY);
    expect(itemResolved.resolvedRecord).toBeNotNull();
    expect(itemResolved.resolvedRecord!.hash()).toEqual(makeWalletRecord(targetWallet).hash());

    val uriResolved = item.dnsresolve(makeDotSlice(), "uri".sha256());
    expect(uriResolved.resolvedRecord).toBeNotNull();
    expect(uriResolved.resolvedRecord!.hash()).toEqual(contactCell.hash());

    val descResolved = item.dnsresolve(makeDotSlice(), "description".sha256());
    expect(descResolved.resolvedRecord).toBeNotNull();
    expect(descResolved.resolvedRecord!.hash()).toEqual(channelCell.hash());
}

get fun `test bro: 10-minute reservation window restricts public registration`() {
    val deployTime = AUCTION_START_TIME + 100;
    val (collection, treasury, publicUser) = deployBroCollectionContract(deployTime);

    // 1. During 10-minute reservation window: public user BidBroDomain is rejected
    val publicAttempt = collection.sendAny(
        publicUser.address,
        makeBidBody(publicUser.address, "brother", grams("500"), collection.address),
        { value: grams("1"), bounce: true },
    );
    expect(publicAttempt).toHaveFailedTx({
        to: collection.address,
        exitCode: ERROR_RESERVATION_PERIOD_ACTIVE,
    });

    // 2. Treasury can bid during reservation window
    val treasuryBid = collection.sendAny(
        treasury.address,
        makeBidBody(treasury.address, "brother", grams("500"), collection.address),
        { value: grams("1"), bounce: true },
    );
    expect(treasuryBid).toHaveSuccessfulTx({ to: collection.address });

    // 3. Treasury can instant-mint on behalf of a verified user via MintDomainFor
    val verifiedUser = newActor("verified_brother");
    val mintForRes = sendMintDomainFor(
        collection,
        treasury.address,
        verifiedUser.address,
        "genesis",
        101,
    );
    expect(mintForRes).toHaveSuccessfulTx({ to: collection.address });

    val genesisItemTx = mintForRes.findTransaction({ from: collection.address, deploy: true });
    expect(genesisItemTx).toBeNotNull();
    val genesisItem = DnsItem.fromAddress(genesisItemTx!.getAccountAddress());
    expect(genesisItem.getEditor()).toEqual(verifiedUser.address);

    // 4. Fast forward past 10 minutes (RESERVATION_PERIOD + 1)
    testing.setNow(deployTime + RESERVATION_PERIOD + 1);

    // Public registration opens for all users
    val publicAfter10Mins = collection.sendAny(
        publicUser.address,
        makeBidBody(publicUser.address, "publicname", grams("100"), collection.address),
        { value: grams("1"), bounce: true },
    );
    expect(publicAfter10Mins).toHaveSuccessfulTx({ to: collection.address });
}

get fun `test bro: HotUpgrade, UpgradeDnsItem, DestroyContract, and DestroyDnsItem`() {
    val (collection, treasury, user) = deployBroCollectionContract();
    val attacker = newActor("bro_attacker", grams("10"));

    // Mint an item for user
    val mintRes = sendMintDomainFor(collection, treasury.address, user.address, "upgr");
    val itemAddr = mintRes
        .findTransaction({ from: collection.address, deploy: true })!
        .getAccountAddress();
    val item = DnsItem.fromAddress(itemAddr);

    // 1. Non-treasury cannot HotUpgrade DnsCollection
    val unauthUpgradeCol = net.send(
        attacker.address,
        createMessage({
            dest: collection.address,
            value: grams("0.1"),
            bounce: true,
            body: HotUpgrade {
                additionalData: null,
                code: build("DnsCollection"),
            },
        }),
    );
    expect(unauthUpgradeCol).toHaveFailedTx({
        to: collection.address,
        exitCode: ERROR_NOT_AUTHORIZED_TREASURY,
    });

    // 2. Treasury can HotUpgrade DnsCollection
    val authUpgradeCol = net.send(
        treasury.address,
        createMessage({
            dest: collection.address,
            value: grams("0.1"),
            bounce: true,
            body: HotUpgrade {
                additionalData: null,
                code: build("DnsCollection"),
            },
        }),
    );
    expect(authUpgradeCol).toHaveSuccessfulTx({ to: collection.address });

    // 3. Non-collection cannot directly HotUpgrade DnsItem
    val directItemUpgrade = net.send(
        user.address,
        createMessage({
            dest: item.address,
            value: grams("0.1"),
            bounce: true,
            body: HotUpgrade {
                additionalData: null,
                code: build("DnsItem"),
            },
        }),
    );
    expect(directItemUpgrade).toHaveFailedTx({
        to: item.address,
        exitCode: ERROR_NOT_FROM_COLLECTION,
    });

    // 4. Treasury can upgrade DnsItem via UpgradeDnsItem on DnsCollection
    val upgradeItemRes = net.send(
        treasury.address,
        createMessage({
            dest: collection.address,
            value: grams("0.2"),
            bounce: true,
            body: UpgradeDnsItem {
                queryId: 50,
                itemAddress: item.address,
                code: build("DnsItem"),
                additionalData: null,
            },
        }),
    );
    expect(upgradeItemRes).toHaveSuccessfulTx({ to: collection.address });
    expect(upgradeItemRes).toHaveSuccessfulTx({ from: collection.address, to: item.address });
    expect(item.getEditor()).toEqual(user.address);

    // 5. Treasury can destroy DnsItem via DestroyDnsItem and recover TON
    val destroyItemRes = net.send(
        treasury.address,
        createMessage({
            dest: collection.address,
            value: grams("0.1"),
            bounce: true,
            body: DestroyDnsItem {
                queryId: 51,
                itemAddress: item.address,
                recipient: treasury.address,
            },
        }),
    );
    expect(destroyItemRes).toHaveSuccessfulTx({ to: collection.address });
    expect(destroyItemRes).toHaveSuccessfulTx({ from: collection.address, to: item.address });
    expect(testing.isDeployed(item.address)).toEqual(false);

    // 6. Treasury can destroy DnsCollection via DestroyContract and recover TON
    val destroyColRes = net.send(
        treasury.address,
        createMessage({
            dest: collection.address,
            value: grams("0.1"),
            bounce: true,
            body: DestroyContract {
                queryId: 52,
                recipient: treasury.address,
            },
        }),
    );
    expect(destroyColRes).toHaveSuccessfulTx({ to: collection.address });
    expect(testing.isDeployed(collection.address)).toEqual(false);
}

get fun `test bro: treasury fee withdrawal and TEP-66 royalty params`() {
    val (collection, treasury, _) = deployBroCollectionContract();
    testing.topUp(collection.address, grams("100"));

    val collectionBalance = testing.getAccountBalance(collection.address);
    expect(collectionBalance).toBeGreater(grams("90"));

    // Unauthorized non-treasury attempts withdrawal -> rejected
    val attacker = newActor("attacker");
    val unauthWithdraw = createMessage({
        dest: collection.address,
        value: grams("0.1"),
        bounce: true,
        body: WithdrawFees {
            queryId: 999,
            amount: grams("50"),
            recipient: attacker.address,
        },
    });
    val failRes = net.send(attacker.address, unauthWithdraw);
    expect(failRes).toHaveFailedTx({
        to: collection.address,
        exitCode: ERROR_NOT_AUTHORIZED_TREASURY,
    });

    // Treasury withdraws 50 TON -> succeeds
    val treasuryBalanceBefore = testing.getAccountBalance(treasury.address);
    val authorizedWithdraw = createMessage({
        dest: collection.address,
        value: grams("0.1"),
        bounce: true,
        body: WithdrawFees {
            queryId: 1000,
            amount: grams("50"),
            recipient: treasury.address,
        },
    });
    val okRes = net.send(treasury.address, authorizedWithdraw);
    expect(okRes).toHaveSuccessfulTx({ to: collection.address });

    val treasuryBalanceAfter = testing.getAccountBalance(treasury.address);
    expect(treasuryBalanceAfter).toBeGreater(treasuryBalanceBefore + grams("49"));

    // TEP-66 royalty getter check
    val (factor, base, royaltyAddr) = collection.getRoyaltyParams();
    expect(factor).toEqual(5);
    expect(base).toEqual(100);
    expect(royaltyAddr).toEqual(treasury.address);
}
