import { Address, Cell } from '@ton/core';
import { useSyncExternalStore, useMemo, useCallback } from 'react';

const DB_NAME = 'brotherhood_contract_db';
const DB_VERSION = 3;
const STORE_NAME = 'contract_cache';
const METADATA_STORE_NAME = 'metadata_cache';
const ADDRESS_BOOK_STORE_NAME = 'address_book_cache';

export interface CacheEntry<T = any> {
  key: string;
  data: T;
  timestamp: number;
}

export interface MetadataEntry {
  address: string;
  metadata: any;
  timestamp: number;
}

export interface AddressBookEntry {
  address: string;
  entry: any;
  timestamp: number;
}

// Custom Replacer for JSON.stringify to handle Address, Cell, bigint, Map, and Dictionary
function serializeReplacer(_key: string, value: any): any {
  if (typeof value === 'bigint') {
    return { __type: 'bigint', value: value.toString() };
  }
  if (
    value &&
    typeof value === 'object' &&
    value.constructor?.name === 'Address'
  ) {
    return { __type: 'Address', value: (value as Address).toString() };
  }
  if (
    value &&
    typeof value === 'object' &&
    typeof value.toRawString === 'function' &&
    typeof value.toString === 'function'
  ) {
    try {
      return { __type: 'Address', value: value.toString() };
    } catch {
      /* pass */
    }
  }
  if (
    value &&
    typeof value === 'object' &&
    (value.constructor?.name === 'Cell' ||
      (typeof value.toBoc === 'function' &&
        typeof value.beginParse === 'function'))
  ) {
    try {
      return {
        __type: 'Cell',
        value: (value as Cell).toBoc().toString('base64'),
      };
    } catch {
      /* pass */
    }
  }
  if (
    value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    typeof value.keys === 'function' &&
    typeof value.get === 'function'
  ) {
    try {
      const rawKeys = value.keys();
      const keys = Array.isArray(rawKeys) ? rawKeys : Array.from(rawKeys);
      const entries = keys.map((k: any) => [k, value.get(k)]);
      return {
        __type: 'Dictionary',
        value: entries,
      };
    } catch {
      /* pass */
    }
  }
  if (value instanceof Map) {
    return {
      __type: 'Map',
      value: Array.from(value.entries()),
    };
  }
  return value;
}

// Custom Reviver for JSON.parse to reconstruct Address, Cell, bigint, Map, and Dictionary
function serializeReviver(_key: string, value: any): any {
  if (value && typeof value === 'object' && value.__type) {
    if (value.__type === 'bigint') {
      return BigInt(value.value);
    }
    if (value.__type === 'Address') {
      try {
        return Address.parse(value.value);
      } catch {
        return value.value;
      }
    }
    if (value.__type === 'Cell') {
      try {
        return Cell.fromBase64(value.value);
      } catch {
        return value.value;
      }
    }
    if (value.__type === 'Map' && Array.isArray(value.value)) {
      return new Map(value.value);
    }
    if (value.__type === 'Dictionary') {
      const entries = Array.isArray(value.value) ? value.value : [];
      const entriesMap = new Map(entries);
      const keysList = Array.from(entriesMap.keys());
      return {
        keys: () => keysList,
        get: (key: any) => {
          const keyStr = key?.toString ? key.toString() : String(key);
          for (const [k, v] of entriesMap.entries()) {
            if (k === key || (k?.toString && k.toString() === keyStr)) {
              return v;
            }
          }
          return entriesMap.get(key);
        },
        values: () => Array.from(entriesMap.values()),
        size: entriesMap.size,
      };
    }
  }
  return value;
}

export function serializeForStorage(data: any): string {
  return JSON.stringify(data, serializeReplacer);
}

export function deserializeFromStorage<T = any>(jsonStr: string): T {
  return JSON.parse(jsonStr, serializeReviver);
}

// In-Memory L1 Cache (ultra-fast 0ms reads, eliminates redundant IDB & JSON serialization on main thread)
const memoryContractCache = new Map<string, CacheEntry>();
const memoryMetadataCache = new Map<string, MetadataEntry>();
const memoryAddressBookCache = new Map<string, AddressBookEntry>();
let lastKnownGlobalFetchTime: number | null = null;

