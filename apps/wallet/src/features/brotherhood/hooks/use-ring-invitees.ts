/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useMemo } from 'react';
import { Address } from '@ton/core';
import { useFormatAddress, formatTonAddress } from '@/core/utils/formatters';
import { useContractState } from '@/lib/brotherhood/contract-cache';

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
  const net = network === 'mainnet' ? 'mainnet' : 'testnet';

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

  const { data: store, isLoading } = useContractState<any>(
    enabled ? parsedAddress : null,
    net,
  );

  const invitees = useMemo<RingInviteeEntry[]>(() => {
    if (!store) return [];
    const invitedMap = store.maps?.ref?.invited;
    if (!invitedMap) return [];

    const list: RingInviteeEntry[] = [];
    try {
      const keys =
        typeof invitedMap.keys === 'function' ? invitedMap.keys() : [];
      for (const k of keys) {
        const amount =
          (typeof invitedMap.get === 'function' ? invitedMap.get(k) : 0n) ?? 0n;
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
  }, [store, network]);

  return {
    invitees,
    isLoading: enabled && isLoading && !!parsedAddress,
    error: null,
    refetch: () => {},
  };
}
