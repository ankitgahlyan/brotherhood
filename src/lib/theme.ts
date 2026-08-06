import { Store } from '@tanstack/store';
import { useStore } from '@tanstack/react-store';

export type Theme = 'dark' | 'light';

export const THEME_STORAGE_KEY = 'jm-theme';

function readInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
  return saved === 'light' ? 'light' : 'dark';
}

function applyTheme(theme: Theme) {
  if (typeof window === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
}

export const themeStore = new Store<Theme>(readInitialTheme());

themeStore.subscribe((state) => {
  applyTheme(state);
});

export function useTheme(): Theme {
  return useStore(themeStore, (state) => state);
}

export function setTheme(theme: Theme) {
  themeStore.setState(() => theme);
}

export function toggleTheme() {
  themeStore.setState((prev) => (prev === 'dark' ? 'light' : 'dark'));
}
