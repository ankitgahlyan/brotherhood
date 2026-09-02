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
import { getTonClient } from '@/lib/brotherhood/ton';
import { Location } from '@wrappers/Location.gen';
import { network, FI_ADDRESS } from '@/lib/brotherhood/config';

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

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['location-h3-details', cleanH3Cell, calculatedAddress],
    queryFn: async (): Promise<LocationCellDetails | null> => {
      if (!cleanH3Cell || !calculatedAddress) return null;
      const locAddr = Address.parse(calculatedAddress);
      const client = getTonClient(network);
      const locationContract = client.open(Location.fromAddress(locAddr));

      try {
        const [queriedH3Cell, memberCount, version, minterAddress, membersDict] =
          await Promise.all([
            locationContract.getH3Cell().catch(() => null),
            locationContract.getMemberCount().catch(() => null),
            locationContract.getVersion().catch(() => null),
            locationContract.getMinterAddress().catch(() => null),
            locationContract.getMembers().catch(() => null),
          ]);

        const isDeployed = queriedH3Cell !== null || memberCount !== null;
        const memberAddrs: string[] = [];
        if (membersDict) {
          try {
            for (const k of membersDict.keys()) {
              memberAddrs.push(k.toString());
            }
          } catch {
            /* ignore dict parse error */
          }
        }

        return {
          h3Cell: queriedH3Cell ?? cleanH3Cell,
          contractAddress: calculatedAddress,
          memberCount: memberCount !== null ? Number(memberCount) : 0,
          version: version !== null ? Number(version) : null,
          minterAddress: minterAddress ? minterAddress.toString() : null,
          members: memberAddrs,
          isDeployed,
        };
      } catch {
        // Contract not yet deployed on-chain or network error
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
    },
    enabled: Boolean(cleanH3Cell && calculatedAddress),
  });

  return {
    data: data ?? null,
    calculatedAddress,
    isLoading,
    refetch,
  };
}

export function useLocation(
  locationAddressString: string | null,
): UseLocationResult {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['location-info', locationAddressString],
    queryFn: async () => {
      if (!locationAddressString) return null;
      const locAddr = Address.parse(locationAddressString);
      const client = getTonClient(network);
      const locationContract = client.open(Location.fromAddress(locAddr));

      try {
        const [h3Cell, memberCount, version, minterAddress, dict] =
          await Promise.all([
            locationContract.getH3Cell().catch(() => null),
            locationContract.getMemberCount().catch(() => null),
            locationContract.getVersion().catch(() => null),
            locationContract.getMinterAddress().catch(() => null),
            locationContract.getMembers().catch(() => null),
          ]);

        const memberAddrs: string[] = [];
        if (dict) {
          try {
            for (const key of dict.keys()) {
              memberAddrs.push(key.toString());
            }
          } catch {
            /* ignore dict parse error */
          }
        }

        const isDeployed = h3Cell !== null || memberCount !== null;

        return {
          h3Cell,
          memberCount: memberCount !== null ? Number(memberCount) : null,
          version: version !== null ? Number(version) : null,
          minterAddress: minterAddress ? minterAddress.toString() : null,
          members: memberAddrs,
          isDeployed,
        };
      } catch {
        return null;
      }
    },
    enabled: Boolean(locationAddressString),
  });

  return {
    location: data ?? null,
    isLoading,
    refetch,
  };
}

// Backwards compatibility alias
export const useCities = useLocation;
