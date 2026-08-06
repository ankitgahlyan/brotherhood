/**
 * Registers the service worker (public/sw.js) with the scope pinned to the
 * app's base path. Called from a client-only effect. Inline manifests/icons
 * are emitted into the build root, so the SW URL is resolved relative to the
 * configured base path.
 */
export function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }
  const base = (import.meta.env.VITE_BASE ?? '/brotherhood/').replace(
    /\/?$/,
    '/',
  );
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`${base}sw.js`, { scope: base })
      .catch((err) => {
        console.error('[PWA] Service worker registration failed', err);
      });
  });
}
