import {
  settingsStorage,
  SettingsKeys,
  ProviderSchema,
  RpcRoutingSchema,
  BooleanStringSchema,
} from '@/core/storage';

export const STORAGE_KEY_TESTNET_TONCENTER_KEY =
  SettingsKeys.TESTNET_TONCENTER_KEY;
export const STORAGE_KEY_TESTNET_TONCENTER_URL =
  SettingsKeys.TESTNET_TONCENTER_URL;
export const STORAGE_KEY_TESTNET_TONAPI_KEY = SettingsKeys.TESTNET_TONAPI_KEY;
export const STORAGE_KEY_TESTNET_TONAPI_URL = SettingsKeys.TESTNET_TONAPI_URL;
export const STORAGE_KEY_TESTNET_PROVIDER = SettingsKeys.TESTNET_PROVIDER;
export const STORAGE_KEY_TESTNET_RPC_ROUTING = SettingsKeys.TESTNET_RPC_ROUTING;
export const STORAGE_KEY_TESTNET_TONCENTER_CUSTOM_ACTIVE =
  SettingsKeys.TESTNET_TONCENTER_CUSTOM_ACTIVE;
export const STORAGE_KEY_TESTNET_TONAPI_CUSTOM_ACTIVE =
  SettingsKeys.TESTNET_TONAPI_CUSTOM_ACTIVE;

export const API_KEYS_UPDATED_EVENT = 'brotherhood:api-keys-updated';

export type ApiKeyType = 'toncenter' | 'tonapi';
export type TestnetProvider = 'toncenter' | 'tonapi' | 'orbs';
export type RpcRoutingMode = 'direct' | 'orbs';

export const DEFAULT_TONCENTER_TESTNET_BASE = 'https://testnet.toncenter.com';
export const DEFAULT_TONCENTER_TESTNET_RPC =
  'https://testnet.toncenter.com/api/v2/jsonRPC';
export const DEFAULT_TONAPI_TESTNET_BASE = 'https://testnet.tonapi.io';

export type PingResult = {
  ok: boolean;
  latencyMs?: number;
  statusText?: string;
  error?: string;
  isRateLimited?: boolean;
  isAuthError?: boolean;
};

let cachedOrbsEndpoint: string | null = null;
let orbsEndpointPromise: Promise<string> | null = null;

export async function getOrbsHttpEndpoint(
  network: 'testnet' | 'mainnet' = 'testnet',
): Promise<string> {
  if (cachedOrbsEndpoint) return cachedOrbsEndpoint;
  if (!orbsEndpointPromise) {
    orbsEndpointPromise = (async () => {
      try {
        const { getHttpEndpoint } = await import('@orbs-network/ton-access');
        const endpoint = await getHttpEndpoint({ network });
        cachedOrbsEndpoint = endpoint;
        return endpoint;
      } catch (err) {
        console.warn(
          '[Orbs] Failed to fetch decentralized RPC endpoint, falling back to public toncenter:',
          err,
        );
        return network === 'mainnet'
          ? 'https://toncenter.com/api/v2/jsonRPC'
          : DEFAULT_TONCENTER_TESTNET_RPC;
      } finally {
        orbsEndpointPromise = null;
      }
    })();
  }
  return orbsEndpointPromise;
}

export function getCustomApiKey(
  type: ApiKeyType,
  _network: 'testnet' = 'testnet',
): string | null {
  const key =
    type === 'toncenter'
      ? STORAGE_KEY_TESTNET_TONCENTER_KEY
      : STORAGE_KEY_TESTNET_TONAPI_KEY;
  const val = settingsStorage.getRaw(key);
  return val && val.trim() ? val.trim() : null;
}

export function setCustomApiKey(
  type: ApiKeyType,
  _network: 'testnet' = 'testnet',
  val: string | null,
): void {
  const key =
    type === 'toncenter'
      ? STORAGE_KEY_TESTNET_TONCENTER_KEY
      : STORAGE_KEY_TESTNET_TONAPI_KEY;

  if (val && val.trim()) {
    settingsStorage.set(key, val.trim());
  } else {
    settingsStorage.remove(key);
  }

  notifyApiKeysUpdated();
}

