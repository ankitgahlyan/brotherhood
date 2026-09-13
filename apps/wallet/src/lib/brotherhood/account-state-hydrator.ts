import '../../bufferPolyfill';
import { Buffer } from 'buffer';

if (typeof globalThis !== 'undefined') {
  (globalThis as any).Buffer = (globalThis as any).Buffer || Buffer;
}

import { Address, Cell, Dictionary } from '@ton/core';
import { FossFiWallet, FiWalletStore } from '@wrappers/FossFiWallet.gen';
import { FossFi, FiStore } from '@wrappers/FossFi.gen';
import { PersonalMinter, PersonalStore } from '@wrappers/Personal.gen';
import {
  PersonalWalletStore,
  PersonalWallet,
} from '@wrappers/PersonalWallet.gen';
import { Location, LocationStore } from '@wrappers/Location.gen';
import { Lottery, LotteryStorage } from '@wrappers/Lottery.gen';
import { Poll, PollStore } from '@wrappers/Poll.gen';
import { WalletV5R1CodeBoc, type WalletV5Config } from '@ton/walletkit';
import {
  setContractCache,
  setMetadataCache,
  setAddressBookCache,
  getNormalizedContractCacheKey,
  deserializeFromStorage,
} from './contract-cache';
import { rateLimitedFetch } from './rate-limiter';
import { toncenterApiKey, type Network } from './ton';
import { network as defaultNetwork } from './config';
import {
  CONTRACT_CODE_HASHES,
  type KnownContractType,
  type WorkerAccountItem,
  type WorkerHydrateRequest,
  type WorkerHydrateResponse,
  detectKnownType,
  normalizeCodeHash,
  processAccountItems,
  deserializeFiWalletDataBoc,
  deserializeFiMinterDataBoc,
  deserializePersonalStoreDataBoc,
  deserializePersonalWalletDataBoc,
  deserializeLocationDataBoc,
  deserializeLotteryDataBoc,
  deserializePollDataBoc,
  deserializeWalletV5R1DataBoc,
} from './account-hydrator.worker';

export {
  CONTRACT_CODE_HASHES,
  type KnownContractType,
  detectKnownType,
  normalizeCodeHash,
  deserializeFiWalletDataBoc,
  deserializeFiMinterDataBoc,
  deserializePersonalStoreDataBoc,
  deserializePersonalWalletDataBoc,
  deserializeLocationDataBoc,
  deserializeLotteryDataBoc,
  deserializePollDataBoc,
  deserializeWalletV5R1DataBoc,
};

export const WalletV5R1CodeCell = Cell.fromBoc(
  Buffer.from(WalletV5R1CodeBoc, 'hex'),
)[0];

export const CURRENT_FI_WALLET_CODE_HASH = CONTRACT_CODE_HASHES.fiWallet;

export interface RawAccountStateItem {
  account_state_hash?: string;
  address: string;
  balance?: string;
  code_boc?: string;
  code_hash?: string;
  contract_methods?: number[];
  data_boc?: string;
  data_hash?: string;
  extra_currencies?: Record<string, string>;
  frozen_hash?: string;
  interfaces?: string[];
  last_transaction_hash?: string;
  last_transaction_lt?: string;
  status?: string;
  suspended?: boolean;
}

export interface ToncenterAddressBookItem {
  domain?: string;
  interfaces?: string[];
  user_friendly?: string;
}

export interface ToncenterTokenInfo {
  description?: string;
  extra?: Record<string, any>;
  image?: string;
  is_nsfw?: boolean;
  is_scam?: boolean;
  name?: string;
  nft_index?: string;
  symbol?: string;
  type?: string;
  valid?: boolean;
}

export interface ToncenterMetadataItem {
  is_indexed?: boolean;
  token_info?: ToncenterTokenInfo[];
}

export interface ToncenterAccountStatesResponse {
  accounts: RawAccountStateItem[];
  address_book?: Record<string, ToncenterAddressBookItem>;
  metadata?: Record<string, ToncenterMetadataItem>;
}

export interface UniversalHydrateResult {
  totalRequested: number;
  hydrated: number;
  outdatedAccounts: string[];
  failedAddresses: string[];
  decodedStores?: Record<string, any>;
}

const toncenterV3 = {
  mainnet: 'https://toncenter.com/api/v3',
  testnet: 'https://testnet.toncenter.com/api/v3',
};

