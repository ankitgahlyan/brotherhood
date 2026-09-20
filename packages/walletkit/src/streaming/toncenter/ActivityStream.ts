/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { Event } from '../../types/toncenter/AccountEvent';
import type { ApiClient } from '../../api/interfaces/ApiClient';

export type ActivityUpdateCallback = (
  newFinalizedEvents: Event[],
  allPendingEvents: Event[],
) => void;

export interface ActivityStreamConfig {
  address: string;
  apiClient: ApiClient;
  minPollDelayMs?: number;
}

/**
 * Streams confirmed and pending activities for a TON wallet with generational
 * gap recovery and action stashing across WebSocket reconnects.
 */
export class ActivityStream {
  private address: string;
  private apiClient: ApiClient;
  private minPollDelayMs: number;

  private restoreGeneration = 0;
  private isDestroyed = false;
  private needsRestoreHistory = false;
  private socketStash: Event[] = [];
  private pendingEvents: Event[] = [];

  private listeners = new Set<ActivityUpdateCallback>();
  private pollTimer: ReturnType<typeof setTimeout> | null = null;
  private isPolling = false;

  constructor(config: ActivityStreamConfig) {
    this.address = config.address;
    this.apiClient = config.apiClient;
    this.minPollDelayMs = config.minPollDelayMs ?? 4000;
  }

  public subscribe(callback: ActivityUpdateCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  public onSocketConnect(): void {
    if (this.isDestroyed) return;
    this.needsRestoreHistory = true;
    this.restoreGeneration++;
    this.triggerPoll(0);
  }

  public onSocketDisconnect(): void {
    if (this.isDestroyed) return;
    this.needsRestoreHistory = false;
    this.triggerPoll(this.minPollDelayMs);
  }

  public onSocketEvents(incomingEvents: Event[]): void {
    if (this.isDestroyed || incomingEvents.length === 0) return;

    const pending = incomingEvents.filter((e) => e.inProgress);
    const finalized = incomingEvents.filter((e) => !e.inProgress);

    if (this.needsRestoreHistory) {
      // Stash finalized events until catch-up poll bridges the disconnect gap
      this.socketStash.unshift(...finalized);
      this.notify(finalized, pending);
    } else {
      this.notify(finalized, pending);
    }
  }

  public triggerPoll(delayMs = 0): void {
    if (this.isDestroyed) return;
    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
    }
    this.pollTimer = setTimeout(() => {
      void this.executePoll();
    }, delayMs);
  }

  private async executePoll(): Promise<void> {
    if (this.isDestroyed || this.isPolling) return;
    this.isPolling = true;
    const currentGeneration = this.restoreGeneration;

    try {
      const response = await this.apiClient.getEvents({
        account: this.address,
        limit: 30,
        offset: 0,
      });

      if (this.isDestroyed || currentGeneration !== this.restoreGeneration) {
        return;
      }

      const fetchedEvents = response.events || [];
      const stashed = this.socketStash.splice(0);

      // Merge fetched events and stashed socket items without duplicates
      const seenIds = new Set<string>();
      const mergedFinalized: Event[] = [];

      for (const ev of [...stashed, ...fetchedEvents]) {
        const id = String(ev.eventId);
        if (!seenIds.has(id)) {
          seenIds.add(id);
          mergedFinalized.push(ev);
        }
      }

      mergedFinalized.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

      this.needsRestoreHistory = false;
      this.notify(mergedFinalized, this.pendingEvents);
    } catch {
      // Suppress transient poll failures; next cycle or socket message will retry
    } finally {
      this.isPolling = false;
    }
  }

  private notify(newFinalized: Event[], pending: Event[]): void {
    this.pendingEvents = pending;
    for (const listener of this.listeners) {
      try {
        listener(newFinalized, pending);
      } catch {
        // Suppress callback errors
      }
    }
  }

  public destroy(): void {
    this.isDestroyed = true;
    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
      this.pollTimer = null;
    }
    this.listeners.clear();
    this.socketStash = [];
    this.pendingEvents = [];
  }
}
