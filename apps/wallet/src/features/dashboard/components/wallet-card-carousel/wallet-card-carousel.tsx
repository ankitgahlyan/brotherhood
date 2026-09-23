/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Copy,
  ChevronLeft,
  ChevronRight,
  Wallet as WalletIcon,
  ChevronDown,
  Zap,
  Loader2,
} from 'lucide-react';
import {
  useWallet,
  useWalletKit,
  useJettons,
  useRates,
} from '@demo/wallet-core';

import { useCountUp } from '@/core/hooks/use-count-up';
import { assetUrl, findRate, toDecimal } from '@/core/utils';
import { useFormatAddress } from '@/core/utils/formatters';
import { isFiJetton } from '@/features/jettons';
import { useFiAccount } from '@/features/brotherhood/hooks/use-fi-account';
import { useToggleDeferredPayment } from '@/features/brotherhood/hooks/use-deferred-payment';
import { usePersonalJettonInfo } from '@/features/personal-jetton/hooks/use-personal-jetton-info';
import { FI_ADDRESS } from '@/lib/brotherhood/config';
import { SettingsWalletsModal } from '@/features/settings';
import { toast } from 'sonner';

const fiFormat = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatNumberParts = (
  value: number,
): { intPart: string; fracPart: string } => {
  const [intPart, fracPart = '00'] = fiFormat.format(value).split('.');
  return { intPart, fracPart };
};

const GRAM_DECIMALS = 9;
const SWIPE_THRESHOLD_PX = 40;

