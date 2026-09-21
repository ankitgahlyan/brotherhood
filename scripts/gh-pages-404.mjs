#!/usr/bin/env node
/**
 * gh-pages-404.mjs — Assemble dual-target GitHub Pages artifact.
 *
 * New layout (TWA at root, Web at /web/):
 *   dist/client/           ← TWA (Telegram Mini App) at /brotherhood/
 *   dist/client/web/       ← Web PWA at /brotherhood/web/
 *   dist/client/404.html   ← Smart redirect script (handles BOTH roots)
 *   dist/client/web/404.html
 *
 * Why this layout:
 *   Telegram opens https://ankitgahlyan.github.io/brotherhood/ directly as the root
 *   of the repository site, serving the TWA index.html natively with 200 OK (no redirects, no 404s).
 *   Web users access https://ankitgahlyan.github.io/brotherhood/web/.
 *   Any unmatched path under /brotherhood/web/ redirects to Web shell.
 *   Any other unmatched path under /brotherhood/ redirects to TWA shell.
 */

import {
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

// TWA build output (after copy-to-dist.mjs --target=twa)
const TWA_DIST = join(WALLET_DIR, 'dist-twa');
// Web build output (after copy-to-dist.mjs --target=web)
const WEB_DIST = join(WALLET_DIR, 'dist');

// GitHub Pages upload root
const CLIENT_DIR = join(ROOT, 'dist', 'client');
// Web sub-directory inside the GitHub Pages artifact
const CLIENT_WEB_DIR = join(CLIENT_DIR, 'web');

// ---------------------------------------------------------------------------
// 1. Validate builds exist
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

assertBuildExists(TWA_DIST, 'twa');
assertBuildExists(WEB_DIST, 'web');

// ---------------------------------------------------------------------------
// 2. Sync TWA build → dist/client/ (root: /brotherhood/)
// ---------------------------------------------------------------------------
mkdirSync(CLIENT_DIR, { recursive: true });
cpSync(TWA_DIST, CLIENT_DIR, { recursive: true });
console.log('[gh-pages-404] ✅ TWA build → dist/client/ (root: /brotherhood/)');

// ---------------------------------------------------------------------------
// 3. Sync Web build → dist/client/web/ (subpath: /brotherhood/web/)
// ---------------------------------------------------------------------------
mkdirSync(CLIENT_WEB_DIR, { recursive: true });
cpSync(WEB_DIST, CLIENT_WEB_DIR, { recursive: true });
console.log(
  '[gh-pages-404] ✅ Web build → dist/client/web/ (subpath: /brotherhood/web/)',
);

// ---------------------------------------------------------------------------
// 4. Emit smart 404.html (placed at root and in web/)
//
// Logic:
//   - Path starts with /brotherhood/web  → redirect to Web root with ?p=<path>
//   - Everything else                    → redirect to TWA root with ?p=<path>
// ---------------------------------------------------------------------------
const SMART_404 = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>BrotherHood</title>
    <script>
      // GitHub Pages SPA redirect — dual-root edition (TWA root + Web /web/)
      (function () {
        var loc = window.location;
        var path = loc.pathname;
        var webBase = '/brotherhood/web';
        var twaBase = '/brotherhood';
        var targetBase;

        if (path === webBase || path.startsWith(webBase + '/')) {
          targetBase = webBase + '/';
        } else {
          targetBase = twaBase + '/';
        }

        var search = loc.search ? '&q=' + encodeURIComponent(loc.search) : '';
        var redirect =
          targetBase + '?p=' + encodeURIComponent(path) + search + loc.hash;

        window.history.replaceState(null, '', redirect);
        window.location.replace(redirect);
      })();
    <\/script>
  </head>
  <body></body>
</html>
`;

// Write smart 404.html at root
writeFileSync(join(CLIENT_DIR, '404.html'), SMART_404);
console.log(
  '[gh-pages-404] ✅ Smart 404.html written to root (handles TWA + Web)',
);

// Write smart 404.html in web/
writeFileSync(join(CLIENT_WEB_DIR, '404.html'), SMART_404);
console.log('[gh-pages-404] ✅ Smart 404.html written to web/');

// ---------------------------------------------------------------------------
// 5. Verify TWA headers at root
// ---------------------------------------------------------------------------
const twaHeaders = join(CLIENT_DIR, '_headers');
if (existsSync(twaHeaders)) {
  const content = readFileSync(twaHeaders, 'utf8');
  if (!content.includes('X-Robots-Tag') && !content.includes('noindex')) {
    console.warn(
      '[gh-pages-404] ⚠️ Root TWA _headers missing noindex — check _headers_telegram',
    );
  } else {
    console.log('[gh-pages-404] ✅ Root TWA _headers noindex verified');
  }
}

// ---------------------------------------------------------------------------
// 6. Summary
// ---------------------------------------------------------------------------
console.log('');
console.log('[gh-pages-404] 🎉 GitHub Pages artifact ready:');
console.log(
  '   /brotherhood/     → dist/client/      (Telegram Mini App at root)',
);
console.log('   /brotherhood/web/ → dist/client/web/  (Web PWA)');
console.log(
  '   404.html routes /brotherhood/web/* to Web shell and others to TWA shell',
);