// Singleton openDB promise to prevent IDB connection starvation and transaction lockups
let cachedDbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return Promise.reject(new Error('IndexedDB not supported'));
  }
  if (!cachedDbPromise) {
    cachedDbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains(METADATA_STORE_NAME)) {
          db.createObjectStore(METADATA_STORE_NAME, { keyPath: 'address' });
        }
        if (!db.objectStoreNames.contains(ADDRESS_BOOK_STORE_NAME)) {
          db.createObjectStore(ADDRESS_BOOK_STORE_NAME, { keyPath: 'address' });
        }
        if (event.oldVersion < 3 && db.objectStoreNames.contains(STORE_NAME)) {
          const transaction = (event.target as IDBOpenDBRequest).transaction;
          if (transaction) {
            try {
              transaction.objectStore(STORE_NAME).clear();
            } catch {
              /* ignore */
            }
          }
        }
      };
      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => {
          db.close();
          cachedDbPromise = null;
        };
        db.onclose = () => {
          cachedDbPromise = null;
        };
        resolve(db);
      };
      request.onerror = () => {
        cachedDbPromise = null;
        reject(request.error);
      };
    });
  }
  return cachedDbPromise;
}

export async function setMetadataCache(
  address: string,
  metadata: any,
): Promise<void> {
  const timestamp = Date.now();
  memoryMetadataCache.set(address, {
    address,
    metadata,
    timestamp,
  });
  try {
    const db = await openDB();
    const entry: MetadataEntry = {
      address,
      metadata,
      timestamp,
    };
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(METADATA_STORE_NAME, 'readwrite');
      const store = tx.objectStore(METADATA_STORE_NAME);
      const req = store.put(entry);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error(
      '[ContractCache] Failed to save metadata cache for address:',
      address,
      err,
    );
  }
}

export async function getMetadataCache(address: string): Promise<any | null> {
  const mem = memoryMetadataCache.get(address);
  if (mem) {
    return mem.metadata;
  }
  try {
    const db = await openDB();
    const entry = await new Promise<MetadataEntry | undefined>(
      (resolve, reject) => {
        const tx = db.transaction(METADATA_STORE_NAME, 'readonly');
        const store = tx.objectStore(METADATA_STORE_NAME);
        const req = store.get(address);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      },
    );
    if (entry) {
      memoryMetadataCache.set(address, entry);
    }
    return entry?.metadata ?? null;
  } catch (err) {
    console.error(
      '[ContractCache] Failed to get metadata cache for address:',
      address,
      err,
    );
    return null;
  }
}

export async function setAddressBookCache(
  address: string,
  entryData: any,
): Promise<void> {
  const timestamp = Date.now();
  memoryAddressBookCache.set(address, {
    address,
    entry: entryData,
    timestamp,
  });
  try {
    const db = await openDB();
    const entry: AddressBookEntry = {
      address,
      entry: entryData,
      timestamp,
    };
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(ADDRESS_BOOK_STORE_NAME, 'readwrite');
      const store = tx.objectStore(ADDRESS_BOOK_STORE_NAME);
      const req = store.put(entry);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error(
      '[ContractCache] Failed to save address book cache for address:',
      address,
      err,
    );
  }
}

export async function getAddressBookCache(
  address: string,
): Promise<any | null> {
  const mem = memoryAddressBookCache.get(address);
  if (mem) {
    return mem.entry;
  }
  try {
    const db = await openDB();
    const entry = await new Promise<AddressBookEntry | undefined>(
      (resolve, reject) => {
        const tx = db.transaction(ADDRESS_BOOK_STORE_NAME, 'readonly');
        const store = tx.objectStore(ADDRESS_BOOK_STORE_NAME);
        const req = store.get(address);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      },
    );
    if (entry) {
      memoryAddressBookCache.set(address, entry);
    }
    return entry?.entry ?? null;
  } catch (err) {
    console.error(
      '[ContractCache] Failed to get address book cache for address:',
      address,
      err,
    );
    return null;
  }
}

export async function setContractCache(key: string, data: any): Promise<void> {
  const timestamp = Date.now();
  // 1. Immediately store in L1 in-memory cache for 0ms subsequent reads
  memoryContractCache.set(key, {
    key,
    data,
    timestamp,
  });
  lastKnownGlobalFetchTime = Math.max(lastKnownGlobalFetchTime ?? 0, timestamp);
  notifyCacheUpdated(key, timestamp);

  // 2. Persist to IndexedDB asynchronously
  try {
    const db = await openDB();
    const serializedData = JSON.parse(JSON.stringify(data, serializeReplacer));
    const entry: CacheEntry = {
      key,
      data: serializedData,
      timestamp,
    };
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(entry);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[ContractCache] Failed to save cache for key:', key, err);
  }
}