export interface BatchFetchAccountStatesResult {
  accounts: RawAccountStateItem[];
  addressBook: Record<string, ToncenterAddressBookItem>;
  metadata: Record<string, ToncenterMetadataItem>;
}

/**
 * Fetch raw account states from Toncenter v3 /api/v3/accountStates
 * Chunked into batches of up to 30 addresses per GET request, fetched in parallel.
 * Immediately strips and deletes code_boc to free up memory and prevent main-thread GC pressure.
 */
export function toCanonicalAddressString(addr: Address | string): string {
  try {
    const parsed = typeof addr === 'string' ? Address.parse(addr.trim()) : addr;
    return parsed.toString();
  } catch {
    return typeof addr === 'string' ? addr.trim() : String(addr);
  }
}

/**
 * Fetch raw account states from Toncenter v3 /api/v3/accountStates
 * Chunked into batches of up to 30 addresses per GET request, fetched in parallel.
 * Format-insensitively deduplicates all input addresses to ensure each on-chain contract
 * is requested at most once per chunk with no repeated address query params.
 * Immediately strips and deletes code_boc to free up memory and prevent main-thread GC pressure.
 */
export async function batchFetchAccountStates(
  addresses: (Address | string)[],
  net: Network = defaultNetwork,
  chunkSize = 30,
): Promise<BatchFetchAccountStatesResult> {
  const result: BatchFetchAccountStatesResult = {
    accounts: [],
    addressBook: {},
    metadata: {},
  };
  if (!addresses || addresses.length === 0) return result;

  // Format-insensitive deduplication using canonical string representation
  const canonicalAddresses = Array.from(
    new Set(addresses.map(toCanonicalAddressString).filter(Boolean)),
  );

  const base = toncenterV3[net === 'mainnet' ? 'mainnet' : 'testnet'];
  const apiKey = toncenterApiKey(net);
  const headers: Record<string, string> = {};
  if (apiKey) {
    headers['X-API-Key'] = apiKey;
  }

  const chunks: string[][] = [];
  for (let i = 0; i < canonicalAddresses.length; i += chunkSize) {
    chunks.push(canonicalAddresses.slice(i, i + chunkSize));
  }

  const chunkPromises = chunks.map(async (chunk) => {
    const searchParams = new URLSearchParams();
    // Guarantee no duplicate address params within each chunk
    const uniqueChunk = Array.from(new Set(chunk));
    for (const addr of uniqueChunk) {
      searchParams.append('address', addr);
    }
    searchParams.append('include_boc', 'true');

    const url = `${base}/accountStates?${searchParams.toString()}`;

    try {
      const res = await rateLimitedFetch(url, { headers });
      if (!res.ok) {
        console.error(
          `[batchFetchAccountStates] HTTP ${res.status} ${res.statusText} for chunk of ${uniqueChunk.length} addresses:`,
          uniqueChunk,
        );
        return null;
      }
      const data = (await res.json()) as ToncenterAccountStatesResponse;
      // Immediately discard code_boc from all accounts to eliminate huge strings in memory
      if (Array.isArray(data.accounts)) {
        for (const acc of data.accounts) {
          delete acc.code_boc;
        }
      }
      return data;
    } catch (err) {
      console.error(
        '[batchFetchAccountStates] Failed to fetch accountStates chunk:',
        uniqueChunk,
        err,
      );
      return null;
    }
  });

  const chunkResponses = await Promise.all(chunkPromises);
  for (const resp of chunkResponses) {
    if (!resp) continue;
    if (Array.isArray(resp.accounts)) {
      result.accounts.push(...resp.accounts);
    }
    if (resp.address_book && typeof resp.address_book === 'object') {
      Object.assign(result.addressBook, resp.address_book);
    }
    if (resp.metadata && typeof resp.metadata === 'object') {
      Object.assign(result.metadata, resp.metadata);
    }
  }

  return result;
}

/**
 * Web Worker Manager for Off-Thread BOC Deserialization
 */
let workerInstance: Worker | null = null;
let workerMsgId = 0;
const workerPendingCallbacks = new Map<
  string,
  (response: WorkerHydrateResponse) => void
>();

