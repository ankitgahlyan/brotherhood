/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Base64ToHex } from '@ton/walletkit';
import type { Action, Event } from '@ton/walletkit';

import { formatLargeValue, formatUnits, sameAddress } from '@/core/utils';
import { KNOWN_OPCODES } from '@/core/utils/payload';
import { getExplorerTxUrl, type ExplorerChoice } from '@/core/explorer';
import type { NetworkType } from '@demo/wallet-core';

/** Network accepted by the explorer-url builder (mainnet/testnet/tetra). */
type ExplorerNetwork = NetworkType;

/** Status badge shown on the transaction icon. */
export type TransactionRowStatus = 'success' | 'loading' | 'failed';

/** Normalized view-model consumed by {@link TransactionRow}. */
export interface TransactionRowModel {
  /** Unique React key. */
  id: string;
  /** Raw transaction hash or trace ID for explorer lookups. */
  txHash?: string;
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
  /** Decoded failure reason if transaction failed. */
  failureReason?: string;
  /** Signed crypto amount, e.g. "+5 GRAM" / "-1 USDT". */
  amount: string;
  /** Outgoing transfers are red, incoming are green. */
  isOutgoing: boolean;
  status: TransactionRowStatus;
  /** Formatted date+time, e.g. "Sep 10, 14:30". */
  date: string;
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
  // Common Contract Errors
  47: 'Balance Error',
  48: 'Not Enough Gas',
  49: 'Invalid Message',
  72: 'Invalid Op',
  73: 'Not Owner',
  74: 'Not Valid Wallet',
  333: 'Wrong Workchain',
  404: 'Not Found',
  // Brotherhood Specific Errors
  700: 'Incorrect Sender',
  701: 'Account Terminated',
  702: 'Account Inactive',
  703: 'Insufficient Gas Sent',
  704: 'Reserved Internal',
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
  750: 'Proposal Already Active',
  751: 'Proposal Not Found',
  752: 'Proposal Pending Accounts',
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
};

export function decodeExitCode(code: number): string {
  const name = TVM_EXIT_CODES[code];
  return name ? `${name} (exit ${code})` : `Exit ${code}`;
}

