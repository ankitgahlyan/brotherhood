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
import { Lottery } from '@/contracts/brotherhood/Lottery.gen';
import { network } from '@/lib/brotherhood/config';

export interface UseLotteryStateResult {
    participantCount: number | null;
    prizePool: bigint | null;
    currentPhase: number | null;
    deadline: number | null;
    isParticipant: boolean;
    isLoading: boolean;
    refetch: () => void;
}

export function useLotteryState(
    lotteryAddressString: string | null,
    userAddressString: string | null
): UseLotteryStateResult {
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['lottery-state', lotteryAddressString, userAddressString],
        queryFn: async () => {
            if (!lotteryAddressString) return null;
            const lotteryAddr = Address.parse(lotteryAddressString);
            const client = getTonClient(network);
            const lotteryContract = client.open(Lottery.fromAddress(lotteryAddr));

            const [participantCount, prizePool, currentPhase, deadline] = await Promise.all([
                lotteryContract.getParticipantCount().catch(() => 0n),
                lotteryContract.getPrizePool().catch(() => 0n),
                lotteryContract.getCurrentPhase().catch(() => 0n),
                lotteryContract.getDeadline().catch(() => 0n),
            ]);

            let isParticipant = false;
            if (userAddressString) {
                try {
                    const uAddr = Address.parse(userAddressString);
                    isParticipant = await lotteryContract.getIsParticipant(uAddr);
                } catch {
                    isParticipant = false;
                }
            }

            return {
                participantCount: Number(participantCount),
                prizePool,
                currentPhase: Number(currentPhase),
                deadline: Number(deadline),
                isParticipant,
            };
        },
        enabled: Boolean(lotteryAddressString),
    });

    return {
        participantCount: data?.participantCount ?? null,
        prizePool: data?.prizePool ?? null,
        currentPhase: data?.currentPhase ?? null,
        deadline: data?.deadline ?? null,
        isParticipant: data?.isParticipant ?? false,
        isLoading,
        refetch,
    };
}
