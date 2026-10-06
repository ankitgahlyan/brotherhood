/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { lazy } from 'react';
import { LoaderCircle } from '@/core/components/ui/loader-circle';

const routePreloaders: Array<() => Promise<unknown>> = [];
let hasScheduledPreload = false;

/**
 * Wraps `React.lazy` and caches the resolved module on the Promise using React 19's
 * synchronous `status: 'fulfilled'` / `value` protocol. Once preloaded in idle time,
 * the route renders synchronously on first visit in 0ms without suspending or flashing `RouteFallback`.
 */
export function lazyRoute<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
): React.LazyExoticComponent<T> {
  let cachedPromise: Promise<{ default: T }> | null = null;
  const load = () => {
    if (!cachedPromise) {
      const p = factory().then((mod) => {
        const fulfilled = p as unknown as {
          status?: string;
          value?: { default: T };
        };
        fulfilled.status = 'fulfilled';
        fulfilled.value = mod;
        return mod;
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
