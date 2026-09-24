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
import { serializeForStorage } from './contract-serialization';

export const CONTRACT_CODE_HASHES = {
  fiWallet: 'MC+GU90MZ7KhJMMXp3SO4DZLc0Ob3J6gIu2GsFUwipA=',
  fiMinter: 'Y/LdFg7qOwBwjuH39WrF2+FQpiTCu7f4oCSGh2oUVO4=',
  personalMinter: 'Tvog65zMpvpaesj09SsYeyJLFVlYCG802aUZ+AqpIZs=',
  personalWallet: 'j6cSSA6AECyBf/Qb2UvajkByeAvdrNk9O9cRhkKEW4A=',
  location: 'xB9hKP2yNL+B4skAr4q26SlNqHXwsva1XFn8Ib3MjkU=',
  lottery: 'HHh95xA0sDcOowpVnyULcDbZczqe0zk2oAw8x+ulo9M=',
  poll: 'Y4S1BhWmVTOpAVHeDqaFUTUPnHay+aFyF+gjFZx9l8Q=',
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
  type?: 'hydrate';
  id: string;
  accounts: WorkerAccountItem[];
}

export interface WorkerSha256BatchRequest {
  type: 'sha256_batch';
  id: string;
  keys: string[];
}

export interface WorkerParseBocBatchRequest {
  type: 'parse_boc_batch';
  id: string;
  bocs: string[];
}

export type WorkerGenericRequest =
  WorkerHydrateRequest | WorkerSha256BatchRequest | WorkerParseBocBatchRequest;

export interface WorkerHydrateResponse {
  type?: 'hydrate';
  id: string;
  serializedStores: Record<string, string>; // address -> serializeForStorage JSON string
  outdatedAccounts: string[];
  failedAddresses: string[];
}

export interface WorkerSha256BatchResponse {
  type: 'sha256_batch';
  id: string;
  hashes: Record<string, string>; // key -> hex hash
}

export interface WorkerParseBocBatchResponse {
  type: 'parse_boc_batch';
  id: string;
  results: { boc: string; valid: boolean; cellHash?: string }[];
}

export type WorkerGenericResponse =
  | WorkerHydrateResponse
  | WorkerSha256BatchResponse
  | WorkerParseBocBatchResponse;

export function processAccountItems(accounts: WorkerAccountItem[]): {
  serializedStores: Record<string, string>;
  outdatedAccounts: string[];
  failedAddresses: string[];
} {
  const serializedStores: Record<string, string> = {};
  const outdatedAccounts: string[] = [];
  const failedAddresses: string[] = [];

  if (!accounts || !Array.isArray(accounts)) {
    return {
      serializedStores,
      outdatedAccounts,
      failedAddresses,
    };
  }

  for (const item of accounts) {
    if (!item || !item.address) continue;
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

    try {
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
    } catch {
      decodedStore = null;
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

export async function processSha256Batch(
  keys: string[],
): Promise<Record<string, string>> {
  const hashes: Record<string, string> = {};
  for (const key of keys) {
    try {
      const data = new TextEncoder().encode(key);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      hashes[key] = Buffer.from(hashBuffer).toString('hex');
    } catch (_e) {
      // Fallback
    }
  }
  return hashes;
}

export function processParseBocBatch(
  bocs: string[],
): { boc: string; valid: boolean; cellHash?: string }[] {
  return bocs.map((boc) => {
    try {
      const cell = Cell.fromBase64(boc);
      return {
        boc,
        valid: true,
        cellHash: cell.hash().toString('base64'),
      };
    } catch {
      return {
        boc,
        valid: false,
      };
    }
  });
}

// Worker message handler
if (
  typeof self !== 'undefined' &&
  typeof (self as any).postMessage === 'function'
) {
  const handleWorkerMessage = async (
    event: MessageEvent<WorkerGenericRequest>,
  ) => {
    try {
      if (!event.data || typeof event.data !== 'object') return;
      const { id } = event.data;
      if (!id) return;

      if (event.data.type === 'sha256_batch') {
        const hashes = await processSha256Batch(event.data.keys || []);
        (self as any).postMessage({
          type: 'sha256_batch',
          id,
          hashes,
        } satisfies WorkerSha256BatchResponse);
        return;
      }

      if (event.data.type === 'parse_boc_batch') {
        const results = processParseBocBatch(event.data.bocs || []);
        (self as any).postMessage({
          type: 'parse_boc_batch',
          id,
          results,
        } satisfies WorkerParseBocBatchResponse);
        return;
      }

      // Default: hydrate request
      const accounts = (event.data as WorkerHydrateRequest).accounts;
      const result = processAccountItems(accounts);
      const response: WorkerHydrateResponse = {
        type: 'hydrate',
        id,
        ...result,
      };
      (self as any).postMessage(response);
    } catch (_err) {
      const fallbackId = event.data?.id || `err_${Date.now()}`;
      try {
        (self as any).postMessage({
          id: fallbackId,
          serializedStores: {},
          outdatedAccounts: [],
          failedAddresses: [],
        } satisfies WorkerHydrateResponse);
      } catch {
        // Suppress message failure
      }
    }
  };

  self.onmessage = handleWorkerMessage;
}
