/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useQuery } from '@tanstack/react-query';
import { Address } from '@ton/core';
import { getFiWalletStateByContractAddress } from '@/lib/brotherhood/ton';
import { formatTonAddress, type AddressNetwork } from '@/core/utils/formatters';
import { cachedQueryFn, createRefetchWrapper } from '@/lib/brotherhood/queries';
import { batchHydrateUniversal } from '@/lib/brotherhood/account-state-hydrator';

export interface MemberProfileInfo {
  address: string;
  ownerAddress: string;
  username: string;
  h3Cell: string;
  country: number;
  active: boolean;
  jettonBalance: bigint;
  status: number;
  creditNeed: bigint;
  creditMaturity: number;
  multiplier: number;
  isOutdatedCode?: boolean;
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
  const cacheKey = `member-profiles:${network}:${key}`;

  const query = useQuery<Record<string, MemberProfileInfo>>({
    queryKey: ['member-profiles', network, key],
    queryFn: () =>
      cachedQueryFn(cacheKey, async (options) => {
        if (addressStrings.length === 0) return {};
        const net = network === 'mainnet' ? 'mainnet' : 'testnet';
        const results: Record<string, MemberProfileInfo> = {};

        // 1. Batch hydrate all account states via Toncenter v3 /api/v3/accountStates
        let outdatedSet = new Set<string>();
        try {
          const hydrateRes = await batchHydrateUniversal(addressStrings, net);
          outdatedSet = new Set(hydrateRes.outdatedAccounts);
        } catch (e) {
          console.warn(
            '[useMemberProfiles] Batch hydration failed, falling back to individual calls:',
            e,
          );
        }

        // 2. Read hydrated states from cache (or fall back gracefully)
        await Promise.all(
          addressStrings.map(async (addrStr) => {
            try {
              const addr = Address.parse(addrStr);
              const store = await getFiWalletStateByContractAddress(addr, net, {
                forceFresh: options?.forceFresh,
              });
              const ownerAddr = store.addresses?.ref?.owner ?? null;
              const ownerAddress = ownerAddr
                ? formatTonAddress(ownerAddr, { isContract: false, network })
                : '';
              const isOutdated =
                outdatedSet.has(addr.toString()) || outdatedSet.has(addrStr);
              results[addrStr] = {
                address: addrStr,
                ownerAddress,
                username: store.profile?.ref?.username ?? '',
                h3Cell: store.profile?.ref?.h3Cell ?? '',
                country: store.profile?.ref?.country
                  ? Number(store.profile.ref.country)
                  : 0,
                active: Boolean(store.active),
                jettonBalance: store.jettonBalance ?? 0n,
                status: store.status ? Number(store.status) : 0,
                creditNeed: store.creditNeed ?? 0n,
                creditMaturity: Number(store.creditMaturity ?? 0),
                multiplier: Number(store.multiplier ?? 1),
                isOutdatedCode: isOutdated,
              };
            } catch (e) {
              console.warn(
                `[useMemberProfiles] Could not fetch profile for ${addrStr}:`,
                e,
              );
              results[addrStr] = {
                address: addrStr,
                ownerAddress: '',
                username: '',
                h3Cell: '',
                country: 0,
                active: false,
                jettonBalance: 0n,
                status: 0,
                creditNeed: 0n,
                creditMaturity: 0,
                multiplier: 1,
              };
            }
          }),
        );

        return results;
      }),
    enabled: addressStrings.length > 0,
  });

  return {
    ...query,
    refetch: createRefetchWrapper(cacheKey, query.refetch),
  };
}
