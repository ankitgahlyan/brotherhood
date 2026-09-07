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
});
