import "@contracts/common/constants"
import "@contracts/common/errors"

// https://github.com/ton-blockchain/ton/blob/7e3df93ca2ab336716a230fceb1726d81bac0a06/crypto/block/block.tlb#L819
const DNS_NEXT_RESOLVER_PREFIX = 0xba93
const BYTE_SIZE = 8
const DNS_CONFIG_ID = 80

const TON_WWW_DOMAIN_SIZE = 8 // "ton.www" (6) + 2 null-encoding symbols
const TON_DOMAIN_SIZE = 4 // "ton" (3) + 1 null-encoding symbol
const TELEGRAM_DOMAIN_SIZE = 5 // "t.me" (3) + 2 null-encoding symbols
const MIN_DOMAIN_SIZE = 0
const MAX_DOMAIN_SIZE = 126

fun address.toNextResolver(self): cell {
    return beginCell().storeUint(DNS_NEXT_RESOLVER_PREFIX, 16).storeAddress(self).endCell();
}

fun makeBroDomainNameCell(domain: slice): cell {
    // TEP-64 snake string: 0x00 (8 bits) + domain ASCII + ".bro" (32 bits)
    if (BYTE_SIZE + domain.remainingBitsCount() + 4 * BYTE_SIZE <= 1023) {
        return beginCell()
            .storeUint(0, BYTE_SIZE)
            .storeSlice(domain)
            .storeSlice(".bro".literalSlice())
            .endCell();
    }
    return beginCell()
        .storeUint(0, BYTE_SIZE)
        .storeSlice(domain)
        .storeRef(beginCell().storeSlice(".bro".literalSlice()).endCell())
        .endCell();
}

// Snake-like domain in remaining bits/refs.
// "ab".ref("cd").ref("ef") -> "abcdef"
fun readDomainFromComment(inMsgBody: slice): slice {
    var body = inMsgBody;
    var result = beginCell();

    result.storeSlice(body.loadBits(body.remainingBitsCount()));

    repeat (body.depth()) {
        val refsLen = body.remainingRefsCount();
        assert (refsLen == 1) throw Errors.DomainFormatInvalid;
        body = body.loadRef().beginParse();
        result.storeSlice(body.loadBits(body.remainingBitsCount()));
    }

    return result.toSlice();
}

// "ton\0test\0" -> "ton"
fun getTopDomainBits(domain: slice): int {
    var bytes = domain;

    var bits = 0;
    var shouldStop = false;

    while (!shouldStop) {
        // we do not check domain.length because it MUST contain \0 character
        val ch = bytes.loadUint(BYTE_SIZE);

        shouldStop = ch == 0;

        if (!shouldStop) {
            bits += BYTE_SIZE;
        }
    }

    // matches original FunC exit code
    assert (bits > 0) throw Errors.DomainTooLong;
    return bits;
}

enum DomainChar {
    Hyphen = 45      // ASCII '-': allowed only inside a label, not as the first/last checked char.
    DigitZero = 48   // ASCII '0': lower bound for allowed digits
    DigitNine = 57   // ASCII '9': upper bound for allowed digits
    LowercaseA = 97  // ASCII 'a': lower bound for allowed lowercase letters
    LowercaseZ = 122 // ASCII 'z': upper bound for allowed lowercase letters
}

@inline_ref
fun checkDomainString(domain: slice, len: int): bool {
    var bytes = domain;
    var i = 0;

    val charCount = len / BYTE_SIZE;
    val lastChar = charCount - 1;

    repeat (charCount) {
        val ch = bytes.loadUint(BYTE_SIZE);

        val isDigit = ch >= (DomainChar.DigitZero as int) && ch <= (DomainChar.DigitNine as int);
        val isLowercaseLetter = ch >= (DomainChar.LowercaseA as int) &&
            ch <= (DomainChar.LowercaseZ as int);

        var valid = isDigit || isLowercaseLetter;
        if (!valid) {
            valid = ch == (DomainChar.Hyphen as int) && i > 0 && i < lastChar;
        }

        if (!valid) {
            return false;
        }

        i += 1;
    }

    return true;
}

struct MinPriceConfig {
    startMinPrice: int
    endMinPrice: int
}

fun getMinPriceConfig(domainCharCount: int): MinPriceConfig {
    var res = MinPriceConfig {
        startMinPrice: 10,
        endMinPrice: 1,
    };

    if (domainCharCount == 4) {
        res = { startMinPrice: 1000, endMinPrice: 100 };
    }
    if (domainCharCount == 5) {
        res = { startMinPrice: 500, endMinPrice: 50 };
    }
    if (domainCharCount == 6) {
        res = { startMinPrice: 400, endMinPrice: 40 };
    }
    if (domainCharCount == 7) {
        res = { startMinPrice: 300, endMinPrice: 30 };
    }
    if (domainCharCount == 8) {
        res = { startMinPrice: 200, endMinPrice: 20 };
    }
    if (domainCharCount == 9) {
        res = { startMinPrice: 100, endMinPrice: 10 };
    }
    if (domainCharCount == 10) {
        res = { startMinPrice: 50, endMinPrice: 5 };
    }

    return res;
}

fun getMinPrice(domainBitsLength: int, nowTime: int): int {
    val config = getMinPriceConfig(domainBitsLength / BYTE_SIZE);
    var startMinPrice = config.startMinPrice * ONE_TON;
    val endMinPrice = config.endMinPrice * ONE_TON;

    val seconds = nowTime - AUCTION_START_TIME;
    val months = seconds / ONE_MONTH;

    var res: int;

    if (months > 21) {
        res = endMinPrice;
    } else {
        repeat (months) {
            // -10% each passing month
            startMinPrice = startMinPrice * 90 / 100;
        }

        res = startMinPrice;
    }

    return res;
}

fun getBroFiStartingBid(charCount: int): coins {
    if (charCount <= 1) {
        return grams("10000");
    }
    if (charCount == 2) {
        return grams("5000");
    }
    if (charCount == 3) {
        return grams("2500");
    }
    if (charCount == 4) {
        return grams("1000");
    }
    if (charCount <= 8) {
        return grams("500");
    }
    return grams("100");
}

fun getBroFiRenewalFee(charCount: int): coins {
    return getBroFiStartingBid(charCount) / 10;
}
