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
import { useWallet } from '@demo/wallet-core';

import {
  discoverPersonalTokensForWallet,
  fetchPersonalTokenMetadata,
  getPersonalWalletAddress,
  getPersonalWalletBalance,
  isPersonalMinterContract,
  type DiscoveredPersonalToken,
} from '@/lib/brotherhood/ton';
import { network } from '@/lib/brotherhood/config';
import {
  batchHydrateUniversal,
  computePersonalWalletAddress,
  computeFiWalletAddress,
} from '@/lib/brotherhood/account-state-hydrator';
import {
  getNormalizedContractCacheKey,
  getContractCache,
} from '@/lib/brotherhood/contract-cache';
import {
  settingsStorage,
  SettingsKeys,
  StringArraySchema,
} from '@/core/storage';

const STORAGE_KEY_PREFIX = SettingsKeys.TRACKED_PERSONAL_TOKENS_PREFIX;

export function useTrackedPersonalTokens() {
  const queryClient = useQueryClient();
  const { currentWallet, address, getActiveWallet } = useWallet();
  const walletAddress =
    address || currentWallet?.getAddress() || getActiveWallet()?.address;

  const storageKey = walletAddress
    ? `${STORAGE_KEY_PREFIX}${walletAddress}`
    : null;

  // Local state for list of tracked minter addresses
  const [trackedMinters, setTrackedMinters] = useState<string[]>(() => {
    if (!storageKey) return [];
    return settingsStorage.get(storageKey, StringArraySchema, []);
  });

  // Re-sync with settingsStorage when active wallet changes
  useEffect(() => {
    if (!storageKey) {
      setTrackedMinters([]);
      return;
    }
    setTrackedMinters(settingsStorage.get(storageKey, StringArraySchema, []));

    return settingsStorage.subscribe(storageKey, () => {
      setTrackedMinters(settingsStorage.get(storageKey, StringArraySchema, []));
    });
  }, [storageKey]);

  const persistMinters = useCallback(
    (newMinters: string[]) => {
      setTrackedMinters(newMinters);
      if (storageKey) {
        settingsStorage.set(storageKey, newMinters);
      }
    },
    [storageKey],
  );

  const parsedOwnerAddress = useMemo(() => {
    if (!walletAddress) return null;
    try {
      return Address.parse(walletAddress);
    } catch {
      return null;
    }
  }, [walletAddress]);

  // Query live balance and metadata for all tracked minters
  const {
    data: personalTokens = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      'tracked-personal-tokens',
      walletAddress,
      [...trackedMinters].sort().join(','),
    ],
    queryFn: async () => {
      if (!parsedOwnerAddress || trackedMinters.length === 0) return [];

      // 1. Off-chain compute FI wallet address and Personal Wallet addresses if cached
      const fiWalletAddr = computeFiWalletAddress(parsedOwnerAddress);
      const minterAddrs = trackedMinters.map((m) => Address.parse(m));

      // Batch 1: FI wallet + all tracked personal minters in 1 call
      await batchHydrateUniversal([fiWalletAddr, ...minterAddrs], network, {
        knownTypes: {
          [fiWalletAddr.toString()]: 'fiWallet',
          ...Object.fromEntries(
            minterAddrs.map((m) => [m.toString(), 'personalMinter']),
          ),
        },
      });

      // 2. Off-chain compute Personal Wallet addresses using cached minter states
      const minterWalletPairs: { minterAddr: Address; walletAddr: Address }[] =
        [];
      for (const minterAddr of minterAddrs) {
        const cacheKey = getNormalizedContractCacheKey(network, minterAddr);
        const minterCache = await getContractCache<any>(cacheKey);
        const adminAddress = minterCache?.data?.adminAddress;
        if (adminAddress) {
          const walletAddr = computePersonalWalletAddress(
            minterAddr,
            parsedOwnerAddress,
            adminAddress,
          );
          minterWalletPairs.push({ minterAddr, walletAddr });
        }
      }

      // 3. Batch-hydrate Personal Wallets if any
      if (minterWalletPairs.length > 0) {
        await batchHydrateUniversal(minterWalletPairs.map((p) => p.walletAddr));
      }

      // 4. Build results directly from hydrated cache (with fallback)
      const results: DiscoveredPersonalToken[] = [];
      for (const { minterAddr, walletAddr } of minterWalletPairs) {
        try {
          const walletCacheKey = getNormalizedContractCacheKey(
            network,
            walletAddr,
          );
          const walletCache = await getContractCache<any>(walletCacheKey);
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

      return results;
    },
    enabled: Boolean(parsedOwnerAddress && trackedMinters.length > 0),
  });

  const [isDiscovering, setIsDiscovering] = useState(false);

  // Discovery process: scans account history, traces, and FI wallet
  const discoverTokens = useCallback(async () => {
    if (!parsedOwnerAddress) {
      toast.error('No wallet connected');
      return;
    }

    setIsDiscovering(true);
    try {
      const found = await discoverPersonalTokensForWallet(parsedOwnerAddress);

      if (found.length === 0) {
        toast.info('No new personal tokens with balance > 0 found.');
      } else {
        // Merge newly discovered minters into trackedMinters
        const existingSet = new Set(trackedMinters);
        let addedCount = 0;

        for (const token of found) {
          if (!existingSet.has(token.minterAddress)) {
            existingSet.add(token.minterAddress);
            addedCount++;
          }
        }

        const nextList = Array.from(existingSet);
        persistMinters(nextList);

        if (addedCount > 0) {
          toast.success(
            `Discovered ${addedCount} personal token${addedCount > 1 ? 's' : ''}!`,
          );
        } else {
          toast.success('Tokens refreshed and up to date.');
        }

        await queryClient.invalidateQueries({
          queryKey: ['tracked-personal-tokens', walletAddress],
        });
      }
    } catch (err) {
      console.error('[discoverTokens] Error during discovery:', err);
      toast.error('Token discovery failed. Please try again.');
    } finally {
      setIsDiscovering(false);
    }
  }, [
    parsedOwnerAddress,
    trackedMinters,
    persistMinters,
    queryClient,
    walletAddress,
  ]);

  // Initial discovery on first connect if never tracked before
  useEffect(() => {
    if (!storageKey || !parsedOwnerAddress) return;
    const hasDiscoveredKey = `${SettingsKeys.DISCOVERED_INITIAL_PREFIX}${walletAddress}`;
    if (!settingsStorage.getRaw(hasDiscoveredKey)) {
      settingsStorage.set(hasDiscoveredKey, '1');
      void discoverTokens();
    }
  }, [storageKey, parsedOwnerAddress, walletAddress, discoverTokens]);

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
      if (!parsedOwnerAddress) {
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
        const nextList = [...trackedMinters, minterStr];
        persistMinters(nextList);
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
      inspectToken,
      trackedMinters,
      persistMinters,
      queryClient,
      walletAddress,
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

      const nextList = trackedMinters.filter((m) => {
        if (targetAddr) {
          try {
            return !Address.parse(m).equals(targetAddr);
          } catch {
            return m !== minterAddress;
          }
        }
        return m !== minterAddress;
      });

      persistMinters(nextList);

      await queryClient.invalidateQueries({
        queryKey: ['tracked-personal-tokens', walletAddress],
      });
    },
    [trackedMinters, persistMinters, queryClient, walletAddress],
  );

  return {
    personalTokens,
    trackedMinters,
    discoverTokens,
    addTokenManually,
    untrackToken,
    isDiscovering,
    isLoading,
    refetch,
  };
}
