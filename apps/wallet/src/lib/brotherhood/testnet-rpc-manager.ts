/**
 * Testnet RPC Endpoint Manager.
 * Default is official Toncenter Testnet RPC.
 * If user configures a custom RPC URL in Settings, it is prioritized with failover
 * to official Toncenter if unreachable.
 */

import {
  DEFAULT_TONCENTER_TESTNET_RPC,
  getCustomApiUrl,
  isCustomEndpointActive,
} from '@/core/lib/network-api-keys';

export const PUBLIC_TESTNET_TONCENTER_RPC = DEFAULT_TONCENTER_TESTNET_RPC;

export class TestnetRpcManager {
  private static instance: TestnetRpcManager;

  private currentEndpointIndex = 0;
  private explicitCustomEndpoint: string | null = null;

  private constructor() {}

  public static getInstance(): TestnetRpcManager {
    if (!TestnetRpcManager.instance) {
      TestnetRpcManager.instance = new TestnetRpcManager();
    }
    return TestnetRpcManager.instance;
  }

  public setCustomEndpoint(url: string | null): void {
    this.explicitCustomEndpoint = url;
    this.currentEndpointIndex = 0;
  }

  public getCandidates(): string[] {
    if (this.explicitCustomEndpoint && this.explicitCustomEndpoint.trim()) {
      return [this.explicitCustomEndpoint.trim(), PUBLIC_TESTNET_TONCENTER_RPC];
    }

    const isCustomActive = isCustomEndpointActive('toncenter');
    if (isCustomActive) {
      const customUrl = getCustomApiUrl('toncenter');
      const customConfigured =
        customUrl ||
        (typeof import.meta !== 'undefined' && import.meta.env
          ? import.meta.env.VITE_CUSTOM_TON_TESTNET_RPC
          : undefined);

      if (customConfigured && customConfigured.trim()) {
        const normalized = customConfigured.trim().replace(/\/+$/, '');
        const fullUrl = normalized.endsWith('/jsonRPC')
          ? normalized
          : `${normalized}/api/v2/jsonRPC`;
        return [fullUrl, PUBLIC_TESTNET_TONCENTER_RPC];
      }
    }

    return [PUBLIC_TESTNET_TONCENTER_RPC];
  }

  public getActiveEndpoint(): string {
    const candidates = this.getCandidates();
    if (this.currentEndpointIndex >= candidates.length) {
      this.currentEndpointIndex = 0;
    }
    return candidates[this.currentEndpointIndex]!;
  }

  public isCustomEndpoint(url: string = this.getActiveEndpoint()): boolean {
    return (
      !url.includes('testnet.toncenter.com') && !url.includes('toncenter.com')
    );
  }

  public resetToPrimary(): void {
    this.currentEndpointIndex = 0;
  }

  /**
   * Reactively failover when the currently active custom endpoint experiences an error.
   */
  public markEndpointFailed(failedUrl?: string): string {
    const candidates = this.getCandidates();
    const active = this.getActiveEndpoint();
    if (
      !failedUrl ||
      failedUrl.includes(active) ||
      active.includes(failedUrl)
    ) {
      if (this.currentEndpointIndex < candidates.length - 1) {
        this.currentEndpointIndex++;
        const nextEndpoint = candidates[this.currentEndpointIndex]!;
        console.warn(
          `[TON Testnet RPC] Primary endpoint failed (${active}). Failing over to: ${nextEndpoint}`,
        );
        return nextEndpoint;
      }
    }
    return active;
  }
}

export const testnetRpcManager = TestnetRpcManager.getInstance();
