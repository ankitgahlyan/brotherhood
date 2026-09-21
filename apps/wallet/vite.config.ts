import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import type { ManifestOptions } from 'vite-plugin-pwa';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

// Determine build target: TWA (Telegram Mini App) vs Web (standalone PWA)
const isTwa =
  process.env.IS_TELEGRAM_APP === '1' || process.env.VITE_APP_TARGET === 'twa';

// TWA default base: /brotherhood/  |  Web default base: /brotherhood/web/
const defaultBase = isTwa ? '/brotherhood/' : '/brotherhood/web/';
const base = (process.env.VITE_BASE ?? defaultBase).replace(/\/?$/, '/');

// Output directory: dist (web) or dist-twa (twa) — within apps/wallet/
const outDir = isTwa ? 'dist-twa' : 'dist';

// Web PWA manifest — not used in TWA builds (Telegram host manages the UX)
const webPwaManifest: Partial<ManifestOptions> = {
  name: 'BrotherHood Wallet',
  short_name: 'BrotherHood',
  description:
    'BrotherHood — TON Wallet & FI Jetton Management: issue, transfer, burn, invite, vote and administer on TON.',
  lang: 'en',
  start_url: base,
  scope: base,
  display: 'standalone',
  orientation: 'portrait',
  theme_color: '#0b0e14',
  background_color: '#0b0e14',
  icons: [
    { src: `${base}favicon.svg`, sizes: 'any', type: 'image/svg+xml' },
    {
      src: `${base}web-app-manifest-192x192.png`,
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any',
    },
    {
      src: `${base}web-app-manifest-192x192.png`,
      sizes: '192x192',
      type: 'image/png',
      purpose: 'maskable',
    },
    {
      src: `${base}web-app-manifest-512x512.png`,
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any',
    },
    {
      src: `${base}web-app-manifest-512x512.png`,
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable',
    },
    {
      src: `${base}apple-touch-icon.png`,
      sizes: '180x180',
      type: 'image/png',
    },
  ],
};

// TWA manifest: minimal — Telegram controls install/launch UX
const twaPwaManifest: Partial<ManifestOptions> = {
  name: 'BrotherHood Wallet',
  short_name: 'BrotherHood',
  description: 'BrotherHood Wallet — Telegram Mini App',
  lang: 'en',
  start_url: base,
  scope: base,
  display: 'fullscreen',
  theme_color: '#0b0e14',
  background_color: '#0b0e14',
  icons: [{ src: `${base}favicon.svg`, sizes: 'any', type: 'image/svg+xml' }],
};

const pwaManifest = isTwa ? twaPwaManifest : webPwaManifest;

