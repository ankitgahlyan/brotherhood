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

test.describe('Lottery Game Feature UI', () => {
    test('should render Lottery screen and address input', async ({ wallet }) => {
        await suite('Lottery Game Features');
        await label('sub-suite', 'Lottery Dashboard');
        await tags('lottery', 'automated', 'ui');

        const app = await wallet.open();

        await app.getByTestId('lottery-button').click();
        await expect(app.getByTestId('lottery-address-input')).toBeVisible();

        await wallet.close();
    });

    test('should validate lottery address input and enable buttons', async ({ wallet }) => {
        await suite('Lottery Game Features');
        await label('sub-suite', 'Lottery Enter Validation');
        await tags('lottery', 'automated', 'validation');

        const app = await wallet.open();
        await app.getByTestId('lottery-button').click();

        const enterBtn = app.getByTestId('lottery-enter-button');
        await expect(enterBtn).toBeDisabled();

        await app.getByTestId('lottery-address-input').fill('0:0000000000000000000000000000000000000000000000000000000000000000');

        await expect(enterBtn).toBeEnabled();
        await wallet.close();
    });
});
