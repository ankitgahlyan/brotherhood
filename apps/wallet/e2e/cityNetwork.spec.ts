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

test.describe('City & Location Registry Feature UI', () => {
    test('should render City Network screen and navigate tabs', async ({ wallet }) => {
        await suite('City Network Features');
        await label('sub-suite', 'City Registry');
        await tags('city-network', 'automated', 'ui');

        const app = await wallet.open();

        await app.getByTestId('city-network-button').click();
        await expect(app.getByTestId('city-tab-cities')).toBeVisible();

        await app.getByTestId('city-tab-city-detail').click();
        await expect(app.getByTestId('city-citymap-input')).toBeVisible();

        await app.getByTestId('city-tab-register-city').click();
        await expect(app.getByTestId('city-register-city-submit')).toBeVisible();

        await app.getByTestId('city-tab-manage-member').click();
        await expect(app.getByTestId('city-manage-register-submit')).toBeVisible();

        await wallet.close();
    });

    test('should validate register city inputs', async ({ wallet }) => {
        await suite('City Network Features');
        await label('sub-suite', 'Register City Validation');
        await tags('city-network', 'automated', 'validation');

        const app = await wallet.open();
        await app.getByTestId('city-network-button').click();
        await app.getByTestId('city-tab-register-city').click();

        const submitBtn = app.getByTestId('city-register-city-submit');
        await expect(submitBtn).toBeDisabled();

        await app.getByTestId('city-register-location-addr').fill('0:0000000000000000000000000000000000000000000000000000000000000000');
        await app.getByTestId('city-register-city-name').fill('Tokyo');

        await expect(submitBtn).toBeEnabled();
        await wallet.close();
    });
});
