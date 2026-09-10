import { describe, it, expect, beforeEach } from 'bun:test';
import {
  getCustomApiKey,
  setCustomApiKey,
  getTestnetApiProvider,
  setTestnetApiProvider,
  getTestnetRpcRouting,
  setTestnetRpcRouting,
  isCustomEndpointActive,
  setCustomEndpointActive,
} from './network-api-keys';
import { toncenterApiKey, resetTonClients } from '@/lib/brotherhood/ton';

describe('Network API Keys Manager', () => {
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

  beforeEach(() => {
    globalThis.localStorage.clear();
    resetTonClients();
  });

  it('stores and retrieves Toncenter and TonAPI custom keys', () => {
    expect(getCustomApiKey('toncenter', 'testnet')).toBeNull();
    expect(getCustomApiKey('tonapi', 'testnet')).toBeNull();

    setCustomApiKey('toncenter', 'testnet', 'custom_toncenter_key_123');
    setCustomApiKey('tonapi', 'testnet', 'custom_tonapi_key_456');

    expect(getCustomApiKey('toncenter', 'testnet')).toBe(
      'custom_toncenter_key_123',
    );
    expect(getCustomApiKey('tonapi', 'testnet')).toBe('custom_tonapi_key_456');

    setCustomApiKey('toncenter', 'testnet', null);
    expect(getCustomApiKey('toncenter', 'testnet')).toBeNull();
  });

  it('stores and toggles testnet provider between toncenter, tonapi, and orbs', () => {
    expect(getTestnetApiProvider()).toBe('toncenter');

    setTestnetApiProvider('tonapi');
    expect(getTestnetApiProvider()).toBe('tonapi');

    setTestnetApiProvider('orbs');
    expect(getTestnetApiProvider()).toBe('orbs');

    setTestnetApiProvider('toncenter');
    expect(getTestnetApiProvider()).toBe('toncenter');
  });

  it('prioritizes user custom key in toncenterApiKey for testnet', () => {
    setCustomApiKey('toncenter', 'testnet', 'my_secret_user_key');
    const key = toncenterApiKey('testnet');
    expect(key).toBe('my_secret_user_key');
  });

  it('manages RPC routing mode between direct and orbs', () => {
    expect(getTestnetRpcRouting()).toBe('direct');

    setTestnetRpcRouting('orbs');
    expect(getTestnetRpcRouting()).toBe('orbs');

    setTestnetRpcRouting('direct');
    expect(getTestnetRpcRouting()).toBe('direct');
  });

  it('manages custom endpoint active flags for toncenter and tonapi', () => {
    expect(isCustomEndpointActive('toncenter')).toBe(false);
    expect(isCustomEndpointActive('tonapi')).toBe(false);

    setCustomEndpointActive('toncenter', true);
    expect(isCustomEndpointActive('toncenter')).toBe(true);

    setCustomEndpointActive('tonapi', true);
    expect(isCustomEndpointActive('tonapi')).toBe(true);

    setCustomEndpointActive('toncenter', false);
    expect(isCustomEndpointActive('toncenter')).toBe(false);
  });
});
