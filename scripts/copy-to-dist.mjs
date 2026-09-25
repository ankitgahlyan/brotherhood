#!/usr/bin/env node
/**
 * copy-to-dist.mjs — Post-build asset distribution processor.
 *
 * Usage:
 *   node scripts/copy-to-dist.mjs --target=web   (assembles Web PWA output)
 *   node scripts/copy-to-dist.mjs --target=twa   (assembles TWA output with Telegram headers)
 *
 * What it does (mirrors ~/wallet-v2/deploy/copy_to_dist.sh):
 *  1. Reads the target vite output directory (dist or dist-twa inside apps/wallet/).
 *  2. For TWA: promotes _headers_telegram → _headers and enforces X-Robots-Tag: noindex.
 *  3. For Web: ensures standard _headers security rules are present.
 *  4. Cleans up build artifacts that shouldn't ship (statoscope, etc.).
 */

import {
  existsSync,
  readFileSync,
  writeFileSync,
  rmSync,
  renameSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const WALLET_DIR = join(ROOT, 'apps', 'wallet');

// ---------------------------------------------------------------------------
// Parse --target flag
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
const targetArg = args.find((a) => a.startsWith('--target='));
const target = targetArg ? targetArg.split('=')[1] : 'web';

if (target !== 'web' && target !== 'twa') {
  console.error(
    `[copy-to-dist] ❌ Unknown --target="${target}". Use web or twa.`,
  );
  process.exit(1);
}

const isTwa = target === 'twa';
const distDir = join(WALLET_DIR, isTwa ? 'dist-twa' : 'dist');

console.log(`[copy-to-dist] Processing target: ${target.toUpperCase()}`);
console.log(`[copy-to-dist] dist dir: ${distDir}`);

// ---------------------------------------------------------------------------
// 0. Rename TWA HTML output (Vite names it after the source file)
// ---------------------------------------------------------------------------
// Vite names the HTML output after the source filename regardless of the
// rollupOptions.input key. For TWA we use index.twa.html as source, so Vite
// emits dist-twa/index.twa.html. Rename it to index.html so all downstream
// scripts (gh-pages-404.mjs, deploy workflows) work without special-casing.
if (isTwa) {
  const twaSrc = join(distDir, 'index.twa.html');
  const twaDst = join(distDir, 'index.html');
  if (existsSync(twaSrc) && !existsSync(twaDst)) {
    renameSync(twaSrc, twaDst);
    console.log('[copy-to-dist] ✅ Renamed index.twa.html → index.html');
  }
}

if (!existsSync(join(distDir, 'index.html'))) {
  console.error(
    `[copy-to-dist] ❌ ${distDir}/index.html not found. Run "bun run build:${target}" first.`,
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// 1. Headers processing
// ---------------------------------------------------------------------------
if (isTwa) {
  const telegramHeadersSrc = join(distDir, '_headers_telegram');
  const headersDst = join(distDir, '_headers');

  let headersContent = '';

  if (existsSync(telegramHeadersSrc)) {
    headersContent = readFileSync(telegramHeadersSrc, 'utf8');
    console.log('[copy-to-dist] ✅ Loaded _headers_telegram');
  } else if (existsSync(join(WALLET_DIR, 'public', '_headers_telegram'))) {
    headersContent = readFileSync(
      join(WALLET_DIR, 'public', '_headers_telegram'),
      'utf8',
    );
    console.log('[copy-to-dist] ✅ Loaded _headers_telegram from public/');
  } else {
    console.warn(
      '[copy-to-dist] ⚠️ _headers_telegram not found — synthesizing minimal headers',
    );
    headersContent = '/*\n';
  }

  // Guarantee noindex
  if (!headersContent.includes('X-Robots-Tag')) {
    headersContent += '  X-Robots-Tag: noindex, nofollow\n';
  }

  // Guarantee Telegram frame-ancestors
  if (!headersContent.includes('frame-ancestors')) {
    headersContent +=
      "  Content-Security-Policy: frame-ancestors 'self' https://web.telegram.org https://*.telegram.org\n";
  }

  writeFileSync(headersDst, headersContent);
  console.log(
    '[copy-to-dist] ✅ _headers written (noindex + frame-ancestors enforced)',
  );
} else {
  // Web: ensure _headers is present (vite-plugin-pwa or public/ already copies it)
  const headersDst = join(distDir, '_headers');
  if (!existsSync(headersDst)) {
    const pubHeaders = join(WALLET_DIR, 'public', '_headers');
    if (existsSync(pubHeaders)) {
      // Already copied by Vite, nothing to do
    } else {
      writeFileSync(
        headersDst,
        `/*\n  X-Content-Type-Options: nosniff\n  X-Frame-Options: SAMEORIGIN\n  Content-Security-Policy: frame-ancestors 'self'\n`,
      );
      console.log('[copy-to-dist] ✅ Web _headers synthesized');
    }
  } else {
    console.log('[copy-to-dist] ✅ Web _headers present');
  }
}

// ---------------------------------------------------------------------------
// 2. Clean up build-time artifacts that must not ship
// ---------------------------------------------------------------------------
const ALWAYS_REMOVE = [
  'statoscope-build-statistics.json',
  'statoscope-report.html',
];
// For TWA: remove web-only assets that aren't needed inside Telegram
const TWA_REMOVE = [
  '_headers_telegram', // the source file — already promoted to _headers
];
// For Web: remove TWA-specific source headers
const WEB_REMOVE = ['_headers_telegram'];

const toRemove = [...ALWAYS_REMOVE, ...(isTwa ? TWA_REMOVE : WEB_REMOVE)];

for (const file of toRemove) {
  const filePath = join(distDir, file);
  if (existsSync(filePath)) {
    rmSync(filePath, { recursive: true, force: true });
    console.log(`[copy-to-dist] 🗑 Removed ${file}`);
  }
}

// ---------------------------------------------------------------------------
// 3. Write 404.html & _redirects (SPA fallback for Netlify and static hosts)
// ---------------------------------------------------------------------------
const indexHtml = readFileSync(join(distDir, 'index.html'), 'utf8');
writeFileSync(join(distDir, '404.html'), indexHtml);
console.log('[copy-to-dist] ✅ 404.html written');

const redirectsDst = join(distDir, '_redirects');
if (!existsSync(redirectsDst)) {
  writeFileSync(redirectsDst, '/* /index.html 200\n');
  console.log('[copy-to-dist] ✅ _redirects written');
}

console.log(`\n[copy-to-dist] 🎉 ${target.toUpperCase()} post-build complete.`);
