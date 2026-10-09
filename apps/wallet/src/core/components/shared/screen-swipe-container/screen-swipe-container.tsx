/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from '@/core/routing';
import { useSettingsModal } from '@/core/lib/settings-modal-state';
import { useAnimationSettings } from '@/core/motion/motion-provider';
import { ECOSYSTEM_NAV_ITEMS } from '../bottom-nav';
import { PredictiveSwipeOverlay } from '../predictive-swipe-overlay';
import {
  canTargetScrollHorizontally,
  createSwipeKinematicState,
  getActiveSwipePreview,
  setActiveSwipePreview,
  shouldIgnoreSwipeStart,
  SWIPE_COMMIT_DISTANCE_PX,
  updateSwipeKinematics,
  type SwipeKinematicState,
} from '@/core/lib/swipe-gesture-store';

export const ECOSYSTEM_SWIPE_ROUTES = [
  '/wallet',
  '/brotherhood',
  '/personal-jetton',
  '/borrow',
  '/city-network',
  '/dao',
  '/lottery',
  '/dns',
];

const SUB_TAB_ROUTES = [
  '/wallet/history',
  '/brotherhood',
  '/personal-jetton',
  '/borrow',
  '/city-network',
  '/dao',
  '/dns',
  '/staking',
];

const DRILL_DOWN_BACK_ROUTES: Record<string, { path: string; label: string }> =
  {
    '/wallet/nft': { path: '/wallet', label: 'Wallet' },
    '/wallet/assets': { path: '/wallet', label: 'Wallet' },
    '/send': { path: '/wallet', label: 'Wallet' },
    '/swap': { path: '/wallet', label: 'Wallet' },
    '/settings': { path: '/wallet', label: 'Wallet' },
  };

export function getEcosystemRouteMeta(routePath: string) {
  return (
    ECOSYSTEM_NAV_ITEMS.find((item) => item.path === routePath) ?? {
      id: routePath.replace('/', ''),
      label: routePath.replace('/', '') || 'Wallet',
      path: routePath,
      icon: undefined,
    }
  );
}

interface ScreenSwipeContainerProps {
  children: React.ReactNode;
}

export const ScreenSwipeContainer: React.FC<ScreenSwipeContainerProps> = ({
  children,
}) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [isSettingsOpen] = useSettingsModal();
  const { isReduced } = useAnimationSettings();

  const kinematicsRef = useRef<SwipeKinematicState | null>(null);
  const touchTargetRef = useRef<HTMLElement | null>(null);
  const isIgnoredRef = useRef(false);

  const isSubTabScreen = SUB_TAB_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  const drillDownBackTarget = DRILL_DOWN_BACK_ROUTES[pathname] ?? null;

  const getActiveTabIndex = () => {
    if (pathname === '/' || pathname === '/wallet') return 0;
    if (pathname.startsWith('/brotherhood')) return 1;
    if (pathname.startsWith('/personal-jetton')) return 2;
    if (pathname.startsWith('/borrow')) return 3;
    if (pathname.startsWith('/city-network')) return 4;
    if (pathname.startsWith('/dao')) return 5;
    if (pathname.startsWith('/lottery')) return 6;
    if (pathname.startsWith('/dns')) return 7;
    return -1;
  };

  const resolveTargetForDirection = (direction: 'next' | 'prev') => {
    if (drillDownBackTarget) {
      // On drill-down screens, only swipe-right ('prev' = left-to-right finger motion) navigates back
      if (direction === 'prev') {
        return {
          scope: 'back' as const,
          fromId: pathname,
          toId: drillDownBackTarget.path,
          toLabel: drillDownBackTarget.label,
          toSubLabel: 'Navigate Back',
          toIcon: ArrowLeft,
          targetPath: drillDownBackTarget.path,
        };
      }
      return null;
    }

    const currentIdx = getActiveTabIndex();
    if (currentIdx === -1) return null;

    const total = ECOSYSTEM_SWIPE_ROUTES.length;
    const targetIdx =
      direction === 'next'
        ? (currentIdx + 1) % total
        : (currentIdx - 1 + total) % total;

    const currentRoute = ECOSYSTEM_SWIPE_ROUTES[currentIdx];
    const targetRoute = ECOSYSTEM_SWIPE_ROUTES[targetIdx];
    const meta = getEcosystemRouteMeta(targetRoute);

    return {
      scope: 'screen' as const,
      fromId: currentRoute,
      toId: targetRoute,
      toLabel: meta.label,
      toSubLabel: direction === 'next' ? 'Next Screen' : 'Prev Screen',
      toIcon: meta.icon,
      targetPath: targetRoute,
    };
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (isSettingsOpen || isSubTabScreen) {
      isIgnoredRef.current = true;
      return;
    }

    const target = e.target as HTMLElement | null;
    touchTargetRef.current = target;
    if (shouldIgnoreSwipeStart(target)) {
      isIgnoredRef.current = true;
      return;
    }

    isIgnoredRef.current = false;
    kinematicsRef.current = createSwipeKinematicState(
      e.touches[0].clientX,
      e.touches[0].clientY,
    );
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (isIgnoredRef.current || !kinematicsRef.current) {
      return;
    }

    const step = updateSwipeKinematics(
      kinematicsRef.current,
      e.touches[0].clientX,
      e.touches[0].clientY,
      SWIPE_COMMIT_DISTANCE_PX,
    );

    if (step.isHorizontal === false) {
      isIgnoredRef.current = true;
      setActiveSwipePreview(null);
      return;
    }

    if (step.isHorizontal) {
      if (canTargetScrollHorizontally(touchTargetRef.current, step.direction)) {
        isIgnoredRef.current = true;
        setActiveSwipePreview(null);
        return;
      }

      const targetInfo = resolveTargetForDirection(step.direction);
      if (!targetInfo) {
        setActiveSwipePreview(null);
        return;
      }

      setActiveSwipePreview({
        scope: targetInfo.scope,
        direction: step.direction,
        fromId: targetInfo.fromId,
        toId: targetInfo.toId,
        toLabel: targetInfo.toLabel,
        toSubLabel: targetInfo.toSubLabel,
        toIcon: targetInfo.toIcon,
        progress: step.progress,
        dragOffset: step.dragOffset,
        isArmed: step.isArmed,
        isCanceled: step.isCanceled,
      });
    }
  };

  const onTouchEnd = () => {
    const kin = kinematicsRef.current;
    kinematicsRef.current = null;

    const preview = getActiveSwipePreview();
    setActiveSwipePreview(null);

    if (isIgnoredRef.current || !kin || !kin.isHorizontal) {
      return;
    }

    const direction: 'next' | 'prev' = kin.swipeSign < 0 ? 'next' : 'prev';
    const isReverseFlick =
      kin.peakAbsX > 20 && kin.velocityX * kin.swipeSign < -0.18;

    if (preview && preview.isArmed && !preview.isCanceled && !isReverseFlick) {
      const targetInfo = resolveTargetForDirection(direction);
      if (targetInfo) {
        navigate(targetInfo.targetPath);
      }
    }
  };

  return (
    <div
      className="screen-swipe-container relative w-full flex-1 flex flex-col touch-pan-y overflow-x-clip"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
    >
      <div
        key={pathname}
        className={
          isReduced
            ? 'w-full flex-1 flex flex-col'
            : 'animate-in fade-in duration-150 w-full flex-1 flex flex-col'
        }
      >
        {children}
      </div>

      {!isReduced && <PredictiveSwipeOverlay />}
    </div>
  );
};
