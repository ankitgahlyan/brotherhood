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

export interface UseLocationMembersResult {
  h3Cell: string | null;
  members: string[];
  isTargetMember: boolean | null;
  isLoading: boolean;
  refetch: () => void;
}

export function useLocationMembers(
  locationAddressString: string | null,
  targetMemberAddressString?: string | null,
): UseLocationMembersResult {
  const { data, isLoading, refetch } = useQuery({
    queryKey: [
      'location-members',
      locationAddressString,
      targetMemberAddressString,
    ],
    queryFn: async () => {
      if (!locationAddressString) return null;
      const locAddr = Address.parse(locationAddressString);
      const client = getTonClient(network);
      const locationContract = client.open(Location.fromAddress(locAddr));

      const [h3Cell, dict] = await Promise.all([
        locationContract.getH3Cell().catch(() => null),
        locationContract.getMembers().catch(() => null),
      ]);

      let isTargetMember: boolean | null = null;
      if (targetMemberAddressString) {
        try {
          const target = Address.parse(targetMemberAddressString);
          isTargetMember = await locationContract.getIsMember(target);
        } catch {
          isTargetMember = false;
        }
      }

      const memberAddrs: string[] = [];
      if (dict) {
        for (const key of dict.keys()) {
          memberAddrs.push(key.toString());
        }
      }

      return {
        h3Cell,
        members: memberAddrs,
        isTargetMember,
      };
    },
    enabled: Boolean(locationAddressString),
  });

  return {
    h3Cell: data?.h3Cell ?? null,
    members: data?.members ?? [],
    isTargetMember: data?.isTargetMember ?? null,
    isLoading,
    refetch,
  };
}

// Backwards compatibility alias
export const useCityMembers = useLocationMembers;
