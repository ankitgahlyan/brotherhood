/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useMemo } from 'react';
import { useWalletStore, useShallow } from '@demo/wallet-core';
import { Base64ToHex } from '@ton/walletkit';
import type { Event } from '@ton/walletkit';
import { useExplorer } from '@/core/explorer';
import { sameAddress } from '@/core/utils/formatters';

import { mapEventToRow, mapPendingToRow } from '../utils/map-transaction-row';
import type { TransactionRowModel } from '../utils/map-transaction-row';

const nowSeconds = (): number => Math.floor(Date.now() / 1000);

interface TransactionRows {
  rows: TransactionRowModel[];
  allRows: TransactionRowModel[];
  hasMore: boolean;
}

/**
 * Reads transformed rows from local store (`eventsByAddress[address]`), merges pending transactions,
 * and filters locally across All, Contract Calls ('CONTRACT'), TON, and per-token symbols.
 */
export const useTransactionRows = (
  limit: number,
  tokenFilter?: string,
): TransactionRows => {
  const { explorer } = useExplorer();
  const {
    events,
    eventsByAddress,
    associatedAddressesByAddress,
    address,
    pendingTransactions,
    network,
    hasNextEvents,
  } = useWalletStore(
    useShallow((state) => {
      const activeWallet = state.walletManagement.savedWallets.find(
        (w) => w.id === state.walletManagement.activeWalletId,
      );
      return {
        events: state.walletManagement.events,
        eventsByAddress: state.walletManagement.eventsByAddress,
        associatedAddressesByAddress:
          state.walletManagement.associatedAddressesByAddress,
        address: state.walletManagement.address,
        pendingTransactions: state.walletManagement.pendingTransactions,
        network: activeWallet?.network ?? 'testnet',
        hasNextEvents: Boolean(state.walletManagement.hasNextEvents),
      };
    }),
  );

  const { rows, allRows, totalSourceCount } = useMemo(() => {
    const myAddress = address ?? '';
    let storedItems: Array<Event | TransactionRowModel> | undefined =
      myAddress && eventsByAddress
        ? (eventsByAddress[myAddress] as
            Array<Event | TransactionRowModel> | undefined)
        : undefined;

    if (!storedItems && myAddress && eventsByAddress) {
      for (const [key, list] of Object.entries(eventsByAddress)) {
        if (sameAddress(key, myAddress) && Array.isArray(list)) {
          storedItems = list as Array<Event | TransactionRowModel>;
          break;
        }
      }
    }

    const eventItems = (storedItems ?? events ?? []) as Array<
      Event | TransactionRowModel
    >;
    const associatedAddresses =
      (myAddress && associatedAddressesByAddress?.[myAddress]) || undefined;

    // Drop pending entries already confirmed by a loaded event or transformed row.
    const confirmedTraceIds = new Set<string>();
    const confirmedExternalHashes = new Set<string>();
    for (const ev of eventItems as any[]) {
      if (!ev) continue;
      if (ev.eventId) confirmedTraceIds.add(String(ev.eventId));
      if (ev.id) confirmedTraceIds.add(String(ev.id));
      if (ev.txHash) confirmedTraceIds.add(String(ev.txHash));
      if (ev.traceExternalHash) {
        confirmedExternalHashes.add(String(ev.traceExternalHash));
        try {
          confirmedExternalHashes.add(Base64ToHex(ev.traceExternalHash));
        } catch {
          // Already hex or non-base64
        }
      }
    }

    const seen = new Set<string>();
    const pendingRows = pendingTransactions
      .filter((p) => {
        if (p.traceId && confirmedTraceIds.has(p.traceId)) return false;
        if (p.externalHash && confirmedExternalHashes.has(p.externalHash))
          return false;
        if (seen.has(p.traceId)) return false;
        seen.add(p.traceId);
        return true;
      })
      .map((p) => {
        const timestamp = p.preview?.timestamp ?? nowSeconds();
        return {
          timestamp,
          row: mapPendingToRow(p, myAddress, timestamp, network, explorer),
        };
      });

    const eventRows = eventItems
      .map((ev) => {
        const row = mapEventToRow(
          ev,
          myAddress,
          network,
          explorer,
          associatedAddresses,
        );
        return {
          timestamp: row?.timestamp ?? (ev as any)?.timestamp ?? 0,
          row,
        };
      })
      .filter(
        (item): item is { timestamp: number; row: TransactionRowModel } =>
          item.row !== null,
      );

    const combinedRows = [...pendingRows, ...eventRows]
      .sort((a, b) => b.timestamp - a.timestamp)
      .map((item) => item.row);

    if (!tokenFilter || tokenFilter.toUpperCase() === 'ALL') {
      return {
        rows: combinedRows.slice(0, limit),
        allRows: combinedRows,
        totalSourceCount: eventItems.length,
      };
    }

    const filterNormalized = tokenFilter.toUpperCase();
    const filtered = combinedRows.filter((row) => {
      if (filterNormalized === 'CONTRACT') {
        return row.category === 'contract' || row.isContractCall === true;
      }
      if (filterNormalized === 'TON' || filterNormalized === 'GRAM') {
        if (row.category) {
          return row.category === 'ton';
        }
        return (
          row.symbol === 'TON' ||
          row.symbol === 'GRAM' ||
          row.rawType === 'TonTransfer'
        );
      }
      if (row.tokens && row.tokens.length > 0) {
        return row.tokens.some((t) => t.toUpperCase() === filterNormalized);
      }
      return (
        row.symbol?.toUpperCase() === filterNormalized ||
        row.title?.toUpperCase().includes(filterNormalized) ||
        row.subtitleId?.toUpperCase().includes(filterNormalized)
      );
    });

    return {
      rows: filtered.slice(0, limit),
      allRows: combinedRows,
      totalSourceCount: eventItems.length,
    };
  }, [
    events,
    eventsByAddress,
    associatedAddressesByAddress,
    pendingTransactions,
    address,
    network,
    explorer,
    tokenFilter,
    limit,
  ]);

  const hasMore =
    hasNextEvents || allRows.length > limit || totalSourceCount >= limit;

  return { rows, allRows, hasMore };
};
