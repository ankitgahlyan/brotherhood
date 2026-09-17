/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  isTelegramEnvironment,
  getRawTelegramWebApp,
  telegramHaptics,
} from '@/core/lib/telegram';

export type NativeNotificationPermission =
  'default' | 'granted' | 'denied' | 'unsupported';

const NOTIFIED_KEYS_STORAGE = 'brotherhood-notified-cache';

function getNotifiedKeys(): Set<string> {
  try {
    const raw = localStorage.getItem(NOTIFIED_KEYS_STORAGE);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function markNotifiedKey(key: string): void {
  try {
    const keys = getNotifiedKeys();
    keys.add(key);
    // Keep set bounded
    const arr = Array.from(keys).slice(-100);
    localStorage.setItem(NOTIFIED_KEYS_STORAGE, JSON.stringify(arr));
  } catch {
    /* ignore */
  }
}

export function getBrowserNotificationPermission(): NativeNotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

export async function requestBrowserNotificationPermission(): Promise<NativeNotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  try {
    const perm = await Notification.requestPermission();
    return perm;
  } catch {
    return Notification.permission;
  }
}

export interface SendNotificationOptions {
  key?: string; // Dedup key so we don't repeat the notification repeatedly
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
}

export function sendNativeNotification(
  title: string,
  options: SendNotificationOptions,
): boolean {
  if (options.key) {
    const seen = getNotifiedKeys();
    if (seen.has(options.key)) {
      return false;
    }
    markNotifiedKey(options.key);
  }

  let sent = false;

  // 1. Browser Web Notification API
  if (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    Notification.permission === 'granted'
  ) {
    try {
      const base = import.meta.env.BASE_URL || '/';
      const iconUrl = options.icon || `${base}favicon.svg`;
      new Notification(title, {
        body: options.body,
        icon: iconUrl,
        badge: options.badge || iconUrl,
        tag: options.tag || options.key,
      });
      sent = true;
    } catch (e) {
      console.warn(
        '[Notification] Failed to dispatch browser notification:',
        e,
      );
    }
  }

  // 2. Telegram Mini App Alert / Haptic feedback
  if (isTelegramEnvironment()) {
    try {
      telegramHaptics.notification('success');
      const rawApp = getRawTelegramWebApp();
      // If showAlert or showPopup is available in Telegram WebApp
      if (rawApp?.showAlert && !sent) {
        rawApp.showAlert(`${title}\n${options.body}`);
        sent = true;
      }
    } catch {
      /* ignore */
    }
  }

  return sent;
}
