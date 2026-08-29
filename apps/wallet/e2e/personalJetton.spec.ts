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

test.describe('Personal Jetton Feature UI', () => {
    test('should render Personal Jetton screen and navigate tabs', async ({ wallet }) => {
        await suite('Personal Jetton Features');
        await label('sub-suite', 'Personal Token Economy');
        await tags('personal-jetton', 'automated', 'ui');

        const app = await wallet.open();

        await app.getByTestId('personal-jetton-button').click();
        await expect(app.getByTestId('personal-tab-info')).toBeVisible();

        await app.getByTestId('personal-tab-deploy').click();
        await expect(app.getByTestId('personal-deploy-submit')).toBeVisible();

        await app.getByTestId('personal-tab-mint').click();
        await expect(app.getByTestId('personal-mint-submit')).toBeVisible();

        await app.getByTestId('personal-tab-burn').click();
        await expect(app.getByTestId('personal-burn-submit')).toBeVisible();

        await wallet.close();
    });

    test('should validate deploy form inputs', async ({ wallet }) => {
        await suite('Personal Jetton Features');
        await label('sub-suite', 'Deploy Validation');
        await tags('personal-jetton', 'automated', 'validation');

        const app = await wallet.open();
        await app.getByTestId('personal-jetton-button').click();
        await app.getByTestId('personal-tab-deploy').click();

        const submitBtn = app.getByTestId('personal-deploy-submit');
        await expect(submitBtn).toBeDisabled();

        await app.getByTestId('personal-deploy-name').fill('Alice Credit Token');
        await app.getByTestId('personal-deploy-symbol').fill('ACT');

        await expect(submitBtn).toBeEnabled();
        await wallet.close();
    });

    test('should validate mint form inputs', async ({ wallet }) => {
        await suite('Personal Jetton Features');
        await label('sub-suite', 'Mint Validation');
        await tags('personal-jetton', 'automated', 'validation');

        const app = await wallet.open();
        await app.getByTestId('personal-jetton-button').click();
        await app.getByTestId('personal-tab-mint').click();

        const submitBtn = app.getByTestId('personal-mint-submit');
        await expect(submitBtn).toBeDisabled();

        await app.getByTestId('personal-mint-minter').fill('0:0000000000000000000000000000000000000000000000000000000000000000');
        await app.getByTestId('personal-mint-recipient').fill('0:0000000000000000000000000000000000000000000000000000000000000000');
        await app.getByTestId('personal-mint-amount').fill('100');

        await expect(submitBtn).toBeEnabled();
        await wallet.close();
    });
});
