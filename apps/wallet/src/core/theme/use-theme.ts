/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useCallback, useSyncExternalStore } from 'react';
import {
  settingsStorage,
  SettingsKeys,
  ThemeSchema,
  ColorPaletteSchema,
} from '@/core/storage';
import type {
  ColorPalette,
  ResolvedTheme,
  ThemeMode,
  ThemeState,
} from './types';

export const THEME_STORAGE_KEY = SettingsKeys.THEME;
export const PALETTE_STORAGE_KEY = SettingsKeys.PALETTE;

export const getSystemTheme = (): ResolvedTheme => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
};

export const applyPaletteToDom = (palette: ColorPalette): ColorPalette => {
  if (typeof window === 'undefined') return 'violet';
  const root = document.documentElement;
  root.setAttribute('data-palette', palette);
  return palette;
};

export const applyThemeToDom = (theme: ThemeMode): ResolvedTheme => {
  if (typeof window === 'undefined') return 'light';

  const resolved: ResolvedTheme = theme === 'system' ? getSystemTheme() : theme;
  const root = document.documentElement;

  root.classList.toggle('dark', resolved === 'dark' || resolved === 'oled');
  root.setAttribute('data-theme', resolved);

  const meta = document.querySelector('meta[name="color-scheme"]');
  if (meta) {
    meta.setAttribute('content', resolved === 'light' ? 'light' : 'dark');
  }

  return resolved;
};

let currentTheme: ThemeMode = settingsStorage.get(
  THEME_STORAGE_KEY,
  ThemeSchema,
  'system',
);
let currentResolved: ResolvedTheme =
  typeof window !== 'undefined' ? applyThemeToDom(currentTheme) : 'light';

let currentPalette: ColorPalette = settingsStorage.get(
  PALETTE_STORAGE_KEY,
  ColorPaletteSchema,
  'violet',
);
if (typeof window !== 'undefined') {
  applyPaletteToDom(currentPalette);
}

interface ThemeSnapshot {
  theme: ThemeMode;
  palette: ColorPalette;
}

let currentSnapshot: ThemeSnapshot = {
  theme: currentTheme,
  palette: currentPalette,
};

const SERVER_SNAPSHOT: ThemeSnapshot = {
  theme: 'system',
  palette: 'violet',
};

const themeSubscribers = new Set<() => void>();

function notifyThemeChange(): void {
  for (const sub of themeSubscribers) {
    sub();
  }
}

function updateTheme(theme: ThemeMode): void {
  currentTheme = theme;
  currentResolved = applyThemeToDom(theme);
  currentSnapshot = { theme: currentTheme, palette: currentPalette };
  settingsStorage.set(THEME_STORAGE_KEY, theme);
  notifyThemeChange();
}

function updatePalette(palette: ColorPalette): void {
  currentPalette = palette;
  applyPaletteToDom(palette);
  currentSnapshot = { theme: currentTheme, palette: currentPalette };
  settingsStorage.set(PALETTE_STORAGE_KEY, palette);
  notifyThemeChange();
}

// Subscribe to storage changes (e.g. cross-tab)
settingsStorage.subscribe(THEME_STORAGE_KEY, () => {
  const next = settingsStorage.get(THEME_STORAGE_KEY, ThemeSchema, 'system');
  if (next !== currentTheme) {
    currentTheme = next;
    currentResolved = applyThemeToDom(next);
    currentSnapshot = { theme: currentTheme, palette: currentPalette };
    notifyThemeChange();
  }
});

settingsStorage.subscribe(PALETTE_STORAGE_KEY, () => {
  const next = settingsStorage.get(
    PALETTE_STORAGE_KEY,
    ColorPaletteSchema,
    'violet',
  );
  if (next !== currentPalette) {
    currentPalette = next;
    applyPaletteToDom(next);
    currentSnapshot = { theme: currentTheme, palette: currentPalette };
    notifyThemeChange();
  }
});

// Subscribe to system prefers-color-scheme changes
if (typeof window !== 'undefined') {
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  media.addEventListener('change', () => {
    if (currentTheme === 'system') {
      currentResolved = applyThemeToDom('system');
      notifyThemeChange();
    }
  });
}

function subscribe(callback: () => void): () => void {
  themeSubscribers.add(callback);
  return () => {
    themeSubscribers.delete(callback);
  };
}

function getSnapshot(): ThemeSnapshot {
  return currentSnapshot;
}

function getServerSnapshot(): ThemeSnapshot {
  return SERVER_SNAPSHOT;
}

export function useTheme(): ThemeState {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const resolvedTheme = currentResolved;

  const setTheme = useCallback((nextTheme: ThemeMode) => {
    updateTheme(nextTheme);
  }, []);

  const setPalette = useCallback((nextPalette: ColorPalette) => {
    updatePalette(nextPalette);
  }, []);

  const toggleTheme = useCallback(() => {
    const next: ThemeMode =
      currentResolved === 'light'
        ? 'dark'
        : currentResolved === 'dark'
          ? 'oled'
          : 'light';
    updateTheme(next);
  }, []);

  return {
    theme: state.theme,
    resolvedTheme,
    palette: state.palette,
    setTheme,
    setPalette,
    toggleTheme,
  };
}
