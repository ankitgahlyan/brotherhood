import "@stdlib/tvm-lowlevel"

import "@contracts/common/constants"
import "@contracts/common/errors"
import "@contracts/common/messages"

import "auction"
import "dns-utils"
import "messages"
import "storage"

contract DnsItem {
    author: "The Tolk Team"
    version: "1.0.0"
    description: "DNS NFT Item. Domain name with auction support"
    incomingMessages: AllowedItemMessage
    storage: ItemStorageInitialized
    storageAtDeployment: ItemStorageNotInitialized
}

type AllowedItemMessage =
    | TransferOwnership
    | EditContent
    | ChangeDnsRecord
    | ProcessGovernanceDecision
    | DnsRecordRelease
    | GetStaticData
    | FillUp
    | FinalizeAuction
    | RenewBroDomain
    | HotUpgrade
    | DestroyContract

type GovernanceDecision = GovernanceTransfer | GovernanceRelease

fun onInternalMessage(in: InMessage) {
    val loadingStorage = startLoadingDnsItemStorage();

    if (!loadingStorage.isInitialized()) {
        val uninitStorage = loadingStorage.parseNotInitialized();
        assert (in.senderAddress == uninitStorage.collectionAddress) throw Errors.NotFromCollection;

        val initData = ItemInitData.fromSlice(in.body);

        val now = blockchain.now();

        val seconds = now - AUCTION_START_TIME;
        var months = seconds / ONE_MONTH;
        if (months > 12) {
            months = 12;
        }

        val duration = AUCTION_START_DURATION -
            // check-disable-next-line divide-before-multiply
            (AUCTION_START_DURATION - AUCTION_END_DURATION) * months / 12;

        val _auctionEndTime = now + duration;
        var initialContent: DnsRecords = [];
        initialContent.set("name".sha256(), makeBroDomainNameCell(initData.domain.beginParse()));
        initialContent.set("image".sha256(), makeBroDomainImageCell());
        initialContent.set("description".sha256(), makeBroDomainDescriptionCell());

        val isInstant = initData.isInstant;
        val bidAmount = initData.fiAmount > 0 ? initData.fiAmount : in.valueCoins;
        val initStorage = ItemStorageInitialized {
            index: uninitStorage.index,
            collectionAddress: uninitStorage.collectionAddress,
            ownerAddress: isInstant ? initData.fromAddress : null,
            content: initialContent.toDnsRecordsCell(),
            domain: initData.domain,
            auction: isInstant
                ? null
                : AuctionState {
                    maxBidAddress: initData.fromAddress,
                    maxBidAmount: bidAmount,
                    auctionEndTime: now + AUCTION_START_DURATION,
                }.toCell(),
            lastFillUpTime: now,
            extra: initData.fiMinterAddress != null
                ? ItemExtra { fiMinterAddress: initData.fiMinterAddress }.toCell()
                : null,
        };

        initStorage.save();
        return;
    }

    var storage = loadingStorage.parseInitialized();

    if (in.senderAddress == storage.collectionAddress) {
        if (in.body.remainingBitsCount() >= 32) {
            val op = in.body.preloadUint(32);
            if (op == 0x0000100b) {
                val upgrade = HotUpgrade.fromSlice(in.body);
                contract.setCodePostponed(upgrade.code);
                // SAFETY: updating continuation register C3 for new code
                setTvmRegisterC3(transformSliceToContinuation(upgrade.code.beginParse()));
                hotUpgradeDnsItemData(upgrade.additionalData);
                return;
            }
            if (op == 0x646e7364) {
                val destroy = DestroyContract.fromSlice(in.body);
                val target = destroy.recipient != null
                    ? destroy.recipient
                    : storage.collectionAddress;
                val destroyMsg = createMessage({
                    bounce: BounceMode.NoBounce,
                    dest: target,
                    value: 0,
                    body: Excesses { queryId: destroy.queryId },
                });
                // SAFETY: intentional admin contract destruction returning all remaining TON balance
                destroyMsg.send(SEND_MODE_CARRY_ALL_BALANCE + SEND_MODE_DESTROY);
                return;
            }
        }

        val initData = ItemInitData.fromSlice(in.body);

        if (initData.fiAmount == 0 && initData.fiMinterAddress == null) {
            // Standard TON DNS ignores repeated init from collection
            return;
        }

        val unpackedAuction = storage.unpackAuction();
        val isAuctionNull = unpackedAuction.0;
        var auction = unpackedAuction.1;
        val isAuctionComplete = blockchain.now() > auction.auctionEndTime;

        assert (!isAuctionNull) throw Errors.AuctionAlreadyFinished;
        assert (!isAuctionComplete) throw Errors.AuctionAlreadyFinished;

        val incomingBid = initData.fiAmount > 0 ? initData.fiAmount : in.valueCoins;
        assert (incomingBid >= mulDivFloor(auction.maxBidAmount, 105, 100)) throw Errors.BidTooLow;

        val fiMinterAddr = storage.getFiMinterAddress();
        if (fiMinterAddr != null && auction.maxBidAddress != null) {
            val refundNotifyMsg = createMessage({
                bounce: BounceMode.NoBounce,
                dest: fiMinterAddr,
                value: grams("0.05"),
                body: DnsOutbidNotification {
                    queryId: blockchain.logicalTime(),
                    outbidAddress: auction.maxBidAddress,
                    fiAmount: auction.maxBidAmount,
                    domain: storage.domain as Cell<RemainingBitsAndRefs>,
                },
            });
            refundNotifyMsg.send(SEND_MODE_PAY_FEES_SEPARATELY);
        }

        auction.maxBidAmount = incomingBid;
        auction.maxBidAddress = initData.fromAddress;

        val deltaTime = AUCTION_PROLONGATION - (auction.auctionEndTime - blockchain.now());
        if (deltaTime > 0) {
            auction.auctionEndTime += deltaTime;
        }

        storage.auction = auction.toCell();
        storage.lastFillUpTime = blockchain.now();
        storage.save();
        return;
    }

    val unpackedAuction = storage.unpackAuction();
    val isAuctionNull = unpackedAuction.0;
    var auction = unpackedAuction.1;
    val isAuctionComplete = blockchain.now() > auction.auctionEndTime;

    if (in.body.isEmpty() || in.body.preloadUint(32) == 0) {
        processBidOrTopUp(
            in.senderAddress,
            in.valueCoins,
            mutate storage,
            mutate auction,
            isAuctionComplete,
        );
        return;
    }

    var myBalance = contract.getOriginalBalance();

    if (isAuctionComplete && !isAuctionNull && storage.getFiMinterAddress() == null) {
        val parsedHeader = lazy MessageHeader.fromSlice(in.body);

        val balanceBeforeMsg = myBalance - in.valueCoins;

        var amountToSend = balanceBeforeMsg;
        val available = balanceBeforeMsg - MIN_TONS_FOR_STORAGE;

        if (amountToSend > available) {
            amountToSend = available;
        }

        if (amountToSend > 0) {
            val refundMsg = createMessage({
                body: FillUp { queryId: parsedHeader.queryId },
                bounce: false,
                dest: storage.collectionAddress,
                value: amountToSend,
            });
            refundMsg.send(SEND_MODE_IGNORE_ERRORS);

            // since messages are processed at action phase, we need to manage
            // balance in compute phase runtime ourselves
            myBalance -= amountToSend;
        }

        storage.ownerAddress = auction.maxBidAddress;
        storage.auction = null;
        storage.save();
    }

    var msg = lazy AllowedItemMessage.fromSlice(in.body);

    match (msg) {
        TransferOwnership => {
            assert (
                storage.ownerAddress != null && in.senderAddress == storage.ownerAddress
            ) throw Errors.DnsNotOwner;

            applyOwnershipTransfer(
                myBalance,
                mutate storage,
                msg.queryId,
                msg.transferData,
                in.originalForwardFee,
            );
        }

        EditContent => {
            assert (
                storage.ownerAddress != null && in.senderAddress == storage.ownerAddress
            ) throw Errors.OnlyOwnerCanEditContent;

            storage.content = msg.newContent;
            val now = blockchain.now();
            if (now > (storage.lastFillUpTime as int)) {
                storage.lastFillUpTime = now;
            }
            storage.save();
        }

        ChangeDnsRecord => {
            assert (
                storage.ownerAddress != null && in.senderAddress == storage.ownerAddress
            ) throw Errors.OnlyOwnerCanChangeDns;

            var dnsRecords = storage.content.load();

            if (msg.value.remainingRefsCount() > 0) {
                dnsRecords.set(msg.key, msg.value.loadRef());
            } else {
                dnsRecords.delete(msg.key);
                if (msg.key == "description".sha256() && storage.getFiMinterAddress() != null) {
                    dnsRecords.set("description".sha256(), makeBroDomainDescriptionCell());
                }
            }
            if (!dnsRecords.exists("image".sha256()) && storage.getFiMinterAddress() != null) {
                dnsRecords.set("image".sha256(), makeBroDomainImageCell());
            }

            storage.content = dnsRecords.toDnsRecordsCell();
            val now = blockchain.now();
            if (now > (storage.lastFillUpTime as int)) {
                storage.lastFillUpTime = now;
            }
            storage.save();
        }

        ProcessGovernanceDecision => {
            assert (isAuctionNull) throw Errors.GovernanceRequiresNoAuction;

            val configCell = blockchain.configParam(DNS_CONFIG_ID);
            assert (configCell != null) throw Errors.ConfigEntryNotFound;

            val configDict = loadDnsConfigMap(configCell);

            val configValueLookup = configDict.get(storage.index);
            assert (configValueLookup.isFound) throw Errors.ConfigEntryNotFound;

            val configValue = configValueLookup.loadValue();
            // no need for lazy here
            val decision = GovernanceDecision.fromSlice(
                configValue,
                { throwIfOpcodeDoesNotMatch: Errors.ConfigOperationInvalid },
            );

            match (decision) {
                GovernanceTransfer => {
                    applyOwnershipTransfer(
                        myBalance,
                        mutate storage,
                        msg.queryId,
                        decision.transferData,
                        in.originalForwardFee,
                    );
                }

                GovernanceRelease => {
                    val fillMsg = createMessage({
                        body: FillUp { queryId: msg.queryId },
                        bounce: false,
                        dest: storage.collectionAddress,
                        value: 0,
                    });
                    // SAFETY: governance release intentionally sends all remaining balance to the collection and destroys this item contract.
                    fillMsg.send(SEND_MODE_CARRY_ALL_BALANCE + SEND_MODE_DESTROY);
                }
            }
        }

        DnsRecordRelease => {
            val now = blockchain.now();

            assert (
                now - storage.lastFillUpTime > ONE_YEAR && isAuctionNull
            ) throw Errors.DnsBalanceReleaseForbidden;

            val minPrice = getMinPrice(storage.domain.beginParse().remainingBitsCount(), now);
            assert (in.valueCoins >= minPrice) throw Errors.BidTooLow;

            val balanceWithoutMsg = myBalance - in.valueCoins;
            val amountToSend = balanceWithoutMsg - MIN_TONS_FOR_STORAGE;

            if (amountToSend > 0) {
                val responseMsg = createMessage({
                    body: DnsRecordRelease { queryId: msg.queryId },
                    bounce: false,
                    dest: storage.ownerAddress!,
                    value: amountToSend,
                });
                responseMsg.send(SEND_MODE_IGNORE_ERRORS);
            }

            storage.ownerAddress = null;
            storage.auction = AuctionState {
                maxBidAddress: in.senderAddress,
                auctionEndTime: now + AUCTION_START_DURATION,
                maxBidAmount: in.valueCoins,
            }.toCell();
            storage.lastFillUpTime = now;

            storage.save();
        }

        GetStaticData => {
            val responseMsg = createMessage({
                body: ReportStaticData {
                    queryId: msg.queryId,
                    itemIndex: storage.index,
                    collectionAddress: storage.collectionAddress,
                },
                bounce: false,
                dest: in.senderAddress,
                value: 0,
            });
            responseMsg.send(SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE);
        }

        FillUp => {
            assert (
                storage.ownerAddress != null && in.senderAddress == storage.ownerAddress
            ) throw Errors.OnlyOwnerCanFillUpAfterAuction;

            val now = blockchain.now();
            if (now > (storage.lastFillUpTime as int)) {
                storage.lastFillUpTime = now;
            }
            storage.save();
        }

        FinalizeAuction => {
            val unpackedAuction = storage.unpackAuction();
            assert (!unpackedAuction.0) throw Errors.NoActiveAuction;
            val auction = unpackedAuction.1;
            assert (blockchain.now() >= auction.auctionEndTime) throw Errors.AuctionNotFinished;
            assert (auction.maxBidAddress != null) throw Errors.NoWinner;

            storage.ownerAddress = auction.maxBidAddress;
            storage.auction = null;
            storage.lastFillUpTime = blockchain.now() + ONE_YEAR;
            storage.save();

            val fiMinterAddr = storage.getFiMinterAddress();
            if (fiMinterAddr != null) {
                val notifyMsg = createMessage({
                    bounce: BounceMode.NoBounce,
                    dest: fiMinterAddr,
                    value: grams("0.5"),
                    body: DnsAuctionFinalized {
                        queryId: msg.queryId,
                        winner: storage.ownerAddress,
                        winningFiAmount: auction.maxBidAmount,
                        domain: storage.domain as Cell<RemainingBitsAndRefs>,
                    },
                });
                notifyMsg.send(SEND_MODE_PAY_FEES_SEPARATELY);
            }
        }

        RenewBroDomain => {
            val fiMinterAddr = storage.getFiMinterAddress();
            if (fiMinterAddr != null) {
                assert (in.senderAddress == fiMinterAddr) throw Errors.DnsIncorrectSender;
            } else {
                assert (
                    storage.ownerAddress != null && in.senderAddress == storage.ownerAddress
                ) throw Errors.OnlyOwnerCanFillUpAfterAuction;
            }
            val domainLen = storage.domain.beginParse().remainingBitsCount();
            val charCount = domainLen / BYTE_SIZE;
            val renewalFee = getBroFiRenewalFee(charCount);
            assert (msg.fiAmount >= renewalFee) throw Errors.BidBelowMinPrice;

            val now = blockchain.now();
            val maxFuture = now + 5 * ONE_YEAR;
            var newExpiry = (storage.lastFillUpTime as int) > now
                ? (storage.lastFillUpTime as int)
                : now;
            newExpiry += ONE_YEAR;
            if (newExpiry > maxFuture) {
                newExpiry = maxFuture;
            }
            storage.lastFillUpTime = newExpiry;
            storage.save();
        }

        HotUpgrade => {
            assert (in.senderAddress == storage.collectionAddress) throw Errors.NotFromCollection;
            contract.setCodePostponed(msg.code);
            // SAFETY: updating continuation register C3 for new code
            setTvmRegisterC3(transformSliceToContinuation(msg.code.beginParse()));
            hotUpgradeDnsItemData(msg.additionalData);
            return;
        }

        DestroyContract => {
            assert (
                storage.ownerAddress != null && in.senderAddress == storage.ownerAddress
            ) throw Errors.DnsNotOwner;
            val target = msg.recipient != null ? msg.recipient : in.senderAddress;
            val destroyMsg = createMessage({
                bounce: BounceMode.NoBounce,
                dest: target,
                value: 0,
                body: Excesses { queryId: msg.queryId },
            });
            // SAFETY: intentional owner contract destruction returning all remaining TON balance
            destroyMsg.send(SEND_MODE_CARRY_ALL_BALANCE + SEND_MODE_DESTROY);
        }

        else => throw Errors.UnknownOp,
    }
}

