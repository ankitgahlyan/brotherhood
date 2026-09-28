/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Address, beginCell, Builder, Cell, Slice } from '@ton/core';
import { sha256_sync } from '@ton/crypto';
import type { TonClient } from '@ton/ton';
import { DnsItem } from '@wrappers/DnsItem.gen';
import { BRO_COLLECTION_RESOLVER } from '@/lib/brotherhood/config';
import { getTonClient, type Network } from '@/lib/brotherhood/ton';

export enum DnsCategory {
  DnsNextResolver = 'dns_next_resolver',
  Wallet = 'wallet',
  Site = 'site',
  BagId = 'storage',
}

export interface DnsZone {
  suffixes: string[];
  baseFormat: RegExp;
  resolver: string;
  collectionName: string;
  isRenewable: boolean;
  isLinkable: boolean;
  isTelemint: boolean;
}

/**
 * Returns supported DNS zones based on network. Only Brotherhood .bro domains are supported.
 */
export function getTonDnsZones(_network: Network = 'mainnet'): DnsZone[] {
  return [
    {
      suffixes: ['bro'],
      baseFormat: /^([-\da-z]+\.){0,2}[-\da-z]{1,126}$/i,
      resolver: BRO_COLLECTION_RESOLVER,
      collectionName: 'Brotherhood Domains (.bro)',
      isRenewable: true,
      isLinkable: true,
      isTelemint: false,
    },
  ];
}

/**
 * Standard TON DNS zones (mainnet baseline).
 */
export const TON_DNS_ZONES: DnsZone[] = getTonDnsZones('mainnet');

export function sha256BigInt(s: string): bigint {
  return BigInt(`0x${sha256_sync(s).toString('hex')}`);
}

export function dnsCategoryToBigInt(category?: string): bigint {
  if (!category) return 0n;
  return sha256BigInt(category);
}

/**
 * Encodes the domain in accordance with the TEP-81 standard.
 * Components are reversed and separated by null bytes (\0), ending with \0.
 */
export function encodeDomain(domain: string): string {
  if (!domain || !domain.length) {
    throw new Error('empty domain');
  }
  if (domain === '.') {
    return '';
  }

  domain = domain.toLowerCase();

  for (let i = 0; i < domain.length; i++) {
    if (domain.charCodeAt(i) <= 32) {
      throw new Error('bytes in range 0..32 are not allowed in domain names');
    }
  }

  for (let i = 0; i < domain.length; i++) {
    const s = domain.substring(i, i + 1);
    for (let c = 127; c <= 159; c++) {
      if (s === String.fromCharCode(c)) {
        throw new Error(
          'bytes in range 127..159 are not allowed in domain names',
        );
      }
    }
  }

  const arr = domain.split('.');
  arr.forEach((part) => {
    if (!part.length) {
      throw new Error('domain name cannot have an empty component');
    }
  });

  return `${arr.reverse().join('\0')}\0`;
}

export function encodeDomainCell(domain: string): Cell {
  const lower = domain.toLowerCase();
  const b = beginCell();
  for (let i = 0; i < lower.length; i++) {
    b.storeUint(lower.charCodeAt(i), 8);
  }
  return b.endCell();
}

export function domainItemIndex(name: string): bigint {
  const cell = encodeDomainCell(name);
  return BigInt('0x' + cell.hash().toString('hex'));
}

/**
 * Derives the DnsItem NFT address off-chain, given the .bro collection address
 * and the bare domain name (no TLD).
 */
export function deriveDnsItemAddress(
  collectionAddress: Address,
  domainName: string,
  testOnly = false,
): string {
  const index = domainItemIndex(domainName);
  const item = DnsItem.fromStorage({ index, collectionAddress });
  return item.address.toString({ bounceable: true, testOnly });
}

export interface BroDomainAuctionInfo {
  inAuction: boolean;
  isEnded: boolean;
  itemAddress: string;
  maxBidAddress: string | null;
  maxBidAmount: bigint;
  auctionEndTime: number;
}

/**
 * Checks on-chain whether a .bro domain is currently undergoing or has finished an auction.
 */
