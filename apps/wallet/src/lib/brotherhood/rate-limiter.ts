/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { notifyRateLimit429 } from '@/core/lib/dev-telemetry';
import { getCustomApiKey, type ApiKeyType } from '@/core/lib/network-api-keys';
import { testnetRpcManager } from './testnet-rpc-manager';

export interface RateLimiterOptions {
  apiKey?: string;
  maxRetries?: number;
  baseBackoffMs?: number;
  network?: 'mainnet' | 'testnet';
}

interface QueueItem<T> {
  task: () => Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: unknown) => void;
  hasApiKey: boolean;
}

/**
 * Detects whether an API key is present from explicit config, HTTP headers, URL params, or env vars.
 */
export function detectApiKey(
  url?: string,
  headers?: HeadersInit | Record<string, string>,
  explicitApiKey?: string,
  options?: { checkEnv?: boolean; provider?: ApiKeyType },
): boolean {
  if (explicitApiKey !== undefined) {
    return Boolean(explicitApiKey && explicitApiKey.trim());
  }

  // Check headers
  if (headers) {
    if (headers instanceof Headers) {
      if (
        headers.get('x-api-key') ||
        headers.get('X-API-Key') ||
        headers.get('api-key') ||
        headers.get('authorization') ||
        headers.get('Authorization')
      ) {
        return true;
      }
    } else if (Array.isArray(headers)) {
      for (const [k, v] of headers) {
        const lower = k.toLowerCase();
        if ((lower === 'x-api-key' || lower === 'authorization') && v)
          return true;
      }
    } else if (typeof headers === 'object') {
      for (const key of Object.keys(headers)) {
        const lower = key.toLowerCase();
        if (
          (lower === 'x-api-key' || lower === 'authorization') &&
          (headers as Record<string, string>)[key]
        ) {
          return true;
        }
      }
    }
  }

  // Check URL query parameters
  if (url) {
    try {
      const parsedUrl = new URL(url, 'http://localhost');
      if (parsedUrl.searchParams.get('api_key')) return true;
    } catch {
      /* ignore URL parse error */
    }
  }

  // Check custom key stored in localStorage for this provider
  if (options?.provider) {
    const custom = getCustomApiKey(options.provider);
    if (custom) return true;
  }

  // Check Vite environment variables if checkEnv is enabled (default true)
  if (options?.checkEnv !== false) {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      const mainnetKey =
        import.meta.env.VITE_TONCENTER_MAINNET_API_KEY ||
        import.meta.env.TONCENTER_MAINNET_API_KEY;
      const testnetKey =
        import.meta.env.VITE_TONCENTER_TESTNET_API_KEY ||
        import.meta.env.TONCENTER_TESTNET_API_KEY;
      if (
        (mainnetKey && String(mainnetKey).trim()) ||
        (testnetKey && String(testnetKey).trim())
      ) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Isolated FIFO Queue & Rate Limiter per provider:
 * - With API Key or custom endpoint: max 10 req/s (100ms interval spacing)
 * - Without API Key: max 1 req/s (1000ms interval spacing)
 * - Independent backoff and rate management per provider
 */
export class ProviderRateLimitQueue {
  private queue: QueueItem<unknown>[] = [];
  private isProcessing = false;
  private lastDispatchTime = 0;
  private backoffUntil = 0;
  private consecutive429s = 0;

  constructor(public readonly name: string) {}

  enqueue<T>(task: () => Promise<T>, hasApiKey: boolean): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({
        task: task as () => Promise<unknown>,
        resolve: resolve as (value: unknown) => void,
        reject,
        hasApiKey,
      });
      this.process();
    });
  }

  record429(baseBackoffMs = 1500) {
    this.consecutive429s += 1;
    const delay = Math.min(
      baseBackoffMs * Math.pow(1.5, this.consecutive429s - 1),
      6000,
    );
    this.backoffUntil = Date.now() + delay;
    console.warn(
      `[RateLimiter:${this.name}] Hit rate limit (429). Backing off queue for ${delay}ms (attempt #${this.consecutive429s})...`,
    );
    notifyRateLimit429();
  }

  reset() {
    this.backoffUntil = 0;
    this.consecutive429s = 0;
    this.lastDispatchTime = 0;
  }

  private async process() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift()!;
      // 10 req/sec = 100ms spacing; 1 req/sec = 1000ms spacing
      const minInterval = item.hasApiKey ? 100 : 1000;

      const now = Date.now();
      let waitMs = 0;

      // Handle 429 backoff cooldown
      if (this.backoffUntil > now) {
        waitMs = Math.max(waitMs, this.backoffUntil - now);
      }

      // Handle inter-request rate limit spacing
      const timeSinceLast = now - this.lastDispatchTime;
      if (timeSinceLast < minInterval) {
        waitMs = Math.max(waitMs, minInterval - timeSinceLast);
      }

      if (waitMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, waitMs));
      }

      this.lastDispatchTime = Date.now();

      try {
        const result = await item.task();
        this.consecutive429s = 0;
        item.resolve(result);
      } catch (err) {
        item.reject(err);
      }
    }

    this.isProcessing = false;
  }
}

