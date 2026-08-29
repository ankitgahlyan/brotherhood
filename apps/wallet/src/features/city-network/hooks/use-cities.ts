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
import { Location } from '@/contracts/brotherhood/Location.gen';
import { network } from '@/lib/brotherhood/config';

export interface CityItem {
    id: string;
    cityName: string;
}

export interface UseCitiesResult {
    cities: CityItem[];
    isLoading: boolean;
    refetch: () => void;
}

export function useCities(locationAddressString: string | null): UseCitiesResult {
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['location-cities', locationAddressString],
        queryFn: async () => {
            if (!locationAddressString) return [];
            const locAddr = Address.parse(locationAddressString);
            const client = getTonClient(network);
            const locationContract = client.open(Location.fromAddress(locAddr));

            const dict = await locationContract.getCities();
            const result: CityItem[] = [];

            for (const key of dict.keys()) {
                const cityName = dict.get(key);
                if (cityName) {
                    result.push({
                        id: key.toString(),
                        cityName,
                    });
                }
            }

            return result;
        },
        enabled: Boolean(locationAddressString),
    });

    return {
        cities: data ?? [],
        isLoading,
        refetch,
    };
}
