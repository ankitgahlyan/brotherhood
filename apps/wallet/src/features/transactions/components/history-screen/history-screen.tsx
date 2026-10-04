/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { FC } from 'react';
import { RotateCw, AlertCircle, Inbox, BadgeCheck } from 'lucide-react';
import { Address } from '@ton/core';
import { useActiveJettons, useWalletStore } from '@demo/wallet-core';
import { useNavigate } from '@/core/routing';
import { cn } from '@/core/lib/utils';
import {
  BRO_TREASURY_ADDRESS,
  network as defaultNetwork,
} from '@/lib/brotherhood/config';
import { getFiWalletAddress, isZeroAddress } from '@/lib/brotherhood/ton';
import {
  useFiMinterState,
  useFiWalletState,
  usePersonalMinterDetails,
} from '@/lib/brotherhood/queries';
import { parseOnchainMetadataCell } from '@/lib/brotherhood/jettonContent';
import { isFiJetton } from '@/features/jettons';
import { assetUrl, normalizeAddress } from '@/core/utils';

import { ActivityList } from '../activity-list';
import { useTransactionRows } from '../../hooks/use-transaction-rows';
import { getJettonsImage } from '@/features/jettons/utils/jetton';

import { Button } from '@/core/components/ui/button';
import { FallbackImage } from '@/core/components/ui/fallback-image';
import { RefreshButton } from '@/core/components/ui/refresh-button';
import { NewLayout } from '@/core/components/shared/new-layout';
import { ScreenHeader } from '@/core/components/shared/screen-header';
import { SwipeableSubTabs } from '@/core/components/shared/swipeable-sub-tabs';

const PAGE_SIZE = 20;

