// Cloudflare Pages Functions - Middleware Route Interceptor
// Intercepts requests to /api-backend/*, /toncenter-proxy/*, and /tonapiio-proxy/*
// Rewrites the Origin header to https://mytonwallet.app before forwarding upstream.

const TARGETS: Record<string, string> = {
  'api-backend': 'https://api.mywallet.io',
  'toncenter-proxy': 'https://toncenter.mytonwallet.org',
  'tonapiio-proxy': 'https://tonapiio.mytonwallet.org',
  'toncenter-testnet-proxy': 'https://testnet.toncenter.com',
  'tonapiio-testnet-proxy': 'https://testnet.tonapi.io',
};

const SPOOFED_ORIGIN = 'https://mytonwallet.app';

interface Env {
  [key: string]: any;
}

interface EventContext {
  request: Request;
  env: Env;
  params: Record<string, string | string[]>;
  next: () => Promise<Response>;
}

export async function onRequest(context: EventContext): Promise<Response> {
  const url = new URL(context.request.url);
  const segments = url.pathname.split('/').filter(Boolean);
  const prefix = segments[0];

  if (prefix && TARGETS[prefix]) {
    const upstreamBase = TARGETS[prefix];
    const subPath = '/' + segments.slice(1).join('/');
    const targetUrl = new URL(subPath + url.search, upstreamBase);

    const headers = new Headers(context.request.headers);
    headers.set('Origin', SPOOFED_ORIGIN);
    headers.set('Referer', `${SPOOFED_ORIGIN}/`);
    headers.set('Host', new URL(upstreamBase).host);

    const init: RequestInit = {
      method: context.request.method,
      headers,
      redirect: 'follow',
    };

    if (context.request.method !== 'GET' && context.request.method !== 'HEAD') {
      init.body = context.request.body;
      (init as any).duplex = 'half';
    }

    try {
      const response = await fetch(targetUrl.toString(), init);
      const responseHeaders = new Headers(response.headers);

      responseHeaders.set('Access-Control-Allow-Origin', url.origin);
      responseHeaders.set('Access-Control-Allow-Credentials', 'true');
      responseHeaders.set('Access-Control-Allow-Methods', 'GET, HEAD, POST, PUT, DELETE, OPTIONS');
      responseHeaders.set('Access-Control-Allow-Headers', '*');

      if (context.request.method === 'OPTIONS') {
        return new Response(null, {
          status: 204,
          headers: responseHeaders,
        });
      }

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message || 'Proxy upstream failed' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  return context.next();
}