function getOrCreateHydratorWorker(): Worker | null {
  if (typeof window === 'undefined' || typeof Worker === 'undefined') {
    return null;
  }
  if (!workerInstance) {
    try {
      workerInstance = new Worker(
        new URL('./account-hydrator.worker.ts', import.meta.url),
        { type: 'module' },
      );
      workerInstance.onmessage = (
        event: MessageEvent<WorkerHydrateResponse>,
      ) => {
        const { id } = event.data;
        const cb = workerPendingCallbacks.get(id);
        if (cb) {
          workerPendingCallbacks.delete(id);
          cb(event.data);
        }
      };
      workerInstance.onerror = (err) => {
        console.warn(
          '[HydratorWorker] Worker error, falling back in-process:',
          err,
        );
        // Clean up pending callbacks with empty result to trigger fallback
        for (const [id, cb] of workerPendingCallbacks.entries()) {
          workerPendingCallbacks.delete(id);
          cb({
            id,
            serializedStores: {},
            outdatedAccounts: [],
            failedAddresses: [],
          });
        }
      };
    } catch (err) {
      console.warn('[HydratorWorker] Failed to initialize worker:', err);
      workerInstance = null;
    }
  }
  return workerInstance;
}

/**
 * Computes personal wallet address deterministically off-chain using PersonalWallet.fromStorage
 */
export function computePersonalWalletAddress(
  personalMinter: Address,
  owner: Address,
  adminAddress: Address,
): Address {
  const wallet = PersonalWallet.fromStorage(
    {
      owner,
      deployer: adminAddress,
      minterAddress: personalMinter,
    },
    {
      toShard: { fixedPrefixLength: 8, closeTo: owner },
    },
  );
  return wallet.address;
}

/**
 * Universal Contract Hydration
 * Hydrates contract states into IndexedDB in chunks of 30.
 * Automatically offloads BOC decoding to a background Web Worker when available.
 * Marks outdated contracts without wasting RPC calls.
 */
const inFlightHydrations = new Map<string, Promise<UniversalHydrateResult>>();