/** Full transaction history page: wallet-v2 Activity Feed with date pills, status badges, local category/token filters, and on-demand trace loading. */
export const HistoryScreen: FC = () => {
  const navigate = useNavigate();
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasLoadError, setHasLoadError] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'CONTRACT' | string>(
    'ALL',
  );
  const filterBarRef = useRef<HTMLDivElement>(null);

  const { rows, allRows, hasMore } = useTransactionRows(limit, activeFilter);
  const loadEvents = useWalletStore((state) => state.loadEvents);
  const setAssociatedAddresses = useWalletStore(
    (state) => state.setAssociatedAddresses,
  );
  const address = useWalletStore((state) => state.walletManagement.address);
  const savedWallets = useWalletStore(
    (state) => state.walletManagement.savedWallets,
  );
  const activeWalletId = useWalletStore(
    (state) => state.walletManagement.activeWalletId,
  );
  const activeWallet = savedWallets.find((w) => w.id === activeWalletId);
  const net =
    (activeWallet?.network ?? defaultNetwork) === 'mainnet'
      ? 'mainnet'
      : 'testnet';

  const eventsByAddress = useWalletStore(
    (state) => state.walletManagement.eventsByAddress,
  );
  const eventsFetchedInSessionByAddress = useWalletStore(
    (state) => state.walletManagement.eventsFetchedInSessionByAddress,
  );
  const eventsStaleByAddress = useWalletStore(
    (state) => state.walletManagement.eventsStaleByAddress,
  );
  const isLoadingEvents = useWalletStore(
    (state) => state.walletManagement.isLoadingEvents,
  );
  const isWalletKitInitialized = useWalletStore(
    (state) => state.walletCore.isWalletKitInitialized,
  );
  const activeJettons = useActiveJettons();
  const pendingTransactions = useWalletStore(
    (state) => state.walletManagement.pendingTransactions,
  );

  // Resolve FI metadata & Admin PT minter for dynamic FI symbol + verified green tick
  const fiMinterState = useFiMinterState(true, net);
  const fiMetadataCell = fiMinterState.data?.metadata;
  const fiAdminAddr = fiMinterState.data?.adminAddress;
  const fiOnchainMeta = useMemo(
    () => parseOnchainMetadataCell(fiMetadataCell),
    [fiMetadataCell],
  );
  const fiSymbol = fiOnchainMeta.symbol?.trim() || 'FI';
  const fiImage = fiOnchainMeta.image?.trim() || assetUrl('fi.svg');

  const adminOwnerAddress = useMemo(() => {
    if (fiAdminAddr && !isZeroAddress(fiAdminAddr)) {
      return fiAdminAddr;
    }
    try {
      return Address.parse(BRO_TREASURY_ADDRESS);
    } catch {
      return null;
    }
  }, [fiAdminAddr]);
  const adminFiWalletState = useFiWalletState(adminOwnerAddress, net);
  const adminPersonalMinterRaw =
    adminFiWalletState.data?.addresses?.ref?.trustedJettonAddrs?.ref
      ?.personalJettonMinter ?? null;
  const adminPersonalMinterAddr = useMemo(() => {
    if (!adminPersonalMinterRaw || isZeroAddress(adminPersonalMinterRaw)) {
      return null;
    }
    return adminPersonalMinterRaw;
  }, [adminPersonalMinterRaw]);
  const adminPtDetails = usePersonalMinterDetails(
    adminPersonalMinterAddr,
    Boolean(adminPersonalMinterAddr),
    net,
  );
  const adminPtSymbol = adminPtDetails.data?.metadata?.symbol?.trim() || null;
  const adminPtMinterNorm = useMemo(() => {
    if (!adminPersonalMinterAddr) return null;
    const rawStr = adminPersonalMinterAddr.toString();
    return normalizeAddress(rawStr) || rawStr;
  }, [adminPersonalMinterAddr]);

  // Derive deterministic FiWallet address for the current wallet so history fetches always include it
  const extraAddresses = useMemo<string[] | undefined>(() => {
    if (!address) return undefined;
    try {
      const fiWallet = getFiWalletAddress(
        Address.parse(address),
        net,
      ).toString();
      return [fiWallet];
    } catch {
      return undefined;
    }
  }, [address, net]);

  useEffect(() => {
    if (address && extraAddresses && extraAddresses.length > 0) {
      setAssociatedAddresses(address, extraAddresses);
    }
  }, [address, extraAddresses, setAssociatedAddresses]);

  const availableTokens = useMemo(() => {
    const seen = new Set<string>(['TON', 'GRAM']);
    const tokens: Array<{
      symbol: string;
      image?: string;
      isVerified?: boolean;
    }> = [];
    for (const j of activeJettons) {
      const isFi = isFiJetton(j);
      const sym = isFi ? fiSymbol : j.info?.symbol?.trim();
      const normAddr = normalizeAddress(j.address) || j.address;
      const isAdminPt =
        Boolean(adminPtMinterNorm && normAddr === adminPtMinterNorm) ||
        Boolean(
          adminPtSymbol && sym?.toUpperCase() === adminPtSymbol.toUpperCase(),
        );
      if (sym && !seen.has(sym.toUpperCase())) {
        seen.add(sym.toUpperCase());
        if (isFi) seen.add('FI');
        tokens.push({
          symbol: sym,
          image: isFi ? fiImage : getJettonsImage(j),
          isVerified: isFi || isAdminPt,
        });
      }
    }
    for (const row of allRows) {
      const rowTokens =
        row.tokens && row.tokens.length > 0
          ? row.tokens
          : row.symbol
            ? [row.symbol]
            : [];
      for (const sym of rowTokens) {
        const rawClean = sym?.trim();
        if (!rawClean) continue;
        const isFi =
          rawClean.toUpperCase() === 'FI' ||
          rawClean.toUpperCase() === fiSymbol.toUpperCase();
        const clean = isFi ? fiSymbol : rawClean;
        const isAdminPt = Boolean(
          adminPtSymbol && clean.toUpperCase() === adminPtSymbol.toUpperCase(),
        );
        if (!seen.has(clean.toUpperCase())) {
          seen.add(clean.toUpperCase());
          if (isFi) seen.add('FI');
          tokens.push({
            symbol: clean,
            image: isFi ? fiImage : undefined,
            isVerified: isFi || isAdminPt,
          });
        }
      }
    }
    return tokens;
  }, [
    activeJettons,
    allRows,
    fiSymbol,
    fiImage,
    adminPtMinterNorm,
    adminPtSymbol,
  ]);

  const categoryTabs = useMemo(
    () => ['ALL', 'CONTRACT', 'TON', ...availableTokens.map((t) => t.symbol)],
    [availableTokens],
  );

  // Auto-scroll active filter pill into view when swiped or clicked
  useEffect(() => {
    const container = filterBarRef.current;
    if (!container) return;
    const activeBtn = container.querySelector<HTMLElement>(
      `[data-filter-pill="${CSS.escape(activeFilter)}"]`,
    );
    if (activeBtn && typeof activeBtn.scrollIntoView === 'function') {
      activeBtn.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [activeFilter]);

  const isAddressEventsLoaded = Boolean(
    address && address in (eventsByAddress || {}),
  );
  const isFetchedInSession = Boolean(
    address && eventsFetchedInSessionByAddress?.[address],
  );
  const isEventsStale = Boolean(address && eventsStaleByAddress?.[address]);
  const shouldFetchLatest =
    !isAddressEventsLoaded || !isFetchedInSession || isEventsStale;

  const isSyncing = pendingTransactions.length > 0 || Boolean(isLoadingEvents);
  const isInitialLoading =
    (isRetrying || Boolean(isLoadingEvents) || shouldFetchLatest) &&
    !hasLoadError &&
    allRows.length === 0;

  // On mount or wallet switch, fetch latest events only if not yet fetched in this session or marked stale.
  // Cached transformed rows from bro-store are displayed immediately while this runs in the background.
  useEffect(() => {
    if (!address || !isWalletKitInitialized || !shouldFetchLatest) return;
    loadEvents(Math.max(limit, PAGE_SIZE), 0, true, undefined, extraAddresses)
      .then(() => setHasLoadError(false))
      .catch(() => setHasLoadError(true));
  }, [
    address,
    isWalletKitInitialized,
    shouldFetchLatest,
    loadEvents,
    limit,
    extraAddresses,
  ]);

  // Filter selection is 100% local against pre-transformed rows in store (0 network calls)
  const handleFilterSelect = (filter: string) => {
    setActiveFilter(filter);
  };

  const handleRetry = async () => {
    if (!address) return;
    setIsRetrying(true);
    setHasLoadError(false);
    try {
      await loadEvents(
        Math.max(limit, PAGE_SIZE),
        0,
        true,
        undefined,
        extraAddresses,
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
    const cachedCount = address
      ? (eventsByAddress?.[address]?.length ?? allRows.length)
      : allRows.length;
    if (address && nextLimit > cachedCount) {
      setIsLoadingMore(true);
      try {
        await loadEvents(nextLimit, 0, true, undefined, extraAddresses);
      } finally {
        setIsLoadingMore(false);
      }
    }
  };

  const filterBar = (
    <div
      ref={filterBarRef}
      className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-2 scrollbar-none"
    >
      <button
        key="ALL"
        type="button"
        data-filter-pill="ALL"
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
        key="CONTRACT"
        type="button"
        data-filter-pill="CONTRACT"
        onClick={() => handleFilterSelect('CONTRACT')}
        className={cn(
          'px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer',
          activeFilter === 'CONTRACT'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground',
        )}
      >
        Contract Calls
      </button>
      <button
        key="TON"
        type="button"
        data-filter-pill="TON"
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
            data-filter-pill={token.symbol}
            onClick={() => handleFilterSelect(token.symbol)}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer',
              isSelected
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            {token.image && (
              <FallbackImage
                src={token.image}
                alt={token.symbol}
                className="w-3.5 h-3.5 rounded-full object-cover"
              />
            )}
            <span>{token.symbol}</span>
            {token.isVerified && (
              <BadgeCheck
                className={cn(
                  'w-3.5 h-3.5 shrink-0',
                  isSelected
                    ? 'text-emerald-300 fill-emerald-300/20'
                    : 'text-emerald-500 fill-emerald-500/20',
                )}
                aria-label="Verified token"
              />
            )}
          </button>
        );
      })}
    </div>
  );

  const renderInnerList = () => {
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

    if (hasLoadError && allRows.length === 0) {
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
        <ScreenHeader
          title="History"
          onBack={() => navigate('/wallet')}
          rightElement={
            <RefreshButton
              iconOnly
              onRefresh={handleRetry}
              title="Refresh transaction history"
              testId="history-refresh-btn"
            />
          }
        />
      }
    >
      <SwipeableSubTabs
        tabs={categoryTabs}
        activeTab={
          categoryTabs.includes(activeFilter) ? activeFilter : categoryTabs[0]
        }
        onTabChange={handleFilterSelect}
        onBoundaryPrev={() => navigate('/wallet')}
        boundaryPrevLabel="Wallet"
        stickyTabBar={filterBar}
      >
        {renderInnerList()}
      </SwipeableSubTabs>
    </NewLayout>
  );
};
