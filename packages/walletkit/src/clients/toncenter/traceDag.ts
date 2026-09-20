/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { ToncenterTraceItem } from '../../types/toncenter/emulation';
import { asAddressFriendly, compareAddress } from '../../utils/address';

export interface TraceExecutionHop {
  hash: string;
  source?: string;
  destination?: string;
  amount?: bigint;
  fee: bigint;
  opCode?: string;
  comment?: string;
  isSuccess: boolean;
  computeExitCode?: number;
  actionResultCode?: number;
  depth: number;
}

export interface TraceDagAnalysis {
  traceId: string;
  isSuccess: boolean;
  totalNetworkFee: bigint;
  totalSent: bigint;
  totalReceived: bigint;
  hops: TraceExecutionHop[];
}

/**
 * Analyzes a Toncenter trace DAG by walking the internal transaction call tree.
 * Computes multi-hop execution route, total network fees, and compute/action phase failures.
 */
export function parseTraceDag(
  trace: ToncenterTraceItem,
  walletAddress?: string,
): TraceDagAnalysis {
  const traceId = trace.trace_id || '';
  const transactions = trace.transactions || {};
  const friendlyWallet = walletAddress ? asAddressFriendly(walletAddress) : '';

  let totalNetworkFee = 0n;
  let totalSent = 0n;
  let totalReceived = 0n;
  let isTraceOverallSuccess = true;
  const hops: TraceExecutionHop[] = [];

  const visitedTx = new Set<string>();

  function walkNode(
    node: { tx_hash?: string; in_msg_hash?: string | null; children?: any[] },
    depth: number,
  ) {
    if (!node || !node.tx_hash) return;
    const txHash = node.tx_hash;
    if (visitedTx.has(txHash)) return;
    visitedTx.add(txHash);

    const tx = transactions[txHash];
    if (tx) {
      const fee = tx.total_fees ? BigInt(tx.total_fees) : 0n;
      totalNetworkFee += fee;

      const computeOk = tx.description?.compute_ph?.success !== false;
      const computeExitCode = tx.description?.compute_ph?.exit_code;
      const actionOk = tx.description?.action?.success !== false;
      const actionResultCode = tx.description?.action?.result_code;
      const isAborted = Boolean(tx.description?.aborted);

      const hopSuccess = computeOk && actionOk && !isAborted;
      if (!hopSuccess) {
        isTraceOverallSuccess = false;
      }

      let source: string | undefined;
      let destination: string | undefined;
      let amount: bigint | undefined;
      let opCode: string | undefined;
      let comment: string | undefined;

      if (tx.in_msg) {
        source = tx.in_msg.source
          ? asAddressFriendly(tx.in_msg.source)
          : undefined;
        destination = tx.in_msg.destination
          ? asAddressFriendly(tx.in_msg.destination)
          : undefined;
        if (tx.in_msg.value) {
          amount = BigInt(tx.in_msg.value);
        }
        if (tx.in_msg.opcode) {
          opCode = tx.in_msg.opcode;
        }
        const decodedComment = (tx.in_msg.message_content?.decoded as any)
          ?.comment;
        if (typeof decodedComment === 'string') {
          comment = decodedComment;
        }
      }

      // If user is source of root hop
      if (friendlyWallet && source && compareAddress(source, friendlyWallet)) {
        if (amount) totalSent += amount;
      }
      // If user is destination of any hop
      if (
        friendlyWallet &&
        destination &&
        compareAddress(destination, friendlyWallet)
      ) {
        if (amount) totalReceived += amount;
      }

      hops.push({
        hash: txHash,
        source,
        destination: destination || asAddressFriendly(tx.account),
        amount,
        fee,
        opCode,
        comment,
        isSuccess: hopSuccess,
        computeExitCode,
        actionResultCode,
        depth,
      });
    }

    if (Array.isArray(node.children)) {
      for (const child of node.children) {
        walkNode(child, depth + 1);
      }
    }
  }

  if (trace.trace) {
    walkNode(trace.trace, 0);
  }

  // Fallback: If trace tree was not fully traversed, append any unvisited transactions in order
  const orderedHashes = trace.transactions_order || Object.keys(transactions);
  for (const hash of orderedHashes) {
    if (!visitedTx.has(hash)) {
      const tx = transactions[hash];
      if (tx) {
        visitedTx.add(hash);
        const fee = tx.total_fees ? BigInt(tx.total_fees) : 0n;
        totalNetworkFee += fee;

        const computeOk = tx.description?.compute_ph?.success !== false;
        const computeExitCode = tx.description?.compute_ph?.exit_code;
        const actionOk = tx.description?.action?.success !== false;
        const actionResultCode = tx.description?.action?.result_code;
        const isAborted = Boolean(tx.description?.aborted);
        const hopSuccess = computeOk && actionOk && !isAborted;
        if (!hopSuccess) isTraceOverallSuccess = false;

        const source = tx.in_msg?.source
          ? asAddressFriendly(tx.in_msg.source)
          : undefined;
        const destination = tx.in_msg?.destination
          ? asAddressFriendly(tx.in_msg.destination)
          : asAddressFriendly(tx.account);
        const amount = tx.in_msg?.value ? BigInt(tx.in_msg.value) : undefined;

        hops.push({
          hash,
          source,
          destination,
          amount,
          fee,
          opCode: tx.in_msg?.opcode || undefined,
          isSuccess: hopSuccess,
          computeExitCode,
          actionResultCode,
          depth: 1,
        });
      }
    }
  }

  return {
    traceId,
    isSuccess: isTraceOverallSuccess && !trace.is_incomplete,
    totalNetworkFee,
    totalSent,
    totalReceived,
    hops,
  };
}
