import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@acton/testing/expect"
import "@acton/types/transaction"

import "@wrappers/DnsCollection.gen"
import "@contracts/common/constants"
import "@contracts/common/messages"
import "@contracts/dns/dns-utils"
import "@contracts/dns/errors"
import "@contracts/dns/messages"

import "test-utils"

get fun `test collection: validates domain format and minimum bid rules`() {
    val (collection, _, user) = deployCollectionContract();

    testing.setNow((AUCTION_START_TIME - 1));
    val beforeStart = collection.sendAny(
        user.address,
        makeBidBody(user.address, "appl", grams("1000"), collection.address),
        { value: grams("1"), bounce: true },
    );
    expect(beforeStart).toHaveFailedTx({
        to: collection.address,
        exitCode: ERROR_AUCTION_NOT_STARTED,
    });

    testing.setNow((AUCTION_START_TIME + 1));

    val emptyDomain = collection.sendAny(
        user.address,
        makeBidBodyFromDomain(user.address, createEmptySlice(), grams("10000"), collection.address),
        { value: grams("1"), bounce: true },
    );
    expect(emptyDomain).toHaveFailedTx({
        to: collection.address,
        exitCode: ERROR_DOMAIN_TOO_SHORT,
    });

    val tooLong = collection.sendAny(
        user.address,
        makeBidBodyFromDomain(
            user.address,
            repeatAsciiChar(97, 127),
            grams("100"),
            collection.address,
        ),
        { value: grams("1"), bounce: true },
    );
    expect(tooLong).toHaveFailedTx({ to: collection.address, exitCode: ERROR_DOMAIN_TOO_LONG });

    val nonByteAlignedDomain = beginCell()
        .storeSlice("alice".beginParse())
        .storeUint(1, 1)
        .endCell() as Cell<RemainingBitsAndRefs>;
    val badBits = collection.sendAny(
        user.address,
        BidBroDomain {
            queryId: 1,
            bidder: user.address,
            fiAmount: grams("500"),
            domain: nonByteAlignedDomain,
            collectionAddress: collection.address,
        }.toCell(),
        { value: grams("1"), bounce: true },
    );
    expect(badBits).toHaveFailedTx({
        to: collection.address,
        exitCode: ERROR_DOMAIN_FORMAT_INVALID,
    });

    val invalidChar = collection.sendAny(
        user.address,
        makeBidBody(user.address, "aLice", grams("500"), collection.address),
        { value: grams("1"), bounce: true },
    );
    expect(invalidChar).toHaveFailedTx({
        to: collection.address,
        exitCode: ERROR_DOMAIN_HAS_INVALID_CHARS,
    });

    val lowBid = collection.sendAny(
        user.address,
        makeBidBody(user.address, "appl", grams("999"), collection.address),
        { value: grams("1"), bounce: true },
    );
    expect(lowBid).toHaveFailedTx({ to: collection.address, exitCode: ERROR_BID_BELOW_MIN_PRICE });

    val atMinBid = collection.sendAny(
        user.address,
        makeBidBody(user.address, "appl", grams("1000"), collection.address),
        { value: grams("1"), bounce: true },
    );
    expect(atMinBid).toHaveSuccessfulTx({ to: collection.address });

    val deployedItem = atMinBid.findTransaction({ from: collection.address, deploy: true });
    expect(deployedItem).toBeNotNull();

    val expectedAddress = collection.getNftAddressByIndex(domainIndex("appl"));
    expect(deployedItem!.getAccountAddress()).toEqual(expectedAddress);
}

get fun `test collection: covers exact launch, 1-char, max-length, and hyphen boundaries`() {
    val (collection, _, user) = deployCollectionContract();

    testing.setNow(AUCTION_START_TIME);
    val exactStart = collection.sendAny(
        user.address,
        makeBidBody(user.address, "edge", grams("1000"), collection.address),
        { value: grams("1"), bounce: true },
    );
    expect(exactStart).toHaveFailedTx({
        to: collection.address,
        exitCode: ERROR_AUCTION_NOT_STARTED,
    });

    testing.setNow((AUCTION_START_TIME + 1));

    val oneCharDeploy = collection.sendAny(
        user.address,
        makeBidBody(user.address, "x", grams("10000"), collection.address),
        { value: grams("1"), bounce: true },
    );
    expect(oneCharDeploy).toHaveSuccessfulTx({ from: user.address, to: collection.address });
    expect(
        oneCharDeploy.findTransaction({ from: collection.address, deploy: true }),
    ).toBeNotNull();

    val maxLengthDeploy = collection.sendAny(
        user.address,
        makeBidBodyFromDomain(
            user.address,
            repeatAsciiChar(97, 126),
            grams("100"),
            collection.address,
        ),
        { value: grams("1"), bounce: true },
    );
    expect(maxLengthDeploy).toHaveSuccessfulTx({ from: user.address, to: collection.address });
    expect(
        maxLengthDeploy.findTransaction({ from: collection.address, deploy: true }),
    ).toBeNotNull();

    val hyphenValid = collection.sendAny(
        user.address,
        makeBidBody(user.address, "ab-c", grams("1000"), collection.address),
        { value: grams("1"), bounce: true },
    );
    expect(hyphenValid).toHaveSuccessfulTx({ from: user.address, to: collection.address });

    val hyphenAtStart = collection.sendAny(
        user.address,
        makeBidBody(user.address, "-abc", grams("1000"), collection.address),
        { value: grams("1"), bounce: true },
    );
    expect(hyphenAtStart).toHaveFailedTx({
        from: user.address,
        to: collection.address,
        exitCode: ERROR_DOMAIN_HAS_INVALID_CHARS,
    });

    val hyphenAtEnd = collection.sendAny(
        user.address,
        makeBidBody(user.address, "abc-", grams("1000"), collection.address),
        { value: grams("1"), bounce: true },
    );
    expect(hyphenAtEnd).toHaveFailedTx({
        from: user.address,
        to: collection.address,
        exitCode: ERROR_DOMAIN_HAS_INVALID_CHARS,
    });
}

