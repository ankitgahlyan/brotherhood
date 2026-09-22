/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

function getLocalStorage(): Storage | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
    return (globalThis as any).localStorage;
  }
  return null;
}

/**
 * Hard drop all legacy `tracked_addresses:*` keys from localStorage immediately without migration,
 * rebuilding state cleanly from the blockchain via `batchHydrateUniversal`.
 */
export function purgeLegacyTrackedAddressesStorage(): void {
  const storage = getLocalStorage();
  if (!storage) return;

  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (
        key &&
        (key.startsWith('tracked_addresses:') ||
          key === 'current_selected_wallet' ||
          key.startsWith('brotherhood_tracked_personal_tokens_') ||
          key.startsWith('brotherhood_discovered_initial_'))
      ) {
        keysToRemove.push(key);
      }
    }
    for (const k of keysToRemove) {
      storage.removeItem(k);
    }
  } catch (err) {
    console.warn('[purgeLegacyTrackedAddressesStorage] Failed cleanup:', err);
  }
}
