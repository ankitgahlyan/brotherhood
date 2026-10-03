/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

export type ThemeMode = 'system' | 'light' | 'warm' | 'dark' | 'oled';

export type ResolvedTheme = 'light' | 'warm' | 'dark' | 'oled';

export type ColorPalette = 'violet' | 'ton' | 'emerald' | 'sunset' | 'fuchsia';

export type SurfaceStyle = 'flat' | 'glass_css' | 'glass_hybrid' | 'glass_tilt';

export const MIN_TEXT_SCALE = 85;
export const MAX_TEXT_SCALE = 135;
export const DEFAULT_TEXT_SCALE = 100;
export const TEXT_SCALE_STEP = 5;

export interface ThemeState {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  palette: ColorPalette;
  surfaceStyle: SurfaceStyle;
  isGlass: boolean;
  textScale: number;
  setTheme: (theme: ThemeMode) => void;
  setPalette: (palette: ColorPalette) => void;
  setSurfaceStyle: (style: SurfaceStyle) => void;
  setTextScale: (scale: number) => void;
  stepTextScale: (delta: number) => void;
  resetTextScale: () => void;
  toggleTheme: () => void;
}
