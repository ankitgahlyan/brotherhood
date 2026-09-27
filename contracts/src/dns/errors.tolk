import "@contracts/common/errors"

const ERROR_DNS_INVALID_SUBDOMAIN_BITS = Errors.DnsInvalidSubdomainBits as int

const ERROR_AUCTION_NOT_STARTED = Errors.AuctionNotStarted as int
const ERROR_DOMAIN_TOO_SHORT = Errors.DomainTooShort as int
const ERROR_DOMAIN_TOO_LONG = Errors.DomainTooLong as int
const ERROR_DOMAIN_FORMAT_INVALID = Errors.DomainFormatInvalid as int
const ERROR_DOMAIN_HAS_INVALID_CHARS = Errors.DomainHasInvalidChars as int
const ERROR_BID_BELOW_MIN_PRICE = Errors.BidBelowMinPrice as int
const ERROR_DOMAIN_IS_BLACKLISTED = Errors.DomainIsBlacklisted as int

const ERROR_NOT_OWNER = Errors.DnsNotOwner as int
const ERROR_NOT_ENOUGH_BALANCE = Errors.NotEnoughBalance as int
const ERROR_NOT_FROM_COLLECTION = Errors.NotFromCollection as int
const ERROR_ONLY_OWNER_CAN_FILL_UP_AFTER_AUCTION = Errors.OnlyOwnerCanFillUpAfterAuction as int
const ERROR_BID_TOO_LOW = Errors.BidTooLow as int
const ERROR_ONLY_OWNER_CAN_EDIT_CONTENT = Errors.OnlyOwnerCanEditContent as int
const ERROR_ONLY_OWNER_CAN_CHANGE_DNS = Errors.OnlyOwnerCanChangeDns as int
const ERROR_CONTENT_TAG_INVALID = Errors.ContentTagInvalid as int
const ERROR_GOVERNANCE_REQUIRES_NO_AUCTION = Errors.GovernanceRequiresNoAuction as int
const ERROR_DNS_BALANCE_RELEASE_FORBIDDEN = Errors.DnsBalanceReleaseForbidden as int
const ERROR_CONFIG_ENTRY_NOT_FOUND = Errors.ConfigEntryNotFound as int
const ERROR_CONFIG_OPERATION_INVALID = Errors.ConfigOperationInvalid as int
const ERROR_NOT_AUTHORIZED_TREASURY = Errors.NotAuthorizedTreasury as int
const ERROR_RESERVATION_PERIOD_ACTIVE = Errors.ReservationPeriodActive as int

const ERROR_WRONG_WORKCHAIN = Errors.WrongWorkchain as int
const ERROR_NO_ACTIVE_AUCTION = Errors.NoActiveAuction as int
const ERROR_AUCTION_NOT_FINISHED = Errors.AuctionNotFinished as int
const ERROR_AUCTION_ALREADY_FINISHED = Errors.AuctionAlreadyFinished as int
const ERROR_NO_WINNER = Errors.NoWinner as int
const ERROR_INCORRECT_SENDER = Errors.DnsIncorrectSender as int
const ERROR_UNKNOWN_OP = Errors.UnknownOp as int
