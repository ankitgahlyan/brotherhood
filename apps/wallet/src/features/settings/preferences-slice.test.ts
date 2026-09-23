/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { describe, it, expect, beforeEach } from 'bun:test';
import {
  createWalletStore,
  detectDefaultAnimationLevel,
} from '@demo/wallet-core';

const storageMock: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string) => storageMock[key] ?? null,
  setItem: (key: string, val: string) => {
    storageMock[key] = val;
  },
  removeItem: (key: string) => {
    delete storageMock[key];
  },
  clear: () => {
    for (const k of Object.keys(storageMock)) delete storageMock[k];
  },
};

if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as any).localStorage = mockLocalStorage;
}
if (typeof globalThis.window === 'undefined') {
  (globalThis as any).window = { localStorage: mockLocalStorage };
}

describe('PreferencesSlice & Animation Settings', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
  });

  it('detects default animation level cleanly', () => {
    const defaultLevel = detectDefaultAnimationLevel();
    expect(['none', 'performance', 'full']).toContain(defaultLevel);
  });

  it('initializes store with default animation level and updates preference', () => {
    const store = createWalletStore({
      walletKitConfig: { disableNetworkSend: true },
    });

    const initialLevel = store.getState().preferences.animationLevel;
    expect(['none', 'performance', 'full']).toContain(initialLevel);

    // Change to 'none' (Disabled)
    store.getState().setAnimationLevel('none');
    expect(store.getState().preferences.animationLevel).toBe('none');
    expect(store.getState().preferences.isCustomAnimationLevel).toBe(true);

    // Change to 'full' (Rich & Smooth)
    store.getState().setAnimationLevel('full');
    expect(store.getState().preferences.animationLevel).toBe('full');

    // Reset preferences
    store.getState().resetPreferences();
    expect(store.getState().preferences.isCustomAnimationLevel).toBe(false);
  });
});
