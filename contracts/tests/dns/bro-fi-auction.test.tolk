import "@acton/build"
import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@acton/testing/expect"
import "@acton/types/transaction"

import "@wrappers/DnsCollection.gen"
import "@wrappers/DnsItem.gen"

import "@contracts/common/constants"
import "@contracts/dns/errors"
import "@contracts/dns/messages"
import "@contracts/dns/storage"

import "test-utils"

fun deployBroFiCollection(minterAddr: address): (DnsCollection, Treasury, Treasury, Treasury) {
    val deployer = newActor("bro-deployer", grams("100000"));
    val user1 = newActor("bro-user-1", grams("100000"));
    val user2 = newActor("bro-user-2", grams("100000"));

    val collection = DnsCollection.fromStorage(CollectionStorage {
        treasuryAddress: deployer.address,
        content: makeCollectionContentCell(),
        nftItemCode: build("DnsItem"),
        deploymentTime: 0,
        fiMinterAddress: minterAddr,
    });

    val deployMsg = createMessage({
        bounce: false,
        value: grams("10"),
        dest: { stateInit: collection.stateInit! },
        body: FillUp { queryId: 0 },
    });
    val res = net.send(deployer.address, deployMsg);
    expect(res).toHaveSuccessfulTx({ to: collection.address });

    return (collection, deployer, user1, user2);
}

fun makeBroDomain(name: string): Cell<RemainingBitsAndRefs> {
    return makeDomainCell(name) as Cell<RemainingBitsAndRefs>;
}

get fun `test bro-fi: starting bid initiates 5-minute auction in FI tokens`() {
    val now = AUCTION_START_TIME + 100;
    testing.setNow(now);

    val minter = newActor("fi-minter", grams("100"));
    val (collection, _, user1, _) = deployBroFiCollection(minter.address);

    // 5-character domain ("alice"): min bid = 500 FI
    val bidFi = grams("500");
    val bidMsg = BidBroDomain {
        queryId: 1,
        bidder: user1.address,
        fiAmount: bidFi,
        domain: makeBroDomain("alice"),
        collectionAddress: collection.address,
    };

    val res = net.send(
        minter.address,
        createMessage({
            bounce: true,
            value: grams("1.0"),
            dest: collection.address,
            body: bidMsg,
        }),
    );
    expect(res).toHaveSuccessfulTx({ to: collection.address });

    val itemDeployTx = res.findTransaction({ from: collection.address, deploy: true });
    expect(itemDeployTx).toBeNotNull();

    val item = DnsItem.fromAddress(itemDeployTx!.getAccountAddress());
    val nftData = item.getNftData();
    // Auction not complete, so owner is not assigned yet
    expect(nftData.ownerAddress).toBeNull();

    val rawData = activeDataCell(item.address);
    val itemStore = ItemStorageInitialized.fromCell(rawData);
    val (isAuctionNull, auction) = itemStore.unpackAuction();

    expect(isAuctionNull).toEqual(false);
    expect(auction.maxBidAddress).toEqual(user1.address);
    expect(auction.maxBidAmount).toEqual(bidFi);
    expect(auction.auctionEndTime).toEqual((now + AUCTION_START_DURATION) as uint64);
}

