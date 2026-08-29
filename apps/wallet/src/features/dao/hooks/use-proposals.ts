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
import { Dao } from '@/contracts/brotherhood/Dao.gen';
import { network } from '@/lib/brotherhood/config';

export interface ProposalItem {
    id: string;
    proposer: string;
    yesVotes: bigint;
    noVotes: bigint;
    deadline: number;
    executed: boolean;
}

export interface UseProposalsResult {
    totalAccounts: bigint | null;
    proposalCount: bigint | null;
    proposals: ProposalItem[];
    isLoading: boolean;
    refetch: () => void;
}

export function useProposals(daoAddressString: string | null): UseProposalsResult {
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['dao-proposals', daoAddressString],
        queryFn: async () => {
            if (!daoAddressString) return null;
            const daoAddr = Address.parse(daoAddressString);
            const client = getTonClient(network);
            const daoContract = client.open(Dao.fromAddress(daoAddr));

            const store = await daoContract.getDaoData();
            const proposalsList: ProposalItem[] = [];

            const keys = store.proposals.keys();
            for (const k of keys) {
                const p = store.proposals.get(k);
                if (p) {
                    proposalsList.push({
                        id: k.toString(),
                        proposer: p.proposerOwner.toString(),
                        yesVotes: p.yesVotes,
                        noVotes: p.noVotes,
                        deadline: Number(p.expiresAt),
                        executed: false,
                    });
                }
            }

            return {
                totalAccounts: store.totalAccounts,
                proposalCount: store.proposalCount,
                proposals: proposalsList,
            };
        },
        enabled: Boolean(daoAddressString),
    });

    return {
        totalAccounts: data?.totalAccounts ?? null,
        proposalCount: data?.proposalCount ?? null,
        proposals: data?.proposals ?? [],
        isLoading,
        refetch,
    };
}
