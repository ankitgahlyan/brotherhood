/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useQuery } from '@tanstack/react-query';
import { Address } from '@ton/core';
import { formatTonAddress, type AddressNetwork } from '@/core/utils/formatters';
import { cachedQueryFn, createRefetchWrapper } from '@/lib/brotherhood/queries';
import { batchHydrateUniversal } from '@/lib/brotherhood/account-state-hydrator';
import {
  getContractCache,
  getNormalizedContractCacheKey,
} from '@/lib/brotherhood/contract-cache';

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
      cachedQueryFn(cacheKey, async (options?: any) => {
        if (addressStrings.length === 0) return {};
        const net = network === 'mainnet' ? 'mainnet' : 'testnet';
        const results: Record<string, MemberProfileInfo> = {};

        // 1. Check local cache first to avoid redundant network calls
        const missingAddresses: string[] = [];
        const cachedStores: Record<string, any> = {};

        for (const addrStr of addressStrings) {
          if (!options?.forceFresh) {
            const cacheKey = getNormalizedContractCacheKey(net, addrStr);
            const cached = await getContractCache<any>(cacheKey);
            if (
              cached?.data &&
              (cached.data.$ === 'FiWalletStore' ||
                cached.data.addresses?.ref?.owner)
            ) {
              cachedStores[addrStr] = cached.data;
              continue;
            }
          }
          missingAddresses.push(addrStr);
        }

        // 2. Only batch hydrate addresses that are truly missing from cache
        let outdatedSet = new Set<string>();
        if (missingAddresses.length > 0) {
          try {
            const hydrateRes = await batchHydrateUniversal(
              missingAddresses,
              net,
            );
            outdatedSet = new Set(hydrateRes.outdatedAccounts);
          } catch (e) {
            console.warn(
              '[useMemberProfiles] Batch hydration failed for missing addresses:',
              e,
            );
          }
        }

        // 3. Populate results for all addresses from cached / freshly hydrated state
        await Promise.all(
          addressStrings.map(async (addrStr) => {
            try {
              let store = cachedStores[addrStr];
              if (!store) {
                const cacheKey = getNormalizedContractCacheKey(net, addrStr);
                const cached = await getContractCache<any>(cacheKey);
                store = cached?.data;
              }

              const ownerAddr = store?.addresses?.ref?.owner ?? null;
              const ownerAddress = ownerAddr
                ? formatTonAddress(ownerAddr, { isContract: false, network })
                : '';
              const isOutdated =
                outdatedSet.has(addrStr) ||
                (store && Boolean(store.isCodeHashOutdated));

              results[addrStr] = {
                address: addrStr,
                ownerAddress,
                username: store?.profile?.ref?.username ?? '',
                h3Cell: store?.profile?.ref?.h3Cell ?? '',
                country: store?.profile?.ref?.country
                  ? Number(store.profile.ref.country)
                  : 0,
                active: Boolean(store?.active),
                jettonBalance: store?.jettonBalance ?? 0n,
                status: store?.status ? Number(store.status) : 0,
                creditNeed: store?.creditNeed ?? 0n,
                creditMaturity: Number(store?.creditMaturity ?? 0),
                multiplier: Number(store?.multiplier ?? 1),
                isOutdatedCode: isOutdated,
              };
            } catch (e) {
              console.warn(
                `[useMemberProfiles] Could not process profile for ${addrStr}:`,
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
