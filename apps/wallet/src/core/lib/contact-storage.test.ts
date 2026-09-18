/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { describe, expect, it, beforeEach } from 'bun:test';
import {
  getCachedUsername,
  getCachedAddressByUsername,
  saveUsernameAddressMapping,
  getAllUsernames,
  removeUsernameAddressMapping,
  normalizeUsername,
  normalizeContactAddress,
  setCustomAddressName,
  removeCustomAddressName,
  getCustomAddressName,
  hasCustomAddressName,
  getEffectiveUsername,
} from './contact-storage';
import {
  clearNegativeUsernameCacheForAddress,
  getNegativeUsernameCache,
} from '@/core/hooks/use-address-username-resolution';

describe('contact-storage bidirectional mappings', () => {
  const testAddress = '0QAREREREREREREREREREREREREREREREREREREREREREQBc';
  const network = 'testnet';

  const store: Record<string, string> = {};
  const mockLocalStorage = {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, val: string) => {
      store[key] = val;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      for (const k of Object.keys(store)) delete store[k];
    },
  };

  (globalThis as any).localStorage = mockLocalStorage;
  if (typeof globalThis.window === 'undefined') {
    (globalThis as any).window = { localStorage: mockLocalStorage };
  } else {
    (globalThis as any).window.localStorage = mockLocalStorage;
  }

  beforeEach(() => {
    mockLocalStorage.clear();
    if (typeof globalThis.localStorage?.clear === 'function') {
      globalThis.localStorage.clear();
    }
    getNegativeUsernameCache().clear();
  });

  it('normalizes usernames properly', () => {
    expect(normalizeUsername('@Alice')).toBe('alice');
    expect(normalizeUsername('  @@Bob_99  ')).toBe('bob_99');
    expect(normalizeUsername('charlie')).toBe('charlie');
  });

  it('normalizes addresses to raw string if valid', () => {
    const raw = normalizeContactAddress(testAddress);
    expect(raw).toMatch(/^0:[a-f0-9]{64}$/i);
  });

  it('saves and retrieves bidirectional mappings', () => {
    saveUsernameAddressMapping('alice_crypto', testAddress, network);

    // 1. By exact username (with and without @)
    expect(getCachedAddressByUsername('alice_crypto', network)).toBe(
      testAddress,
    );
    expect(getCachedAddressByUsername('@alice_crypto', network)).toBe(
      testAddress,
    );
    expect(getCachedAddressByUsername('ALICE_CRYPTO', network)).toBe(
      testAddress,
    );

    // 2. By address
    expect(getCachedUsername(testAddress, network)).toBe('alice_crypto');

    // 3. By raw address
    const rawAddress = normalizeContactAddress(testAddress);
    expect(getCachedUsername(rawAddress, network)).toBe('alice_crypto');

    // 4. In all usernames list
    const all = getAllUsernames(network);
    expect(all['alice_crypto']).toBe(testAddress);
  });

  it('removes username and address mapping', () => {
    saveUsernameAddressMapping('bob', testAddress, network);
    expect(getCachedUsername(testAddress, network)).toBe('bob');
    expect(getCachedAddressByUsername('bob', network)).toBe(testAddress);

    removeUsernameAddressMapping('bob', testAddress, network);
    expect(getCachedUsername(testAddress, network)).toBeNull();
    expect(getCachedAddressByUsername('bob', network)).toBeNull();
  });

  it('clears negative cache for given address', () => {
    const cache = getNegativeUsernameCache();
    cache.add(`${network}:${testAddress}`);
    expect(cache.size).toBe(1);

    clearNegativeUsernameCacheForAddress(testAddress, network);
    expect(cache.has(`${network}:${testAddress}`)).toBe(false);
  });

  describe('custom address renaming and global override', () => {
    it('sets a custom name for an address without on-chain username', () => {
      expect(getCachedUsername(testAddress, network)).toBeNull();
      setCustomAddressName(testAddress, 'Alice Work', network);

      expect(hasCustomAddressName(testAddress, network)).toBe(true);
      expect(getCustomAddressName(testAddress, network)).toBe('Alice Work');
      // getCachedUsername returns custom name
      expect(getCachedUsername(testAddress, network)).toBe('Alice Work');
      // reverse lookup finds address by custom name
      expect(getCachedAddressByUsername('Alice Work', network)).toBe(
        testAddress,
      );
      expect(getCachedAddressByUsername('@Alice Work', network)).toBe(
        testAddress,
      );
    });

    it('custom name overrides existing on-chain username and restoring restores on-chain name', () => {
      saveUsernameAddressMapping('alice_crypto', testAddress, network);
      expect(getCachedUsername(testAddress, network)).toBe('alice_crypto');

      // Set custom nickname
      setCustomAddressName(testAddress, 'Binance Cold Wallet', network);

      // getCachedUsername is overridden everywhere
      expect(getCachedUsername(testAddress, network)).toBe(
        'Binance Cold Wallet',
      );

      // Effective username inspection
      const effective = getEffectiveUsername(testAddress, network);
      expect(effective?.isCustom).toBe(true);
      expect(effective?.name).toBe('Binance Cold Wallet');
      expect(effective?.onChainName).toBe('alice_crypto');

      // Both names resolve to the address in reverse lookup (custom takes precedence)
      expect(getCachedAddressByUsername('Binance Cold Wallet', network)).toBe(
        testAddress,
      );
      expect(getCachedAddressByUsername('alice_crypto', network)).toBe(
        testAddress,
      );

      // Removing custom nickname restores on-chain username
      removeCustomAddressName(testAddress, network);
      expect(hasCustomAddressName(testAddress, network)).toBe(false);
      expect(getCachedUsername(testAddress, network)).toBe('alice_crypto');
      const restored = getEffectiveUsername(testAddress, network);
      expect(restored?.isCustom).toBe(false);
      expect(restored?.name).toBe('alice_crypto');
    });
  });
});