export function batchHydrateUniversal(
  addresses: (Address | string)[],
  net: Network = defaultNetwork,
  options?: {
    knownTypes?: Record<string, KnownContractType>;
  },
): Promise<UniversalHydrateResult> {
  // Format-insensitive deduplication and alias mapping:
  // Maps original caller inputs to their canonical standard string representation
  const inputToCanonicalMap = new Map<string, string>();
  const canonicalSet = new Set<string>();

  for (const a of addresses) {
    if (!a) continue;
    const originalKey = typeof a === 'string' ? a.trim() : a.toString();
    const canonical = toCanonicalAddressString(a);
    if (canonical) {
      inputToCanonicalMap.set(originalKey, canonical);
      canonicalSet.add(canonical);
    }
  }

  const normalizedAddresses = Array.from(canonicalSet);

  const result: UniversalHydrateResult = {
    totalRequested: normalizedAddresses.length,
    hydrated: 0,
    outdatedAccounts: [],
    failedAddresses: [],
    decodedStores: {},
  };

  if (normalizedAddresses.length === 0) return Promise.resolve(result);

  const batchKey = `${net}:${normalizedAddresses.slice().sort().join(',')}`;
  const existing = inFlightHydrations.get(batchKey);
  if (existing) {
    return existing;
  }

  const hydrationPromise = (async () => {
    const fetchResult = await batchFetchAccountStates(
      normalizedAddresses,
      net,
      30,
    );
    const accountMap = new Map<string, RawAccountStateItem>();

    for (const acc of fetchResult.accounts) {
      try {
        const parsed = Address.parse(acc.address);
        accountMap.set(parsed.toString(), acc);
        accountMap.set(parsed.toRawString(), acc);
      } catch {
        accountMap.set(acc.address, acc);
      }
    }

    // Prepare items to be processed by worker or fallback
    const itemsToProcess: WorkerAccountItem[] = [];
    const validRequestedAddresses: {
      standardAddrStr: string;
      parsedAddress: Address;
    }[] = [];

    for (const addrInput of normalizedAddresses) {
      let parsedAddress: Address;
      let standardAddrStr: string;

      try {
        parsedAddress =
          typeof addrInput === 'string' ? Address.parse(addrInput) : addrInput;
        standardAddrStr = parsedAddress.toString();
      } catch (err) {
        console.error(
          '[batchHydrateUniversal] Invalid address string provided:',
          addrInput,
          err,
        );
        result.failedAddresses.push(String(addrInput));
        continue;
      }

      validRequestedAddresses.push({ standardAddrStr, parsedAddress });

      const rawAcc =
        accountMap.get(standardAddrStr) ||
        accountMap.get(parsedAddress.toRawString());
      if (!rawAcc || rawAcc.status !== 'active' || !rawAcc.data_boc) {
        console.warn(
          `[batchHydrateUniversal] Account not active or missing data_boc for ${standardAddrStr}, status: ${rawAcc?.status}`,
        );
        result.failedAddresses.push(standardAddrStr);
        continue;
      }

      itemsToProcess.push({
        address: standardAddrStr,
        code_hash: rawAcc.code_hash,
        data_boc: rawAcc.data_boc,
        interfaces: rawAcc.interfaces,
        status: rawAcc.status,
        explicitType: options?.knownTypes?.[standardAddrStr],
      });
    }

    if (itemsToProcess.length === 0) {
      return result;
    }

    // Execute decoding via Web Worker or direct fallback
    const worker = getOrCreateHydratorWorker();
    let workerResult: {
      serializedStores: Record<string, string>;
      outdatedAccounts: string[];
      failedAddresses: string[];
    };

    if (worker) {
      const id = `req_${++workerMsgId}_${Date.now()}`;
      try {
        workerResult = await new Promise<WorkerHydrateResponse>((resolve) => {
          const timer = setTimeout(() => {
            workerPendingCallbacks.delete(id);
            console.warn(
              `[HydratorWorker] Request ${id} timed out after 3.5s, falling back to in-process decoding`,
            );
            resolve({
              id,
              ...processAccountItems(itemsToProcess),
            });
          }, 3500);

          workerPendingCallbacks.set(id, (res) => {
            clearTimeout(timer);
            if (
              Object.keys(res.serializedStores).length === 0 &&
              res.outdatedAccounts.length === 0 &&
              res.failedAddresses.length === 0 &&
              itemsToProcess.length > 0
            ) {
              // Worker returned an empty result, run in-process fallback
              resolve({
                id,
                ...processAccountItems(itemsToProcess),
              });
            } else {
              resolve(res);
            }
          });

          worker.postMessage({
            id,
            accounts: itemsToProcess,
          } as WorkerHydrateRequest);
        });
      } catch (err) {
        console.warn(
          '[HydratorWorker] Worker postMessage failed, falling back in-process:',
          err,
        );
        workerResult = processAccountItems(itemsToProcess);
      }
    } else {
      // In-process fallback for Node/Bun test environments
      workerResult = processAccountItems(itemsToProcess);
    }

    result.outdatedAccounts.push(...workerResult.outdatedAccounts);
    result.failedAddresses.push(...workerResult.failedAddresses);

    // Save decoded results into cache
    for (const { standardAddrStr, parsedAddress } of validRequestedAddresses) {
      const serialized = workerResult.serializedStores[standardAddrStr];
      if (!serialized) continue;

      const decodedStore = deserializeFromStorage(serialized);
      const cacheKey = getNormalizedContractCacheKey(net, parsedAddress);

      await setContractCache(cacheKey, decodedStore).catch((err) => {
        console.error(
          `[batchHydrateUniversal] Failed to setContractCache for ${cacheKey}:`,
          err,
        );
      });

      const rawAcc = accountMap.get(standardAddrStr);
      const meta =
        fetchResult.metadata[standardAddrStr] ||
        (rawAcc ? fetchResult.metadata[rawAcc.address] : undefined);
      if (meta) {
        await setMetadataCache(standardAddrStr, meta).catch((err) => {
          console.error(
            `[batchHydrateUniversal] Failed to setMetadataCache for ${standardAddrStr}:`,
            err,
          );
        });
      }

      const ab =
        fetchResult.addressBook[standardAddrStr] ||
        (rawAcc ? fetchResult.addressBook[rawAcc.address] : undefined);
      if (ab) {
        await setAddressBookCache(standardAddrStr, ab).catch((err) => {
          console.error(
            `[batchHydrateUniversal] Failed to setAddressBookCache for ${standardAddrStr}:`,
            err,
          );
        });
      }

      if (result.decodedStores) {
        result.decodedStores[standardAddrStr] = decodedStore;
      }
      result.hydrated++;
    }

    // Mirror decoded stores to any original input alias keys requested by the caller
    if (result.decodedStores) {
      for (const [origKey, canonical] of inputToCanonicalMap.entries()) {
        if (origKey !== canonical && result.decodedStores[canonical]) {
          result.decodedStores[origKey] = result.decodedStores[canonical];
        }
      }
    }

    return result;
  })().finally(() => {
    inFlightHydrations.delete(batchKey);
  });

  inFlightHydrations.set(batchKey, hydrationPromise);
  return hydrationPromise;
}
