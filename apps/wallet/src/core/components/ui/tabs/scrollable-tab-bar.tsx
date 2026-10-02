/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useRef, useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';
import { usePreferences, type ViewMode } from '@demo/wallet-core';
import { useActiveSwipePreview } from '@/core/lib/swipe-gesture-store';
import { cn } from '@/core/lib/utils';

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  icon: LucideIcon | React.ComponentType<{ className?: string }>;
  count?: number;
  badge?: React.ReactNode;
  testId?: string;
  colorClass?: string;
  activeColorClass?: string;
}

export interface ScrollableTabBarProps<T extends string = string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onTabChange: (tab: T) => void;
  className?: string;
  tabClassName?: string;
  viewMode?: ViewMode;
  size?: 'sm' | 'md';
}

/**
 * Universal, accessible, horizontally scrollable tab bar.
 * Supports standard mode (icon + label) and pictorial mode (enlarged icon with aria-label).
 */
export function ScrollableTabBar<T extends string = string>({
  tabs,
  activeTab,
  onTabChange,
  className,
  tabClassName,
  viewMode: propViewMode,
  size = 'md',
}: ScrollableTabBarProps<T>) {
  const { viewMode: userViewMode } = usePreferences();
  const effectiveViewMode = propViewMode ?? userViewMode ?? 'standard';
  const isPictorial = effectiveViewMode === 'icons_only';
  const activePreview = useActiveSwipePreview();

  const activeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (activeBtnRef.current) {
      activeBtnRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [activeTab]);

  return (
    <div
      role="tablist"
      className={cn(
        'no-swipe flex items-center gap-1 bg-secondary/70 border border-border p-1 rounded-xl',
        'overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden snap-x snap-proximity select-none w-full',
        className,
      )}
      data-swipe-ignore="true"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const isSwipeTarget =
          activePreview?.scope === 'subtab' && activePreview.toId === tab.id;
        const isTargetArmed =
          isSwipeTarget && activePreview.isArmed && !activePreview.isCanceled;
        const isTargetCanceled = isSwipeTarget && activePreview.isCanceled;
        const swipeProgress = isSwipeTarget ? activePreview.progress : 0;
        const Icon = tab.icon;

        if (isPictorial) {
          return (
            <button
              key={tab.id}
              ref={isActive ? activeBtnRef : null}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={tab.label}
              title={tab.label}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'relative flex items-center justify-center shrink-0 snap-center rounded-lg transition-all duration-200 cursor-pointer overflow-hidden',
                size === 'sm' ? 'w-8 h-8' : 'w-10 h-9 px-2',
                isActive
                  ? 'bg-card text-primary shadow-xs font-semibold border border-border scale-[1.03]'
                  : isTargetArmed
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/60 shadow-[0_0_12px_rgba(16,185,129,0.35)] scale-[1.03]'
                    : isSwipeTarget && !isTargetCanceled
                      ? 'bg-primary/15 text-primary border border-primary/40'
                      : tab.colorClass ||
                        'text-muted-foreground hover:text-foreground hover:bg-secondary/60 active:scale-95',
                tabClassName,
              )}
              data-testid={tab.testId || `tab-${tab.id}`}
            >
              <Icon
                aria-hidden="true"
                className={cn(
                  size === 'sm' ? 'w-4 h-4' : 'w-5 h-5',
                  isActive || isTargetArmed
                    ? 'stroke-[2.2] scale-105'
                    : 'stroke-[1.75]',
                  'transition-transform',
                )}
              />
              {tab.count !== undefined && tab.count > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[9px] font-bold px-1 min-w-3.5 h-3.5 rounded-full flex items-center justify-center leading-none">
                  {tab.count > 99 ? '99+' : tab.count}
                </span>
              )}
              {tab.badge}
              {isSwipeTarget && !isTargetCanceled && (
                <span
                  className={cn(
                    'absolute bottom-0 left-1 right-1 h-0.5 rounded-full origin-left',
                    isTargetArmed ? 'bg-emerald-400' : 'bg-primary',
                  )}
                  style={{
                    transform: `scaleX(${Math.max(0.15, swipeProgress)})`,
                  }}
                />
              )}
              <span className="sr-only">{tab.label}</span>
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            ref={isActive ? activeBtnRef : null}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label={tab.label}
            title={tab.label}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'relative inline-flex items-center justify-center gap-1.5 shrink-0 snap-center rounded-lg font-medium transition-all duration-150 cursor-pointer overflow-hidden',
              size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-xs',
              isActive
                ? 'bg-card text-foreground font-semibold border border-border shadow-xs scale-[1.01]'
                : isTargetArmed
                  ? 'bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-400/60 shadow-[0_0_12px_rgba(16,185,129,0.35)] scale-[1.02]'
                  : isSwipeTarget && !isTargetCanceled
                    ? 'bg-primary/15 text-foreground border border-primary/40'
                    : tab.colorClass ||
                      'text-muted-foreground hover:text-foreground hover:bg-secondary/60 active:scale-95',
              tabClassName,
            )}
            data-testid={tab.testId || `tab-${tab.id}`}
          >
            <Icon
              aria-hidden="true"
              className={cn(
                size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4',
                isActive || isTargetArmed
                  ? 'stroke-2 text-primary scale-105'
                  : 'stroke-[1.75] text-muted-foreground',
                'transition-transform shrink-0',
              )}
            />
            <span className="truncate">{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  'text-[10px] px-1.5 py-0.2 rounded-full font-medium',
                  isActive || isTargetArmed
                    ? 'bg-primary/15 text-primary'
                    : 'bg-muted text-muted-foreground',
                )}
              >
                {tab.count}
              </span>
            )}
            {tab.badge}
            {isSwipeTarget && !isTargetCanceled && (
              <span
                className={cn(
                  'absolute bottom-0 left-1.5 right-1.5 h-0.5 rounded-full origin-left',
                  isTargetArmed ? 'bg-emerald-400' : 'bg-primary',
                )}
                style={{
                  transform: `scaleX(${Math.max(0.15, swipeProgress)})`,
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
