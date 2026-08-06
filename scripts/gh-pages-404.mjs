// GitHub Pages SPA fallback: copy the prerendered index.html to 404.html so
// deep links (e.g. /demo/tanstack-query on a GH Pages project site) resolve
// to the app shell. Runs after `vite build`.
//
//   node scripts/gh-pages-404.mjs
import { copyFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CLIENT_DIR = join(ROOT, 'dist', 'client');
const INDEX = join(CLIENT_DIR, 'index.html');
const TARGET = join(CLIENT_DIR, '404.html');

if (!existsSync(INDEX)) {
  console.error(`[gh-pages-404] Missing ${INDEX} — run \`vite build\` first.`);
  process.exit(1);
}

copyFileSync(INDEX, TARGET);
console.log(`[gh-pages-404] ${TARGET} written.`);
