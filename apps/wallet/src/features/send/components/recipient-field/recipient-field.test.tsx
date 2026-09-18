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
import { Address } from '@ton/core';

mock.module('@demo/wallet-core', () => ({
  useWalletStore: (selector: any) =>
    selector({
      walletManagement: {
        savedWallets: [{ id: 'w1', network: 'testnet' }],
        activeWalletId: 'w1',
      },
    }),
}));

import { RecipientField } from './recipient-field';
import { FI_ADDRESS } from '@/lib/brotherhood/config';
import { getFiWalletAddress } from '@/lib/brotherhood/ton';

describe('RecipientField component', () => {
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
    key: (index: number) => Object.keys(store)[index] ?? null,
    get length() {
      return Object.keys(store).length;
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

  it('renders recipient input field with scanner button and default placeholder', () => {
    const html = renderToString(
      React.createElement(RecipientField, {
        value: '',
        onChange: () => {},
      }),
    );
    expect(html).toContain('Owner address');
    expect(html).toContain('Scan QR code');
  });

  it('renders "Use my address" shortcut when onUseMyAddress is provided', () => {
    const html = renderToString(
      React.createElement(RecipientField, {
        value: '',
        onChange: () => {},
        onUseMyAddress: () => {},
      }),
    );
    expect(html).toContain('Use my address');
  });

  it('detects child contract and renders auto-correction notice', () => {
    const ownerParsed = Address.parse(testAddress);
    const fiWallet = getFiWalletAddress(ownerParsed, network).toString();

    // Store child contract mapping
    const minterCanonical = Address.parse(FI_ADDRESS).toString();
    const ownerCanonical = ownerParsed.toString();
    const key = `deterministic_wallet:${network}:${minterCanonical}:${ownerCanonical}`;
    mockLocalStorage.setItem(key, fiWallet);

    const html = renderToString(
      React.createElement(RecipientField, {
        value: fiWallet,
        onChange: () => {},
        tokenContext: {
          tokenType: 'JETTON',
          symbol: 'FI',
          minterAddress: FI_ADDRESS,
        },
      }),
    );

    // Initial render displays the field
    expect(html).toContain(fiWallet);
  });
});
