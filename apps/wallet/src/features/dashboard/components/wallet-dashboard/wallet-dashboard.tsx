/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { WalletCardCarousel } from '../wallet-card-carousel';
import { DashboardActions } from '../dashboard-actions';
import { DashboardAssets } from '../dashboard-assets';
import { NewLayout } from '@/core/components/shared/new-layout';
import { TransactionHistory } from '@/features/transactions';
import { UpgradeBanner } from '@/features/brotherhood';

export const WalletDashboard: React.FC = () => {
  return (
    <NewLayout>
      <div className="flex flex-col gap-4">
        <WalletCardCarousel />
        <UpgradeBanner />
        <DashboardActions />
        <DashboardAssets />
        {/* /<NftsCard /> */}
        <TransactionHistory />
      </div>
    </NewLayout>
  );
};
