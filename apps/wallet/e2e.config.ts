/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { config } from 'dotenv';
import { defineConfig, devices } from '@playwright/test';

config({ quiet: true });

const workersCount = process.env.WORKERS_COUNT
  ? parseInt(process.env.WORKERS_COUNT)
  : undefined;
const timeout = process.env.TIMEOUT ? parseInt(process.env.TIMEOUT) : 60_000;
const headless =
  process.env.ENABLE_HEADLESS === 'true'
    ? true
    : process.env.ENABLE_HEADLESS === 'false'
      ? false
      : undefined;

export default defineConfig({
  testDir: './e2e',
  timeout: timeout,
  expect: {
    timeout: timeout,
  },
  fullyParallel: true,
  reporter: [['list'], ['html', { open: 'never' }]],
  workers: workersCount,
  use: {
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    permissions: ['clipboard-read', 'clipboard-write'],
    launchOptions: {
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--no-first-run',
        '--disable-infobars',
        '--disable-blink-features=AutomationControlled',
        '--use-fake-ui-for-media-stream',
        '--disable-permissions-api',
      ],
    },
    headless: headless,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
  webServer: {
    command: 'bun run dev',
    url: 'http://localhost:3000/brotherhood/',
    reuseExistingServer: true,
  },
});
