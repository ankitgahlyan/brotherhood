/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Address, Dictionary } from '@ton/core';
import { Location } from '@wrappers/Location.gen';
import { network, FI_ADDRESS } from '@/lib/brotherhood/config';
import { cachedQueryFn, createRefetchWrapper } from '@/lib/brotherhood/queries';
import { batchHydrateUniversal } from '@/lib/brotherhood/account-state-hydrator';
import {
  getNormalizedContractCacheKey,
  getContractCache,
} from '@/lib/brotherhood/contract-cache';

export interface LocationInfo {
  h3Cell: string | null;
  memberCount: number | null;
  version: number | null;
  minterAddress: string | null;
  members: string[];
  isDeployed: boolean;
}

export interface LocationCellDetails {
  h3Cell: string;
  contractAddress: string;
  memberCount: number;
  version: number | null;
  minterAddress: string | null;
  members: string[];
  isDeployed: boolean;
}

export interface UseLocationResult {
  location: LocationInfo | null;
  isLoading: boolean;
  refetch: () => void;
}

export interface UseLocationByH3CellResult {
  data: LocationCellDetails | null;
  calculatedAddress: string | null;
  isLoading: boolean;
  refetch: () => void;
}

/**
 * Calculates the deterministic child Location contract address for an H3 spatial cell
 * using StateInit (code + initial storage data) and 8-bit shard depth prefix matching the Minter.
 */
export function calculateLocationAddress(
  h3Cell: string,
  minterAddress: Address = Address.parse(FI_ADDRESS),
): Address {
  const loc = Location.fromStorage(
    {
      h3Cell,
      minterAddress,
      memberCount: 0n,
      members: Dictionary.empty(
        Dictionary.Keys.Address(),
        Dictionary.Values.Bool(),
      ),
      version: 0n,
    },
    {
      toShard: { fixedPrefixLength: 8, closeTo: minterAddress },
    },
  );
  return loc.address;
}

export function useLocationByH3Cell(
  h3Cell: string | null,
  minterAddressString?: string | null,
): UseLocationByH3CellResult {
  const cleanH3Cell = h3Cell?.trim() ?? '';

  const calculatedAddress = useMemo(() => {
    if (!cleanH3Cell) return null;
    try {
      const minter = minterAddressString
        ? Address.parse(minterAddressString)
        : Address.parse(FI_ADDRESS);
      return calculateLocationAddress(cleanH3Cell, minter).toString();
    } catch {
      return null;
    }
  }, [cleanH3Cell, minterAddressString]);

  const cacheKey = `location-h3-details:${cleanH3Cell}:${calculatedAddress}`;
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['location-h3-details', cleanH3Cell, calculatedAddress],
    queryFn: () =>
      cachedQueryFn(cacheKey, async (): Promise<LocationCellDetails | null> => {
        if (!cleanH3Cell || !calculatedAddress) return null;
        const locAddr = Address.parse(calculatedAddress);

        try {
          // 1. Batch hydrate Location contract state into IndexedDB
          await batchHydrateUniversal([locAddr], network, {
            knownTypes: { [locAddr.toString()]: 'location' },
          });

          // 2. Read from normalized contract cache
          const cacheKey = getNormalizedContractCacheKey(network, locAddr);
          const cached = await getContractCache<any>(cacheKey);
          const store = cached?.data;

          if (store && store.$ === 'LocationStore') {
            const memberAddrs: string[] = [];
            if (store.members && typeof store.members.keys === 'function') {
              for (const k of store.members.keys()) {
                memberAddrs.push(k.toString());
              }
            }

            return {
              h3Cell: store.h3Cell || cleanH3Cell,
              contractAddress: calculatedAddress,
              memberCount: Number(store.memberCount ?? memberAddrs.length),
              version:
                store.version !== null && store.version !== undefined
                  ? Number(store.version)
                  : null,
              minterAddress: store.minterAddress
                ? store.minterAddress.toString()
                : null,
              members: memberAddrs,
              isDeployed: true,
            };
          }

          // Fallback: contract not yet deployed on-chain
          return {
            h3Cell: cleanH3Cell,
            contractAddress: calculatedAddress,
            memberCount: 0,
            version: null,
            minterAddress: null,
            members: [],
            isDeployed: false,
          };
        } catch {
          return {
            h3Cell: cleanH3Cell,
            contractAddress: calculatedAddress,
            memberCount: 0,
            version: null,
            minterAddress: null,
            members: [],
            isDeployed: false,
          };
        }
      }),
    enabled: Boolean(cleanH3Cell && calculatedAddress),
  });

  return {
    data: data ?? null,
    calculatedAddress,
    isLoading,
    refetch: createRefetchWrapper(cacheKey, refetch),
  };
}

export function useLocation(
  locationAddressString: string | null,
): UseLocationResult {
  const cacheKey = `location-info:${locationAddressString ?? 'none'}`;
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['location-info', locationAddressString],
    queryFn: () =>
      cachedQueryFn(cacheKey, async () => {
        if (!locationAddressString) return null;
        const locAddr = Address.parse(locationAddressString);

        try {
          // 1. Batch hydrate Location contract state into IndexedDB
          await batchHydrateUniversal([locAddr], network, {
            knownTypes: { [locAddr.toString()]: 'location' },
          });

          // 2. Read from normalized contract cache
          const cacheKey = getNormalizedContractCacheKey(network, locAddr);
          const cached = await getContractCache<any>(cacheKey);
          const store = cached?.data;

          if (store && store.$ === 'LocationStore') {
            const memberAddrs: string[] = [];
            if (store.members && typeof store.members.keys === 'function') {
              for (const k of store.members.keys()) {
                memberAddrs.push(k.toString());
              }
            }

            return {
              h3Cell: store.h3Cell ?? null,
              memberCount: Number(store.memberCount ?? memberAddrs.length),
              version:
                store.version !== null && store.version !== undefined
                  ? Number(store.version)
                  : null,
              minterAddress: store.minterAddress
                ? store.minterAddress.toString()
                : null,
              members: memberAddrs,
              isDeployed: true,
            };
          }

          return null;
        } catch {
          return null;
        }
      }),
    enabled: Boolean(locationAddressString),
  });

  return {
    location: data ?? null,
    isLoading,
    refetch: createRefetchWrapper(cacheKey, refetch),
  };
}

// Backwards compatibility alias
export const useCities = useLocation;
