/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { useLastFetchTime } from '@/core/hooks/use-last-fetch-time';
import { useRefreshContractQueries } from '@/lib/brotherhood/queries';

export interface SyncStatusButtonProps {
  className?: string;
  showText?: boolean;
}

export const SyncStatusButton: React.FC<SyncStatusButtonProps> = ({
  className = '',
  showText = true,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { relativeTime, formattedTime } = useLastFetchTime();
  const refreshContractQueries = useRefreshContractQueries();

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      // Trigger wallet-core sync
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('brotherhood_manual_wallet_refresh'),
        );
      }
      // Force refresh all active queries
      await refreshContractQueries();
    } catch (err) {
      console.warn('[SyncStatusButton] Refresh failed:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary/80 hover:bg-secondary border border-border transition-colors text-xs text-muted-foreground hover:text-foreground cursor-pointer select-none ${className}`}
      onClick={handleRefresh}
      title={`Last fetch: ${formattedTime}. Click to fetch fresh data.`}
      role="button"
      tabIndex={0}
      aria-label={`Refresh data. Last updated ${relativeTime}`}
      data-testid="sync-status-refresh-button"
    >
      <RotateCcw
        className={`w-3.5 h-3.5 transition-transform text-foreground ${
          isRefreshing ? 'animate-spin text-primary' : ''
        }`}
      />
      {showText && (
        <span className="font-medium text-[11px] whitespace-nowrap">
          {isRefreshing ? 'Refreshing…' : relativeTime}
        </span>
      )}
    </div>
  );
};