@method_id(2121)
fun hotUpgradeDnsItemData(additionalData: cell?) {
    if (additionalData != null) {
        contract.setData(additionalData);
        return;
    }
    val loading = startLoadingDnsItemStorage();
    if (loading.isInitialized()) {
        var st = loading.parseInitialized();
        var dnsRecords = st.content.load();
        if (!dnsRecords.exists("name".sha256())) {
            dnsRecords.set("name".sha256(), makeBroDomainNameCell(st.domain.beginParse()));
        }
        if (!dnsRecords.exists("image".sha256())) {
            dnsRecords.set("image".sha256(), makeBroDomainImageCell());
        }
        if (!dnsRecords.exists("description".sha256())) {
            dnsRecords.set("description".sha256(), makeBroDomainDescriptionCell());
        }
        st.content = dnsRecords.toDnsRecordsCell();
        st.save();
    }
}

get fun get_nft_data(): NftDataReply {
    val loading = startLoadingDnsItemStorage();

    if (!loading.isInitialized()) {
        val st = loading.parseNotInitialized();

        return {
            isInitialized: false,
            index: st.index,
            collectionAddress: st.collectionAddress,
            ownerAddress: null,
            content: null,
        };
    }

    val st = loading.parseInitialized();
    return {
        isInitialized: true,
        index: st.index,
        collectionAddress: st.collectionAddress,
        ownerAddress: st.ownerAddress,
        content: st.content,
    };
}

