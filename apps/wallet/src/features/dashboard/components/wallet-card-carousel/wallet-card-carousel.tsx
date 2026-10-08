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
  Zap,
  Loader2,
  Wallet,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  useWallet,
  useWalletKit,
  useActiveJettons,
  useRates,
} from '@demo/wallet-core';

import { useTheme } from '@/core/theme';
import { useCountUp } from '@/core/hooks/use-count-up';
import {
  createSwipeKinematicState,
  getActiveSwipePreview,
  setActiveSwipePreview,
  updateSwipeKinematics,
  type SwipeKinematicState,
} from '@/core/lib/swipe-gesture-store';
import { assetUrl, findRate, toDecimal } from '@/core/utils';
import { useFormatAddress } from '@/core/utils/formatters';
import { isFiJetton } from '@/features/jettons';
import { useFiAccount } from '@/features/brotherhood/hooks/use-fi-account';
import { useToggleDeferredPayment } from '@/features/brotherhood/hooks/use-deferred-payment';
import { usePersonalJettonInfo } from '@/features/personal-jetton/hooks/use-personal-jetton-info';
import { FI_ADDRESS } from '@/lib/brotherhood/config';
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
const SWIPE_THRESHOLD_PX = 52;

export const WalletCardCarousel: React.FC = () => {
  const { isGlass, surfaceStyle } = useTheme();
  const cardRef = useRef<HTMLElement>(null);
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
  const activeJettons = useActiveJettons();
  const { entries: rates, lastUpdated: ratesUpdated } = useRates();
  const fiAccount = useFiAccount(address ?? null);
  const { personalBalance } = usePersonalJettonInfo(address ?? null);

  const [copied, setCopied] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSwitchingAnim, setIsSwitchingAnim] = useState(false);
  const [isTogglingDeferred, setIsTogglingDeferred] = useState(false);

  const kinematicsRef = useRef<SwipeKinematicState | null>(null);

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
    () => activeJettons.find((j) => isFiJetton(j)),
    [activeJettons],
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
      activeJettons.find((j) => {
        const sym = j.info?.symbol;
        return sym?.toUpperCase() === 'HD';
      }),
    [activeJettons],
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
    for (const jetton of activeJettons) {
      const rate = findRate(rates, jetton.address)?.rate;
      if (!rate) continue;
      total += toDecimal(jetton.balance, jetton.decimalsNumber ?? 9) * rate;
    }
    if (fiAmount > 0 && !activeJettons.some((j) => isFiJetton(j))) {
      const fiRate = findRate(rates, FI_ADDRESS)?.rate;
      if (fiRate) {
        total += fiAmount * fiRate;
      }
    }
    return total;
  }, [ready, ratesUpdated, rates, balance, activeJettons, fiAmount]);

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

  const hasMultipleWallets = savedWallets.length > 1;

  const onTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (!hasMultipleWallets) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    kinematicsRef.current = createSwipeKinematicState(clientX, clientY);
    setIsDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!hasMultipleWallets || !kinematicsRef.current) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const step = updateSwipeKinematics(
      kinematicsRef.current,
      clientX,
      clientY,
      SWIPE_THRESHOLD_PX,
    );

    if (step.isHorizontal === false) {
      kinematicsRef.current = null;
      setDragOffset(0);
      setIsDragging(false);
      setActiveSwipePreview(null);
      return;
    }

    if (step.isHorizontal) {
      const count = savedWallets.length;
      const targetIndex =
        step.direction === 'next'
          ? (currentIndex + 1) % count
          : (currentIndex - 1 + count) % count;
      const targetWallet = savedWallets[targetIndex];
      setDragOffset(step.dragOffset);
      if (targetWallet) {
        setActiveSwipePreview({
          scope: 'wallet',
          direction: step.direction,
          fromId: activeWallet?.id ?? 'wallet',
          toId: targetWallet.id,
          toLabel: targetWallet.name || `Wallet ${targetIndex + 1}`,
          toSubLabel: step.direction === 'next' ? 'Next Wallet' : 'Prev Wallet',
          toIcon: Wallet,
          progress: step.progress,
          dragOffset: step.dragOffset,
          isArmed: step.isArmed,
          isCanceled: step.isCanceled,
        });
      }
    }
  };

  const onTouchEnd = () => {
    const kin = kinematicsRef.current;
    kinematicsRef.current = null;
    const preview = getActiveSwipePreview();
    if (preview?.scope === 'wallet') {
      setActiveSwipePreview(null);
    }

    if (!isDragging) return;
    setIsDragging(false);
    setDragOffset(0);

    if (!kin || !kin.isHorizontal) return;
    const isReverseFlick =
      kin.peakAbsX > 20 && kin.velocityX * kin.swipeSign < -0.18;

    if (preview && preview.isArmed && !preview.isCanceled && !isReverseFlick) {
      if (kin.swipeSign < 0) {
        void handleSwitchTo(currentIndex + 1);
      } else if (kin.swipeSign > 0) {
        void handleSwitchTo(currentIndex - 1);
      }
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    const prevIdx =
      currentIndex <= 0 ? savedWallets.length - 1 : currentIndex - 1;
    void handleSwitchTo(prevIdx);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextIdx =
      currentIndex >= savedWallets.length - 1 ? 0 : currentIndex + 1;
    void handleSwitchTo(nextIdx);
  };

  const animatedFi = useCountUp(fiAmount);
  const { intPart, fracPart } = formatNumberParts(animatedFi);
  const tonDecimal =
    balance !== undefined ? toDecimal(balance, GRAM_DECIMALS) : 0;

  return (
    <section
      ref={cardRef}
      className={`wallet-card-carousel relative flex flex-col items-center p-4 pt-3 pb-4 rounded-3xl bg-linear-to-b from-card/90 via-card/70 to-card/90 border border-border/80 shadow-md backdrop-blur-xl select-none touch-pan-y transition-all overflow-hidden${isGlass ? ' liquid-glass-hero' : ''}`}
      data-swipe-ignore={hasMultipleWallets ? 'true' : undefined}
      onPointerMove={
        surfaceStyle === 'glass_tilt'
          ? (e) => {
              const el = cardRef.current;
              if (!el) return;
              const rect = el.getBoundingClientRect();
              const nx = (e.clientX - rect.left) / rect.width;
              const ny = (e.clientY - rect.top) / rect.height;
              const gx = nx * 100;
              const gy = ny * 100;
              const rx = (0.5 - ny) * 7;
              const ry = (nx - 0.5) * 7;
              el.style.setProperty('--gx', `${gx.toFixed(1)}%`);
              el.style.setProperty('--gy', `${gy.toFixed(1)}%`);
              el.style.setProperty('--rx', `${rx.toFixed(2)}deg`);
              el.style.setProperty('--ry', `${ry.toFixed(2)}deg`);
            }
          : undefined
      }
      onPointerLeave={
        surfaceStyle === 'glass_tilt'
          ? () => {
              const el = cardRef.current;
              if (!el) return;
              el.style.setProperty('--rx', '0deg');
              el.style.setProperty('--ry', '0deg');
            }
          : undefined
      }
      onTouchStart={hasMultipleWallets ? onTouchStart : undefined}
      onTouchMove={hasMultipleWallets ? onTouchMove : undefined}
      onTouchEnd={hasMultipleWallets ? onTouchEnd : undefined}
      onTouchCancel={hasMultipleWallets ? onTouchEnd : undefined}
      onMouseDown={hasMultipleWallets ? onTouchStart : undefined}
      onMouseMove={hasMultipleWallets && isDragging ? onTouchMove : undefined}
      onMouseUp={hasMultipleWallets ? onTouchEnd : undefined}
      onMouseLeave={hasMultipleWallets ? onTouchEnd : undefined}
    >
      {/* Specular glare overlay — visible only in glass_tilt mode */}
      <div className="liquid-specular-glare" aria-hidden="true" />

      {/* Ambient Top Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-12 bg-primary/20 rounded-full blur-2xl pointer-events-none" />

      {/* Edge Chevron Navigation Buttons */}
      {hasMultipleWallets && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="absolute left-2.5 top-[45%] -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-background/70 hover:bg-background/95 text-muted-foreground hover:text-foreground border border-border/60 shadow-xs backdrop-blur-md transition-all active:scale-95 cursor-pointer flex items-center justify-center group"
            aria-label="Previous wallet"
            title="Previous wallet"
          >
            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="absolute right-2.5 top-[45%] -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-background/70 hover:bg-background/95 text-muted-foreground hover:text-foreground border border-border/60 shadow-xs backdrop-blur-md transition-all active:scale-95 cursor-pointer flex items-center justify-center group"
            aria-label="Next wallet"
            title="Next wallet"
          >
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </>
      )}

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
              className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 min-h-9 bg-secondary/80 hover:bg-secondary border border-border/70 active:scale-[0.96] transition-all cursor-pointer shadow-2xs"
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
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 min-h-9 rounded-full text-xs font-semibold border transition-all cursor-pointer shadow-2xs active:scale-[0.96] disabled:opacity-50 disabled:cursor-not-allowed ${
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
        <div className="flex items-center justify-center gap-1 mt-2 z-10">
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
                className="py-2 px-1 flex items-center justify-center cursor-pointer group"
                aria-label={`Switch to ${wallet.name}`}
              >
                <span
                  className={`block h-1.5 rounded-full transition-all duration-300 ${
                    isCurrent
                      ? 'w-6 bg-primary shadow-xs'
                      : 'w-1.5 bg-muted-foreground/30 group-hover:bg-muted-foreground/60'
                  }`}
                />
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
};
