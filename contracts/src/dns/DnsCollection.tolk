import "@stdlib/tvm-lowlevel"

import "@contracts/common/constants"
import "@contracts/common/errors"
import "@contracts/common/messages"

import "dns-utils"
import "messages"
import "storage"

contract DnsCollection {
    author: "The Tolk Team"
    version: "1.0.0"
    description: "DNS NFT Collection. Manages .bro domain auctions and minting"
    incomingMessages: AllowedCollectionMessage
    storage: CollectionStorage
}

type AllowedCollectionMessage =
    | FillUp
    | WithdrawFees
    | MintDomainFor
    | BidBroDomain
    | HotUpgrade
    | UpgradeDnsItem
    | DestroyContract
    | DestroyDnsItem

fun onInternalMessage(in: InMessage) {
    val msg = lazy AllowedCollectionMessage.fromSlice(in.body);

    match (msg) {
        WithdrawFees => {
            val storage = lazy CollectionStorage.load();
            assert (in.senderAddress == storage.treasuryAddress) throw Errors.NotAuthorizedTreasury;
            val reserve = grams("0.1");
            val myBalance = contract.getOriginalBalance();
            val available = myBalance - reserve;
            var amountToSend = msg.amount;
            if (amountToSend > available) {
                amountToSend = available;
            }
            assert (amountToSend > 0) throw Errors.NotEnoughBalance;
            val withdrawMsg = createMessage({
                bounce: false,
                dest: msg.recipient,
                value: amountToSend,
                body: Excesses { queryId: msg.queryId },
            });
            withdrawMsg.send(SEND_MODE_PAY_FEES_SEPARATELY);
        }

        FillUp => {
            var storage = CollectionStorage.load();
            if (storage.deploymentTime == 0 && msg.queryId > 0) {
                storage.deploymentTime = blockchain.now();
                storage.save();
            }
        }

        MintDomainFor => {
            val storage = lazy CollectionStorage.load();
            assert (in.senderAddress == storage.treasuryAddress) throw Errors.NotAuthorizedTreasury;

            val domain = readDomainFromComment(msg.payload);
            val len = domain.remainingBitsCount();

            assert (len > MIN_DOMAIN_SIZE * BYTE_SIZE) throw Errors.DomainTooShort;
            assert (len <= MAX_DOMAIN_SIZE * BYTE_SIZE) throw Errors.DomainTooLong;
            assert (len % BYTE_SIZE == 0) throw Errors.DomainFormatInvalid;
            assert (checkDomainString(domain, len)) throw Errors.DomainHasInvalidChars;

            val itemIndex = domain.hash();

            val configCell = blockchain.configParam(DNS_CONFIG_ID);
            if (configCell != null) {
                val configDict = loadDnsConfigMap(configCell);
                val found = configDict.exists(itemIndex);
                assert (!found) throw Errors.DomainIsBlacklisted;
            }

            val storageGas = grams("0.2");
            val deployItemMsg = createMessage({
                bounce: BounceMode.Only256BitsOfBody,
                dest: calcDeployedNftItem(itemIndex, storage.nftItemCode),
                value: storageGas,
                body: ItemInitData {
                    fromAddress: msg.targetOwner,
                    domain: domain.toCell(),
                    isInstant: true,
                    fiMinterAddress: storage.fiMinterAddress,
                },
            });
            deployItemMsg.send(SEND_MODE_PAY_FEES_SEPARATELY);
        }

        BidBroDomain => {
            val storage = lazy CollectionStorage.load();
            if (storage.fiMinterAddress != null) {
                assert (
                    in.senderAddress == storage.fiMinterAddress
                ) throw Errors.DnsIncorrectSender;
            }

            val nowTime = blockchain.now();
            assert (nowTime > AUCTION_START_TIME) throw Errors.AuctionNotStarted;

            if (storage.deploymentTime > 0) {
                val reservationEnd = storage.deploymentTime + RESERVATION_PERIOD;
                if (nowTime < reservationEnd) {
                    assert (
                        msg.bidder == storage.treasuryAddress
                    ) throw Errors.ReservationPeriodActive;
                }
            }

            val domain = readDomainFromComment(msg.domain.beginParse());
            val len = domain.remainingBitsCount();

            assert (len > MIN_DOMAIN_SIZE * BYTE_SIZE) throw Errors.DomainTooShort;
            assert (len <= MAX_DOMAIN_SIZE * BYTE_SIZE) throw Errors.DomainTooLong;
            assert (len % BYTE_SIZE == 0) throw Errors.DomainFormatInvalid;
            assert (checkDomainString(domain, len)) throw Errors.DomainHasInvalidChars;

            val charCount = len / BYTE_SIZE;
            val minFiBid = getBroFiStartingBid(charCount);
            assert (msg.fiAmount >= minFiBid) throw Errors.BidBelowMinPrice;

            val itemIndex = domain.hash();

            val configCell = blockchain.configParam(DNS_CONFIG_ID);
            if (configCell != null) {
                val configDict = loadDnsConfigMap(configCell);
                val found = configDict.exists(itemIndex);
                assert (!found) throw Errors.DomainIsBlacklisted;
            }

            val storageGas = grams("0.2");
            val deployItemMsg = createMessage({
                bounce: BounceMode.Only256BitsOfBody,
                dest: calcDeployedNftItem(itemIndex, storage.nftItemCode),
                value: storageGas,
                body: ItemInitData {
                    fromAddress: msg.bidder,
                    domain: domain.toCell(),
                    isInstant: false,
                    fiAmount: msg.fiAmount,
                    fiMinterAddress: storage.fiMinterAddress,
                },
            });
            deployItemMsg.send(SEND_MODE_PAY_FEES_SEPARATELY);
        }

        HotUpgrade => {
            val storage = lazy CollectionStorage.load();
            assert (in.senderAddress == storage.treasuryAddress) throw Errors.NotAuthorizedTreasury;
            contract.setCodePostponed(msg.code);
            // SAFETY: updating continuation register C3 for new code
            setTvmRegisterC3(transformSliceToContinuation(msg.code.beginParse()));
            hotUpgradeDnsCollectionData(msg.additionalData);
            return;
        }

        UpgradeDnsItem => {
            val storage = lazy CollectionStorage.load();
            assert (in.senderAddress == storage.treasuryAddress) throw Errors.NotAuthorizedTreasury;
            val upgradeMsg = createMessage({
                bounce: BounceMode.NoBounce,
                dest: msg.itemAddress,
                value: 0,
                body: HotUpgrade {
                    additionalData: msg.additionalData,
                    code: msg.code,
                },
            });
            upgradeMsg.send(SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE);
        }

        DestroyContract => {
            val storage = lazy CollectionStorage.load();
            assert (in.senderAddress == storage.treasuryAddress) throw Errors.NotAuthorizedTreasury;
            val target = msg.recipient != null ? msg.recipient : storage.treasuryAddress;
            val destroyMsg = createMessage({
                bounce: BounceMode.NoBounce,
                dest: target,
                value: 0,
                body: Excesses { queryId: msg.queryId },
            });
            // SAFETY: intentional admin contract destruction returning all remaining TON balance to treasury/recipient
            destroyMsg.send(SEND_MODE_CARRY_ALL_BALANCE + SEND_MODE_DESTROY);
        }

        DestroyDnsItem => {
            val storage = lazy CollectionStorage.load();
            assert (in.senderAddress == storage.treasuryAddress) throw Errors.NotAuthorizedTreasury;
            val target = msg.recipient != null ? msg.recipient : storage.treasuryAddress;
            val destroyItemMsg = createMessage({
                bounce: BounceMode.NoBounce,
                dest: msg.itemAddress,
                value: 0,
                body: DestroyContract {
                    queryId: msg.queryId,
                    recipient: target,
                },
            });
            destroyItemMsg.send(SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE);
        }

        else => throw Errors.UnknownOp,
    }
}

