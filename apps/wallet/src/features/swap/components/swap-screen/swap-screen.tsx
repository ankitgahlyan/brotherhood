/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { FC } from 'react';
import { useNavigate } from '@/core/routing';

import { SwapInterface } from '../swap-interface';

import { NewLayout } from '@/core/components/shared/new-layout';
import { ScreenHeader } from '@/core/components/shared/screen-header';

export const Swap: FC = () => {
  const navigate = useNavigate();

  return (
    <NewLayout
      header={
        <ScreenHeader
          title="Ecosystem Swap"
          onBack={() => navigate('/wallet')}
        />
      }
    >
      <SwapInterface />
    </NewLayout>
  );
};
