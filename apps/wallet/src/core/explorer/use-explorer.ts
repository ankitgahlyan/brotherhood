/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { create } from 'zustand';
import { Base64ToHex } from '@ton/walletkit';
import type { NetworkType } from '@demo/wallet-core';

export type ExplorerChoice = 'tonscan' | 'tonviewer';

export const EXPLORER_STORAGE_KEY = 'brotherhood-explorer';

export interface ExplorerState {
  explorer: ExplorerChoice;
  setExplorer: (explorer: ExplorerChoice) => void;
}

const getInitialExplorer = (): ExplorerChoice => {
  if (typeof window === 'undefined') return 'tonscan';
  try {
    const stored = localStorage.getItem(EXPLORER_STORAGE_KEY);
    if (stored === 'tonscan' || stored === 'tonviewer') {
      return stored;
    }
  } catch {
    // Ignore localStorage access errors
  }
  return 'tonscan'; // Default to tonscan
};

export const useExplorer = create<ExplorerState>((set) => ({
  explorer: getInitialExplorer(),
  setExplorer: (explorer: ExplorerChoice) => {
    try {
      localStorage.setItem(EXPLORER_STORAGE_KEY, explorer);
    } catch {
      // Ignore localStorage access errors
    }
    set({ explorer });
  },
}));

function toHexHash(hash: string): string {
  if (/^(0x)?[0-9a-fA-F]+$/.test(hash)) {
    return hash.startsWith('0x') ? hash.slice(2) : hash;
  }
  try {
    const hex = Base64ToHex(hash);
    return hex.startsWith('0x') ? hex.slice(2) : hex;
  } catch {
    return hash;
  }
}

const getPrefix = (network: NetworkType): string => {
  if (network === 'testnet') return 'testnet.';
  if (network === 'tetra') return 'tetra.';
  return '';
};

export function getExplorerTxUrl(
  network: NetworkType,
  hash: string,
  explorer: ExplorerChoice = 'tonscan',
): string {
  const prefix = getPrefix(network);
  const cleanHash = toHexHash(hash);
  if (explorer === 'tonviewer') {
    return `https://${prefix}tonviewer.com/transaction/${cleanHash}`;
  }
  return `https://${prefix}tonscan.org/tx/${cleanHash}`;
}

export function getExplorerAddressUrl(
  network: NetworkType,
  address: string,
  explorer: ExplorerChoice = 'tonscan',
): string {
  const prefix = getPrefix(network);
  if (explorer === 'tonviewer') {
    return `https://${prefix}tonviewer.com/${address}`;
  }
  return `https://${prefix}tonscan.org/address/${address}`;
}
