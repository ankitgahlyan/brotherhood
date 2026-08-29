/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useQuery } from '@tanstack/react-query';
import { Address } from '@ton/core';
import { getTonClient } from '@/lib/brotherhood/ton';
import { Poll } from '@wrappers/Poll.gen';
import { DaoProxy, type DaoProxyStore } from '@wrappers/DaoProxy.gen';
import { network } from '@/lib/brotherhood/config';

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
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['dao-proposals', addressString],
    queryFn: async () => {
      if (!addressString) return null;
      const targetAddr = Address.parse(addressString);
      const client = getTonClient(network);

      // Try loading as Poll first
      try {
        const pollContract = client.open(Poll.fromAddress(targetAddr));
        const pollStore = await pollContract.getPollData();
        return {
          totalAccounts: pollStore.totalAccounts,
          proposalCount: 1n,
          daoProxy: null,
          proposals: [
            {
              id: pollStore.proposalId.toString(),
              proposer: pollStore.proposerOwner.toString(),
              yesVotes: pollStore.yesVotes,
              noVotes: pollStore.noVotes,
              totalAccounts: pollStore.totalAccounts,
              deadline: Number(pollStore.expiresAt),
              executed: pollStore.executed,
              daoProxyAddress: pollStore.daoProxyAddress.toString(),
              fiAddress: pollStore.fiAddress.toString(),
            },
          ],
        };
      } catch {
        // If not a Poll, try loading as DaoProxy
        const daoProxyContract = client.open(DaoProxy.fromAddress(targetAddr));
        const daoStore = await daoProxyContract.getDaoProxyData();
        return {
          totalAccounts: null,
          proposalCount: daoStore.pollCount,
          daoProxy: daoStore,
          proposals: [],
        };
      }
    },
    enabled: Boolean(addressString),
  });

  return {
    totalAccounts: data?.totalAccounts ?? null,
    proposalCount: data?.proposalCount ?? null,
    proposals: data?.proposals ?? [],
    daoProxy: data?.daoProxy ?? null,
    isLoading,
    refetch,
  };
}
