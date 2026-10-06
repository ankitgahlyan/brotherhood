/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useRef, useEffect } from 'react';
import { useLocation, useNavigate } from '@/core/routing';
import { usePreferences } from '@demo/wallet-core';
import { useTheme } from '@/core/theme';
import { useActiveSwipePreview } from '@/core/lib/swipe-gesture-store';
import {
  Wallet,
  Coins,
  Sparkles,
  Building2,
  Vote,
  Ticket,
  Globe,
  type LucideIcon,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon | React.ComponentType<{ className?: string }>;
  path: string;
  activeColor?: string;
  activeBg?: string;
}

export const ECOSYSTEM_NAV_ITEMS: NavItem[] = [
  {
    id: 'wallet',
    label: 'Wallet',
    icon: Wallet,
    path: '/wallet',
  },
  {
    id: 'brotherhood',
    label: 'Fi',
    icon: Coins,
    path: '/brotherhood',
  },
  {
    id: 'personal',
    label: 'Personal',
    icon: Sparkles,
    path: '/personal-jetton',
  },
  {
    id: 'city',
    label: 'Cities',
    icon: Building2,
    path: '/city-network',
  },
  {
    id: 'dao',
    label: 'DAO',
    icon: Vote,
    path: '/dao',
  },
  {
    id: 'lottery',
    label: 'Lottery',
    icon: Ticket,
    path: '/lottery',
  },
  {
    id: 'dns',
    label: 'Domains',
    icon: Globe,
    path: '/dns',
  },
];

interface BottomNavProps {
  isVisible?: boolean;
}

let lastBottomNavScrollLeft = 0;

