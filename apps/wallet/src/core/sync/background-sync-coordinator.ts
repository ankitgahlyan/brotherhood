/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useEffect } from 'react';
import { useWalletStoreApi } from '@demo/wallet-core';
import { createComponentLogger } from '@/core/lib/logger';

const log = createComponentLogger('BackgroundSyncCoordinator');

const SYNC_THROTTLE_MS = 15_000;

/**
 * BackgroundSyncCoordinator uses transient store access & browser event listeners
 * (visibilitychange, focus, online) to automatically refresh wallet balance and events
 * without creating circular React render feedback loops.
 */
export function useBackgroundSyncCoordinator() {
  const storeApi = useWalletStoreApi();

  useEffect(() => {
    let lastSyncTime = Date.now();

    const triggerSync = (reason: string) => {
      const now = Date.now();
      if (now - lastSyncTime < SYNC_THROTTLE_MS) {
        return;
      }
      lastSyncTime = now;

      const state = storeApi.getState();
      const activeAddress = state.walletManagement.address;

      if (!activeAddress || !state.walletManagement.hasWallet) {
        return;
      }

      log.info(`Triggering background sync (${reason}) for ${activeAddress}`);

      // Refresh balance and events
      void state.updateBalance();
      void state.loadEvents(15, 0, false);
      if (state.loadRates) {
        void state.loadRates();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        triggerSync('tab_focus');
      }
    };

    const handleWindowFocus = () => {
      triggerSync('window_focus');
    };

    const handleOnline = () => {
      triggerSync('network_online');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('online', handleOnline);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('online', handleOnline);
    };
  }, [storeApi]);
}
