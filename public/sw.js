// Hand-authored offline-first service worker.
// vite-plugin-pwa does not emit its own sw.js in this TanStack Start/Cloudflare
// multi-environment build, so we own the worker. It precaches a tiny shell and
// stale-while-revalidates the hashed static assets emitted by the build.
const VERSION = 'v1';
const CACHE = `brotherhood-pwa-${VERSION}`;

// The URL prefix under which the app is served (matches Vite `base` / SW scope).
const basePath = (() => {
  const scope = globalThis.registration ? registration.scope : '/';
  return scope.endsWith('/') ? scope : `${scope}/`;
})();

const PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './favicon.svg',
];

function isApiRequest(url) {
  const path = url.pathname.replace(basePath, '/');
  return path.startsWith('/api/') || path.startsWith('/_server/');
}

// Cache-first with background refresh. Fast, and every GET that has been seen
// once becomes available offline.
async function staleWhileRevalidate(event) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(event.request, { ignoreSearch: true });

  const network = fetch(event.request)
    .then((response) => {
      if (response && response.ok) {
        cache.put(event.request, response.clone());
      }
      return response;
    })
    .catch(() => cached);

  return cached || network;
}

// App-shell-first for navigations: try network, then the cached index.html so
// deep links work offline.
async function navigationHandler(event) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(event.request);
    if (response && response.ok) {
      cache.put(event.request.url, response.clone());
    }
    return response;
  } catch {
    return (await cache.match('./index.html')) || (await cache.match('.'));
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll([...PRECACHE])),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)),
        ),
      ),
  );
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (isApiRequest(url)) {
    // Never intercept API routes; always hit the network/server.
    return;
  }
  if (request.mode === 'navigate') {
    event.respondWith(navigationHandler(event));
    return;
  }
  event.respondWith(staleWhileRevalidate(event));
});
