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
import { FossFiWallet } from '@wrappers/FossFiWallet.gen';
import { formatTonAddress, type AddressNetwork } from '@/core/utils/formatters';

export interface MemberProfileInfo {
  address: string;
  username: string;
  h3Cell: string;
  country: number;
  active: boolean;
  jettonBalance: bigint;
  status: number;
}

export function useMemberProfiles(
  addresses: (Address | string)[],
  network: AddressNetwork = 'testnet',
) {
  const addressStrings = addresses
    .map((a) => {
      try {
        const addr = typeof a === 'string' ? Address.parse(a) : a;
        return formatTonAddress(addr, { isContract: true, network });
      } catch {
        return typeof a === 'string' ? a : '';
      }
    })
    .filter(Boolean)
    .sort();

  const key = addressStrings.join(',');

  return useQuery<Record<string, MemberProfileInfo>>({
    queryKey: ['member-profiles', network, key],
    queryFn: async () => {
      if (addressStrings.length === 0) return {};
      const client = getTonClient(
        network === 'mainnet' ? 'mainnet' : 'testnet',
      );
      const results: Record<string, MemberProfileInfo> = {};

      await Promise.all(
        addressStrings.map(async (addrStr) => {
          try {
            const addr = Address.parse(addrStr);
            const contract = client.open(FossFiWallet.fromAddress(addr));
            const store = await contract.getWalletDataAll();
            results[addrStr] = {
              address: addrStr,
              username: store.profile?.ref?.username ?? '',
              h3Cell: store.profile?.ref?.h3Cell ?? '',
              country: store.profile?.ref?.country
                ? Number(store.profile.ref.country)
                : 0,
              active: Boolean(store.active),
              jettonBalance: store.jettonBalance ?? 0n,
              status: store.status ? Number(store.status) : 0,
            };
          } catch (e) {
            console.warn(
              `[useMemberProfiles] Could not fetch profile for ${addrStr}:`,
              e,
            );
            results[addrStr] = {
              address: addrStr,
              username: '',
              h3Cell: '',
              country: 0,
              active: false,
              jettonBalance: 0n,
              status: 0,
            };
          }
        }),
      );

      return results;
    },
    enabled: addressStrings.length > 0,
    staleTime: 5 * 60 * 1000,
  });
}
