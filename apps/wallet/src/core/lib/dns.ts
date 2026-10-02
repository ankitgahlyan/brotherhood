/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  Address,
  beginCell,
  Builder,
  Cell,
  Dictionary,
  Slice,
} from '@ton/core';
import { sha256_sync } from '@ton/crypto';
import type { TonClient } from '@ton/ton';
import { DnsItem } from '@wrappers/DnsItem.gen';
import {
  BRO_COLLECTION_RESOLVER,
  ONE_YEAR_SEC,
  RESERVATION_PERIOD_SEC,
} from '@/lib/brotherhood/config';
import { getTonClient, type Network } from '@/lib/brotherhood/ton';
import { batchFetchAccountStates } from '@/lib/brotherhood/account-state-hydrator';

export enum DnsCategory {
  DnsNextResolver = 'dns_next_resolver',
  Wallet = 'wallet',
  Site = 'site',
  BagId = 'storage',
  ContactUri = 'uri',
  ChannelDescription = 'description',
  Name = 'name',
}

export type SocialPlatform =
  | 'thatsapp'
  | 'telegram'
  | 'facebook'
  | 'twitter'
  | 'instagram'
  | 'github'
  | 'website';

export interface DetectedSocialLink {
  platform: SocialPlatform;
  label: string;
  icon: string;
  href?: string;
}

/**
 * Auto-recognizes whether a stored DNS social link is a ThatsApp/SimpleX address,
 * Telegram, Facebook, X/Twitter, Instagram, GitHub, or generic website/social contact link.
 */
export function detectSocialPlatform(
  rawLink?: string,
): DetectedSocialLink | null {
  const trimmed = rawLink?.trim();
  if (!trimmed) return null;
  const lower = trimmed.toLowerCase();

  if (
    lower.startsWith('simplex:') ||
    lower.startsWith('smp://') ||
    lower.startsWith('xftp://') ||
    lower.includes('simplex.chat') ||
    lower.includes('thatsapp')
  ) {
    return {
      platform: 'thatsapp',
      label: 'ThatsApp',
      icon: '💬',
      href:
        lower.startsWith('http://') ||
        lower.startsWith('https://') ||
        lower.startsWith('simplex:')
          ? trimmed
          : undefined,
    };
  }

  if (
    lower.startsWith('tg://') ||
    lower.includes('t.me/') ||
    lower.includes('telegram.me/') ||
    lower.includes('telegram.org/') ||
    trimmed.startsWith('@')
  ) {
    const href = trimmed.startsWith('@')
      ? `https://t.me/${trimmed.slice(1)}`
      : lower.startsWith('http://') ||
          lower.startsWith('https://') ||
          lower.startsWith('tg://')
        ? trimmed
        : `https://${trimmed}`;
    return { platform: 'telegram', label: 'Telegram', icon: '✈️', href };
  }

  if (
    lower.includes('facebook.com/') ||
    lower.includes('fb.com/') ||
    lower.includes('fb.me/')
  ) {
    const href =
      lower.startsWith('http://') || lower.startsWith('https://')
        ? trimmed
        : `https://${trimmed}`;
    return { platform: 'facebook', label: 'Facebook', icon: '📘', href };
  }

  if (lower.includes('x.com/') || lower.includes('twitter.com/')) {
    const href =
      lower.startsWith('http://') || lower.startsWith('https://')
        ? trimmed
        : `https://${trimmed}`;
    return { platform: 'twitter', label: 'X / Twitter', icon: '🐦', href };
  }

  if (lower.includes('instagram.com/') || lower.includes('instagr.am/')) {
    const href =
      lower.startsWith('http://') || lower.startsWith('https://')
        ? trimmed
        : `https://${trimmed}`;
    return { platform: 'instagram', label: 'Instagram', icon: '📸', href };
  }

  if (lower.includes('github.com/')) {
    const href =
      lower.startsWith('http://') || lower.startsWith('https://')
        ? trimmed
        : `https://${trimmed}`;
    return { platform: 'github', label: 'GitHub', icon: '🐙', href };
  }

  const href =
    lower.startsWith('http://') || lower.startsWith('https://')
      ? trimmed
      : undefined;
  return { platform: 'website', label: 'Social Link', icon: '🔗', href };
}

