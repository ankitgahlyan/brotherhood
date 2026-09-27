/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useState, useEffect, useRef } from 'react';
import { Address } from '@ton/core';
import { getTonClient } from '@/lib/brotherhood/ton';
import type { Network } from '@/lib/brotherhood/config';
import { getDnsDomainZone } from '@/core/lib/dns';
import {
  deriveDnsItemAddress,
  broTierPrice,
  broRenewalFee,
  broFiStartingBid,
  broFiRenewalFee,
  BRO_FIXED_TON_FEE,
  ONE_YEAR_SEC,
} from '../lib/dns-bodies';

export type DomainLookupStatus =
  | 'idle'
  | 'invalid'
  | 'resolving'
  | 'available'
  | 'in-auction'
  | 'auction-ended'
  | 'taken'
  | 'expired'
  | 'mainnet-only';

export interface DomainLookupResult {
  status: DomainLookupStatus;
  /** NFT item address (bounceable) — only set when status != idle/invalid */
  nftAddress?: string;
  /** Current owner address string — set when taken or expired */
  owner?: string;
  /** Registration price in nanotons (or fixed TON fee for .bro auction) */
  price?: bigint;
  /** Annual renewal fee in nanotons (legacy) */
  renewalFee?: bigint;
  /** Expiry timestamp in seconds — set when taken or expired */
  expiresAt?: number;
  /** Zone suffix matched, e.g. "bro" */
  zoneSuffix?: string;
  /** True if domain can be registered on current network */
  canRegister?: boolean;
  /** FI token starting bid for unowned .bro domains */
  fiStartingBid?: bigint;
  /** FI token annual renewal fee for .bro domains */
  fiRenewalFee?: bigint;
  /** Current highest bid in FI tokens for active or ended auction */
  currentBid?: bigint;
  /** Minimum next bid in FI tokens (>= 105% of current bid) */
  minNextBid?: bigint;
  /** Address of current highest bidder */
  maxBidAddress?: string;
  /** Unix timestamp when auction ends */
  auctionEndTime?: number;
  /** Winner address when auction has ended */
  winner?: string;
}

const DEBOUNCE_MS = 400;
/** 5-minute TTL for positive/negative lookup cache */
const LOOKUP_CACHE_TTL_MS = 5 * 60 * 1000;

interface CachedLookup {
  result: DomainLookupResult;
  timestamp: number;
}
const lookupCache = new Map<string, CachedLookup>();

/**
 * Determines if a zone is registerable on the given network.
 * Only .bro is testnet-native; all others are mainnet.
 */
function isRegisterableOnNetwork(
  zoneSuffix: string,
  network: Network,
): boolean {
  if (zoneSuffix === 'bro') return true; // available on both (testnet emulation)
  // .ton, .t.me, etc. are mainnet-only
  return network === 'mainnet';
}

/**
 * Debounced hook that looks up a domain name across TON DNS zones.
 * Derives the NFT address off-chain and queries on-chain state.
 */
