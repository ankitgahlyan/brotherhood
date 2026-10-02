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
import {
  isTonChainDns,
  resolveAddressByDomain,
  type BroDomainAuctionInfo,
} from '@/core/lib/dns';
import { useContactBookStore } from '@/core/storage/useContactBookStore';

const API_RESOLUTION_DEBOUNCE_MS = 3000;

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
  isDnsInput: boolean;
  resolvedAddress: string | null;
  resolvedUsername: string | null;
  resolvedDnsAddress: string | null;
  isDnsResolved: boolean;
  dnsAuctionInfo: BroDomainAuctionInfo | null;
  isCustomName: boolean;
  onChainUsername: string | null;
  isResolving: boolean;
  suggestions: {
    username: string;
    address: string;
    isCustom?: boolean;
    isDns?: boolean;
  }[];
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

  const isDnsInput = useMemo(() => {
    if (!enabled || !trimmed || isDirectAddress) return false;
    return isTonChainDns(trimmed, net);
  }, [enabled, trimmed, isDirectAddress, net]);

  const [asyncResolvedDns, setAsyncResolvedDns] = useState<{
    domain: string;
    address: string;
  } | null>(null);

  const isUsernameInput = useMemo(() => {
    if (!enabled || !trimmed || isDirectAddress || isDnsInput) return false;
    if (trimmed.startsWith('@')) {
      const handle = trimmed.replace(/^@+/, '');
      return /^[a-zA-Z0-9_\- ]{1,40}$/.test(handle);
    }
    return /^[a-zA-Z0-9_\- ]{1,40}$/.test(trimmed);
  }, [enabled, trimmed, isDirectAddress, isDnsInput]);

  const canFallbackToBroDns = useMemo(() => {
    if (!enabled || !isUsernameInput || trimmed.startsWith('@')) return false;
    return /^[-\da-z]{1,126}$/i.test(trimmed);
  }, [enabled, isUsernameInput, trimmed]);

  const localDnsAddress = useMemo(() => {
    if (!enabled) return null;
    if (isDnsInput) {
      return useContactBookStore.getState().resolveAddress(trimmed, net);
    }
    if (canFallbackToBroDns && !getCachedAddressByUsername(trimmed, net)) {
      return useContactBookStore
        .getState()
        .resolveAddress(`${trimmed.toLowerCase()}.bro`, net);
    }
    return null;
  }, [enabled, isDnsInput, canFallbackToBroDns, trimmed, net]);

  const resolvedDnsAddress =
    localDnsAddress ||
    (asyncResolvedDns &&
    (asyncResolvedDns.domain.toLowerCase() === trimmed.toLowerCase() ||
      asyncResolvedDns.domain.toLowerCase() === `${trimmed.toLowerCase()}.bro`)
      ? asyncResolvedDns.address
      : null);

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

  if ((isUsernameInput || isDnsInput) && childContractCorrection !== null) {
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
      if (resolvedDnsAddress) {
        return { name: `${clean.toLowerCase()}.bro`, isCustom: false };
      }
      return null;
    }
    return null;
  }, [
    enabled,
    trimmed,
    isDirectAddress,
    isUsernameInput,
    resolvedDnsAddress,
    net,
  ]);

  const [isResolving, setIsResolving] = useState(false);
  const [onChainUsername, setOnChainUsername] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const resolvedUsername = effectiveInfo?.name || onChainUsername;
  const isCustomName = effectiveInfo?.isCustom ?? false;
  const effectiveOnChainUsername =
    effectiveInfo?.onChainName ?? onChainUsername;

  // Suggestions from Contact Book and localStorage
  const suggestions = useMemo(() => {
    if (
      !enabled ||
      (!isUsernameInput && !isDnsInput) ||
      typeof window === 'undefined'
    ) {
      return [];
    }
    try {
      const query = trimmed.replace(/^@+/, '').toLowerCase();
      const results: {
        username: string;
        address: string;
        isCustom?: boolean;
        isDns?: boolean;
      }[] = [];

      // 1. From Contact Book (custom names, onChainUsernames, dnsDomains)
      const contacts =
        useContactBookStore.getState().contactsByNetwork[net] || {};
      for (const c of Object.values(contacts)) {
        if (
          c.dnsDomain &&
          (query ? c.dnsDomain.toLowerCase().includes(query) : true)
        ) {
          if (!results.some((r) => r.username === c.dnsDomain)) {
            results.push({
              username: c.dnsDomain,
              address: c.address,
              isDns: true,
            });
          }
        }
        if (
          c.customName &&
          (query ? c.customName.toLowerCase().includes(query) : true)
        ) {
          if (!results.some((r) => r.username === c.customName)) {
            results.push({
              username: c.customName,
              address: c.address,
              isCustom: true,
            });
          }
        }
      }

      // 2. From brotherhood username mapping
      const mapping = getAllUsernames(net);
      for (const [uname, addr] of Object.entries(mapping)) {
        if (query ? uname.toLowerCase().includes(query) : true) {
          if (
            !results.some((r) => r.address === addr || r.username === uname)
          ) {
            results.push({
              username: uname,
              address: addr,
              isCustom: hasCustomAddressName(addr, net),
            });
          }
        }
      }

      return results;
    } catch {
      return [];
    }
  }, [enabled, isUsernameInput, isDnsInput, trimmed, net]);

  // Resolved address computation
  const resolvedAddress = useMemo(() => {
    if (!enabled) return null;
    if (isDirectAddress) return trimmed;
    if (isDnsInput) return resolvedDnsAddress;
    if (isUsernameInput) {
      const clean = trimmed.replace(/^@+/, '');
      return getCachedAddressByUsername(clean, net) || resolvedDnsAddress;
    }
    return null;
  }, [
    enabled,
    isDirectAddress,
    isDnsInput,
    resolvedDnsAddress,
    isUsernameInput,
    trimmed,
    net,
  ]);

  // Sync resolution: instant from local cache (0ms), 3s debounce for single on-chain API call on cache miss
  useEffect(() => {
    if (!enabled || !trimmed) {
      onResolvedAddressChange?.(null);
      return;
    }

    let isCancelled = false;

    if (isDnsInput) {
      if (localDnsAddress) {
        onResolvedAddressChange?.(localDnsAddress);
        return;
      }

      if (asyncResolvedDns?.domain.toLowerCase() === trimmed.toLowerCase()) {
        onResolvedAddressChange?.(asyncResolvedDns.address);
        return;
      }

      const timer = setTimeout(async () => {
        setIsResolving(true);
        try {
          const resolved = await resolveAddressByDomain(trimmed, net);
          if (isCancelled) return;

          if (resolved) {
            setAsyncResolvedDns({ domain: trimmed, address: resolved });
            useContactBookStore
              .getState()
              .saveDnsDomain(resolved, trimmed, net);
            onResolvedAddressChange?.(resolved);
          } else {
            onResolvedAddressChange?.(null);
          }
        } catch {
          if (!isCancelled) {
            onResolvedAddressChange?.(null);
          }
        } finally {
          if (!isCancelled) {
            setIsResolving(false);
          }
        }
      }, API_RESOLUTION_DEBOUNCE_MS);

      return () => {
        isCancelled = true;
        clearTimeout(timer);
        setIsResolving(false);
      };
    }

    if (isDirectAddress) {
      // 1. Detect if this is a child contract (FiWallet / PersonalWallet) from local cache
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

      // If on-chain username is already cached in localStorage or L1 ContractCache, skip network call
      if (effectiveInfo?.onChainName) {
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

      // Single on-chain FiWallet lookup after 3s debounce
      const timer = setTimeout(async () => {
        setIsResolving(true);
        try {
          const parsed = parsedAddress || Address.parse(trimmed);
          const ownerFiState = await getFiWalletState(parsed, { net });
          const uname = extractUsernameFromState(ownerFiState);

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
      }, API_RESOLUTION_DEBOUNCE_MS);

      return () => {
        isCancelled = true;
        clearTimeout(timer);
        setIsResolving(false);
      };
    }

    if (isUsernameInput) {
      if (resolvedAddress) {
        onResolvedAddressChange?.(resolvedAddress);
        return;
      }

      if (canFallbackToBroDns) {
        const broDomain = `${trimmed.toLowerCase()}.bro`;
        const timer = setTimeout(async () => {
          setIsResolving(true);
          try {
            const resolved = await resolveAddressByDomain(broDomain, net);
            if (isCancelled) return;

            if (resolved) {
              setAsyncResolvedDns({ domain: broDomain, address: resolved });
              useContactBookStore
                .getState()
                .saveDnsDomain(resolved, broDomain, net);
              onResolvedAddressChange?.(resolved);
            } else {
              onResolvedAddressChange?.(null);
            }
          } catch {
            if (!isCancelled) {
              onResolvedAddressChange?.(null);
            }
          } finally {
            if (!isCancelled) {
              setIsResolving(false);
            }
          }
        }, API_RESOLUTION_DEBOUNCE_MS);

        return () => {
          isCancelled = true;
          clearTimeout(timer);
          setIsResolving(false);
        };
      }

      onResolvedAddressChange?.(null);
    }
  }, [
    enabled,
    trimmed,
    isDirectAddress,
    isDnsInput,
    canFallbackToBroDns,
    localDnsAddress,
    asyncResolvedDns,
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
      const fiState = await getFiWalletState(parsedAddress, {
        net,
        forceFresh: true,
      });
      const uname = extractUsernameFromState(fiState);

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
    isDnsInput,
    resolvedAddress,
    resolvedUsername,
    resolvedDnsAddress,
    isDnsResolved: Boolean(
      isDnsInput && (resolvedDnsAddress || resolvedAddress),
    ),
    dnsAuctionInfo: null,
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
