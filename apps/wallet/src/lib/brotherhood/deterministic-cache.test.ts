import { describe, it, expect, beforeEach } from 'bun:test';
import { Address } from '@ton/core';
import {
  getDeterministicWalletStorageKey,
  getCachedDeterministicWalletAddress,
  setCachedDeterministicWalletAddress,
} from './ton';
import { getNormalizedContractCacheKey } from './contract-cache';

describe('Deterministic Address Caching', () => {
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

  if (typeof globalThis.localStorage === 'undefined') {
    (globalThis as any).localStorage = mockLocalStorage;
  }
  if (typeof globalThis.window === 'undefined') {
    (globalThis as any).window = { localStorage: mockLocalStorage };
  }

  const dummyMinter = Address.parse(
    '0:0000000000000000000000000000000000000000000000000000000000000001',
  );
  const dummyOwner = Address.parse(
    '0:0000000000000000000000000000000000000000000000000000000000000002',
  );
  const dummyWallet = Address.parse(
    '0:0000000000000000000000000000000000000000000000000000000000000003',
  );

  beforeEach(() => {
    globalThis.localStorage.clear();
  });

  it('generates expected storage key format', () => {
    const key = getDeterministicWalletStorageKey(
      'testnet',
      dummyMinter,
      dummyOwner,
    );
    expect(key).toBe(
      `deterministic_wallet:testnet:${dummyMinter.toString()}:${dummyOwner.toString()}`,
    );
  });

  it('stores and retrieves cached deterministic address from localStorage', () => {
    expect(
      getCachedDeterministicWalletAddress('testnet', dummyMinter, dummyOwner),
    ).toBeNull();

    setCachedDeterministicWalletAddress(
      'testnet',
      dummyMinter,
      dummyOwner,
      dummyWallet,
    );

    const retrieved = getCachedDeterministicWalletAddress(
      'testnet',
      dummyMinter,
      dummyOwner,
    );
    expect(retrieved).not.toBeNull();
    expect(retrieved?.toString()).toBe(dummyWallet.toString());
  });

  it('generates normalized contract cache key correctly', () => {
    const key = getNormalizedContractCacheKey('testnet', dummyWallet);
    expect(key).toBe(`contract_state:testnet:${dummyWallet.toString()}`);
  });

  it('produces identical normalized cache keys across hex, bounceable, non-bounceable, and Address object formats', () => {
    const rawHex = dummyWallet.toRawString();
    const bounceable = dummyWallet.toString({
      bounceable: true,
      urlSafe: true,
    });
    const nonBounceable = dummyWallet.toString({
      bounceable: false,
      urlSafe: true,
    });

    const keyObj = getNormalizedContractCacheKey('testnet', dummyWallet);
    const keyHex = getNormalizedContractCacheKey('testnet', rawHex);
    const keyBounce = getNormalizedContractCacheKey('testnet', bounceable);
    const keyNonBounce = getNormalizedContractCacheKey(
      'testnet',
      nonBounceable,
    );

    expect(keyHex).toBe(keyObj);
    expect(keyBounce).toBe(keyObj);
    expect(keyNonBounce).toBe(keyObj);
  });

  it('serves reads synchronously from L1 memory cache after write', async () => {
    const {
      setContractCache,
      getContractCache,
      getLastFetchTime,
      clearContractCache,
    } = await import('./contract-cache');
    await clearContractCache();

    const testKey = 'contract_state:testnet:mock_addr';
    const testData = { active: true, balance: 500n };

    await setContractCache(testKey, testData);

    // Should return from L1 cache instantly
    const cached = await getContractCache<typeof testData>(testKey);
    expect(cached).not.toBeNull();
    expect(cached?.data.active).toBe(true);
    expect(cached?.data.balance).toBe(500n);

    // Global fetch time should be set without needing IDB table scan
    const lastFetch = await getLastFetchTime();
    expect(lastFetch).not.toBeNull();
    expect(lastFetch).toBe(cached?.timestamp ?? 0);
  });
});
