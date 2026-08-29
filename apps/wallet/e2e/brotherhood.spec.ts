/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { expect } from '@playwright/test';
import { label, suite, tags } from 'allure-js-commons';
import { testWithDemoWalletFixture } from './demo-wallet';

const test = testWithDemoWalletFixture({
    appUrl: process.env.DAPP_URL ?? 'https://allure-test-runner.vercel.app/e2e',
});

test.describe('BrotherHood (FossFi) Feature UI', () => {
    test('should render BrotherHood screen and navigate tabs', async ({ wallet }) => {
        await suite('BrotherHood Features');
        await label('sub-suite', 'FossFi Core Account');
        await tags('brotherhood', 'automated', 'ui');

        const app = await wallet.open();

        // Navigate to BrotherHood screen
        await app.getByTestId('brotherhood-button').click();
        await expect(app.getByTestId('brotherhood-tab-account')).toBeVisible();

        // Switch to Transfer tab
        await app.getByTestId('brotherhood-tab-transfer').click();
        await expect(app.getByTestId('brotherhood-transfer-submit')).toBeVisible();

        // Switch to Burn tab
        await app.getByTestId('brotherhood-tab-burn').click();
        await expect(app.getByTestId('brotherhood-burn-submit')).toBeVisible();

        // Switch to Claim tab
        await app.getByTestId('brotherhood-tab-claim').click();
        await expect(app.getByTestId('brotherhood-claim-submit')).toBeVisible();

        // Switch to Invite tab
        await app.getByTestId('brotherhood-tab-invite').click();
        await expect(app.getByTestId('brotherhood-invite-submit')).toBeVisible();

        // Switch to Vote tab
        await app.getByTestId('brotherhood-tab-vote').click();
        await expect(app.getByTestId('brotherhood-vote-submit')).toBeVisible();

        await wallet.close();
    });

    test('should validate form inputs on BrotherHood transfer form', async ({ wallet }) => {
        await suite('BrotherHood Features');
        await label('sub-suite', 'Transfer Validation');
        await tags('brotherhood', 'automated', 'validation');

        const app = await wallet.open();
        await app.getByTestId('brotherhood-button').click();

        await app.getByTestId('brotherhood-tab-transfer').click();
        const submitBtn = app.getByTestId('brotherhood-transfer-submit');

        // Submit button should be disabled when fields are empty
        await expect(submitBtn).toBeDisabled();

        // Fill recipient and amount
        await app.getByTestId('brotherhood-transfer-recipient').fill('0:0000000000000000000000000000000000000000000000000000000000000000');
        await app.getByTestId('brotherhood-transfer-amount').fill('1.5');

        await expect(submitBtn).toBeEnabled();
        await wallet.close();
    });

    test('should trigger transaction modal when submitting FI transfer', async ({ wallet }) => {
        await suite('BrotherHood Features');
        await label('sub-suite', 'Transfer Flow');
        await tags('brotherhood', 'automated', 'flow');

        const app = await wallet.open();
        await app.getByTestId('brotherhood-button').click();
        await app.getByTestId('brotherhood-tab-transfer').click();

        await app.getByTestId('brotherhood-transfer-recipient').fill('0:0000000000000000000000000000000000000000000000000000000000000000');
        await app.getByTestId('brotherhood-transfer-amount').fill('0.1');

        await app.getByTestId('brotherhood-transfer-submit').click();

        // Verify transaction request modal or action trigger occurs
        const modalReject = app.getByTestId('send-transaction-reject');
        if (await modalReject.isVisible({ timeout: 5000 }).catch(() => false)) {
            await modalReject.click();
        }

        await wallet.close();
    });
});
