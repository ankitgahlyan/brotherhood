/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  Base64ToHex,
  parseTraceDag,
  type Action,
  type Event,
  type TraceDagAnalysis,
} from '@ton/walletkit';

import { formatLargeValue, formatUnits, sameAddress } from '@/core/utils';
import { getOpcodeInfo } from '@/core/utils/payload';
import { getExplorerTxUrl, type ExplorerChoice } from '@/core/explorer';
import type { NetworkType } from '@demo/wallet-core';

/** Network accepted by the explorer-url builder (mainnet/testnet/tetra). */
type ExplorerNetwork = NetworkType;

/** Status badge shown on the transaction icon. */
export type TransactionRowStatus = 'success' | 'loading' | 'failed';

/** Primary classification category for local history filtering. */
export type TransactionCategory = 'contract' | 'ton' | 'jetton';

/** Normalized view-model consumed by {@link TransactionRow} and persisted in bro-store. */
export interface TransactionRowModel {
  /** Unique React key. */
  id: string;
  /** Canonical event ID for store deduplication. */
  eventId?: string;
  /** Logical time for deterministic ordering. */
  lt?: number | string;
  /** Raw transaction hash or trace ID for explorer lookups. */
  txHash?: string;
  /** Normalized hex external hash for pending transaction deduplication. */
  traceExternalHash?: string;
  /** Active blockchain network (e.g. testnet, mainnet). */
  network?: ExplorerNetwork;
  /** Default explorer transaction URL. Undefined for not-yet-on-chain pending transactions. */
  explorerUrl?: string;
  /** Primary label: Exact Tolk Message / Action Name (e.g. "ActInvite", "ActVote", "BuyCredit", "AskToTransfer"). */
  title: string;
  /** Secondary label: transfer summary / trace id / counterparty label. */
  subtitleId: string;
  /** Counterparty address (recipient for outgoing, sender for incoming, or contract address). */
  counterpartyAddress?: string;
  /** Explicit sender address. */
  senderAddress?: string;
  /** Explicit recipient address. */
  recipientAddress?: string;
  /** Attached comment/memo if any. */
  comment?: string;
  /** Estimated or actual network fee. */
  fee?: string;
  /** Action / operation raw type (e.g. 'TonTransfer', 'JettonTransfer', 'SmartContractExec', etc.). */
  rawType?: string;
  /** Clean amount without direction sign, e.g. "5 GRAM". */
  cleanAmount?: string;
  /** Extracted symbol (e.g. "GRAM", "USDT", "TON"). */
  symbol?: string;
  /** Unix timestamp in seconds. */
  timestamp: number;
  /** Decoded failure reason if transaction failed. */
  failureReason?: string;
  /** Signed crypto amount, e.g. "+5 GRAM" / "-1 USDT". */
  amount: string;
  /** Outgoing transfers are red, incoming are green. */
  isOutgoing: boolean;
  status: TransactionRowStatus;
  /** Formatted date+time, e.g. "Sep 10, 14:30". */
  date: string;
  /** Exact Tolk struct message name (e.g. "ActInvite", "BuyCredit", "AskToTransfer") when identified. */
  tolkStructName?: string;
  /** Primary classification category ('contract' | 'ton' | 'jetton'). */
  category?: TransactionCategory;
  /** True when classified as a contract call (matches Contract Calls filter). */
  isContractCall?: boolean;
  /** Normalized uppercase token symbols transferred in this trace (e.g. ['FI'], ['TON']). */
  tokens?: string[];
  /** Pre-parsed multi-hop execution route DAG for 0-network-call modal display. */
  traceDag?: TraceDagAnalysis;
}

/** Minimal shape of a streaming pending transaction (structural — avoids a cross-package type import). */
interface PendingLike {
  traceId: string;
  externalHash?: string;
  finality?: 'pending' | 'confirmed' | 'finalized' | 'invalidated';
  action?: Action;
  preview?: {
    type: 'send' | 'receive' | 'contract';
    amount: string;
    recipient?: string;
  };
}

const GRAM_DECIMALS = 9;
/** Cap on fractional digits shown for amounts (matches the appkit widget formatter). */
const AMOUNT_DECIMALS = 4;

