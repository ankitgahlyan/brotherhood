/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  init,
  openTelegramLink as openTgLink,
  retrieveLaunchParams,
} from '@telegram-apps/sdk';

// Initialize the SDK so its helpers can reach the native Telegram client.
try {
  init();
} catch {
  /* not inside a Telegram Mini App */
}

/** Telegram user id from the Mini App launch params, or undefined outside Telegram. */
export function getTelegramId(): number | undefined {
  try {
    return retrieveLaunchParams(true).tgWebAppData?.user?.id;
  } catch {
    return undefined;
  }
}

/** Open a t.me link inside Telegram, falling back to a new browser tab. */
export function openTelegramLink(url: string): void {
  if (openTgLink.isAvailable()) {
    openTgLink(url);
    return;
  }
  window.open(url, '_blank', 'noopener,noreferrer');
}

/** Strip leading @ and whitespace from a Telegram username. */
export function cleanTelegramUsername(username: string): string {
  return username.replace(/^@+/, '').trim();
}

/** Construct a canonical Telegram profile deep-link URL (e.g. https://t.me/username). */
export function getTelegramProfileUrl(username: string): string {
  const clean = cleanTelegramUsername(username);
  return clean ? `https://t.me/${clean}` : 'https://t.me';
}

/** Open a user's Telegram profile/chat via native Telegram Mini App deeplink or browser. */
export function openTelegramProfile(username: string): void {
  const url = getTelegramProfileUrl(username);
  openTelegramLink(url);
}
