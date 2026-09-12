/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import '../../bufferPolyfill';
import { Buffer } from 'buffer';
import { Cell, Dictionary } from '@ton/core';
import { FiWalletStore } from '@wrappers/FossFiWallet.gen';
import { FiStore } from '@wrappers/FossFi.gen';
import { PersonalStore } from '@wrappers/Personal.gen';
import { PersonalWalletStore } from '@wrappers/PersonalWallet.gen';
import { LocationStore } from '@wrappers/Location.gen';
import { LotteryStorage } from '@wrappers/Lottery.gen';
import { PollStore } from '@wrappers/Poll.gen';
import type { WalletV5Config } from '@ton/walletkit';
import { serializeForStorage } from './contract-cache';

export const CONTRACT_CODE_HASHES = {
  fiWallet: 'lac+fvXILiF4fSOA+/Ob7P54aoDQ3SU5dvyrObtLmXc=',
  fiMinter: 'nv5ymWY8+YfroE7kKY52DJHm1iE182LA/yf2mLx/Iig=',
  personalMinter: 'Tvog65zMpvpaesj09SsYeyJLFVlYCG802aUZ+AqpIZs=',
  personalWallet: 'j6cSSA6AECyBf/Qb2UvajkByeAvdrNk9O9cRhkKEW4A=',
  location: 'xB9hKP2yNL+B4skAr4q26SlNqHXwsva1XFn8Ib3MjkU=',
  lottery: 'HHh95xA0sDcOowpVnyULcDbZczqe0zk2oAw8x+ulo9M=',
  poll: 'M7amScmkEzsOjB4PdHu3b/GshHyOmMuhGu+dN31Aymo=',
  walletV5R1: 'IINLe3KxEhR+Gy+0V7hOdNGjDwT3N9T2KmaOlVLSty8=',
} as const;

export type KnownContractType =
  | 'fiWallet'
  | 'personalMinter'
  | 'personalWallet'
  | 'location'
  | 'lottery'
  | 'poll'
  | 'fiMinter'
  | 'walletV5R1';

export function normalizeCodeHash(hash?: string | null): string {
  if (!hash) return '';
  const trimmed = hash.trim();
  if (/^[0-9a-fA-F]{64}$/.test(trimmed)) {
    try {
      return Buffer.from(trimmed, 'hex').toString('base64');
    } catch {
      return trimmed;
    }
  }
  return trimmed;
}

export function detectKnownType(
  codeHash?: string,
  interfaces?: string[],
): KnownContractType | null {
  if (codeHash) {
    const normalized = normalizeCodeHash(codeHash);
    for (const [type, expectedHash] of Object.entries(CONTRACT_CODE_HASHES)) {
      if (normalized === expectedHash) {
        return type as KnownContractType;
      }
    }
  }

  if (Array.isArray(interfaces)) {
    if (
      interfaces.includes('wallet_v5r1') ||
      interfaces.includes('wallet_v5') ||
      interfaces.includes('wallet')
    ) {
      return 'walletV5R1';
    }
    if (interfaces.includes('tep74_jetton_minter')) {
      return 'fiMinter';
    }
    if (interfaces.includes('tep74_jetton_wallet')) {
      return 'fiWallet';
    }
  }

  return null;
}

export function deserializeFiWalletDataBoc(
  dataBoc: string,
): FiWalletStore | null {
  try {
    const cell = Cell.fromBase64(dataBoc);
    return FiWalletStore.fromSlice(cell.beginParse());
  } catch {
    return null;
  }
}

export function deserializeFiMinterDataBoc(dataBoc: string): FiStore | null {
  try {
    const cell = Cell.fromBase64(dataBoc);
    return FiStore.fromSlice(cell.beginParse());
  } catch {
    return null;
  }
}

export function deserializePersonalStoreDataBoc(
  dataBoc: string,
): PersonalStore | null {
  try {
    const cell = Cell.fromBase64(dataBoc);
    return PersonalStore.fromSlice(cell.beginParse());
  } catch {
    return null;
  }
}

export function deserializePersonalWalletDataBoc(
  dataBoc: string,
): PersonalWalletStore | null {
  try {
    const cell = Cell.fromBase64(dataBoc);
    return PersonalWalletStore.fromSlice(cell.beginParse());
  } catch {
    return null;
  }
}

export function deserializeLocationDataBoc(
  dataBoc: string,
): LocationStore | null {
  try {
    const cell = Cell.fromBase64(dataBoc);
    return LocationStore.fromSlice(cell.beginParse());
  } catch {
    return null;
  }
}

export function deserializeLotteryDataBoc(
  dataBoc: string,
): LotteryStorage | null {
  try {
    const cell = Cell.fromBase64(dataBoc);
    return LotteryStorage.fromSlice(cell.beginParse());
  } catch {
    return null;
  }
}

