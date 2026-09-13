import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import type { ManifestOptions } from 'vite-plugin-pwa';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const base = (process.env.VITE_BASE ?? '/brotherhood/').replace(/\/?$/, '/');

const pwaManifest: Partial<ManifestOptions> = {
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

export default defineConfig({
  base,
  root: projectRoot,
  envDir: path.resolve(projectRoot, '../../'),
  envPrefix: ['VITE_', 'TONCENTER_'],
  define: {
    global: 'globalThis',
  },
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler', {}]],
      },
    }),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      devOptions: {
        enabled: false,
      },
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
            urlPattern: ({ request }) => request.destination === 'image',
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
            urlPattern: /^https:\/\/telegram\.org\/js\/telegram-web-app\.js/,
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
    }),
  ],
  build: {
    chunkSizeWarningLimit: 3000,
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    hmr: {
      clientPort: 3000,
    },
    allowedHosts: ['localhost', '127.0.0.1', 'local.dev'],
  },
  resolve: {
    dedupe: ['react', 'react-dom', 'zustand'],
    alias: {
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
});