const providerQueues = new Map<string, ProviderRateLimitQueue>();

export function getProviderQueue(providerName: string): ProviderRateLimitQueue {
  const key = providerName.toLowerCase();
  if (!providerQueues.has(key)) {
    providerQueues.set(key, new ProviderRateLimitQueue(key));
  }
  return providerQueues.get(key)!;
}

export function resetRateLimiterQueues(): void {
  for (const queue of providerQueues.values()) {
    queue.reset();
  }
}

// Backwards-compatibility alias
export const globalToncenterQueue = getProviderQueue('toncenter');
export { ProviderRateLimitQueue as ToncenterQueue };

/**
 * Drop-in wrapper around fetch() that queues requests through the appropriate
 * provider rate limiter queue and retries with exponential backoff on 429.
 */
export async function rateLimitedFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
  options?: RateLimiterOptions,
): Promise<Response> {
  const urlStr =
    typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.toString()
        : input.url;

  const providerType: ApiKeyType = urlStr.includes('tonapi')
    ? 'tonapi'
    : 'toncenter';
  const queue = getProviderQueue(providerType);

  const customKey = getCustomApiKey(providerType);
  const isCustomUrl = testnetRpcManager.isCustomEndpoint(urlStr);
  const hasKey =
    isCustomUrl ||
    detectApiKey(
      urlStr,
      init?.headers,
      options?.apiKey || customKey || undefined,
      {
        provider: providerType,
      },
    );

  const maxRetries = options?.maxRetries ?? 4;

  let attempt = 0;
  while (true) {
    try {
      const res = await queue.enqueue(async () => {
        return await fetch(input, init);
      }, hasKey);

      if (res.status === 429) {
        queue.record429(options?.baseBackoffMs ?? 1500);
        if (attempt < maxRetries) {
          attempt++;
          continue;
        }
      }

      return res;
    } catch (err) {
      if (attempt < maxRetries) {
        attempt++;
        await new Promise((r) => setTimeout(r, 1000 * attempt));
        continue;
      }
      throw err;
    }
  }
}

/**
 * Creates an Axios adapter for @ton/ton TonClient to channel all JSON-RPC calls
 * through the provider's rate limiter queue.
 */
