/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

const RELOAD_STORAGE_KEY = 'brotherhood_chunk_reload_ts';
const RELOAD_COOLDOWN_MS = 15_000;

/**
 * Checks if an error is a dynamic import or chunk loading failure caused by
 * network drops or newly deployed production assets having different chunk hashes.
 */
export function isChunkLoadError(error: unknown): boolean {
  if (!error) return false;
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : String(error);

  return (
    /Failed to fetch dynamically imported module/i.test(message) ||
    /error loading dynamically imported module/i.test(message) ||
    /Importing a module script failed/i.test(message) ||
    /Loading chunk [\d]+ failed/i.test(message) ||
    /Loading CSS chunk [\d]+ failed/i.test(message) ||
    /ChunkLoadError/i.test(message)
  );
}

/**
 * Recovers from chunk fetch failure by reloading the page with fresh index assets.
 * Uses sessionStorage cooldown to guarantee against infinite reload loops if
 * the error persists.
 *
 * Returns true if a reload was initiated, or false if within cooldown or SSR.
 */
export function triggerChunkReload(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const lastReloadStr = window.sessionStorage.getItem(RELOAD_STORAGE_KEY);
    const now = Date.now();
    if (lastReloadStr) {
      const lastReload = Number.parseInt(lastReloadStr, 10);
      if (!Number.isNaN(lastReload) && now - lastReload < RELOAD_COOLDOWN_MS) {
        console.warn(
          '[ChunkReload] Suppressed auto-reload: recent chunk reload occurred within cooldown window.',
        );
        return false;
      }
    }

    window.sessionStorage.setItem(RELOAD_STORAGE_KEY, String(now));
  } catch {
    // sessionStorage might be restricted in private browsing; proceed with reload
  }

  console.info(
    '[ChunkReload] Stale production chunk or dynamic import failure detected. Reloading with fresh assets...',
  );
  window.location.reload();
  return true;
}

/**
 * Listens for Vite's `vite:preloadError` event emitted when a dynamic chunk fails to load.
 * Prevents unhandled rejection toasts and automatically reloads to pull the latest production build.
 */
export function initChunkReloadListener(): void {
  if (typeof window === 'undefined') return;

  window.addEventListener('vite:preloadError', (event) => {
    // Prevent default unhandled error logging where possible
    event.preventDefault();
    console.warn('[ChunkReload] vite:preloadError event caught:', event);
    triggerChunkReload();
  });
}
