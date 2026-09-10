/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  init,
  isTMA,
  retrieveLaunchParams,
  mountMiniApp,
  mountViewport,
  mountSwipeBehavior,
  mountThemeParams,
  mountBackButton,
  expandViewport,
  disableVerticalSwipes,
  enableVerticalSwipes,
  hapticFeedbackImpactOccurred,
  hapticFeedbackNotificationOccurred,
  hapticFeedbackSelectionChanged,
  isHapticFeedbackSupported,
  showBackButton,
  hideBackButton,
  onBackButtonClick,
} from '@telegram-apps/sdk';

export interface TelegramSafeAreaInset {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

export interface TelegramWebApp {
  initData?: string;
  initDataUnsafe?: {
    user?: {
      id: number;
      first_name?: string;
      last_name?: string;
      username?: string;
      language_code?: string;
      photo_url?: string;
      is_premium?: boolean;
    };
    start_param?: string;
  };
  colorScheme?: 'light' | 'dark';
  themeParams?: Record<string, string>;
  platform?: string;
  isExpanded?: boolean;
  viewportHeight?: number;
  viewportStableHeight?: number;
  headerColor?: string;
  backgroundColor?: string;
  safeAreaInset?: TelegramSafeAreaInset;
  contentSafeAreaInset?: TelegramSafeAreaInset;
  BackButton?: {
    isVisible?: boolean;
    show: () => void;
    hide: () => void;
    onClick: (cb: () => void) => void;
    offClick: (cb: () => void) => void;
  };
  HapticFeedback?: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  expand?: () => void;
  ready?: () => void;
  close?: () => void;
  disableVerticalSwipes?: () => void;
  enableVerticalSwipes?: () => void;
  openTelegramLink?: (url: string) => void;
  onEvent?: (eventType: string, eventHandler: (...args: any[]) => void) => void;
  offEvent?: (eventType: string, eventHandler: (...args: any[]) => void) => void;
}

let isInitialized = false;
let isInsideTma = false;
let swipeDisableCount = 0;

export interface TelegramUser {
  id: number;
  firstName?: string;
  lastName?: string;
  username?: string;
  languageCode?: string;
  photoUrl?: string;
  isPremium?: boolean;
}

export function getRawTelegramWebApp(): TelegramWebApp | undefined {
  if (typeof window === 'undefined') return undefined;
  return (window as unknown as { Telegram?: { WebApp?: TelegramWebApp } }).Telegram?.WebApp;
}

export function isTelegramEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  if (isInsideTma) return true;
  try {
    if (isTMA()) return true;
  } catch {
    // ignore
  }
  const rawApp = getRawTelegramWebApp();
  return Boolean(rawApp && rawApp.platform && rawApp.platform !== 'unknown');
}

/**
 * Updates dynamic Safe Area CSS variables on documentElement.
 */
export function updateSafeAreaProperties(): void {
  if (typeof document === 'undefined') return;

  const rawApp = getRawTelegramWebApp();
  let top = 0;
  let bottom = 0;
  let left = 0;
  let right = 0;
  let contentTop = 0;
  let contentBottom = 0;

  if (rawApp?.safeAreaInset) {
    top = rawApp.safeAreaInset.top || 0;
    bottom = rawApp.safeAreaInset.bottom || 0;
    left = rawApp.safeAreaInset.left || 0;
    right = rawApp.safeAreaInset.right || 0;
  }

  if (rawApp?.contentSafeAreaInset) {
    contentTop = rawApp.contentSafeAreaInset.top || 0;
    contentBottom = rawApp.contentSafeAreaInset.bottom || 0;
  }

  const root = document.documentElement;
  root.style.setProperty('--tg-safe-area-top', `${top + contentTop}px`);
  root.style.setProperty('--tg-safe-area-bottom', `${bottom + contentBottom}px`);
  root.style.setProperty('--tg-safe-area-left', `${left}px`);
  root.style.setProperty('--tg-safe-area-right', `${right}px`);
  root.style.setProperty('--tg-content-safe-area-top', `${contentTop}px`);
  root.style.setProperty('--tg-content-safe-area-bottom', `${contentBottom}px`);
}

/**
 * Initializes Telegram Mini App SDK, mounts subsystems, sets up viewport and safe-areas.
 */
export function initTelegramSdk(): boolean {
  if (isInitialized) return isInsideTma;
  isInitialized = true;

  if (typeof window === 'undefined') return false;

  const rawApp = getRawTelegramWebApp();
  const hasTg = isTelegramEnvironment();

  if (!hasTg && !rawApp) {
    isInsideTma = false;
    return false;
  }

  try {
    init();
    isInsideTma = true;
  } catch {
    if (rawApp) {
      isInsideTma = true;
    }
  }

  if (!isInsideTma) return false;

  // Mount components safely
  try {
    if (mountMiniApp.isAvailable()) mountMiniApp();
  } catch {
    // ignore
  }

  try {
    if (mountViewport.isAvailable()) {
      mountViewport().then(() => {
        if (expandViewport.isAvailable()) {
          expandViewport();
        }
        updateSafeAreaProperties();
      }).catch(() => {
        // ignore
      });
    } else if (rawApp?.expand) {
      rawApp.expand();
    }
  } catch {
    rawApp?.expand?.();
  }

  try {
    if (mountSwipeBehavior.isAvailable()) mountSwipeBehavior();
  } catch {
    // ignore
  }

  try {
    if (mountThemeParams.isAvailable()) mountThemeParams();
  } catch {
    // ignore
  }

  try {
    if (mountBackButton.isAvailable()) mountBackButton();
  } catch {
    // ignore
  }

  if (rawApp) {
    try {
      rawApp.ready?.();
      rawApp.onEvent?.('safeAreaChanged', updateSafeAreaProperties);
      rawApp.onEvent?.('contentSafeAreaChanged', updateSafeAreaProperties);
      rawApp.onEvent?.('viewportChanged', updateSafeAreaProperties);
    } catch {
      // ignore
    }
  }

  updateSafeAreaProperties();
  syncTelegramTheme();

  return true;
}

