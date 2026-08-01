// CONTRACT_CONSTS
// Declare a compile-time constant upper-bound for our map
const AUTHORITY_THRESHOLD = 1000000 // 1 million votes = 100,000 acounts/voters
const ZERO_ADDRESS = address("EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c") // TODO mainnet addr
const MBRP_AMOUNT: int = ton("1000") // NOTE: store as consts to upgrade with code now minter updates, any const update also updates version but should not
const LOTTERY_ENTRY_AMT: coins = ton("10")
const ACTIVATION_WAIT: int = 604800 // 1 WEEK
const INVITE_WAIT: int = 14400 // 4 HOURS
const MAX_CLAIM_PERIOD: int = 63072000 // 2 YEARS
const CLOSURE_WAIT: int = 86400 // 1 day