export default defineConfig(() => {
  const isHttps = process.env.VITE_HTTPS === 'true';
  const certKeyPath = path.resolve(projectRoot, '../../.cert/dev-key.pem');
  const certPath = path.resolve(projectRoot, '../../.cert/dev-cert.pem');
  const hasCert = fs.existsSync(certKeyPath) && fs.existsSync(certPath);
  const httpsConfig =
    isHttps && hasCert
      ? {
          key: fs.readFileSync(certKeyPath),
          cert: fs.readFileSync(certPath),
        }
      : undefined;

  return {
    base,
    root: projectRoot,
    envDir: path.resolve(projectRoot, '../../'),
    envPrefix: ['VITE_', 'TONCENTER_'],
    define: {
      global: 'globalThis',
      // Expose build target to runtime so components can branch on it
      'import.meta.env.VITE_APP_TARGET': JSON.stringify(isTwa ? 'twa' : 'web'),
    },
    plugins: [
      react(),
      babel({
        presets: [reactCompilerPreset()],
        overrides: [
          {
            test: /\.[mc]ts(?:$|\?)/,
            parserOpts: { plugins: ['typescript'] },
          },
        ],
      }),
      tailwindcss(),
      VitePWA(
        isTwa
          ? {
              // TWA: emit manifest only, no service-worker (Telegram manages lifecycle)
              registerType: 'prompt',
              injectRegister: false,
              devOptions: { enabled: false },
              manifest: pwaManifest,
              workbox: {
                // Disable SW generation for TWA — Telegram WebView doesn't need it
                navigateFallback: null,
                globPatterns: [],
              },
            }
          : {
              // Web: full PWA with service worker and runtime caching
              registerType: 'prompt',
              injectRegister: false,
              devOptions: { enabled: false },
              manifest: pwaManifest,
              workbox: {
                globPatterns: [
                  '**/*.{js,css,html,ico,png,svg,webp,jpg,jpeg,woff,woff2,ttf,eot,webmanifest}',
                ],
                maximumFileSizeToCacheInBytes: 15 * 1024 * 1024,
                navigateFallback: `${base}index.html`,
                navigateFallbackDenylist: [/^\/api\//, /^\/_server\//],
                runtimeCaching: [
                  {
                    urlPattern: ({ request }) =>
                      request.destination === 'style' ||
                      request.destination === 'script' ||
                      request.destination === 'worker',
                    handler: 'CacheFirst',
                    options: {
                      cacheName: 'brotherhood-static-resources',
                      expiration: {
                        maxEntries: 150,
                        maxAgeSeconds: 60 * 24 * 60 * 60,
                      },
                    },
                  },
                  {
                    urlPattern: ({ request }) =>
                      request.destination === 'image',
                    handler: 'CacheFirst',
                    options: {
                      cacheName: 'brotherhood-images',
                      expiration: {
                        maxEntries: 300,
                        maxAgeSeconds: 60 * 24 * 60 * 60,
                      },
                    },
                  },
                  {
                    // Decentralized media gateways (IPFS, Arweave) and TON token image CDNs
                    urlPattern:
                      /^https:\/\/(?:[a-zA-Z0-9-]+\.)*(?:ipfs\.io|cloudflare-ipfs\.com|dweb\.link|nftstorage\.link|arweave\.net|cache\.tonapi\.io)\/.*$/i,
                    handler: 'CacheFirst',
                    options: {
                      cacheName: 'brotherhood-token-media',
                      expiration: {
                        maxEntries: 500,
                        maxAgeSeconds: 30 * 24 * 60 * 60,
                      },
                      cacheableResponse: {
                        statuses: [0, 200],
                      },
                    },
                  },
                  {
                    urlPattern: ({ request }) => request.destination === 'font',
                    handler: 'CacheFirst',
                    options: {
                      cacheName: 'brotherhood-fonts',
                      expiration: {
                        maxEntries: 60,
                        maxAgeSeconds: 365 * 24 * 60 * 60,
                      },
                    },
                  },
                  {
                    urlPattern:
                      /^https:\/\/telegram\.org\/js\/telegram-web-app\.js/,
                    handler: 'CacheFirst',
                    options: {
                      cacheName: 'brotherhood-telegram-sdk',
                      expiration: {
                        maxEntries: 5,
                        maxAgeSeconds: 30 * 24 * 60 * 60,
                      },
                      cacheableResponse: {
                        statuses: [0, 200],
                      },
                    },
                  },
                ],
              },
            },
      ),
    ],
    build: {
      outDir,
      emptyOutDir: true,
      chunkSizeWarningLimit: 3000,
      rollupOptions: isTwa
        ? {
            // Use index.twa.html as entry so the Telegram SDK script loads
            // synchronously. Vite will emit it as index.twa.html; the
            // copy-to-dist.mjs post-build script renames it to index.html.
            input: path.resolve(projectRoot, 'index.twa.html'),
          }
        : {},
    },
    legacy: {
      skipWebSocketTokenCheck: true,
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      https: httpsConfig,
      ws: {
        clientPort: 3000,
      },
      allowedHosts: ['localhost', '127.0.0.1', 'local.dev'],
    },
    preview: {
      host: '0.0.0.0',
      port: 3000,
      https: httpsConfig,
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-dom/client',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'zustand',
        'immer',
        '@tanstack/react-query',
        '@tanstack/react-router',
        'sonner',
        '@ton/core',
        '@ton/crypto',
        '@ton/ton',
        '@scure/bip39',
        'buffer',
        'lucide-react',
        'clsx',
        'tailwind-merge',
        'framer-motion',
        '@telegram-apps/sdk',
        '@radix-ui/react-dialog',
        '@radix-ui/react-label',
        '@radix-ui/react-popover',
        '@radix-ui/react-select',
        '@radix-ui/react-slot',
        '@radix-ui/react-switch',
        '@radix-ui/react-tabs',
        '@tonconnect/ui-react',
        'qr-code-styling',
      ],
    },
    resolve: {
      dedupe: [
        'react',
        'react-dom',
        'react-dom/client',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'zustand',
      ],
      alias: {
        react: path.resolve(projectRoot, './node_modules/react'),
        'react-dom': path.resolve(projectRoot, './node_modules/react-dom'),
        'react/jsx-runtime': path.resolve(
          projectRoot,
          './node_modules/react/jsx-runtime.js',
        ),
        'react/jsx-dev-runtime': path.resolve(
          projectRoot,
          './node_modules/react/jsx-dev-runtime.js',
        ),
        'react-dom/client': path.resolve(
          projectRoot,
          './node_modules/react-dom/client.js',
        ),
        '@': path.resolve(projectRoot, './src'),
        '@wrappers': path.resolve(projectRoot, '../../wrappers-ts'),
        '@ton/core': path.resolve(projectRoot, './node_modules/@ton/core'),
        '@ton/crypto': path.resolve(projectRoot, './node_modules/@ton/crypto'),
        '@ton/ton': path.resolve(projectRoot, './node_modules/@ton/ton'),
        '@ton/walletkit/swap/omniston': path.resolve(
          projectRoot,
          '../../packages/walletkit/src/defi/swap/omniston/index.ts',
        ),
        '@ton/walletkit/swap/dedust': path.resolve(
          projectRoot,
          '../../packages/walletkit/src/defi/swap/dedust/index.ts',
        ),
        '@ton/walletkit/staking/tonstakers': path.resolve(
          projectRoot,
          '../../packages/walletkit/src/defi/staking/tonstakers/index.ts',
        ),
        '@ton/walletkit/gasless/tonapi': path.resolve(
          projectRoot,
          '../../packages/walletkit/src/defi/gasless/tonapi/index.ts',
        ),
        '@ton/walletkit/crypto-onramp/decent': path.resolve(
          projectRoot,
          '../../packages/walletkit/src/defi/crypto-onramp/decent/index.ts',
        ),
        '@ton/walletkit/crypto-onramp/layerswap': path.resolve(
          projectRoot,
          '../../packages/walletkit/src/defi/crypto-onramp/layerswap/index.ts',
        ),
        '@ton/walletkit/bridge': path.resolve(
          projectRoot,
          '../../packages/walletkit/src/bridge/JSBridgeInjector.ts',
        ),
        '@ton/walletkit': path.resolve(
          projectRoot,
          '../../packages/walletkit/src/index.ts',
        ),
        '@demo/v4ledger-adapter': path.resolve(
          projectRoot,
          '../../packages/v4ledger-adapter/src/index.ts',
        ),
        '@demo/wallet-core': path.resolve(
          projectRoot,
          '../../packages/wallet-core/src/index.ts',
        ),
      },
    },
  };
});