/** Common TVM and contract exit codes. */
export const TVM_EXIT_CODES: Record<number, string> = {
  // Standard TVM Exceptions
  0: 'Success',
  1: 'Alternative Success',
  2: 'Stack Underflow',
  3: 'Stack Overflow',
  4: 'Integer Overflow',
  5: 'Integer Out of Range',
  6: 'Invalid Opcode',
  7: 'Type Check Error',
  8: 'Cell Overflow',
  9: 'Cell Underflow',
  10: 'Dictionary Error',
  11: 'Unknown Error',
  13: 'Out of Gas',
  // Common Contract & DNS Errors
  47: 'Balance Error',
  48: 'Not Enough Gas',
  49: 'Invalid Message',
  70: 'Invalid Subdomain Bits',
  72: 'Invalid Op',
  73: 'Not Owner',
  74: 'Not Valid Wallet',
  199: 'Auction Not Started',
  200: 'Domain Too Short',
  201: 'Domain Too Long',
  202: 'Invalid Domain Format',
  203: 'Domain Has Invalid Characters',
  204: 'Bid Below Minimum Price',
  205: 'Domain Is Blacklisted',
  250: 'Max Connections',
  333: 'Wrong Workchain',
  401: 'Not Domain Owner',
  402: 'Not Enough Balance',
  404: 'Not Found',
  405: 'Not From Collection',
  406: 'Only Owner Can Fill Up After Auction',
  407: 'Bid Too Low',
  410: 'Only Owner Can Edit Content',
  411: 'Only Owner Can Change DNS',
  412: 'Invalid Content Tag',
  413: 'Governance Requires No Auction',
  414: 'DNS Balance Release Forbidden',
  415: 'Config Entry Not Found',
  416: 'Invalid Config Operation',
  417: 'Not Authorized Treasury',
  418: 'Reservation Period Active',
  420: 'No Active Auction',
  421: 'Auction Not Finished',
  422: 'Auction Already Finished',
  423: 'No Auction Winner',
  424: 'Incorrect DNS Sender',
  // Brotherhood Specific Errors
  700: 'Incorrect Sender',
  701: 'Account Terminated',
  702: 'Account Inactive',
  703: 'Insufficient Gas Sent',
  704: 'Reserved Internal',
  705: 'Upgrade Wallet',
  706: 'No Pending Request',
  707: 'Cannot Unfollow Reported',
  708: 'Incorrect Receiver',
  709: 'Insufficient Balance',
  710: 'Already Reported',
  711: 'Account Not Reported',
  719: 'Connection Exists',
  720: 'Not Friend',
  721: 'Not Invitor',
  723: 'Already Invited',
  724: 'Unauthorized Burn',
  730: 'Mint Closed',
  731: 'No Votes Available',
  732: 'Not Voted Yet',
  733: 'Upgrade Required',
  734: 'Version Mismatch',
  735: 'Wait More',
  736: 'Not Close Friend',
  737: 'Already Vouched',
  738: 'Provide Coordinates',
  739: 'Invalid Forward Payload',
  740: 'Invite First',
  741: 'Already Reported For Other Reason',
  750: 'Proposal Already Active / Already Following',
  751: 'Proposal Not Found / Not Following',
  752: 'Proposal Pending Accounts / Invalid Follow Action',
  753: 'Proposal Already Executed',
  754: 'Proposal Expired',
  755: 'Already Voted',
  756: 'Proposal Fee Insufficient',
  757: 'Duplicate Vote',
  758: 'Invalid DAO Voter',
  759: 'Country Mismatch',
  760: 'Credit Need Exceeded',
  761: 'Account In Debt',
  762: 'Has Active Votes',
  763: 'Credit Not Matured',
  764: 'Personal Jetton Not Registered',
  765: 'Deferred Payment Disabled',
  766: 'Wallet Not Onboarded',
  767: 'Pocket Money Locked',
  65535: 'Invalid Message Body',
};

/** Returns contract context badge string based on opcode number */
export function getContractContextBadge(opcode?: number): string | undefined {
  if (!opcode) return undefined;
  // Holding / Deferred Payment
  if (
    opcode === 0x716a4d21 ||
    opcode === 0x38b4c81a ||
    opcode === 0x24d8b9e1 ||
    opcode === 0x19a4f210 ||
    opcode === 0x49f2b801 ||
    opcode === 0x6a1bc924 ||
    opcode === 0x7c49e102 ||
    opcode === 0x531b70a2 ||
    opcode === 0x1f84b29c ||
    opcode === 0x576f30a1
  ) {
    return 'Holding';
  }
  // DNS & .bro Domains
  if (
    opcode === 0x370fec51 ||
    opcode === 0x557cea20 ||
    opcode === 0x1a0b9d51 ||
    opcode === 0x4eb1f0f9 ||
    opcode === 0x44beae41 ||
    opcode === 0x4ed14b65 ||
    opcode === 0x59a3c821 ||
    opcode === 0x2c159bf4 ||
    opcode === 0x646e7375 ||
    opcode === 0x646e7364 ||
    opcode === 0x646e7378 ||
    opcode === 0x62696430 ||
    opcode === 0x62696431 ||
    opcode === 0x6f757462 ||
    opcode === 0x66696e61 ||
    opcode === 0x6275726e ||
    opcode === 0x72656e30 ||
    opcode === 0x72656e65
  ) {
    return 'DNS / .bro';
  }
  // Brotherhood Member / FiWallet
  if (
    (opcode >= 0x00001051 && opcode <= 0x0000105c) ||
    (opcode >= 0x000010a1 && opcode <= 0x000010a8) ||
    (opcode >= 0x000010f1 && opcode <= 0x000010f7) ||
    (opcode >= 0x00001141 && opcode <= 0x00001150)
  ) {
    return 'Brotherhood Member';
  }
  // DAO / Poll
  if (
    (opcode >= 0x0000100c && opcode <= 0x00001011) ||
    (opcode >= 0x000010fa && opcode <= 0x000010ff)
  ) {
    return 'DAO';
  }
  // Community Minter
  if (opcode >= 0x00001001 && opcode <= 0x0000100b) {
    return 'FossFi Minter';
  }
  // Lottery
  if (opcode >= 0x00001191 && opcode <= 0x0000119b) {
    return 'Lottery';
  }
  // Followers
  if (opcode >= 0x00001200 && opcode <= 0x00001209) {
    return 'Followers';
  }
  // Personal Token
  if (opcode === 0x1674b0a0 || opcode === 0x00001149) {
    return 'Personal Token';
  }
  return undefined;
}

