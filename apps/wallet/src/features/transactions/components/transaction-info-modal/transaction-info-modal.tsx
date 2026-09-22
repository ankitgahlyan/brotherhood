/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  Copy,
  Check,
  X,
  Repeat,
  Globe,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  AlertCircle,
  FileText,
  Route,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from '@/core/routing';
import { Modal } from '@/core/components/ui/modal';
import { Button } from '@/core/components/ui/button';
import { formatUnits } from '@/core/utils';
import { cn } from '@/core/lib/utils';
import { useFormatAddress, sameAddress } from '@/core/utils/formatters';
import { getCachedUsername } from '@/features/send/lib/contact-storage';
import { useWalletStore, getChainNetwork } from '@demo/wallet-core';
import { parseTraceDag, type TraceDagAnalysis } from '@ton/walletkit';

import type { TransactionRowModel } from '../../utils/map-transaction-row';
import { decodeExitCode } from '../../utils/map-transaction-row';
import { InlineExplorerModal } from '../inline-explorer-modal';

interface TransactionInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: TransactionRowModel | null;
}

export const TransactionInfoModal: React.FC<TransactionInfoModalProps> = ({
  isOpen,
  onClose,
  transaction,
}) => {
  const navigate = useNavigate();
  const [isInlineExplorerOpen, setIsInlineExplorerOpen] = useState(false);
  const [isLoadingTrace, setIsLoadingTrace] = useState(false);
  const [isRouteExpanded, setIsRouteExpanded] = useState(false);

  const { formatWalletAddress } = useFormatAddress();
  const savedWallets = useWalletStore(
    (state) => state.walletManagement.savedWallets,
  );
  const activeWalletId = useWalletStore(
    (state) => state.walletManagement.activeWalletId,
  );
  const walletKit = useWalletStore((state) => state.walletCore.walletKit);
  const eventsByAddress = useWalletStore(
    (state) => state.walletManagement.eventsByAddress,
  );
  const activeWallet = savedWallets.find((w) => w.id === activeWalletId);
  const myAddress = activeWallet?.address;

  const hashForExplorer =
    transaction?.txHash ||
    (transaction?.id.startsWith('pending-')
      ? transaction.id.replace('pending-', '')
      : transaction?.id);
  const network = transaction?.network ?? 'testnet';

  const myEvents =
    (myAddress && eventsByAddress ? eventsByAddress[myAddress] : undefined) ||
    [];
  const storedEvent = myEvents.find((e: any) => {
    if (!transaction) return false;
    return (
      e.eventId === transaction.id ||
      e.eventId === transaction.txHash ||
      (e.traceExternalHash &&
        (e.traceExternalHash === transaction.txHash ||
          e.traceExternalHash === transaction.id))
    );
  }) as any;

  // 1. Instant in-memory trace DAG derivation (0 network calls)
  const inMemoryTraceDag = useMemo<TraceDagAnalysis | null>(() => {
    if (
      !storedEvent ||
      !storedEvent.transactions ||
      Object.keys(storedEvent.transactions).length === 0
    ) {
      return null;
    }
    try {
      const traceItem = {
        trace_id: storedEvent.eventId,
        trace: storedEvent.trace,
        transactions: storedEvent.transactions,
        transactions_order: Object.keys(storedEvent.transactions),
        is_incomplete: Boolean(storedEvent.inProgress),
        start_utime: storedEvent.timestamp,
        start_lt: String(storedEvent.lt || 0),
        end_utime: storedEvent.timestamp,
        end_lt: String(storedEvent.lt || 0),
        external_hash: storedEvent.traceExternalHash || '',
        mc_seqno_start: '0',
        mc_seqno_end: '0',
        actions: storedEvent.actions as any,
        trace_info: {
          classification_state: 'parsed',
          messages: 0,
          pending_messages: 0,
          trace_state: 'complete',
          transactions: Object.keys(storedEvent.transactions).length,
        },
        warning: '',
      };
      return parseTraceDag(traceItem as any, myAddress);
    } catch {
      return null;
    }
  }, [storedEvent, myAddress]);

  const [fetchedTraceDag, setFetchedTraceDag] =
    useState<TraceDagAnalysis | null>(null);
  const traceDag = inMemoryTraceDag || fetchedTraceDag;

  useEffect(() => {
    if (!isOpen || !hashForExplorer || inMemoryTraceDag || !walletKit) return;

    let isMounted = true;
    const client = walletKit.getApiClient(getChainNetwork(network));
    if (!client || typeof client.getTraceDetails !== 'function') return;

    queueMicrotask(() => {
      if (isMounted) {
        setIsLoadingTrace(true);
      }
    });

    client
      .getTraceDetails({ txHash: hashForExplorer, walletAddress: myAddress })
      .then((dag) => {
        if (isMounted) {
          setFetchedTraceDag(dag ?? null);
        }
      })
      .catch(() => {
        if (isMounted) {
          setFetchedTraceDag(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingTrace(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [
    isOpen,
    hashForExplorer,
    inMemoryTraceDag,
    walletKit,
    network,
    myAddress,
  ]);

  const handleClose = () => {
    setFetchedTraceDag(null);
    setIsRouteExpanded(false);
    onClose();
  };

  if (!transaction) return null;

  const {
    counterpartyAddress,
    senderAddress,
    recipientAddress,
    failureReason,
    amount,
    cleanAmount,
    symbol,
    isOutgoing,
    status,
    timestamp,
    comment,
    fee,
  } = transaction;

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied`);
    } catch {
      toast.error(`Failed to copy ${label}`);
    }
  };

  const handleRepeat = () => {
    handleClose();
    const targetAddress = counterpartyAddress || recipientAddress || '';
    // Extract raw numeric value from cleanAmount or amount
    const numericAmount = cleanAmount
      ? cleanAmount.replace(/[^0-9.]/g, '')
      : amount.replace(/[^0-9.]/g, '');

    const params = new URLSearchParams();
    if (targetAddress) params.set('recipient', targetAddress);
    if (numericAmount) params.set('amount', numericAmount);
    if (symbol) params.set('token', symbol);

    navigate(`/send?${params.toString()}`);
  };

  const formattedDateTime = timestamp
    ? new Date(timestamp * 1000).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
    : transaction.date;

  const resolveAddressLabel = (addr?: string) => {
    if (!addr) return 'Unknown';
    if (myAddress && sameAddress(addr, myAddress)) {
      return 'My Account (Self)';
    }
    const cachedName = getCachedUsername(addr, network);
    if (cachedName) return `@${cachedName}`;
    return formatWalletAddress(addr, true);
  };

  return (
    <>
      <Modal.Container
        isOpened={isOpen}
        onOpenChange={(open) => !open && handleClose()}
        className="max-w-md w-full p-0 overflow-hidden rounded-3xl bg-card border border-border"
      >
        <Modal.Header onClose={handleClose} className="px-5 pt-4 pb-2">
          <Modal.Title className="text-base font-semibold text-center w-full">
            Transaction
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="px-5 pb-6 space-y-5">
          {/* Top Amount Hero */}
          <div className="flex flex-col items-center justify-center pt-2 pb-1">
            <div className="relative mb-3">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-inner ${
                  status === 'failed'
                    ? 'bg-rose-500/15 text-rose-500'
                    : isOutgoing
                      ? 'bg-rose-500/15 text-rose-500'
                      : 'bg-emerald-500/15 text-emerald-500'
                }`}
              >
                {status === 'failed' ? (
                  <X className="w-8 h-8" strokeWidth={2.5} />
                ) : isOutgoing ? (
                  <ArrowUpRight className="w-8 h-8" strokeWidth={2.5} />
                ) : (
                  <ArrowDownLeft className="w-8 h-8" strokeWidth={2.5} />
                )}
              </div>
            </div>

            <div
              className={`text-2xl font-bold tracking-tight ${
                status === 'failed'
                  ? 'text-foreground'
                  : isOutgoing
                    ? 'text-rose-500'
                    : 'text-emerald-500'
              }`}
            >
              {amount || '0'}
            </div>

            {/* Status Pill */}
            <div className="mt-1.5 flex items-center gap-1.5">
              {status === 'success' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <Check className="w-3 h-3" strokeWidth={3} />
                  <span>Successfully</span>
                </span>
              )}
              {status === 'failed' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-600 dark:text-rose-400">
                  <AlertCircle className="w-3 h-3" />
                  <span>Failed</span>
                </span>
              )}
              {status === 'loading' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/15 text-primary">
                  <span className="w-2.5 h-2.5 rounded-full border-2 border-primary/40 border-t-primary animate-spin" />
                  <span>Pending</span>
                </span>
              )}
            </div>

            {status === 'failed' && failureReason && (
              <p className="mt-2 text-xs font-medium text-rose-500 text-center px-4">
                {failureReason}
              </p>
            )}
          </div>

          {/* Details Card */}
          <div className="rounded-2xl bg-secondary/50 border border-border/80 divide-y divide-border/60 overflow-hidden text-xs">
            {/* Sender */}
            {senderAddress && (
              <div className="flex items-center justify-between p-3 gap-2">
                <span className="text-muted-foreground font-medium shrink-0">
                  Sender
                </span>
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="font-mono text-foreground truncate cursor-pointer hover:underline"
                    title={senderAddress}
                    onClick={() =>
                      copyToClipboard(senderAddress, 'Sender address')
                    }
                  >
                    {resolveAddressLabel(senderAddress)}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(senderAddress, 'Sender address')
                    }
                    className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
                    title="Copy sender address"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Recipient */}
            {recipientAddress && (
              <div className="flex items-center justify-between p-3 gap-2">
                <span className="text-muted-foreground font-medium shrink-0">
                  Recipient
                </span>
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="font-mono text-foreground truncate cursor-pointer hover:underline"
                    title={recipientAddress}
                    onClick={() =>
                      copyToClipboard(recipientAddress, 'Recipient address')
                    }
                  >
                    {resolveAddressLabel(recipientAddress)}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(recipientAddress, 'Recipient address')
                    }
                    className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
                    title="Copy recipient address"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Fee */}
            {fee && (
              <div className="flex items-center justify-between p-3">
                <span className="text-muted-foreground font-medium">Fee</span>
                <span className="font-semibold text-foreground">{fee}</span>
              </div>
            )}

            {/* Comment / Memo */}
            {comment && (
              <div className="p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-medium flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    <span>Comment</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(comment, 'Comment')}
                    className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
                    title="Copy comment"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="p-2.5 rounded-xl bg-background/80 border border-border/60 text-foreground break-words font-sans">
                  {comment}
                </div>
              </div>
            )}

            {/* Date & Time */}
            <div className="flex items-center justify-between p-3">
              <span className="text-muted-foreground font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Date</span>
              </span>
              <span className="text-foreground font-medium">
                {formattedDateTime}
              </span>
            </div>

            {/* Transaction Hash */}
            {hashForExplorer && (
              <div className="flex items-center justify-between p-3 gap-2">
                <span className="text-muted-foreground font-medium shrink-0">
                  Hash
                </span>
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="font-mono text-foreground truncate cursor-pointer hover:underline"
                    title={hashForExplorer}
                    onClick={() =>
                      copyToClipboard(hashForExplorer, 'Transaction hash')
                    }
                  >
                    {hashForExplorer.length > 16
                      ? `${hashForExplorer.slice(0, 8)}…${hashForExplorer.slice(-8)}`
                      : hashForExplorer}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(hashForExplorer, 'Transaction hash')
                    }
                    className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
                    title="Copy hash"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Multi-Hop Execution Route Timeline */}
          {((traceDag && traceDag.hops.length > 0) || isLoadingTrace) && (
            <div className="rounded-2xl bg-secondary/50 border border-border/80 overflow-hidden text-xs">
              <button
                type="button"
                onClick={() => setIsRouteExpanded(!isRouteExpanded)}
                className="w-full flex items-center justify-between p-3 cursor-pointer hover:bg-secondary/70 transition-colors"
              >
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <Route className="w-4 h-4 text-primary" />
                  <span>Execution Route</span>
                  {traceDag && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground">
                      {traceDag.hops.length}{' '}
                      {traceDag.hops.length === 1 ? 'hop' : 'hops'}
                    </span>
                  )}
                  {isLoadingTrace && (
                    <span className="w-3 h-3 rounded-full border-2 border-muted-foreground/30 border-t-foreground animate-spin" />
                  )}
                </div>
                {isRouteExpanded ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>

              {isRouteExpanded && traceDag && (
                <div className="p-3 pt-0 space-y-2.5 border-t border-border/60">
                  <div className="relative pl-4 space-y-3 pt-2 before:absolute before:left-1.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-border">
                    {traceDag.hops.map((hop, index) => {
                      const hopAmount =
                        hop.amount && hop.amount > 0n
                          ? `${formatUnits(hop.amount, 9)} GRAM`
                          : null;
                      const hopFee =
                        hop.fee && hop.fee > 0n
                          ? `${formatUnits(hop.fee, 9)} GRAM`
                          : null;

                      return (
                        <div key={hop.hash || index} className="relative group">
                          {/* Dot / Indicator */}
                          <div
                            className={cn(
                              'absolute -left-4 top-1 w-2.5 h-2.5 rounded-full ring-2 ring-background',
                              hop.isSuccess ? 'bg-emerald-500' : 'bg-rose-500',
                            )}
                          />

                          <div className="bg-background/80 rounded-xl p-2.5 border border-border/60 space-y-1">
                            {/* Route hop title */}
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-semibold text-foreground truncate">
                                {hop.source
                                  ? resolveAddressLabel(hop.source)
                                  : 'External'}
                                {' → '}
                                {hop.destination
                                  ? resolveAddressLabel(hop.destination)
                                  : 'Internal'}
                              </span>
                              <span
                                className={cn(
                                  'inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-semibold shrink-0',
                                  hop.isSuccess
                                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                    : 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
                                )}
                              >
                                {hop.isSuccess
                                  ? 'OK'
                                  : decodeExitCode(hop.computeExitCode ?? 0)}
                              </span>
                            </div>

                            {/* Op / Comment */}
                            {(hop.opCode || hop.comment) && (
                              <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                                {hop.opCode && (
                                  <span className="font-mono bg-muted/60 px-1 py-0.5 rounded">
                                    Op: {hop.opCode}
                                  </span>
                                )}
                                {hop.comment && (
                                  <span className="truncate italic">
                                    "{hop.comment}"
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Amount & Fee */}
                            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
                              {hopAmount ? (
                                <span className="font-medium text-foreground">
                                  {hopAmount}
                                </span>
                              ) : (
                                <span />
                              )}
                              {hopFee && (
                                <span className="font-mono text-[10px]">
                                  Fee: {hopFee}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-1">
            {isOutgoing && counterpartyAddress && (
              <Button
                variant="primary"
                onClick={handleRepeat}
                className="w-full flex items-center justify-center gap-2"
              >
                <Repeat className="w-4 h-4" />
                <span>Repeat</span>
              </Button>
            )}

            {hashForExplorer && (
              <Button
                variant="secondary"
                onClick={() => setIsInlineExplorerOpen(true)}
                className="w-full flex items-center justify-center gap-2"
              >
                <Globe className="w-4 h-4 text-primary" />
                <span>Open in Explorer</span>
              </Button>
            )}
          </div>
        </Modal.Body>
      </Modal.Container>

      {/* Embedded In-App Explorer View */}
      {isInlineExplorerOpen && (
        <InlineExplorerModal
          isOpen={isInlineExplorerOpen}
          onClose={() => setIsInlineExplorerOpen(false)}
          txHash={hashForExplorer}
          network={network}
        />
      )}
    </>
  );
};
