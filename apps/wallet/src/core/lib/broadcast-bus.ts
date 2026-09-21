/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

export type BroadcastEventType =
  | 'contract_cache_invalidated'
  | 'contract_cache_updated'
  | 'settings_changed'
  | 'active_wallet_changed';

export interface BroadcastMessage<T = any> {
  type: BroadcastEventType;
  payload: T;
  timestamp: number;
  sourceTabId: string;
}

const CHANNEL_NAME = 'brotherhood_state_bus';
const TAB_ID =
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `tab_${Math.random().toString(36).slice(2)}_${Date.now()}`;

class BroadcastBus {
  private channel: BroadcastChannel | null = null;
  private listeners = new Map<
    BroadcastEventType,
    Set<(payload: any, message: BroadcastMessage) => void>
  >();

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(CHANNEL_NAME);
        this.channel.onmessage = (event: MessageEvent<BroadcastMessage>) => {
          this.handleMessage(event.data);
        };
      } catch (e) {
        console.warn(
          '[BroadcastBus] Failed to initialize BroadcastChannel:',
          e,
        );
      }
    }
  }

  public get tabId(): string {
    return TAB_ID;
  }

  public post<T = any>(type: BroadcastEventType, payload: T): void {
    const message: BroadcastMessage<T> = {
      type,
      payload,
      timestamp: Date.now(),
      sourceTabId: TAB_ID,
    };

    if (this.channel) {
      try {
        this.channel.postMessage(message);
      } catch (e) {
        console.warn('[BroadcastBus] Failed to postMessage:', e);
      }
    }
  }

  public subscribe<T = any>(
    type: BroadcastEventType,
    listener: (payload: T, message: BroadcastMessage<T>) => void,
  ): () => void {
    let set = this.listeners.get(type);
    if (!set) {
      set = new Set();
      this.listeners.set(type, set);
    }
    set.add(listener);

    return () => {
      set?.delete(listener);
      if (set?.size === 0) {
        this.listeners.delete(type);
      }
    };
  }

  private handleMessage(message: BroadcastMessage): void {
    if (!message || message.sourceTabId === TAB_ID) {
      return; // Ignore messages originating from this tab
    }

    const set = this.listeners.get(message.type);
    if (set) {
      for (const listener of set) {
        try {
          listener(message.payload, message);
        } catch (e) {
          console.error('[BroadcastBus] Error in broadcast listener:', e);
        }
      }
    }
  }
}

export const broadcastBus = new BroadcastBus();