export function decodeExitCode(code: number): string {
  const name = TVM_EXIT_CODES[code];
  return name ? `${name} (exit ${code})` : `Exit ${code}`;
}

/** Extracts the failure exit code from transaction compute phase if available. */
function extractFailureReason(event: Event): string | undefined {
  if (event.failureReason) return event.failureReason;
  if (event.exitCode !== undefined && event.exitCode !== 0) {
    return decodeExitCode(event.exitCode);
  }
  if (!event.transactions) return undefined;
  for (const tx of Object.values(event.transactions)) {
    const computePh = tx.description?.compute_ph;
    if (computePh) {
      if (
        !computePh.success &&
        computePh.exit_code !== undefined &&
        computePh.exit_code !== 0
      ) {
        return decodeExitCode(computePh.exit_code);
      }
    }
    const actionPh = tx.description?.action;
    if (actionPh && !actionPh.success && actionPh.result_code !== 0) {
      return `Action Failed (code ${actionPh.result_code})`;
    }
  }
  return undefined;
}

/** Raw amount (nanoton / jetton base units) -> compact human string, e.g. "1M" / "1,234.5". */
const formatAmount = (raw: bigint | string, decimals: number): string =>
  formatLargeValue(formatUnits(raw, decimals), AMOUNT_DECIMALS);

const truncateMiddle = (value: string): string => {
  const v = String(value);
  return v.length > 12 ? `${v.slice(0, 6)}…${v.slice(-4)}` : v;
};

const formatTxDate = (timestampSeconds: number): string =>
  new Date(timestampSeconds * 1000).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

const isOutgoingFromAction = (action: Action, myAddress: string): boolean => {
  if (action.type === 'TonTransfer' && 'TonTransfer' in action) {
    return sameAddress(action.TonTransfer?.sender?.address, myAddress);
  }
  if (action.type === 'JettonTransfer' && 'JettonTransfer' in action) {
    return sameAddress(action.JettonTransfer?.sender?.address, myAddress);
  }
  if (action.type === 'NftItemTransfer' && 'NftItemTransfer' in action) {
    return sameAddress(action.NftItemTransfer?.sender?.address, myAddress);
  }
  const accounts = action.simplePreview?.accounts;
  return (
    accounts != null &&
    accounts.length > 0 &&
    sameAddress(accounts[0].address, myAddress)
  );
};

/** Extracts counterparty address from Action based on direction. */
const getCounterpartyAddress = (
  action: Action,
  isOutgoing: boolean,
  myAddress: string,
): string | undefined => {
  if (action.type === 'TonTransfer' && 'TonTransfer' in action) {
    const target = isOutgoing
      ? action.TonTransfer?.recipient?.address
      : action.TonTransfer?.sender?.address;
    if (target) return target;
  }
  if (action.type === 'JettonTransfer' && 'JettonTransfer' in action) {
    const target = isOutgoing
      ? action.JettonTransfer?.recipient?.address
      : action.JettonTransfer?.sender?.address;
    if (target) return target;
  }
  if (action.type === 'NftItemTransfer' && 'NftItemTransfer' in action) {
    const target = isOutgoing
      ? action.NftItemTransfer?.recipient?.address
      : action.NftItemTransfer?.sender?.address;
    if (target) return target;
  }
  if (action.type === 'SmartContractExec' && 'SmartContractExec' in action) {
    const contract = action.SmartContractExec?.contract?.address;
    if (contract) return contract;
  }
  const accounts = action.simplePreview?.accounts;
  if (accounts && accounts.length > 1) {
    const other = accounts.find((acc) => !sameAddress(acc.address, myAddress));
    if (other?.address) return other.address;
  }
  return accounts?.[0]?.address;
};

const getSenderAddress = (
  action: Action,
  isOutgoing: boolean,
  myAddress: string,
): string | undefined => {
  if (action.type === 'TonTransfer' && 'TonTransfer' in action) {
    return action.TonTransfer?.sender?.address;
  }
  if (action.type === 'JettonTransfer' && 'JettonTransfer' in action) {
    return action.JettonTransfer?.sender?.address;
  }
  if (action.type === 'NftItemTransfer' && 'NftItemTransfer' in action) {
    return action.NftItemTransfer?.sender?.address;
  }
  if (isOutgoing) return myAddress;
  return getCounterpartyAddress(action, isOutgoing, myAddress);
};

