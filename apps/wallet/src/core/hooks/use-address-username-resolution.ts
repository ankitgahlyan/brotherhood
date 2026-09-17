/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Address } from '@ton/core';
import { isValidAddress } from '@ton/walletkit';
import { useFormatAddress } from '@/core/utils/formatters';
import {
  getFiWalletState,
  getFiWalletAddress,
  type Network,
} from '@/lib/brotherhood/ton';
import {
  getContractCacheSync,
  getNormalizedContractCacheKey,
} from '@/lib/brotherhood/contract-cache';
import {
  getCachedUsername,
  getCachedAddressByUsername,
  getAllUsernames,
  saveUsernameAddressMapping,
} from '@/core/lib/contact-storage';

// In-memory negative cache for addresses without usernames to avoid redundant on-chain calls
const negativeUsernameCache = new Set<string>();

export function getNegativeUsernameCache(): Set<string> {
  return negativeUsernameCache;
}

export function clearNegativeUsernameCacheForAddress(
  address: string,
  network: string,
): void {
  try {
    const parsed = Address.parse(address);
    negativeUsernameCache.delete(`${network}:${parsed.toString()}`);
  } catch {
    // ignore
  }
  negativeUsernameCache.delete(`${network}:${address.trim()}`);
}

export interface UseAddressUsernameResolutionOptions {
  value: string;
  onChange: (value: string) => void;
  onResolvedAddressChange?: (address: string | null) => void;
  enabled?: boolean;
}

export interface UseAddressUsernameResolutionResult {
  trimmed: string;
  isDirectAddress: boolean;
  isUsernameInput: boolean;
  resolvedAddress: string | null;
  resolvedUsername: string | null;
  isResolving: boolean;
  suggestions: { username: string; address: string }[];
  showSuggestions: boolean;
  setShowSuggestions: (show: boolean) => void;
  handleSelectSuggestion: (item: { username: string; address: string }) => void;
  refetchProfile: () => Promise<void>;
  net: Network;
}

