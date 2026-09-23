/**
 * Storage Management Utilities
 * Provides comprehensive storage wiping for development, privacy, and full reset.
 */

export async function clearWholeAppStorage(): Promise<void> {
  if (typeof window === 'undefined') return;

  // 1. Clear LocalStorage & SessionStorage
  try {
    window.localStorage.clear();
  } catch (err) {
    console.warn('[storage-management] Failed to clear localStorage:', err);
  }

  try {
    window.sessionStorage.clear();
  } catch (err) {
    console.warn('[storage-management] Failed to clear sessionStorage:', err);
  }

  // 2. Clear IndexedDB
  try {
    if ('indexedDB' in window) {
      const knownDbs = ['brotherhood-cache', 'ton-keystore', 'keyval-store'];

      if (
        'databases' in indexedDB &&
        typeof indexedDB.databases === 'function'
      ) {
        try {
          const dbs = await indexedDB.databases();
          for (const db of dbs) {
            if (db.name) {
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

  // 3. Clear CacheStorage
  try {
    if ('caches' in window) {
      const keys = await window.caches.keys();
      await Promise.all(keys.map((key) => window.caches.delete(key)));
    }
  } catch (err) {
    console.warn('[storage-management] Failed to clear caches:', err);
  }
}
