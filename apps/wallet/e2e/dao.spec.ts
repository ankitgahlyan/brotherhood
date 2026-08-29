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

test.describe('DAO Governance Feature UI', () => {
    test('should render DAO screen and navigate tabs', async ({ wallet }) => {
        await suite('DAO Governance Features');
        await label('sub-suite', 'Proposals & Voting');
        await tags('dao', 'automated', 'ui');

        const app = await wallet.open();

        await app.getByTestId('dao-button').click();
        await expect(app.getByTestId('dao-address-input')).toBeVisible();

        await app.getByTestId('dao-tab-submit').click();
        await expect(app.getByTestId('dao-submit-proposal-btn')).toBeVisible();

        await app.getByTestId('dao-tab-vote').click();
        await expect(app.getByTestId('dao-vote-submit-btn')).toBeVisible();

        await wallet.close();
    });

    test('should validate voting form inputs', async ({ wallet }) => {
        await suite('DAO Governance Features');
        await label('sub-suite', 'Vote Validation');
        await tags('dao', 'automated', 'validation');

        const app = await wallet.open();
        await app.getByTestId('dao-button').click();
        await app.getByTestId('dao-tab-vote').click();

        const submitBtn = app.getByTestId('dao-vote-submit-btn');
        await expect(submitBtn).toBeDisabled();

        await app.getByTestId('dao-address-input').fill('0:0000000000000000000000000000000000000000000000000000000000000000');
        await app.getByTestId('dao-vote-proposal-id').fill('1');

        await expect(submitBtn).toBeEnabled();
        await wallet.close();
    });

    test('should validate submit proposal form inputs', async ({ wallet }) => {
        await suite('DAO Governance Features');
        await label('sub-suite', 'Proposal Submit Validation');
        await tags('dao', 'automated', 'validation');

        const app = await wallet.open();
        await app.getByTestId('dao-button').click();
        await app.getByTestId('dao-tab-submit').click();

        const submitBtn = app.getByTestId('dao-submit-proposal-btn');
        await expect(submitBtn).toBeDisabled();

        await app.getByTestId('dao-address-input').fill('0:0000000000000000000000000000000000000000000000000000000000000000');

        await expect(submitBtn).toBeEnabled();
        await wallet.close();
    });
});