const getRecipientAddress = (
  action: Action,
  isOutgoing: boolean,
  myAddress: string,
): string | undefined => {
  if (action.type === 'TonTransfer' && 'TonTransfer' in action) {
    return action.TonTransfer?.recipient?.address;
  }
  if (action.type === 'JettonTransfer' && 'JettonTransfer' in action) {
    return action.JettonTransfer?.recipient?.address;
  }
  if (action.type === 'NftItemTransfer' && 'NftItemTransfer' in action) {
    return action.NftItemTransfer?.recipient?.address;
  }
  if (!isOutgoing) return myAddress;
  return getCounterpartyAddress(action, isOutgoing, myAddress);
};

const getCommentFromAction = (action?: Action): string | undefined => {
  if (!action) return undefined;
  if (action.type === 'TonTransfer' && 'TonTransfer' in action) {
    return action.TonTransfer?.comment;
  }
  if (action.type === 'JettonTransfer' && 'JettonTransfer' in action) {
    return action.JettonTransfer?.comment;
  }
  return undefined;
};

const extractFee = (event: Event): string | undefined => {
  if (!event.transactions) return undefined;
  let totalFee = 0n;
  for (const tx of Object.values(event.transactions)) {
    if (tx.total_fees) {
      totalFee += BigInt(tx.total_fees);
    }
  }
  return totalFee > 0n
    ? `${formatAmount(totalFee, GRAM_DECIMALS)} GRAM`
    : undefined;
};

/** Action name + transfer detail + value (no sign), derived from the typed action fields. */
/** Action name + transfer detail + value (no sign), derived from the typed action fields. */
const describeAction = (
  action: Action,
  isOutgoing: boolean,
): {
  actionName: string;
  transferDetail: string;
  value: string;
  tolkStructName?: string;
} => {
  const label = isOutgoing ? 'Sent' : 'Received';

  if (action.type === 'TonTransfer' && 'TonTransfer' in action) {
    const value = `${formatAmount(action.TonTransfer.amount, GRAM_DECIMALS)} GRAM`;
    const comment = action.TonTransfer.comment?.trim();
    return {
      actionName: comment
        ? `Comment: “${comment}”`
        : isOutgoing
          ? 'Sent TON'
          : 'Received TON',
      transferDetail: `${label} ${value}`,
      value,
      tolkStructName: undefined,
    };
  }

  if (action.type === 'JettonTransfer' && 'JettonTransfer' in action) {
    const { amount, jetton, comment } = action.JettonTransfer;
    const value =
      `${formatAmount(amount, jetton.decimals)} ${jetton.symbol}`.trim();
    const actionTitle = isOutgoing
      ? `Send ${jetton.symbol || 'Token'}`
      : `Received ${jetton.symbol || 'Token'}`;
    const commentSuffix = comment ? ` (“${comment}”)` : '';
    return {
      actionName: actionTitle,
      transferDetail: `${label} ${value}${commentSuffix}`,
      value,
      tolkStructName: 'AskToTransfer',
    };
  }

  if (action.type === 'SmartContractExec' && 'SmartContractExec' in action) {
    const op = action.SmartContractExec.operation;
    const payload =
      (action.SmartContractExec as any).payload || (action as any).payload;
    const info = getOpcodeInfo(op, payload);
    const badge = getContractContextBadge(info.opcode);
    const val =
      BigInt(action.SmartContractExec.tonAttached || 0) > 0n
        ? `${formatAmount(action.SmartContractExec.tonAttached, GRAM_DECIMALS)} GRAM`
        : '';
    const isZeroOp =
      info.opcode === 0 ||
      op === '0x00000000' ||
      op === '0x0' ||
      op === '0' ||
      info.title === 'TonTransfer';
    const actionTitle = isZeroOp
      ? val
        ? isOutgoing
          ? 'Sent TON'
          : 'Received TON'
        : 'TON Transfer'
      : info.title;
    const structDetail = info.structName ? `[${info.structName}] ` : '';
    const detail = val
      ? `${label} ${val}`
      : action.simplePreview?.description || actionTitle;
    return {
      actionName: actionTitle,
      transferDetail: badge
        ? `[${badge}] ${structDetail}${detail}`
        : `${structDetail}${detail}`,
      value: val,
      tolkStructName: info.structName,
    };
  }

  // Generic contract execution fallback
  if (
    action.simplePreview?.name?.toLowerCase().includes('contract') ||
    action.simplePreview?.name?.toLowerCase().includes('call') ||
    (action as any).payload
  ) {
    const info = getOpcodeInfo(
      (action as any).operation,
      (action as any).payload,
    );
    if (info.isKnown) {
      const badge = getContractContextBadge(info.opcode);
      const structDetail = info.structName ? `[${info.structName}] ` : '';
      const detail = action.simplePreview?.description || info.title;
      return {
        actionName: info.title,
        transferDetail: badge
          ? `[${badge}] ${structDetail}${detail}`
          : `${structDetail}${detail}`,
        value: action.simplePreview?.value || '',
        tolkStructName: info.structName,
      };
    }
  }

  if (action.type === 'ContractDeploy') {
    return {
      actionName: 'Contract Deploy',
      transferDetail: action.simplePreview.description || 'Deploy Contract',
      value: action.simplePreview.value || '',
      tolkStructName: 'ContractDeploy',
    };
  }

  if (action.type === 'JettonSwap') {
    return {
      actionName: 'Jetton Swap',
      transferDetail: action.simplePreview.description || 'Swap',
      value: action.simplePreview.value || '',
      tolkStructName: 'JettonSwap',
    };
  }

  // Other action types (swap, nft, contract): map to exact type name or fall back.
  return {
    actionName:
      action.type ||
      action.simplePreview.name ||
      action.simplePreview.description ||
      'Transaction',
    transferDetail: action.simplePreview.description,
    value: action.simplePreview.value,
    tolkStructName: undefined,
  };
};

