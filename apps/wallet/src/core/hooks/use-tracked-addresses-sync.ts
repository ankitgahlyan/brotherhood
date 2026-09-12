/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useEffect, useRef } from 'react';
import { useWallet } from '@demo/wallet-core';
import {
  saveCurrentSelectedWallet,
  initializeOrGetTrackedAddresses,
  normalizeAddressString,
} from '@/lib/brotherhood/tracked-addresses-storage';
import { useTrackedContractAddresses } from '@/lib/brotherhood/use-tracked-contract-addresses';

/**
 * Top-level hook to manage tracked contract addresses lifecycle:
 * 1. Synchronizes selected active wallet to localStorage ("current_selected_wallet")
 * 2. Computes and saves base off-chain derived addresses (owner, fi, fiWallet, personal, personalWallet)
 * 3. Triggers universal background hydration on app bootstrap or wallet selection change
 */
export function useTrackedAddressesSync() {
  const { address, activeWalletId } = useWallet();
  const normalizedAddr = address ? normalizeAddressString(address) : '';
  const lastSyncedAddrRef = useRef<string | null>(null);

  const { refetchAll } = useTrackedContractAddresses({
    ownerAddress: normalizedAddr || null,
  });

  useEffect(() => {
    if (!normalizedAddr) return;

    // 1. Save current wallet selection change to localStorage
    saveCurrentSelectedWallet(normalizedAddr);

    // 2. Ensure base addresses are calculated off-chain and persisted to localStorage
    initializeOrGetTrackedAddresses(normalizedAddr);

    // 3. Trigger initial background hydration if this wallet has not been hydrated in this session
    if (lastSyncedAddrRef.current !== normalizedAddr) {
      lastSyncedAddrRef.current = normalizedAddr;

      // Non-blocking background fetch
      refetchAll().catch((err) => {
        console.error(
          '[useTrackedAddressesSync] Background universal hydration error for wallet:',
          normalizedAddr,
          err,
        );
      });
    }
  }, [normalizedAddr, activeWalletId, refetchAll]);
}