export function getCustomApiUrl(
  type: ApiKeyType,
  _network: 'testnet' = 'testnet',
): string | null {
  const key =
    type === 'toncenter'
      ? STORAGE_KEY_TESTNET_TONCENTER_URL
      : STORAGE_KEY_TESTNET_TONAPI_URL;
  const val = settingsStorage.getRaw(key);
  return val && val.trim() ? val.trim().replace(/\/+$/, '') : null;
}

export function setCustomApiUrl(
  type: ApiKeyType,
  _network: 'testnet' = 'testnet',
  val: string | null,
): void {
  const key =
    type === 'toncenter'
      ? STORAGE_KEY_TESTNET_TONCENTER_URL
      : STORAGE_KEY_TESTNET_TONAPI_URL;

  if (val && val.trim()) {
    settingsStorage.set(key, val.trim().replace(/\/+$/, ''));
  } else {
    settingsStorage.remove(key);
  }

  notifyApiKeysUpdated();
}

export function getTestnetRpcRouting(): RpcRoutingMode {
  return settingsStorage.get(
    STORAGE_KEY_TESTNET_RPC_ROUTING,
    RpcRoutingSchema,
    'direct',
  );
}

export function setTestnetRpcRouting(mode: RpcRoutingMode): void {
  settingsStorage.set(STORAGE_KEY_TESTNET_RPC_ROUTING, mode);
  notifyApiKeysUpdated();
}

export function isCustomEndpointActive(type: ApiKeyType): boolean {
  const key =
    type === 'toncenter'
      ? STORAGE_KEY_TESTNET_TONCENTER_CUSTOM_ACTIVE
      : STORAGE_KEY_TESTNET_TONAPI_CUSTOM_ACTIVE;
  return settingsStorage.get(key, BooleanStringSchema, false);
}

export function setCustomEndpointActive(
  type: ApiKeyType,
  active: boolean,
): void {
  const key =
    type === 'toncenter'
      ? STORAGE_KEY_TESTNET_TONCENTER_CUSTOM_ACTIVE
      : STORAGE_KEY_TESTNET_TONAPI_CUSTOM_ACTIVE;
  if (active) {
    settingsStorage.set(key, 'true');
  } else {
    settingsStorage.remove(key);
  }
  notifyApiKeysUpdated();
}

export function getActiveToncenterEndpoint(): string {
  if (getTestnetRpcRouting() === 'orbs') {
    if (cachedOrbsEndpoint) return cachedOrbsEndpoint;
  }

  if (isCustomEndpointActive('toncenter')) {
    const custom = getCustomApiUrl('toncenter');
    if (custom) {
      if (custom.endsWith('/jsonRPC')) return custom;
      return `${custom}/api/v2/jsonRPC`;
    }
  }
  return DEFAULT_TONCENTER_TESTNET_RPC;
}

export function getActiveTonapiEndpoint(): string {
  if (isCustomEndpointActive('tonapi')) {
    const custom = getCustomApiUrl('tonapi');
    if (custom) {
      return custom;
    }
  }
  return DEFAULT_TONAPI_TESTNET_BASE;
}

export function getTestnetApiProvider(): TestnetProvider {
  const routing = getTestnetRpcRouting();
  if (routing === 'orbs') return 'orbs';
  return settingsStorage.get(
    STORAGE_KEY_TESTNET_PROVIDER,
    ProviderSchema,
    'toncenter',
  );
}

export function setTestnetApiProvider(provider: TestnetProvider): void {
  if (provider === 'orbs') {
    setTestnetRpcRouting('orbs');
  } else {
    setTestnetRpcRouting('direct');
    settingsStorage.set(STORAGE_KEY_TESTNET_PROVIDER, provider);
  }
  notifyApiKeysUpdated();
}

