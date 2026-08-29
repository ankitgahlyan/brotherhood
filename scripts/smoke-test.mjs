/**
 * Headless smoke test for the BrotherHood Wallet app.
 *
 * Opens the app in headless Chromium (bundled via Playwright) and asserts the
 * welcome screen and wallet onboarding elements render.
 *
 *   node scripts/smoke-test.mjs [baseUrl]
 *
 * The default baseUrl is http://localhost:3000/brotherhood/. If no server is running,
 * it serves apps/wallet/dist locally.
 */
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const WALLET_DIST = join(ROOT, 'apps', 'wallet', 'dist');
const defaultPort = 3000;
const basePath = '/brotherhood/';

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

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json',
};

async function startStaticServer(port) {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      let reqPath = req.url?.split('?')[0] ?? '/';
      if (reqPath.startsWith(basePath)) {
        reqPath = reqPath.slice(basePath.length - 1);
      }
      let filePath = join(WALLET_DIST, reqPath);
      if (existsSync(filePath) && statSync(filePath).isDirectory()) {
        filePath = join(filePath, 'index.html');
      }
      if (!existsSync(filePath)) {
        filePath = join(WALLET_DIST, 'index.html');
      }

      try {
        const content = readFileSync(filePath);
        const ext = extname(filePath);
        res.setHeader('Content-Type', MIME_TYPES[ext] || 'application/octet-stream');
        res.writeHead(200);
        res.end(content);
      } catch {
        res.writeHead(404);
        res.end('Not Found');
      }
    });

    server.listen(port, () => {
      resolve(server);
    });
  });
}

let server = null;
let targetUrl = process.argv[2];

if (!targetUrl) {
  try {
    const check = await fetch('http://localhost:3000/brotherhood/').catch(() => null);
    if (!check) {
      server = await startStaticServer(defaultPort);
    }
  } catch {
    server = await startStaticServer(defaultPort);
  }
  targetUrl = `http://localhost:${defaultPort}${basePath}`;
}

const launched = await chromium.launch({ executablePath: findChrome() });
let failed = false;

try {
  const page = await launched.newPage();
  await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 60000 });

  // Wait for initial render of wallet onboarding screen
  await page
    .waitForFunction(
      () =>
        document.body.innerText.includes('Your TON wallet') ||
        document.body.innerText.includes('Create a new wallet') ||
        document.body.innerText.includes('Add an existing wallet'),
      null,
      { timeout: 20000 },
    )
    .catch(() => {});
  const text = await page.evaluate(() => document.body.innerText);
  const url = page.url();

  const expectations = {
    'welcome title': 'Your TON wallet',
    'create wallet button': 'Create a new wallet',
    'add existing wallet button': 'Add an existing wallet',
  };

  console.log(`Loaded: ${url}\n`);
  for (const [label, needle] of Object.entries(expectations)) {
    const ok = text.includes(needle);
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`);
    if (!ok) failed = true;
  }
} finally {
  await launched.close();
  if (server) {
    server.close();
  }
}

process.exit(failed ? 1 : 0);
