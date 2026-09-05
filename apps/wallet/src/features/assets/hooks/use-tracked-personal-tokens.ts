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

const STORAGE_KEY_PREFIX = 'brotherhood_tracked_personal_tokens_';

export function useTrackedPersonalTokens() {
  const queryClient = useQueryClient();
  const { currentWallet } = useWallet();
  const walletAddress = currentWallet?.address;

  const storageKey = walletAddress
    ? `${STORAGE_KEY_PREFIX}${walletAddress}`
    : null;

  // Local state for list of tracked minter addresses
  const [trackedMinters, setTrackedMinters] = useState<string[]>(() => {
    if (!storageKey || typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Re-sync with localStorage when active wallet changes
  useEffect(() => {
    if (!storageKey) {
      setTrackedMinters([]);
      return;
    }
    try {
      const saved = localStorage.getItem(storageKey);
      setTrackedMinters(saved ? JSON.parse(saved) : []);
    } catch {
      setTrackedMinters([]);
    }
  }, [storageKey]);

  const persistMinters = useCallback(
    (newMinters: string[]) => {
      setTrackedMinters(newMinters);
      if (storageKey) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(newMinters));
        } catch {
          // ignore
        }
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

      const results: DiscoveredPersonalToken[] = [];
      await Promise.all(
        trackedMinters.map(async (minterStr) => {
          try {
            const minterAddr = Address.parse(minterStr);
            const balance = await getPersonalWalletBalance(
              minterAddr,
              parsedOwnerAddress,
            );

            // Per user rule: only show tokens if balance > 0
            if (balance <= 0n) return;

            const walletAddr = await getPersonalWalletAddress(
              minterAddr,
              parsedOwnerAddress,
            );
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
              `[useTrackedPersonalTokens] Error loading ${minterStr}:`,
              err,
            );
          }
        }),
      );

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
  }, [parsedOwnerAddress, trackedMinters, persistMinters, queryClient, walletAddress]);

  // Initial discovery on first connect if never tracked before
  useEffect(() => {
    if (!storageKey || !parsedOwnerAddress) return;
    const hasDiscoveredKey = `brotherhood_discovered_initial_${walletAddress}`;
    if (!localStorage.getItem(hasDiscoveredKey)) {
      localStorage.setItem(hasDiscoveredKey, '1');
      void discoverTokens();
    }
  }, [storageKey, parsedOwnerAddress, walletAddress, discoverTokens]);

  // Manual import / add token with validation
  const addTokenManually = useCallback(
    async (
      inputAddress: string,
    ): Promise<{
      success: boolean;
      error?: string;
      token?: DiscoveredPersonalToken;
    }> => {
      if (!parsedOwnerAddress) {
        return { success: false, error: 'No wallet connected' };
      }

      let parsedMinter: Address;
      try {
        parsedMinter = Address.parse(inputAddress.trim());
      } catch {
        return { success: false, error: 'Invalid TON address format' };
      }

      // Check if it is a personal minter contract
      const isMinter = await isPersonalMinterContract(parsedMinter);
      if (!isMinter) {
        return {
          success: false,
          error:
            'Warning: This address is not a verified BrotherHood personal token minter.',
        };
      }

      const balance = await getPersonalWalletBalance(
        parsedMinter,
        parsedOwnerAddress,
      );

      const walletAddr = await getPersonalWalletAddress(
        parsedMinter,
        parsedOwnerAddress,
      );
      const meta = await fetchPersonalTokenMetadata(parsedMinter);

      const minterStr = parsedMinter.toString();
      if (!trackedMinters.includes(minterStr)) {
        const nextList = [...trackedMinters, minterStr];
        persistMinters(nextList);
      }

      await queryClient.invalidateQueries({
        queryKey: ['tracked-personal-tokens', walletAddress],
      });

      return {
        success: true,
        token: {
          minterAddress: minterStr,
          walletAddress: walletAddr.toString(),
          balance,
          name: meta.name,
          symbol: meta.symbol,
          image: meta.image,
          description: meta.description,
        },
      };
    },
    [parsedOwnerAddress, trackedMinters, persistMinters, queryClient, walletAddress],
  );

  return {
    personalTokens,
    trackedMinters,
    discoverTokens,
    addTokenManually,
    isDiscovering,
    isLoading,
    refetch,
  };
}
