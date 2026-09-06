import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'brotherhood_developer_mode_enabled';
const EVENT_NAME = 'brotherhood:devmode-change';

export function isDeveloperModeEnabled(): boolean {
  try {
    if (typeof localStorage === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setDeveloperModeEnabled(enabled: boolean): void {
  try {
    if (typeof localStorage !== 'undefined') {
      if (enabled) {
        localStorage.setItem(STORAGE_KEY, 'true');
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  } catch {
    // Ignore storage errors
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { enabled } }));
  }
}

export function useDeveloperMode(): [boolean, (enabled: boolean) => void] {
  const [enabled, setEnabledState] = useState<boolean>(() =>
    isDeveloperModeEnabled(),
  );

  useEffect(() => {
    const handleCustomChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ enabled: boolean }>;
      setEnabledState(customEvent.detail.enabled);
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setEnabledState(e.newValue === 'true');
      }
    };

    window.addEventListener(EVENT_NAME, handleCustomChange);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener(EVENT_NAME, handleCustomChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const toggle = useCallback((nextEnabled: boolean) => {
    setDeveloperModeEnabled(nextEnabled);
  }, []);

  return [enabled, toggle];
}