/** Action priority rank: specialized contract/token operations take precedence over raw TonTransfer */
const getActionPriority = (type?: string): number => {
  switch (type) {
    case 'SmartContractExec':
      return 5;
    case 'JettonTransfer':
      return 4;
    case 'JettonSwap':
      return 3;
    case 'NftItemTransfer':
      return 3;
    case 'ContractDeploy':
      return 2;
    case 'TonTransfer':
      return 1;
    default:
      return 0;
  }
};

/** Picks the most relevant action that involves the current wallet, prioritizing contract operations over generic TON transfers. */
const selectRelevantAction = (actions: Action[], myAddress: string): Action => {
  const withMe = actions.filter((a) =>
    a.simplePreview?.accounts?.some((acc) =>
      sameAddress(acc.address, myAddress),
    ),
  );
  const candidates = withMe.length > 0 ? withMe : actions;
  if (candidates.length <= 1) return candidates[0];

  return [...candidates].sort((a, b) => {
    // 1. Higher action type priority (SmartContractExec > JettonTransfer > TonTransfer)
    const priorityDiff = getActionPriority(b.type) - getActionPriority(a.type);
    if (priorityDiff !== 0) return priorityDiff;

    // 2. Sender actions preferred over recipient actions
    const aSender = isOutgoingFromAction(a, myAddress) ? 1 : 0;
    const bSender = isOutgoingFromAction(b, myAddress) ? 1 : 0;
    return bSender - aSender;
  })[0];
};

const signedAmount = (value: string, isOutgoing: boolean): string =>
  value ? `${isOutgoing ? '-' : '+'}${value}` : '';

const FI_STRUCT_NAMES = new Set([
  'ActClaimWeeklyGrant',
  'ActPayEmi',
  'SetPocketMoney',
  'SpendPocketMoney',
  'AskGoldCoinsTransfer',
  'InternalGoldCoinsTransfer',
  'BuyCredit',
  'Payback',
  'PaybackShortfall',
  'SetLoanRequirement',
  'RepayDebt',
  'CreditProxySetNeed',
  'CreditProxyRemoveNeed',
  'AddLocationCreditEntry',
  'RemoveLocationCreditEntry',
  'TriggerDefaultEmi',
  'TriggerDecay',
  'MintNewJettons',
  'ActSubmitProposal',
  'DnsBidRequest',
  'BidBroDomain',
  'DnsOutbidNotification',
  'DnsAuctionFinalized',
  'DnsRenewRequest',
  'RenewBroDomain',
]);

/**
 * Classifies a transaction row into primary category ('contract' | 'ton' | 'jetton'),
 * contract-call flag, and involved token symbols for local filtering.
 */
export function classifyTransactionRow(params: {
  rawType?: string;
  tolkStructName?: string;
  symbol?: string;
  actions?: Action[];
}): {
  category: TransactionCategory;
  isContractCall: boolean;
  tokens: string[];
} {
  const { rawType, tolkStructName, symbol, actions } = params;

  const isContractStruct = Boolean(
    tolkStructName && tolkStructName !== 'AskToTransfer',
  );
  const isContractRawType =
    rawType === 'SmartContractExec' ||
    rawType === 'ContractDeploy' ||
    rawType === 'JettonSwap';

  const isContractCall = isContractStruct || isContractRawType;

  const normalizedSymbol = symbol?.trim().toUpperCase();
  const isJettonSymbol = Boolean(
    normalizedSymbol &&
    normalizedSymbol !== 'TON' &&
    normalizedSymbol !== 'GRAM',
  );

  let category: TransactionCategory = 'ton';
  if (isContractCall) {
    category = 'contract';
  } else if (
    rawType === 'JettonTransfer' ||
    tolkStructName === 'AskToTransfer' ||
    isJettonSymbol
  ) {
    category = 'jetton';
  }

  const tokenSet = new Set<string>();
  if (Array.isArray(actions)) {
    for (const action of actions) {
      if (action?.type === 'JettonTransfer' && 'JettonTransfer' in action) {
        const jettonSym = action.JettonTransfer?.jetton?.symbol
          ?.trim()
          .toUpperCase();
        if (jettonSym) tokenSet.add(jettonSym);
      }
    }
  }
  if (isJettonSymbol && normalizedSymbol) {
    tokenSet.add(normalizedSymbol);
  }
  if (tolkStructName && FI_STRUCT_NAMES.has(tolkStructName)) {
    tokenSet.add('FI');
  }
  if (category === 'ton') {
    tokenSet.add('TON');
  }

  return {
    category,
    isContractCall,
    tokens: Array.from(tokenSet),
  };
}