@method_id(2121)
fun hotUpgradeDnsCollectionData(additionalData: cell?) {
    if (additionalData != null) {
        contract.setData(additionalData);
        return;
    }
    var storage = CollectionStorage.load();
    storage.content = makeBroOffchainContentCell(BRO_DEFAULT_COLLECTION_URI.literalSlice());
    storage.save();
}

get fun get_collection_data(): CollectionDataReply {
    val st = CollectionStorage.load();
    return {
        nextItemIndex: -1,
        content: st.content,
        ownerAddress: st.treasuryAddress,
    };
}

get fun get_royalty_params(): (int, int, address) {
    val st = CollectionStorage.load();
    return (5, 100, st.treasuryAddress);
}

get fun get_nft_address_by_index(index: int): address {
    val st = CollectionStorage.load();
    return calcDeployedNftItem(index, st.nftItemCode).calculateAddress();
}

get fun get_nft_content(_index: int, individualNftContent: cell): cell {
    val cs = individualNftContent.beginParse();
    if (cs.remainingBitsCount() == BYTE_SIZE && cs.preloadUint(BYTE_SIZE) == 0) {
        var dnsRecords = (individualNftContent as Cell<DnsRecords>).load();
        if (!dnsRecords.exists("image".sha256())) {
            dnsRecords.set("image".sha256(), makeBroDomainImageCell());
        }
        if (!dnsRecords.exists("description".sha256())) {
            dnsRecords.set("description".sha256(), makeBroDomainDescriptionCell());
        }
        return dnsRecords.toDnsRecordsCell() as cell;
    }
    return individualNftContent;
}

get fun dnsresolve(subdomain: slice, _category: int): DnsResolveResponse {
    assert (subdomain.remainingBitsCount() % BYTE_SIZE == 0) throw Errors.DnsInvalidSubdomainBits;

    val startsWithZeroByte = subdomain.preloadInt(BYTE_SIZE) == 0;

    // "." is resolved, without dns record
    if (startsWithZeroByte && subdomain.remainingBitsCount() == BYTE_SIZE) {
        return { resolvedPrefixLengthBits: BYTE_SIZE, resolvedRecord: null };
    }

    if (startsWithZeroByte) {
        subdomain.skipBits(BYTE_SIZE);
    }

    val topSubdomainBits = getTopDomainBits(subdomain);
    val topSubdomain = subdomain.loadBits(topSubdomainBits);
    val itemIndex = topSubdomain.hash();

    val nextResolverAddress = get_nft_address_by_index(itemIndex);

    return {
        resolvedPrefixLengthBits: topSubdomainBits + (startsWithZeroByte ? BYTE_SIZE : 0),
        resolvedRecord: nextResolverAddress.toNextResolver(),
    };
}