/**
 * Builds a TEP-64 snake-formatted string cell (0x00 prefix byte + UTF-8 bytes chained across refs).
 * Compatible with Toncenter v3 NFT metadata decoder and ThatsApp BroDnsResolver.
 */
export function buildSnakeStringCell(text: string): Cell {
  const bytes = Buffer.from(text, 'utf8');
  // First cell holds 1 byte prefix (0x00) + up to 126 bytes (1016 bits <= 1023 bits)
  const firstChunkMax = 126;
  const tailChunkMax = 127;

  if (bytes.length <= firstChunkMax) {
    return beginCell().storeUint(0, 8).storeBuffer(bytes).endCell();
  }

  const chunks: Buffer[] = [bytes.subarray(0, firstChunkMax)];
  let offset = firstChunkMax;
  while (offset < bytes.length) {
    chunks.push(bytes.subarray(offset, offset + tailChunkMax));
    offset += tailChunkMax;
  }

  let currentCell: Cell | null = null;
  for (let i = chunks.length - 1; i >= 0; i--) {
    const b = beginCell();
    if (i === 0) {
      b.storeUint(0, 8);
    }
    b.storeBuffer(chunks[i]);
    if (currentCell) {
      b.storeRef(currentCell);
    }
    currentCell = b.endCell();
  }

  return currentCell!;
}

/**
 * Parses a TEP-64 snake-formatted string cell (0x00 prefix byte + UTF-8 bytes across refs).
 */