export function deserializePollDataBoc(dataBoc: string): PollStore | null {
  try {
    const cell = Cell.fromBase64(dataBoc);
    return PollStore.fromSlice(cell.beginParse());
  } catch {
    return null;
  }
}

export function deserializeWalletV5R1DataBoc(
  dataBoc: string,
): WalletV5Config | null {
  try {
    const cell = Cell.fromBase64(dataBoc);
    const slice = cell.beginParse();
    const signatureAllowed = slice.loadBit();
    const seqno = slice.loadUint(32);
    const walletId = slice.loadUint(32);
    const publicKey = slice.loadUintBig(256);
    const extensions = slice.loadDict(
      Dictionary.Keys.BigUint(256),
      Dictionary.Values.BigInt(1),
    );
    return {
      signatureAllowed,
      seqno,
      walletId,
      publicKey,
      extensions,
    };
  } catch {
    return null;
  }
}

export interface WorkerAccountItem {
  address: string;
  code_hash?: string;
  data_boc?: string;
  interfaces?: string[];
  status?: string;
  explicitType?: KnownContractType;
}

export interface WorkerHydrateRequest {
  id: string;
  accounts: WorkerAccountItem[];
}

export interface WorkerHydrateResponse {
  id: string;
  serializedStores: Record<string, string>; // address -> serializeForStorage JSON string
  outdatedAccounts: string[];
  failedAddresses: string[];
}

export function processAccountItems(accounts: WorkerAccountItem[]): {
  serializedStores: Record<string, string>;
  outdatedAccounts: string[];
  failedAddresses: string[];
} {
  const serializedStores: Record<string, string> = {};
  const outdatedAccounts: string[] = [];
  const failedAddresses: string[] = [];

  for (const item of accounts) {
    const addr = item.address;
    if (item.status !== 'active' || !item.data_boc) {
      failedAddresses.push(addr);
      continue;
    }

    const hashDetectedType = detectKnownType(item.code_hash, item.interfaces);
    const detectedType = hashDetectedType || item.explicitType;

    const expectedHash = detectedType
      ? CONTRACT_CODE_HASHES[detectedType]
      : null;
    const normalizedRawHash = normalizeCodeHash(item.code_hash);
    const isCodeHashOutdated =
      Boolean(normalizedRawHash && expectedHash) &&
      normalizedRawHash !== expectedHash;

    let decodedStore: any = null;
    const dataBoc = item.data_boc;

    if (detectedType === 'location') {
      decodedStore = deserializeLocationDataBoc(dataBoc);
    } else if (detectedType === 'personalMinter') {
      decodedStore = deserializePersonalStoreDataBoc(dataBoc);
    } else if (detectedType === 'personalWallet') {
      decodedStore = deserializePersonalWalletDataBoc(dataBoc);
    } else if (detectedType === 'lottery') {
      decodedStore = deserializeLotteryDataBoc(dataBoc);
    } else if (detectedType === 'poll') {
      decodedStore = deserializePollDataBoc(dataBoc);
    } else if (detectedType === 'fiMinter') {
      decodedStore = deserializeFiMinterDataBoc(dataBoc);
    } else if (detectedType === 'fiWallet') {
      decodedStore = deserializeFiWalletDataBoc(dataBoc);
    } else if (detectedType === 'walletV5R1') {
      decodedStore = deserializeWalletV5R1DataBoc(dataBoc);
    } else {
      decodedStore =
        deserializeFiWalletDataBoc(dataBoc) ||
        deserializeLocationDataBoc(dataBoc) ||
        deserializePersonalStoreDataBoc(dataBoc) ||
        deserializePersonalWalletDataBoc(dataBoc) ||
        deserializeLotteryDataBoc(dataBoc) ||
        deserializePollDataBoc(dataBoc) ||
        deserializeFiMinterDataBoc(dataBoc) ||
        deserializeWalletV5R1DataBoc(dataBoc);
    }

    if (!decodedStore) {
      if (isCodeHashOutdated) {
        outdatedAccounts.push(addr);
      }
      failedAddresses.push(addr);
      continue;
    }

    if (isCodeHashOutdated) {
      outdatedAccounts.push(addr);
    }

    try {
      serializedStores[addr] = serializeForStorage(decodedStore);
    } catch {
      failedAddresses.push(addr);
    }
  }

  return {
    serializedStores,
    outdatedAccounts,
    failedAddresses,
  };
}

// Worker message handler
if (
  typeof self !== 'undefined' &&
  typeof (self as any).postMessage === 'function'
) {
  self.onmessage = (event: MessageEvent<WorkerHydrateRequest>) => {
    const { id, accounts } = event.data;
    const result = processAccountItems(accounts);
    const response: WorkerHydrateResponse = {
      id,
      ...result,
    };
    (self as any).postMessage(response);
  };
}
