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
import { CityMap } from '@/contracts/brotherhood/CityMap.gen';
import { network } from '@/lib/brotherhood/config';

export interface UseCityMembersResult {
    cityName: string | null;
    members: string[];
    isLoading: boolean;
    refetch: () => void;
}

export function useCityMembers(cityMapAddressString: string | null): UseCityMembersResult {
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['city-members', cityMapAddressString],
        queryFn: async () => {
            if (!cityMapAddressString) return null;
            const cityMapAddr = Address.parse(cityMapAddressString);
            const client = getTonClient(network);
            const cityMapContract = client.open(CityMap.fromAddress(cityMapAddr));

            const [cityName, dict] = await Promise.all([
                cityMapContract.getCityName().catch(() => null),
                cityMapContract.getMembers().catch(() => null),
            ]);

            const memberAddrs: string[] = [];
            if (dict) {
                for (const key of dict.keys()) {
                    memberAddrs.push(key.toString());
                }
            }

            return {
                cityName,
                members: memberAddrs,
            };
        },
        enabled: Boolean(cityMapAddressString),
    });

    return {
        cityName: data?.cityName ?? null,
        members: data?.members ?? [],
        isLoading,
        refetch,
    };
}
