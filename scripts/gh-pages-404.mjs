#!/usr/bin/env node
// GitHub Pages SPA fallback: copy wallet dist and twa dist to dist/client,
// generating 404.html at each level so deep links resolve to the app shell.
//
//   node scripts/gh-pages-404.mjs
//
// Output layout:
//   dist/client/           ← Web (PWA) at /brotherhood/
//   dist/client/twa/       ← TWA at /brotherhood/twa/
//   dist/client/404.html   ← GitHub Pages fallback
//   dist/client/twa/404.html

import {
  copyFileSync,
  existsSync,
  mkdirSync,
  cpSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const WALLET_DIR = join(ROOT, 'apps', 'wallet');

// Web build output
const WEB_DIST = join(WALLET_DIR, 'dist');
// TWA build output
const TWA_DIST = join(WALLET_DIR, 'dist-twa');
// GitHub Pages upload root
const CLIENT_DIR = join(ROOT, 'dist', 'client');
// TWA goes under dist/client/twa/ → served at /brotherhood/twa/
const CLIENT_TWA_DIR = join(CLIENT_DIR, 'twa');

// ---------------------------------------------------------------------------
// 1. Validate that required builds exist
// ---------------------------------------------------------------------------
function assertBuildExists(distDir, label) {
  const index = join(distDir, 'index.html');
  if (!existsSync(index)) {
    console.error(
      `[gh-pages-404] ❌ Missing ${index} — run \`bun run build:${label}\` first.`,
    );
    process.exit(1);
  }
}

assertBuildExists(WEB_DIST, 'web');
assertBuildExists(TWA_DIST, 'twa');

// ---------------------------------------------------------------------------
// 2. Sync Web build → dist/client/
// ---------------------------------------------------------------------------
mkdirSync(CLIENT_DIR, { recursive: true });
cpSync(WEB_DIST, CLIENT_DIR, { recursive: true });

// Write 404.html for Web (SPA fallback at root)
const webIndex = readFileSync(join(CLIENT_DIR, 'index.html'), 'utf8');
writeFileSync(join(CLIENT_DIR, '404.html'), webIndex);
console.log('[gh-pages-404] ✅ Web build → dist/client/ (with 404.html)');

// ---------------------------------------------------------------------------
// 3. Sync TWA build → dist/client/twa/
// ---------------------------------------------------------------------------
mkdirSync(CLIENT_TWA_DIR, { recursive: true });
cpSync(TWA_DIST, CLIENT_TWA_DIR, { recursive: true });

// TWA _headers_telegram → _headers (ensures noindex + Telegram frame-ancestors)
const twaHeadersSrc = join(CLIENT_TWA_DIR, '_headers_telegram');
const twaHeadersDst = join(CLIENT_TWA_DIR, '_headers');
if (existsSync(twaHeadersSrc)) {
  let headersContent = readFileSync(twaHeadersSrc, 'utf8');
  // Guarantee X-Robots-Tag: noindex is present
  if (!headersContent.includes('X-Robots-Tag')) {
    headersContent += '\n  X-Robots-Tag: noindex, nofollow\n';
  }
  writeFileSync(twaHeadersDst, headersContent);
  console.log(
    '[gh-pages-404] ✅ TWA _headers_telegram → _headers (noindex enforced)',
  );
} else {
  // Emit a minimal _headers file if the source isn't present
  writeFileSync(
    twaHeadersDst,
    `/*\n  X-Robots-Tag: noindex, nofollow\n  Content-Security-Policy: frame-ancestors 'self' https://web.telegram.org https://*.telegram.org\n`,
  );
  console.log(
    '[gh-pages-404] ℹ️ TWA _headers synthesized (source _headers_telegram missing)',
  );
}

// Write 404.html for TWA (SPA fallback under /brotherhood/twa/)
const twaIndex = readFileSync(join(CLIENT_TWA_DIR, 'index.html'), 'utf8');
writeFileSync(join(CLIENT_TWA_DIR, '404.html'), twaIndex);
console.log('[gh-pages-404] ✅ TWA build → dist/client/twa/ (with 404.html)');

// ---------------------------------------------------------------------------
// 4. Summary
// ---------------------------------------------------------------------------
console.log('');
console.log('[gh-pages-404] 🎉 GitHub Pages artifact ready:');
console.log('   /brotherhood/       → dist/client/  (Web PWA)');
console.log('   /brotherhood/twa/   → dist/client/twa/  (Telegram Mini App)');
