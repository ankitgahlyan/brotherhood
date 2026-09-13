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
import { network } from '@/lib/brotherhood/config';
import { useContractState } from '@/lib/brotherhood/contract-cache';
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

  // Auto-hydrate valid address input
  useEffect(() => {
    if (!cleanAddr) return;
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
  }, [cleanAddr]);

  const { data: store, isLoading } = useContractState<any>(cleanAddr, network);

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
    if (store.$ === 'PollStore' || store.proposalId !== undefined) {
      return {
        totalAccounts: store.totalAccounts ?? null,
        proposalCount: 1n,
        daoProxy: null,
        proposals: [
          {
            id: store.proposalId ? store.proposalId.toString() : '0',
            proposer: store.proposerOwner ? store.proposerOwner.toString() : '',
            yesVotes: store.yesVotes ?? 0n,
            noVotes: store.noVotes ?? 0n,
            totalAccounts: store.totalAccounts ?? 0n,
            deadline: store.expiresAt ? Number(store.expiresAt) : 0,
            executed: Boolean(store.executed),
            daoProxyAddress: store.daoProxyAddress
              ? store.daoProxyAddress.toString()
              : '',
            fiAddress: store.fiAddress ? store.fiAddress.toString() : '',
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