export function parseSnakeStringCell(cell: Cell): string | null {
  try {
    const s = cell.beginParse();
    if (s.remainingBits < 8) return null;
    const prefix = s.loadUint(8);
    if (prefix !== 0) return null;

    const parts: Buffer[] = [];
    let cur = s;
    while (true) {
      const remBytes = Math.floor(cur.remainingBits / 8);
      if (remBytes > 0) {
        parts.push(cur.loadBuffer(remBytes));
      }
      if (cur.remainingRefs > 0) {
        cur = cur.loadRef().beginParse();
      } else {
        break;
      }
    }
    const text = Buffer.concat(parts).toString('utf8').trim();
    return text || null;
  } catch {
    return null;
  }
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

export interface ParsedDnsItemState {
  isInitialized: boolean;
  index: bigint;
  collectionAddress: Address;
  domainName?: string;
  ownerAddress?: string | null;
  walletRecord?: string | null;
  contactLink?: string | null;
  channelLink?: string | null;
  lastFillUpTime?: number;
  isExpired?: boolean;
  auction?: {
    maxBidAddress: string | null;
    maxBidAmount: bigint;
    auctionEndTime: number;
    isActive: boolean;
    isEnded: boolean;
  } | null;
}

/**
 * Pure in-memory deserialization of a DnsItem contract's data_boc.
 * Avoids on-chain runGetMethod RPC calls per Universal Batch Account Ingestion rules.
 */
export function parseDnsItemAccountState(
  dataBoc: string,
  network: Network = 'testnet',
): ParsedDnsItemState | null {
  try {
    const cell = Cell.fromBase64(dataBoc);
    const s = cell.beginParse();
    const index = s.loadUintBig(256);
    const collectionAddress = s.loadAddress();

    if (s.remainingRefs === 0) {
      return {
        isInitialized: false,
        index,
        collectionAddress,
      };
    }

    const testOnly = network === 'testnet';
    const ownerAddr = s.loadMaybeAddress();
    const ownerAddress = ownerAddr
      ? ownerAddr.toString({ bounceable: false, testOnly })
      : null;

    const contentCell = s.loadRef();
    const domainCell = s.loadRef();
    const hasAuction = s.loadBoolean();
    const auctionCell = hasAuction ? s.loadRef() : null;
    const lastFillUpTime = Number(s.loadUintBig(64));

    let domainName: string | undefined;
    try {
      domainName = domainCell.beginParse().loadStringTail();
    } catch {
      /* ignore malformed domain cell */
    }

    let walletRecord: string | null = null;
    let contactLink: string | null = null;
    let channelLink: string | null = null;
    try {
      const cs = contentCell.beginParse();
      if (cs.remainingBits >= 8 && cs.loadUint(8) === 0) {
        const dict = cs.loadDict(
          Dictionary.Keys.BigUint(256),
          Dictionary.Values.Cell(),
        );
        const walletCell = dict.get(dnsCategoryToBigInt(DnsCategory.Wallet));
        if (walletCell) {
          const parsedWallet = parseSmartContractAddressRecord(walletCell);
          if (parsedWallet) {
            walletRecord = parsedWallet.toString({
              bounceable: false,
              testOnly,
            });
          }
        }
        const uriCell = dict.get(dnsCategoryToBigInt(DnsCategory.ContactUri));
        if (uriCell) {
          contactLink = parseSnakeStringCell(uriCell);
        }
        const descCell = dict.get(
          dnsCategoryToBigInt(DnsCategory.ChannelDescription),
        );
        if (descCell) {
          channelLink = parseSnakeStringCell(descCell);
        }
      }
    } catch {
      /* ignore malformed content dict */
    }

    const nowSec = Math.floor(Date.now() / 1000);
    const isExpired =
      lastFillUpTime > 0 ? nowSec > lastFillUpTime + ONE_YEAR_SEC : false;

    let auction: ParsedDnsItemState['auction'] = null;
    if (auctionCell) {
      try {
        const as = auctionCell.beginParse();
        const maxBidAddr = as.loadMaybeAddress();
        const maxBidAmount = as.loadCoins();
        const auctionEndTime = Number(as.loadUintBig(64));
        if (auctionEndTime > 0 || maxBidAmount > 0n) {
          auction = {
            maxBidAddress: maxBidAddr
              ? maxBidAddr.toString({ bounceable: false, testOnly })
              : null,
            maxBidAmount,
            auctionEndTime,
            isActive: nowSec < auctionEndTime,
            isEnded: nowSec >= auctionEndTime,
          };
        }
      } catch {
        /* ignore malformed auction cell */
      }
    }

    return {
      isInitialized: true,
      index,
      collectionAddress,
      domainName,
      ownerAddress,
      walletRecord,
      contactLink,
      channelLink,
      lastFillUpTime,
      isExpired,
      auction,
    };
  } catch {
    return null;
  }
}

export interface BroCollectionState {
  treasuryAddress: string;
  deploymentTime: number;
  isInReservationPeriod: boolean;
  reservationEndsAt: number;
}

/**
 * Fetches and deserializes the .bro DnsCollection contract storage in-memory.
 */
export async function fetchBroCollectionState(
  network: Network = 'testnet',
): Promise<BroCollectionState | null> {
  try {
    const batch = await batchFetchAccountStates(
      [BRO_COLLECTION_RESOLVER],
      network,
    );
    const acc = batch.accounts[0];
    if (!acc || acc.status !== 'active' || !acc.data_boc) return null;

    const s = Cell.fromBase64(acc.data_boc).beginParse();
    const treasuryAddr = s.loadAddress();
    s.loadRef(); // content
    s.loadRef(); // nftItemCode
    const deploymentTime = s.remainingBits >= 32 ? s.loadUint(32) : 0;
    const reservationEndsAt =
      deploymentTime > 0 ? deploymentTime + RESERVATION_PERIOD_SEC : 0;
    const nowSec = Math.floor(Date.now() / 1000);
    const isInReservationPeriod =
      deploymentTime > 0 && nowSec < reservationEndsAt;

    return {
      treasuryAddress: treasuryAddr.toString({
        bounceable: false,
        testOnly: network === 'testnet',
      }),
      deploymentTime,
      isInReservationPeriod,
      reservationEndsAt,
    };
  } catch {
    return null;
  }
}

// In-memory TTL cache for resolved domain -> address
interface CachedDnsEntry {
  address: string | null;
  timestamp: number;
}
const DNS_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const domainResolutionCache = new Map<string, CachedDnsEntry>();

/**
 * Resolves a TON DNS domain to a user-friendly wallet address.
 * For .bro domains, checks explicit "wallet" DNS record first and falls back
 * to the NFT ownerAddress when the domain is active and not expired.
 */
export async function resolveAddressByDomain(
  domain: string,
  network: Network = 'mainnet',
  signal?: AbortSignal,
  customClient?: TonClient,
): Promise<string | undefined> {
  const trimmed = domain.trim().toLowerCase();
  if (!trimmed.includes('.')) {
    return resolveAddressByDomain(
      `${trimmed}.bro`,
      network,
      signal,
      customClient,
    );
  }

  const zoneMatch = getDnsDomainZone(domain, network);
  if (!zoneMatch) {
    return undefined;
  }

  const cacheKey = `${network}:${trimmed}`;
  const cached = domainResolutionCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < DNS_CACHE_TTL_MS) {
    return cached.address ?? undefined;
  }

  try {
    if (signal?.aborted) return undefined;

    // Fast path for top-level .bro domains when no custom mock client is injected:
    // Query DnsItem accountState BOC directly and check walletRecord || ownerAddress.
    if (
      !customClient &&
      zoneMatch.zone.suffixes.includes('bro') &&
      !zoneMatch.base.includes('.')
    ) {
      const collectionAddr = Address.parse(zoneMatch.zone.resolver);
      const itemAddrStr = deriveDnsItemAddress(
        collectionAddr,
        zoneMatch.base,
        network === 'testnet',
      );
      const batch = await batchFetchAccountStates([itemAddrStr], network);
      if (signal?.aborted) return undefined;

      const acc = batch.accounts[0];
      if (acc && acc.status === 'active' && acc.data_boc) {
        const parsed = parseDnsItemAccountState(acc.data_boc, network);
        if (parsed && parsed.isInitialized && !parsed.isExpired) {
          const resolved = parsed.walletRecord || parsed.ownerAddress || null;
          domainResolutionCache.set(cacheKey, {
            address: resolved,
            timestamp: Date.now(),
          });
          return resolved ?? undefined;
        }
      }

      domainResolutionCache.set(cacheKey, {
        address: null,
        timestamp: Date.now(),
      });
      return undefined;
    }

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

    // Fallback to NFT ownerAddress if dnsResolve returned undefined (record unset)
    if (
      zoneMatch.zone.suffixes.includes('bro') &&
      !zoneMatch.base.includes('.')
    ) {
      try {
        const collectionAddr = Address.parse(zoneMatch.zone.resolver);
        const itemAddr = Address.parse(
          deriveDnsItemAddress(
            collectionAddr,
            zoneMatch.base,
            network === 'testnet',
          ),
        );
        const nftData = await client.callGetMethod(
          itemAddr,
          'get_nft_data',
          [],
        );
        const isInit = nftData.stack.readBoolean();
        nftData.stack.readBigNumber();
        nftData.stack.readCell();
        const ownerSlice = nftData.stack.readCell().beginParse();
        const ownerAddr =
          isInit && ownerSlice.remainingBits > 2
            ? ownerSlice.loadAddress()
            : null;
        if (ownerAddr) {
          const formatted = ownerAddr.toString({
            bounceable: false,
            testOnly: network === 'testnet',
          });
          domainResolutionCache.set(cacheKey, {
            address: formatted,
            timestamp: Date.now(),
          });
          return formatted;
        }
      } catch {
        /* ignore fallback failure */
      }
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
