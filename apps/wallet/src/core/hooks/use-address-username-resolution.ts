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
  getFiWalletStateByContractAddress,
  getFiWalletAddress,
  type Network,
} from '@/lib/brotherhood/ton';
import {
  getContractCacheSync,
  getNormalizedContractCacheKey,
} from '@/lib/brotherhood/contract-cache';
import {
  getCachedAddressByUsername,
  getAllUsernames,
  saveUsernameAddressMapping,
  getEffectiveUsername,
  setCustomAddressName,
  removeCustomAddressName,
  hasCustomAddressName,
} from '@/core/lib/contact-storage';
import {
  deriveTokenWalletAddressOffchain,
  detectAndResolveOwnerFromChildContract,
  type TokenContractContext,
  type ChildContractCorrection,
} from '@/features/send/lib/token-contract-resolution';

// In-memory negative cache for addresses without usernames to avoid redundant on-chain calls
const negativeUsernameCache = new Set<string>();

export function getNegativeUsernameCache(): Set<string> {
  return negativeUsernameCache;
}

/**
 * Clear the in-memory negative cache (useful for tests or hard resets).
 */
export function clearNegativeUsernameCache(): void {
  negativeUsernameCache.clear();
}

/**
 * Invalidate an address from negative cache so the next resolution refetches on-chain.
 */
export function invalidateNegativeUsernameCache(
  address: string,
  network: string,
): void {
  if (!address) return;
  negativeUsernameCache.delete(`${network}:${address.trim()}`);
}

export const clearNegativeUsernameCacheForAddress =
  invalidateNegativeUsernameCache;

export interface UseAddressUsernameResolutionOptions {
  value: string;
  onChange: (value: string) => void;
  onResolvedAddressChange?: (address: string | null) => void;
  enabled?: boolean;
  tokenContext?: TokenContractContext;
}

export interface UseAddressUsernameResolutionResult {
  trimmed: string;
  isDirectAddress: boolean;
  isUsernameInput: boolean;
  resolvedAddress: string | null;
  resolvedUsername: string | null;
  isCustomName: boolean;
  onChainUsername: string | null;
  isResolving: boolean;
  suggestions: { username: string; address: string; isCustom?: boolean }[];
  showSuggestions: boolean;
  setShowSuggestions: (show: boolean) => void;
  handleSelectSuggestion: (item: { username: string; address: string }) => void;
  refetchProfile: () => Promise<void>;
  setCustomName: (name: string) => void;
  removeCustomName: () => void;
  net: Network;
  derivedTokenWalletAddress: string | null;
  childContractCorrection: ChildContractCorrection | null;
  applyChildContractCorrection: () => void;
}

function extractUsernameFromState(state: any): string | null {
  if (!state) return null;
  const username =
    state.profile?.ref?.username ??
    state.profile?.username ??
    state.profile?.ref?.profile?.username;
  if (typeof username === 'string' && username.trim().length > 0) {
    return username.trim().replace(/^@+/, '');
  }
  return null;
}

