// Hand-authored offline-first service worker.
// vite-plugin-pwa does not emit its own sw.js in this TanStack Start/Cloudflare
// multi-environment build, so we own the worker. It precaches a tiny shell and
// stale-while-revalidates the hashed static assets emitted by the build.
const VERSION = 'v1';
const CACHE = `brotherhood-pwa-${VERSION}`;
const IMAGE_CACHE = 'brotherhood-images';

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
  './ton.png',
  './fi.svg',
  './bro-domain-nft.svg',
];

function isApiRequest(url) {
  const path = url.pathname.replace(basePath, '/');
  return path.startsWith('/api/') || path.startsWith('/_server/');
}

function isImageRequest(request, url) {
  if (request.destination === 'image') return true;
  return /\.(?:png|jpe?g|gif|webp|svg|avif|ico)$/i.test(url.pathname);
}

// Cache-first for images (both same-origin and cross-origin token/NFT assets).
async function imageCacheFirst(event) {
  const cache = await caches.open(IMAGE_CACHE);
  const cached =
    (await cache.match(event.request, { ignoreVary: true })) ||
    (await cache.match(event.request.url, { ignoreVary: true }));
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(event.request);
    if (response && (response.ok || response.status === 0)) {
      cache.put(event.request, response.clone());
    }
    return response;
  } catch {
    return Response.error();
  }
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
          keys
            .filter((k) => k !== CACHE && k !== IMAGE_CACHE)
            .map((k) => caches.delete(k)),
        ),
      ),
  );
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (isImageRequest(request, url)) {
    event.respondWith(imageCacheFirst(event));
    return;
  }
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

self.addEventListener('message', (event) => {
  if (!event.data) return;
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches
        .keys()
        .then((keys) => Promise.all(keys.map((k) => caches.delete(k)))),
    );
  }
});