get fun `test bro-fi: outbid requires at least 105 percent and sends outbid notification`() {
    val now = AUCTION_START_TIME + 100;
    testing.setNow(now);

    val minter = newActor("fi-minter", grams("100"));
    val (collection, _, user1, user2) = deployBroFiCollection(minter.address);

    val firstBidFi = grams("500");
    val res1 = net.send(
        minter.address,
        createMessage({
            bounce: true,
            value: grams("1.0"),
            dest: collection.address,
            body: BidBroDomain {
                queryId: 1,
                bidder: user1.address,
                fiAmount: firstBidFi,
                domain: makeBroDomain("bob12"),
                collectionAddress: collection.address,
            },
        }),
    );
    val itemDeployTx = res1.findTransaction({ from: collection.address, deploy: true })!;
    val item = DnsItem.fromAddress(itemDeployTx.getAccountAddress());

    // Attempt underbid: 510 FI (< 500 * 1.05 = 525 FI) -> should fail
    val underbidFi = grams("510");
    val resUnderbid = net.send(
        minter.address,
        createMessage({
            bounce: true,
            value: grams("1.0"),
            dest: collection.address,
            body: BidBroDomain {
                queryId: 2,
                bidder: user2.address,
                fiAmount: underbidFi,
                domain: makeBroDomain("bob12"),
                collectionAddress: collection.address,
            },
        }),
    );
    expect(resUnderbid).toHaveFailedTx({
        to: item.address,
        exitCode: ERROR_BID_TOO_LOW,
    });

    // Valid outbid: 600 FI (>= 525 FI)
    val validOutbidFi = grams("600");
    val resOutbid = net.send(
        minter.address,
        createMessage({
            bounce: true,
            value: grams("1.0"),
            dest: collection.address,
            body: BidBroDomain {
                queryId: 3,
                bidder: user2.address,
                fiAmount: validOutbidFi,
                domain: makeBroDomain("bob12"),
                collectionAddress: collection.address,
            },
        }),
    );
    expect(resOutbid).toHaveSuccessfulTx({ to: item.address });

    // Verify outbid notification was forwarded through collection to minter to refund user1
    val refundNotificationTx = resOutbid.findTransaction({
        from: collection.address,
        to: minter.address,
    });
    expect(refundNotificationTx).toBeNotNull();

    val rawData = activeDataCell(item.address);
    val itemStore = ItemStorageInitialized.fromCell(rawData);
    val (_, auction) = itemStore.unpackAuction();

    expect(auction.maxBidAddress).toEqual(user2.address);
    expect(auction.maxBidAmount).toEqual(validOutbidFi);
}

get fun `test bro-fi: anti-sniping prolongation extends auction if bid placed in last minute`() {
    var now = AUCTION_START_TIME + 100;
    testing.setNow(now);

    val minter = newActor("fi-minter", grams("100"));
    val (collection, _, user1, user2) = deployBroFiCollection(minter.address);

    val res1 = net.send(
        minter.address,
        createMessage({
            bounce: true,
            value: grams("1.0"),
            dest: collection.address,
            body: BidBroDomain {
                queryId: 1,
                bidder: user1.address,
                fiAmount: grams("500"),
                domain: makeBroDomain("charlie"),
                collectionAddress: collection.address,
            },
        }),
    );
    val itemDeployTx = res1.findTransaction({ from: collection.address, deploy: true })!;
    val item = DnsItem.fromAddress(itemDeployTx.getAccountAddress());

    // Advance time to 20 seconds before auction end (within 60s prolongation window)
    val initialEndTime = now + AUCTION_START_DURATION;
    now = initialEndTime - 20;
    testing.setNow(now);

    val resOutbid = net.send(
        minter.address,
        createMessage({
            bounce: true,
            value: grams("1.0"),
            dest: collection.address,
            body: BidBroDomain {
                queryId: 2,
                bidder: user2.address,
                fiAmount: grams("600"),
                domain: makeBroDomain("charlie"),
                collectionAddress: collection.address,
            },
        }),
    );
    expect(resOutbid).toHaveSuccessfulTx({ to: item.address });

    val rawData = activeDataCell(item.address);
    val itemStore = ItemStorageInitialized.fromCell(rawData);
    val (_, auction) = itemStore.unpackAuction();

    // End time should be extended by (AUCTION_PROLONGATION - 20) = 40 seconds
    expect(auction.auctionEndTime).toEqual(
        (initialEndTime + (AUCTION_PROLONGATION - 20)) as uint64,
    );
}

