import { Address } from '@ton/core';

const DB_NAME = 'brotherhood_contract_db';
const DB_VERSION = 1;
const STORE_NAME = 'contract_cache';

export interface CacheEntry<T = any> {
  key: string;
  data: T;
  timestamp: number;
}

// Custom Replacer for JSON.stringify to handle Address and bigint
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
  if (value && typeof value === 'object' && typeof value.keys === 'function') {
    try {
      const keys = value.keys();
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

// Custom Reviver for JSON.parse to reconstruct Address, bigint, Map, and Dictionary
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
    if (value.__type === 'Map' && Array.isArray(value.value)) {
      return new Map(value.value);
    }
    if (value.__type === 'Dictionary' && Array.isArray(value.value)) {
      const entriesMap = new Map(value.value);
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

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function setContractCache(key: string, data: any): Promise<void> {
  try {
    const db = await openDB();
    const serializedData = JSON.parse(JSON.stringify(data, serializeReplacer));
    const entry: CacheEntry = {
      key,
      data: serializedData,
      timestamp: Date.now(),
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

export async function getContractCache<T = any>(
  key: string,
): Promise<{ data: T; timestamp: number } | null> {
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

export async function getContractCacheStats(): Promise<{
  count: number;
  lastUpdated: number | null;
}> {
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
        resolve({ count, lastUpdated });
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return { count: 0, lastUpdated: null };
  }
}
