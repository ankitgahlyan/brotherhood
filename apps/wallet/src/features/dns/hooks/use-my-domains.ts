/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Address } from '@ton/core';
import { useWalletStoreApi } from '@demo/wallet-core';
import { batchFetchAccountStates } from '@/lib/brotherhood/account-state-hydrator';
import {
  setContractCache,
  getNormalizedContractCacheKey,
} from '@/lib/brotherhood/contract-cache';
import {
  BRO_COLLECTION_RESOLVER,
  type Network,
} from '@/lib/brotherhood/config';
import { deriveDnsItemAddress, parseDnsItemAccountState } from '@/core/lib/dns';
import { useContactBookStore } from '@/core/storage/useContactBookStore';
import {
  useDnsStore,
  selectOwnedDomains,
  EMPTY_DOMAINS,
  type OwnedDomain,
} from '../store/dns-store';
import {
  CONTRACT_CODE_HASHES,
  normalizeCodeHash,
} from '@/lib/brotherhood/account-hydrator.worker';
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

function isDomainForWallet(
  d: OwnedDomain,
  walletAddress: string | null | undefined,
): boolean {
  if (!walletAddress) return false;
  if (d.ownerAddress) {
    return sameRawAddress(d.ownerAddress, walletAddress);
  }
  if (d.maxBidAddress) {
    return sameRawAddress(d.maxBidAddress, walletAddress);
  }
  if (d.walletRecord) {
    return sameRawAddress(d.walletRecord, walletAddress);
  }
  return false;
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
  const target = walletRecord || ownerAddress;
  if (target) {
    saveDnsDomain(target, fullDomain, network, contactLink ?? undefined);
  }
}

/**
 * Extracts `.bro` DNS NFT item addresses directly from the already-cached `nftsSlice`
 * (`nftsByAddress` and `userNfts`) by matching `collection.address` against `BRO_COLLECTION_RESOLVER`
 * or `.bro` domain metadata — avoiding any separate `/nft/items?collection_address=...` network call.
 */
