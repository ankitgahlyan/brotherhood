import { useCallback, useSyncExternalStore } from 'react';
import {
  settingsStorage,
  SettingsKeys,
  BooleanStringSchema,
} from '@/core/storage';

const STORAGE_KEY = SettingsKeys.DEVELOPER_MODE;

export function isDeveloperModeEnabled(): boolean {
  return settingsStorage.get(STORAGE_KEY, BooleanStringSchema, false);
}

export function setDeveloperModeEnabled(enabled: boolean): void {
  if (enabled) {
    settingsStorage.set(STORAGE_KEY, 'true');
  } else {
    settingsStorage.remove(STORAGE_KEY);
  }
}

function subscribeDevMode(callback: () => void): () => void {
  return settingsStorage.subscribe(STORAGE_KEY, callback);
}

function getDevModeSnapshot(): boolean {
  return isDeveloperModeEnabled();
}

function getDevModeServerSnapshot(): boolean {
  return false;
}

export function useDeveloperMode(): [boolean, (enabled: boolean) => void] {
  const enabled = useSyncExternalStore(
    subscribeDevMode,
    getDevModeSnapshot,
    getDevModeServerSnapshot,
  );

  const toggle = useCallback((nextEnabled: boolean) => {
    setDeveloperModeEnabled(nextEnabled);
  }, []);

  return [enabled, toggle];
}

let isModalOpenGlobal = false;
const modalSubscribers = new Set<() => void>();

function notifyModalChange(): void {
  for (const sub of modalSubscribers) {
    sub();
  }
}

export function isDeveloperModalOpen(): boolean {
  return isModalOpenGlobal;
}

export function setDeveloperModalOpen(open: boolean): void {
  isModalOpenGlobal = open;
  notifyModalChange();
}

function subscribeModal(callback: () => void): () => void {
  modalSubscribers.add(callback);
  return () => {
    modalSubscribers.delete(callback);
  };
}

function getModalSnapshot(): boolean {
  return isModalOpenGlobal;
}

function getModalServerSnapshot(): boolean {
  return false;
}

export function useDeveloperModal(): [boolean, (open: boolean) => void] {
  const isOpen = useSyncExternalStore(
    subscribeModal,
    getModalSnapshot,
    getModalServerSnapshot,
  );

  const toggle = useCallback((nextOpen: boolean) => {
    setDeveloperModalOpen(nextOpen);
  }, []);

  return [isOpen, toggle];
}
