/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useEffect, useCallback, useRef } from 'react';
import {
  useAuth,
  useJettons,
  useRates,
  useWallet,
  useWalletStore,
} from '@demo/wallet-core';
import {
  addPersonalJettons,
  normalizeAddressString,
  loadTrackedAddresses,
} from '@/lib/brotherhood/tracked-addresses-storage';
import { notifyCacheUpdated } from '@/lib/brotherhood/contract-cache';
import { refetchAffectedAddresses } from '@/lib/brotherhood/use-tracked-contract-addresses';
import { isOnline } from '@/core/lib/network-status';

export const useWalletDataUpdater = () => {
  const {
    address,
    activeWalletId,
    updateBalance,
    hasWallet,
    currentWallet,
    loadAllWallets,
  } = useWallet();
  const { isUnlocked } = useAuth();
  const { userJettons } = useJettons();
  const { loadRates } = useRates();

  // Load wallets when hasWallet but currentWallet missing (e.g. refresh on /send before rehydration)
  useEffect(() => {
    if (hasWallet && isUnlocked && !currentWallet) {
      void loadAllWallets();
    }
  }, [hasWallet, isUnlocked, currentWallet, loadAllWallets]);

  const executeWalletSync = useCallback(async () => {
    if (!activeWalletId || !isOnline()) return;
    try {
      await Promise.allSettled([updateBalance(), loadRates()]);
      const now = Date.now();
      localStorage.setItem(`wallet_synced_${activeWalletId}`, String(now));
      notifyCacheUpdated(`wallet-data:${activeWalletId}`, now);
    } catch (err) {
      console.warn('[useWalletDataUpdater] Failed manual wallet sync:', err);
    }
  }, [activeWalletId, updateBalance, loadRates]);

  // Initial cold-cache population:
  // If the wallet has never been synced in storage, perform one initial fetch.
  useEffect(() => {
    if (!address || !activeWalletId || !isOnline()) return;

    const hasSyncedBefore = localStorage.getItem(
      `wallet_synced_${activeWalletId}`,
    );
    if (!hasSyncedBefore) {
      void executeWalletSync();
    }
  }, [activeWalletId, address, executeWalletSync]);

  // When userJettons are populated/updated, extract addresses and save to personalJettons
  useEffect(() => {
    if (!address || userJettons.length === 0) return;
    const minterAddresses = userJettons
      .map((j) => normalizeAddressString(j.address))
      .filter(Boolean);
    if (minterAddresses.length > 0) {
      addPersonalJettons(address, minterAddresses);
    }
  }, [address, userJettons]);

  // When WebSocket streaming confirms a transaction or updates trace finality,
  // trigger targeted refetch of the affected tracked contracts (FI wallet, personal wallet)
  const confirmedTraceIds = useWalletStore(
    (s) => s.walletManagement.confirmedTraceIds,
  );
  const lastConfirmedCountRef = useRef(confirmedTraceIds?.length ?? 0);

  useEffect(() => {
    const currentCount = confirmedTraceIds?.length ?? 0;
    if (currentCount > lastConfirmedCountRef.current && address && isOnline()) {
      lastConfirmedCountRef.current = currentCount;
      const tracked = loadTrackedAddresses(address);
      if (tracked) {
        const targetAddrs = [
          tracked.base.fiWallet,
          tracked.base.personalWallet,
          ...(tracked.personalWallets || []),
        ].filter(Boolean);
        if (targetAddrs.length > 0) {
          void refetchAffectedAddresses(targetAddrs);
        }
      }
    } else {
      lastConfirmedCountRef.current = currentCount;
    }
  }, [confirmedTraceIds?.length, address]);

  // Listen for global manual refresh requests from the dedicated refresh button
  useEffect(() => {
    const handleManualRefresh = () => {
      void executeWalletSync();
    };

    window.addEventListener(
      'brotherhood_manual_wallet_refresh',
      handleManualRefresh,
    );
    return () => {
      window.removeEventListener(
        'brotherhood_manual_wallet_refresh',
        handleManualRefresh,
      );
    };
  }, [executeWalletSync]);
};
