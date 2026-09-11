/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useCallback, useSyncExternalStore } from 'react';
import { settingsStorage, SettingsKeys, ThemeSchema } from '@/core/storage';
import type { ResolvedTheme, ThemeMode, ThemeState } from './types';

export const THEME_STORAGE_KEY = SettingsKeys.THEME;

export const getSystemTheme = (): ResolvedTheme => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
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

const themeSubscribers = new Set<() => void>();

function notifyThemeChange(): void {
  for (const sub of themeSubscribers) {
    sub();
  }
}

function updateTheme(theme: ThemeMode): void {
  currentTheme = theme;
  currentResolved = applyThemeToDom(theme);
  settingsStorage.set(THEME_STORAGE_KEY, theme);
  notifyThemeChange();
}

// Subscribe to storage changes (e.g. cross-tab)
settingsStorage.subscribe(THEME_STORAGE_KEY, () => {
  const next = settingsStorage.get(THEME_STORAGE_KEY, ThemeSchema, 'system');
  if (next !== currentTheme) {
    currentTheme = next;
    currentResolved = applyThemeToDom(next);
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

function getSnapshot(): ThemeMode {
  return currentTheme;
}

function getServerSnapshot(): ThemeMode {
  return 'system';
}

export function useTheme(): ThemeState {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const resolvedTheme = currentResolved;

  const setTheme = useCallback((nextTheme: ThemeMode) => {
    updateTheme(nextTheme);
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
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
  };
}
