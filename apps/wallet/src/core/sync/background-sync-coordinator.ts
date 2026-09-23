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
 * BackgroundSyncCoordinator listens for network online events to restore
 * synchronization after connectivity loss without polling on tab/window focus.
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

      // Ensure WebSocket streaming is connected if disconnected while offline
      if (!state.walletManagement.isStreamingConnected) {
        void state.startWebSocketStreaming();
      }

      // Refresh balance and events once upon network restoration
      void state.updateBalance();
      void state.loadEvents(15, 0, false);
      if (state.loadRates) {
        void state.loadRates();
      }
    };

    const handleOnline = () => {
      triggerSync('network_online');
    };

    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [storeApi]);
}
