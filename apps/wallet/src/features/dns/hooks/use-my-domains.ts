/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useCallback, useEffect, useState } from 'react';
import { Address } from '@ton/core';
import { getFiWalletAddress, toncenterApiKey } from '@/lib/brotherhood/ton';
import { rateLimitedFetch } from '@/lib/brotherhood/rate-limiter';
import { batchFetchAccountStates } from '@/lib/brotherhood/account-state-hydrator';
import {
  BRO_COLLECTION_RESOLVER,
  type Network,
} from '@/lib/brotherhood/config';
import { deriveDnsItemAddress, parseDnsItemAccountState } from '@/core/lib/dns';
import { useContactBookStore } from '@/core/storage/useContactBookStore';
import {
  useDnsStore,
  selectOwnedDomains,
  type OwnedDomain,
} from '../store/dns-store';
import { ONE_YEAR_SEC } from '../lib/dns-bodies';

const MY_DOMAINS_TTL_MS = 5 * 60 * 1000; // 5-minute session TTL cache

// Module-level session/TTL cache keyed by `${network}:${canonicalWalletAddress}`
const myDomainsSessionCache = new Map<string, number>();
const inFlightMyDomainsRefresh = new Map<string, Promise<void>>();
const broCollectionSyncCache = new Map<string, number>();
const inFlightBroCollectionSync = new Map<string, Promise<void>>();

export function clearMyDomainsSessionCache(): void {
  myDomainsSessionCache.clear();
  broCollectionSyncCache.clear();
}

const TONCENTER_V3_BASE: Record<'mainnet' | 'testnet', string> = {
  mainnet: 'https://toncenter.com/api/v3',
  testnet: 'https://testnet.toncenter.com/api/v3',
};

export interface MyDomainsResult {
  domains: OwnedDomain[];
  isRefreshing: boolean;
  refresh: () => Promise<void>;
}

function sameRawAddress(
  a: string | null | undefined,
  b: string | null | undefined,
): boolean {
  if (!a || !b) return false;
  try {
    return Address.parse(a).equals(Address.parse(b));
  } catch {
    return a.trim().toLowerCase() === b.trim().toLowerCase();
  }
}

function toWalletCacheKey(network: Network, walletAddress: string): string {
  try {
    return `${network}:${Address.parse(walletAddress).toRawString()}`;
  } catch {
    return `${network}:${walletAddress.trim().toLowerCase()}`;
  }
}

function syncParsedDnsContactToBook(
  domainName: string,
  ownerAddress: string | null | undefined,
  walletRecord: string | null | undefined,
  contactLink: string | null | undefined,
  network: Network,
): void {
  const fullDomain = domainName.toLowerCase().endsWith('.bro')
    ? domainName.toLowerCase()
    : `${domainName.toLowerCase()}.bro`;
  const saveDnsDomain = useContactBookStore.getState().saveDnsDomain;
  const targets = new Set<string>();

  for (const rawTarget of [ownerAddress, walletRecord]) {
    if (!rawTarget) continue;
    targets.add(rawTarget);
    try {
      const fiWallet = getFiWalletAddress(
        Address.parse(rawTarget),
        network,
      ).toString({
        bounceable: true,
        testOnly: network === 'testnet',
      });
      targets.add(fiWallet);
    } catch {
      /* ignore invalid address */
    }
  }

  for (const target of targets) {
    saveDnsDomain(target, fullDomain, network, contactLink ?? undefined);
  }
}

