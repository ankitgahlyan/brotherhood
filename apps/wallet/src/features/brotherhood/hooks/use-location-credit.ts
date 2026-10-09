/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useMemo, useEffect } from 'react';
import { Address } from '@ton/core';
import type { LocationCreditStore } from '@wrappers/LocationCredit.gen';
import { calculateLocationCreditAddress } from '@/lib/brotherhood/deploy';
import { type Network } from '@/lib/brotherhood/config';
import {
  useContractState,
  getContractCache,
  getNormalizedContractCacheKey,
} from '@/lib/brotherhood/contract-cache';
import { batchHydrateUniversal } from '@/lib/brotherhood/account-state-hydrator';
import { isValidH3Cell, normalizeH3Cell } from '@/core/utils/h3';

export interface LocationCreditEntryItem {
  borrowerAddress: string;
  amount: bigint;
  multiplier: number;
  cutoffDate: number;
  maturityDate: number;
}

export interface LocationCreditDetails {
  h3Cell: string;
  contractAddress: string;
  entryCount: number;
  version: number | null;
  entries: LocationCreditEntryItem[];
  isDeployed: boolean;
}

export function useLocationCredit(
  h3Cell: string | null | undefined,
  network: Network = 'testnet',
) {
  const cleanH3Cell = useMemo(() => {
    if (!h3Cell || !isValidH3Cell(h3Cell)) return '';
    return normalizeH3Cell(h3Cell);
  }, [h3Cell]);

  const calculatedAddress = useMemo<string | null>(() => {
    if (!cleanH3Cell) return null;
    try {
      const addr = calculateLocationCreditAddress({
        h3Cell: cleanH3Cell,
      });
      return addr.toString();
    } catch {
      return null;
    }
  }, [cleanH3Cell]);

  // Auto-hydrate newly calculated address only if not already cached
  useEffect(() => {
    if (!calculatedAddress) return;
    let isCancelled = false;
    getContractCache(
      getNormalizedContractCacheKey(network, calculatedAddress),
    ).then((cached) => {
      if (isCancelled || cached) return;
      try {
        const locCreditAddr = Address.parse(calculatedAddress);
        batchHydrateUniversal([locCreditAddr], network, {
          knownTypes: { [calculatedAddress]: 'locationCredit' },
        }).catch(() => {});
      } catch {
        /* ignore parse errors */
      }
    });
    return () => {
      isCancelled = true;
    };
  }, [calculatedAddress, network]);

  const { data: store, isLoading } = useContractState<LocationCreditStore>(
    calculatedAddress,
    network,
  );

  const data = useMemo<LocationCreditDetails | null>(() => {
    if (!cleanH3Cell || !calculatedAddress) return null;
    if (!store) {
      return {
        h3Cell: cleanH3Cell,
        contractAddress: calculatedAddress,
        entryCount: 0,
        version: null,
        entries: [],
        isDeployed: false,
      };
    }

    const items: LocationCreditEntryItem[] = [];
    if (store.entries && typeof store.entries.keys === 'function') {
      try {
        for (const k of store.entries.keys()) {
          const entry = store.entries.get(k);
          if (entry) {
            items.push({
              borrowerAddress: entry.borrowerAddress.toString(),
              amount: entry.amount,
              multiplier: Number(entry.multiplier) / 1000,
              cutoffDate: Number(entry.cutoffDate),
              maturityDate: Number(entry.maturityDate),
            });
          }
        }
      } catch {
        /* dictionary parse fallback */
      }
    }

    return {
      h3Cell: cleanH3Cell,
      contractAddress: calculatedAddress,
      entryCount: Number(store.entryCount ?? items.length),
      version: store.version ? Number(store.version) : 1,
      entries: items,
      isDeployed: true,
    };
  }, [cleanH3Cell, calculatedAddress, store]);

  return {
    h3Cell: cleanH3Cell,
    contractAddress: calculatedAddress,
    data,
    entries: data?.entries ?? [],
    entryCount: data?.entryCount ?? 0,
    isDeployed: data?.isDeployed ?? false,
    isLoading,
  };
}
