import { toast } from 'sonner';

export interface ApiCallLog {
  type: 'api';
  id: string;
  timestamp: number;
  method: string;
  url: string;
  status: number | 'pending' | 'failed';
  statusText?: string;
  durationMs?: number;
  requestHeaders?: Record<string, string>;
  requestBody?: string | null;
  responsePreview?: string | null;
  error?: string | null;
}

export interface ConsoleLogEntry {
  type: 'console';
  id: string;
  timestamp: number;
  level: 'log' | 'info' | 'warn' | 'error' | 'debug';
  messages: string[];
}

export type TelemetryItem = ApiCallLog | ConsoleLogEntry;

export interface TelemetryMetrics {
  totalApiCalls: number;
  activeApiCalls: number;
  failedApiCalls: number;
  consoleErrors: number;
}

const MAX_BUFFER_SIZE = 1000;
const MAX_PREVIEW_LENGTH = 4000;

let last429ToastTime = 0;
const COOLDOWN_429_MS = 3000;

export function notifyRateLimit429(_url?: string): void {
  const now = Date.now();
  if (now - last429ToastTime < COOLDOWN_429_MS) {
    return;
  }
  last429ToastTime = now;

  toast.error('Too Many Requests (429)', {
    id: 'rate-limit-429',
    description: 'Rate limit reached. Requests are backing off.',
    position: 'top-center',
  });
}

class DevTelemetryManager {
  private buffer: TelemetryItem[] = [];
  private metrics: TelemetryMetrics = {
    totalApiCalls: 0,
    activeApiCalls: 0,
    failedApiCalls: 0,
    consoleErrors: 0,
  };
  private listeners = new Set<() => void>();
  private isInitialized = false;
  private notifyScheduled = false;