export const CACHE_UPDATED_EVENT = 'brotherhood_contract_cache_updated';

let notifyTimer: ReturnType<typeof setTimeout> | null = null;
const pendingUpdatedKeys = new Set<string>();
let latestTimestamp = 0;

export function notifyCacheUpdated(key: string, timestamp: number) {
  if (
    typeof window === 'undefined' ||
    typeof window.dispatchEvent !== 'function'
  ) {
    return;
  }
  pendingUpdatedKeys.add(key);
  latestTimestamp = Math.max(latestTimestamp, timestamp);

  // Dispatch immediate event for single-key listeners
  window.dispatchEvent(
    new CustomEvent(CACHE_UPDATED_EVENT, { detail: { key, timestamp } }),
  );

  // Also dispatch debounced aggregated event for bulk subscribers
  if (!notifyTimer) {
    notifyTimer = setTimeout(() => {
      notifyTimer = null;
      const keys = Array.from(pendingUpdatedKeys);
      pendingUpdatedKeys.clear();
      if (
        typeof window !== 'undefined' &&
        typeof window.dispatchEvent === 'function'
      ) {
        window.dispatchEvent(
          new CustomEvent(`${CACHE_UPDATED_EVENT}_batch`, {
            detail: { keys, timestamp: latestTimestamp },
          }),
        );
      }
    }, 50);
  }
}

export async function getContractCache<T = any>(
  key: string,
): Promise<{ data: T; timestamp: number } | null> {
  // 1. Check L1 in-memory cache first (0ms, avoids IDB & JSON overhead)
  const mem = memoryContractCache.get(key);
  if (mem) {
    return {
      data: mem.data as T,
      timestamp: mem.timestamp,
    };
  }

  // 2. Fall back to IndexedDB
  try {
    const db = await openDB();
    const entry = await new Promise<CacheEntry | undefined>(
      (resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      },
    );

    if (!entry) return null;
    const restoredData = JSON.parse(
      JSON.stringify(entry.data),
      serializeReviver,
    );

    // Populate L1 cache
    memoryContractCache.set(key, {
      key,
      data: restoredData,
      timestamp: entry.timestamp,
    });
    lastKnownGlobalFetchTime = Math.max(
      lastKnownGlobalFetchTime ?? 0,
      entry.timestamp,
    );

    return {
      data: restoredData as T,
      timestamp: entry.timestamp,
    };
  } catch (err) {
    console.warn('[ContractCache] Failed to load cache for key:', key, err);
    return null;
  }
}

export async function clearContractCache(): Promise<void> {
  memoryContractCache.clear();
  lastKnownGlobalFetchTime = null;
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[ContractCache] Failed to clear cache:', err);
  }
}

export async function deleteContractCache(key: string): Promise<void> {
  memoryContractCache.delete(key);
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[ContractCache] Failed to delete cache for key:', key, err);
  }
}

export async function getContractCacheStats(): Promise<{
  count: number;
  lastUpdated: number | null;
}> {
  if (memoryContractCache.size > 0) {
    let latest: number | null = lastKnownGlobalFetchTime;
    for (const entry of memoryContractCache.values()) {
      if (latest === null || entry.timestamp > latest) {
        latest = entry.timestamp;
      }
    }
    return { count: memoryContractCache.size, lastUpdated: latest };
  }

  try {
    const db = await openDB();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const entries: CacheEntry[] = req.result || [];
        const count = entries.length;
        const lastUpdated = entries.reduce<number | null>(
          (latest, e) =>
            latest === null || e.timestamp > latest ? e.timestamp : latest,
          null,
        );
        lastKnownGlobalFetchTime = lastUpdated;
        resolve({ count, lastUpdated });
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return { count: 0, lastUpdated: null };
  }
}

