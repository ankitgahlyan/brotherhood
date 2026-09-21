import { useCallback, useSyncExternalStore } from 'react';

let isSettingsOpenGlobal = false;
const subscribers = new Set<() => void>();

function notifyChange(): void {
  for (const sub of subscribers) {
    sub();
  }
}

export function isSettingsModalOpen(): boolean {
  return isSettingsOpenGlobal;
}

export function setSettingsModalOpen(open: boolean): void {
  isSettingsOpenGlobal = open;
  notifyChange();
}

function subscribe(callback: () => void): () => void {
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
}

function getSnapshot(): boolean {
  return isSettingsOpenGlobal;
}

function getServerSnapshot(): boolean {
  return false;
}

export function useSettingsModal(): [boolean, (open: boolean) => void] {
  const isOpen = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const toggle = useCallback((nextOpen: boolean) => {
    setSettingsModalOpen(nextOpen);
  }, []);

  return [isOpen, toggle];
}
