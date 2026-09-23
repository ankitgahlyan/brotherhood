/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useRef, useState } from 'react';
import { useLocation, useNavigate } from '@/core/routing';
import { useSettingsModal } from '@/core/lib/settings-modal-state';

export const ECOSYSTEM_SWIPE_ROUTES = [
  '/wallet',
  '/brotherhood',
  '/personal-jetton',
  '/city-network',
  '/dao',
  '/lottery',
];

const SUB_TAB_ROUTES = ['/brotherhood', '/personal-jetton', '/dao'];

const SWIPE_THRESHOLD_PX = 50;

interface ScreenSwipeContainerProps {
  children: React.ReactNode;
}

export const ScreenSwipeContainer: React.FC<ScreenSwipeContainerProps> = ({
  children,
}) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [isSettingsOpen] = useSettingsModal();

  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const startXRef = useRef<number | null>(null);
  const startYRef = useRef<number | null>(null);
  const isHorizontalSwipeRef = useRef<boolean | null>(null);
  const isIgnoredRef = useRef(false);

  const isSubTabScreen = SUB_TAB_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  const getActiveTabIndex = () => {
    if (pathname === '/' || pathname.startsWith('/wallet')) return 0;
    if (pathname.startsWith('/brotherhood')) return 1;
    if (pathname.startsWith('/personal-jetton')) return 2;
    if (pathname.startsWith('/city-network')) return 3;
    if (pathname.startsWith('/dao')) return 4;
    if (pathname.startsWith('/lottery')) return 5;
    return -1;
  };

  const onTouchStart = (e: React.TouchEvent) => {
    // If settings modal is open or the active screen has sub-tabs, don't trigger main ecosystem route swipes
    if (isSettingsOpen || isSubTabScreen) {
      isIgnoredRef.current = true;
      return;
    }

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
      const currentIdx = getActiveTabIndex();
      if (currentIdx !== -1) {
        const total = ECOSYSTEM_SWIPE_ROUTES.length;
        if (dragOffset < 0) {
          // Swipe left -> Next tab (endless loop)
          const nextIdx = (currentIdx + 1) % total;
          navigate(ECOSYSTEM_SWIPE_ROUTES[nextIdx]);
        } else if (dragOffset > 0) {
          // Swipe right -> Prev tab (endless loop)
          const prevIdx = (currentIdx - 1 + total) % total;
          navigate(ECOSYSTEM_SWIPE_ROUTES[prevIdx]);
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
      className="screen-swipe-container w-full min-h-screen flex flex-col touch-pan-y"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
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
  );
};
