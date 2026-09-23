/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {
  AnimationLevel,
  PreferencesSliceCreator,
  PreferencesState,
} from '../../types/store';

/** Detect sensible default animation level based on environment & hardware */
export const detectDefaultAnimationLevel = (): AnimationLevel => {
  if (typeof window === 'undefined') return 'full';

  // If user has OS-level reduced motion enabled, respect it by default
  if (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return 'none';
  }

  // Telegram Mini Apps / WebViews or low-core mobile browsers get 'performance' by default
  const isTma =
    Boolean((window as any).Telegram?.WebApp) ||
    'TelegramWebviewProxy' in window ||
    Boolean(window.location?.search?.includes('tgWebAppData')) ||
    Boolean(window.location?.hash?.includes('tgWebAppData'));

  const isLowEndDevice =
    typeof navigator !== 'undefined' &&
    typeof navigator.hardwareConcurrency === 'number' &&
    navigator.hardwareConcurrency <= 4;

  if (isTma || isLowEndDevice) {
    return 'performance';
  }

  return 'full';
};

const getInitialPreferences = (): PreferencesState => ({
  animationLevel: detectDefaultAnimationLevel(),
  isCustomAnimationLevel: false,
});

export const createPreferencesSlice: PreferencesSliceCreator = (set) => ({
  preferences: getInitialPreferences(),

  setAnimationLevel: (level: AnimationLevel) => {
    set((state) => {
      state.preferences.animationLevel = level;
      state.preferences.isCustomAnimationLevel = true;
    });
  },

  resetPreferences: () => {
    set((state) => {
      state.preferences = getInitialPreferences();
    });
  },
});
