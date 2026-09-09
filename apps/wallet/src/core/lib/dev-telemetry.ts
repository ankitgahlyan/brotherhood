import { toast } from 'sonner';

export interface CallInvocation {
  id: string;
  timestamp: number;
  status: number | 'pending' | 'failed';
  statusText?: string;
  durationMs?: number;
  error?: string | null;
}

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
  responseSize?: number;
  error?: string | null;
  callerName?: string;
  callerCategory?: 'hook' | 'rpc' | 'system' | 'other';
  count: number;
  invocations: CallInvocation[];
  signature: string;
}

export function computeRequestSignature(
  method: string,
  url: string,
  requestBody?: string | null,
): string {
  let normalizedBody = '';
  if (requestBody) {
    try {
      const parsed = JSON.parse(requestBody);
      if (typeof parsed === 'object' && parsed !== null) {
        // Exclude ephemeral JSON-RPC 'id'
        const { id: _, ...rest } = parsed;
        normalizedBody = JSON.stringify(rest);
      } else {
        normalizedBody = String(requestBody);
      }
    } catch {
      normalizedBody = String(requestBody);
    }
  }
  return `${method.toUpperCase()}:${url.trim()}:${normalizedBody}`;
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

export interface ComponentStat {
  callerName: string;
  callerCategory: 'hook' | 'rpc' | 'system' | 'other';
  totalCalls: number;
  activeCalls: number;
  failedCalls: number;
  avgDurationMs: number;
  totalBytes: number;
  methods: Record<string, number>;
  lastCalledAt: number;
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

function parseCallerFromStack(
  stack?: string,
  url?: string,
  _method?: string,
  requestBody?: string | null,
): {
  callerName: string;
  callerCategory: 'hook' | 'rpc' | 'system' | 'other';
} {
  if (stack) {
    const lines = stack.split('\n');
    for (const line of lines) {
      if (
        line.includes('dev-telemetry') ||
        line.includes('window.fetch') ||
        line.includes('createTonClientAxiosAdapter') ||
        line.includes('rate-limiter') ||
        line.includes('rateLimitedFetch') ||
        line.includes('node_modules')
      ) {
        continue;
      }

      if (
        line.includes('testnetRpcManager') ||
        line.includes('probeEndpoint') ||
        line.includes('probeBestEndpoint')
      ) {
        return { callerName: 'testnetRpcManager (Probe)', callerCategory: 'rpc' };
      }

      const hookMatch = line.match(/\b(use[A-Z][a-zA-Z0-9]+)\b/);
      if (hookMatch) {
        return { callerName: hookMatch[1], callerCategory: 'hook' };
      }

      const funcMatch = line.match(
        /\b(fetch[A-Z][a-zA-Z0-9]+|get[A-Z][a-zA-Z0-9]+|check[A-Z][a-zA-Z0-9]+)\b/,
      );
      if (funcMatch) {
        return { callerName: funcMatch[1], callerCategory: 'rpc' };
      }

      const compMatch = line.match(
        /\b([A-Z][a-zA-Z0-9]+(?:Screen|Card|View|Modal|Button|Header|Item|Tab|Page|Drawer))\b/,
      );
      if (compMatch) {
        return { callerName: compMatch[1], callerCategory: 'system' };
      }
    }
  }

  if (requestBody) {
    try {
      const parsed = JSON.parse(requestBody);
      if (parsed?.method === 'getMasterchainInfo' && parsed?.id === 'probe') {
        return { callerName: 'testnetRpcManager (Probe)', callerCategory: 'rpc' };
      }
      if (parsed?.method) {
        return { callerName: `RPC: ${parsed.method}`, callerCategory: 'rpc' };
      }
    } catch {
      // ignore
    }
  }

  if (url) {
    if (url.includes('bridge/events') || url.includes('connect.ton.org')) {
      return { callerName: 'TonConnect Bridge', callerCategory: 'system' };
    }
    if (url.includes('/jetton/masters')) {
      return { callerName: 'useJettonMaster', callerCategory: 'hook' };
    }
    if (url.includes('/jetton/wallets')) {
      return { callerName: 'useWalletBalance', callerCategory: 'hook' };
    }
  }

  return { callerName: 'General / Background', callerCategory: 'other' };
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

  public getComponentStats(): ComponentStat[] {
    const statsMap = new Map<string, ComponentStat>();
    const apiCalls = this.buffer.filter(
      (b): b is ApiCallLog => b.type === 'api',
    );

    for (const call of apiCalls) {
      const name = call.callerName || 'General / Background';
      const category = call.callerCategory || 'other';

      let stat = statsMap.get(name);
      if (!stat) {
        stat = {
          callerName: name,
          callerCategory: category,
          totalCalls: 0,
          activeCalls: 0,
          failedCalls: 0,
          avgDurationMs: 0,
          totalBytes: 0,
          methods: {},
          lastCalledAt: call.timestamp,
        };
        statsMap.set(name, stat);
      }

      const callCount = call.count || 1;
      stat.totalCalls += callCount;
      if (call.status === 'pending') {
        stat.activeCalls++;
      }
      if (call.invocations && call.invocations.length > 0) {
        const failedInvocations = call.invocations.filter(
          (inv) =>
            inv.status === 'failed' ||
            (typeof inv.status === 'number' && inv.status >= 400),
        ).length;
        stat.failedCalls += failedInvocations;
      } else if (
        call.status === 'failed' ||
        (typeof call.status === 'number' && call.status >= 400)
      ) {
        stat.failedCalls++;
      }
      if (call.durationMs !== undefined) {
        stat.avgDurationMs = Math.round(
          (stat.avgDurationMs * (stat.totalCalls - callCount) +
            call.durationMs * callCount) /
            stat.totalCalls,
        );
      }
      if (call.responseSize) {
        stat.totalBytes += call.responseSize * callCount;
      }
      if (call.timestamp > stat.lastCalledAt) {
        stat.lastCalledAt = call.timestamp;
      }

      let methodName = call.method;
      if (call.requestBody) {
        try {
          const parsed = JSON.parse(call.requestBody);
          if (parsed && typeof parsed.method === 'string') {
            methodName = parsed.method;
          }
        } catch {
          // ignore
        }
      }
      stat.methods[methodName] = (stat.methods[methodName] || 0) + callCount;
    }

    return Array.from(statsMap.values()).sort(
      (a, b) => b.totalCalls - a.totalCalls,
    );
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

  private updateApiCall(
    callId: string,
    updates: Partial<ApiCallLog>,
    signature?: string,
  ): void {
    const item = this.buffer.find(
      (b): b is ApiCallLog =>
        b.type === 'api' &&
        (b.id === callId ||
          (signature !== undefined && b.signature === signature) ||
          b.invocations?.some((inv) => inv.id === callId)),
    );
    if (item) {
      Object.assign(item, updates);
      if (item.invocations) {
        const inv = item.invocations.find((i) => i.id === callId);
        if (inv) {
          if (updates.status !== undefined) inv.status = updates.status;
          if (updates.statusText !== undefined)
            inv.statusText = updates.statusText;
          if (updates.durationMs !== undefined)
            inv.durationMs = updates.durationMs;
          if (updates.error !== undefined) inv.error = updates.error;
        }
      }
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

      const stack = new Error().stack;
      const { callerName, callerCategory } = parseCallerFromStack(
        stack,
        url,
        method,
        requestBody,
      );

      const signature = computeRequestSignature(method, url, requestBody);
      const existing = this.buffer.find(
        (b): b is ApiCallLog => b.type === 'api' && b.signature === signature,
      );

      const invocation: CallInvocation = {
        id: callId,
        timestamp: Date.now(),
        status: 'pending',
      };

      this.metrics.totalApiCalls++;
      this.metrics.activeApiCalls++;

      if (existing) {
        existing.count++;
        existing.timestamp = Date.now();
        existing.status = 'pending';
        existing.statusText = undefined;
        existing.error = null;
        if (!existing.invocations) {
          existing.invocations = [];
        }
        existing.invocations.unshift(invocation);
        if (existing.invocations.length > 100) {
          existing.invocations.pop();
        }

        const idx = this.buffer.indexOf(existing);
        if (idx > 0) {
          this.buffer.splice(idx, 1);
          this.buffer.unshift(existing);
        }
        this.scheduleNotify();
      } else {
        this.addItem({
          type: 'api',
          id: callId,
          timestamp: Date.now(),
          method,
          url,
          status: 'pending',
          requestHeaders,
          requestBody,
          callerName,
          callerCategory,
          count: 1,
          invocations: [invocation],
          signature,
        });
      }

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

        this.updateApiCall(
          callId,
          {
            status: response.status,
            statusText: response.statusText,
            durationMs,
          },
          signature,
        );

        try {
          const clone = response.clone();
          clone
            .text()
            .then((text) => {
              const byteSize = text ? new Blob([text]).size : 0;
              this.updateApiCall(
                callId,
                {
                  responsePreview: text.slice(0, MAX_PREVIEW_LENGTH),
                  responseSize: byteSize,
                },
                signature,
              );
            })
            .catch(() => {
              this.updateApiCall(
                callId,
                {
                  responsePreview: '[Preview unavailable]',
                },
                signature,
              );
            });
        } catch {
          this.updateApiCall(
            callId,
            {
              responsePreview: '[Preview unavailable]',
            },
            signature,
          );
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

        this.updateApiCall(
          callId,
          {
            status: 'failed',
            statusText: 'Network / Fetch Error',
            durationMs,
            error: err instanceof Error ? err.message : String(err),
          },
          signature,
        );

        throw err;
      }
    };
  }
}

export const devTelemetry = new DevTelemetryManager();

export function initDevTelemetry(): void {
  devTelemetry.init();
}
