/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useMemo } from 'react';
import { Address } from '@ton/core';
import { useQuery } from '@tanstack/react-query';
import { getFiWalletStateByContractAddress } from '@/lib/brotherhood/ton';
import { useFormatAddress, formatTonAddress } from '@/core/utils/formatters';

export interface RingInviteeEntry {
  address: Address;
  addressString: string;
  amount: bigint;
}

export interface UseRingInviteesResult {
  invitees: RingInviteeEntry[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useRingInvitees(
  circleMemberAddress: Address | string | null,
  enabled = true,
): UseRingInviteesResult {
  const { network } = useFormatAddress();

  const parsedAddress = useMemo(() => {
    if (!circleMemberAddress) return null;
    if (typeof circleMemberAddress === 'string') {
      try {
        return Address.parse(circleMemberAddress.trim());
      } catch {
        return null;
      }
    }
    return circleMemberAddress;
  }, [circleMemberAddress]);

  const key = parsedAddress?.toString() ?? 'none';

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['ring-invitees', network, key],
    queryFn: async () => {
      if (!parsedAddress) return [];
      const net = network === 'mainnet' ? 'mainnet' : 'testnet';
      const store = await getFiWalletStateByContractAddress(parsedAddress, net);
      const invitedMap = store.maps?.ref?.invited;
      if (!invitedMap) return [];

      const list: RingInviteeEntry[] = [];
      try {
        const keys = invitedMap.keys();
        for (const k of keys) {
          const amount = invitedMap.get(k) ?? 0n;
          list.push({
            address: k,
            addressString: formatTonAddress(k, {
              isContract: true,
              network,
            }),
            amount,
          });
        }
      } catch {
        /* dictionary parse error */
      }
      return list;
    },
    enabled: enabled && !!parsedAddress,
    staleTime: 5 * 60 * 1000,
  });

  return {
    invitees: data ?? [],
    isLoading,
    error: error instanceof Error ? error : null,
    refetch,
  };
}
