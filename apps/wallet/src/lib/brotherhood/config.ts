export type Network = 'mainnet' | 'testnet' | 'tetra';

export const network: Network = 'testnet';

// ============================================================================
// 1. DEPLOYED / EMULATION ADDRESSES
// Replace these with actual testnet/mainnet addresses produced by deploy scripts.
// ============================================================================

/** FossFi Minter Address (from deploy-fi.tolk) */
export const FI_ADDRESS = 'kQByVk5DwR_q9O0QECxai3CDpE-7Qimbb4OUE9Bt4Qz0deAE';

/** Brotherhood .bro DNS Collection & Resolver (from deploy-bro.tolk) */
export const BRO_COLLECTION_RESOLVER =
  'kQDqjJ7tPgsD3_s0v_PLzyLKUe1pu-rtOQyk6Tf8NfdgOlli';

/** Alias for collection address in DNS features */
export const BRO_COLLECTION_ADDRESS = BRO_COLLECTION_RESOLVER;

/** Brotherhood Treasury address (from deploy-bro.tolk) */
export const BRO_TREASURY_ADDRESS =
  'kQCSUhA50ynSi1hxR9KrTLOCOk89iVGHG9wKS_1Agqi-OQF6';

/** DAO Proxy address (from deploy-fi.tolk) */
export const DAO_PROXY_ADDRESS =
  'kQCe-0dlNfCYRw_YWKjunlJmxIDfSRWxvHS6FI-eflPgY1jZ';
// 'kQBs0efjOXMJ_mTYkUqB16JynaYqMNpt2eTNzy79Ge0eLGk7';

/** Standard Null Address */
export const ZERO_ADDRESS =
  '0:0000000000000000000000000000000000000000000000000000000000000000';

// ============================================================================
// 2. TIMING & INTERVAL CONSTANTS (seconds)
// ============================================================================

export const ONE_DAY_SEC = 60 * 60 * 24;
export const ONE_MONTH_SEC = 60 * 60 * 24 * 30;
export const ONE_YEAR_SEC = 60 * 60 * 24 * 366;
export const RESERVATION_PERIOD_SEC = 10 * 60; // 10 minutes
export const CLAIM_INTERVAL_SEC = 604800; // 1 week
export const ACTIVATION_WAIT_SEC = 86400; // 1 day
export const INVITE_WAIT_SEC = 14400; // 4 hours
export const CLOSURE_WAIT_SEC = 86400; // 1 day
export const HOLDING_CHALLENGE_DURATION_SEC = 72 * 3600; // 72 hours

// ============================================================================
// 3. DNS AUCTION SCHEDULE (Mirrors contracts/src/common/constants.tolk)
// ============================================================================

export const AUCTION_START_TIME = 1659171600; // GMT: Monday, 30 July 2022
export const AUCTION_START_DURATION_SEC = 5 * 60; // 5 minutes
export const AUCTION_END_DURATION_SEC = 60; // 1 minute
export const AUCTION_PROLONGATION_SEC = 60; // 1 minute

// ============================================================================
// 4. PROTOCOL AMOUNTS & FEES
// ============================================================================

/** Fixed TON fee charged alongside FI token starting bid / outbid */
export const BRO_FIXED_TON_FEE = 1_000_000_000n; // 1.0 TON

/** Fixed TON fee sent to Treasury upon auction finalization */
export const BRO_TREASURY_TON_FEE = 500_000_000n; // 0.5 TON

/** Storage reserve for DNS Item */
export const MIN_TONS_FOR_STORAGE = 1_000_000_000n; // 1.0 TON

/** Weekly claim amount */
export const WEEKLY_CLAIM_AMOUNT = 11_111_000_000_000n; // 11,111 FI

/** Member proposal amount */
export const MBRP_AMOUNT = 1_000_000_000_000n; // 1,000 FI

/** Proposal fee */
export const PROPOSAL_FEE = 1_000_000_000_000n; // 1,000 FI

/** Lottery entry fee */
export const LOTTERY_ENTRY_AMT = 10_000_000_000n; // 10 FI

/** Monthly EMI amount */
export const EMI_AMOUNT = 2_500_000_000_000n; // 2,500 FI

/** Standard gas limits for DNS interactions */
export const DNS_GAS = {
  DEPLOY: 50_000_000n, // 0.05 TON
  BID_FORWARD: 1_000_000_000n, // 1.0 TON
  FINALIZE: 150_000_000n, // 0.15 TON
  RENEW: 200_000_000n, // 0.20 TON
  CHANGE_RECORD: 50_000_000n, // 0.05 TON
} as const;

/** Mirrors getBroFiStartingBid(charCount) in dns-utils.tolk */
export function broFiStartingBid(charCount: number): bigint {
  if (charCount <= 1) return 10_000_000_000_000n; // 10,000 FI
  if (charCount === 2) return 5_000_000_000_000n; // 5,000 FI
  if (charCount === 3) return 2_500_000_000_000n; // 2,500 FI
  if (charCount === 4) return 1_000_000_000_000n; // 1,000 FI
  if (charCount <= 8) return 500_000_000_000n; // 500 FI
  return 100_000_000_000n; // 100 FI
}

/** Mirrors getBroFiRenewalFee(charCount) in dns-utils.tolk — 10% of starting bid */
export function broFiRenewalFee(charCount: number): bigint {
  return broFiStartingBid(charCount) / 10n;
}

/** Human-readable FI tier label */
export function broFiTierLabel(charCount: number): string {
  if (charCount <= 1) return '10,000 FI';
  if (charCount === 2) return '5,000 FI';
  if (charCount === 3) return '2,500 FI';
  if (charCount === 4) return '1,000 FI';
  if (charCount <= 8) return '500 FI';
  return '100 FI';
}

