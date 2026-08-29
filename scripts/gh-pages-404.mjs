// GitHub Pages SPA fallback: copy apps/wallet/dist to dist/client and write 404.html
// so deep links resolve to the app shell.
//
//   node scripts/gh-pages-404.mjs
import { copyFileSync, existsSync, mkdirSync, cpSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const WALLET_DIST = join(ROOT, 'apps', 'wallet', 'dist');
const CLIENT_DIR = join(ROOT, 'dist', 'client');
const WALLET_INDEX = join(WALLET_DIST, 'index.html');
const WALLET_404 = join(WALLET_DIST, '404.html');
const CLIENT_INDEX = join(CLIENT_DIR, 'index.html');
const CLIENT_404 = join(CLIENT_DIR, '404.html');

if (!existsSync(WALLET_INDEX)) {
  console.error(`[gh-pages-404] Missing ${WALLET_INDEX} — run \`bun run build\` first.`);
  process.exit(1);
}

// 1. Write 404 in wallet dist
copyFileSync(WALLET_INDEX, WALLET_404);

// 2. Sync to dist/client for GitHub Pages actions upload
mkdirSync(CLIENT_DIR, { recursive: true });
cpSync(WALLET_DIST, CLIENT_DIR, { recursive: true });
copyFileSync(CLIENT_INDEX, CLIENT_404);

console.log(`[gh-pages-404] Successfully synchronized ${WALLET_DIST} -> ${CLIENT_DIR} with 404.html fallback.`);
