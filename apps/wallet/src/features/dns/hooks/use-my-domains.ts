/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useEffect, useRef, useState } from 'react';
import { Address } from '@ton/core';
import { getTonClient } from '@/lib/brotherhood/ton';
import type { Network } from '@/lib/brotherhood/config';
import {
  useDnsStore,
  selectOwnedDomains,
  type OwnedDomain,
} from '../store/dns-store';
import { ONE_YEAR_SEC } from '../lib/dns-bodies';

const REFRESH_INTERVAL_MS = 30_000; // 30s background poll

export interface MyDomainsResult {
  domains: OwnedDomain[];
  isRefreshing: boolean;
}

/**
 * Returns owned domains from the local Zustand store and refreshes each
 * one in the background by querying on-chain state (owner, lastFillUpTime).
 */
export function useMyDomains(
  network: Network,
  walletAddress: string | null | undefined,
): MyDomainsResult {
  const domains = useDnsStore((s) => selectOwnedDomains(s, network));
  const updateDomain = useDnsStore((s) => s.updateDomain);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const lastRefreshRef = useRef(0);

  useEffect(() => {
    if (!walletAddress || domains.length === 0) return;

    const now = Date.now();
    if (now - lastRefreshRef.current < REFRESH_INTERVAL_MS) return;

    let cancelled = false;

    async function refresh() {
      setIsRefreshing(true);
      lastRefreshRef.current = Date.now();

      const client = getTonClient(network);

      await Promise.allSettled(
        domains.map(async (d) => {
          if (cancelled) return;
          try {
            const itemAddr = Address.parse(d.nftAddress);

            // Check ownership
            let ownerAddr: Address | null = null;
            try {
              const nftData = await client.callGetMethod(
                itemAddr,
                'get_nft_data',
                [],
              );
              nftData.stack.readBoolean(); // isInitialized
              nftData.stack.readBigNumber(); // index
              nftData.stack.readCell(); // collectionAddress
              try {
                const ownerSlice = nftData.stack.readCell().beginParse();
                ownerAddr =
                  ownerSlice.remainingBits > 2
                    ? ownerSlice.loadAddress()
                    : null;
              } catch {
                ownerAddr = null;
              }
            } catch {
              // contract may not be deployed yet
            }

            if (cancelled) return;

            // Remove if no longer owned by this wallet
            if (ownerAddr && walletAddress) {
              const ownerStr = ownerAddr.toString({ bounceable: false });
              try {
                const myAddr = Address.parse(walletAddress).toString({
                  bounceable: false,
                });
                if (ownerStr !== myAddr) {
                  // Transferred away — mark outdated rather than remove so
                  // user can see it was transferred
                  updateDomain(d.nftAddress, { isOutdated: true }, network);
                  return;
                }
              } catch {
                /* pass */
              }
            }

            // Fetch lastFillUpTime
            let lastFillUpTime: number | undefined;
            try {
              const res = await client.callGetMethod(
                itemAddr,
                'get_last_fill_up_time',
                [],
              );
              lastFillUpTime = res.stack.readNumber();
            } catch {
              /* pass */
            }

            if (cancelled) return;

            updateDomain(
              d.nftAddress,
              { lastFillUpTime, isOutdated: false },
              network,
            );
          } catch {
            /* ignore individual failures */
          }
        }),
      );

      if (!cancelled) setIsRefreshing(false);
    }

    void refresh();

    return () => {
      cancelled = true;
    };
  }, [domains, network, walletAddress, updateDomain]);

  return { domains, isRefreshing };
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
