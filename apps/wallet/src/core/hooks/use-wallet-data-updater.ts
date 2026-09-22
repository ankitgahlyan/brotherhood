/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useEffect, useCallback, useRef } from 'react';
import { useAuth, useRates, useWallet } from '@demo/wallet-core';
import { notifyCacheUpdated } from '@/lib/brotherhood/contract-cache';
import { isOnline } from '@/core/lib/network-status';

export const useWalletDataUpdater = () => {
  const { address, activeWalletId, hasWallet, currentWallet, loadAllWallets } =
    useWallet();
  const { isUnlocked } = useAuth();
  const { loadRates } = useRates();

  // Load wallets when hasWallet but currentWallet missing (e.g. refresh on /send before rehydration)
  const isLoadingRef = useRef(false);
  useEffect(() => {
    if (hasWallet && isUnlocked && !currentWallet && !isLoadingRef.current) {
      isLoadingRef.current = true;
      void loadAllWallets().finally(() => {
        isLoadingRef.current = false;
      });
    }
  }, [hasWallet, isUnlocked, currentWallet, loadAllWallets]);

  const executeWalletSync = useCallback(async () => {
    if (!activeWalletId || !isOnline()) return;
    try {
      await Promise.allSettled([loadRates()]);
      const now = Date.now();
      localStorage.setItem(`wallet_synced_${activeWalletId}`, String(now));
      notifyCacheUpdated(`wallet-data:${activeWalletId}`, now);
    } catch (err) {
      console.warn('[useWalletDataUpdater] Failed manual wallet sync:', err);
    }
  }, [activeWalletId, loadRates]);

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

  // When WebSocket streaming confirms a transaction or updates trace finality,
  // trigger targeted refetch of the affected tracked contracts (FI wallet, personal wallet)
  // const confirmedTraceIds = useWalletStore(
  //   (s) => s.walletManagement.confirmedTraceIds,
  // );
  // const lastConfirmedCountRef = useRef(confirmedTraceIds?.length ?? 0);

  // useEffect(() => {
  //   const currentCount = confirmedTraceIds?.length ?? 0;
  //   if (currentCount > lastConfirmedCountRef.current && address && isOnline()) {
  //     lastConfirmedCountRef.current = currentCount;
  //     const tracked = loadTrackedAddresses(address);
  //     if (tracked) {
  //       const targetAddrs = [
  //         tracked.base.fiWallet,
  //         tracked.base.personalWallet,
  //         ...(tracked.personalWallets || []),
  //       ].filter(Boolean);
  //       if (targetAddrs.length > 0) {
  //         // todo: fetch all
  //         void refetchAffectedAddresses(targetAddrs);
  //       }
  //     }
  //   } else {
  //     lastConfirmedCountRef.current = currentCount;
  //   }
  // }, [confirmedTraceIds?.length, address]);

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
