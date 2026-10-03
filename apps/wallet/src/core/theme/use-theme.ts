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
  SurfaceStyleSchema,
  TextScaleSchema,
} from '@/core/storage';
import {
  MIN_TEXT_SCALE,
  MAX_TEXT_SCALE,
  DEFAULT_TEXT_SCALE,
  type ColorPalette,
  type ResolvedTheme,
  type SurfaceStyle,
  type ThemeMode,
  type ThemeState,
} from './types';

export const THEME_STORAGE_KEY = SettingsKeys.THEME;
export const PALETTE_STORAGE_KEY = SettingsKeys.PALETTE;
export const SURFACE_STORAGE_KEY = SettingsKeys.SURFACE_STYLE;
export const TEXT_SCALE_STORAGE_KEY = SettingsKeys.TEXT_SCALE;

export const clampTextScale = (scale: number): number => {
  if (!Number.isFinite(scale)) return DEFAULT_TEXT_SCALE;
  const rounded = Math.round(scale / 5) * 5;
  return Math.max(MIN_TEXT_SCALE, Math.min(MAX_TEXT_SCALE, rounded));
};

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

export const applySurfaceStyleToDom = (surface: SurfaceStyle): SurfaceStyle => {
  if (typeof window === 'undefined') return 'glass_hybrid';
  const root = document.documentElement;
  root.setAttribute('data-surface', surface);
  root.setAttribute('data-glass', surface !== 'flat' ? 'true' : 'false');
  return surface;
};

export const applyTextScaleToDom = (scale: number): number => {
  const clamped = clampTextScale(scale);
  if (typeof window === 'undefined') return clamped;
  const root = document.documentElement;
  const factor = Number((clamped / 100).toFixed(2));
  root.style.setProperty('--font-scale', String(factor));
  root.style.fontSize = `${clamped}%`;
  root.setAttribute('data-text-scale', String(clamped));
  root.setAttribute('data-large-text', clamped >= 115 ? 'true' : 'false');
  return clamped;
};

export const applyThemeToDom = (theme: ThemeMode): ResolvedTheme => {
  if (typeof window === 'undefined') return 'light';

  const resolved: ResolvedTheme = theme === 'system' ? getSystemTheme() : theme;
  const root = document.documentElement;
  const isDarkTheme = resolved === 'dark' || resolved === 'oled';

  root.classList.toggle('dark', isDarkTheme);
  root.setAttribute('data-theme', resolved);

  const meta = document.querySelector('meta[name="color-scheme"]');
  if (meta) {
    meta.setAttribute('content', isDarkTheme ? 'dark' : 'light');
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

let currentSurfaceStyle: SurfaceStyle = settingsStorage.get(
  SURFACE_STORAGE_KEY,
  SurfaceStyleSchema,
  'glass_hybrid',
);
if (typeof window !== 'undefined') {
  applySurfaceStyleToDom(currentSurfaceStyle);
}

let currentTextScale: number = settingsStorage.get(
  TEXT_SCALE_STORAGE_KEY,
  TextScaleSchema,
  DEFAULT_TEXT_SCALE,
);
if (typeof window !== 'undefined') {
  currentTextScale = applyTextScaleToDom(currentTextScale);
}

interface ThemeSnapshot {
  theme: ThemeMode;
  palette: ColorPalette;
  surfaceStyle: SurfaceStyle;
  textScale: number;
}

function buildSnapshot(): ThemeSnapshot {
  return {
    theme: currentTheme,
    palette: currentPalette,
    surfaceStyle: currentSurfaceStyle,
    textScale: currentTextScale,
  };
}

let currentSnapshot: ThemeSnapshot = buildSnapshot();

const SERVER_SNAPSHOT: ThemeSnapshot = {
  theme: 'system',
  palette: 'violet',
  surfaceStyle: 'glass_hybrid',
  textScale: DEFAULT_TEXT_SCALE,
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
  currentSnapshot = buildSnapshot();
  settingsStorage.set(THEME_STORAGE_KEY, theme);
  notifyThemeChange();
}

function updatePalette(palette: ColorPalette): void {
  currentPalette = palette;
  applyPaletteToDom(palette);
  currentSnapshot = buildSnapshot();
  settingsStorage.set(PALETTE_STORAGE_KEY, palette);
  notifyThemeChange();
}

function updateSurfaceStyle(surfaceStyle: SurfaceStyle): void {
  currentSurfaceStyle = surfaceStyle;
  applySurfaceStyleToDom(surfaceStyle);
  currentSnapshot = buildSnapshot();
  settingsStorage.set(SURFACE_STORAGE_KEY, surfaceStyle);
  notifyThemeChange();
}

function updateTextScale(scale: number): void {
  const clamped = applyTextScaleToDom(scale);
  currentTextScale = clamped;
  currentSnapshot = buildSnapshot();
  settingsStorage.set(TEXT_SCALE_STORAGE_KEY, clamped);
  notifyThemeChange();
}

// Subscribe to storage changes (e.g. cross-tab)
settingsStorage.subscribe(THEME_STORAGE_KEY, () => {
  const next = settingsStorage.get(THEME_STORAGE_KEY, ThemeSchema, 'system');
  if (next !== currentTheme) {
    currentTheme = next;
    currentResolved = applyThemeToDom(next);
    currentSnapshot = buildSnapshot();
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
    currentSnapshot = buildSnapshot();
    notifyThemeChange();
  }
});

settingsStorage.subscribe(SURFACE_STORAGE_KEY, () => {
  const next = settingsStorage.get(
    SURFACE_STORAGE_KEY,
    SurfaceStyleSchema,
    'glass_hybrid',
  );
  if (next !== currentSurfaceStyle) {
    currentSurfaceStyle = next;
    applySurfaceStyleToDom(next);
    currentSnapshot = buildSnapshot();
    notifyThemeChange();
  }
});

settingsStorage.subscribe(TEXT_SCALE_STORAGE_KEY, () => {
  const next = settingsStorage.get(
    TEXT_SCALE_STORAGE_KEY,
    TextScaleSchema,
    DEFAULT_TEXT_SCALE,
  );
  if (next !== currentTextScale) {
    currentTextScale = applyTextScaleToDom(next);
    currentSnapshot = buildSnapshot();
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

  const setSurfaceStyle = useCallback((nextStyle: SurfaceStyle) => {
    updateSurfaceStyle(nextStyle);
  }, []);

  const setTextScale = useCallback((nextScale: number) => {
    updateTextScale(nextScale);
  }, []);

  const stepTextScale = useCallback((delta: number) => {
    updateTextScale(currentTextScale + delta);
  }, []);

  const resetTextScale = useCallback(() => {
    updateTextScale(DEFAULT_TEXT_SCALE);
  }, []);

  const toggleTheme = useCallback(() => {
    const next: ThemeMode =
      currentResolved === 'light'
        ? 'warm'
        : currentResolved === 'warm'
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
    surfaceStyle: state.surfaceStyle,
    isGlass: state.surfaceStyle !== 'flat',
    textScale: state.textScale,
    setTheme,
    setPalette,
    setSurfaceStyle,
    setTextScale,
    stepTextScale,
    resetTextScale,
    toggleTheme,
  };
}
