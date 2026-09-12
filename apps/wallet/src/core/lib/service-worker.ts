/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { registerSW } from 'virtual:pwa-register';

type UpdateCallback = (hasUpdate: boolean) => void;

let updateSWFn: ((reloadPage?: boolean) => Promise<void>) | null = null;
let swRegistration: ServiceWorkerRegistration | null = null;
let hasPendingUpdate = false;
const listeners = new Set<UpdateCallback>();

function notifyListeners(hasUpdate: boolean) {
  hasPendingUpdate = hasUpdate;
  listeners.forEach((cb) => {
    try {
      cb(hasUpdate);
    } catch (e) {
      console.error('[ServiceWorker] Listener error:', e);
    }
  });
}

export function onSWUpdateAvailable(cb: UpdateCallback): () => void {
  listeners.add(cb);
  if (hasPendingUpdate) {
    cb(true);
  }
  return () => {
    listeners.delete(cb);
  };
}

export function isUpdateAvailable(): boolean {
  return hasPendingUpdate;
}

export function initServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  updateSWFn = registerSW({
    immediate: true,
    onNeedRefresh() {
      console.log('[ServiceWorker] New version available in waiting state.');
      notifyListeners(true);
    },
    onOfflineReady() {
      console.log('[ServiceWorker] App cached and ready for offline use.');
    },
    onRegisteredSW(_swScriptUrl, registration) {
      if (registration) {
        swRegistration = registration;
        if (registration.waiting) {
          notifyListeners(true);
        }
      }
    },
    onRegisterError(error) {
      console.warn('[ServiceWorker] Registration error:', error);
    },
  });
}

export async function checkForAppUpdates(): Promise<{ hasUpdate: boolean }> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return { hasUpdate: false };
  }

  if (!navigator.onLine) {
    return { hasUpdate: false };
  }

  try {
    const reg =
      swRegistration || (await navigator.serviceWorker.getRegistration());
    if (!reg) {
      return { hasUpdate: false };
    }
    swRegistration = reg;

    // Check if there's already an active waiting worker
    if (reg.waiting) {
      notifyListeners(true);
      return { hasUpdate: true };
    }

    // Trigger update check against the host
    await reg.update();

    if (reg.waiting || reg.installing) {
      notifyListeners(true);
      return { hasUpdate: true };
    }

    return { hasUpdate: false };
  } catch (err) {
    console.warn('[ServiceWorker] Failed to check for updates:', err);
    return { hasUpdate: false };
  }
}

export async function applyAppUpdate(): Promise<void> {
  if (updateSWFn) {
    await updateSWFn(true);
  } else {
    window.location.reload();
  }
}
