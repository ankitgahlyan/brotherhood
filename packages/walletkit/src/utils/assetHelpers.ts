/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Address, beginCell } from '@ton/core';
import { LRUCache } from 'lru-cache';

import { isValidAddress, asAddressFriendly } from './address';
import { ParseStack, SerializeStack } from './tvmStack';
import type { ApiClient } from '../api/interfaces';
import type {
  JettonsRequest,
  JettonsResponse,
  NFT,
  NFTsRequest,
  NFTsResponse,
  TokenAmount,
  UserFriendlyAddress,
} from '../api/models';

// ==========================================
// Jetton Helpers
// ==========================================

// Cache for jetton wallet addresses by master + owner
const JETTON_WALLET_BY_OWNER_CACHE_SIZE = 1000;
const JETTON_WALLET_BY_OWNER_CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours TTL
const jettonWalletByOwnerCache = new LRUCache<string, UserFriendlyAddress>({
  max: JETTON_WALLET_BY_OWNER_CACHE_SIZE,
  ttl: JETTON_WALLET_BY_OWNER_CACHE_TTL,
});

export function clearJettonWalletAddressCache(): void {
  jettonWalletByOwnerCache.clear();
}

/**
 * Gets the jetton wallet address for an owner
 */
export async function getJettonWalletAddressFromClient(
  client: ApiClient,
  jettonAddress: UserFriendlyAddress,
  ownerAddress: UserFriendlyAddress,
): Promise<UserFriendlyAddress> {
  if (!isValidAddress(jettonAddress)) {
    throw new Error(`Invalid jetton address: ${jettonAddress}`);
  }
  if (!isValidAddress(ownerAddress)) {
    throw new Error(`Invalid owner address: ${ownerAddress}`);
  }

  let netName = 'testnet';
  try {
    const network = client.getNetwork?.();
    if (network) {
      netName = String(network.chainId) === '-239' ? 'mainnet' : 'testnet';
    }
  } catch {
    /* pass */
  }

  let minterCanonical = jettonAddress;
  let ownerCanonical = ownerAddress;
  try {
    minterCanonical = Address.parse(jettonAddress).toString();
    ownerCanonical = Address.parse(ownerAddress).toString();
  } catch {
    /* pass */
  }

  const cacheKey = `deterministic_wallet:${netName}:${minterCanonical}:${ownerCanonical}`;

  // 1. Check L1 in-memory LRU cache
  const memCached = jettonWalletByOwnerCache.get(cacheKey);
  if (memCached) {
    return memCached;
  }

  // 2. Check localStorage (ADR 0013 compliant)
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = localStorage.getItem(cacheKey);
      if (stored && isValidAddress(stored)) {
        const friendly = asAddressFriendly(stored);
        jettonWalletByOwnerCache.set(cacheKey, friendly);
        return friendly;
      }
    } catch {
      /* pass */
    }
  }

  try {
    const result = await client.runGetMethod(
      jettonAddress,
      'get_wallet_address',
      SerializeStack([
        {
          type: 'slice',
          cell: beginCell().storeAddress(Address.parse(ownerAddress)).endCell(),
        },
      ]),
    );

    const parsedStack = ParseStack(result.stack);
    const jettonWalletAddress =
      parsedStack[0].type === 'slice' || parsedStack[0].type === 'cell'
        ? parsedStack[0].cell.asSlice().loadAddress()
        : null;

    if (!jettonWalletAddress) {
      throw new Error('Failed to get jetton wallet address');
    }

    const resolved = asAddressFriendly(jettonWalletAddress.toString());
    jettonWalletByOwnerCache.set(cacheKey, resolved);

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(cacheKey, resolved);
      } catch {
        /* pass */
      }
    }

    return resolved;
  } catch (error) {
    throw new Error(
      `Failed to get jetton wallet address for ${jettonAddress}: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    );
  }
}

// Cache for jetton master addresses by wallet address
const JETTON_MASTER_BY_WALLET_CACHE_SIZE = 1000;
const JETTON_MASTER_BY_WALLET_CACHE_TTL = 1000 * 60 * 10; // 10 minutes TTL
const jettonMasterByWalletCache = new LRUCache<string, UserFriendlyAddress>({
  max: JETTON_MASTER_BY_WALLET_CACHE_SIZE,
  ttl: JETTON_MASTER_BY_WALLET_CACHE_TTL,
});

/**
 * Gets the jetton wallet address for an owner
 */
export async function getJettonMasterAddressFromClient(
  client: ApiClient,
  jettonWalletAddress: UserFriendlyAddress,
): Promise<UserFriendlyAddress> {
  const cacheKey = `${client.getNetwork().chainId}-${jettonWalletAddress}`;
  const cached = jettonMasterByWalletCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  if (!isValidAddress(jettonWalletAddress)) {
    throw new Error(`Invalid jetton address: ${jettonWalletAddress}`);
  }

  if (!jettonWalletAddress) {
    throw new Error(`Invalid jetton wallet address: ${jettonWalletAddress}`);
  }

  try {
    const result = await client.runGetMethod(
      jettonWalletAddress,
      'get_wallet_data',
    );

    const parsedStack = ParseStack(result.stack);

    const ownerAddress =
      parsedStack[1].type === 'slice' || parsedStack[1].type === 'cell'
        ? parsedStack[1].cell.asSlice().loadAddress()
        : null;

    if (!ownerAddress) {
      throw new Error('Failed to get owner address');
    }

    const jettonMasterAddress =
      parsedStack[2].type === 'slice' || parsedStack[2].type === 'cell'
        ? parsedStack[2].cell.asSlice().loadAddress()
        : null;

    if (!jettonMasterAddress) {
      throw new Error('Failed to get jetton master address');
    }

    const verifiedJettonWalletAddress = await getJettonWalletAddressFromClient(
      client,
      asAddressFriendly(jettonMasterAddress.toString()),
      asAddressFriendly(ownerAddress.toString()),
    );

    if (verifiedJettonWalletAddress !== jettonWalletAddress) {
      throw new Error('Jetton wallet address mismatch');
    }

    const normalizedJettonMasterAddress =
      asAddressFriendly(jettonMasterAddress);
    jettonMasterByWalletCache.set(cacheKey, normalizedJettonMasterAddress);
    return normalizedJettonMasterAddress;
  } catch (error) {
    throw new Error(
      `Failed to get jetton master address for ${jettonWalletAddress}: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    );
  }
}