function buildTraceDagFromEvent(
  event: Event,
  myAddress: string,
  fallback: {
    id: string;
    txHash?: string;
    isSuccess: boolean;
    isOutgoing: boolean;
    senderAddress?: string;
    recipientAddress?: string;
    counterpartyAddress?: string;
    comment?: string;
  },
): TraceDagAnalysis {
  if (
    event.transactions &&
    typeof event.transactions === 'object' &&
    Object.keys(event.transactions).length > 0
  ) {
    try {
      const traceItem = {
        trace_id: String(event.eventId),
        trace: event.trace,
        transactions: event.transactions,
        transactions_order: Object.keys(event.transactions),
        is_incomplete: Boolean(event.inProgress),
        start_utime: event.timestamp,
        start_lt: String(event.lt || 0),
        end_utime: event.timestamp,
        end_lt: String(event.lt || 0),
        external_hash: event.traceExternalHash || '',
        mc_seqno_start: '0',
        mc_seqno_end: '0',
        actions: event.actions as any,
        trace_info: {
          classification_state: 'parsed',
          messages: 0,
          pending_messages: 0,
          trace_state: 'complete',
          transactions: Object.keys(event.transactions).length,
        },
        warning: '',
      };
      const parsed = parseTraceDag(traceItem as any, myAddress);
      if (parsed && parsed.hops && parsed.hops.length > 0) {
        return parsed;
      }
    } catch {
      // Fall back to synthetic 1-hop DAG
    }
  }

  return {
    traceId: String(event.eventId || fallback.txHash || fallback.id),
    isSuccess: fallback.isSuccess,
    totalNetworkFee: 0n,
    totalSent: fallback.isOutgoing ? 1n : 0n,
    totalReceived: !fallback.isOutgoing ? 1n : 0n,
    hops: [
      {
        hash: fallback.txHash || fallback.id,
        source: fallback.senderAddress,
        destination:
          fallback.recipientAddress ||
          fallback.counterpartyAddress ||
          myAddress,
        fee: 0n,
        comment: fallback.comment,
        isSuccess: fallback.isSuccess,
        depth: 0,
      },
    ],
  };
}

/** Type guard checking if an item in eventsByAddress is already a transformed TransactionRowModel. */
export function isTransformedRow(item: unknown): item is TransactionRowModel {
  return Boolean(
    item &&
    typeof item === 'object' &&
    'id' in item &&
    'title' in item &&
    'subtitleId' in item &&
    'status' in item &&
    !('actions' in item),
  );
}

/**
 * Maps a historical event (or returns an already-transformed row) into a classified TransactionRowModel.
 */
