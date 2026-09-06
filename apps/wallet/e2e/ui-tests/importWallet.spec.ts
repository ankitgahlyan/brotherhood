/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import type { NetworkType } from '@demo/wallet-core';

import { testWithUIFixture } from './UITestFixture';
import { TEST_PASSWORD } from '../constants';

const test = testWithUIFixture();

// Test mnemonic - this should be a valid test mnemonic for e2e tests
const TEST_MNEMONIC = process.env.WALLET_MNEMONIC ?? '';

type InterfaceType = 'mnemonic' | 'signer';

interface ImportWalletTestCase {
  network: NetworkType;
  interfaceType: InterfaceType;
}

const testMatrix: ImportWalletTestCase[] = [
  // Mainnet combinations
  { network: 'mainnet', interfaceType: 'mnemonic' },
  { network: 'mainnet', interfaceType: 'signer' },
  // Testnet combinations
  { network: 'testnet', interfaceType: 'mnemonic' },
  { network: 'testnet', interfaceType: 'signer' },
];

/** Welcome → "Add wallet" → "Recovery phrase" → set a password → land on the import screen. */
async function openImportScreen(page: Page): Promise<void> {
  await page.getByTestId('welcome-add-wallet').click();
  await page.getByTestId('add-wallet-import').click();
  await page.getByTestId('password').fill(TEST_PASSWORD);
  await page.getByTestId('password-confirm').fill(TEST_PASSWORD);
  await page.getByTestId('password-submit').click();
  await page.getByTestId('paste-mnemonic').waitFor({ state: 'visible' });
}

test.describe('Import Wallet Flow', () => {
  test.beforeEach(async ({ page }) => {
    if (!TEST_MNEMONIC) {
      test.skip(true, 'WALLET_MNEMONIC environment variable is required');
    }
    await openImportScreen(page);
  });

  for (const testCase of testMatrix) {
    const testName = `Import wallet - ${testCase.network} / ${testCase.interfaceType}`;

    test(testName, async ({ page }) => {
      await page.getByTestId(`network-select-${testCase.network}`).click();
      await expect(
        page.getByTestId(`network-select-${testCase.network}`),
      ).toBeEnabled();

      await page
        .getByTestId(`interface-select-${testCase.interfaceType}`)
        .click();
      await expect(
        page.getByTestId(`interface-select-${testCase.interfaceType}`),
      ).toBeEnabled();

      // Paste the recovery phrase via the Paste button (reads the clipboard).
      await page.evaluate(async (mnemonic) => {
        await navigator.clipboard.writeText(mnemonic);
      }, TEST_MNEMONIC);
      await page.getByTestId('paste-mnemonic').click();

      await page.getByTestId('import-wallet-process').click();

      // The settings button only exists on the wallet dashboard.
      await expect(page.getByTestId('wallet-menu')).toBeVisible();
    });
  }
});

test.describe('Import Wallet - Validation', () => {
  test.beforeEach(async ({ page }) => {
    await openImportScreen(page);
  });

  test('Import button is disabled with no mnemonic', async ({ page }) => {
    await expect(page.getByTestId('import-wallet-process')).toBeDisabled();
  });

  test('Import button is disabled with less than 12 words', async ({
    page,
  }) => {
    const testWords =
      'word1 word2 word3 word4 word5 word6 word7 word8 word9 word10';
    await page.evaluate(async (mnemonic) => {
      await navigator.clipboard.writeText(mnemonic);
    }, testWords);

    await page.getByTestId('paste-mnemonic').click();

    await expect(page.getByTestId('import-wallet-process')).toBeDisabled();
  });

  test('Clear button clears all words', async ({ page }) => {
    if (!TEST_MNEMONIC) {
      test.skip(true, 'WALLET_MNEMONIC environment variable is required');
    }

    await page.evaluate(async (mnemonic) => {
      await navigator.clipboard.writeText(mnemonic);
    }, TEST_MNEMONIC);
    await page.getByTestId('paste-mnemonic').click();

    await page.getByTestId('clear-mnemonic').click();

    await expect(page.getByTestId('word-count')).toHaveText('0/24 words');
    await expect(page.getByTestId('import-wallet-process')).toBeDisabled();
  });
});
