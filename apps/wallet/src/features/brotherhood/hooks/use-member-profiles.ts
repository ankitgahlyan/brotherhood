/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Address } from '@ton/core';
import { formatTonAddress, type AddressNetwork } from '@/core/utils/formatters';
import { cachedQueryFn, createRefetchWrapper } from '@/lib/brotherhood/queries';
import { brotherhoodSynchronizer } from '@/lib/brotherhood/synchronizer';
import {
  getContractCache,
  getNormalizedContractCacheKey,
} from '@/lib/brotherhood/contract-cache';
import {
  getOnChainCachedUsername,
  saveUsernameAddressMapping,
} from '@/core/lib/contact-storage';
import {
  useContactBookStore,
  EMPTY_CONTACTS_MAP,
} from '@/core/storage/useContactBookStore';
import { useDnsStore } from '@/features/dns/store/dns-store';
import { resolveCachedDnsContact } from '@/core/utils/telegram';
import {
  projectMemberProfileInfo,
  type MemberProfileInfo,
} from '@/lib/brotherhood/domain/fi-account-projector';

export type { MemberProfileInfo };

export function useMemberProfiles(
  addresses: (Address | string)[],
  network: AddressNetwork = 'testnet',
) {
  const net = network === 'mainnet' ? 'mainnet' : 'testnet';
  const contactsForNet = useContactBookStore(
    (s) => s.contactsByNetwork[net] || EMPTY_CONTACTS_MAP,
  );
  const domainsForNet = useDnsStore((s) => s.domainsByNetwork[net]);

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
        const results: Record<string, MemberProfileInfo> = {};

        // Ensure .bro collection domains & contactLinks are reconciled via central Synchronizer
        void brotherhoodSynchronizer.reconcileDnsContacts(
          net,
          Boolean(options?.forceFresh),
        );

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
            const hydrateRes = await brotherhoodSynchronizer.reconcileContracts(
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

              const rawProfileUsername = (
                store?.profile?.ref?.username ?? ''
              ).trim();
              if (rawProfileUsername) {
                saveUsernameAddressMapping(rawProfileUsername, addrStr, net);
                if (ownerAddress) {
                  saveUsernameAddressMapping(
                    rawProfileUsername,
                    ownerAddress,
                    net,
                  );
                }
              }
              const fallbackUsername =
                rawProfileUsername ||
                (ownerAddress
                  ? getOnChainCachedUsername(ownerAddress, net)
                  : null) ||
                getOnChainCachedUsername(addrStr, net) ||
                '';

              results[addrStr] = projectMemberProfileInfo(addrStr, store, {
                network,
                fallbackUsername,
                isOutdated: outdatedSet.has(addrStr),
              });
            } catch (e) {
              console.warn(
                `[useMemberProfiles] Could not process profile for ${addrStr}:`,
                e,
              );
              results[addrStr] = projectMemberProfileInfo(addrStr, null, {
                network,
              });
            }
          }),
        );

        return results;
      }),
    enabled: addressStrings.length > 0,
  });

  const enrichedData = useMemo(() => {
    if (!query.data) return query.data;
    let changed = false;
    const next: Record<string, MemberProfileInfo> = {};
    for (const [addrKey, profile] of Object.entries(query.data)) {
      const liveDns = resolveCachedDnsContact(
        [profile.ownerAddress, profile.address],
        net,
        contactsForNet,
        domainsForNet,
      );
      const nextDnsDomain = liveDns.dnsDomain ?? profile.dnsDomain;
      const nextContactLink = liveDns.contactLink ?? profile.contactLink;
      if (
        nextDnsDomain !== profile.dnsDomain ||
        nextContactLink !== profile.contactLink
      ) {
        changed = true;
        next[addrKey] = {
          ...profile,
          dnsDomain: nextDnsDomain,
          contactLink: nextContactLink,
        };
      } else {
        next[addrKey] = profile;
      }
    }
    return changed ? next : query.data;
  }, [query.data, contactsForNet, domainsForNet, net]);

  return {
    ...query,
    data: enrichedData,
    refetch: createRefetchWrapper(cacheKey, query.refetch),
  };
}
