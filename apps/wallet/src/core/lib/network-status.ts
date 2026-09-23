/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useSyncExternalStore } from 'react';

export class OfflineError extends Error {
  constructor(message = 'Network is offline. Serving from local cache.') {
    super(message);
    this.name = 'OfflineError';
  }
}

let currentOnlineStatus =
  typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean'
    ? navigator.onLine
    : true;
const listeners = new Set<(online: boolean) => void>();

if (
  typeof window !== 'undefined' &&
  typeof window.addEventListener === 'function'
) {
  window.addEventListener('online', () => {
    currentOnlineStatus = true;
    listeners.forEach((cb) => {
      try {
        cb(true);
      } catch (e) {
        console.error('[NetworkStatus] Error in online listener:', e);
      }
    });
  });

  window.addEventListener('offline', () => {
    currentOnlineStatus = false;
    listeners.forEach((cb) => {
      try {
        cb(false);
      } catch (e) {
        console.error('[NetworkStatus] Error in offline listener:', e);
      }
    });
  });
}

export function isOnline(): boolean {
  if (
    typeof navigator !== 'undefined' &&
    typeof navigator.onLine === 'boolean'
  ) {
    return navigator.onLine;
  }
  return currentOnlineStatus;
}

export function onNetworkStatusChange(
  cb: (online: boolean) => void,
): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

const apiFailureListeners = new Set<() => void>();

export function notifyApiCallFailed(): void {
  apiFailureListeners.forEach((cb) => {
    try {
      cb();
    } catch (e) {
      console.error('[NetworkStatus] Error in api failure listener:', e);
    }
  });
}

export function onApiCallFailed(cb: () => void): () => void {
  apiFailureListeners.add(cb);
  return () => {
    apiFailureListeners.delete(cb);
  };
}

const subscribeNetwork = (callback: () => void) => {
  return onNetworkStatusChange(callback);
};

export function useIsOnline(): boolean {
  return useSyncExternalStore(subscribeNetwork, isOnline, () => true);
}
