/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { ChevronLeft, ChevronRight, Undo2, Sparkles } from 'lucide-react';
import type { ActiveSwipePreview } from '@/core/lib/swipe-gesture-store';

interface PredictiveSwipeOverlayProps {
  preview: ActiveSwipePreview | null;
}

/**
 * Option 2 Predictive Navigation Overlay:
 * Renders an Adjacent Ghost Card Peek + Glowing Predictive Edge Pill with
 * circular progress ring, target Icon + Label, and real-time Armed vs Canceled states.
 */
export const PredictiveSwipeOverlay: React.FC<PredictiveSwipeOverlayProps> = ({
  preview,
}) => {
  if (!preview || Math.abs(preview.dragOffset) < 6) {
    return null;
  }

  const {
    direction,
    toLabel,
    toSubLabel,
    toIcon: IconComponent,
    progress,
    dragOffset,
    isArmed,
    isCanceled,
  } = preview;

  const isFromRight = direction === 'next'; // Swiping left -> next item peeks from right
  const absOffset = Math.abs(dragOffset);
  const clampedProgress = Math.max(0, Math.min(1, progress));

  // SVG progress circle parameters
  const radius = 15;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (isCanceled ? 0.15 : clampedProgress) * circumference;

  const EffectiveIcon = IconComponent ?? Sparkles;

  // Peek width grows smoothly with dragOffset
  const peekWidth = Math.min(88, Math.max(18, absOffset * 0.95));
  const pillTranslateX = isFromRight
    ? Math.max(-130, -Math.min(115, absOffset * 1.15))
    : Math.min(130, Math.min(115, absOffset * 1.15));

  return (
    <div
      className="pointer-events-none fixed inset-y-0 left-0 right-0 z-50 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Adjacent Ghost Card Peek on incoming viewport edge */}
      <div
        className={`absolute top-16 bottom-20 flex flex-col justify-between p-3 rounded-2xl border backdrop-blur-xl transition-colors duration-150 ${
          isFromRight ? 'right-0 rounded-r-none' : 'left-0 rounded-l-none'
        } ${
          isCanceled
            ? 'bg-card/35 border-border/40 opacity-45'
            : isArmed
              ? 'bg-card/85 border-primary/60 shadow-[0_0_32px_-4px_rgba(16,185,129,0.35)]'
              : 'bg-card/65 border-border/80 shadow-xl'
        }`}
        style={{
          width: `${peekWidth}px`,
          transform: isFromRight
            ? `translateX(${Math.max(0, 22 - absOffset * 0.35)}px)`
            : `translateX(${Math.min(0, -22 + absOffset * 0.35)}px)`,
          opacity: Math.min(0.95, absOffset / 36),
        }}
      >
        {/* Ghost Card Skeleton Header */}
        <div className="space-y-2 opacity-70">
          <div className="flex items-center gap-1.5">
            <div
              className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                isArmed && !isCanceled
                  ? 'bg-primary/25 text-primary'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <EffectiveIcon className="w-3 h-3" />
            </div>
            <span className="text-[10px] font-bold text-foreground/80 truncate">
              {toLabel}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted/70" />
          <div className="h-2 w-2/3 rounded-full bg-muted/50" />
        </div>

        {/* Center Ghost Watermark */}
        <div className="flex items-center justify-center opacity-15">
          <EffectiveIcon className="w-10 h-10 text-primary" />
        </div>

        {/* Ghost Card Skeleton Footer */}
        <div className="space-y-1.5 opacity-50">
          <div className="h-6 w-full rounded-lg bg-secondary/70 border border-border/50" />
          <div className="h-6 w-full rounded-lg bg-secondary/40" />
        </div>
      </div>

      {/* Glowing Predictive Edge Pill */}
      <div
        className={`absolute top-1/2 -translate-y-1/2 flex items-center gap-2.5 px-3 py-2 rounded-2xl border backdrop-blur-2xl shadow-2xl transition-colors duration-150 ${
          isFromRight ? 'right-2' : 'left-2'
        } ${
          isCanceled
            ? 'bg-background/90 border-amber-500/40 text-muted-foreground shadow-amber-500/10'
            : isArmed
              ? 'bg-background/95 border-emerald-500/70 text-foreground shadow-[0_0_25px_-3px_rgba(16,185,129,0.45)] scale-[1.03]'
              : 'bg-background/90 border-primary/40 text-foreground shadow-primary/20'
        }`}
        style={{
          transform: `translate3d(${
            isFromRight
              ? Math.min(0, 72 + pillTranslateX * 0.65)
              : Math.max(0, -72 + pillTranslateX * 0.65)
          }px, -50%, 0) scale(${isArmed && !isCanceled ? 1.03 : 0.98})`,
          opacity: Math.min(1, absOffset / 24),
        }}
        data-testid="predictive-swipe-pill"
        data-swipe-armed={isArmed ? 'true' : 'false'}
        data-swipe-canceled={isCanceled ? 'true' : 'false'}
      >
        {/* Circular Progress Ring + Destination Icon */}
        <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
          <svg
            className="w-9 h-9 -rotate-90 transform"
            viewBox="0 0 36 36"
            aria-hidden="true"
          >
            <circle
              cx="18"
              cy="18"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="text-muted/40"
            />
            <circle
              cx="18"
              cy="18"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.75"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className={
                isCanceled
                  ? 'text-amber-500/70 transition-all duration-150'
                  : isArmed
                    ? 'text-emerald-400 transition-none'
                    : 'text-primary transition-none'
              }
            />
          </svg>
          <div
            className={`absolute inset-1.5 rounded-full flex items-center justify-center transition-colors ${
              isCanceled
                ? 'bg-amber-500/15 text-amber-400'
                : isArmed
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-primary/15 text-primary'
            }`}
          >
            {isCanceled ? (
              <Undo2 className="w-4 h-4" />
            ) : (
              <EffectiveIcon className="w-4 h-4" />
            )}
          </div>
        </div>

        {/* Destination Text & Status */}
        <div className="flex flex-col min-w-0 pr-0.5">
          <span
            className={`text-[10px] font-semibold uppercase tracking-wider leading-tight ${
              isCanceled
                ? 'text-amber-400'
                : isArmed
                  ? 'text-emerald-400'
                  : 'text-muted-foreground'
            }`}
          >
            {isCanceled
              ? 'Stay on page'
              : isArmed
                ? `Release → ${toSubLabel}`
                : toSubLabel}
          </span>
          <span className="text-xs font-bold text-foreground truncate max-w-[120px]">
            {isCanceled ? 'Swipe Canceled' : toLabel}
          </span>
        </div>

        {/* Directional Indicator */}
        <div
          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-transform ${
            isCanceled
              ? 'bg-amber-500/10 text-amber-400'
              : isArmed
                ? 'bg-emerald-500/20 text-emerald-400 scale-110'
                : 'bg-secondary text-muted-foreground'
          }`}
        >
          {isFromRight ? (
            <ChevronLeft className="w-3.5 h-3.5" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5" />
          )}
        </div>
      </div>
    </div>
  );
};
