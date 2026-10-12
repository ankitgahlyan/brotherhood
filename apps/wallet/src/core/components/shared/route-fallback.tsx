/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { lazy } from 'react';
import { LoaderCircle } from '@/core/components/ui/loader-circle';
import { isChunkLoadError, triggerChunkReload } from '@/core/lib/chunk-reload';

const routePreloaders: Array<() => Promise<unknown>> = [];
let hasScheduledPreload = false;

/**
 * Loads a module dynamically with a retry attempt for transient network failures.
 * If the error is an unrecoverable chunk load error (e.g. stale deployed hash),
 * triggers a guarded page reload to pull fresh assets.
 */
async function loadWithRetry<T>(
  factory: () => Promise<T>,
  retries = 1,
): Promise<T> {
  try {
    return await factory();
  } catch (error) {
    if (retries > 0) {
      // Short delay before retrying transient network glitch
      await new Promise((resolve) => setTimeout(resolve, 350));
      return loadWithRetry(factory, retries - 1);
    }
    if (isChunkLoadError(error)) {
      triggerChunkReload();
    }
    throw error;
  }
}

/**
 * Wraps `React.lazy` and caches the resolved module on the Promise using React 19's
 * synchronous `status: 'fulfilled'` / `value` protocol. Once preloaded in idle time,
 * the route renders synchronously on first visit in 0ms without suspending or flashing `RouteFallback`.
 * If loading fails, `cachedPromise` is cleared so subsequent navigation or retries can re-attempt.
 */
export function lazyRoute<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
): React.LazyExoticComponent<T> {
  let cachedPromise: Promise<{ default: T }> | null = null;
  const load = () => {
    if (!cachedPromise) {
      const p = loadWithRetry(factory)
        .then((mod) => {
          const fulfilled = p as unknown as {
            status?: string;
            value?: { default: T };
          };
          fulfilled.status = 'fulfilled';
          fulfilled.value = mod;
          return mod;
        })
        .catch((err) => {
          // Never leave a rejected Promise cached — allow subsequent navigations to retry
          cachedPromise = null;
          throw err;
        });
      cachedPromise = p;
    }
    return cachedPromise;
  };
  routePreloaders.push(load);
  return lazy(load);
}

/**
 * Preloads all registered `lazyRoute` chunks sequentially during browser idle frames
 * after initial startup so route transitions never stall or flash a fallback spinner.
 */
export function preloadLazyRoutes(): void {
  if (hasScheduledPreload || typeof window === 'undefined') return;
  hasScheduledPreload = true;

  let index = 0;
  const scheduleNext = () => {
    if (index >= routePreloaders.length) return;
    const run = () => {
      const loader = routePreloaders[index++];
      if (loader) {
        void loader()
          .catch(() => {
            /* ignore background preload error; route will retry on navigation */
          })
          .finally(() => {
            scheduleNext();
          });
      }
    };

    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(run, { timeout: 1500 });
    } else {
      window.setTimeout(run, 60);
    }
  };

  scheduleNext();
}

export const RouteFallback: React.FC = () => (
  <div className="flex h-64 items-center justify-center">
    <LoaderCircle size="md" />
  </div>
);
