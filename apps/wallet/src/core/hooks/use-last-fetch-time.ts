import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getLastFetchTime,
  CACHE_UPDATED_EVENT,
} from '@/lib/brotherhood/contract-cache';

export function formatRelativeTime(timestamp: number | null): string {
  if (!timestamp) return 'Never';
  const diffMs = Date.now() - timestamp;
  if (diffMs < 0) return 'Just now';
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 30) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export function formatAbsoluteTime(timestamp: number | null): string {
  if (!timestamp) return 'Never';
  return new Date(timestamp).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function useLastFetchTime(keys?: string[]) {
  const [timestamp, setTimestamp] = useState<number | null>(null);
  const [, setTick] = useState(0);

  const keysList = useMemo(
    () => (keys ? [...keys].sort() : undefined),
    [keys],
  );

  const updateTimestamp = useCallback(async () => {
    const ts = await getLastFetchTime(
      keysList && keysList.length > 0 ? keysList : undefined,
    );
    setTimestamp(ts);
  }, [keysList]);

  useEffect(() => {
    void updateTimestamp();

    const handleCacheUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<{ key: string; timestamp: number }>;
      if (
        !keysList ||
        keysList.length === 0 ||
        keysList.includes(customEvent.detail?.key)
      ) {
        if (customEvent.detail?.timestamp) {
          setTimestamp((prev) =>
            prev === null || customEvent.detail.timestamp > prev
              ? customEvent.detail.timestamp
              : prev,
          );
        } else {
          void updateTimestamp();
        }
      }
    };

    window.addEventListener(CACHE_UPDATED_EVENT, handleCacheUpdated);

    // Ticker every 10 seconds to update relative time string (e.g. "Just now" -> "1m ago")
    const ticker = setInterval(() => {
      setTick((t) => t + 1);
    }, 10_000);

    return () => {
      window.removeEventListener(CACHE_UPDATED_EVENT, handleCacheUpdated);
      clearInterval(ticker);
    };
  }, [updateTimestamp, keysList]);

  return {
    timestamp,
    relativeTime: formatRelativeTime(timestamp),
    formattedTime: formatAbsoluteTime(timestamp),
    refreshTimestamp: updateTimestamp,
  };
}
