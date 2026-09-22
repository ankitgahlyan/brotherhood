/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useRef } from 'react';
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

const SWIPE_THRESHOLD_PX = 55;
const SWIPE_MIN_VELOCITY_RATIO = 1.3;

interface ScreenSwipeContainerProps {
  children: React.ReactNode;
}

export const ScreenSwipeContainer: React.FC<ScreenSwipeContainerProps> = ({
  children,
}) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [isSettingsOpen] = useSettingsModal();

  const startXRef = useRef<number | null>(null);
  const startYRef = useRef<number | null>(null);
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
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (
      isIgnoredRef.current ||
      startXRef.current === null ||
      startYRef.current === null
    ) {
      return;
    }

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const diffX = endX - startXRef.current;
    const diffY = endY - startYRef.current;

    startXRef.current = null;
    startYRef.current = null;

    // Check if horizontal swipe dominates vertical scroll
    if (
      Math.abs(diffX) > SWIPE_THRESHOLD_PX &&
      Math.abs(diffX) > Math.abs(diffY) * SWIPE_MIN_VELOCITY_RATIO
    ) {
      const currentIdx = getActiveTabIndex();
      if (currentIdx === -1) return;

      const total = ECOSYSTEM_SWIPE_ROUTES.length;
      if (diffX < 0) {
        // Swipe left -> Next tab (endless loop)
        const nextIdx = (currentIdx + 1) % total;
        navigate(ECOSYSTEM_SWIPE_ROUTES[nextIdx]);
      } else if (diffX > 0) {
        // Swipe right -> Prev tab (endless loop)
        const prevIdx = (currentIdx - 1 + total) % total;
        navigate(ECOSYSTEM_SWIPE_ROUTES[prevIdx]);
      }
    }
  };

  return (
    <div
      className="screen-swipe-container w-full min-h-screen flex flex-col"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {children}
    </div>
  );
};
