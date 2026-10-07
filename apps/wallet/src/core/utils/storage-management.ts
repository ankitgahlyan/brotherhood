/**
 * Storage Management Utilities
 * Provides comprehensive storage wiping for development, privacy, and full reset.
 */

import { clearFallbackImageCaches } from '@/core/components/ui/fallback-image';

export async function clearWholeAppStorage(): Promise<void> {
  if (typeof window === 'undefined') return;

  await clearFallbackImageCaches();

  // 1. Clear LocalStorage & SessionStorage (preserving only the Passkey-encrypted vault ciphertexts)
  try {
    const passkeyBundles = window.localStorage.getItem(
      'brotherhood_passkey_encrypted_bundles_v1',
    );
    const passkeyTags = window.localStorage.getItem(
      'brotherhood_passkey_backed_up_records',
    );
    const tgPasskeyBundle = window.localStorage.getItem(
      'brotherhood_tg_passkey_bundle',
    );
    window.localStorage.clear();
    window.localStorage.setItem('brotherhood_biometrics_disabled', 'true');
    if (passkeyBundles) {
      window.localStorage.setItem(
        'brotherhood_passkey_encrypted_bundles_v1',
        passkeyBundles,
      );
    }
    if (passkeyTags) {
      window.localStorage.setItem(
        'brotherhood_passkey_backed_up_records',
        passkeyTags,
      );
    }
    if (tgPasskeyBundle) {
      window.localStorage.setItem(
        'brotherhood_tg_passkey_bundle',
        tgPasskeyBundle,
      );
    }
  } catch (err) {
    console.warn('[storage-management] Failed to clear localStorage:', err);
  }

  try {
    window.sessionStorage.clear();
  } catch (err) {
    console.warn('[storage-management] Failed to clear sessionStorage:', err);
  }

  // 2. Clear IndexedDB (preserving brotherhood_passkey_vault_db)
  try {
    if ('indexedDB' in window) {
      const knownDbs = [
        'brotherhood_contract_db',
        'brotherhood-cache',
        'brotherhood_offline_images_db',
        'ton-keystore',
        'keyval-store',
      ];

      if (
        'databases' in indexedDB &&
        typeof indexedDB.databases === 'function'
      ) {
        try {
          const dbs = await indexedDB.databases();
          for (const db of dbs) {
            if (db.name && db.name !== 'brotherhood_passkey_vault_db') {
              indexedDB.deleteDatabase(db.name);
            }
          }
        } catch {
          // Fallback to known DBs if databases() enumeration fails
        }
      }

      for (const name of knownDbs) {
        try {
          indexedDB.deleteDatabase(name);
        } catch {
          // Ignore error
        }
      }
    }
  } catch (err) {
    console.warn('[storage-management] Failed to clear IndexedDB:', err);
  }

  // 3. Clear CacheStorage (preserving brotherhood-passkey-vault-v1)
  try {
    if ('caches' in window) {
      const keys = await window.caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== 'brotherhood-passkey-vault-v1')
          .map((key) => window.caches.delete(key)),
      );
    }
  } catch (err) {
    console.warn('[storage-management] Failed to clear caches:', err);
  }
}

/**
 * Clears all non-precache runtime CacheStorage buckets (images, token media, legacy runtime caches)
 * and fallback-image blob/data-URL caches while preserving the offline Workbox app-shell precache.
 */
export async function clearRuntimeCacheStorage(): Promise<void> {
  if (typeof window === 'undefined') return;
  await clearFallbackImageCaches();
  if (!('caches' in window)) return;
  try {
    const keys = await window.caches.keys();
    await Promise.all(
      keys
        .filter(
          (key) =>
            !key.startsWith('workbox-precache') &&
            key !== 'brotherhood-passkey-vault-v1',
        )
        .map((key) => window.caches.delete(key)),
    );
  } catch (err) {
    console.warn('[storage-management] Failed to clear runtime caches:', err);
  }
}
