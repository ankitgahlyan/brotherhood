import "@contracts/common/constants"
import "@contracts/common/errors"

import "dns-utils"
import "messages"
import "storage"

contract DnsCollection {
    author: "The Tolk Team"
    version: "1.0.0"
    description: "DNS NFT Collection. Manages .ton domain auctions and minting"
    incomingMessages: AllowedCollectionMessage
    storage: CollectionStorage
}

type AllowedCollectionMessage =
    | DeployDnsDomain
    | FillUp
    | WithdrawFees
    | MintDomainFor
    | BidBroDomain

fun onInternalMessage(in: InMessage) {
    val msg = lazy AllowedCollectionMessage.fromSlice(in.body);

    match (msg) {
        DeployDnsDomain => {
            val storage = lazy CollectionStorage.load();

            val nowTime = blockchain.now();
            assert (nowTime > AUCTION_START_TIME) throw Errors.AuctionNotStarted;

            if (storage.isInstantMint && storage.deploymentTime > 0) {
                val reservationEnd = storage.deploymentTime + RESERVATION_PERIOD;
                if (nowTime < reservationEnd) {
                    assert (
                        in.senderAddress == storage.treasuryAddress
                    ) throw Errors.ReservationPeriodActive;
                }
            }

            val domain = readDomainFromComment(msg.payload);
            val len = domain.remainingBitsCount();

            val minDomainSize = storage.isInstantMint ? 0 : MIN_DOMAIN_SIZE;
            assert (len > minDomainSize * BYTE_SIZE) throw Errors.DomainTooShort;
            assert (len <= MAX_DOMAIN_SIZE * BYTE_SIZE) throw Errors.DomainTooLong;
            assert (len % BYTE_SIZE == 0) throw Errors.DomainFormatInvalid;
            assert (checkDomainString(domain, len)) throw Errors.DomainHasInvalidChars;

            val charCount = len / BYTE_SIZE;
            val minPrice = storage.isInstantMint
                ? getBroMinPrice(charCount)
                : getMinPrice(len, nowTime);
            assert (in.valueCoins >= minPrice) throw Errors.BidBelowMinPrice;

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
                value: storage.isInstantMint ? storageGas : 0,
                body: ItemInitData {
                    fromAddress: in.senderAddress,
                    domain: domain.toCell(),
                    isInstant: storage.isInstantMint,
                },
            });
            if (storage.isInstantMint) {
                deployItemMsg.send(SEND_MODE_PAY_FEES_SEPARATELY);
            } else {
                deployItemMsg.send(SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE);
            }
        }

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
            // Top up balance.
        }

        MintDomainFor => {
            val storage = lazy CollectionStorage.load();
            assert (in.senderAddress == storage.treasuryAddress) throw Errors.NotAuthorizedTreasury;

            val domain = readDomainFromComment(msg.payload);
            val len = domain.remainingBitsCount();

            val minDomainSize = storage.isInstantMint ? 0 : MIN_DOMAIN_SIZE;
            assert (len > minDomainSize * BYTE_SIZE) throw Errors.DomainTooShort;
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
                value: storage.isInstantMint ? storageGas : 0,
                body: ItemInitData {
                    fromAddress: msg.targetOwner,
                    domain: domain.toCell(),
                    isInstant: storage.isInstantMint,
                },
            });
            if (storage.isInstantMint) {
                deployItemMsg.send(SEND_MODE_PAY_FEES_SEPARATELY);
            } else {
                deployItemMsg.send(SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE);
            }
        }

        BidBroDomain => {
            val storage = lazy CollectionStorage.load();
            if (storage.fiMinterAddress != null) {
                assert (
                    in.senderAddress == storage.fiMinterAddress
                ) throw Errors.DnsIncorrectSender;
            }

            val domain = readDomainFromComment(msg.domain.beginParse());
            val len = domain.remainingBitsCount();

            val minDomainSize = storage.isInstantMint ? 0 : MIN_DOMAIN_SIZE;
            assert (len > minDomainSize * BYTE_SIZE) throw Errors.DomainTooShort;
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
                    fiMinterAddress: in.senderAddress,
                },
            });
            deployItemMsg.send(SEND_MODE_PAY_FEES_SEPARATELY);
        }

        else => throw Errors.UnknownOp,
    }
}

get fun get_collection_data(): CollectionDataReply {
    val st = CollectionStorage.load();
    return {
        nextItemIndex: -1,
        content: st.content,
        ownerAddress: st.isInstantMint ? st.treasuryAddress : null,
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
