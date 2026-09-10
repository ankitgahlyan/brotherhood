import { Address } from '@ton/core';
import { Poll } from '@wrappers/Poll.gen';
import { DaoProxy, type DaoProxyStore } from '@wrappers/DaoProxy.gen';
import { DEFAULT_NETWORK, type Network } from './config';
import { getTonClient } from './ton';

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

export interface DaoProposalsState {
  totalAccounts: bigint | null;
  proposalCount: bigint | null;
  proposals: ProposalItem[];
  daoProxy: DaoProxyStore | null;
  isLoading: boolean;
}

const daoCache = new Map<string, { data: any; timestamp: number }>();

export async function fetchDaoProposals(
  addressString: string,
  network: Network = DEFAULT_NETWORK,
): Promise<{
  totalAccounts: bigint | null;
  proposalCount: bigint | null;
  proposals: ProposalItem[];
  daoProxy: DaoProxyStore | null;
} | null> {
  if (!addressString) return null;
  const cacheKey = `dao-proposals:${network}:${addressString}`;
  const cached = daoCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < 30_000) {
    return cached.data;
  }

  const targetAddr = Address.parse(addressString);
  const client = getTonClient(network);

  try {
    const pollContract = client.open(Poll.fromAddress(targetAddr));
    const pollStore = await pollContract.getPollData();
    const result = {
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
    daoCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  } catch {
    try {
      const daoProxyContract = client.open(DaoProxy.fromAddress(targetAddr));
      const daoStore = await daoProxyContract.getDaoProxyData();
      const result = {
        totalAccounts: null,
        proposalCount: null,
        daoProxy: daoStore,
        proposals: [],
      };
      daoCache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    } catch {
      return null;
    }
  }
}