export async function testToncenterConnection(
  rawUrl?: string,
  apiKey?: string,
): Promise<PingResult> {
  const base = (
    rawUrl && rawUrl.trim() ? rawUrl.trim() : DEFAULT_TONCENTER_TESTNET_BASE
  ).replace(/\/+$/, '');
  const url = base.endsWith('/jsonRPC') ? base : `${base}/api/v2/jsonRPC`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    // 'ngrok-skip-browser-warning': 'true',
  };
  if (apiKey && apiKey.trim()) {
    headers['X-API-Key'] = apiKey.trim();
  }

  const start = performance.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        id: 'ping',
        jsonrpc: '2.0',
        method: 'getMasterchainInfo',
        params: {},
      }),
      signal: controller.signal,
    });

    const latencyMs = Math.round(performance.now() - start);

    if (res.status === 401 || res.status === 403) {
      return {
        ok: false,
        latencyMs,
        isAuthError: true,
        statusText: 'Invalid or Unauthorized API Key',
        error: `HTTP ${res.status}: Auth failed`,
      };
    }

    if (res.status === 429) {
      return {
        ok: false,
        latencyMs,
        isRateLimited: true,
        statusText: 'Rate limit exceeded (429)',
        error: 'HTTP 429: Too Many Requests',
      };
    }

    if (!res.ok) {
      return {
        ok: false,
        latencyMs,
        statusText: `HTTP error ${res.status}`,
        error: `Server returned status ${res.status}`,
      };
    }

    const data = await res.json();
    if (data && data.ok) {
      return {
        ok: true,
        latencyMs,
        statusText: 'Connected (Testnet)',
      };
    }

    return {
      ok: false,
      latencyMs,
      statusText: 'Invalid response from RPC node',
      error: data?.error || 'Unknown RPC error',
    };
  } catch (err: unknown) {
    const isAbort = (err as Error)?.name === 'AbortError';
    return {
      ok: false,
      statusText: isAbort ? 'Connection timed out (>4s)' : 'Connection failed',
      error: isAbort
        ? 'Request timed out'
        : (err as Error)?.message || 'Network error',
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function testTonapiConnection(
  rawUrl?: string,
  apiKey?: string,
): Promise<PingResult> {
  const base = (
    rawUrl && rawUrl.trim() ? rawUrl.trim() : DEFAULT_TONAPI_TESTNET_BASE
  ).replace(/\/+$/, '');
  const url = `${base}/v2/blockchain/masterchain-head`;

  const headers: Record<string, string> = {
    // 'ngrok-skip-browser-warning': 'true',
  };
  if (apiKey && apiKey.trim()) {
    headers['Authorization'] = `Bearer ${apiKey.trim()}`;
  }

  const start = performance.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers,
      signal: controller.signal,
    });

    const latencyMs = Math.round(performance.now() - start);

    if (res.status === 401 || res.status === 403) {
      return {
        ok: false,
        latencyMs,
        isAuthError: true,
        statusText: 'Invalid or Unauthorized API Key',
        error: `HTTP ${res.status}: Auth failed`,
      };
    }

    if (res.status === 429) {
      return {
        ok: false,
        latencyMs,
        isRateLimited: true,
        statusText: 'Rate limit exceeded (429)',
        error: 'HTTP 429: Too Many Requests',
      };
    }

    if (!res.ok) {
      return {
        ok: false,
        latencyMs,
        statusText: `HTTP error ${res.status}`,
        error: `Server returned status ${res.status}`,
      };
    }

    const data = await res.json();
    if (data && (data.seqno !== undefined || data.last_seqno !== undefined)) {
      return {
        ok: true,
        latencyMs,
        statusText: 'Connected (TonAPI Testnet)',
      };
    }

    return {
      ok: false,
      latencyMs,
      statusText: 'Invalid response from TonAPI node',
      error: 'Unexpected JSON schema',
    };
  } catch (err: unknown) {
    const isAbort = (err as Error)?.name === 'AbortError';
    return {
      ok: false,
      statusText: isAbort ? 'Connection timed out (>4s)' : 'Connection failed',
      error: isAbort
        ? 'Request timed out'
        : (err as Error)?.message || 'Network error',
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

export function notifyApiKeysUpdated(): void {
  if (
    typeof window !== 'undefined' &&
    typeof window.dispatchEvent === 'function' &&
    typeof CustomEvent === 'function'
  ) {
    window.dispatchEvent(new CustomEvent(API_KEYS_UPDATED_EVENT));
  }
}
