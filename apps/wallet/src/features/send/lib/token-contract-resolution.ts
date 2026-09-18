/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Address } from '@ton/core';
import { isValidAddress } from '@ton/walletkit';
import { FI_ADDRESS, type Network } from '@/lib/brotherhood/config';
import {
  getFiWalletAddress,
  setCachedDeterministicWalletAddress,
} from '@/lib/brotherhood/ton';
import {
  getContractCache,
  getContractCacheSync,
  getNormalizedContractCacheKey,
} from '@/lib/brotherhood/contract-cache';
import { computePersonalWalletAddress } from '@/lib/brotherhood/account-state-hydrator';

export interface TokenContractContext {
  tokenType?: 'TON' | 'JETTON';
  minterAddress?: string;
  symbol?: string;
  adminAddress?: string;
}

export interface ChildContractCorrection {
  isChildContract: boolean;
  contractType?: 'FiWallet' | 'PersonalWallet';
  ownerAddress?: string;
  originalAddress?: string;
}

export interface DeriveTokenWalletParams {
  minterAddress?: string;
  ownerAddress: string;
  network: Network;
  tokenSymbol?: string;
  adminAddress?: string;
}

/**
 * Deterministically derives a child token wallet address off-chain for a given owner.
 * Supports FossFi (FI) and Personal Jetton tokens with 0ms execution and zero RPC calls.
 * Automatically pre-populates deterministic caches so WalletKit uses it instantly.
 */
export async function deriveTokenWalletAddressOffchain({
  minterAddress,
  ownerAddress,
  network,
  tokenSymbol,
  adminAddress,
}: DeriveTokenWalletParams): Promise<string | null> {
  if (!ownerAddress || !isValidAddress(ownerAddress)) return null;

  let owner: Address;
  try {
    owner = Address.parse(ownerAddress.trim());
  } catch {
    return null;
  }

  // 1. FossFi (FI) token
  const isFi =
    tokenSymbol?.toUpperCase() === 'FI' ||
    minterAddress === FI_ADDRESS ||
    (Boolean(minterAddress) &&
      isValidAddress(minterAddress!) &&
      Address.parse(minterAddress!).equals(Address.parse(FI_ADDRESS)));

  if (isFi) {
    const fiWallet = getFiWalletAddress(owner, network);
    const fiWalletStr = fiWallet.toString();

    // Pre-populate both in-memory and localStorage deterministic caches
    setCachedDeterministicWalletAddress(
      network,
      Address.parse(FI_ADDRESS),
      owner,
      fiWallet,
    );

    if (typeof window !== 'undefined' && window.localStorage) {
      const minterCanonical = Address.parse(FI_ADDRESS).toString();
      const ownerCanonical = owner.toString();
      const kitCacheKey = `deterministic_wallet:${network}:${minterCanonical}:${ownerCanonical}`;
      window.localStorage.setItem(kitCacheKey, fiWalletStr);
    }

    return fiWalletStr;
  }

  // 2. Personal Jettons
  if (minterAddress && isValidAddress(minterAddress)) {
    try {
      const minter = Address.parse(minterAddress);
      let deployerAdmin: Address | null = null;

      if (adminAddress && isValidAddress(adminAddress)) {
        deployerAdmin = Address.parse(adminAddress);
      } else {
        const normKey = getNormalizedContractCacheKey(network, minter);
        const cached = await getContractCache<any>(normKey);
        if (cached?.data?.adminAddress) {
          deployerAdmin = Address.parse(cached.data.adminAddress.toString());
        }
      }

      if (deployerAdmin) {
        const personalWallet = computePersonalWalletAddress(
          minter,
          owner,
          deployerAdmin,
        );
        const personalWalletStr = personalWallet.toString();

        setCachedDeterministicWalletAddress(
          network,
          minter,
          owner,
          personalWallet,
        );

        if (typeof window !== 'undefined' && window.localStorage) {
          const minterCanonical = minter.toString();
          const ownerCanonical = owner.toString();
          const kitCacheKey = `deterministic_wallet:${network}:${minterCanonical}:${ownerCanonical}`;
          window.localStorage.setItem(kitCacheKey, personalWalletStr);
        }

        return personalWalletStr;
      }
    } catch {
      /* pass */
    }
  }

  return null;
}

/**
 * Checks whether an address is a child token contract (FiWallet or PersonalWallet).
 * If detected, resolves the underlying owner address so the caller can auto-correct.
 */
export async function detectAndResolveOwnerFromChildContract(
  address: string,
  network: Network,
): Promise<ChildContractCorrection | null> {
  const trimmed = address.trim();
  if (!trimmed || !isValidAddress(trimmed)) return null;

  let parsed: Address;
  try {
    parsed = Address.parse(trimmed);
  } catch {
    return null;
  }

  // 1. Check cached contract data
  const normalizedKey = getNormalizedContractCacheKey(network, parsed);
  let cached = getContractCacheSync<any>(normalizedKey);
  if (!cached) {
    cached = await getContractCache<any>(normalizedKey);
  }

  if (cached?.data) {
    const data = cached.data;
    // FiWalletStore check
    if (data.$ === 'FiWalletStore' || data.addresses?.ref?.owner) {
      const ownerRaw =
        data.addresses?.ref?.owner || data.addresses?.owner || null;
      if (ownerRaw) {
        const ownerStr =
          typeof ownerRaw.toString === 'function'
            ? ownerRaw.toString()
            : String(ownerRaw);
        return {
          isChildContract: true,
          contractType: 'FiWallet',
          ownerAddress: ownerStr,
          originalAddress: trimmed,
        };
      }
    }

    // PersonalWalletStore check
    if (
      data.$ === 'PersonalWalletStore' ||
      (data.owner && data.minterAddress)
    ) {
      const ownerRaw = data.owner || null;
      if (ownerRaw) {
        const ownerStr =
          typeof ownerRaw.toString === 'function'
            ? ownerRaw.toString()
            : String(ownerRaw);
        return {
          isChildContract: true,
          contractType: 'PersonalWallet',
          ownerAddress: ownerStr,
          originalAddress: trimmed,
        };
      }
    }
  }

  // 2. Check deterministic wallet storage in localStorage
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const prefix = `deterministic_wallet:${network}:`;
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          const val = window.localStorage.getItem(key);
          if (val) {
            try {
              if (Address.parse(val).equals(parsed)) {
                // Key format: deterministic_wallet:${net}:${minter}:${owner}
                const parts = key.split(':');
                if (parts.length >= 4) {
                  const ownerFromKey = parts.slice(3).join(':');
                  const minterFromKey = parts[2];
                  const isFi =
                    minterFromKey === FI_ADDRESS ||
                    Address.parse(minterFromKey).equals(
                      Address.parse(FI_ADDRESS),
                    );
                  return {
                    isChildContract: true,
                    contractType: isFi ? 'FiWallet' : 'PersonalWallet',
                    ownerAddress: ownerFromKey,
                    originalAddress: trimmed,
                  };
                }
              }
            } catch {
              /* ignore invalid entry */
            }
          }
        }
      }
    } catch {
      /* pass */
    }
  }

  return null;
}