// ============================================================================
// 5. ECOSYSTEM SWAP & CREDIT MULTIPLIER CONSTANTS
// ============================================================================

/** 3-decimal fixed-point scale for on-chain FiWalletStore.multiplier (1000 = 1.000x) */
export const MULTIPLIER_SCALE = 1000;

/** Forward payload opcode for multi-hop P_A -> FI -> P_B atomic swap */
export const SWAP_CREDIT_FORWARD_OP = 0x0000114f;

/** Placeholder fiat on-ramp URL for purchasing Reserve Token (Treasury Personal Token) */
export const RESERVE_TOKEN_FIAT_BUY_URL =
  'https://buy.brotherhood.network/reserve';

/** Personal UPI On-Ramp configuration for Reserve Token (INR Fiat Gateway) */
export const RESERVE_TOKEN_UPI_CONFIG = {
  upiId: 'ankitgahlyan44@okhdfcbank',
  payeeName: 'Brotherhood Network',
  defaultAmount: '100',
  minAmount: '10',
  currency: 'INR',
  notePrefix: 'dINR',
  deepLinkCapInr: 2000,
} as const;

export interface ReserveUpiLinks {
  upiId: string;
  payeeName: string;
  amountStr: string;
  minAmount: string;
  currency: string;
  notePrefix: string;
  note: string;
  txRef: string;
  isOverDeepLinkCap: boolean;
  /** Standard UPI deep link: upi://pay?... (BHIM & all UPI apps) */
  bhimOrOthersUrl: string;
  /** Google Pay deep link: tez://upi/pay?... */
  gPayUrl: string;
  /** PhonePe deep link: phonepe://pay?... */
  phonePeUrl: string;
  /** Paytm deep link: paytmmp://pay?... */
  paytmUrl: string;
  /** Standard NPCI QR payload (mode=02) for scanning from another device */
  qrUpiUrl: string;
}

/**
 * Builds NPCI-compliant UPI deep links (`upi://pay`, `tez://upi/pay`, etc.)
 * with embedded TON wallet identification in `tn` (Transaction Note, <= 80 chars)
 * and a unique `tr` (Transaction Reference ID, <= 35 alphanumeric chars).
 * When `amountInr` is omitted or empty, `&am=` is omitted so the UPI app/QR has no default amount.
 */
export function buildReserveUpiLinks(params: {
  amountInr?: string | number;
  walletAddress?: string | null;
  referenceSeed?: string;
}): ReserveUpiLinks {
  const { upiId, payeeName, minAmount, currency, notePrefix, deepLinkCapInr } =
    RESERVE_TOKEN_UPI_CONFIG;

  const rawNum =
    typeof params.amountInr === 'number'
      ? params.amountInr
      : parseFloat(String(params.amountInr ?? '').trim());
  const hasExplicitAmount = Number.isFinite(rawNum) && rawNum >= 0.01;

  // Format cleanly if explicit amount provided; otherwise empty (no default amount)
  const amountStr = hasExplicitAmount
    ? Number.isInteger(rawNum)
      ? String(rawNum)
      : rawNum.toFixed(2).replace(/\.?0+$/, '')
    : '';

  const cleanWallet = (params.walletAddress ?? '').trim();
  // NPCI spec: tn max 80 chars.
  const note = cleanWallet
    ? `${notePrefix} ${cleanWallet}`.slice(0, 80)
    : notePrefix;

  // NPCI spec: tr max 35 alphanumeric chars
  const addrSuffix = cleanWallet
    ? cleanWallet
        .replace(/[^a-zA-Z0-9]/g, '')
        .slice(-8)
        .toUpperCase()
    : 'ANON';
  const seed = (params.referenceSeed ?? Date.now().toString(36))
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(-10);
  const txRef = `BRO${addrSuffix}${seed}`.slice(0, 35);

  const amountParam = amountStr ? `&am=${encodeURIComponent(amountStr)}` : '';

  const baseQuery =
    `pa=${upiId}` +
    `&pn=${encodeURIComponent(payeeName)}` +
    amountParam +
    `&mam=${encodeURIComponent(minAmount)}` +
    `&cu=${encodeURIComponent(currency)}` +
    `&tr=${encodeURIComponent(txRef)}` +
    `&tn=${encodeURIComponent(note)}`;

  return {
    upiId,
    payeeName,
    amountStr,
    minAmount,
    currency,
    notePrefix,
    note,
    txRef,
    isOverDeepLinkCap: hasExplicitAmount && rawNum > deepLinkCapInr,
    bhimOrOthersUrl: `upi://pay?${baseQuery}`,
    gPayUrl: `tez://upi/pay?${baseQuery}`,
    phonePeUrl: `phonepe://pay?${baseQuery}`,
    paytmUrl: `paytmmp://pay?${baseQuery}`,
    qrUpiUrl: `upi://pay?${baseQuery}&mode=02`,
  };
}

/**
 * Normalizes on-chain uint16 multiplier (scaled by 1000, where 1000 = 1.000x)
 * into a human-readable float (e.g. 1000 -> 1, 950 -> 0.95, 1250 -> 1.25).
 */
export function normalizeOnchainMultiplier(
  raw: bigint | number | undefined | null,
): number {
  if (raw === undefined || raw === null) return 1;
  const num = Number(raw);
  if (!Number.isFinite(num) || num <= 0) return 1;
  return num / MULTIPLIER_SCALE;
}

/**
 * Encodes a human-readable decimal multiplier (0.001 to 65.535) into the
 * on-chain uint16 integer scaled by MULTIPLIER_SCALE (1000).
 */
export function encodeOnchainMultiplier(humanMultiplier: number): bigint {
  return BigInt(Math.round(humanMultiplier * MULTIPLIER_SCALE));
}