/**
 * Gets the jetton balance for an owner's jetton wallet
 */
export async function getJettonBalanceFromClient(
  client: ApiClient,
  jettonWalletAddress: UserFriendlyAddress,
): Promise<TokenAmount> {
  try {
    const result = await client.runGetMethod(
      jettonWalletAddress,
      'get_wallet_data',
    );

    if (result.exitCode !== 0) {
      // If the jetton wallet address is not found, return 0
      return '0';
    }
    const parsedStack = ParseStack(result.stack);
    const balance = parsedStack[0].type === 'int' ? parsedStack[0].value : 0n;
    return balance.toString();
  } catch (_error) {
    return '0';
  }
}

/**
 * Gets jettons owned by an address
 */
export async function getJettonsFromClient(
  client: ApiClient,
  ownerAddress: UserFriendlyAddress,
  params?: JettonsRequest,
): Promise<JettonsResponse> {
  return client.jettonsByOwnerAddress({
    ownerAddress,
    offset: params?.pagination.offset,
    limit: params?.pagination.limit,
  });
}

// ==========================================
// NFT Helpers
// ==========================================

/**
 * Gets NFTs owned by an address
 */
export async function getNftsFromClient(
  client: ApiClient,
  ownerAddress: UserFriendlyAddress,
  params: NFTsRequest,
): Promise<NFTsResponse> {
  return client.nftItemsByOwner({
    ownerAddress,
    pagination: params.pagination,
  });
}

/**
 * Gets a single NFT by address
 */
export async function getNftFromClient(
  client: ApiClient,
  address: UserFriendlyAddress,
): Promise<NFT | undefined> {
  const result = await client.nftItemsByAddress({ address });
  return result.nfts.length > 0 ? result.nfts[0] : undefined;
}
