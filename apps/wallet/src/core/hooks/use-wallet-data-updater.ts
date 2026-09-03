/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useEffect, useCallback } from 'react';
import {
  useAuth,
  useJettons,
  useNfts,
  useRates,
  useWallet,
} from '@demo/wallet-core';
import { notifyCacheUpdated } from '@/lib/brotherhood/contract-cache';

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
  const { loadUserJettons } = useJettons();
  const { loadUserNfts } = useNfts();
  const { loadRates } = useRates();

  // Load wallets when hasWallet but currentWallet missing (e.g. refresh on /send before rehydration)
  useEffect(() => {
    if (hasWallet && isUnlocked && !currentWallet) {
      void loadAllWallets();
    }
  }, [hasWallet, isUnlocked, currentWallet, loadAllWallets]);

  const executeWalletSync = useCallback(async () => {
    if (!activeWalletId) return;
    try {
      await Promise.allSettled([
        updateBalance(),
        loadUserJettons(),
        loadUserNfts(),
        loadRates(),
      ]);
      const now = Date.now();
      localStorage.setItem(`wallet_synced_${activeWalletId}`, String(now));
      notifyCacheUpdated(`wallet-data:${activeWalletId}`, now);
    } catch (err) {
      console.warn('[useWalletDataUpdater] Failed manual wallet sync:', err);
    }
  }, [activeWalletId, updateBalance, loadUserJettons, loadUserNfts, loadRates]);

  // Initial cold-cache population only:
  // If the wallet has never been synced in storage, perform one initial fetch.
  // Once synced, subsequent app reloads immediately show cached state without auto-fetching.
  useEffect(() => {
    if (!address || !activeWalletId) return;

    const hasSyncedBefore = localStorage.getItem(
      `wallet_synced_${activeWalletId}`,
    );
    if (!hasSyncedBefore) {
      void executeWalletSync();
    }
  }, [activeWalletId, address, executeWalletSync]);

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