export const WalletCardCarousel: React.FC = () => {
  const {
    savedWallets,
    activeWalletId,
    switchWallet,
    address,
    balance,
    currentWallet,
  } = useWallet();
  const walletKit = useWalletKit();
  const { formatWalletAddress, copyWalletAddress } = useFormatAddress();
  const { userJettons } = useJettons();
  const { entries: rates, lastUpdated: ratesUpdated } = useRates();
  const fiAccount = useFiAccount(address ?? null);
  const { personalBalance } = usePersonalJettonInfo(address ?? null);

  const [copied, setCopied] = useState(false);
  const [isManageWalletsOpen, setIsManageWalletsOpen] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSwitchingAnim, setIsSwitchingAnim] = useState(false);
  const [isTogglingDeferred, setIsTogglingDeferred] = useState(false);

  const startXRef = useRef<number | null>(null);
  const startYRef = useRef<number | null>(null);
  const isHorizontalSwipeRef = useRef<boolean | null>(null);

  const currentIndex = useMemo(() => {
    const idx = savedWallets.findIndex((w) => w.id === activeWalletId);
    return idx >= 0 ? idx : 0;
  }, [savedWallets, activeWalletId]);

  const activeWallet = savedWallets[currentIndex];
  const network = activeWallet?.network ?? 'testnet';
  const allowDeferred = Boolean(fiAccount.data?.allowDeferred);

  const toggleDeferredHook = useToggleDeferredPayment({
    wallet: currentWallet,
    walletKit,
    walletAddress: address ?? null,
    enabled: !allowDeferred,
    network,
    accountData: fiAccount.data,
  });

  const handleToggleDeferred = useCallback(async () => {
    if (toggleDeferredHook.isDisabled || isTogglingDeferred) return;
    setIsTogglingDeferred(true);
    try {
      await toggleDeferredHook.send();
      toast.success(
        allowDeferred
          ? 'Offline payments disabled'
          : 'Offline payments enabled',
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to toggle offline payment',
      );
    } finally {
      setIsTogglingDeferred(false);
    }
  }, [toggleDeferredHook, isTogglingDeferred, allowDeferred]);

  const ready = balance !== undefined || Boolean(fiAccount.data);

  const fiJetton = useMemo(
    () => userJettons.find((j) => isFiJetton(j)),
    [userJettons],
  );

  const fiAmount = useMemo(() => {
    if (fiJetton) {
      return toDecimal(fiJetton.balance, fiJetton.decimalsNumber ?? 9);
    }
    if (fiAccount.data?.jettonBalance !== undefined) {
      return toDecimal(fiAccount.data.jettonBalance, 9);
    }
    return 0;
  }, [fiJetton, fiAccount.data]);

  const hdJetton = useMemo(
    () =>
      userJettons.find((j) => {
        const sym = j.info?.symbol;
        return sym?.toUpperCase() === 'HD';
      }),
    [userJettons],
  );

  const _hdAmount = useMemo(() => {
    if (hdJetton) {
      return toDecimal(hdJetton.balance, hdJetton.decimalsNumber ?? 9);
    }
    if (personalBalance !== null && personalBalance !== undefined) {
      return toDecimal(personalBalance, 9);
    }
    return 0;
  }, [hdJetton, personalBalance]);

  const _totalUsd = useMemo(() => {
    if (!ready || ratesUpdated === 0) return 0;

    let total = 0;
    const tonRate = rates['GRAM']?.rate;
    if (tonRate && balance !== undefined) {
      total += toDecimal(balance, GRAM_DECIMALS) * tonRate;
    }
    for (const jetton of userJettons) {
      const rate = findRate(rates, jetton.address)?.rate;
      if (!rate) continue;
      total += toDecimal(jetton.balance, jetton.decimalsNumber ?? 9) * rate;
    }
    if (fiAmount > 0 && !userJettons.some((j) => isFiJetton(j))) {
      const fiRate = findRate(rates, FI_ADDRESS)?.rate;
      if (fiRate) {
        total += fiAmount * fiRate;
      }
    }
    return total;
  }, [ready, ratesUpdated, rates, balance, userJettons, fiAmount]);

  const handleCopy = useCallback(async () => {
    if (!address) return;
    await copyWalletAddress(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [address, copyWalletAddress]);

  const handleSwitchTo = useCallback(
    async (index: number) => {
      const count = savedWallets.length;
      if (count === 0) return;
      // Endless loop indexing
      const wrappedIndex = ((index % count) + count) % count;
      const target = savedWallets[wrappedIndex];
      if (!target || target.id === activeWalletId) return;

      setIsSwitchingAnim(true);
      setTimeout(() => setIsSwitchingAnim(false), 220);

      try {
        await switchWallet(target.id);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : 'Failed to switch wallet',
        );
      }
    },
    [savedWallets, activeWalletId, switchWallet],
  );

  const onTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (savedWallets.length <= 1) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    startXRef.current = clientX;
    startYRef.current = clientY;
    isHorizontalSwipeRef.current = null;
    setIsDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (startXRef.current === null || startYRef.current === null) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const diffX = clientX - startXRef.current;
    const diffY = clientY - startYRef.current;

    if (isHorizontalSwipeRef.current === null) {
      if (Math.abs(diffX) > 6 || Math.abs(diffY) > 6) {
        isHorizontalSwipeRef.current = Math.abs(diffX) > Math.abs(diffY);
      }
    }

    if (isHorizontalSwipeRef.current) {
      setDragOffset(diffX);
    }
  };

  const onTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (
      isHorizontalSwipeRef.current &&
      Math.abs(dragOffset) > SWIPE_THRESHOLD_PX
    ) {
      if (dragOffset < 0) {
        // Swipe left -> next wallet (endless loop)
        void handleSwitchTo(currentIndex + 1);
      } else if (dragOffset > 0) {
        // Swipe right -> prev wallet (endless loop)
        void handleSwitchTo(currentIndex - 1);
      }
    }

    setDragOffset(0);
    startXRef.current = null;
    startYRef.current = null;
    isHorizontalSwipeRef.current = null;
  };

  const animatedFi = useCountUp(fiAmount);
  const { intPart, fracPart } = formatNumberParts(animatedFi);
  const tonDecimal =
    balance !== undefined ? toDecimal(balance, GRAM_DECIMALS) : 0;

  return (
    <>
      <section
        className="wallet-card-carousel relative flex flex-col items-center p-4 pt-3 pb-4 rounded-3xl bg-linear-to-b from-card/90 via-card/70 to-card/90 border border-border/80 shadow-md backdrop-blur-xl select-none touch-pan-y transition-all overflow-hidden"
        data-swipe-ignore="true"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
        onMouseDown={onTouchStart}
        onMouseMove={isDragging ? onTouchMove : undefined}
        onMouseUp={onTouchEnd}
        onMouseLeave={onTouchEnd}
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-12 bg-primary/20 rounded-full blur-2xl pointer-events-none" />

        {/* Active Wallet Name Chip (Clicking opens Wallet Management) */}
        <div className="flex items-center justify-between w-full mb-3 z-10">
          {savedWallets.length > 1 ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                void handleSwitchTo(currentIndex - 1);
              }}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground active:scale-90 transition-all cursor-pointer shadow-2xs"
              aria-label="Previous wallet"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          ) : (
            <div className="w-7" />
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsManageWalletsOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 border border-border/80 active:scale-95 transition-all shadow-2xs cursor-pointer group"
            aria-label="Manage Wallets"
            title="Click to manage or switch wallets"
          >
            <WalletIcon className="w-3.5 h-3.5 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-foreground tracking-tight max-w-37.5 truncate">
              {activeWallet?.name || 'My Wallet'}
            </span>
            <ChevronDown className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>

          {savedWallets.length > 1 ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                void handleSwitchTo(currentIndex + 1);
              }}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground active:scale-90 transition-all cursor-pointer shadow-2xs"
              aria-label="Next wallet"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="w-7" />
          )}
        </div>

        {/* Swipeable & Animating Balance Area */}
        <div
          className={`w-full relative flex flex-col items-center text-center transition-all duration-200 ease-out ${
            isSwitchingAnim ? 'opacity-40 scale-95' : 'opacity-100 scale-100'
          }`}
          style={{
            transform: dragOffset ? `translateX(${dragOffset}px)` : undefined,
            opacity: dragOffset
              ? Math.max(0.4, 1 - Math.abs(dragOffset) / 250)
              : undefined,
          }}
        >
          {ready ? (
            <>
              <div className="flex items-baseline justify-center font-display font-bold tabular-nums leading-none tracking-tight">
                <span className="text-5xl font-extrabold text-foreground tracking-tight drop-shadow-xs">
                  {intPart}
                </span>
                <span className="text-5xl text-muted-foreground/70">.</span>
                <span className="text-3xl font-semibold text-muted-foreground">
                  {fracPart}
                </span>
                <span className="ml-2 text-2xl font-bold bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  HD
                </span>
              </div>

              <div className="mt-2.5 flex items-center gap-2 text-xs text-muted-foreground font-medium">
                {/* {totalUsd > 0 && (
                  <>
                    <span className="font-semibold text-foreground/80">
                      ≈ ${usdFormat.format(totalUsd)} USD
                    </span>
                    <span className="text-muted-foreground/50">•</span>
                  </>
                )} */}
                <span>{tonDecimal.toFixed(2)} TON</span>
                {/* <span className="text-muted-foreground/50">•</span>
                <span>{hdAmount.toFixed(2)} HD</span> */}
              </div>
            </>
          ) : (
            <div className="h-12 w-56 rounded-2xl bg-muted/60 animate-pulse my-2" />
          )}

          {address ? (
            <div className="mt-3 flex items-center gap-2 flex-wrap justify-center">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  void handleCopy();
                }}
                className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 bg-secondary/80 hover:bg-secondary border border-border/70 active:scale-[0.96] transition-all cursor-pointer shadow-2xs"
                aria-label="Copy address"
              >
                <span className="w-4 h-4 rounded-full overflow-hidden inline-block shrink-0 ring-1 ring-border/50">
                  <img
                    src={assetUrl('fi.svg')}
                    alt="FI"
                    className="w-full h-full"
                  />
                </span>
                <span className="text-xs font-semibold text-foreground">
                  {formatWalletAddress(address, true, 4)}
                </span>
                {copied ? (
                  <span className="text-emerald-500 flex items-center gap-1 text-xs font-semibold">
                    Copied
                  </span>
                ) : (
                  <Copy className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors" />
                )}
              </button>

              <button
                type="button"
                disabled={toggleDeferredHook.isDisabled || isTogglingDeferred}
                onClick={(e) => {
                  e.stopPropagation();
                  void handleToggleDeferred();
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer shadow-2xs active:scale-[0.96] disabled:opacity-50 disabled:cursor-not-allowed ${
                  allowDeferred
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/25'
                    : 'bg-secondary/80 border-border/70 text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
                title="Toggle Offline (Deferred) Payment for this wallet"
                aria-label="Toggle offline payment"
              >
                {isTogglingDeferred ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                ) : (
                  <Zap
                    className={`w-3.5 h-3.5 ${
                      allowDeferred
                        ? 'text-emerald-500 fill-emerald-500/30'
                        : 'text-muted-foreground'
                    }`}
                  />
                )}
                <span>Offline Pay: {allowDeferred ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          ) : (
            <div className="mt-3 h-7 w-32 rounded-full bg-muted/60 animate-pulse" />
          )}
        </div>

        {/* Pagination Dots Indicator */}
        {savedWallets.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-3.5 z-10">
            {savedWallets.map((wallet, idx) => {
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={wallet.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    void handleSwitchTo(idx);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    isCurrent
                      ? 'w-6 bg-primary shadow-xs'
                      : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60'
                  }`}
                  aria-label={`Switch to ${wallet.name}`}
                />
              );
            })}
          </div>
        )}
      </section>

      <SettingsWalletsModal
        isOpen={isManageWalletsOpen}
        onClose={() => setIsManageWalletsOpen(false)}
      />
    </>
  );
};
