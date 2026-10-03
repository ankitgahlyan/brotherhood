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
const DEPLOYED_BRO_COLLECTION_RESOLVER: address = address("kQDqjJ7tPgsD3_s0v_PLzyLKUe1pu-rtOQyk6Tf8NfdgOlli")
const DEPLOYED_BRO_TREASURY_ADDRESS: address = address("kQCSUhA50ynSi1hxR9KrTLOCOk89iVGHG9wKS_1Agqi-OQF6")

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
const MULTIPLIER_SCALE: int = 1000 // 3-decimal fixed-point scale (1000 = 1.000x)
const SWAP_CREDIT_FORWARD_OP: int = 0x0000114f // Inline forwardPayload opcode for atomic Payback -> BuyCredit swap

// ----------------------------------------------------------------------------
// 3. TIMING, INTERVALS & DEADLINES
// ----------------------------------------------------------------------------

const ONE_MINUTE = 60
const ONE_HOUR = 60 * ONE_MINUTE
const ONE_DAY = 24 * ONE_HOUR
const ONE_WEEK = 7 * ONE_DAY
const ONE_MONTH = 30 * ONE_DAY
const ONE_YEAR = 366 * ONE_DAY

const ACTIVATION_WAIT: int = ONE_DAY // 1 day
const CLAIM_INTERVAL: int = ONE_WEEK // 1 week
const ADMIN_HANDOVER_WAIT: int = ONE_WEEK // 1 week
const INVITE_WAIT: int = 4 * ONE_HOUR // 4 hours
const MAX_CLAIM_PERIOD: int = 730 * ONE_DAY // 2 years
const CLOSURE_WAIT: int = ONE_DAY // 1 day
const DECAY_MONTH_SECONDS: int = ONE_MONTH // 30 days
const DECAY_MONTHS_TOTAL: int = 480 // ~40 years
const EMI_GRACE_PERIOD: int = ONE_DAY // 24 hours
const HOLDING_CHALLENGE_DURATION: uint32 = 3 * ONE_DAY // 72 hours
const REVEAL_DEADLINE_SECONDS: int = ONE_HOUR // 1 hour to reveal lottery

// ----------------------------------------------------------------------------
// 4. DNS, AUCTIONS & FEES
// ----------------------------------------------------------------------------

const RESERVATION_PERIOD = 10 * ONE_MINUTE // 10 minutes
const AUCTION_START_TIME = 1659171600 // GMT: Monday, 30 July 2022 г., 09:00:00
const AUCTION_START_DURATION = 5 * ONE_MINUTE // 5 minutes
const AUCTION_END_DURATION = ONE_MINUTE // 1 minute
const AUCTION_PROLONGATION = ONE_MINUTE // 1 minute

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
const JETTON_DEFAULT_IMAGE = "https://raw.githubusercontent.com/ankitgahlyan/brotherhood/refs/heads/main/public/branding/brotherhood-token-256.png"
// const JETTON_DEFAULT_IMAGE = "https://raw.githubusercontent.com/ankitgahlyan/fossfiat/refs/heads/main/public/icon1.png"
const JETTON_IMAGE = "https://raw.githubusercontent.com/ankitgahlyan/fossfiat/refs/heads/main/public/tiger.svg"
const JETTON_DEFAULT_DECIMALS = "9"
const JETTON_DEFAULT_UPDATED_DESCRIPTION = "Sample jetton (metadata updated from acton-contracts scripts)"
const JETTON_DEFAULT_INITIAL_SUPPLY = "0"
const JETTON_DEFAULT_MINT_AMOUNT = "100000000000"
const JETTON_DEFAULT_TRANSFER_AMOUNT = "10000000000"