export function useAddressUsernameResolution({
  value,
  onChange,
  onResolvedAddressChange,
  enabled = true,
}: UseAddressUsernameResolutionOptions): UseAddressUsernameResolutionResult {
  const { network } = useFormatAddress();
  const net: Network = network === 'mainnet' ? 'mainnet' : 'testnet';

  const trimmed = value.trim();
  const isDirectAddress = useMemo(
    () => (enabled && trimmed ? isValidAddress(trimmed) : false),
    [enabled, trimmed],
  );

  const isUsernameInput = useMemo(() => {
    if (!enabled || !trimmed || isDirectAddress) return false;
    return trimmed.startsWith('@') || /^[a-zA-Z0-9_]{3,32}$/.test(trimmed);
  }, [enabled, trimmed, isDirectAddress]);

  const cachedUsername = useMemo(() => {
    if (!enabled || !trimmed) return null;
    if (isDirectAddress) {
      const fromStorage = getCachedUsername(trimmed, net);
      if (fromStorage) return fromStorage;

      try {
        const parsed = Address.parse(trimmed);
        const offchainFiWallet = getFiWalletAddress(parsed, net);
        const cacheKey = getNormalizedContractCacheKey(net, offchainFiWallet);
        const cachedEntry = getContractCacheSync<any>(cacheKey);
        const uname = cachedEntry?.data?.profile?.username;
        if (uname && typeof uname === 'string' && uname.trim().length > 0) {
          const clean = uname.trim().replace(/^@+/, '');
          saveUsernameAddressMapping(clean, trimmed, net);
          return clean;
        }
      } catch {
        // Offchain calculation failed or not in L1 cache
      }

      return null;
    }
    if (isUsernameInput) {
      const clean = trimmed.replace(/^@+/, '');
      const cached = getCachedAddressByUsername(clean, net);
      return cached ? clean : null;
    }
    return null;
  }, [enabled, trimmed, isDirectAddress, isUsernameInput, net]);

  const [isResolving, setIsResolving] = useState(false);
  const [onChainUsername, setOnChainUsername] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const resolvedUsername = cachedUsername || onChainUsername;

  // Suggestions from localStorage
  const suggestions = useMemo(() => {
    if (!enabled || !isUsernameInput || typeof window === 'undefined') {
      return [];
    }
    try {
      const mapping = getAllUsernames(net);
      const query = trimmed.replace(/^@+/, '').toLowerCase();
      return Object.entries(mapping)
        .filter(([uname]) => (query ? uname.includes(query) : true))
        .map(([uname, addr]) => ({ username: uname, address: addr }));
    } catch {
      return [];
    }
  }, [enabled, isUsernameInput, trimmed, net]);

  // Resolved address computation
  const resolvedAddress = useMemo(() => {
    if (!enabled) return null;
    if (isDirectAddress) return trimmed;
    if (isUsernameInput) {
      const clean = trimmed.replace(/^@+/, '');
      return getCachedAddressByUsername(clean, net);
    }
    return null;
  }, [enabled, isDirectAddress, isUsernameInput, trimmed, net]);

  // Sync resolution
  useEffect(() => {
    if (!enabled || !trimmed) {
      onResolvedAddressChange?.(null);
      return;
    }

    let isCancelled = false;

    if (isDirectAddress) {
      onResolvedAddressChange?.(trimmed);

      // If already cached in localStorage or L1 ContractCache, skip network call
      if (cachedUsername) {
        return;
      }

      let parsedAddress: Address | null = null;
      try {
        parsedAddress = Address.parse(trimmed);
      } catch {
        // Not a parsable address
      }

      const canonicalKey = parsedAddress
        ? `${net}:${parsedAddress.toString()}`
        : `${net}:${trimmed}`;

      if (negativeUsernameCache.has(canonicalKey)) {
        return;
      }

      // Query on-chain FiWallet with debounce
      const timer = setTimeout(async () => {
        try {
          setIsResolving(true);
          const parsed = parsedAddress || Address.parse(trimmed);
          const fiState = await getFiWalletState(parsed, { net });
          if (isCancelled) return;

          const uname = (fiState as any)?.profile?.username;
          if (uname && typeof uname === 'string' && uname.trim().length > 0) {
            const clean = uname.trim().replace(/^@+/, '');
            saveUsernameAddressMapping(clean, trimmed, net);
            setOnChainUsername(clean);
          } else {
            negativeUsernameCache.add(canonicalKey);
            setOnChainUsername(null);
          }
        } catch (_err) {
          if (!isCancelled) {
            negativeUsernameCache.add(canonicalKey);
            setOnChainUsername(null);
          }
        } finally {
          if (!isCancelled) {
            setIsResolving(false);
          }
        }
      }, 400);

      return () => {
        isCancelled = true;
        clearTimeout(timer);
      };
    }

    if (isUsernameInput) {
      onResolvedAddressChange?.(resolvedAddress);
    }
  }, [
    enabled,
    trimmed,
    isDirectAddress,
    isUsernameInput,
    cachedUsername,
    resolvedAddress,
    net,
    onResolvedAddressChange,
  ]);

  const handleSelectSuggestion = useCallback(
    (item: { username: string; address: string }) => {
      onChange(item.address);
      setOnChainUsername(item.username);
      setShowSuggestions(false);
      onResolvedAddressChange?.(item.address);
    },
    [onChange, onResolvedAddressChange],
  );

  const refetchProfile = useCallback(async () => {
    const targetAddress = resolvedAddress || (isDirectAddress ? trimmed : null);
    if (!targetAddress) return;

    let parsedAddress: Address;
    try {
      parsedAddress = Address.parse(targetAddress);
    } catch {
      return;
    }

    const canonicalKey = `${net}:${parsedAddress.toString()}`;
    negativeUsernameCache.delete(canonicalKey);
    negativeUsernameCache.delete(`${net}:${targetAddress}`);

    setIsResolving(true);
    try {
      const fiState = await getFiWalletState(parsedAddress, {
        net,
        forceFresh: true,
      });
      const uname = (fiState as any)?.profile?.username;
      if (uname && typeof uname === 'string' && uname.trim().length > 0) {
        const clean = uname.trim().replace(/^@+/, '');
        setOnChainUsername(clean);
        saveUsernameAddressMapping(clean, targetAddress, net);
      } else {
        negativeUsernameCache.add(canonicalKey);
        setOnChainUsername(null);
      }
    } catch {
      negativeUsernameCache.add(canonicalKey);
      setOnChainUsername(null);
    } finally {
      setIsResolving(false);
    }
  }, [resolvedAddress, isDirectAddress, trimmed, net]);

  return {
    trimmed,
    isDirectAddress,
    isUsernameInput,
    resolvedAddress,
    resolvedUsername,
    isResolving,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    handleSelectSuggestion,
    refetchProfile,
    net,
  };
}
