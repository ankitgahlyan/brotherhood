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
import { Location } from '@wrappers/Location.gen';
import { network } from '@/lib/brotherhood/config';

export interface LocationInfo {
  h3Cell: string | null;
  memberCount: number | null;
  version: number | null;
  minterAddress: string | null;
}

export interface UseLocationResult {
  location: LocationInfo | null;
  isLoading: boolean;
  refetch: () => void;
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

      const [h3Cell, memberCount, version, minterAddress] = await Promise.all([
        locationContract.getH3Cell().catch(() => null),
        locationContract.getMemberCount().catch(() => null),
        locationContract.getVersion().catch(() => null),
        locationContract.getMinterAddress().catch(() => null),
      ]);

      return {
        h3Cell,
        memberCount: memberCount !== null ? Number(memberCount) : null,
        version: version !== null ? Number(version) : null,
        minterAddress: minterAddress ? minterAddress.toString() : null,
      };
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
