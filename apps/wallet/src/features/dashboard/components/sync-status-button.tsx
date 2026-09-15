/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { RotateCcw, Check } from 'lucide-react';
import { useLastFetchTime } from '@/core/hooks/use-last-fetch-time';
import { useRefreshContractQueries } from '@/lib/brotherhood/queries';
import { isOnline } from '@/core/lib/network-status';
import { useThrottledRefresh } from '@/core/components/ui/refresh-button';

export interface SyncStatusButtonProps {
  className?: string;
  showText?: boolean;
}

export const SyncStatusButton: React.FC<SyncStatusButtonProps> = ({
  className = '',
  showText = true,
}) => {
  const { relativeTime, formattedTime } = useLastFetchTime();
  const refreshContractQueries = useRefreshContractQueries();

  const { isRefreshing, isSuccess, disabled, triggerRefresh } =
    useThrottledRefresh({
      onRefresh: async () => {
        if (!isOnline()) return;
        // Trigger wallet-core sync
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('brotherhood_manual_wallet_refresh'),
          );
        }
        // Force refresh all active queries
        await refreshContractQueries();
      },
      cooldownMs: 3500,
      minSpinMs: 600,
      successDurationMs: 2000,
    });

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary/80 hover:bg-secondary border border-border transition-colors text-xs text-muted-foreground hover:text-foreground cursor-pointer select-none ${
        disabled ? 'cursor-not-allowed opacity-80' : ''
      } ${
        isSuccess
          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600'
          : ''
      } ${className}`}
      onClick={triggerRefresh}
      title={
        isSuccess
          ? 'Data updated successfully'
          : `Last fetch: ${formattedTime}. Click to fetch fresh data.`
      }
      role="button"
      tabIndex={0}
      aria-label={`Refresh data. Last updated ${relativeTime}`}
      data-testid="sync-status-refresh-button"
    >
      {isSuccess ? (
        <Check className="w-3.5 h-3.5 transition-transform text-emerald-500 shrink-0" />
      ) : (
        <RotateCcw
          className={`w-3.5 h-3.5 transition-transform text-foreground shrink-0 ${
            isRefreshing ? 'animate-spin text-primary' : ''
          }`}
        />
      )}
      {showText && (
        <span className="font-medium text-[11px] whitespace-nowrap">
          {isRefreshing ? 'Refreshing…' : isSuccess ? 'Updated' : relativeTime}
        </span>
      )}
    </div>
  );
};
