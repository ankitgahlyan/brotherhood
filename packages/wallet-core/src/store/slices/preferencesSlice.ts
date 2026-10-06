/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {
  AnimationLevel,
  ViewMode,
  PreferencesSliceCreator,
  PreferencesState,
} from '../../types/store';

/** Detect sensible default animation level based on environment & hardware */
export const detectDefaultAnimationLevel = (): AnimationLevel => {
  if (typeof window === 'undefined') return 'performance';

  // If user has OS-level reduced motion enabled, respect it by default
  if (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return 'none';
  }

  return 'performance';
};

const getInitialPreferences = (): PreferencesState => ({
  animationLevel: detectDefaultAnimationLevel(),
  isCustomAnimationLevel: false,
  viewMode: 'standard',
});

export const createPreferencesSlice: PreferencesSliceCreator = (set) => ({
  preferences: getInitialPreferences(),

  setAnimationLevel: (level: AnimationLevel) => {
    set((state) => {
      if (state.preferences.animationLevel === level) return;
      state.preferences.animationLevel = level;
      state.preferences.isCustomAnimationLevel = true;
    });
  },

  setViewMode: (mode: ViewMode) => {
    set((state) => {
      if (state.preferences.viewMode === mode) return;
      state.preferences.viewMode = mode;
    });
  },

  resetPreferences: () => {
    set((state) => {
      state.preferences = getInitialPreferences();
    });
  },
});
