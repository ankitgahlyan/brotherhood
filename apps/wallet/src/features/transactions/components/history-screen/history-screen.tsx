/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useEffect, useMemo, useState } from 'react';
import type { FC } from 'react';
import { RotateCw, AlertCircle, Inbox } from 'lucide-react';
import { useWalletStore } from '@demo/wallet-core';
import { useNavigate } from '@/core/routing';
import { cn } from '@/core/lib/utils';

import { ActivityList } from '../activity-list';
import { useTransactionRows } from '../../hooks/use-transaction-rows';
import { getJettonsImage } from '@/features/jettons/utils/jetton';

import { Button } from '@/core/components/ui/button';
import { NewLayout } from '@/core/components/shared/new-layout';
import { ScreenHeader } from '@/core/components/shared/screen-header';

const PAGE_SIZE = 15;

/** Full transaction history page: wallet-v2 Activity Feed with date pills, status badges, token filters, and inline navigation. */
export const HistoryScreen: FC = () => {
  const navigate = useNavigate();
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasLoadError, setHasLoadError] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'ALL' | string>('ALL');

  const { rows, hasMore } = useTransactionRows(limit, activeFilter);
  const loadEvents = useWalletStore((state) => state.loadEvents);
  const address = useWalletStore((state) => state.walletManagement.address);
  const rawEvents = useWalletStore((state) => state.walletManagement.events);
  const eventsByAddress = useWalletStore(
    (state) => state.walletManagement.eventsByAddress,
  );
  const userJettons = useWalletStore((state) => state.jettons.userJettons);
  const pendingTransactions = useWalletStore(
    (state) => state.walletManagement.pendingTransactions,
  );

  const availableTokens = useMemo(() => {
    const seen = new Set<string>();
    const tokens: Array<{ symbol: string; image?: string }> = [];
    for (const j of userJettons) {
      const sym = j.info?.symbol;
      if (sym && !seen.has(sym.toUpperCase())) {
        seen.add(sym.toUpperCase());
        tokens.push({ symbol: sym, image: getJettonsImage(j) });
      }
    }
    return tokens;
  }, [userJettons]);

  const isAddressEventsLoaded = Boolean(
    address && address in (eventsByAddress || {}),
  );

  const isSyncing = pendingTransactions.length > 0;
  const isInitialLoading =
    isRetrying ||
    (!hasLoadError && (!isAddressEventsLoaded || rawEvents === undefined));

  // On mount or address switch, load events if not yet fetched for this address
  useEffect(() => {
    if (!address || isAddressEventsLoaded) return;
    loadEvents(limit, 0, false).catch(() => setHasLoadError(true));
  }, [address, loadEvents, limit, isAddressEventsLoaded]);

  const handleFilterSelect = (filter: string) => {
    setActiveFilter(filter);
    if (address) {
      void loadEvents(limit, 0, true, filter === 'ALL' ? undefined : filter);
    }
  };

  const handleRetry = async () => {
    if (!address) return;
    setIsRetrying(true);
    setHasLoadError(false);
    try {
      await loadEvents(
        limit,
        0,
        true,
        activeFilter === 'ALL' ? undefined : activeFilter,
      );
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
        await loadEvents(
          nextLimit,
          0,
          true,
          activeFilter === 'ALL' ? undefined : activeFilter,
        );
      } finally {
        setIsLoadingMore(false);
      }
    }
  };

  const filterBar = (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-2 scrollbar-none">
      <button
        key="ALL"
        type="button"
        onClick={() => handleFilterSelect('ALL')}
        className={cn(
          'px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer',
          activeFilter === 'ALL'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground',
        )}
      >
        All
      </button>
      <button
        key="TON"
        type="button"
        onClick={() => handleFilterSelect('TON')}
        className={cn(
          'px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer',
          activeFilter === 'TON'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground',
        )}
      >
        TON
      </button>
      {availableTokens.map((token) => {
        const isSelected = activeFilter === token.symbol;
        return (
          <button
            key={token.symbol}
            type="button"
            onClick={() => handleFilterSelect(token.symbol)}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer',
              isSelected
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            {token.image && (
              <img
                src={token.image}
                alt={token.symbol}
                className="w-3.5 h-3.5 rounded-full object-cover"
              />
            )}
            <span>{token.symbol}</span>
          </button>
        );
      })}
    </div>
  );

  const renderContent = () => {
    if (isInitialLoading && (!rows || rows.length === 0)) {
      return (
        <div>
          {filterBar}
          <div className="py-24 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-9 h-9 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
            <p className="text-xs font-medium text-muted-foreground">
              Loading activity...
            </p>
          </div>
        </div>
      );
    }

    if (hasLoadError && (!rows || rows.length === 0)) {
      return (
        <div>
          {filterBar}
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
        </div>
      );
    }

    if (rows.length === 0) {
      return (
        <div>
          {filterBar}
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
        </div>
      );
    }

    return (
      <div className="space-y-4 pb-6">
        {filterBar}
        <ActivityList rows={rows} isSyncing={isSyncing} />

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