export const mapEventToRow = (
  eventOrRow: Event | TransactionRowModel,
  myAddress: string,
  network: ExplorerNetwork,
  explorer: ExplorerChoice = 'tonscan',
  associatedAddresses?: string[],
): TransactionRowModel | null => {
  if (!eventOrRow) return null;

  if (isTransformedRow(eventOrRow)) {
    const hash = eventOrRow.txHash || eventOrRow.id;
    const explorerUrl = hash
      ? getExplorerTxUrl(network, hash, explorer)
      : eventOrRow.explorerUrl;
    if (
      eventOrRow.category &&
      eventOrRow.tokens &&
      eventOrRow.explorerUrl === explorerUrl &&
      eventOrRow.network === network
    ) {
      return eventOrRow;
    }
    const classification =
      eventOrRow.category && eventOrRow.tokens
        ? {
            category: eventOrRow.category,
            isContractCall: Boolean(eventOrRow.isContractCall),
            tokens: eventOrRow.tokens,
          }
        : classifyTransactionRow({
            rawType: eventOrRow.rawType,
            tolkStructName: eventOrRow.tolkStructName,
            symbol: eventOrRow.symbol,
          });
    return {
      ...eventOrRow,
      network,
      explorerUrl,
      ...classification,
    };
  }

  const event = eventOrRow as Event;
  const eventId = String(event.eventId);
  const traceExtHex = event.traceExternalHash
    ? (() => {
        try {
          return Base64ToHex(event.traceExternalHash);
        } catch {
          return String(event.traceExternalHash);
        }
      })()
    : undefined;
  const hash = eventId || traceExtHex || '';
  const fee = extractFee(event);

  const candidateMyAddresses = [
    myAddress,
    ...(associatedAddresses || []),
  ].filter(Boolean);

  if (!event.actions || event.actions.length === 0) {
    let isOutgoing = false;
    let value = '';
    let counterparty: string | undefined;
    let actionName = 'Transaction';
    let tolkStructName: string | undefined;
    let isFailed = false;
    let matchedPerspective = myAddress;

    if (event.transactions && typeof event.transactions === 'object') {
      const txList = Object.values(event.transactions) as any[];
      for (const candidateAddr of candidateMyAddresses) {
        const matchedTx = txList.find((tx) =>
          sameAddress(tx?.account, candidateAddr),
        );
        if (matchedTx) {
          matchedPerspective = candidateAddr;
          if (
            matchedTx.description?.compute_ph?.success === false ||
            matchedTx.description?.action?.success === false
          ) {
            isFailed = true;
          }
          if (matchedTx.in_msg) {
            const inBody =
              matchedTx.in_msg.body ||
              matchedTx.in_msg.message_content?.body ||
              matchedTx.in_msg.msg_data;
            if (inBody || matchedTx.in_msg.opcode) {
              const info = getOpcodeInfo(matchedTx.in_msg.opcode, inBody);
              if (info.isKnown) {
                actionName = info.title;
                tolkStructName = info.structName;
              }
            }
            if (matchedTx.in_msg.source) {
              counterparty = matchedTx.in_msg.source;
              isOutgoing = false;
              if (actionName === 'Transaction') actionName = 'Received TON';
            }
            if (matchedTx.in_msg.value && BigInt(matchedTx.in_msg.value) > 0n) {
              value = `${formatAmount(matchedTx.in_msg.value, GRAM_DECIMALS)} GRAM`;
            }
          }
          if (matchedTx.out_msgs && matchedTx.out_msgs.length > 0) {
            const out = matchedTx.out_msgs[0];
            if (out?.destination) {
              counterparty = out.destination;
              isOutgoing = true;
              actionName = 'Sent TON';
            }
            const outBody =
              out?.body || out?.message_content?.body || out?.msg_data;
            if (outBody || out?.opcode) {
              const info = getOpcodeInfo(out.opcode, outBody);
              if (info.isKnown && info.opcode !== 0) {
                actionName = info.title;
                tolkStructName = info.structName;
              }
            }
            if (out?.value && BigInt(out.value) > 0n) {
              value = `${formatAmount(out.value, GRAM_DECIMALS)} GRAM`;
            }
          }
          break;
        }
      }
    }

    const failureReason = isFailed
      ? (extractFailureReason(event) ?? 'Transaction Failed')
      : undefined;
    const symbol = value ? value.split(' ').pop() : undefined;
    const rawType = tolkStructName ? 'SmartContractExec' : 'Transaction';
    const classification = classifyTransactionRow({
      rawType,
      tolkStructName,
      symbol,
    });
    const senderAddr = isOutgoing ? matchedPerspective : counterparty;
    const recipientAddr = isOutgoing ? counterparty : matchedPerspective;

    return {
      id: eventId,
      eventId,
      lt: event.lt,
      txHash: hash,
      traceExternalHash: traceExtHex,
      network,
      explorerUrl: getExplorerTxUrl(network, hash, explorer),
      title: actionName,
      subtitleId: counterparty
        ? isOutgoing
          ? `to ${truncateMiddle(counterparty)}`
          : `from ${truncateMiddle(counterparty)}`
        : truncateMiddle(eventId),
      counterpartyAddress: counterparty,
      senderAddress: senderAddr,
      recipientAddress: recipientAddr,
      comment: undefined,
      fee,
      rawType,
      cleanAmount: value,
      symbol,
      timestamp: event.timestamp,
      failureReason,
      amount: signedAmount(value, isOutgoing),
      isOutgoing,
      status: isFailed ? 'failed' : 'success',
      date: formatTxDate(event.timestamp),
      tolkStructName,
      ...classification,
      traceDag: buildTraceDagFromEvent(event, matchedPerspective, {
        id: eventId,
        txHash: hash,
        isSuccess: !isFailed,
        isOutgoing,
        senderAddress: senderAddr,
        recipientAddress: recipientAddr,
        counterpartyAddress: counterparty,
      }),
    };
  }

  // Pick perspective address: prefer myAddress if involved in actions, otherwise first matching associated address
  let effectiveMyAddress = myAddress;
  const hasDirectMatch = event.actions.some((a) =>
    a.simplePreview?.accounts?.some((acc) =>
      sameAddress(acc.address, myAddress),
    ),
  );
  if (!hasDirectMatch && associatedAddresses?.length) {
    const matchedAssoc = associatedAddresses.find((assocAddr) =>
      event.actions.some((a) =>
        a.simplePreview?.accounts?.some((acc) =>
          sameAddress(acc.address, assocAddr),
        ),
      ),
    );
    if (matchedAssoc) {
      effectiveMyAddress = matchedAssoc;
    }
  }

  const action = selectRelevantAction(event.actions, effectiveMyAddress);
  const isOutgoing = isOutgoingFromAction(action, effectiveMyAddress);
  const { actionName, transferDetail, value, tolkStructName } = describeAction(
    action,
    isOutgoing,
  );
  const isFailed = action.status === 'failure';
  const failureReason = isFailed
    ? (extractFailureReason(event) ?? 'Transaction Failed')
    : undefined;

  const counterparty = getCounterpartyAddress(
    action,
    isOutgoing,
    effectiveMyAddress,
  );
  const sender = getSenderAddress(action, isOutgoing, effectiveMyAddress);
  const recipient = getRecipientAddress(action, isOutgoing, effectiveMyAddress);
  const comment = getCommentFromAction(action);
  const symbol = value ? value.split(' ').pop() : undefined;
  const classification = classifyTransactionRow({
    rawType: action.type,
    tolkStructName,
    symbol,
    actions: event.actions,
  });

  return {
    id: eventId,
    eventId,
    lt: event.lt,
    txHash: hash,
    traceExternalHash: traceExtHex,
    network,
    explorerUrl: getExplorerTxUrl(network, hash, explorer),
    title: actionName,
    subtitleId: transferDetail || truncateMiddle(eventId),
    counterpartyAddress: counterparty,
    senderAddress: sender,
    recipientAddress: recipient,
    comment,
    fee,
    rawType: action.type,
    cleanAmount: value,
    symbol,
    timestamp: event.timestamp,
    failureReason,
    amount: signedAmount(value, isOutgoing),
    isOutgoing,
    status: isFailed ? 'failed' : 'success',
    date: formatTxDate(event.timestamp),
    tolkStructName,
    ...classification,
    traceDag: buildTraceDagFromEvent(event, effectiveMyAddress, {
      id: eventId,
      txHash: hash,
      isSuccess: !isFailed,
      isOutgoing,
      senderAddress: sender,
      recipientAddress: recipient,
      counterpartyAddress: counterparty,
      comment,
    }),
  };
};

