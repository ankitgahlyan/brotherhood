/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { describe, expect, it, beforeEach } from 'bun:test';
import { Address } from '@ton/core';
import {
  deriveTokenWalletAddressOffchain,
  detectAndResolveOwnerFromChildContract,
} from './token-contract-resolution';
import { FI_ADDRESS } from '@/lib/brotherhood/config';
import { getFiWalletAddress } from '@/lib/brotherhood/ton';
import { computePersonalWalletAddress } from '@/lib/brotherhood/account-state-hydrator';
import {
  setContractCache,
  getNormalizedContractCacheKey,
} from '@/lib/brotherhood/contract-cache';

describe('token-contract-resolution', () => {
  const network = 'testnet';
  const ownerAddress = '0QAREREREREREREREREREREREREREREREREREREREREREQBc';
  const ownerParsed = Address.parse(ownerAddress);

  const minterAddress = new Address(0, Buffer.alloc(32, 1)).toString({
    bounceable: false,
    testOnly: true,
  });
  const adminAddress = new Address(0, Buffer.alloc(32, 2)).toString({
    bounceable: false,
    testOnly: true,
  });
  const childContractAddress = new Address(0, Buffer.alloc(32, 3)).toString({
    bounceable: false,
    testOnly: true,
  });

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
  });

  it('derives FiWallet address offchain when token is FI', async () => {
    const expectedFiWallet = getFiWalletAddress(
      ownerParsed,
      network,
    ).toString();

    const derived = await deriveTokenWalletAddressOffchain({
      ownerAddress,
      network,
      tokenSymbol: 'FI',
    });

    expect(derived).toBe(expectedFiWallet);

    // Verifies cache pre-population
    const minterCanonical = Address.parse(FI_ADDRESS).toString();
    const ownerCanonical = ownerParsed.toString();
    const key = `deterministic_wallet:${network}:${minterCanonical}:${ownerCanonical}`;
    expect(mockLocalStorage.getItem(key)).toBe(expectedFiWallet);
  });

  it('derives PersonalWallet address offchain when minter and adminAddress are provided', async () => {
    const expectedPersonalWallet = computePersonalWalletAddress(
      Address.parse(minterAddress),
      ownerParsed,
      Address.parse(adminAddress),
    ).toString();

    const derived = await deriveTokenWalletAddressOffchain({
      ownerAddress,
      network,
      minterAddress,
      adminAddress,
    });

    expect(derived).toBe(expectedPersonalWallet);
  });

  it('detects child contract from deterministic_wallet storage and returns owner', async () => {
    const fiWallet = getFiWalletAddress(ownerParsed, network).toString();

    const minterCanonical = Address.parse(FI_ADDRESS).toString();
    const ownerCanonical = ownerParsed.toString();
    const key = `deterministic_wallet:${network}:${minterCanonical}:${ownerCanonical}`;
    mockLocalStorage.setItem(key, fiWallet);

    const detected = await detectAndResolveOwnerFromChildContract(
      fiWallet,
      network,
    );

    expect(detected).not.toBeNull();
    expect(detected?.isChildContract).toBe(true);
    expect(detected?.contractType).toBe('FiWallet');
    expect(detected?.ownerAddress).toBe(ownerCanonical);
  });

  it('detects child contract from ContractCache and returns owner', async () => {
    const normKey = getNormalizedContractCacheKey(
      network,
      childContractAddress,
    );

    await setContractCache(normKey, {
      $: 'FiWalletStore',
      addresses: {
        ref: {
          owner: ownerParsed,
        },
      },
    });

    const detected = await detectAndResolveOwnerFromChildContract(
      childContractAddress,
      network,
    );

    expect(detected).not.toBeNull();
    expect(detected?.isChildContract).toBe(true);
    expect(detected?.contractType).toBe('FiWallet');
    expect(detected?.ownerAddress).toBe(ownerParsed.toString());
  });
});