  private scheduleNotify() {
    if (this.notifyScheduled) return;
    this.notifyScheduled = true;
    queueMicrotask(() => {
      this.notifyScheduled = false;
      this.listeners.forEach((listener) => {
        try {
          listener();
        } catch {
          // Ignore listener errors
        }
      });
    });
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getItems(): TelemetryItem[] {
    return [...this.buffer];
  }

  public getMetrics(): TelemetryMetrics {
    return { ...this.metrics };
  }

  public clear(): void {
    this.buffer = [];
    this.metrics = {
      totalApiCalls: 0,
      activeApiCalls: 0,
      failedApiCalls: 0,
      consoleErrors: 0,
    };
    this.scheduleNotify();
  }

  private addItem(item: TelemetryItem): void {
    this.buffer.unshift(item);
    if (this.buffer.length > MAX_BUFFER_SIZE) {
      this.buffer.pop();
    }
    this.scheduleNotify();
  }

  private updateApiCall(id: string, updates: Partial<ApiCallLog>): void {
    const item = this.buffer.find((b) => b.id === id && b.type === 'api') as
      ApiCallLog | undefined;
    if (item) {
      Object.assign(item, updates);
      this.scheduleNotify();
    }
  }

  public init(): void {
    if (this.isInitialized || typeof window === 'undefined') {
      return;
    }
    this.isInitialized = true;
    this.interceptConsole();
    this.interceptFetch();
  }

  private interceptConsole(): void {
    const levels: Array<'log' | 'info' | 'warn' | 'error' | 'debug'> = [
      'log',
      'info',
      'warn',
      'error',
      'debug',
    ];

    levels.forEach((level) => {
      const original = console[level];
      console[level] = (...args: any[]) => {
        try {
          if (level === 'error') {
            this.metrics.consoleErrors++;
          }

          const stringified = args.map((arg) => {
            if (arg === null) return 'null';
            if (arg === undefined) return 'undefined';
            if (arg instanceof Error) {
              return `${arg.name}: ${arg.message}${arg.stack ? `\n${arg.stack}` : ''}`;
            }
            if (typeof arg === 'object') {
              try {
                return JSON.stringify(arg, null, 2);
              } catch {
                return Object.prototype.toString.call(arg);
              }
            }
            return String(arg);
          });

          this.addItem({
            type: 'console',
            id: `console_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            timestamp: Date.now(),
            level,
            messages: stringified,
          });
        } catch {
          // Do not fail if logging fails
        }
        original.apply(console, args);
      };
    });
  }

  private interceptFetch(): void {
    const originalFetch = window.fetch;

    window.fetch = async (
      input: RequestInfo | URL,
      init?: RequestInit,
    ): Promise<Response> => {
      const startTime = performance.now();
      const callId = `api_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      let url = '';
      let method = 'GET';

      if (typeof input === 'string') {
        url = input;
      } else if (input instanceof URL) {
        url = input.toString();
      } else if (input && typeof input === 'object' && 'url' in input) {
        url = input.url;
        method = input.method || 'GET';
      }

      if (init?.method) {
        method = init.method.toUpperCase();
      }

      let requestBody: string | null = null;
      if (init?.body) {
        if (typeof init.body === 'string') {
          requestBody = init.body.slice(0, MAX_PREVIEW_LENGTH);
        } else {
          try {
            requestBody = String(init.body).slice(0, MAX_PREVIEW_LENGTH);
          } catch {
            requestBody = '[Binary / FormData]';
          }
        }
      }

      let requestHeaders: Record<string, string> | undefined;
      if (init?.headers) {
        try {
          if (init.headers instanceof Headers) {
            requestHeaders = {};
            init.headers.forEach((value, key) => {
              requestHeaders![key] = value;
            });
          } else if (Array.isArray(init.headers)) {
            requestHeaders = Object.fromEntries(init.headers);
          } else if (typeof init.headers === 'object') {
            requestHeaders = { ...init.headers } as Record<string, string>;
          }
        } catch {
          // Ignore headers parsing errors
        }
      }

      this.metrics.totalApiCalls++;
      this.metrics.activeApiCalls++;

      this.addItem({
        type: 'api',
        id: callId,
        timestamp: Date.now(),
        method,
        url,
        status: 'pending',
        requestHeaders,
        requestBody,
      });

      try {
        const response = await originalFetch(input, init);
        const durationMs = Math.round(performance.now() - startTime);
        this.metrics.activeApiCalls = Math.max(
          0,
          this.metrics.activeApiCalls - 1,
        );

        if (!response.ok) {
          this.metrics.failedApiCalls++;
          if (response.status === 429) {
            notifyRateLimit429(url);
          }
        }

        this.updateApiCall(callId, {
          status: response.status,
          statusText: response.statusText,
          durationMs,
        });

        try {
          const clone = response.clone();
          clone
            .text()
            .then((text) => {
              this.updateApiCall(callId, {
                responsePreview: text.slice(0, MAX_PREVIEW_LENGTH),
              });
            })
            .catch(() => {
              this.updateApiCall(callId, {
                responsePreview: '[Preview unavailable]',
              });
            });
        } catch {
          this.updateApiCall(callId, {
            responsePreview: '[Preview unavailable]',
          });
        }

        return response;
      } catch (err: any) {
        const durationMs = Math.round(performance.now() - startTime);
        this.metrics.activeApiCalls = Math.max(
          0,
          this.metrics.activeApiCalls - 1,
        );
        this.metrics.failedApiCalls++;

        if (
          err?.status === 429 ||
          (err?.message && String(err.message).includes('429'))
        ) {
          notifyRateLimit429(url);
        }

        this.updateApiCall(callId, {
          status: 'failed',
          statusText: 'Network / Fetch Error',
          durationMs,
          error: err instanceof Error ? err.message : String(err),
        });

        throw err;
      }
    };
  }
}

export const devTelemetry = new DevTelemetryManager();

export function initDevTelemetry(): void {
  devTelemetry.init();
}
