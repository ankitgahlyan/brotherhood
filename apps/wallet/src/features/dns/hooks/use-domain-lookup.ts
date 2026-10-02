/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useState, useEffect, useRef } from 'react';
import { Address } from '@ton/core';
import type { Network } from '@/lib/brotherhood/config';
import { RESERVATION_PERIOD_SEC } from '@/lib/brotherhood/config';
import { batchFetchAccountStates } from '@/lib/brotherhood/account-state-hydrator';
import { getDnsDomainZone, parseDnsItemAccountState } from '@/core/lib/dns';
import {
  deriveDnsItemAddress,
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
  /** Linked wallet record address string — set when DNS wallet record is configured */
  walletRecord?: string;
  /** Linked primary social/contact link (sha256("uri")) */
  contactLink?: string;
  /** Linked secondary channel/group link (sha256("description")) */
  channelLink?: string;
  /** Fixed TON fee for .bro auction */
  price?: bigint;
  /** Expiry timestamp in seconds — set when taken or expired */
  expiresAt?: number;
  /** Zone suffix matched, e.g. "bro" */
  zoneSuffix?: string;
  /** True if domain can be registered on current network */
  canRegister?: boolean;
  /** True if collection is currently in the initial 10-minute admin-only reservation period */
  isInReservationPeriod?: boolean;
  /** Unix timestamp when the 10-minute admin reservation period ends */
  reservationEndsAt?: number;
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

export function clearDomainLookupCache(): void {
  lookupCache.clear();
}

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
 * Derives the NFT address off-chain and queries on-chain state in a single batch.
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

        if (ac.signal.aborted) return;

        // Fetch both DnsItem and DnsCollection in a single batch request
        const batch = await batchFetchAccountStates(
          [nftAddress, zone.resolver],
          network,
        );

        if (ac.signal.aborted) return;

        const nowSec = Math.floor(Date.now() / 1000);
        const itemCanonical = Address.parse(nftAddress).toString();
        const collCanonical = collectionAddress.toString();

        const itemAcc = batch.accounts.find((a) => {
          try {
            return Address.parse(a.address).toString() === itemCanonical;
          } catch {
            return false;
          }
        });
        const collAcc = batch.accounts.find((a) => {
          try {
            return Address.parse(a.address).toString() === collCanonical;
          } catch {
            return false;
          }
        });

        let isInReservationPeriod = false;
        let reservationEndsAt: number | undefined;
        if (collAcc && collAcc.status === 'active' && collAcc.data_boc) {
          try {
            const { Cell } = await import('@ton/core');
            const cs = Cell.fromBase64(collAcc.data_boc).beginParse();
            cs.loadAddress(); // treasuryAddress
            cs.loadRef(); // content
            cs.loadRef(); // nftItemCode
            const deploymentTime = cs.remainingBits >= 32 ? cs.loadUint(32) : 0;
            if (deploymentTime > 0) {
              reservationEndsAt = deploymentTime + RESERVATION_PERIOD_SEC;
              isInReservationPeriod = nowSec < reservationEndsAt;
            }
          } catch {
            /* ignore collection parse errors */
          }
        }

        const isDeployed =
          Boolean(itemAcc) &&
          itemAcc!.status === 'active' &&
          Boolean(itemAcc!.data_boc);

        if (!isDeployed) {
          const r: DomainLookupResult = {
            status: 'available',
            nftAddress,
            price: BRO_FIXED_TON_FEE,
            fiStartingBid:
              zoneSuffix === 'bro' ? broFiStartingBid(charCount) : undefined,
            fiRenewalFee:
              zoneSuffix === 'bro' ? broFiRenewalFee(charCount) : undefined,
            zoneSuffix,
            canRegister: canRegister && !isInReservationPeriod,
            isInReservationPeriod,
            reservationEndsAt,
          };
          lookupCache.set(cacheKey, { result: r, timestamp: Date.now() });
          setResult(r);
          return;
        }

        const parsedItem = parseDnsItemAccountState(
          itemAcc!.data_boc!,
          network,
        );
        const ownerStr = parsedItem?.ownerAddress ?? undefined;
        const walletRecordStr = parsedItem?.walletRecord ?? undefined;
        const contactLinkStr = parsedItem?.contactLink ?? undefined;
        const channelLinkStr = parsedItem?.channelLink ?? undefined;
        const lastFillUp = parsedItem?.lastFillUpTime ?? nowSec;
        const auction = parsedItem?.auction ?? null;

        let status: DomainLookupStatus;
        if (ownerStr) {
          const expiresAt = lastFillUp + ONE_YEAR_SEC;
          const isExpired = nowSec > expiresAt;
          status = isExpired ? 'expired' : 'taken';
        } else if (auction && auction.auctionEndTime > 0) {
          status =
            nowSec < auction.auctionEndTime ? 'in-auction' : 'auction-ended';
        } else {
          status = 'available';
        }

        const maxBidAmount = auction?.maxBidAmount ?? 0n;
        const maxBidStr = auction?.maxBidAddress ?? undefined;
        const auctionEndTime = auction?.auctionEndTime ?? 0;

        const r: DomainLookupResult = {
          status,
          nftAddress,
          owner: ownerStr,
          walletRecord: walletRecordStr,
          contactLink: contactLinkStr,
          channelLink: channelLinkStr,
          price: BRO_FIXED_TON_FEE,
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
          expiresAt: ownerStr ? lastFillUp + ONE_YEAR_SEC : undefined,
          zoneSuffix,
          canRegister:
            (status === 'available' ||
              status === 'expired' ||
              status === 'in-auction') &&
            canRegister &&
            !isInReservationPeriod,
          isInReservationPeriod,
          reservationEndsAt,
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