export function extractBroNftAddressesFromNftsStore(
  walletAddress: string | null | undefined,
  network: Network,
  providedNftsState?: {
    nftsByAddress?: Record<string, any[]>;
    userNfts?: any[];
  } | null,
  providedActiveAddress?: string | null,
): string[] {
  const testOnly = network === 'testnet';
  const result = new Set<string>();
  let nftsState = providedNftsState ?? null;
  let activeAddr = providedActiveAddress ?? null;

  if (!nftsState && typeof window !== 'undefined') {
    try {
      const raw = window.localStorage?.getItem('bro-store');
      if (raw) {
        const parsed = JSON.parse(raw);
        nftsState = parsed?.state?.nfts ?? null;
        if (!activeAddr) {
          activeAddr = parsed?.state?.walletManagement?.address ?? null;
        }
      }
    } catch {
      /* ignore localStorage parse error */
    }
  }

  if (!nftsState) return [];

  const listsToScan: any[][] = [];
  const byAddr = nftsState.nftsByAddress || {};

  if (walletAddress) {
    for (const [key, list] of Object.entries(byAddr)) {
      if (sameRawAddress(key, walletAddress) && Array.isArray(list)) {
        listsToScan.push(list);
      }
    }
    if (
      sameRawAddress(activeAddr, walletAddress) &&
      Array.isArray(nftsState.userNfts)
    ) {
      listsToScan.push(nftsState.userNfts);
    }
  } else {
    for (const list of Object.values(byAddr)) {
      if (Array.isArray(list)) {
        listsToScan.push(list);
      }
    }
    if (Array.isArray(nftsState.userNfts)) {
      listsToScan.push(nftsState.userNfts);
    }
  }

  for (const list of listsToScan) {
    for (const item of list) {
      if (!item?.address) continue;
      const collectionAddr =
        item.collection?.address ?? item.collectionAddress ?? null;
      const itemName = String(
        item.dns ?? item.info?.name ?? item.name ?? '',
      ).toLowerCase();
      const isBroCollection =
        sameRawAddress(collectionAddr, BRO_COLLECTION_RESOLVER) ||
        itemName.endsWith('.bro');
      if (!isBroCollection) continue;

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

  return Array.from(result);
}

/**
 * Ensures `.bro` domains discovered from cached NFTs and `useDnsStore` are synced into
 * `useContactBookStore` (including their `contactLink` for ThatsApp/Briar/Telegram).
 * LocalStorage-first: if `useDnsStore` or `useContactBookStore` already has persisted
 * `.bro` domains/contacts for `network` and `force === false`, skips network fetching completely.
 */
export function getBroCollectionSyncCandidates(
  network: Network,
  force = false,
): string[] {
  const collectionHydratedKey = `${network}:__collection__`;
  const dnsState = useDnsStore.getState();
  const storedDomains = dnsState.domainsByNetwork[network] ?? [];
  const contactsMap =
    useContactBookStore.getState().contactsByNetwork[network] ?? {};
  const hasCachedDnsContacts = Object.values(contactsMap).some((c) =>
    Boolean(c?.dnsDomain || (c?.dnsDomains && c.dnsDomains.length > 0)),
  );
  const broNftsFromStore = extractBroNftAddressesFromNftsStore(null, network);
  const untrackedBroNfts = broNftsFromStore.filter(
    (addr) => !storedDomains.some((d) => sameRawAddress(d.nftAddress, addr)),
  );

  // Sync any already-stored domains into contact book synchronously (0ms, zero network)
  for (const d of storedDomains) {
    if (d.name) {
      syncParsedDnsContactToBook(
        d.name,
        d.ownerAddress,
        d.walletRecord,
        d.contactLink,
        network,
      );
    }
  }

  if (
    !force &&
    (storedDomains.length > 0 ||
      hasCachedDnsContacts ||
      Boolean(dnsState.hydratedKeys?.[collectionHydratedKey])) &&
    untrackedBroNfts.length === 0
  ) {
    return [];
  }

  const now = Date.now();
  const lastSynced = broCollectionSyncCache.get(network) ?? 0;
  if (!force && now - lastSynced < MY_DOMAINS_TTL_MS) {
    return [];
  }

  const testOnly = network === 'testnet';
  const collectionAddr = Address.parse(BRO_COLLECTION_RESOLVER);
  const genesisNftAddr = deriveDnsItemAddress(
    collectionAddr,
    'genesis',
    testOnly,
  );
  const candidateSet = new Set<string>(broNftsFromStore);
  for (const d of storedDomains) {
    if (d.nftAddress) candidateSet.add(d.nftAddress);
  }
  candidateSet.add(genesisNftAddr);
  return Array.from(candidateSet);
}

export async function syncBroCollectionContacts(
  network: Network,
  force = false,
  usePrehydratedCache = false,
): Promise<void> {
  const collectionHydratedKey = `${network}:__collection__`;
  const candidates = getBroCollectionSyncCandidates(network, force);
  if (candidates.length === 0) {
    return;
  }

  const inFlight = inFlightBroCollectionSync.get(network);
  if (!force && inFlight) {
    await inFlight;
    return;
  }
  broCollectionSyncCache.set(network, Date.now());
  const promise = (async () => {
    try {
      const batch = await batchFetchAccountStates(candidates, network, 30, {
        force: usePrehydratedCache ? false : force,
      });
      for (const acc of batch.accounts) {
        if (acc.status !== 'active' || !acc.data_boc) continue;
        const parsed = parseDnsItemAccountState(acc.data_boc, network);
        if (!parsed || !parsed.isInitialized || !parsed.domainName) continue;
        void setContractCache(
          getNormalizedContractCacheKey(network, acc.address),
          parsed,
          {
            codeHash: acc.code_hash,
            balance: acc.balance ?? '0',
            status: acc.status ?? 'active',
          },
        ).catch(() => {});
        syncParsedDnsContactToBook(
          parsed.domainName,
          parsed.ownerAddress,
          parsed.walletRecord,
          parsed.contactLink,
          network,
        );
      }
      useDnsStore.getState().markKeyHydrated(collectionHydratedKey);
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
 * Returns owned domains from the local Zustand store (`localStorage`-first).
 * Filters `.bro` domain NFTs directly from `nftsSlice.nftsByAddress` instead of making
 * a separate `/nft/items` call. Only fetches `accountStates` if local storage has not yet
 * been hydrated for this wallet (or has newly discovered `.bro` NFTs in `nftsByAddress`),
 * or when the user triggers manual `refresh()` (`force = true`).
 */
export function useMyDomains(
  network: Network,
  walletAddress: string | null | undefined,
): MyDomainsResult {
  const storeApi = useWalletStoreApi();
  const allDomains = useDnsStore((s) => selectOwnedDomains(s, network));
  const addDomain = useDnsStore((s) => s.addDomain);
  const updateDomain = useDnsStore((s) => s.updateDomain);
  const removeDomain = useDnsStore((s) => s.removeDomain);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const domains = useMemo(() => {
    if (!walletAddress) return EMPTY_DOMAINS;
    return allDomains.filter((d) => isDomainForWallet(d, walletAddress));
  }, [allDomains, walletAddress]);

  const runRefresh = useCallback(
    async (force = false) => {
      if (!walletAddress) return;

      const testOnly = network === 'testnet';
      const collectionAddr = Address.parse(BRO_COLLECTION_RESOLVER);

      // Step 1: Migrate any stored domain whose nftAddress was derived with stale DnsItem code (purely local)
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

      const cacheKey = toWalletCacheKey(network, walletAddress);
      const currentDomains =
        useDnsStore.getState().domainsByNetwork[network] ?? [];
      const walletDomains = currentDomains.filter((d) =>
        isDomainForWallet(d, walletAddress),
      );
      const hasUnassignedLegacyDomains = currentDomains.some(
        (d) => !d.ownerAddress && !d.maxBidAddress && !d.walletRecord,
      );
      const appState = storeApi.getState();
      const broNftsFromStore = extractBroNftAddressesFromNftsStore(
        walletAddress,
        network,
        appState?.nfts,
        appState?.walletManagement?.address,
      );
      const untrackedBroNfts = broNftsFromStore.filter(
        (addr) =>
          !walletDomains.some((d) => sameRawAddress(d.nftAddress, addr)),
      );
      const isWalletAlreadyHydrated = Boolean(
        useDnsStore.getState().hydratedKeys?.[cacheKey],
      );

      // LocalStorage-first: if already present in store for this wallet (or previously hydrated) and no new .bro NFTs in nftsByAddress, skip network unless force = true
      if (
        !force &&
        !hasUnassignedLegacyDomains &&
        (walletDomains.length > 0 || isWalletAlreadyHydrated) &&
        untrackedBroNfts.length === 0
      ) {
        return;
      }

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
          const genesisNftAddr = deriveDnsItemAddress(
            collectionAddr,
            'genesis',
            testOnly,
          );

          const candidateSet = new Set<string>();
          for (const d of currentDomains) {
            candidateSet.add(d.nftAddress);
          }
          for (const addr of broNftsFromStore) {
            candidateSet.add(addr);
          }
          candidateSet.add(genesisNftAddr);

          const candidates = Array.from(candidateSet);
          if (candidates.length === 0) return;

          const batch = await batchFetchAccountStates(candidates, network, 30, {
            force,
          });
          useDnsStore.getState().markKeyHydrated(cacheKey);
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

            void setContractCache(
              getNormalizedContractCacheKey(network, canonicalBounceable),
              parsed,
              {
                codeHash: acc.code_hash,
                balance: acc.balance ?? '0',
                status: acc.status ?? 'active',
              },
            ).catch(() => {});

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
            const expectedDnsItemHash = CONTRACT_CODE_HASHES.dnsItem;
            const isOutdated = Boolean(
              acc.code_hash &&
              expectedDnsItemHash &&
              normalizeCodeHash(acc.code_hash) !==
                normalizeCodeHash(expectedDnsItemHash),
            );

            if (existing) {
              if (!parsed.ownerAddress && !parsed.auction?.maxBidAddress) {
                removeDomain(existing.nftAddress, network);
                continue;
              }

              updateDomain(
                existing.nftAddress,
                {
                  name: parsed.domainName || existing.name,
                  ownerAddress: parsed.ownerAddress ?? null,
                  lastFillUpTime: parsed.lastFillUpTime,
                  walletRecord: parsed.walletRecord ?? undefined,
                  contactLink: parsed.contactLink ?? undefined,
                  channelLink: parsed.channelLink ?? undefined,
                  isOutdated,
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
                  ownerAddress: parsed.ownerAddress ?? null,
                  registeredAt: parsed.lastFillUpTime || nowSec,
                  lastFillUpTime: parsed.lastFillUpTime,
                  walletRecord: parsed.walletRecord ?? undefined,
                  contactLink: parsed.contactLink ?? undefined,
                  channelLink: parsed.channelLink ?? undefined,
                  isOutdated,
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
    [walletAddress, network, addDomain, updateDomain, removeDomain, storeApi],
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
