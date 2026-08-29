/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { create } from 'zustand';
import type { ResolvedTheme, ThemeMode, ThemeState } from './types';

export const THEME_STORAGE_KEY = 'brotherhood-theme';

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

const getInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'system';
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (
      stored === 'light' ||
      stored === 'dark' ||
      stored === 'oled' ||
      stored === 'system'
    ) {
      return stored;
    }
  } catch {
    // Ignore localStorage access errors
  }
  return 'system';
};

const initialTheme = getInitialTheme();
const initialResolved =
  typeof window !== 'undefined' ? applyThemeToDom(initialTheme) : 'light';

export const useTheme = create<ThemeState>((set, get) => ({
  theme: initialTheme,
  resolvedTheme: initialResolved,
  setTheme: (theme: ThemeMode) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore localStorage access errors
    }
    const resolved = applyThemeToDom(theme);
    set({ theme, resolvedTheme: resolved });
  },
  toggleTheme: () => {
    const current = get().resolvedTheme;
    const next: ThemeMode =
      current === 'light' ? 'dark' : current === 'dark' ? 'oled' : 'light';
    get().setTheme(next);
  },
}));

if (typeof window !== 'undefined') {
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  media.addEventListener('change', () => {
    const state = useTheme.getState();
    if (state.theme === 'system') {
      const resolved = applyThemeToDom('system');
      useTheme.setState({ resolvedTheme: resolved });
    }
  });
}