get fun get_editor(): address? {
    val loading = startLoadingDnsItemStorage();

    if (!loading.isInitialized()) {
        return null;
    }

    val st = loading.parseInitialized();
    return st.ownerAddress;
}

get fun get_domain(): slice {
    // this will panic if storage is not init, but so does FunC impl
    val st = startLoadingDnsItemStorage().parseInitialized();
    return st.domain.beginParse();
}

get fun get_auction_info(): AuctionState {
    val st = startLoadingDnsItemStorage().parseInitialized();

    return st.unpackAuction().1;
}

get fun get_last_fill_up_time(): int {
    val st = startLoadingDnsItemStorage().parseInitialized();
    return st.lastFillUpTime;
}

get fun dnsresolve(subdomain: slice, category: uint256): DnsResolveResponse {
    val subdomainBits = subdomain.remainingBitsCount();
    assert (subdomainBits % BYTE_SIZE == 0) throw Errors.DnsInvalidSubdomainBits;

    val st = startLoadingDnsItemStorage().parseInitialized();

    if (blockchain.now() - st.lastFillUpTime > ONE_YEAR) {
        return { resolvedPrefixLengthBits: BYTE_SIZE, resolvedRecord: null };
    }

    val dnsRecord = st.content.load();

    val startsWithZeroByte = subdomain.preloadInt(BYTE_SIZE) == 0;
    assert (startsWithZeroByte) throw Errors.GovernanceRequiresNoAuction;

    if (subdomainBits > BYTE_SIZE) {
        category = "dns_next_resolver".sha256();
    }

    if (category == 0) {
        return { resolvedPrefixLengthBits: BYTE_SIZE, resolvedRecord: dnsRecord.toLowLevelDict() };
    }

    val value = dnsRecord.get(category);
    if (!value.isFound) {
        return { resolvedPrefixLengthBits: BYTE_SIZE, resolvedRecord: null };
    }

    return { resolvedPrefixLengthBits: BYTE_SIZE, resolvedRecord: value.loadValue() };
}
