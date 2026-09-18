/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useEffect, useState, useMemo } from 'react';
import type { FC } from 'react';
import { RotateCw, AlertCircle, Inbox } from 'lucide-react';
import { useWalletStore } from '@demo/wallet-core';
import { useNavigate } from '@/core/routing';

import { TransactionRow } from '../transaction-row';
import { DateHeader } from '../date-header';
import { useTransactionRows } from '../../hooks/use-transaction-rows';
import type { TransactionRowModel } from '../../utils/map-transaction-row';

import { Button } from '@/core/components/ui/button';
import { NewLayout } from '@/core/components/shared/new-layout';
import { ScreenHeader } from '@/core/components/shared/screen-header';

const PAGE_SIZE = 25;

interface DayGroup {
  dayStart: number;
  rows: TransactionRowModel[];
}

function getDayStartSeconds(tsSeconds: number): number {
  const d = new Date(tsSeconds * 1000);
  d.setHours(0, 0, 0, 0);
  return Math.floor(d.getTime() / 1000);
}

/** Full transaction history page: wallet-v2 Activity Feed with date pills, status badges, and inline navigation. */
export const HistoryScreen: FC = () => {
  const navigate = useNavigate();
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasLoadError, setHasLoadError] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const { rows, hasMore } = useTransactionRows(limit);
  const loadEvents = useWalletStore((state) => state.loadEvents);
  const address = useWalletStore((state) => state.walletManagement.address);
  const rawEvents = useWalletStore((state) => state.walletManagement.events);
  const pendingTransactions = useWalletStore(
    (state) => state.walletManagement.pendingTransactions,
  );

  const isSyncing = pendingTransactions.length > 0;
  const isInitialLoading =
    (rawEvents === undefined || isRetrying) && !hasLoadError;

  // On mount, load events if not yet fetched
  useEffect(() => {
    if (!address) return;
    if (rawEvents === undefined) {
      loadEvents(limit, 0, true).catch(() => setHasLoadError(true));
    }
  }, [address, loadEvents, limit, rawEvents]);

  const handleRetry = async () => {
    if (!address) return;
    setIsRetrying(true);
    setHasLoadError(false);
    try {
      await loadEvents(limit, 0, true);
    } catch {
      setHasLoadError(true);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleLoadMore = async () => {
    if (isLoadingMore) return;
    const nextLimit = limit + PAGE_SIZE;
    setLimit(nextLimit);
    if (address) {
      setIsLoadingMore(true);
      try {
        await loadEvents(nextLimit, 0, true);
      } finally {
        setIsLoadingMore(false);
      }
    }
  };

  // Group rows chronologically by day
  const dayGroups = useMemo<DayGroup[]>(() => {
    if (!rows || rows.length === 0) return [];

    const groups: DayGroup[] = [];
    let currentGroup: DayGroup | null = null;

    for (const row of rows) {
      const dayStart = getDayStartSeconds(row.timestamp || 0);
      if (!currentGroup || currentGroup.dayStart !== dayStart) {
        currentGroup = { dayStart, rows: [] };
        groups.push(currentGroup);
      }
      currentGroup.rows.push(row);
    }

    return groups;
  }, [rows]);

  const renderContent = () => {
    if (isInitialLoading && (!rows || rows.length === 0)) {
      return (
        <div className="py-24 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-9 h-9 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          <p className="text-xs font-medium text-muted-foreground">
            Loading activity...
          </p>
        </div>
      );
    }

    if (hasLoadError && (!rows || rows.length === 0)) {
      return (
        <div className="py-20 flex flex-col items-center justify-center text-center px-4">
          <div className="w-14 h-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-3">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-foreground">
            Activity Failed to Load
          </h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            We couldn't retrieve your recent transaction activity.
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRetry}
            className="mt-4 flex items-center gap-1.5"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </Button>
        </div>
      );
    }

    if (rows.length === 0) {
      return (
        <div className="py-20 flex flex-col items-center justify-center text-center px-4">
          <div className="w-16 h-16 rounded-3xl bg-secondary/80 text-muted-foreground flex items-center justify-center mb-3 border border-border/60 shadow-inner">
            <Inbox className="w-8 h-8 opacity-60" />
          </div>
          <h3 className="text-base font-bold text-foreground">No Activity</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            Transactions will appear here once you send, receive, or interact
            with contracts.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4 pb-6">
        {dayGroups.map((group, groupIndex) => (
          <div key={group.dayStart} className="space-y-1.5">
            <DateHeader
              timestamp={group.dayStart}
              isUpdating={groupIndex === 0 && isSyncing}
            />
            <div className="bg-card/60 backdrop-blur-xs rounded-2xl border border-border/60 divide-y divide-border/40 overflow-hidden shadow-2xs">
              {group.rows.map((row) => (
                <TransactionRow key={row.id} {...row} />
              ))}
            </div>
          </div>
        ))}

        {hasMore && (
          <div className="mt-6 flex justify-center pb-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="flex items-center gap-2 px-6"
            >
              {isLoadingMore && (
                <span className="w-3.5 h-3.5 rounded-full border-2 border-muted-foreground/30 border-t-foreground animate-spin" />
              )}
              <span>{isLoadingMore ? 'Loading...' : 'Load more'}</span>
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <NewLayout
      header={
        <ScreenHeader title="History" onBack={() => navigate('/wallet')} />
      }
    >
      {renderContent()}
    </NewLayout>
  );
};