export async function getBroDomainAuctionInfo(
  domain: string,
  network: Network = 'mainnet',
  customClient?: TonClient,
): Promise<BroDomainAuctionInfo | null> {
  const trimmed = domain.trim().toLowerCase();
  const base = trimmed.endsWith('.bro') ? trimmed.slice(0, -4) : trimmed;
  if (!base || base.includes('.')) return null;

  try {
    const collectionAddr = Address.parse(BRO_COLLECTION_RESOLVER);
    const itemAddressStr = deriveDnsItemAddress(
      collectionAddr,
      base,
      network === 'testnet',
    );
    const itemAddr = Address.parse(itemAddressStr);
    const client = customClient ?? getTonClient(network);

    const auctionRes = await client.callGetMethod(
      itemAddr,
      'get_auction_info',
      [],
    );

    let maxBidAddr: Address | null = null;
    try {
      const bidAddrSlice = auctionRes.stack.readCell().beginParse();
      maxBidAddr =
        bidAddrSlice.remainingBits > 2 ? bidAddrSlice.loadAddress() : null;
    } catch {
      maxBidAddr = null;
    }

    const maxBidAmount = auctionRes.stack.readBigNumber();
    const auctionEndTime = auctionRes.stack.readNumber();

    if (auctionEndTime === 0 && maxBidAmount === 0n) {
      return null;
    }

    const nowSec = Math.floor(Date.now() / 1000);
    return {
      inAuction: true,
      isEnded: nowSec >= auctionEndTime,
      itemAddress: itemAddressStr,
      maxBidAddress: maxBidAddr
        ? maxBidAddr.toString({
            bounceable: false,
            testOnly: network === 'testnet',
          })
        : null,
      maxBidAmount,
      auctionEndTime,
    };
  } catch {
    return null;
  }
}

/**
 * Detects if a string is a domain belonging to one of the supported TON DNS zones.
 */
export function getDnsDomainZone(
  domain: string,
  network: Network = 'mainnet',
): { base: string; zone: DnsZone } | undefined {
  const normalized = domain.trim().toLowerCase();
  for (const zone of getTonDnsZones(network)) {
    const { suffixes, baseFormat } = zone;

    // Iterate suffixes in reverse order to prioritize longer suffixes if any
    for (let i = suffixes.length - 1; i >= 0; i--) {
      const suffix = suffixes[i];
      if (!normalized.endsWith(`.${suffix}`)) {
        continue;
      }

      const base = normalized.slice(0, -suffix.length - 1);
      if (!baseFormat.test(base)) {
        continue;
      }

      return { base, zone };
    }
  }

  return undefined;
}

export function isTonChainDns(
  value: string,
  network: Network = 'mainnet',
): boolean {
  if (!value || typeof value !== 'string') return false;
  return getDnsDomainZone(value, network) !== undefined;
}

function parseAddress(slice: Slice): Address | undefined {
  slice.loadUint(3);
  let n = slice.loadUintBig(8);
  if (n > 127n) {
    n -= 256n;
  }

  const hashPart = slice.loadUintBig(256);
  if (`${n.toString(10)}:${hashPart.toString(16)}` === '0:0') {
    return undefined;
  }
  const s = `${n.toString(10)}:${hashPart.toString(16).padStart(64, '0')}`;
  return Address.parse(s);
}

function parseSmartContractAddressImpl(
  cell: Cell,
  prefix0: number,
  prefix1: number,
): Address | undefined {
  const slice = cell.asSlice();
  const byte0 = slice.loadUint(8);
  const byte1 = slice.loadUint(8);

  if (byte0 !== prefix0 || byte1 !== prefix1) {
    throw new Error('Invalid dns record value prefix');
  }

  return parseAddress(slice);
}

export function parseSmartContractAddressRecord(
  cell: Cell,
): Address | undefined {
  return parseSmartContractAddressImpl(cell, 0x9f, 0xd3);
}

export function parseNextResolverRecord(cell: Cell): Address | undefined {
  return parseSmartContractAddressImpl(cell, 0xba, 0x93);
}