const pendingStatus = (pending: PendingLike): TransactionRowStatus => {
  if (
    pending.action?.status === 'failure' ||
    pending.finality === 'invalidated'
  )
    return 'failed';
  if (pending.finality === 'finalized') return 'success';
  return 'loading';
};

/** Maps a streaming pending transaction to a row (via its parsed action, falling back to the preview). */
export const mapPendingToRow = (
  pending: PendingLike,
  myAddress: string,
  timestamp: number,
  network: ExplorerNetwork,
  explorer: ExplorerChoice = 'tonscan',
): TransactionRowModel => {
  const status = pendingStatus(pending);
  const hash = pending.externalHash ?? pending.traceId;
  // Not-yet-on-chain (still loading) transactions have no explorer page yet.
  const explorerUrl =
    status === 'loading'
      ? undefined
      : getExplorerTxUrl(network, hash, explorer);
  const base = {
    id: `pending-${pending.traceId}`,
    txHash: hash,
    network,
    explorerUrl,
    subtitleId: truncateMiddle(pending.traceId),
    status,
    timestamp,
    date: formatTxDate(timestamp),
  };

  if (pending.action) {
    const isOutgoing = isOutgoingFromAction(pending.action, myAddress);
    const { actionName, transferDetail, value, tolkStructName } =
      describeAction(pending.action, isOutgoing);
    const counterparty = getCounterpartyAddress(
      pending.action,
      isOutgoing,
      myAddress,
    );
    const sender = getSenderAddress(pending.action, isOutgoing, myAddress);
    const recipient = getRecipientAddress(
      pending.action,
      isOutgoing,
      myAddress,
    );
    const comment = getCommentFromAction(pending.action);
    const symbol = value ? value.split(' ').pop() : undefined;
    const classification = classifyTransactionRow({
      rawType: pending.action.type,
      tolkStructName,
      symbol,
      actions: [pending.action],
    });

    return {
      ...base,
      title: actionName,
      subtitleId: transferDetail || truncateMiddle(pending.traceId),
      counterpartyAddress: counterparty,
      senderAddress: sender,
      recipientAddress: recipient,
      comment,
      rawType: pending.action.type,
      cleanAmount: value,
      symbol,
      amount: signedAmount(value, isOutgoing),
      isOutgoing,
      tolkStructName,
      ...classification,
    };
  }

  const isContractPreview = pending.preview?.type === 'contract';
  const isOutgoing =
    pending.preview?.type === 'send' || pending.preview?.type === 'contract';
  const value =
    pending.preview && BigInt(pending.preview.amount || 0) > 0n
      ? `${formatAmount(pending.preview.amount, GRAM_DECIMALS)} GRAM`
      : '';
  const title = isContractPreview ? 'SmartContractExec' : 'TonTransfer';
  const transferDetail = pending.preview
    ? value
      ? `${isOutgoing ? 'Sent' : 'Received'} ${value}`
      : 'Processing'
    : 'Processing';
  const counterparty = pending.preview?.recipient;
  const rawType = isContractPreview ? 'SmartContractExec' : 'TonTransfer';
  const classification = classifyTransactionRow({
    rawType,
    symbol: value ? 'GRAM' : undefined,
  });
  return {
    ...base,
    title,
    subtitleId: transferDetail,
    counterpartyAddress: counterparty,
    senderAddress: isOutgoing ? myAddress : counterparty,
    recipientAddress: isOutgoing ? counterparty : myAddress,
    rawType,
    cleanAmount: value,
    symbol: value ? 'GRAM' : undefined,
    amount: signedAmount(value, isOutgoing),
    isOutgoing,
    ...classification,
  };
};