async function fetchBroCollectionNftAddresses(
  walletAddress: string | null | undefined,
  network: Network,
): Promise<string[]> {
  const netKey = network === 'mainnet' ? 'mainnet' : 'testnet';
  const base = TONCENTER_V3_BASE[netKey];
  const apiKey = toncenterApiKey(network);
  const headers: Record<string, string> = {};
  if (apiKey) {
    headers['X-API-Key'] = apiKey;
  }

  const testOnly = network === 'testnet';
  const result = new Set<string>();

  const queries: URLSearchParams[] = [];
  if (walletAddress) {
    queries.push(
      new URLSearchParams({
        owner_address: walletAddress,
        collection_address: BRO_COLLECTION_RESOLVER,
        limit: '100',
        offset: '0',
      }),
    );
  }
  // Also fetch recent items in the collection so domains in active/ended auction
  // and member domains across the collection are discovered
  queries.push(
    new URLSearchParams({
      collection_address: BRO_COLLECTION_RESOLVER,
      limit: '100',
      offset: '0',
    }),
  );

  for (const params of queries) {
    try {
      const res = await rateLimitedFetch(
        `${base}/nft/items?${params.toString()}`,
        { headers },
      );
      if (!res.ok) continue;
      const data = (await res.json()) as {
        nft_items?: { address?: string }[];
      };
      if (!Array.isArray(data.nft_items)) continue;
      for (const item of data.nft_items) {
        if (item?.address) {
          try {
            result.add(
              Address.parse(item.address).toString({
                bounceable: true,
                testOnly,
              }),
            );
          } catch {
            /* ignore invalid address */
          }
        }
      }
    } catch {
      /* ignore network error */
    }
  }

  return Array.from(result);
}

/**
 * Ensures all recent .bro collection domains on `network` are hydrated into
 * `useContactBookStore` (including their `contactLink` for ThatsApp/Briar/Telegram),
 * even before the user visits the `/dns` screen.
 */
export async function syncBroCollectionContacts(
  network: Network,
  force = false,
): Promise<void> {
  const now = Date.now();
  const lastSynced = broCollectionSyncCache.get(network) ?? 0;
  if (!force && now - lastSynced < MY_DOMAINS_TTL_MS) {
    return;
  }
  const inFlight = inFlightBroCollectionSync.get(network);
  if (!force && inFlight) {
    await inFlight;
    return;
  }
  broCollectionSyncCache.set(network, now);
  const promise = (async () => {
    try {
      const testOnly = network === 'testnet';
      const collectionAddr = Address.parse(BRO_COLLECTION_RESOLVER);
      const genesisNftAddr = deriveDnsItemAddress(
        collectionAddr,
        'genesis',
        testOnly,
      );
      const indexedAddresses = await fetchBroCollectionNftAddresses(
        null,
        network,
      );
      const candidateSet = new Set<string>(indexedAddresses);
      candidateSet.add(genesisNftAddr);
      const candidates = Array.from(candidateSet);
      if (candidates.length === 0) return;

      const batch = await batchFetchAccountStates(candidates, network, 30, {
        force,
      });
      for (const acc of batch.accounts) {
        if (acc.status !== 'active' || !acc.data_boc) continue;
        const parsed = parseDnsItemAccountState(acc.data_boc, network);
        if (!parsed || !parsed.isInitialized || !parsed.domainName) continue;
        syncParsedDnsContactToBook(
          parsed.domainName,
          parsed.ownerAddress,
          parsed.walletRecord,
          parsed.contactLink,
          network,
        );
      }
    } catch {
      /* ignore background sync errors */
    } finally {
      inFlightBroCollectionSync.delete(network);
    }
  })();
  inFlightBroCollectionSync.set(network, promise);
  await promise;
}

/**
 * Returns owned domains from the local Zustand store, discovers any on-chain
 * .bro domains owned by walletAddress (including genesis.bro and active/ended auctions),
 * migrates any stale pre-upgrade NFT addresses by re-deriving from domain name,
 * and prunes destroyed or non-existent domains from localStorage.
 * Uses a module-level session/TTL cache so tab switches do not re-fetch;
 * explicit `refresh()` (hard refresh) bypasses the TTL cache for both NFTs and accountStates.
 */
