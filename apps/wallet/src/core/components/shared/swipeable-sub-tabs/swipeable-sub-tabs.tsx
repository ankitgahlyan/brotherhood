/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useRef } from 'react';

const SWIPE_THRESHOLD_PX = 45;
const SWIPE_MIN_VELOCITY_RATIO = 1.25;

export interface SwipeableSubTabsProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  loop?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const SwipeableSubTabs: React.FC<SwipeableSubTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  loop = true,
  className = '',
  children,
}) => {
  const startXRef = useRef<number | null>(null);
  const startYRef = useRef<number | null>(null);
  const isIgnoredRef = useRef(false);

  const currentIndex = tabs.indexOf(activeTab);

  const onTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement | null;
    if (
      target?.closest('[data-swipe-ignore="true"]') ||
      target?.closest('.no-swipe') ||
      target?.closest('input, textarea, select, [role="slider"], button, a') ||
      target?.closest('[role="dialog"]')
    ) {
      isIgnoredRef.current = true;
      return;
    }

    isIgnoredRef.current = false;
    startXRef.current = e.touches[0].clientX;
    startYRef.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (
      isIgnoredRef.current ||
      startXRef.current === null ||
      startYRef.current === null ||
      tabs.length <= 1
    ) {
      return;
    }

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const diffX = endX - startXRef.current;
    const diffY = endY - startYRef.current;

    startXRef.current = null;
    startYRef.current = null;

    if (
      Math.abs(diffX) > SWIPE_THRESHOLD_PX &&
      Math.abs(diffX) > Math.abs(diffY) * SWIPE_MIN_VELOCITY_RATIO
    ) {
      const current = currentIndex >= 0 ? currentIndex : 0;
      const count = tabs.length;

      if (diffX < 0) {
        // Swipe left -> Next tab
        if (loop) {
          const next = (current + 1) % count;
          onTabChange(tabs[next]);
        } else if (current < count - 1) {
          onTabChange(tabs[current + 1]);
        }
      } else if (diffX > 0) {
        // Swipe right -> Prev tab
        if (loop) {
          const prev = (current - 1 + count) % count;
          onTabChange(tabs[prev]);
        } else if (current > 0) {
          onTabChange(tabs[current - 1]);
        }
      }
    }
  };

  return (
    <div
      className={`swipeable-sub-tabs-container touch-pan-y ${className}`}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div key={activeTab} className="animate-in fade-in duration-150">
        {children}
      </div>
    </div>
  );
};
