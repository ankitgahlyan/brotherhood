/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Address, beginCell, type Cell, toNano } from '@ton/core';
import type { NFT } from '@ton/walletkit';
import { ZERO_ADDRESS } from '@/lib/brotherhood/ton';
import { BRO_COLLECTION_RESOLVER } from '@/lib/brotherhood/config';
import { BRO_DEFAULT_DESCRIPTION, BRO_DEFAULT_IMAGE_URI } from '@/core/lib/dns';
import type { OwnedDomain } from '@/features/dns/store/dns-store';

export const NFT_TRANSFER_GAS = toNano('0.08');
export const NFT_DESTROY_GAS = toNano('0.05');

function toRawAddr(addr?: string | null): string | null {
  if (!addr) return null;
  try {
    return Address.parse(addr).toRawString();
  } catch {
    return addr.trim().toLowerCase();
  }
}

const BRO_COLLECTION_RAW = toRawAddr(BRO_COLLECTION_RESOLVER);

/**
 * Normalizes and deduplicates indexer NFTs (`userNfts`) with locally tracked `.bro` domains
 * (`ownedBroDomains`), ensuring `.bro` domain NFTs always have a valid `image.url`, `name`,
 * and readable `index` regardless of `EQ...` vs `kQ...` address formatting.
 */
export function mergeAndEnrichBroNfts(
  userNfts: NFT[],
  ownedBroDomains: OwnedDomain[],
): NFT[] {
  const domainByRawAddr = new Map<string, OwnedDomain>();
  for (const d of ownedBroDomains) {
    const raw = toRawAddr(d.nftAddress);
    if (raw) {
      domainByRawAddr.set(raw, d);
    }
  }

  const seenRawAddresses = new Set<string>();
  const enrichedUserNfts: NFT[] = userNfts.map((nft) => {
    const raw = toRawAddr(nft.address);
    if (raw) {
      seenRawAddresses.add(raw);
    }
    const matchedDomain = raw ? domainByRawAddr.get(raw) : undefined;
    const collectionRaw = toRawAddr(nft.collection?.address);
    const isBroNft =
      Boolean(matchedDomain) ||
      (Boolean(BRO_COLLECTION_RAW) && collectionRaw === BRO_COLLECTION_RAW) ||
      Boolean(nft.info?.name?.toLowerCase().endsWith('.bro'));

    if (!isBroNft) {
      return nft;
    }

    const domainFullName =
      nft.info?.name ||
      (matchedDomain
        ? `${matchedDomain.name}.${matchedDomain.zone}`
        : undefined);
    const bareName =
      matchedDomain?.name ||
      (domainFullName?.toLowerCase().endsWith('.bro')
        ? domainFullName.slice(0, -4)
        : nft.index);

    return {
      ...nft,
      index: bareName || nft.index,
      collection: nft.collection?.address
        ? nft.collection
        : {
            address: BRO_COLLECTION_RESOLVER,
            name: '.bro Sovereign Domains',
          },
      info: {
        ...nft.info,
        name: domainFullName,
        image: {
          ...nft.info?.image,
          url: nft.info?.image?.url || BRO_DEFAULT_IMAGE_URI,
        },
        description: nft.info?.description || BRO_DEFAULT_DESCRIPTION,
      },
    };
  });

  const extraBroNfts: NFT[] = [];
  for (const d of ownedBroDomains) {
    const raw = toRawAddr(d.nftAddress);
    if (raw && seenRawAddresses.has(raw)) continue;
    if (raw) {
      seenRawAddresses.add(raw);
    }
    extraBroNfts.push({
      address: d.nftAddress,
      index: d.name,
      collection: {
        address: BRO_COLLECTION_RESOLVER,
        name: '.bro Sovereign Domains',
      },
      info: {
        name: `${d.name}.${d.zone}`,
        image: {
          url: BRO_DEFAULT_IMAGE_URI,
        },
        description: BRO_DEFAULT_DESCRIPTION,
      },
    });
  }

  return [...enrichedUserNfts, ...extraBroNfts];
}

export interface BuildNftTransferOptions {
  queryId?: bigint;
  newOwner: Address;
  responseDestination?: Address;
  forwardAmount?: bigint;
}

/**
 * Builds the standard TEP-62 transfer message body for NFT items and .bro DNS items.
 * Opcode: 0x5fcc3d14 (TransferOwnership)
 */
export function buildNftTransferBody({
  queryId = 0n,
  newOwner,
  responseDestination,
  forwardAmount = toNano('0.01'),
}: BuildNftTransferOptions): Cell {
  return beginCell()
    .storeUint(0x5fcc3d14, 32)
    .storeUint(queryId, 64)
    .storeAddress(newOwner)
    .storeAddress(responseDestination ?? newOwner)
    .storeBit(0) // customPayload: null
    .storeCoins(forwardAmount)
    .storeBit(0) // forwardPayload: inline empty
    .endCell();
}

/**
 * Builds a TEP-62 burn message body by transferring NFT ownership to ZERO_ADDRESS.
 */
export function buildNftBurnBody({
  queryId = 0n,
  responseDestination,
}: {
  queryId?: bigint;
  responseDestination: Address;
}): Cell {
  return buildNftTransferBody({
    queryId,
    newOwner: ZERO_ADDRESS,
    responseDestination,
    forwardAmount: 0n,
  });
}