export function useAddressUsernameResolution({
  value,
  onChange,
  onResolvedAddressChange,
  enabled = true,
  tokenContext,
}: UseAddressUsernameResolutionOptions): UseAddressUsernameResolutionResult {
  const { network } = useFormatAddress();
  const net: Network = network === 'mainnet' ? 'mainnet' : 'testnet';

  const trimmed = value.trim();
  const isDirectAddress = useMemo(
    () => (enabled && trimmed ? isValidAddress(trimmed) : false),
    [enabled, trimmed],
  );

  const [, setCustomNameVersion] = useState(0);
  const [derivedTokenWalletAddress, setDerivedTokenWalletAddress] = useState<
    string | null
  >(null);
  const [childContractCorrection, setChildContractCorrection] =
    useState<ChildContractCorrection | null>(null);

  const applyChildContractCorrection = useCallback(() => {
    if (childContractCorrection?.ownerAddress) {
      onChange(childContractCorrection.ownerAddress);
      onResolvedAddressChange?.(childContractCorrection.ownerAddress);
      setChildContractCorrection(null);
    }
  }, [childContractCorrection, onChange, onResolvedAddressChange]);

  const isUsernameInput = useMemo(() => {
    if (!enabled || !trimmed || isDirectAddress) return false;
    return trimmed.startsWith('@') || /^[a-zA-Z0-9_\- ]{2,40}$/.test(trimmed);
  }, [enabled, trimmed, isDirectAddress]);

  if (isUsernameInput && childContractCorrection !== null) {
    setChildContractCorrection(null);
  }

  const effectiveInfo = useMemo(() => {
    if (!enabled || !trimmed) return null;
    if (isDirectAddress) {
      const effective = getEffectiveUsername(trimmed, net);
      if (effective) return effective;

      try {
        const parsed = Address.parse(trimmed);
        // Try offchain FiWallet address cache
        const offchainFiWallet = getFiWalletAddress(parsed, net);
        const cacheKey = getNormalizedContractCacheKey(net, offchainFiWallet);
        const cachedEntry = getContractCacheSync<any>(cacheKey);
        const uname = extractUsernameFromState(cachedEntry?.data);
        if (uname) {
          queueMicrotask(() => {
            saveUsernameAddressMapping(uname, trimmed, net);
          });
          return { name: uname, isCustom: false, onChainName: uname };
        }

        // Also check if trimmed is already a direct FiWallet address
        const directKey = getNormalizedContractCacheKey(net, parsed);
        const directEntry = getContractCacheSync<any>(directKey);
        const directUname = extractUsernameFromState(directEntry?.data);
        if (directUname) {
          queueMicrotask(() => {
            saveUsernameAddressMapping(directUname, trimmed, net);
          });
          return {
            name: directUname,
            isCustom: false,
            onChainName: directUname,
          };
        }
      } catch {
        // Offchain calculation failed or not in L1 cache
      }

      return null;
    }
    if (isUsernameInput) {
      const clean = trimmed.replace(/^@+/, '');
      const cachedAddr = getCachedAddressByUsername(clean, net);
      if (cachedAddr) {
        const eff = getEffectiveUsername(cachedAddr, net);
        return eff || { name: clean, isCustom: false };
      }
      return null;
    }
    return null;
  }, [enabled, trimmed, isDirectAddress, isUsernameInput, net]);

  const [isResolving, setIsResolving] = useState(false);
  const [onChainUsername, setOnChainUsername] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const resolvedUsername = effectiveInfo?.name || onChainUsername;
  const isCustomName = effectiveInfo?.isCustom ?? false;
  const effectiveOnChainUsername =
    effectiveInfo?.onChainName ?? onChainUsername;

  // Suggestions from localStorage
  const suggestions = useMemo(() => {
    if (!enabled || !isUsernameInput || typeof window === 'undefined') {
      return [];
    }
    try {
      const mapping = getAllUsernames(net);
      const query = trimmed.replace(/^@+/, '').toLowerCase();
      return Object.entries(mapping)
        .filter(([uname]) =>
          query ? uname.toLowerCase().includes(query) : true,
        )
        .map(([uname, addr]) => ({
          username: uname,
          address: addr,
          isCustom: hasCustomAddressName(addr, net),
        }));
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
      // 1. Detect if this is a child contract (FiWallet / PersonalWallet)
      void detectAndResolveOwnerFromChildContract(trimmed, net).then((corr) => {
        if (isCancelled) return;
        if (corr?.isChildContract && corr.ownerAddress) {
          setChildContractCorrection(corr);
          onResolvedAddressChange?.(corr.ownerAddress);
        } else {
          setChildContractCorrection(null);
          onResolvedAddressChange?.(trimmed);
        }
      });

      // If already cached in localStorage or L1 ContractCache, skip network call
      if (effectiveInfo?.onChainName || (effectiveInfo && !isCustomName)) {
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
        setIsResolving(true);
        try {
          const parsed = parsedAddress || Address.parse(trimmed);

          // 1. Try resolving directly as contract address
          let uname: string | null = null;
          try {
            const directState = await getFiWalletStateByContractAddress(
              parsed,
              net,
            );
            uname = extractUsernameFromState(directState);
          } catch {
            // Not a direct FiWallet or failed
          }

          // 2. If not found, try as owner address
          if (!uname) {
            try {
              const ownerFiState = await getFiWalletState(parsed, { net });
              uname = extractUsernameFromState(ownerFiState);
            } catch {
              // Not an owner or failed
            }
          }

          if (isCancelled) return;

          if (uname) {
            saveUsernameAddressMapping(uname, trimmed, net);
            setOnChainUsername(uname);
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
        setIsResolving(false);
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
    effectiveInfo,
    isCustomName,
    resolvedAddress,
    net,
    onResolvedAddressChange,
  ]);

  const effectiveTargetOwner =
    childContractCorrection?.ownerAddress ||
    resolvedAddress ||
    (isDirectAddress ? trimmed : null);

  useEffect(() => {
    let isCancelled = false;
    if (!enabled || !effectiveTargetOwner || !tokenContext) {
      if (derivedTokenWalletAddress !== null) {
        queueMicrotask(() => {
          if (!isCancelled) {
            setDerivedTokenWalletAddress(null);
          }
        });
      }
      return () => {
        isCancelled = true;
      };
    }
    void deriveTokenWalletAddressOffchain({
      minterAddress: tokenContext.minterAddress,
      ownerAddress: effectiveTargetOwner,
      network: net,
      tokenSymbol: tokenContext.symbol,
      adminAddress: tokenContext.adminAddress,
    }).then((derived) => {
      if (!isCancelled) {
        setDerivedTokenWalletAddress(derived);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [
    enabled,
    effectiveTargetOwner,
    tokenContext,
    net,
    derivedTokenWalletAddress,
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
      let uname: string | null = null;
      try {
        const directState = await getFiWalletStateByContractAddress(
          parsedAddress,
          net,
          { forceFresh: true },
        );
        uname = extractUsernameFromState(directState);
      } catch {
        // Not a direct contract address
      }

      if (!uname) {
        try {
          const fiState = await getFiWalletState(parsedAddress, {
            net,
            forceFresh: true,
          });
          uname = extractUsernameFromState(fiState);
        } catch {
          // Failed owner lookup
        }
      }

      if (uname) {
        setOnChainUsername(uname);
        saveUsernameAddressMapping(uname, targetAddress, net);
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

  const setCustomName = useCallback(
    (name: string) => {
      const targetAddress =
        resolvedAddress || (isDirectAddress ? trimmed : null);
      if (!targetAddress) return;
      setCustomAddressName(targetAddress, name, net);
      setCustomNameVersion((v) => v + 1);
    },
    [resolvedAddress, isDirectAddress, trimmed, net],
  );

  const removeCustomName = useCallback(() => {
    const targetAddress = resolvedAddress || (isDirectAddress ? trimmed : null);
    if (!targetAddress) return;
    removeCustomAddressName(targetAddress, net);
    setCustomNameVersion((v) => v + 1);
  }, [resolvedAddress, isDirectAddress, trimmed, net]);

  return {
    trimmed,
    isDirectAddress,
    isUsernameInput,
    resolvedAddress,
    resolvedUsername,
    isCustomName,
    onChainUsername: effectiveOnChainUsername,
    isResolving,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    handleSelectSuggestion,
    refetchProfile,
    setCustomName,
    removeCustomName,
    net,
    derivedTokenWalletAddress,
    childContractCorrection,
    applyChildContractCorrection,
  };
}
