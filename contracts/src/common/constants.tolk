// ============================================================================
// GLOBAL PROTOCOL CONSTANTS
// Centralized configuration for all Brotherhood & FossFi contracts & scripts.
// Edit parameters and deployed addresses here.
// ============================================================================
// ----------------------------------------------------------------------------
// 1. DEPLOYED / EMULATION ADDRESSES
// Replace these with actual testnet/mainnet addresses produced by deploy scripts.
// ----------------------------------------------------------------------------

// Brotherhood .bro DNS Collection & Resolver (from deploy-bro.tolk)
const DEPLOYED_BRO_COLLECTION_RESOLVER: address = address("kQDechleN24a8vT3HHBwF-xUK4aUkMXJPA63IhBemZJoJbpd")
const DEPLOYED_BRO_TREASURY_ADDRESS: address = address("kQDechleN24a8vT3HHBwF-xUK4aUkMXJPA63IhBemZJoJbpd")

// DAO Proxy address (from deploy-fi.tolk)
const DAO_PROXY_ADDR = "kQBs0efjOXMJ_mTYkUqB16JynaYqMNpt2eTNzy79Ge0eLGk7"
const DEPLOYED_DAO_PROXY_ADDRESS: address = address("kQBs0efjOXMJ_mTYkUqB16JynaYqMNpt2eTNzy79Ge0eLGk7")

// FossFi Minter Address (from deploy-fi.tolk)
const FI_ADDRESS = "kQByVk5DwR_q9O0QECxai3CDpE-7Qimbb4OUE9Bt4Qz0deAE"
const DEPLOYED_FI_MINTER_ADDRESS: address = address("kQByVk5DwR_q9O0QECxai3CDpE-7Qimbb4OUE9Bt4Qz0deAE")

// Standard Null Addresses
const ZERO_ADDRESS: address = address("EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c") // TODO mainnet addr
const RAW_ZERO_ADDRESS: address = address("0:0000000000000000000000000000000000000000000000000000000000000000")

// ----------------------------------------------------------------------------
// 2. ECONOMIC, EMISSION & GRANT PARAMETERS
// ----------------------------------------------------------------------------

const AUTHORITY_THRESHOLD = 1000000 // 1 million votes = 100,000 accounts/voters
const MBRP_AMOUNT: int = grams("1000") // Member proposal amount
const LOTTERY_ENTRY_AMT: coins = grams("10")
const WEEKLY_CLAIM_AMOUNT: coins = grams("11111")
const VOTE_GRANT_RATE: coins = grams("10")
const POST_2YR_BASELINE_CLAIM: coins = grams("500")
const EMI_AMOUNT: coins = grams("2500")
const EMI_PENALTY_PERCENT: int = 5 // 5% penalty
const FOLLOW_MINT_AMOUNT: coins = grams("1000") // Minted to followee on following, burnt on unfollow
const PROPOSAL_FEE: coins = grams("1000")

// ----------------------------------------------------------------------------
// 3. TIMING, INTERVALS & DEADLINES
// ----------------------------------------------------------------------------

const ONE_DAY = 60 * 60 * 24
const ONE_MONTH = 60 * 60 * 24 * 30
const ONE_YEAR = 60 * 60 * 24 * 366

const ACTIVATION_WAIT: int = 86400 // 1 day
const CLAIM_INTERVAL: int = 604800 // 1 week
const ADMIN_HANDOVER_WAIT: int = 604800 // 1 week
const INVITE_WAIT: int = 14400 // 4 hours
const MAX_CLAIM_PERIOD: int = 63072000 // 2 years
const CLOSURE_WAIT: int = 86400 // 1 day
const DECAY_MONTH_SECONDS: int = 2592000 // 30 days
const DECAY_MONTHS_TOTAL: int = 480 // ~40 years
const EMI_GRACE_PERIOD: int = 86400 // 24 hours
const HOLDING_CHALLENGE_DURATION: uint32 = 72 * 3600 // 72 hours
const REVEAL_DEADLINE_SECONDS: int = 3600 // 1 hour to reveal lottery

// ----------------------------------------------------------------------------
// 4. DNS, AUCTIONS & FEES
// ----------------------------------------------------------------------------

const RESERVATION_PERIOD = 30 * ONE_DAY
const AUCTION_START_TIME = 1659171600 // GMT: Monday, 30 July 2022 г., 09:00:00
const AUCTION_START_DURATION = 60 * 60 * 24 * 7 // 7 days
const AUCTION_END_DURATION = 60 * 60 // 1 hour
const AUCTION_PROLONGATION = 60 * 60 // 1 hour

const BRO_FIXED_TON_FEE: coins = grams("1.0")
const BRO_TREASURY_TON_FEE: coins = grams("0.5")
const MIN_TONS_FOR_STORAGE: coins = grams("1")
const ONE_TON: coins = grams("1")

// ----------------------------------------------------------------------------
// 5. GAS RESERVES
// ----------------------------------------------------------------------------

const MIN_FOLLOW_GAS: coins = grams("0.08")

// ----------------------------------------------------------------------------
// 6. METADATA & TOKEN DEFAULTS (Scripts)
// ----------------------------------------------------------------------------

const JETTON_DEFAULT_NAME = "BroTherHOOD"
const JETTON_DEFAULT_SYMBOL = "HD"
const JETTON_DEFAULT_DESCRIPTION = "token with social minting + debt-free credit claims capabilities & supply is controlled by scarcity of humans & value is backed by paybacks by connections + lifetime emi & unique humans are ensured by peer reporting & genuine reports will be rewarded & lookout for your circle and rings to find potential valid reports"
const JETTON_DEFAULT_IMAGE = "https://raw.githubusercontent.com/ankitgahlyan/fossfiat/refs/heads/main/public/icon1.png"
const JETTON_IMAGE = "https://raw.githubusercontent.com/ankitgahlyan/fossfiat/refs/heads/main/public/tiger.svg"
const JETTON_DEFAULT_DECIMALS = "9"
const JETTON_DEFAULT_UPDATED_DESCRIPTION = "Sample jetton (metadata updated from acton-contracts scripts)"
const JETTON_DEFAULT_INITIAL_SUPPLY = "0"
const JETTON_DEFAULT_MINT_AMOUNT = "100000000000"
const JETTON_DEFAULT_TRANSFER_AMOUNT = "10000000000"
