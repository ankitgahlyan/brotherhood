import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { devtools } from '@tanstack/devtools-vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { cloudflare } from '@cloudflare/vite-plugin';
import { VitePWA } from 'vite-plugin-pwa';
import type { ManifestOptions } from 'vite-plugin-pwa';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

// Base path. The app publishes to a GitHub Pages *project* site
// (https://ankitgahlyan.github.io/brotherhood/) so the default is /brotherhood/.
// Override with VITE_BASE (e.g. VITE_BASE=/ for Cloudflare Pages or a
// user/org Pages site). Must stay in sync with src/router.tsx (basepath).
const base = (process.env.VITE_BASE ?? '/brotherhood/').replace(/\/?$/, '/');

const pwaManifest: Partial<ManifestOptions> = {
  name: 'BrotherHood',
  short_name: 'BrotherHood',
  description:
    'BrotherHood — manage the FI Jetton: issue, transfer, burn, invite, vote and administer TEP-74 tokens on TON.',
  lang: 'en',
  start_url: base,
  scope: base,
  display: 'standalone',
  orientation: 'portrait',
  theme_color: '#0b0e14',
  background_color: '#0b0e14',
  icons: [
    { src: `${base}icon-192.png`, sizes: '192x192', type: 'image/png' },
    { src: `${base}icon-512.png`, sizes: '512x512', type: 'image/png' },
    {
      src: `${base}icon-512-maskable.png`,
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

// Split heavy vendor modules into cacheable chunks (see
// https://rolldown.rs/reference/OutputOptions.codeSplitting). Group order
// matters: the first matching group claims a module. Only applied to the
// client bundle; the SSR/Cloudflare Workers build stays monolithic.
const codeSplittingGroups: Array<{
  name: string;
  test: RegExp;
}> = [
  { name: 'react', test: /node_modules[\\/](?:react|react-dom)(?:[\\/]|$)/ },
  {
    name: 'react-router',
    test: /node_modules[\\/]@tanstack[\\/](?:react-router|router-core|router-utils|history)(?:[\\/]|$)/,
  },
  {
    name: 'tanstack-query',
    test: /node_modules[\\/]@tanstack[\\/](?:react-query|query-core)(?:[\\/]|$)/,
  },
  {
    name: 'tanstack-store',
    test: /node_modules[\\/]@tanstack[\\/](?:react-store|store)(?:[\\/]|$)/,
  },
  { name: 'ton-sdk', test: /node_modules[\\/]@ton[\\/]/ },
  { name: 'tonconnect', test: /node_modules[\\/]@tonconnect[\\/]/ },
  { name: 'radix-ui', test: /node_modules[\\/]@radix-ui[\\/]/ },
  { name: 'floating-ui', test: /node_modules[\\/]@floating-ui[\\/]/ },
  { name: 'lucide-react', test: /node_modules[\\/]lucide-react[\\/]/ },
  { name: 'zod', test: /node_modules[\\/]zod(?:[\\/]|$)/ },
];

export default defineConfig({
  base,
  root: projectRoot,
  envDir: projectRoot,
  envPrefix: ['VITE_', 'TONCENTER_'],
  resolve: {
    alias: {
      '@wrappers': path.resolve(projectRoot, 'wrappers-ts'),
      '@': path.resolve(projectRoot, 'src'),
    },
  },
  plugins: [
    devtools(),
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    tailwindcss(),
    tanstackStart({
      prerender: {
        enabled: true,
        crawlLinks: true,
        failOnError: true,
      },
    }),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      includeAssets: [
        'favicon.svg',
        'icon-192.png',
        'icon-512.png',
        'icon-512-maskable.png',
        'apple-touch-icon.png',
      ],
      // The service worker itself (public/sw.js) is hand-authored because the
      // Start/Cloudflare multi-environment build does not run workbox's
      // generateSW. Only the manifest JSON is injected here.
      manifest: pwaManifest,
    }),
    viteReact(),
  ],
  server: {
    fs: {
      allow: ['.', path.resolve(projectRoot, 'wrappers-ts')],
    },
    port: 3000,
  },
  environments: {
    client: {
      build: {
        rolldownOptions: {
          output: {
            codeSplitting: {
              groups: codeSplittingGroups,
            },
          },
        },
      },
    },
  },
});