/** Extracts the failure exit code from transaction compute phase if available. */
function extractFailureReason(event: Event): string | undefined {
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

/** Action name + transfer detail + value (no sign), derived from the typed action fields. */
const describeAction = (
  action: Action,
  isOutgoing: boolean,
): { actionName: string; transferDetail: string; value: string } => {
  const label = isOutgoing ? 'Sent' : 'Received';

  if (action.type === 'TonTransfer' && 'TonTransfer' in action) {
    const value = `${formatAmount(action.TonTransfer.amount, GRAM_DECIMALS)} GRAM`;
    const comment = action.TonTransfer.comment?.trim();
    return {
      actionName: comment ? `Comment: “${comment}”` : 'TonTransfer',
      transferDetail: `${label} ${value}`,
      value,
    };
  }

  if (action.type === 'JettonTransfer' && 'JettonTransfer' in action) {
    const { amount, jetton, comment } = action.JettonTransfer;
    const value =
      `${formatAmount(amount, jetton.decimals)} ${jetton.symbol}`.trim();
    return {
      actionName: comment ? `JettonTransfer: “${comment}”` : 'AskToTransfer',
      transferDetail: `${label} ${value}`,
      value,
    };
  }

  if (action.type === 'SmartContractExec' && 'SmartContractExec' in action) {
    const op = action.SmartContractExec.operation;
    const opNumber = Number(op);
    const decodedName =
      !Number.isNaN(opNumber) && KNOWN_OPCODES[opNumber]
        ? KNOWN_OPCODES[opNumber]
        : op
          ? `Contract Call (${op})`
          : 'SmartContractExec';
    const val =
      action.SmartContractExec.tonAttached > 0n
        ? `${formatAmount(action.SmartContractExec.tonAttached, GRAM_DECIMALS)} GRAM`
        : '';
    return {
      actionName: decodedName,
      transferDetail: val
        ? `${label} ${val}`
        : action.simplePreview.description,
      value: val,
    };
  }

  if (action.type === 'ContractDeploy') {
    return {
      actionName: 'ContractDeploy',
      transferDetail: action.simplePreview.description || 'Deploy Contract',
      value: action.simplePreview.value || '',
    };
  }

  if (action.type === 'JettonSwap') {
    return {
      actionName: 'JettonSwap',
      transferDetail: action.simplePreview.description || 'Swap',
      value: action.simplePreview.value || '',
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
  };
};

/** Picks the action that involves the current wallet, preferring the one where we are the sender. */
const selectRelevantAction = (actions: Action[], myAddress: string): Action => {
  const withMe = actions.filter((a) =>
    a.simplePreview?.accounts?.some((acc) =>
      sameAddress(acc.address, myAddress),
    ),
  );
  const isSender = (a: Action): boolean => isOutgoingFromAction(a, myAddress);
  return withMe.find(isSender) ?? withMe[0] ?? actions[0];
};

const signedAmount = (value: string, isOutgoing: boolean): string =>
  value ? `${isOutgoing ? '-' : '+'}${value}` : '';

/**
 * Maps a historical event to a row. Returns null for events without actions
 * (rendered elsewhere via the trace fetch — skipped in the dashboard preview).
 */
export const mapEventToRow = (
  event: Event,
  myAddress: string,
  network: ExplorerNetwork,
  explorer: ExplorerChoice = 'tonscan',
): TransactionRowModel | null => {
  if (!event.actions || event.actions.length === 0) return null;
  const action = selectRelevantAction(event.actions, myAddress);
  const isOutgoing = isOutgoingFromAction(action, myAddress);
  const { actionName, transferDetail, value } = describeAction(
    action,
    isOutgoing,
  );
  const eventId = String(event.eventId);
  const hash =
    eventId ||
    (event.traceExternalHash ? Base64ToHex(event.traceExternalHash) : '');
  const isFailed = action.status === 'failure';
  const failureReason = isFailed
    ? (extractFailureReason(event) ?? 'Transaction Failed')
    : undefined;

  const counterparty = getCounterpartyAddress(action, isOutgoing, myAddress);

  return {
    id: eventId,
    txHash: hash,
    network,
    explorerUrl: getExplorerTxUrl(network, hash, explorer),
    title: actionName,
    subtitleId: transferDetail || truncateMiddle(eventId),
    counterpartyAddress: counterparty,
    failureReason,
    amount: signedAmount(value, isOutgoing),
    isOutgoing,
    status: isFailed ? 'failed' : 'success',
    date: formatTxDate(event.timestamp),
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
    date: formatTxDate(timestamp),
  };

  if (pending.action) {
    const isOutgoing = isOutgoingFromAction(pending.action, myAddress);
    const { actionName, transferDetail, value } = describeAction(
      pending.action,
      isOutgoing,
    );
    const counterparty = getCounterpartyAddress(
      pending.action,
      isOutgoing,
      myAddress,
    );
    return {
      ...base,
      title: actionName,
      subtitleId: transferDetail || truncateMiddle(pending.traceId),
      counterpartyAddress: counterparty,
      amount: signedAmount(value, isOutgoing),
      isOutgoing,
    };
  }

  const isOutgoing = pending.preview?.type === 'send';
  const value = pending.preview
    ? `${formatAmount(pending.preview.amount, GRAM_DECIMALS)} GRAM`
    : '';
  const title = isOutgoing ? 'TonTransfer' : 'TonTransfer';
  const transferDetail = pending.preview
    ? `${isOutgoing ? 'Sent' : 'Received'} ${value}`
    : 'Processing';
  return {
    ...base,
    title,
    subtitleId: transferDetail,
    counterpartyAddress: pending.preview?.recipient,
    amount: signedAmount(value, isOutgoing),
    isOutgoing,
  };
};
