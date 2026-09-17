/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { FC } from 'react';
import { useStaking } from '@demo/wallet-core';

import { useStakingProviders } from '../../hooks/use-staking-providers';

import { formatLargeValue } from '@/core/utils';

interface StakingInfoProps {
  /** Ticker received from the current quote (stake → tsTON, unstake → GRAM). */
  receiveTicker?: string;
}

/** Read-only pool summary: APY, provider, instant-unstake liquidity and the quoted output. */
export const StakingInfo: FC<StakingInfoProps> = ({ receiveTicker }) => {
  const { providerInfo, providerId, currentQuote } = useStaking();
  const providers = useStakingProviders();
  const providerName =
    providers.find((provider) => provider.id === providerId)?.name ??
    'Tonstakers';

  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-secondary/60 border border-border p-4 text-sm">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">APY</span>
        <span className="font-semibold text-emerald-500">
          {providerInfo?.apy ? `${providerInfo.apy.toFixed(2)}%` : '—'}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Provider</span>
        <span className="font-medium capitalize text-foreground">
          {providerName}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Instant unstake available</span>
        <span className="font-medium text-foreground tabular-nums">
          {providerInfo?.instantUnstakeAvailable
            ? formatLargeValue(String(providerInfo.instantUnstakeAvailable), 4)
            : '0'}{' '}
          GRAM
        </span>
      </div>
      {currentQuote && (
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">You will receive</span>
          <span className="font-semibold text-foreground tabular-nums">
            {formatLargeValue(String(currentQuote.amountOut), 4)}
            {receiveTicker ? ` ${receiveTicker}` : ''}
          </span>
        </div>
      )}
    </div>
  );
};
