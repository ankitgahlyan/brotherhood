/**
 * Minimal headless smoke test for the app.
 *
 * Opens the app in headless Chromium (bundled via Playwright) and asserts the
 * Manage page shell + content render. Use `nub run dev` (or serve
 * `dist/client`) first, then:
 *
 *   node scripts/smoke-test.mjs [baseUrl]
 *
 * The default baseUrl is http://localhost:3000/brotherhood/ (vite dev). The
 * Playwright browser binary lives in ~/.cache/ms-playwright (shared cache);
 * install it once with `npx playwright install chromium`.
 */
import { chromium } from 'playwright';
import { existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';

const baseUrl = process.argv[2] ?? 'http://localhost:3000/brotherhood/';

// Resolve the full Chromium binary from the Playwright cache. Recent
// Playwright ships a separate headless-shell binary; if that's missing, fall
// back to the full Chromium executable in headless mode.
function findChrome() {
  const root = join(homedir(), '.cache', 'ms-playwright');
  if (!existsSync(root)) return undefined;
  const candidates = readdirSync(root)
    .filter((d) => d.startsWith('chromium-'))
    .sort()
    .reverse();
  for (const dir of candidates) {
    const p = join(root, dir, 'chrome-linux64', 'chrome');
    if (existsSync(p)) return p;
  }
  return undefined;
}

const launched = await chromium.launch({ executablePath: findChrome() });
let failed = false;
try {
  const page = await launched.newPage();
  await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 60000 });
  // Route content hydrates client-side (routes are ssr:false), so block until
  // the token card renders rather than racing networkidle.
  await page
    .waitForFunction(
      () => document.body.innerText.includes('BROTHERHOOD — HD'),
      null,
      { timeout: 20000 },
    )
    .catch(() => {});
  const text = await page.evaluate(() => document.body.innerText);
  const url = page.url();

  const expectations = {
    'header brand': 'BrotherHood',
    'Manage tab list': 'ISSUE',
    'token card': 'BROTHERHOOD — HD',
  };

  console.log(`Loaded: ${url}\n`);
  for (const [label, needle] of Object.entries(expectations)) {
    const ok = text.includes(needle);
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`);
    if (!ok) failed = true;
  }
} finally {
  await launched.close();
}
process.exit(failed ? 1 : 0);
