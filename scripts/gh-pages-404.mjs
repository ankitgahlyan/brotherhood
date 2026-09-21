#!/usr/bin/env node
/**
 * gh-pages-404.mjs — Assemble dual-target GitHub Pages artifact.
 *
 * Output layout (uploaded to GH Pages as a single artifact):
 *   dist/client/           ← Web PWA at /brotherhood/
 *   dist/client/twa/       ← TWA at /brotherhood/twa/
 *   dist/client/404.html   ← Smart redirect script (handles BOTH roots)
 *
 * The smart 404.html is the key to making GitHub Pages work as a dual-root SPA host.
 * GitHub Pages only serves index.html from the artifact root; for any unmatched path
 * it serves the root 404.html. The smart 404.html detects whether the request is for
 * the Web or TWA sub-tree and redirects accordingly, encoding the intended path as
 * a ?p= query param that each app's index.html restores via history.replaceState
 * before the router boots.
 *
 *   /brotherhood/twa/<path>   →  /brotherhood/twa/?p=<path>  (loads TWA index.html)
 *   /brotherhood/<path>       →  /brotherhood/?p=<path>      (loads Web index.html)
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

// Web build output (after copy-to-dist.mjs --target=web)
const WEB_DIST = join(WALLET_DIR, 'dist');
// TWA build output (after copy-to-dist.mjs --target=twa)
const TWA_DIST = join(WALLET_DIR, 'dist-twa');
// GitHub Pages upload root
const CLIENT_DIR = join(ROOT, 'dist', 'client');
// TWA sub-directory inside the GitHub Pages artifact
const CLIENT_TWA_DIR = join(CLIENT_DIR, 'twa');

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

assertBuildExists(WEB_DIST, 'web');
assertBuildExists(TWA_DIST, 'twa');

// ---------------------------------------------------------------------------
// 2. Sync Web build → dist/client/
// ---------------------------------------------------------------------------
mkdirSync(CLIENT_DIR, { recursive: true });
cpSync(WEB_DIST, CLIENT_DIR, { recursive: true });
console.log('[gh-pages-404] ✅ Web build → dist/client/');

// ---------------------------------------------------------------------------
// 3. Sync TWA build → dist/client/twa/
// ---------------------------------------------------------------------------
mkdirSync(CLIENT_TWA_DIR, { recursive: true });
cpSync(TWA_DIST, CLIENT_TWA_DIR, { recursive: true });
console.log('[gh-pages-404] ✅ TWA build → dist/client/twa/');

// ---------------------------------------------------------------------------
// 4. Emit smart 404.html (replaces both root and twa/404.html)
//
// Logic:
//   - Path starts with /brotherhood/twa  → redirect to TWA root with ?p=<path>
//   - Everything else                    → redirect to Web root with ?p=<path>
//
// The ?p=<path> is read by the inline script in each app's index.html and
// restored via history.replaceState before TanStack Router initialises.
// ---------------------------------------------------------------------------
const SMART_404 = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>BrotherHood</title>
    <script>
      // GitHub Pages SPA redirect — dual-root edition
      // Redirects to the correct app shell, encoding the intended path as ?p=
      // so that the shell can restore it via history.replaceState before the
      // router boots (see the restore script in index.html / index.twa.html).
      (function () {
        var loc = window.location;
        var path = loc.pathname;
        var twaBase = '/brotherhood/twa';
        var webBase = '/brotherhood';
        var targetBase;

        if (path === twaBase || path.startsWith(twaBase + '/')) {
          targetBase = twaBase + '/';
        } else {
          targetBase = webBase + '/';
        }

        // Encode the full path as ?p= and search as ?q=
        var search = loc.search ? '&q=' + encodeURIComponent(loc.search) : '';
        var redirect =
          targetBase + '?p=' + encodeURIComponent(path) + search + loc.hash;

        // Use replaceState so the back button doesn't loop
        window.history.replaceState(null, '', redirect);
        window.location.replace(redirect);
      })();
    <\/script>
  </head>
  <body></body>
</html>
`;

// Write smart 404.html at the root (handles Web + TWA paths)
writeFileSync(join(CLIENT_DIR, '404.html'), SMART_404);
console.log('[gh-pages-404] ✅ Smart 404.html written (dual-root redirect)');

// TWA subdirectory 404.html — same smart redirect (handles refreshes within /twa/)
writeFileSync(join(CLIENT_TWA_DIR, '404.html'), SMART_404);
console.log('[gh-pages-404] ✅ Smart 404.html written to twa/');

// ---------------------------------------------------------------------------
// 5. Verify TWA headers
// ---------------------------------------------------------------------------
const twaHeaders = join(CLIENT_TWA_DIR, '_headers');
if (existsSync(twaHeaders)) {
  const content = readFileSync(twaHeaders, 'utf8');
  if (!content.includes('X-Robots-Tag') && !content.includes('noindex')) {
    console.warn(
      '[gh-pages-404] ⚠️ TWA _headers missing noindex — check _headers_telegram',
    );
  } else {
    console.log('[gh-pages-404] ✅ TWA _headers noindex verified');
  }
}

// ---------------------------------------------------------------------------
// 6. Summary
// ---------------------------------------------------------------------------
console.log('');
console.log('[gh-pages-404] 🎉 GitHub Pages artifact ready:');
console.log('   /brotherhood/     → dist/client/  (Web PWA)');
console.log('   /brotherhood/twa/ → dist/client/twa/  (Telegram Mini App)');
console.log('   404.html routes any unmatched path to the correct app shell');
