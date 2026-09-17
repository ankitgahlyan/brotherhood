/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

export type ThemeMode = 'system' | 'light' | 'dark' | 'oled';

export type ResolvedTheme = 'light' | 'dark' | 'oled';

export type ColorPalette = 'violet' | 'ton' | 'emerald' | 'sunset' | 'fuchsia';

export interface ThemeState {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  palette: ColorPalette;
  setTheme: (theme: ThemeMode) => void;
  setPalette: (palette: ColorPalette) => void;
  toggleTheme: () => void;
}