export function useMyDomains(
  network: Network,
  walletAddress: string | null | undefined,
): MyDomainsResult {
  const domains = useDnsStore((s) => selectOwnedDomains(s, network));
  const addDomain = useDnsStore((s) => s.addDomain);
  const updateDomain = useDnsStore((s) => s.updateDomain);
  const removeDomain = useDnsStore((s) => s.removeDomain);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const runRefresh = useCallback(
    async (force = false) => {
      if (!walletAddress) return;

      const cacheKey = toWalletCacheKey(network, walletAddress);
      const now = Date.now();
      const lastFetchedAt = myDomainsSessionCache.get(cacheKey) ?? 0;

      if (!force && now - lastFetchedAt < MY_DOMAINS_TTL_MS) {
        return;
      }

      const existingInFlight = inFlightMyDomainsRefresh.get(cacheKey);
      if (!force && existingInFlight) {
        await existingInFlight;
        return;
      }

      setIsRefreshing(true);
      myDomainsSessionCache.set(cacheKey, now);
      broCollectionSyncCache.set(network, now);

      const refreshPromise = (async () => {
        try {
          const testOnly = network === 'testnet';
          const collectionAddr = Address.parse(BRO_COLLECTION_RESOLVER);
          const genesisNftAddr = deriveDnsItemAddress(
            collectionAddr,
            'genesis',
            testOnly,
          );

          // Step 1: Migrate any stored domain whose nftAddress was derived with stale DnsItem code
          const storedBefore =
            useDnsStore.getState().domainsByNetwork[network] ?? [];
          for (const d of storedBefore) {
            if (!d.name || (d.zone && d.zone !== 'bro')) continue;
            try {
              const expectedAddr = deriveDnsItemAddress(
                collectionAddr,
                d.name.trim().toLowerCase(),
                testOnly,
              );
              if (!sameRawAddress(d.nftAddress, expectedAddr)) {
                removeDomain(d.nftAddress, network);
                addDomain(
                  {
                    ...d,
                    nftAddress: expectedAddr,
                  },
                  network,
                );
              }
            } catch {
              /* ignore invalid domain name */
            }
          }

          const currentDomains =
            useDnsStore.getState().domainsByNetwork[network] ?? [];
          const indexedAddresses = await fetchBroCollectionNftAddresses(
            walletAddress,
            network,
          );

          const candidateSet = new Set<string>();
          for (const d of currentDomains) {
            candidateSet.add(d.nftAddress);
          }
          for (const addr of indexedAddresses) {
            candidateSet.add(addr);
          }
          candidateSet.add(genesisNftAddr);

          const candidates = Array.from(candidateSet);
          if (candidates.length === 0) return;

          const batch = await batchFetchAccountStates(candidates, network, 30, {
            force,
          });
          const nowSec = Math.floor(Date.now() / 1000);
          const activeAddressMap = new Map<
            string,
            (typeof batch.accounts)[number]
          >();

          for (const acc of batch.accounts) {
            if (acc.status === 'active' && acc.data_boc) {
              try {
                const raw = Address.parse(acc.address).toRawString();
                activeAddressMap.set(raw, acc);
              } catch {
                /* ignore invalid address */
              }
            }
          }

          // Step 2: Prune stored domains that do not exist on-chain (destroyed or failed tx)
          // Allow a 45-second grace window for newly broadcast optimistic registrations
          const latestBeforePrune =
            useDnsStore.getState().domainsByNetwork[network] ?? [];
          for (const d of latestBeforePrune) {
            try {
              const raw = Address.parse(d.nftAddress).toRawString();
              if (!activeAddressMap.has(raw)) {
                const ageSec = nowSec - (d.registeredAt ?? 0);
                if (ageSec > 45) {
                  removeDomain(d.nftAddress, network);
                }
              }
            } catch {
              removeDomain(d.nftAddress, network);
            }
          }

          // Step 3: Hydrate active on-chain domains
          for (const acc of activeAddressMap.values()) {
            if (!acc.data_boc) continue;

            let canonicalBounceable: string;
            try {
              canonicalBounceable = Address.parse(acc.address).toString({
                bounceable: true,
                testOnly,
              });
            } catch {
              continue;
            }

            const parsed = parseDnsItemAccountState(acc.data_boc, network);
            if (!parsed || !parsed.isInitialized) continue;

            if (parsed.domainName) {
              syncParsedDnsContactToBook(
                parsed.domainName,
                parsed.ownerAddress,
                parsed.walletRecord,
                parsed.contactLink,
                network,
              );
            }

            const latestList =
              useDnsStore.getState().domainsByNetwork[network] ?? [];
            const existing = latestList.find((d) =>
              sameRawAddress(d.nftAddress, canonicalBounceable),
            );

            const isOwnedByMe = sameRawAddress(
              parsed.ownerAddress,
              walletAddress,
            );
            const isBidByMe = sameRawAddress(
              parsed.auction?.maxBidAddress,
              walletAddress,
            );
            const hasOwner = Boolean(parsed.ownerAddress);

            if (existing) {
              if (!isOwnedByMe && !isBidByMe) {
                removeDomain(existing.nftAddress, network);
                continue;
              }

              updateDomain(
                existing.nftAddress,
                {
                  name: parsed.domainName || existing.name,
                  lastFillUpTime: parsed.lastFillUpTime,
                  walletRecord: parsed.walletRecord ?? undefined,
                  contactLink: parsed.contactLink ?? undefined,
                  channelLink: parsed.channelLink ?? undefined,
                  isOutdated: false,
                  auctionEndTime: parsed.auction?.auctionEndTime,
                  maxBidAddress: parsed.auction?.maxBidAddress,
                  isAuctionActive: parsed.auction?.isActive ?? false,
                  isAuctionEnded: parsed.auction?.isEnded ?? false,
                  hasOwner,
                },
                network,
              );
            } else if ((isOwnedByMe || isBidByMe) && parsed.domainName) {
              addDomain(
                {
                  name: parsed.domainName,
                  zone: 'bro',
                  nftAddress: canonicalBounceable,
                  registeredAt: parsed.lastFillUpTime || nowSec,
                  lastFillUpTime: parsed.lastFillUpTime,
                  walletRecord: parsed.walletRecord ?? undefined,
                  contactLink: parsed.contactLink ?? undefined,
                  channelLink: parsed.channelLink ?? undefined,
                  isOutdated: false,
                  auctionEndTime: parsed.auction?.auctionEndTime,
                  maxBidAddress: parsed.auction?.maxBidAddress,
                  isAuctionActive: parsed.auction?.isActive ?? false,
                  isAuctionEnded: parsed.auction?.isEnded ?? false,
                  hasOwner,
                },
                network,
              );
            }
          }
        } catch {
          /* ignore refresh errors */
        } finally {
          inFlightMyDomainsRefresh.delete(cacheKey);
          setIsRefreshing(false);
        }
      })();

      inFlightMyDomainsRefresh.set(cacheKey, refreshPromise);
      await refreshPromise;
    },
    [walletAddress, network, addDomain, updateDomain, removeDomain],
  );

  useEffect(() => {
    queueMicrotask(() => {
      void runRefresh(false);
    });
  }, [runRefresh]);

  const refresh = useCallback(async () => {
    await runRefresh(true);
  }, [runRefresh]);

  return { domains, isRefreshing, refresh };
}

/**
 * Returns whether a domain is expired given its lastFillUpTime.
 */
export function isDomainExpired(domain: OwnedDomain): boolean {
  if (!domain.lastFillUpTime) return false;
  return Math.floor(Date.now() / 1000) > domain.lastFillUpTime + ONE_YEAR_SEC;
}

/**
 * Returns seconds until a domain expires, or 0 if already expired.
 */
export function domainExpirySeconds(domain: OwnedDomain): number {
  if (!domain.lastFillUpTime) return ONE_YEAR_SEC;
  const expiresAt = domain.lastFillUpTime + ONE_YEAR_SEC;
  return Math.max(0, expiresAt - Math.floor(Date.now() / 1000));
}

/**
 * Returns seconds left in an active auction, or 0 if expired/not in auction.
 */
export function domainAuctionSecondsLeft(domain: OwnedDomain): number {
  if (!domain.auctionEndTime) return 0;
  return Math.max(0, domain.auctionEndTime - Math.floor(Date.now() / 1000));
}