export const BottomNav: React.FC<BottomNavProps> = ({ isVisible = true }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { viewMode, animationLevel } = usePreferences();
  const isPictorial = viewMode === 'icons_only';
  const activePreview = useActiveSwipePreview();
  const activeBtnRef = useRef<HTMLButtonElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const getIsActive = (item: NavItem) => {
    if (item.path === '/wallet') {
      return (
        pathname === '/' ||
        pathname === '/wallet' ||
        pathname.startsWith('/wallet/')
      );
    }
    return pathname.startsWith(item.path);
  };

  // Restore previous scrollLeft before paint so mounting a new route never jerks BottomNav from 0,
  // then smoothly center the active button only if it moved.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (
      lastBottomNavScrollLeft > 0 &&
      Math.abs(container.scrollLeft - lastBottomNavScrollLeft) > 1
    ) {
      container.scrollLeft = lastBottomNavScrollLeft;
    }
    if (activeBtnRef.current) {
      const btn = activeBtnRef.current;
      const targetLeft = Math.max(
        0,
        btn.offsetLeft - container.offsetWidth / 2 + btn.offsetWidth / 2,
      );
      if (Math.abs(container.scrollLeft - targetLeft) > 2) {
        container.scrollTo({
          left: targetLeft,
          behavior: animationLevel === 'none' ? 'auto' : 'smooth',
        });
      }
      lastBottomNavScrollLeft = targetLeft;
    }
  }, [pathname, animationLevel]);

  const { isGlass } = useTheme();

  return (
    <nav
      className={
        isGlass
          ? `fixed bottom-[calc(0.625rem+var(--tg-safe-area-bottom,0px))] left-3 right-3 max-w-[calc(28rem-1.5rem)] mx-auto z-40 rounded-full liquid-glass-dock border border-border/80 select-none transition-all duration-300 ease-in-out no-swipe ${
              isVisible
                ? 'translate-y-0 opacity-100'
                : 'translate-y-[140%] opacity-0 pointer-events-none'
            }`
          : `fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-xl border-t border-border/70 select-none pb-(--tg-safe-area-bottom,0px) transition-transform duration-300 ease-in-out no-swipe ${
              isVisible ? 'translate-y-0' : 'translate-y-full'
            }`
      }
      aria-label="Bottom Navigation"
      data-swipe-ignore="true"
    >
      <div
        ref={containerRef}
        onScroll={(e) => {
          lastBottomNavScrollLeft = e.currentTarget.scrollLeft;
        }}
        className={`max-w-md mx-auto flex items-center gap-1 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden snap-x snap-proximity ${
          isGlass ? 'px-2 py-1.5' : 'px-2 py-1.5'
        }`}
      >
        {ECOSYSTEM_NAV_ITEMS.map((item) => {
          const isActive = getIsActive(item);
          const isSwipeTarget =
            (activePreview?.scope === 'screen' ||
              activePreview?.scope === 'back') &&
            activePreview.toId === item.path;
          const swipeProgress = isSwipeTarget ? activePreview.progress : 0;
          const isTargetArmed =
            isSwipeTarget && activePreview.isArmed && !activePreview.isCanceled;
          const isTargetCanceled = isSwipeTarget && activePreview.isCanceled;
          const Icon = item.icon;

          if (isPictorial) {
            return (
              <button
                key={item.id}
                ref={isActive ? activeBtnRef : null}
                type="button"
                onClick={() => navigate(item.path)}
                className={`relative flex-1 min-w-12 min-h-(--touch-target) shrink-0 snap-center flex items-center justify-center py-1.5 px-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                  isActive
                    ? `${item.activeColor || 'text-primary'} scale-105 ${
                        isGlass ? 'liquid-droplet-active border' : ''
                      }`
                    : isTargetArmed
                      ? 'text-emerald-400 scale-105'
                      : isSwipeTarget
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground active:scale-95'
                }`}
                aria-label={item.label}
                title={item.label}
                data-testid={`bottom-nav-${item.id}`}
              >
                <div
                  className={`relative flex items-center justify-center w-10 h-8 rounded-full transition-all duration-150 ${
                    isActive
                      ? isGlass
                        ? 'bg-transparent'
                        : item.activeBg || 'bg-primary/15'
                      : isTargetArmed
                        ? 'bg-emerald-500/25 ring-1 ring-emerald-400/60 shadow-[0_0_14px_rgba(16,185,129,0.45)]'
                        : isSwipeTarget && !isTargetCanceled
                          ? 'bg-primary/15 ring-1 ring-primary/40'
                          : 'bg-transparent'
                  }`}
                >
                  <Icon
                    aria-hidden="true"
                    className={`w-5.5 h-5.5 transition-transform duration-200 ${
                      isActive || isTargetArmed
                        ? 'scale-110 stroke-[2.2]'
                        : 'stroke-[1.8]'
                    }`}
                  />
                </div>
                {isSwipeTarget && !isTargetCanceled && (
                  <span
                    className={`absolute bottom-0.5 left-2 right-2 h-0.5 rounded-full origin-left ${
                      isTargetArmed ? 'bg-emerald-400' : 'bg-primary'
                    }`}
                    style={{
                      transform: `scaleX(${Math.max(0.15, swipeProgress)})`,
                    }}
                  />
                )}
                <span className="sr-only">{item.label}</span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              ref={isActive ? activeBtnRef : null}
              type="button"
              onClick={() => navigate(item.path)}
              className={`relative flex-1 min-w-13 min-h-(--touch-target) shrink-0 snap-center flex flex-col items-center justify-center gap-0.5 py-1.5 px-2 transition-all duration-200 cursor-pointer ${
                isGlass ? 'rounded-full' : 'rounded-xl'
              } ${
                isActive
                  ? `text-primary scale-[1.02] ${
                      isGlass ? 'liquid-droplet-active border' : ''
                    }`
                  : isTargetArmed
                    ? 'text-emerald-400 scale-[1.04]'
                    : isSwipeTarget && !isTargetCanceled
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground active:scale-95'
              }`}
              aria-label={item.label}
              data-testid={`bottom-nav-${item.id}`}
            >
              <div
                className={`relative flex items-center justify-center w-9 h-6.5 rounded-full transition-all duration-150 ${
                  isActive
                    ? isGlass
                      ? 'bg-transparent'
                      : 'bg-primary/15'
                    : isTargetArmed
                      ? 'bg-emerald-500/25 ring-1 ring-emerald-400/60 shadow-[0_0_14px_rgba(16,185,129,0.45)]'
                      : isSwipeTarget && !isTargetCanceled
                        ? 'bg-primary/15 ring-1 ring-primary/40'
                        : 'bg-transparent'
                }`}
              >
                <Icon
                  aria-hidden="true"
                  className={`w-4.5 h-4.5 transition-transform duration-200 ${
                    isActive || isTargetArmed
                      ? 'scale-110 stroke-[2.2]'
                      : 'stroke-[1.8]'
                  }`}
                />
              </div>
              <span
                className={`text-[0.65rem] tracking-tight leading-tight truncate w-full text-center transition-all ${
                  isActive || isTargetArmed
                    ? 'font-bold text-foreground'
                    : 'font-medium'
                }`}
              >
                {item.label}
              </span>
              {isSwipeTarget && !isTargetCanceled && (
                <span
                  className={`absolute bottom-0.5 left-2 right-2 h-0.5 rounded-full origin-left ${
                    isTargetArmed ? 'bg-emerald-400' : 'bg-primary'
                  }`}
                  style={{
                    transform: `scaleX(${Math.max(0.15, swipeProgress)})`,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