export function useDomainLookup(
  rawInput: string,
  network: Network,
): DomainLookupResult {
  const [result, setResult] = useState<DomainLookupResult>({ status: 'idle' });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const input = rawInput.trim().toLowerCase();

    if (!input) {
      queueMicrotask(() => setResult({ status: 'idle' }));
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      // Resolve plain handle: append .bro
      const domain = input.includes('.') ? input : `${input}.bro`;

      const zoneMatch = getDnsDomainZone(domain);
      if (!zoneMatch) {
        setResult({ status: 'invalid' });
        return;
      }

      const { base, zone } = zoneMatch;
      const zoneSuffix = zone.suffixes[0];
      const canRegister = isRegisterableOnNetwork(zoneSuffix, network);

      if (!canRegister) {
        setResult({ status: 'mainnet-only', zoneSuffix, canRegister: false });
        return;
      }

      const cacheKey = `${network}:${domain}`;
      const cached = lookupCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < LOOKUP_CACHE_TTL_MS) {
        setResult(cached.result);
        return;
      }

      setResult({ status: 'resolving', zoneSuffix, canRegister });

      if (abortRef.current) abortRef.current.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      try {
        const collectionAddress = Address.parse(zone.resolver);
        const nftAddress = deriveDnsItemAddress(
          collectionAddress,
          base,
          network === 'testnet',
        );
        const charCount = base.length;
        const price =
          zoneSuffix === 'bro' ? broTierPrice(charCount) : undefined;
        const renewal =
          zoneSuffix === 'bro' ? broRenewalFee(charCount) : undefined;

        if (ac.signal.aborted) return;

        const client = getTonClient(network);
        const itemAddr = Address.parse(nftAddress);

        // Check if contract is deployed
        let isDeployed = false;
        try {
          const state = await client.getContractState(itemAddr);
          isDeployed = state.state === 'active';
        } catch {
          // Not deployed = available
        }

        if (ac.signal.aborted) return;

        if (!isDeployed) {
          const r: DomainLookupResult = {
            status: 'available',
            nftAddress,
            price: zoneSuffix === 'bro' ? BRO_FIXED_TON_FEE : price,
            renewalFee: renewal,
            fiStartingBid:
              zoneSuffix === 'bro' ? broFiStartingBid(charCount) : undefined,
            fiRenewalFee:
              zoneSuffix === 'bro' ? broFiRenewalFee(charCount) : undefined,
            zoneSuffix,
            canRegister,
          };
          lookupCache.set(cacheKey, { result: r, timestamp: Date.now() });
          setResult(r);
          return;
        }

        // Deployed — get owner and lastFillUpTime
        let ownerAddr: Address | null = null;
        let lastFillUp = 0;
        try {
          const nftData = await client.callGetMethod(
            itemAddr,
            'get_nft_data',
            [],
          );
          // Stack: isInitialized, index, collectionAddress, ownerAddress, content
          nftData.stack.readBoolean(); // isInitialized
          nftData.stack.readBigNumber(); // index
          nftData.stack.readCell(); // collectionAddress slice (skip)
          // ownerAddress — nullable
          try {
            const ownerSlice = nftData.stack.readCell().beginParse();
            ownerAddr =
              ownerSlice.remainingBits > 2 ? ownerSlice.loadAddress() : null;
          } catch {
            ownerAddr = null;
          }
        } catch {
          // contract may throw if data is malformed
        }

        if (ac.signal.aborted) return;

        // Check if domain is in an active or ended auction
        let maxBidAddr: Address | null = null;
        let maxBidAmount = 0n;
        let auctionEndTime = 0;

        if (!ownerAddr) {
          try {
            const auctionRes = await client.callGetMethod(
              itemAddr,
              'get_auction_info',
              [],
            );
            try {
              const bidAddrSlice = auctionRes.stack.readCell().beginParse();
              maxBidAddr =
                bidAddrSlice.remainingBits > 2
                  ? bidAddrSlice.loadAddress()
                  : null;
            } catch {
              maxBidAddr = null;
            }
            maxBidAmount = auctionRes.stack.readBigNumber();
            auctionEndTime = auctionRes.stack.readNumber();
          } catch {
            // no auction info
          }
        }

        if (ac.signal.aborted) return;

        try {
          const fillUpRes = await client.callGetMethod(
            itemAddr,
            'get_last_fill_up_time',
            [],
          );
          lastFillUp = fillUpRes.stack.readNumber();
        } catch {
          // fallback: treat as freshly filled
          lastFillUp = Math.floor(Date.now() / 1000);
        }

        if (ac.signal.aborted) return;

        const nowSec = Math.floor(Date.now() / 1000);
        let status: DomainLookupStatus;

        if (ownerAddr) {
          const expiresAt = lastFillUp + ONE_YEAR_SEC;
          const isExpired = nowSec > expiresAt;
          status = isExpired ? 'expired' : 'taken';
        } else if (auctionEndTime > 0) {
          status = nowSec < auctionEndTime ? 'in-auction' : 'auction-ended';
        } else {
          status = 'available';
        }

        const ownerStr = ownerAddr
          ? ownerAddr.toString({
              bounceable: false,
              testOnly: network === 'testnet',
            })
          : undefined;

        const maxBidStr = maxBidAddr
          ? maxBidAddr.toString({
              bounceable: false,
              testOnly: network === 'testnet',
            })
          : undefined;

        const r: DomainLookupResult = {
          status,
          nftAddress,
          owner: ownerStr,
          price:
            status === 'available'
              ? zoneSuffix === 'bro'
                ? BRO_FIXED_TON_FEE
                : price
              : BRO_FIXED_TON_FEE,
          renewalFee: renewal,
          fiStartingBid:
            zoneSuffix === 'bro' ? broFiStartingBid(charCount) : undefined,
          fiRenewalFee:
            zoneSuffix === 'bro' ? broFiRenewalFee(charCount) : undefined,
          currentBid: maxBidAmount > 0n ? maxBidAmount : undefined,
          minNextBid:
            maxBidAmount > 0n ? (maxBidAmount * 105n) / 100n : undefined,
          maxBidAddress: maxBidStr,
          auctionEndTime: auctionEndTime > 0 ? auctionEndTime : undefined,
          winner: status === 'auction-ended' ? maxBidStr : undefined,
          expiresAt: ownerAddr ? lastFillUp + ONE_YEAR_SEC : undefined,
          zoneSuffix,
          canRegister:
            (status === 'available' ||
              status === 'expired' ||
              status === 'in-auction') &&
            canRegister,
        };
        lookupCache.set(cacheKey, { result: r, timestamp: Date.now() });
        setResult(r);
      } catch (err: unknown) {
        if ((err as Error)?.name === 'AbortError') return;
        console.warn('[useDomainLookup] error:', err);
        setResult({ status: 'invalid', zoneSuffix, canRegister });
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      abortRef.current?.abort();
    };
  }, [rawInput, network]);

  return result;
}