get fun `test bro-fi: auction finalization grants ownership and triggers minter burn`() {
    var now = AUCTION_START_TIME + 100;
    testing.setNow(now);

    val minter = newActor("fi-minter", grams("100"));
    val (collection, _, user1, _) = deployBroFiCollection(minter.address);

    val bidFi = grams("500");
    val res1 = net.send(
        minter.address,
        createMessage({
            bounce: true,
            value: grams("1.0"),
            dest: collection.address,
            body: BidBroDomain {
                queryId: 1,
                bidder: user1.address,
                fiAmount: bidFi,
                domain: makeBroDomain("david"),
                collectionAddress: collection.address,
            },
        }),
    );
    val itemDeployTx = res1.findTransaction({ from: collection.address, deploy: true })!;
    val item = DnsItem.fromAddress(itemDeployTx.getAccountAddress());

    // Cannot finalize before 7 days have passed
    val earlyFinalize = net.send(
        user1.address,
        createMessage({
            bounce: true,
            value: grams("0.1"),
            dest: item.address,
            body: FinalizeAuction { queryId: 10 },
        }),
    );
    expect(earlyFinalize).toHaveFailedTx({
        to: item.address,
        exitCode: ERROR_AUCTION_NOT_FINISHED,
    });

    // Advance time beyond 7 days
    now += AUCTION_START_DURATION + 1;
    testing.setNow(now);

    val finalizeRes = net.send(
        user1.address,
        createMessage({
            bounce: true,
            value: grams("0.6"),
            dest: item.address,
            body: FinalizeAuction { queryId: 11 },
        }),
    );
    expect(finalizeRes).toHaveSuccessfulTx({ to: item.address });

    // Verify finalize notification was forwarded through collection to minter with winning bid
    val burnNotificationTx = finalizeRes.findTransaction({
        from: collection.address,
        to: minter.address,
    });
    expect(burnNotificationTx).toBeNotNull();

    val nftData = item.getNftData();
    expect(nftData.ownerAddress).toEqual(user1.address);

    val rawData = activeDataCell(item.address);
    val itemStore = ItemStorageInitialized.fromCell(rawData);
    val (isAuctionNull, _) = itemStore.unpackAuction();
    expect(isAuctionNull).toEqual(true);
}

get fun `test bro-fi: annual renewal extends expiration and burns FI tokens`() {
    var now = AUCTION_START_TIME + 100;
    testing.setNow(now);

    val minter = newActor("fi-minter", grams("100"));
    val (collection, _, user1, _) = deployBroFiCollection(minter.address);

    val bidFi = grams("500");
    val res1 = net.send(
        minter.address,
        createMessage({
            bounce: true,
            value: grams("1.0"),
            dest: collection.address,
            body: BidBroDomain {
                queryId: 1,
                bidder: user1.address,
                fiAmount: bidFi,
                domain: makeBroDomain("edward"),
                collectionAddress: collection.address,
            },
        }),
    );
    val itemDeployTx = res1.findTransaction({ from: collection.address, deploy: true })!;
    val item = DnsItem.fromAddress(itemDeployTx.getAccountAddress());

    // Advance 7 days and finalize
    now += AUCTION_START_DURATION + 1;
    testing.setNow(now);

    val finalizeRes = net.send(
        user1.address,
        createMessage({
            bounce: true,
            value: grams("0.6"),
            dest: item.address,
            body: FinalizeAuction { queryId: 11 },
        }),
    );
    expect(finalizeRes).toHaveSuccessfulTx({ to: item.address });

    val initialData = activeDataCell(item.address);
    val initialStore = ItemStorageInitialized.fromCell(initialData);
    val initialExpiry = initialStore.lastFillUpTime;

    // 6 chars ("edward"): min bid = 500 FI, 10% renewal fee = 50 FI
    val underpayFi = grams("40");
    val resUnderpay = net.send(
        minter.address,
        createMessage({
            bounce: true,
            value: grams("0.1"),
            dest: item.address,
            body: RenewBroDomain {
                queryId: 20,
                renewer: user1.address,
                fiAmount: underpayFi,
                itemAddress: item.address,
            },
        }),
    );
    expect(resUnderpay).toHaveFailedTx({
        to: item.address,
        exitCode: ERROR_BID_BELOW_MIN_PRICE,
    });

    // Valid renewal: 50 FI adds 1 year
    val renewalFi = grams("50");
    val resRenew = net.send(
        minter.address,
        createMessage({
            bounce: true,
            value: grams("0.1"),
            dest: item.address,
            body: RenewBroDomain {
                queryId: 21,
                renewer: user1.address,
                fiAmount: renewalFi,
                itemAddress: item.address,
            },
        }),
    );
    expect(resRenew).toHaveSuccessfulTx({ to: item.address });

    val afterData = activeDataCell(item.address);
    val afterStore = ItemStorageInitialized.fromCell(afterData);
    expect(afterStore.lastFillUpTime).toEqual(initialExpiry + ONE_YEAR);
}
