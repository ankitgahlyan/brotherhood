/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Address } from '@ton/core';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useWallet, useJettons, useActiveJettons } from '@demo/wallet-core';

import {
  fetchPersonalTokenMetadata,
  getPersonalWalletAddress,
  getPersonalWalletBalance,
  isPersonalMinterContract,
  type DiscoveredPersonalToken,
} from '@/lib/brotherhood/ton';
import { network, FI_ADDRESS } from '@/lib/brotherhood/config';
import {
  computePersonalWalletAddress,
  batchHydrateUniversal,
} from '@/lib/brotherhood/account-state-hydrator';
import {
  getNormalizedContractCacheKey,
  getContractCache,
  setContractCache,
} from '@/lib/brotherhood/contract-cache';
import type { PersonalStore } from '@wrappers/Personal.gen';
import type { PersonalWalletStore } from '@wrappers/PersonalWallet.gen';
import type { FiStore } from '@wrappers/FossFi.gen';

export function useTrackedPersonalTokens(additionalMinters?: string[]) {
  const queryClient = useQueryClient();
  const { currentWallet, address, getActiveWallet } = useWallet();
  const { refreshJettons } = useJettons();
  const activeJettons = useActiveJettons();
  const walletAddress =
    address || currentWallet?.getAddress() || getActiveWallet()?.address;

  const [manualMinters, setManualMinters] = useState<string[]>([]);

  // Tracked minters are dynamically derived from activeJettons (excluding FI) plus any manually imported tokens
  const trackedMinters = useMemo(() => {
    const byNorm = new Map<string, string>();
    const addMinter = (rawAddr?: string | null) => {
      if (!rawAddr) return;
      try {
        const parsed = Address.parse(rawAddr);
        if (parsed.equals(Address.parse(FI_ADDRESS))) return;
        const normKey = parsed.toRawString();
        if (!byNorm.has(normKey)) {
          byNorm.set(normKey, parsed.toString());
        }
      } catch {
        // ignore invalid address
      }
    };

    for (const j of activeJettons) {
      if (j.info?.symbol?.toUpperCase() === 'FI') continue;
      addMinter(j.address);
    }
    for (const m of manualMinters) {
      addMinter(m);
    }
    if (additionalMinters) {
      for (const m of additionalMinters) {
        addMinter(m);
      }
    }
    return Array.from(byNorm.values());
  }, [activeJettons, manualMinters, additionalMinters]);

  const parsedOwnerAddress = useMemo(() => {
    if (!walletAddress) return null;
    try {
      return Address.parse(walletAddress);
    } catch {
      return null;
    }
  }, [walletAddress]);

  const summaryCacheKey = walletAddress
    ? `personal_tokens_summary_v2:${network}:${walletAddress}`
    : null;

  const [cachedTokens, setCachedTokens] = useState<DiscoveredPersonalToken[]>(
    [],
  );

  const [prevSummaryCacheKey, setPrevSummaryCacheKey] =
    useState(summaryCacheKey);
  if (summaryCacheKey !== prevSummaryCacheKey) {
    setPrevSummaryCacheKey(summaryCacheKey);
    setCachedTokens([]);
    setManualMinters([]);
  }

  useEffect(() => {
    if (!summaryCacheKey) return;
    let isCancelled = false;
    getContractCache<DiscoveredPersonalToken[]>(summaryCacheKey).then(
      (cached) => {
        if (isCancelled) return;
        if (cached?.data && Array.isArray(cached.data)) {
          setCachedTokens(cached.data);
        } else {
          setCachedTokens([]);
        }
      },
    );
    return () => {
      isCancelled = true;
    };
  }, [summaryCacheKey]);

  const activeNetwork = getActiveWallet()?.network ?? network;

  // Pure cache assembler query: reads hydrated state directly from L1 / IndexedDB cache
  const {
    data: personalTokens = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      'tracked-personal-tokens',
      activeNetwork,
      walletAddress,
      [...trackedMinters].sort().join(','),
    ],
    queryFn: async () => {
      if (!parsedOwnerAddress || trackedMinters.length === 0) {
        if (summaryCacheKey) {
          await setContractCache(summaryCacheKey, []).catch(() => {});
        }
        return [];
      }

      const fiMinterParsed = Address.parse(FI_ADDRESS);
      const minterAddrs = trackedMinters
        .map((m) => Address.parse(m))
        .filter((addr) => !addr.equals(fiMinterParsed));

      // Off-chain compute Personal Wallet addresses using cached minter states
      const minterWalletPairs: { minterAddr: Address; walletAddr: Address }[] =
        [];
      const seenRaw = new Set<string>();
      for (const minterAddr of minterAddrs) {
        const rawKey = minterAddr.toRawString();
        if (seenRaw.has(rawKey)) continue;
        seenRaw.add(rawKey);

        const cacheKey = getNormalizedContractCacheKey(network, minterAddr);
        const minterCache = await getContractCache<PersonalStore | FiStore>(
          cacheKey,
        );
        const data = minterCache?.data;
        const isPersonalMinter = Boolean(
          data?.adminAddress &&
          ('fiJettonAddress' in data || 'codes' in data) &&
          !('others' in data),
        );
        if (isPersonalMinter && data?.adminAddress) {
          try {
            const walletAddr = computePersonalWalletAddress(
              minterAddr,
              parsedOwnerAddress,
              data.adminAddress,
            );
            minterWalletPairs.push({ minterAddr, walletAddr });
          } catch {
            /* ignore derivation error */
          }
        }
      }

      // Build results directly from hydrated cache
      const results: DiscoveredPersonalToken[] = [];
      for (const { minterAddr, walletAddr } of minterWalletPairs) {
        try {
          const walletCacheKey = getNormalizedContractCacheKey(
            network,
            walletAddr,
          );
          const walletCache =
            await getContractCache<PersonalWalletStore>(walletCacheKey);
          const balance = walletCache?.data?.jettonBalance ?? 0n;

          const meta = await fetchPersonalTokenMetadata(minterAddr);

          results.push({
            minterAddress: minterAddr.toString(),
            walletAddress: walletAddr.toString(),
            balance,
            name: meta.name,
            symbol: meta.symbol,
            image: meta.image,
            description: meta.description,
          });
        } catch (err) {
          console.warn(
            `[useTrackedPersonalTokens] Error reading token for ${minterAddr.toString()}:`,
            err,
          );
        }
      }

      if (summaryCacheKey) {
        await setContractCache(summaryCacheKey, results).catch(() => {});
      }

      return results;
    },
    enabled: Boolean(parsedOwnerAddress && trackedMinters.length > 0),
    networkMode: 'always',
  });

  const [isDiscovering, setIsDiscovering] = useState(false);

  // Lightweight refresh process: triggers central batch hydration without redundant loops
  const discoverTokens = useCallback(async () => {
    if (!parsedOwnerAddress || !walletAddress) {
      toast.error('No wallet connected');
      return;
    }

    setIsDiscovering(true);
    try {
      if (trackedMinters.length > 0) {
        await batchHydrateUniversal(trackedMinters, network, { force: true });
      }
      await refreshJettons();

      await queryClient.invalidateQueries({
        queryKey: ['tracked-personal-tokens', walletAddress],
      });
      toast.success('Tokens refreshed and up to date.');
    } catch (err) {
      console.error('[discoverTokens] Error during refresh:', err);
      toast.error('Token refresh failed. Please try again.');
    } finally {
      setIsDiscovering(false);
    }
  }, [
    parsedOwnerAddress,
    walletAddress,
    trackedMinters,
    refreshJettons,
    queryClient,
  ]);

  // Inspect contract address and return token preview
  const inspectToken = useCallback(
    async (
      inputAddress: string,
    ): Promise<{
      valid: boolean;
      error?: string;
      isVerifiedEcosystem: boolean;
      token?: DiscoveredPersonalToken;
    }> => {
      if (!parsedOwnerAddress) {
        return {
          valid: false,
          isVerifiedEcosystem: false,
          error: 'No wallet connected. Please select an active wallet.',
        };
      }

      let parsedMinter: Address;
      try {
        parsedMinter = Address.parse(inputAddress.trim());
      } catch {
        return {
          valid: false,
          isVerifiedEcosystem: false,
          error: 'Invalid TON address format.',
        };
      }

      const isMinter = await isPersonalMinterContract(parsedMinter);
      let balance = 0n;
      let walletAddrStr = '';
      try {
        balance = await getPersonalWalletBalance(
          parsedMinter,
          parsedOwnerAddress,
        );
        const walletAddr = await getPersonalWalletAddress(
          parsedMinter,
          parsedOwnerAddress,
        );
        walletAddrStr = walletAddr.toString();
      } catch {
        // May fail if contract does not match personal minter interface
      }

      const meta = await fetchPersonalTokenMetadata(parsedMinter);
      const token: DiscoveredPersonalToken = {
        minterAddress: parsedMinter.toString(),
        walletAddress: walletAddrStr,
        balance,
        name: meta.name || (isMinter ? 'Personal Token' : 'Custom Token'),
        symbol: meta.symbol || (isMinter ? 'PT' : 'TOKEN'),
        image: meta.image,
        description: meta.description,
      };

      return {
        valid: true,
        isVerifiedEcosystem: isMinter,
        token,
        error: isMinter
          ? undefined
          : 'Note: This address is not a verified BrotherHood personal token minter.',
      };
    },
    [parsedOwnerAddress],
  );

  // Manual import / add token to tracked list
  const addTokenManually = useCallback(
    async (
      inputAddress: string,
    ): Promise<{
      success: boolean;
      error?: string;
      warning?: string;
      token?: DiscoveredPersonalToken;
    }> => {
      if (!parsedOwnerAddress || !walletAddress) {
        return {
          success: false,
          error: 'No wallet connected. Please select a wallet.',
        };
      }

      const inspection = await inspectToken(inputAddress);
      if (!inspection.valid || !inspection.token) {
        return { success: false, error: inspection.error || 'Invalid address' };
      }

      const minterStr = inspection.token.minterAddress;
      const alreadyTracked = trackedMinters.some((m) => {
        try {
          return Address.parse(m).equals(Address.parse(minterStr));
        } catch {
          return m === minterStr;
        }
      });

      if (!alreadyTracked) {
        setManualMinters((prev) => [...prev, minterStr]);

        const addrsToFetch = [minterStr];
        if (inspection.token.walletAddress) {
          addrsToFetch.push(inspection.token.walletAddress);
        }
        void batchHydrateUniversal(addrsToFetch, network, { force: true });
        void refreshJettons();
      }

      await queryClient.invalidateQueries({
        queryKey: ['tracked-personal-tokens', walletAddress],
      });
      await queryClient.invalidateQueries({
        queryKey: ['verified-personal-minters'],
      });

      return {
        success: true,
        warning: !inspection.isVerifiedEcosystem ? inspection.error : undefined,
        token: inspection.token,
      };
    },
    [
      parsedOwnerAddress,
      walletAddress,
      inspectToken,
      trackedMinters,
      refreshJettons,
      queryClient,
    ],
  );

  // Untrack / remove token from tracked list
  const untrackToken = useCallback(
    async (minterAddress: string) => {
      let targetAddr: Address | null = null;
      try {
        targetAddr = Address.parse(minterAddress.trim());
      } catch {
        // pass
      }

      setManualMinters((prev) =>
        prev.filter((m) => {
          if (targetAddr) {
            try {
              return !Address.parse(m).equals(targetAddr);
            } catch {
              return m !== minterAddress;
            }
          }
          return m !== minterAddress;
        }),
      );

      await queryClient.invalidateQueries({
        queryKey: ['tracked-personal-tokens', walletAddress],
      });
    },
    [queryClient, walletAddress],
  );

  const activePersonalTokens =
    personalTokens.length > 0 ? personalTokens : cachedTokens;

  return {
    personalTokens: activePersonalTokens,
    trackedMinters,
    discoverTokens,
    addTokenManually,
    untrackToken,
    isDiscovering,
    isLoading: isLoading && activePersonalTokens.length === 0,
    refetch,
  };
}
