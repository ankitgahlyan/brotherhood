/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useRef, useState, useCallback } from 'react';
import { useLocation, useNavigate } from '@/core/routing';
import { useScrollDirection } from '@/core/hooks';
import { ECOSYSTEM_SWIPE_ROUTES } from '../screen-swipe-container';

const SWIPE_THRESHOLD_PX = 45;

export interface SwipeableSubTabsProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  loop?: boolean;
  className?: string;
  onBoundaryPrev?: () => void;
  onBoundaryNext?: () => void;
  pinnedHeader?: React.ReactNode;
  stickyTabBar?: React.ReactNode;
  children: React.ReactNode;
}

export const SwipeableSubTabs: React.FC<SwipeableSubTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  loop = false,
  className = '',
  onBoundaryPrev,
  onBoundaryNext,
  pinnedHeader,
  stickyTabBar,
  children,
}) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isBarsVisible = useScrollDirection();

  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const startXRef = useRef<number | null>(null);
  const startYRef = useRef<number | null>(null);
  const isHorizontalSwipeRef = useRef<boolean | null>(null);
  const isIgnoredRef = useRef(false);

  const currentIndex = tabs.indexOf(activeTab);

  const handleBoundaryPrev = useCallback(() => {
    if (onBoundaryPrev) {
      onBoundaryPrev();
      return;
    }
    const currentRouteIdx = ECOSYSTEM_SWIPE_ROUTES.findIndex((r) =>
      pathname.startsWith(r),
    );
    if (currentRouteIdx > 0) {
      navigate(ECOSYSTEM_SWIPE_ROUTES[currentRouteIdx - 1]);
    } else if (currentRouteIdx === 0) {
      navigate(ECOSYSTEM_SWIPE_ROUTES[ECOSYSTEM_SWIPE_ROUTES.length - 1]);
    }
  }, [onBoundaryPrev, pathname, navigate]);

  const handleBoundaryNext = useCallback(() => {
    if (onBoundaryNext) {
      onBoundaryNext();
      return;
    }
    const currentRouteIdx = ECOSYSTEM_SWIPE_ROUTES.findIndex((r) =>
      pathname.startsWith(r),
    );
    if (
      currentRouteIdx >= 0 &&
      currentRouteIdx < ECOSYSTEM_SWIPE_ROUTES.length - 1
    ) {
      navigate(ECOSYSTEM_SWIPE_ROUTES[currentRouteIdx + 1]);
    } else if (currentRouteIdx === ECOSYSTEM_SWIPE_ROUTES.length - 1) {
      navigate(ECOSYSTEM_SWIPE_ROUTES[0]);
    }
  }, [onBoundaryNext, pathname, navigate]);

  const onTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement | null;
    if (
      target?.closest('[data-swipe-ignore="true"]') ||
      target?.closest('.no-swipe') ||
      target?.closest('nav') ||
      target?.closest('[aria-label="Bottom Navigation"]') ||
      target?.closest('.wallet-card-carousel') ||
      target?.closest('[role="dialog"]')
    ) {
      isIgnoredRef.current = true;
      return;
    }

    isIgnoredRef.current = false;
    startXRef.current = e.touches[0].clientX;
    startYRef.current = e.touches[0].clientY;
    isHorizontalSwipeRef.current = null;
    setIsDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (
      isIgnoredRef.current ||
      startXRef.current === null ||
      startYRef.current === null
    ) {
      return;
    }

    const clientX = e.touches[0].clientX;
    const clientY = e.touches[0].clientY;
    const diffX = clientX - startXRef.current;
    const diffY = clientY - startYRef.current;

    if (isHorizontalSwipeRef.current === null) {
      if (Math.abs(diffX) > 6 || Math.abs(diffY) > 6) {
        isHorizontalSwipeRef.current = Math.abs(diffX) > Math.abs(diffY) * 1.1;
      }
    }

    if (isHorizontalSwipeRef.current) {
      setDragOffset(diffX * 0.45);
    }
  };

  const onTouchEnd = () => {
    if (isIgnoredRef.current || !isDragging) {
      setDragOffset(0);
      setIsDragging(false);
      startXRef.current = null;
      startYRef.current = null;
      isHorizontalSwipeRef.current = null;
      return;
    }

    setIsDragging(false);

    if (
      isHorizontalSwipeRef.current &&
      Math.abs(dragOffset) > SWIPE_THRESHOLD_PX * 0.4
    ) {
      const current = currentIndex >= 0 ? currentIndex : 0;
      const count = tabs.length;

      if (dragOffset < 0) {
        // Swipe left -> Next tab / Next main screen
        if (current < count - 1) {
          onTabChange(tabs[current + 1]);
        } else if (loop) {
          onTabChange(tabs[0]);
        } else {
          handleBoundaryNext();
        }
      } else if (dragOffset > 0) {
        // Swipe right -> Prev tab / Prev main screen
        if (current > 0) {
          onTabChange(tabs[current - 1]);
        } else if (loop) {
          onTabChange(tabs[count - 1]);
        } else {
          handleBoundaryPrev();
        }
      }
    }

    setDragOffset(0);
    startXRef.current = null;
    startYRef.current = null;
    isHorizontalSwipeRef.current = null;
  };

  return (
    <div
      className={`swipeable-sub-tabs-container touch-pan-y flex flex-col flex-1 w-full min-h-[calc(100vh-180px)] ${className}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
    >
      {pinnedHeader}
      {stickyTabBar && (
        <div
          className={`sticky z-30 -mx-4 px-4 py-2 bg-background/95 backdrop-blur-md transition-all duration-300 ease-in-out ${
            isBarsVisible
              ? 'top-[108px] translate-y-0 opacity-100'
              : 'top-0 -translate-y-full opacity-0 pointer-events-none'
          }`}
        >
          {stickyTabBar}
        </div>
      )}
      <div
        key={activeTab}
        className="animate-in fade-in duration-150 flex-1 flex flex-col w-full"
        style={{
          transform: dragOffset ? `translateX(${dragOffset}px)` : undefined,
          opacity: dragOffset
            ? Math.max(0.5, 1 - Math.abs(dragOffset) / 300)
            : undefined,
          transition: isDragging
            ? 'none'
            : 'transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 220ms ease-out',
        }}
      >
        {children}
      </div>
    </div>
  );
};
