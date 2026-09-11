/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { z } from 'zod';

export const SETTINGS_STORAGE_EVENT = 'brotherhood:settings-changed';

export const SettingsKeys = {
  THEME: 'brotherhood-theme',
  EXPLORER: 'brotherhood-explorer',
  DEVELOPER_MODE: 'brotherhood_developer_mode_enabled',
  TESTNET_TONCENTER_KEY: 'brotherhood_api_key_testnet_toncenter',
  TESTNET_TONCENTER_URL: 'brotherhood_api_url_testnet_toncenter',
  TESTNET_TONAPI_KEY: 'brotherhood_api_key_testnet_tonapi',
  TESTNET_TONAPI_URL: 'brotherhood_api_url_testnet_tonapi',
  TESTNET_PROVIDER: 'brotherhood_api_provider_testnet',
  TESTNET_RPC_ROUTING: 'brotherhood_rpc_routing_testnet',
  TESTNET_TONCENTER_CUSTOM_ACTIVE: 'brotherhood_custom_active_toncenter',
  TESTNET_TONAPI_CUSTOM_ACTIVE: 'brotherhood_custom_active_tonapi',
  TRACKED_PERSONAL_TOKENS_PREFIX: 'brotherhood_tracked_personal_tokens_',
  DISCOVERED_INITIAL_PREFIX: 'brotherhood_discovered_initial_',
} as const;

export const ThemeSchema = z.enum(['light', 'dark', 'oled', 'system']);
export type ThemeSetting = z.infer<typeof ThemeSchema>;

export const ExplorerSchema = z.enum(['tonscan', 'tonviewer', 'actonscan']);
export type ExplorerSetting = z.infer<typeof ExplorerSchema>;

export const ProviderSchema = z.enum(['toncenter', 'tonapi', 'orbs']);
export type ProviderSetting = z.infer<typeof ProviderSchema>;

export const RpcRoutingSchema = z.enum(['direct', 'orbs']);
export type RpcRoutingSetting = z.infer<typeof RpcRoutingSchema>;

export const BooleanStringSchema = z
  .union([z.boolean(), z.string()])
  .transform((val) => val === true || val === 'true');

export const StringArraySchema = z.array(z.string());

export class SettingsStorage {
  private listeners = new Set<(key: string) => void>();

  constructor() {
    if (
      typeof window !== 'undefined' &&
      typeof window.addEventListener === 'function'
    ) {
      window.addEventListener('storage', (e: StorageEvent) => {
        if (e.key) {
          this.emit(e.key);
        }
      });
    }
  }

  private getStorage(): Storage | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
    if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
      return (globalThis as any).localStorage;
    }
    return null;
  }

  public getRaw(key: string): string | null {
    const storage = this.getStorage();
    if (!storage) return null;
    try {
      return storage.getItem(key);
    } catch {
      return null;
    }
  }

  public get<T>(key: string, schema: z.ZodType<T>, defaultValue: T): T {
    const raw = this.getRaw(key);
    if (raw === null || raw === undefined) return defaultValue;

    // Try parsing as JSON first (for arrays/objects/booleans), fall back to raw string
    let parsedJson: unknown = raw;
    try {
      parsedJson = JSON.parse(raw);
    } catch {
      parsedJson = raw;
    }

    const result = schema.safeParse(parsedJson);
    if (result.success) {
      return result.data;
    }

    // Try raw string against schema directly if JSON parse produced something else
    const rawResult = schema.safeParse(raw);
    if (rawResult.success) {
      return rawResult.data;
    }

    return defaultValue;
  }

  public set(key: string, value: unknown): void {
    const storage = this.getStorage();
    if (!storage) return;
    try {
      if (value === null || value === undefined) {
        storage.removeItem(key);
      } else if (typeof value === 'string') {
        storage.setItem(key, value);
      } else {
        storage.setItem(key, JSON.stringify(value));
      }
    } catch {
      // Ignore storage quota/permission errors
    }
    this.emit(key);
  }

  public remove(key: string): void {
    const storage = this.getStorage();
    if (!storage) return;
    try {
      storage.removeItem(key);
    } catch {
      // Ignore storage errors
    }
    this.emit(key);
  }

  public subscribe(key: string, callback: () => void): () => void {
    const listener = (changedKey: string) => {
      if (changedKey === key || changedKey === '*') {
        callback();
      }
    };
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit(key: string): void {
    for (const listener of this.listeners) {
      try {
        listener(key);
      } catch {
        // Ignore subscriber errors
      }
    }
    if (
      typeof window !== 'undefined' &&
      typeof window.dispatchEvent === 'function' &&
      typeof CustomEvent !== 'undefined'
    ) {
      try {
        window.dispatchEvent(
          new CustomEvent(SETTINGS_STORAGE_EVENT, { detail: { key } }),
        );
      } catch {
        // Ignore dispatch errors
      }
    }
  }
}

export const settingsStorage = new SettingsStorage();
