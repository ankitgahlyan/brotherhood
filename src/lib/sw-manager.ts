// Helper for Service Worker registration, status checks, and cache invalidation.

export interface AppCacheStatus {
  swRegistered: boolean;
  swState: string;
  cacheNames: string[];
  totalCacheSizeApprox: string;
}

export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // In Vite/Start, base path or relative sw.js path
      const swUrl = `${import.meta.env.BASE_URL || '/'}sw.js`;
      navigator.serviceWorker
        .register(swUrl)
        .then((reg) => {
          console.log('[SW] Registered successfully with scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('[SW] Registration failed:', err);
        });
    });
  }
}

export async function getAppCacheStatus(): Promise<AppCacheStatus> {
  if (typeof window === 'undefined') {
    return {
      swRegistered: false,
      swState: 'unsupported',
      cacheNames: [],
      totalCacheSizeApprox: '0 KB',
    };
  }

  const swRegistered =
    'serviceWorker' in navigator && !!navigator.serviceWorker.controller;
  const swState =
    'serviceWorker' in navigator
      ? navigator.serviceWorker.controller
        ? navigator.serviceWorker.controller.state
        : 'no-controller'
      : 'unsupported';

  let cacheNames: string[] = [];
  if ('caches' in window) {
    try {
      cacheNames = await caches.keys();
    } catch {
      cacheNames = [];
    }
  }

  return {
    swRegistered,
    swState,
    cacheNames,
    totalCacheSizeApprox: `${cacheNames.length} cache stores`,
  };
}

export async function invalidateAppCacheAndReload(): Promise<void> {
  if (typeof window === 'undefined') return;

  // 1. Delete all CacheStorage entries
  if ('caches' in window) {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
      console.log('[SW-Manager] Cleared all CacheStorage keys');
    } catch (e) {
      console.warn('[SW-Manager] Error deleting caches:', e);
    }
  }

  // 2. Unregister Service Workers
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) {
        if (reg.active) {
          reg.active.postMessage({ type: 'CLEAR_CACHE' });
          reg.active.postMessage({ type: 'SKIP_WAITING' });
        }
        await reg.unregister();
      }
      console.log('[SW-Manager] Unregistered all service workers');
    } catch (e) {
      console.warn('[SW-Manager] Error unregistering service workers:', e);
    }
  }

  // 3. Reload page from server
  window.location.reload();
}
