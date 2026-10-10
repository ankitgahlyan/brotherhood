/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useMemo, useEffect } from 'react';
import { Address } from '@ton/core';
import type { DaoProxyStore } from '@wrappers/DaoProxy.gen';
import type { PollStore } from '@wrappers/Poll.gen';
import { network } from '@/lib/brotherhood/config';
import {
  useContractState,
  getContractCache,
  getNormalizedContractCacheKey,
} from '@/lib/brotherhood/contract-cache';
import { batchHydrateUniversal } from '@/lib/brotherhood/account-state-hydrator';

export interface ProposalItem {
  id: string;
  proposer: string;
  yesVotes: bigint;
  noVotes: bigint;
  totalAccounts: bigint;
  deadline: number;
  executed: boolean;
  daoProxyAddress: string;
  fiAddress: string;
}

export interface UseProposalsResult {
  totalAccounts: bigint | null;
  proposalCount: bigint | null;
  proposals: ProposalItem[];
  daoProxy: DaoProxyStore | null;
  isLoading: boolean;
  refetch: () => void;
}

export function useProposals(addressString: string | null): UseProposalsResult {
  const cleanAddr = addressString?.trim() || null;

  // Auto-hydrate valid address input only if not yet cached
  useEffect(() => {
    if (!cleanAddr) return;
    let isCancelled = false;
    getContractCache(getNormalizedContractCacheKey(network, cleanAddr)).then(
      (cached) => {
        if (isCancelled || cached !== null) return;
        try {
          const targetAddr = Address.parse(cleanAddr);
          batchHydrateUniversal([targetAddr], network, {
            knownTypes: { [targetAddr.toString()]: 'poll' },
          }).catch((err) => {
            console.warn('[useProposals] Auto-hydration error:', err);
          });
        } catch {
          /* ignore */
        }
      },
    );
    return () => {
      isCancelled = true;
    };
  }, [cleanAddr]);

  const { data: store, isLoading } = useContractState<
    PollStore | DaoProxyStore
  >(cleanAddr, network);

  const result = useMemo<UseProposalsResult>(() => {
    if (!store) {
      return {
        totalAccounts: null,
        proposalCount: null,
        proposals: [],
        daoProxy: null,
        isLoading: isLoading && Boolean(cleanAddr),
        refetch: () => {},
      };
    }

    // Check if store is PollStore
    if (store.$ === 'PollStore') {
      const addrs = store.addresses?.ref;
      const proposer = addrs?.proposerOwner ?? (store as any).proposerOwner;
      const daoProxy = addrs?.daoProxyAddress ?? (store as any).daoProxyAddress;
      const fiAddr = addrs?.fiAddress ?? (store as any).fiAddress;

      return {
        totalAccounts: store.totalAccounts ?? null,
        proposalCount: 1n,
        daoProxy: null,
        proposals: [
          {
            id: store.proposalId ? store.proposalId.toString() : '0',
            proposer: proposer ? proposer.toString() : '',
            yesVotes: store.yesVotes ?? 0n,
            noVotes: store.noVotes ?? 0n,
            totalAccounts: store.totalAccounts ?? 0n,
            deadline: store.expiresAt ? Number(store.expiresAt) : 0,
            executed: Boolean(store.executed),
            daoProxyAddress: daoProxy ? daoProxy.toString() : '',
            fiAddress: fiAddr ? fiAddr.toString() : '',
          },
        ],
        isLoading: false,
        refetch: () => {},
      };
    }

    // Otherwise treat as DaoProxy
    return {
      totalAccounts: null,
      proposalCount: null,
      proposals: [],
      daoProxy: store as DaoProxyStore,
      isLoading: false,
      refetch: () => {},
    };
  }, [store, isLoading, cleanAddr]);

  return {
    ...result,
    refetch: () => {
      if (cleanAddr) {
        batchHydrateUniversal([cleanAddr], network, {
          knownTypes: { [cleanAddr]: 'poll' },
        }).catch(() => {});
      }
    },
  };
}