export async function getLastFetchTime(
  keys?: string[],
): Promise<number | null> {
  try {
    if (!keys || keys.length === 0) {
      if (lastKnownGlobalFetchTime !== null) {
        return lastKnownGlobalFetchTime;
      }
      const stats = await getContractCacheStats();
      return stats.lastUpdated;
    }
    const timestamps = await Promise.all(
      keys.map(async (k) => {
        const item = await getContractCache(k);
        return item?.timestamp ?? null;
      }),
    );
    return timestamps.reduce<number | null>(
      (latest, ts) =>
        ts !== null && (latest === null || ts > latest) ? ts : latest,
      null,
    );
  } catch {
    return null;
  }
}

export function getNormalizedContractCacheKey(
  network: string,
  contractAddress: Address | string,
): string {
  let addrStr: string;
  try {
    addrStr =
      typeof contractAddress === 'string'
        ? Address.parse(contractAddress.trim()).toString()
        : contractAddress.toString();
  } catch {
    addrStr =
      typeof contractAddress === 'string'
        ? contractAddress.trim()
        : String(contractAddress);
  }
  return `contract_state:${network}:${addrStr}`;
}

export async function invalidateContractCache(
  network: string,
  contractAddress: Address | string,
): Promise<void> {
  const key = getNormalizedContractCacheKey(network, contractAddress);
  await deleteContractCache(key);
}

export function getContractCacheSync<T = any>(
  key: string,
): { data: T; timestamp: number } | null {
  const mem = memoryContractCache.get(key);
  if (mem) {
    return {
      data: mem.data as T,
      timestamp: mem.timestamp,
    };
  }
  return null;
}

let hasPreloadedFromDb = false;
let preloadPromise: Promise<void> | null = null;

export function preloadContractCacheFromDb(): Promise<void> {
  if (hasPreloadedFromDb) return Promise.resolve();
  if (preloadPromise) return preloadPromise;
  if (typeof window === 'undefined') return Promise.resolve();

  preloadPromise = (async () => {
    try {
      const db = await openDB();
      const entries = await new Promise<CacheEntry[]>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
      for (const entry of entries) {
        if (!memoryContractCache.has(entry.key)) {
          const restored = deserializeFromStorage(entry.data);
          memoryContractCache.set(entry.key, {
            key: entry.key,
            data: restored,
            timestamp: entry.timestamp,
          });
          if (entry.timestamp > (lastKnownGlobalFetchTime ?? 0)) {
            lastKnownGlobalFetchTime = entry.timestamp;
          }
        }
      }
      hasPreloadedFromDb = true;
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent(CACHE_UPDATED_EVENT, {
            detail: { key: '__preload__', timestamp: Date.now() },
          }),
        );
      }
    } catch (err) {
      console.warn('[ContractCache] Failed to preload from DB:', err);
    }
  })();
  return preloadPromise;
}

if (typeof window !== 'undefined') {
  preloadContractCacheFromDb().catch(() => {});
}

export function useContractState<T = any>(
  contractAddress: Address | string | null | undefined,
  net: string = 'testnet',
): { data: T | null; timestamp: number | null; isLoading: boolean } {
  const key = useMemo(() => {
    if (!contractAddress) return null;
    return getNormalizedContractCacheKey(net, contractAddress);
  }, [contractAddress, net]);

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!key || typeof window === 'undefined') {
        return () => {};
      }
      const listener = (event: Event) => {
        const customEvent = event as CustomEvent<{
          key?: string;
          keys?: string[];
        }>;
        if (
          !customEvent.detail ||
          customEvent.detail.key === '__preload__' ||
          customEvent.detail.key === key ||
          customEvent.detail.keys?.includes(key)
        ) {
          onStoreChange();
        }
      };
      window.addEventListener(CACHE_UPDATED_EVENT, listener);
      window.addEventListener(`${CACHE_UPDATED_EVENT}_batch`, listener);
      return () => {
        window.removeEventListener(CACHE_UPDATED_EVENT, listener);
        window.removeEventListener(`${CACHE_UPDATED_EVENT}_batch`, listener);
      };
    },
    [key],
  );

  const getSnapshot = useCallback(() => {
    if (!key) return null;
    return memoryContractCache.get(key) ?? null;
  }, [key]);

  const getServerSnapshot = useCallback(() => null, []);

  const cached = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  return {
    data: (cached?.data as T) ?? null,
    timestamp: cached?.timestamp ?? null,
    isLoading: !cached && Boolean(key),
  };
}