export function createTonClientAxiosAdapter(options?: RateLimiterOptions) {
  return async function tonClientAdapter(config: {
    url?: string;
    baseURL?: string;
    method?: string;
    headers?:
      | Record<string, string>
      | {
          forEach?: (cb: (v: string, k: string) => void) => void;
          toJSON?: () => Record<string, string>;
        };
    data?: unknown;
  }): Promise<{
    data: unknown;
    status: number;
    statusText: string;
    headers: Record<string, string>;
    config: unknown;
    request: Record<string, unknown>;
  }> {
    const initialUrl = config.baseURL
      ? new URL(config.url || '', config.baseURL).toString()
      : config.url || '';

    const isTestnet =
      options?.network === 'testnet' ||
      initialUrl.includes('testnet.toncenter.com') ||
      testnetRpcManager.getCandidates().some((c) => initialUrl.includes(c));

    let activeUrl = isTestnet
      ? testnetRpcManager.getActiveEndpoint()
      : initialUrl;

    const providerType: ApiKeyType = activeUrl.includes('tonapi')
      ? 'tonapi'
      : 'toncenter';
    const queue = getProviderQueue(providerType);

    // Extract headers safely from Axios AxiosRequestHeaders / raw object
    const headers: Record<string, string> = {};
    if (config.headers) {
      if (
        typeof (
          config.headers as {
            forEach?: (cb: (v: string, k: string) => void) => void;
          }
        ).forEach === 'function'
      ) {
        (
          config.headers as {
            forEach: (cb: (v: string, k: string) => void) => void;
          }
        ).forEach((value: string, key: string) => {
          headers[key] = value;
        });
      } else if (
        typeof (config.headers as { toJSON?: () => Record<string, string> })
          .toJSON === 'function'
      ) {
        Object.assign(
          headers,
          (config.headers as { toJSON: () => Record<string, string> }).toJSON(),
        );
      } else {
        Object.assign(headers, config.headers);
      }
    }

    const customKey = getCustomApiKey(providerType);
    const isCustomUrl = testnetRpcManager.isCustomEndpoint(activeUrl);
    const hasKey =
      isCustomUrl ||
      detectApiKey(
        activeUrl,
        headers,
        options?.apiKey || customKey || undefined,
        {
          provider: providerType,
        },
      );

    const maxRetries = options?.maxRetries ?? 4;

    let attempt = 0;
    while (true) {
      try {
        if (isTestnet && isCustomUrl) {
          headers['ngrok-skip-browser-warning'] = 'true';
        }

        const response = await queue.enqueue(async () => {
          const body =
            typeof config.data === 'string'
              ? config.data
              : config.data
                ? JSON.stringify(config.data)
                : undefined;

          return await fetch(activeUrl, {
            method: (config.method || 'POST').toUpperCase(),
            headers,
            body,
          });
        }, hasKey);

        if (
          isTestnet &&
          testnetRpcManager.isCustomEndpoint(activeUrl) &&
          response.status >= 500
        ) {
          activeUrl = testnetRpcManager.markEndpointFailed(activeUrl);
          attempt++;
          continue;
        }

        if (response.status === 429) {
          queue.record429(options?.baseBackoffMs ?? 1500);
          if (attempt < maxRetries) {
            attempt++;
            continue;
          }
        }

        const responseText = await response.text();
        let responseData: unknown;
        try {
          responseData = JSON.parse(responseText);
        } catch {
          responseData = responseText;
        }

        const axiosResponse = {
          data: responseData,
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          config,
          request: {},
        };

        if (response.status >= 200 && response.status < 300) {
          return axiosResponse;
        } else {
          const error = new Error(
            `Request failed with status code ${response.status}`,
          ) as Error & {
            config: unknown;
            response: typeof axiosResponse;
            status: number;
          };
          error.config = config;
          error.response = axiosResponse;
          error.status = response.status;
          throw error;
        }
      } catch (err: unknown) {
        if (isTestnet && testnetRpcManager.isCustomEndpoint(activeUrl)) {
          activeUrl = testnetRpcManager.markEndpointFailed(activeUrl);
          attempt++;
          continue;
        }
        const errorObj = err as { response?: { status?: number } };
        if (errorObj?.response?.status === 429 && attempt < maxRetries) {
          attempt++;
          continue;
        }
        if (attempt < maxRetries && !errorObj?.response) {
          attempt++;
          await new Promise((r) => setTimeout(r, 1000 * attempt));
          continue;
        }
        throw err;
      }
    }
  };
}