get fun `test collection: rejects malformed snake payloads and unknown opcodes`() {
    val (collection, _, user) = deployCollectionContract();
    testing.setNow((AUCTION_START_TIME + 1));

    val malformedDomainCell = beginCell()
        .storeSlice("ab".beginParse())
        .storeRef(beginCell().storeSlice("cd".beginParse()).endCell())
        .storeRef(beginCell().storeSlice("ef".beginParse()).endCell())
        .endCell() as Cell<RemainingBitsAndRefs>;
    val malformedSnake = collection.sendAny(
        user.address,
        BidBroDomain {
            queryId: 1,
            bidder: user.address,
            fiAmount: grams("500"),
            domain: malformedDomainCell,
            collectionAddress: collection.address,
        }.toCell(),
        { value: grams("1"), bounce: true },
    );
    expect(malformedSnake).toHaveFailedTx({
        from: user.address,
        to: collection.address,
        exitCode: ERROR_DOMAIN_FORMAT_INVALID,
    });

    val unknownOp = collection.sendAny(
        user.address,
        beginCell().storeUint(0x7FFFFFFF, 32).storeUint(1, 64).endCell(),
        { value: grams("1"), bounce: true },
    );
    expect(unknownOp).toHaveFailedTx({
        from: user.address,
        to: collection.address,
        exitCode: ERROR_UNKNOWN_OP,
    });
}

get fun `test collection: denies deployment for blacklisted domains via config param 80`() {
    val (collection, _, user) = deployCollectionContract();
    testing.setNow((AUCTION_START_TIME + 1));

    val blockedDomain = "evil";
    setDnsBlacklist(domainIndex(blockedDomain));

    val res = collection.sendAny(
        user.address,
        makeBidBody(user.address, blockedDomain, grams("1000"), collection.address),
        { value: grams("1"), bounce: true },
    );
    expect(res).toHaveFailedTx({ to: collection.address, exitCode: ERROR_DOMAIN_IS_BLACKLISTED });
}

get fun `test collection: dnsresolve returns next-resolver for top label and dot handling`() {
    val (collection, _, _) = deployCollectionContract();

    val dotResolved = collection.dnsresolve(makeDotSlice(), 0);
    expect(dotResolved.resolvedPrefixLengthBits).toEqual(BYTE_SIZE);
    expect(dotResolved.resolvedRecord).toBeNull();

    val expectedItem = collection.getNftAddressByIndex(domainIndex("alice"));

    val aliceResolved = collection.dnsresolve(makeLabelDomainSlice("alice"), 1234);
    expect(aliceResolved.resolvedPrefixLengthBits).toEqual(5 * BYTE_SIZE);
    expect(aliceResolved.resolvedRecord).toBeNotNull();
    expect(parseNextResolverCell(aliceResolved.resolvedRecord!)).toEqual(expectedItem);

    val aliceTailResolved = collection.dnsresolve(makeLabelAndTailSlice("alice", "sub"), 0);
    expect(aliceTailResolved.resolvedPrefixLengthBits).toEqual(5 * BYTE_SIZE);
    expect(aliceTailResolved.resolvedRecord).toBeNotNull();
    expect(parseNextResolverCell(aliceTailResolved.resolvedRecord!)).toEqual(expectedItem);

    val leadingResolved = collection.dnsresolve(makeLeadingZero(makeLabelDomainSlice("alice")), 0);
    expect(leadingResolved.resolvedPrefixLengthBits).toEqual(6 * BYTE_SIZE);
    expect(leadingResolved.resolvedRecord).toBeNotNull();
    expect(parseNextResolverCell(leadingResolved.resolvedRecord!)).toEqual(expectedItem);
}

get fun `test collection: getters are stable and content getter is pass-through`() {
    val (collection, deployer, _) = deployCollectionContract();

    val data = collection.getCollectionData();
    expect(data.nextItemIndex).toEqual(-1);
    expect(data.ownerAddress).toEqual(deployer.address);
    expect(data.content.hash()).toEqual(makeCollectionContentCell().hash());

    val idx = domainIndex("alice");
    val addr1 = collection.getNftAddressByIndex(idx);
    val addr2 = collection.getNftAddressByIndex(idx);
    expect(addr1).toEqual(addr2);

    val sampleContent = makeDnsTextRecord("pass-through");
    val passthrough = collection.getNftContent(0, sampleContent);
    expect(passthrough.hash()).toEqual(sampleContent.hash());
}

get fun `test collection: request upgrade code forwards HotUpgrade with latest nftItemCode to target`() {
    val (collection, _, user) = deployCollectionContract();

    val targetItem = testing.treasury("target-dns-item");
    val res = collection.sendRequestUpgradeCode(
        user.address,
        targetItem.address,
        { value: grams("0.1"), bounce: false },
    );

    expect(res).toHaveSuccessfulTx<RequestUpgradeCode>({
        from: user.address,
        to: collection.address,
    });
    expect(res).toHaveSuccessfulTx<HotUpgrade>({
        from: collection.address,
        to: targetItem.address,
    });
}