async function dnsResolveImpl(
  client: TonClient,
  dnsAddress: string,
  rawDomainBytes: Buffer,
  category: DnsCategory = DnsCategory.Wallet,
  oneStep = false,
): Promise<Address | undefined> {
  const len = rawDomainBytes.length * 8;
  const domainCell = new Builder().storeBuffer(rawDomainBytes).asCell();
  const categoryBigInt = dnsCategoryToBigInt(category);

  const res = await client.callGetMethod(
    Address.parse(dnsAddress),
    'dnsresolve',
    [
      { type: 'slice', cell: domainCell },
      { type: 'int', value: categoryBigInt },
    ],
  );

  const resultLen = res.stack.readNumber();
  let cell: Cell | undefined;
  try {
    cell = res.stack.readCell();
  } catch {
    // No cell returned
  }

  if (resultLen === 0) {
    return undefined;
  }

  if (resultLen % 8 !== 0) {
    throw new Error('domain split not at a component boundary');
  }

  if (resultLen > len) {
    throw new Error(`invalid response ${resultLen}/${len}`);
  } else if (resultLen === len) {
    if (category === DnsCategory.DnsNextResolver) {
      return cell ? parseNextResolverRecord(cell) : undefined;
    } else if (category === DnsCategory.Wallet) {
      return cell ? parseSmartContractAddressRecord(cell) : undefined;
    } else {
      return undefined;
    }
  } else if (!cell) {
    return undefined;
  } else {
    const nextAddress = parseNextResolverRecord(cell);
    if (!nextAddress) return undefined;

    if (oneStep) {
      return category === DnsCategory.DnsNextResolver ? nextAddress : undefined;
    } else {
      return dnsResolveImpl(
        client,
        nextAddress.toString(),
        rawDomainBytes.subarray(resultLen / 8),
        category,
        false,
      );
    }
  }
}

export function dnsResolve(
  client: TonClient,
  rootDnsAddress: string,
  domain: string,
  category: DnsCategory = DnsCategory.Wallet,
  oneStep = false,
): Promise<Address | undefined> {
  let rawDomain = encodeDomain(domain);
  if (rawDomain.length < 126) {
    rawDomain = `\0${rawDomain}`;
  }

  return dnsResolveImpl(
    client,
    rootDnsAddress,
    Buffer.from(rawDomain),
    category,
    oneStep,
  );
}

// In-memory TTL cache for resolved domain -> address
interface CachedDnsEntry {
  address: string | null;
  timestamp: number;
}
const DNS_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const domainResolutionCache = new Map<string, CachedDnsEntry>();

/**
 * Resolves a TON DNS domain to a user-friendly wallet address using pure on-chain TVM calls.
 * Caches positive and negative results with a 5-minute TTL.
 */
export async function resolveAddressByDomain(
  domain: string,
  network: Network = 'mainnet',
  signal?: AbortSignal,
  customClient?: TonClient,
): Promise<string | undefined> {
  const trimmed = domain.trim().toLowerCase();
  if (!trimmed.includes('.')) {
    // Plain username/handle: try resolving .bro first, then fallback to .ton
    const broResult = await resolveAddressByDomain(
      `${trimmed}.bro`,
      network,
      signal,
      customClient,
    );
    if (broResult) return broResult;
    return resolveAddressByDomain(
      `${trimmed}.ton`,
      network,
      signal,
      customClient,
    );
  }

  const zoneMatch = getDnsDomainZone(domain, network);
  if (!zoneMatch) {
    return undefined;
  }

  const cacheKey = `${network}:${domain.trim().toLowerCase()}`;
  const cached = domainResolutionCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < DNS_CACHE_TTL_MS) {
    return cached.address ?? undefined;
  }

  try {
    if (signal?.aborted) return undefined;

    const client = customClient ?? getTonClient(network);
    const result = await dnsResolve(
      client,
      zoneMatch.zone.resolver,
      zoneMatch.base,
      DnsCategory.Wallet,
    );

    if (signal?.aborted) return undefined;

    if (result instanceof Address) {
      const formatted = result.toString({
        bounceable: false,
        testOnly: network === 'testnet',
      });
      domainResolutionCache.set(cacheKey, {
        address: formatted,
        timestamp: Date.now(),
      });
      return formatted;
    }

    domainResolutionCache.set(cacheKey, {
      address: null,
      timestamp: Date.now(),
    });
    return undefined;
  } catch (err: any) {
    // If smart contract threw exit_code or contract is inactive, domain is unresolvable
    if (
      err?.message?.includes('exit_code') ||
      err?.message?.includes('exit code') ||
      err?.message?.includes('Unable to execute get method')
    ) {
      domainResolutionCache.set(cacheKey, {
        address: null,
        timestamp: Date.now(),
      });
      return undefined;
    }
    // Network or other transient error: do not cache permanently
    console.warn(`[resolveAddressByDomain] Failed to resolve ${domain}:`, err);
    return undefined;
  }
}

/**
 * Clears the in-memory domain resolution cache (primarily for tests).
 */
export function clearDomainResolutionCache(): void {
  domainResolutionCache.clear();
}

export const clearDnsCache = clearDomainResolutionCache;
