import { chromium } from 'playwright';
import { existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

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

const targetUrl = 'http://localhost:3000/brotherhood/';
const consoleMessages = [];
const pageErrors = [];

console.log(`Starting interactive audit on ${targetUrl}...`);

const browser = await chromium.launch({
  executablePath: findChrome(),
  headless: true,
});

try {
  const context = await browser.newContext({
    viewport: { width: 400, height: 800 },
  });
  const page = await context.newPage();

  page.on('console', (msg) => {
    const type = msg.type();
    const text = msg.text();
    consoleMessages.push({ type, text });
    if (type === 'error') {
      console.error(`[BROWSER ERROR] ${text}`);
    } else if (type === 'warn') {
      console.warn(`[BROWSER WARN] ${text}`);
    } else {
      console.log(`[BROWSER ${type.toUpperCase()}] ${text}`);
    }
  });

  page.on('pageerror', (err) => {
    pageErrors.push(err);
    console.error(`[BROWSER UNHANDLED EXCEPTION]`, err);
  });

  // 1. Initial Load
  console.log('\n--- Step 1: Loading Initial Page ---');
  await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(1000);

  const initialTheme = await page.evaluate(() => ({
    className: document.documentElement.className,
    dataTheme: document.documentElement.getAttribute('data-theme'),
    colorSchemeMeta: document.querySelector('meta[name="color-scheme"]')?.getAttribute('content'),
    stored: localStorage.getItem('brotherhood-theme'),
  }));
  console.log('Initial Theme State:', initialTheme);

  // 2. Onboarding Flow: Set Password & Create Wallet
  console.log('\n--- Step 2: Onboarding Flow (Password Setup & Wallet Creation) ---');
  const createBtn = page.getByRole('button', { name: /create a new wallet/i }).or(page.locator('[data-testid="welcome-create"]'));
  if (await createBtn.isVisible()) {
    console.log('Clicking "Create a new wallet"...');
    await createBtn.click();
    await page.waitForTimeout(800);
  }

  // Setup Password screen
  const passwordInput = page.locator('[data-testid="password"]');
  const passwordConfirmInput = page.locator('[data-testid="password-confirm"]');
  if (await passwordInput.isVisible()) {
    console.log('Entering password...');
    await passwordInput.fill('Password123!');
    await passwordConfirmInput.fill('Password123!');
    const submitPassBtn = page.locator('[data-testid="password-submit"]');
    await submitPassBtn.click();
    await page.waitForTimeout(1000);
  }

  // Reveal Mnemonic
  const revealBtn = page.locator('[data-testid="reveal-mnemonic"]');
  if (await revealBtn.isVisible()) {
    console.log('Revealing recovery phrase...');
    await revealBtn.click();
    await page.waitForTimeout(500);
  }

  const continueBtn = page.locator('[data-testid="create-wallet-confirm"]');
  if (await continueBtn.isVisible()) {
    console.log('Clicking Continue on recovery phrase screen...');
    await continueBtn.click();
    await page.waitForTimeout(800);
  }

  // Hold-to-sign confirmation button
  const holdBtn = page.locator('[data-testid="save-phrase-hold"]');
  if (await holdBtn.isVisible()) {
    console.log('Holding Save Phrase confirmation button...');
    await holdBtn.dispatchEvent('mousedown');
    await page.waitForTimeout(2000);
    await holdBtn.dispatchEvent('mouseup').catch(() => {});
    await page.waitForURL('**/wallet', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1000);
  }

  // 3. Verify Dashboard
  console.log('\n--- Step 3: Dashboard Verification ---');
  console.log('Current URL:', page.url());
  await page.waitForSelector('[data-testid="balance-total"], [data-testid="header-settings-btn"], [data-testid="header-theme-toggle"]', { timeout: 10000 }).catch(() => {});

  // 4. Test Theme Quick Toggle in Header
  console.log('\n--- Step 4: Testing Quick Theme Toggle in Header ---');
  const themeToggle = page.locator('[data-testid="header-theme-toggle"]');
  if (await themeToggle.isVisible()) {
    console.log('Quick Theme Toggle found. Initial active theme:', await page.evaluate(() => document.documentElement.getAttribute('data-theme')));
    
    // Toggle 1: Midnight Dark
    await themeToggle.click();
    await page.waitForTimeout(300);
    const theme1 = await page.evaluate(() => ({
      class: document.documentElement.className,
      dataTheme: document.documentElement.getAttribute('data-theme'),
      stored: localStorage.getItem('brotherhood-theme'),
    }));
    console.log('After 1st toggle (Dark):', theme1);

    // Toggle 2: OLED
    await themeToggle.click();
    await page.waitForTimeout(300);
    const theme2 = await page.evaluate(() => ({
      class: document.documentElement.className,
      dataTheme: document.documentElement.getAttribute('data-theme'),
      stored: localStorage.getItem('brotherhood-theme'),
    }));
    console.log('After 2nd toggle (OLED):', theme2);

    // Toggle 3: Light
    await themeToggle.click();
    await page.waitForTimeout(300);
    const theme3 = await page.evaluate(() => ({
      class: document.documentElement.className,
      dataTheme: document.documentElement.getAttribute('data-theme'),
      stored: localStorage.getItem('brotherhood-theme'),
    }));
    console.log('After 3rd toggle (Light):', theme3);
  } else {
    console.warn('Quick Theme Toggle not visible on header');
  }

  // 5. Test Settings Appearance Selector
  console.log('\n--- Step 5: Testing Settings Appearance Selector ---');
  const settingsBtn = page.locator('[data-testid="wallet-menu"]').or(page.locator('[data-testid="header-settings-btn"]'));
  if (await settingsBtn.isVisible()) {
    console.log('Opening Settings Modal...');
    await settingsBtn.click();
    await page.waitForTimeout(500);

    const themeModes = ['system', 'light', 'dark', 'oled'];
    for (const mode of themeModes) {
      const modeBtn = page.locator(`[data-testid="theme-option-${mode}"]`);
      if (await modeBtn.isVisible()) {
        console.log(`Selecting theme mode: ${mode}...`);
        await modeBtn.click();
        await page.waitForTimeout(200);
        const resolved = await page.evaluate(() => ({
          theme: localStorage.getItem('brotherhood-theme'),
          dataTheme: document.documentElement.getAttribute('data-theme'),
          class: document.documentElement.className,
        }));
        console.log(`  DOM state for "${mode}":`, resolved);
      }
    }

    // Close Settings
    const closeSettings = page.locator('button[aria-label="Close"]').or(page.getByRole('button', { name: /close/i }));
    if (await closeSettings.isVisible()) {
      await closeSettings.first().click().catch(() => {});
      await page.waitForTimeout(400);
    }
  }

  // 6. Test Receive Modal
  console.log('\n--- Step 6: Testing Receive Modal ---');
  const receiveBtn = page.locator('button:has-text("Receive")').or(page.locator('[data-testid="dashboard-action-receive"]'));
  if (await receiveBtn.isVisible()) {
    console.log('Opening Receive Modal...');
    await receiveBtn.first().click();
    await page.waitForTimeout(600);

    // Switch formats: user-friendly, bounceable, non-bounceable
    const formatButtons = page.locator('button:has-text("UQ"), button:has-text("EQ"), button:has-text("0Q"), button:has-text("User-friendly"), button:has-text("Bounceable")');
    const fCount = await formatButtons.count();
    if (fCount > 0) {
      for (let i = 0; i < fCount; i++) {
        await formatButtons.nth(i).click().catch(() => {});
        await page.waitForTimeout(150);
      }
    }

    const closeReceive = page.locator('button[aria-label="Close"]').or(page.getByRole('button', { name: /close/i }));
    if (await closeReceive.isVisible()) {
      await closeReceive.first().click().catch(() => {});
      await page.waitForTimeout(400);
    }
  }

  // 7. Client-side Navigation Through All Feature Screens
  console.log('\n--- Step 7: Testing Client-side Feature Navigation & Tab Interactions ---');
  const featureRoutes = [
    '/wallet/assets',
    '/wallet/nft',
    '/wallet/history',
    '/send',
    '/swap',
    '/staking',
    '/brotherhood',
    '/personal-jetton',
    '/dao',
    '/lottery',
    '/city-network',
    '/wallet',
  ];

  for (const route of featureRoutes) {
    console.log(`Navigating client-side to ${route}...`);
    await page.evaluate((r) => {
      window.history.pushState({}, '', `/brotherhood${r}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }, route);
    await page.waitForTimeout(600);

    // Click interactive tabs if present
    const tabs = page.locator('button[data-testid^="personal-tab-"], button[data-testid^="dao-tab-"], button[data-testid^="brotherhood-tab-"], button[data-testid^="city-tab-"]');
    const tabCount = await tabs.count();
    if (tabCount > 0) {
      console.log(`  Found ${tabCount} feature tabs, clicking...`);
      for (let i = 0; i < Math.min(tabCount, 6); i++) {
        await tabs.nth(i).click().catch(() => {});
        await page.waitForTimeout(150);
      }
    }
  }

  // 8. Test Reload Theme Persistence (OLED mode)
  console.log('\n--- Step 8: Testing Reload Theme Persistence ---');
  await page.evaluate(() => localStorage.setItem('brotherhood-theme', 'oled'));
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  const reloadedTheme = await page.evaluate(() => ({
    class: document.documentElement.className,
    dataTheme: document.documentElement.getAttribute('data-theme'),
    colorScheme: document.querySelector('meta[name="color-scheme"]')?.getAttribute('content'),
  }));
  console.log('Reloaded Theme State (OLED):', reloadedTheme);

} finally {
  await browser.close();
}

console.log('\n================ AUDIT SUMMARY ================');
console.log(`Total Console Messages Captured: ${consoleMessages.length}`);
console.log(`Total Page Errors / Unhandled Exceptions: ${pageErrors.length}`);

if (pageErrors.length > 0) {
  console.error('FAIL: Unhandled page errors detected:');
  pageErrors.forEach((e) => console.error(e));
  process.exit(1);
} else {
  console.log('SUCCESS: Zero runtime page errors detected during interactive audit!');
  process.exit(0);
}
