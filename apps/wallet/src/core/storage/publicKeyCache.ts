/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Address } from '@ton/core';
import type { SavedWallet } from '@demo/wallet-core';

const memoryCache = new Map<string, Uint8Array | null>();

function getStorageKey(network: string, address: string): string {
  return `ton_pubkey_${network || 'testnet'}_${normalizeRawAddress(address)}`;
}

export function normalizeRawAddress(address: string): string {
  try {
    return Address.parse(address.trim()).toRawString().toLowerCase();
  } catch {
    return address.trim().toLowerCase();
  }
}

export function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
  const padded = clean.padStart(64, '0');
  const bytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    bytes[i] = parseInt(padded.substr(i * 2, 2), 16);
  }
  return bytes;
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Retrieves a cached public key without network calls.
 */
export function getCachedPublicKey(
  address: string,
  network: string,
  savedWallets?: SavedWallet[],
): Uint8Array | null {
  if (!address) return null;
  const rawAddr = normalizeRawAddress(address);
  const cacheKey = `${network || 'testnet'}:${rawAddr}`;

  // 1. In-memory check
  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey) ?? null;
  }

  // 2. Saved wallets check
  if (savedWallets && savedWallets.length > 0) {
    const matchingWallet = savedWallets.find((w) => {
      const wRaw = normalizeRawAddress(w.address);
      return wRaw === rawAddr;
    });
    if (matchingWallet?.publicKey) {
      const keyBytes = hexToBytes(matchingWallet.publicKey);
      memoryCache.set(cacheKey, keyBytes);
      return keyBytes;
    }
  }

  // 3. Local storage check
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const hex = localStorage.getItem(getStorageKey(network, address));
      if (hex) {
        const keyBytes = hexToBytes(hex);
        memoryCache.set(cacheKey, keyBytes);
        return keyBytes;
      }
    } catch {
      // Ignore localStorage errors
    }
  }

  return null;
}

/**
 * Stores a public key in memory and localStorage.
 */
export function storeCachedPublicKey(
  address: string,
  network: string,
  publicKey: Uint8Array | null,
): void {
  if (!address) return;
  const rawAddr = normalizeRawAddress(address);
  const cacheKey = `${network || 'testnet'}:${rawAddr}`;
  memoryCache.set(cacheKey, publicKey);

  if (typeof window !== 'undefined' && window.localStorage && publicKey) {
    try {
      localStorage.setItem(
        getStorageKey(network, address),
        bytesToHex(publicKey),
      );
    } catch {
      // Ignore quota exceeded
    }
  }
}

/**
 * Resolves recipient public key with zero-redundancy caching.
 */
export async function resolveRecipientPublicKey(
  address: string,
  network: string,
  tonClient?: any,
  savedWallets?: SavedWallet[],
): Promise<Uint8Array | null> {
  if (!address) return null;

  // 1. Fast cached lookup
  const cached = getCachedPublicKey(address, network, savedWallets);
  if (cached) return cached;

  // 2. Fetch on-chain if TonClient is provided
  if (!tonClient) return null;

  try {
    let parsedAddress: Address;
    try {
      parsedAddress = Address.parse(address);
    } catch {
      return null;
    }

    // Call get_public_key on the recipient contract
    const res = await tonClient.runMethod(parsedAddress, 'get_public_key');
    if (res && res.stack) {
      const num = res.stack.readBigNumber();
      const hex = num.toString(16).padStart(64, '0');
      const keyBytes = hexToBytes(hex);
      storeCachedPublicKey(address, network, keyBytes);
      return keyBytes;
    }
  } catch {
    // If runMethod fails (e.g. uninitialized account or contract doesn't support get_public_key)
  }

  return null;
}
