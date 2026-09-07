/**
 * Testnet RPC Endpoint Manager with proactive probing & reactive failover.
 * Priority:
 * 1. Localhost (0ms local development node)
 * 2. Ngrok Tunnel (Permanent custom server URL)
 * 3. Public Toncenter (Official cloud fallback)
 */

export const PUBLIC_TESTNET_TONCENTER_RPC =
  'https://testnet.toncenter.com/api/v2/jsonRPC';
export const LOCAL_TESTNET_RPC = 'http://localhost:8081/api/v2/jsonRPC';
export const DEFAULT_NGROK_TESTNET_RPC =
  'https://noncohesively-unenervated-tereasa.ngrok-free.app/api/v2/jsonRPC';

export class TestnetRpcManager {
  private static instance: TestnetRpcManager;

  private candidateEndpoints: string[];
  private currentEndpointIndex = 0;
  private hasProbed = false;
  private probePromise: Promise<string> | null = null;

  private constructor() {
    const customConfigured =
      typeof import.meta !== 'undefined' && import.meta.env
        ? import.meta.env.VITE_CUSTOM_TON_TESTNET_RPC
        : undefined;

    const ngrokRpc = (
      customConfigured && customConfigured.trim()
        ? customConfigured.trim()
        : DEFAULT_NGROK_TESTNET_RPC
    ).replace(/\/+$/, '');

    // Normalize so it includes /api/v2/jsonRPC if only base domain was provided
    const normalizedNgrok = ngrokRpc.endsWith('/jsonRPC')
      ? ngrokRpc
      : `${ngrokRpc}/api/v2/jsonRPC`;

    this.candidateEndpoints = [
      LOCAL_TESTNET_RPC,
      normalizedNgrok,
      PUBLIC_TESTNET_TONCENTER_RPC,
    ];

    // Start background probe immediately on module import
    this.probeBestEndpoint().catch(() => {});
  }

  public static getInstance(): TestnetRpcManager {
    if (!TestnetRpcManager.instance) {
      TestnetRpcManager.instance = new TestnetRpcManager();
    }
    return TestnetRpcManager.instance;
  }

  public getCandidates(): string[] {
    return [...this.candidateEndpoints];
  }

  private customEndpointOverride: string | null = null;

  public setCustomEndpoint(url: string | null): void {
    this.customEndpointOverride = url;
  }

  public getActiveEndpoint(): string {
    if (this.customEndpointOverride) {
      return this.customEndpointOverride;
    }
    return this.candidateEndpoints[this.currentEndpointIndex]!;
  }

  public isCustomEndpoint(url: string = this.getActiveEndpoint()): boolean {
    return (
      url.includes('localhost') ||
      url.includes('127.0.0.1') ||
      url.includes('ngrok') ||
      url.includes('trycloudflare')
    );
  }

  /**
   * Probe a single endpoint with a lightweight getMasterchainInfo JSON-RPC request.
   */
  public async probeEndpoint(url: string, timeoutMs = 1500): Promise<boolean> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({
          id: 'probe',
          jsonrpc: '2.0',
          method: 'getMasterchainInfo',
          params: {},
        }),
        signal: controller.signal,
      });

      if (!res.ok) return false;
      const data = await res.json();
      return Boolean(data && data.ok);
    } catch {
      return false;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Probe candidate endpoints in priority order and select the fastest healthy one.
   */
  public async probeBestEndpoint(): Promise<string> {
    if (this.probePromise) return this.probePromise;

    this.probePromise = (async () => {
      for (let i = 0; i < this.candidateEndpoints.length; i++) {
        const endpoint = this.candidateEndpoints[i]!;

        // Fallback endpoint is assumed available if earlier ones fail
        if (i === this.candidateEndpoints.length - 1) {
          this.currentEndpointIndex = i;
          break;
        }

        const isHealthy = await this.probeEndpoint(endpoint);
        if (isHealthy) {
          this.currentEndpointIndex = i;
          console.info(
            `[TON Testnet RPC] Connected to active endpoint [${i + 1}/${this.candidateEndpoints.length}]: ${endpoint}`,
          );
          break;
        }
      }

      this.hasProbed = true;
      return this.getActiveEndpoint();
    })();

    return this.probePromise;
  }

  /**
   * Reactively failover when the currently active endpoint experiences an error.
   */
  public markEndpointFailed(failedUrl?: string): string {
    const active = this.getActiveEndpoint();
    if (
      !failedUrl ||
      failedUrl.includes(active) ||
      active.includes(failedUrl)
    ) {
      if (this.currentEndpointIndex < this.candidateEndpoints.length - 1) {
        this.currentEndpointIndex++;
        const nextEndpoint = this.getActiveEndpoint();
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
