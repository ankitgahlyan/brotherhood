/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useSyncExternalStore } from 'react';

let currentTimestamp = Math.floor(Date.now() / 1000);
const listeners = new Set<() => void>();

if (typeof window !== 'undefined') {
  setInterval(() => {
    const next = Math.floor(Date.now() / 1000);
    if (next !== currentTimestamp) {
      currentTimestamp = next;
      listeners.forEach((listener) => listener());
    }
  }, 1000);
}

const subscribeClock = (callback: () => void) => {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
};

const getSnapshot = () => currentTimestamp;
const getServerSnapshot = () => 0;

/**
 * Returns the current Unix timestamp in seconds, updating every second.
 * Implemented via useSyncExternalStore to satisfy React Compiler render purity.
 */
export function useNowSeconds(): number {
  return useSyncExternalStore(subscribeClock, getSnapshot, getServerSnapshot);
}
