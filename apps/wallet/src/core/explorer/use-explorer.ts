/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useCallback, useSyncExternalStore } from 'react';
import { Base64ToHex } from '@ton/walletkit';
import type { NetworkType } from '@demo/wallet-core';
import {
  settingsStorage,
  SettingsKeys,
  ExplorerSchema,
  type ExplorerSetting,
} from '@/core/storage';

export type ExplorerChoice = ExplorerSetting;

export const EXPLORER_STORAGE_KEY = SettingsKeys.EXPLORER;

export interface ExplorerState {
  explorer: ExplorerChoice;
  setExplorer: (explorer: ExplorerChoice) => void;
}

let currentExplorer: ExplorerChoice = settingsStorage.get(
  EXPLORER_STORAGE_KEY,
  ExplorerSchema,
  'tonscan',
);

const explorerSubscribers = new Set<() => void>();

function notifyExplorerChange(): void {
  for (const sub of explorerSubscribers) {
    sub();
  }
}

function updateExplorer(explorer: ExplorerChoice): void {
  currentExplorer = explorer;
  settingsStorage.set(EXPLORER_STORAGE_KEY, explorer);
  notifyExplorerChange();
}

// Cross-tab storage change sync
settingsStorage.subscribe(EXPLORER_STORAGE_KEY, () => {
  const next = settingsStorage.get(
    EXPLORER_STORAGE_KEY,
    ExplorerSchema,
    'tonscan',
  );
  if (next !== currentExplorer) {
    currentExplorer = next;
    notifyExplorerChange();
  }
});

function subscribe(callback: () => void): () => void {
  explorerSubscribers.add(callback);
  return () => {
    explorerSubscribers.delete(callback);
  };
}

function getSnapshot(): ExplorerChoice {
  return currentExplorer;
}

function getServerSnapshot(): ExplorerChoice {
  return 'tonscan';
}

export function useExplorer(): ExplorerState {
  const explorer = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const setExplorer = useCallback((nextExplorer: ExplorerChoice) => {
    updateExplorer(nextExplorer);
  }, []);

  return {
    explorer,
    setExplorer,
  };
}

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
  const cleanHash = toHexHash(hash);
  if (explorer === 'actonscan') {
    const query = network === 'testnet' ? '?network=testnet' : '';
    return `https://actonscan.com/tx/${cleanHash}${query}`;
  }
  const prefix = getPrefix(network);
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
  if (explorer === 'actonscan') {
    const query = network === 'testnet' ? '?network=testnet' : '';
    return `https://actonscan.com/address/${address}${query}`;
  }
  const prefix = getPrefix(network);
  if (explorer === 'tonviewer') {
    return `https://${prefix}tonviewer.com/${address}`;
  }
  return `https://${prefix}tonscan.org/address/${address}`;
}
