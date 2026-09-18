/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { describe, expect, it, beforeEach, mock } from 'bun:test';
import React from 'react';
import { renderToString } from 'react-dom/server';

mock.module('@demo/wallet-core', () => ({
  useWalletStore: (selector: any) =>
    selector({
      walletManagement: {
        savedWallets: [{ id: 'w1', network: 'testnet' }],
        activeWalletId: 'w1',
      },
    }),
}));

import { InputScan } from './input-scan';
import {
  saveUsernameAddressMapping,
  setCustomAddressName,
} from '@/core/lib/contact-storage';

describe('InputScan component', () => {
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
  });

  it('renders input field with scanner button and default placeholder', () => {
    const html = renderToString(
      React.createElement(InputScan, {
        value: '',
        onChange: () => {},
      }),
    );
    expect(html).toContain('UQ... or @username');
    expect(html).toContain('Scan QR code');
  });

  it('displays resolved username badge when address is mapped in localStorage', () => {
    saveUsernameAddressMapping('alice_brotherhood', testAddress, network);

    const html = renderToString(
      React.createElement(InputScan, {
        value: testAddress,
        onChange: () => {},
      }),
    );
    expect(html).toContain('@alice_brotherhood');
  });

  it('displays unresolved warning when an unknown username is entered', () => {
    const html = renderToString(
      React.createElement(InputScan, {
        value: '@unknown_member_123',
        onChange: () => {},
      }),
    );
    expect(html).toContain(
      'Username not in local address book. Enter TON address directly.',
    );
  });

  it('displays no username set with check again and set name options for valid unmapped address', () => {
    const html = renderToString(
      React.createElement(InputScan, {
        value: testAddress,
        onChange: () => {},
      }),
    );
    expect(html).toContain('No username set for this address');
    expect(html).toContain('Set name');
    expect(html).toContain('Check again');
  });

  it('displays custom name badge with Custom tag when custom nickname is set', () => {
    setCustomAddressName(testAddress, 'Alice Vault', network);

    const html = renderToString(
      React.createElement(InputScan, {
        value: testAddress,
        onChange: () => {},
      }),
    );
    expect(html).toContain('@Alice Vault');
    expect(html).toContain('Custom');
  });

  it('custom name overrides on-chain mapped username with Custom tag', () => {
    saveUsernameAddressMapping('alice_brotherhood', testAddress, network);
    setCustomAddressName(testAddress, 'My Alice', network);

    const html = renderToString(
      React.createElement(InputScan, {
        value: testAddress,
        onChange: () => {},
      }),
    );
    expect(html).toContain('<span>@My Alice</span>');
    expect(html).not.toContain('<span>@alice_brotherhood</span>');
    expect(html).toContain('title="Revert to @alice_brotherhood"');
    expect(html).toContain('Custom');
  });
});