/**
 * Synchronizes Telegram theme color scheme with the app document attributes.
 */
export function syncTelegramTheme(): void {
  if (typeof document === 'undefined' || !isInsideTma) return;
  const rawApp = getRawTelegramWebApp();
  const colorScheme = rawApp?.colorScheme;

  if (colorScheme) {
    const isDark = colorScheme === 'dark';
    const stored = localStorage.getItem('brotherhood-theme');
    // If no manual stored theme or set to system, apply Telegram theme
    if (!stored || stored === 'system') {
      if (isDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
      }
    }
  }
}

/**
 * Lock vertical swipe-to-close gesture when modal/sheet is open.
 */
export function disableTelegramSwipeToClose(): void {
  if (!isInsideTma) return;
  swipeDisableCount += 1;
  if (swipeDisableCount === 1) {
    try {
      if (disableVerticalSwipes.isAvailable()) {
        disableVerticalSwipes();
      } else {
        getRawTelegramWebApp()?.disableVerticalSwipes?.();
      }
    } catch {
      getRawTelegramWebApp()?.disableVerticalSwipes?.();
    }
  }
}

/**
 * Unlock vertical swipe-to-close gesture when modal/sheet closes.
 */
export function enableTelegramSwipeToClose(): void {
  if (!isInsideTma) return;
  swipeDisableCount = Math.max(0, swipeDisableCount - 1);
  if (swipeDisableCount === 0) {
    try {
      if (enableVerticalSwipes.isAvailable()) {
        enableVerticalSwipes();
      } else {
        getRawTelegramWebApp()?.enableVerticalSwipes?.();
      }
    } catch {
      getRawTelegramWebApp()?.enableVerticalSwipes?.();
    }
  }
}

/**
 * Telegram native Haptic Feedback helpers
 */
export const telegramHaptics = {
  impact(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'light'): void {
    if (!isInsideTma) return;
    try {
      if (isHapticFeedbackSupported()) {
        hapticFeedbackImpactOccurred(style);
        return;
      }
    } catch {
      // fallback
    }
    try {
      getRawTelegramWebApp()?.HapticFeedback?.impactOccurred?.(style);
    } catch {
      // ignore
    }
  },

  notification(type: 'error' | 'success' | 'warning'): void {
    if (!isInsideTma) return;
    try {
      if (isHapticFeedbackSupported()) {
        hapticFeedbackNotificationOccurred(type);
        return;
      }
    } catch {
      // fallback
    }
    try {
      getRawTelegramWebApp()?.HapticFeedback?.notificationOccurred?.(type);
    } catch {
      // ignore
    }
  },

  selectionChanged(): void {
    if (!isInsideTma) return;
    try {
      if (isHapticFeedbackSupported()) {
        hapticFeedbackSelectionChanged();
        return;
      }
    } catch {
      // fallback
    }
    try {
      getRawTelegramWebApp()?.HapticFeedback?.selectionChanged?.();
    } catch {
      // ignore
    }
  },
};

/**
 * Retrieve current Telegram launch user information if available.
 */
export function getTelegramLaunchUser(): TelegramUser | undefined {
  try {
    const launchParams = retrieveLaunchParams(true);
    const user = launchParams.tgWebAppData?.user;
    if (user) {
      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        languageCode: user.languageCode,
        photoUrl: user.photoUrl,
        isPremium: user.isPremium,
      };
    }
  } catch {
    // fallback to window.Telegram
  }

  const rawUser = getRawTelegramWebApp()?.initDataUnsafe?.user;
  if (rawUser) {
    return {
      id: rawUser.id,
      firstName: rawUser.first_name,
      lastName: rawUser.last_name,
      username: rawUser.username,
      languageCode: rawUser.language_code,
      photoUrl: rawUser.photo_url,
      isPremium: rawUser.is_premium,
    };
  }

  return undefined;
}

/**
 * Telegram BackButton interface wrappers
 */
export function showTelegramBackButton(): void {
  if (!isInsideTma) return;
  try {
    if (showBackButton.isAvailable()) {
      showBackButton();
      return;
    }
  } catch {
    // ignore
  }
  getRawTelegramWebApp()?.BackButton?.show?.();
}

export function hideTelegramBackButton(): void {
  if (!isInsideTma) return;
  try {
    if (hideBackButton.isAvailable()) {
      hideBackButton();
      return;
    }
  } catch {
    // ignore
  }
  getRawTelegramWebApp()?.BackButton?.hide?.();
}

export function subscribeTelegramBackButton(cb: () => void): () => void {
  if (!isInsideTma) return () => {};

  try {
    if (onBackButtonClick.isAvailable()) {
      const unsub = onBackButtonClick(cb);
      return unsub;
    }
  } catch {
    // fallback
  }

  const rawBackButton = getRawTelegramWebApp()?.BackButton;
  if (rawBackButton) {
    rawBackButton.onClick(cb);
    return () => {
      rawBackButton.offClick(cb);
    };
  }

  return () => {};
}
