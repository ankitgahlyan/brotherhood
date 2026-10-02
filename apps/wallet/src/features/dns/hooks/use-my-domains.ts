/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useCallback, useEffect, useState } from 'react';
import { Address } from '@ton/core';
import { toncenterApiKey } from '@/lib/brotherhood/ton';
import { rateLimitedFetch } from '@/lib/brotherhood/rate-limiter';
import { batchFetchAccountStates } from '@/lib/brotherhood/account-state-hydrator';
import {
  BRO_COLLECTION_RESOLVER,
  type Network,
} from '@/lib/brotherhood/config';
import { deriveDnsItemAddress, parseDnsItemAccountState } from '@/core/lib/dns';
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

export function clearMyDomainsSessionCache(): void {
  myDomainsSessionCache.clear();
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

async function fetchOwnedBroNftAddresses(
  walletAddress: string,
  network: Network,
): Promise<string[]> {
  const netKey = network === 'mainnet' ? 'mainnet' : 'testnet';
  const base = TONCENTER_V3_BASE[netKey];
  const apiKey = toncenterApiKey(network);
  const headers: Record<string, string> = {};
  if (apiKey) {
    headers['X-API-Key'] = apiKey;
  }

  const params = new URLSearchParams({
    owner_address: walletAddress,
    collection_address: BRO_COLLECTION_RESOLVER,
    limit: '100',
    offset: '0',
  });

  try {
    const res = await rateLimitedFetch(
      `${base}/nft/items?${params.toString()}`,
      { headers },
    );
    if (!res.ok) return [];
    const data = (await res.json()) as {
      nft_items?: { address?: string }[];
    };
    if (!Array.isArray(data.nft_items)) return [];
    const testOnly = network === 'testnet';
    const result: string[] = [];
    for (const item of data.nft_items) {
      if (item?.address) {
        try {
          result.push(
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
    return result;
  } catch {
    return [];
  }
}

/**
 * Returns owned domains from the local Zustand store, discovers any on-chain
 * .bro domains owned by walletAddress (including genesis.bro), and refreshes
 * their on-chain state (owner, walletRecord, lastFillUpTime, auction).
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

      const refreshPromise = (async () => {
        try {
          const testOnly = network === 'testnet';
          const collectionAddr = Address.parse(BRO_COLLECTION_RESOLVER);
          const genesisNftAddr = deriveDnsItemAddress(
            collectionAddr,
            'genesis',
            testOnly,
          );

          const currentDomains =
            useDnsStore.getState().domainsByNetwork[network] ?? [];
          const indexedAddresses = await fetchOwnedBroNftAddresses(
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

          for (const acc of batch.accounts) {
            if (acc.status !== 'active' || !acc.data_boc) continue;

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
              if (hasOwner && !isOwnedByMe) {
                updateDomain(
                  existing.nftAddress,
                  {
                    isOutdated: true,
                    hasOwner: true,
                    walletRecord: parsed.walletRecord ?? undefined,
                    contactLink: parsed.contactLink ?? undefined,
                    channelLink: parsed.channelLink ?? undefined,
                  },
                  network,
                );
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
    [walletAddress, network, addDomain, updateDomain],
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
