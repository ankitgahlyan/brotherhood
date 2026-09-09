import { useState, useEffect, useCallback, useRef } from '../teact/teact';
import { getContractCache, setContractCache, getNormalizedContractCacheKey } from './contract-cache';
import type { Network } from './config';

export interface UseContractQueryOptions<T> {
  queryKey: (string | number | boolean | null | undefined)[];
  queryFn: () => Promise<T>;
  enabled?: boolean;
  staleTime?: number; // ms
  network?: Network;
}

export interface UseContractQueryResult<T> {
  data: T | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// In-memory memory cache across renders
const memoryCache = new Map<string, { data: any; timestamp: number }>();
const listeners = new Map<string, Set<(data: any) => void>>();

export function invalidateContractQuery(queryKeyOrPrefix: string) {
  for (const key of memoryCache.keys()) {
    if (key.includes(queryKeyOrPrefix)) {
      memoryCache.delete(key);
    }
  }
}

export function useContractQuery<T>({
  queryKey,
  queryFn,
  enabled = true,
  staleTime = 60_000,
  network = 'testnet',
}: UseContractQueryOptions<T>): UseContractQueryResult<T> {
  const serializedKey = queryKey.map((part) => (part !== null && part !== undefined ? String(part) : '')).join(':');
  const cacheKey = getNormalizedContractCacheKey(network, serializedKey);

  const [data, setData] = useState<T | undefined>(() => {
    const mem = memoryCache.get(cacheKey);
    return mem ? mem.data : undefined;
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => !memoryCache.has(cacheKey));
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const queryFnRef = useRef(queryFn);
  queryFnRef.current = queryFn;

  const fetchQuery = useCallback(async (isManualRefetch = false) => {
    if (!enabled) return;

    setIsFetching(true);
    if (!memoryCache.has(cacheKey) && !isManualRefetch) {
      setIsLoading(true);
    }

    try {
      const result = await queryFnRef.current();
      memoryCache.set(cacheKey, { data: result, timestamp: Date.now() });
      await setContractCache(cacheKey, result);
      setData(result);
      setError(null);

      // Notify other active hooks with same key
      const subs = listeners.get(cacheKey);
      if (subs) {
        subs.forEach((cb) => cb(result));
      }
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [cacheKey, enabled]);

  useEffect(() => {
    if (!enabled) return;

    // Check IndexedDB if memory cache empty
    let isCancelled = false;
    async function loadFromCacheAndFetch() {
      const mem = memoryCache.get(cacheKey);
      const isFresh = mem && Date.now() - mem.timestamp < staleTime;

      if (mem) {
        setData(mem.data);
        setIsLoading(false);
        if (isFresh) return;
      } else {
        try {
          const cached = await getContractCache<T>(cacheKey);
          if (cached && !isCancelled) {
            memoryCache.set(cacheKey, { data: cached.data, timestamp: cached.timestamp });
            setData(cached.data);
            setIsLoading(false);
            if (Date.now() - cached.timestamp < staleTime) {
              return;
            }
          }
        } catch {
          // ignore cache read failure
        }
      }

      if (!isCancelled) {
        fetchQuery();
      }
    }

    loadFromCacheAndFetch();

    // Subscribe to updates on the same key
    if (!listeners.has(cacheKey)) {
      listeners.set(cacheKey, new Set());
    }
    const updateCb = (newData: T) => {
      if (!isCancelled) setData(newData);
    };
    listeners.get(cacheKey)!.add(updateCb);

    return () => {
      isCancelled = true;
      listeners.get(cacheKey)?.delete(updateCb);
    };
  }, [cacheKey, enabled, staleTime, fetchQuery]);

  const refetch = useCallback(async () => {
    await fetchQuery(true);
  }, [fetchQuery]);

  return {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  };
}
