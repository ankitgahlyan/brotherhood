/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useRef, useState, useCallback, useMemo } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Layers } from 'lucide-react';
import { useLocation, useNavigate } from '@/core/routing';
import { useScrollDirection } from '@/core/hooks';
import {
  ECOSYSTEM_SWIPE_ROUTES,
  getEcosystemRouteMeta,
} from '../screen-swipe-container';
import {
  createSwipeKinematicState,
  getActiveSwipePreview,
  setActiveSwipePreview,
  shouldIgnoreSwipeStart,
  SWIPE_COMMIT_DISTANCE_PX,
  updateSwipeKinematics,
  type SwipeKinematicState,
} from '@/core/lib/swipe-gesture-store';
import type { TabItem } from '@/core/components/ui/tabs/scrollable-tab-bar';

export interface SwipeableSubTabsProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  loop?: boolean;
  className?: string;
  onBoundaryPrev?: () => void;
  onBoundaryNext?: () => void;
  boundaryPrevLabel?: string;
  boundaryNextLabel?: string;
  pinnedHeader?: React.ReactNode;
  stickyTabBar?: React.ReactNode;
  children: React.ReactNode;
}

function formatTabIdLabel(id: string): string {
  return id
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export const SwipeableSubTabs: React.FC<SwipeableSubTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  loop = false,
  className = '',
  onBoundaryPrev,
  onBoundaryNext,
  boundaryPrevLabel,
  boundaryNextLabel,
  pinnedHeader,
  stickyTabBar,
  children,
}) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isBarsVisible = useScrollDirection();

  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const kinematicsRef = useRef<SwipeKinematicState | null>(null);
  const isIgnoredRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  const currentIndex = tabs.indexOf(activeTab);

  // Extract tab metadata (label + icon) from stickyTabBar if it is a ScrollableTabBar element
  const tabMetaMap = useMemo(() => {
    const map = new Map<
      string,
      {
        label: string;
        icon?: LucideIcon | React.ComponentType<{ className?: string }>;
      }
    >();
    if (React.isValidElement(stickyTabBar)) {
      const props = stickyTabBar.props as { tabs?: TabItem[] } | undefined;
      if (Array.isArray(props?.tabs)) {
        for (const item of props.tabs) {
          if (item && typeof item.id === 'string') {
            map.set(item.id, {
              label: item.label || formatTabIdLabel(item.id),
              icon: item.icon,
            });
          }
        }
      }
    }
    return map;
  }, [stickyTabBar]);

  const resolveAdjacentMainScreen = useCallback(
    (dir: 'next' | 'prev') => {
      const currentRouteIdx = ECOSYSTEM_SWIPE_ROUTES.findIndex((r) =>
        pathname.startsWith(r),
      );
      if (currentRouteIdx === -1) return null;
      const total = ECOSYSTEM_SWIPE_ROUTES.length;
      const targetIdx =
        dir === 'next'
          ? (currentRouteIdx + 1) % total
          : (currentRouteIdx - 1 + total) % total;
      const currentRoute = ECOSYSTEM_SWIPE_ROUTES[currentRouteIdx];
      const targetRoute = ECOSYSTEM_SWIPE_ROUTES[targetIdx];
      const meta = getEcosystemRouteMeta(targetRoute);
      return {
        currentRoute,
        targetRoute,
        label: meta.label,
        icon: meta.icon,
      };
    },
    [pathname],
  );

  const handleBoundaryPrev = useCallback(() => {
    if (onBoundaryPrev) {
      onBoundaryPrev();
      return;
    }
    const adj = resolveAdjacentMainScreen('prev');
    if (adj) {
      navigate(adj.targetRoute);
    }
  }, [onBoundaryPrev, resolveAdjacentMainScreen, navigate]);

  const handleBoundaryNext = useCallback(() => {
    if (onBoundaryNext) {
      onBoundaryNext();
      return;
    }
    const adj = resolveAdjacentMainScreen('next');
    if (adj) {
      navigate(adj.targetRoute);
    }
  }, [onBoundaryNext, resolveAdjacentMainScreen, navigate]);

  const resolveSwipeDestination = useCallback(
    (direction: 'next' | 'prev') => {
      const current = currentIndex >= 0 ? currentIndex : 0;
      const count = tabs.length;

      if (direction === 'next') {
        if (current < count - 1) {
          const nextTabId = tabs[current + 1];
          const meta = tabMetaMap.get(nextTabId);
          return {
            scope: 'subtab' as const,
            fromId: activeTab,
            toId: nextTabId,
            toLabel: meta?.label ?? formatTabIdLabel(nextTabId),
            toSubLabel: 'Next Tab',
            toIcon: meta?.icon ?? Layers,
            commit: () => onTabChange(nextTabId),
          };
        }
        if (loop && count > 1) {
          const firstTabId = tabs[0];
          const meta = tabMetaMap.get(firstTabId);
          return {
            scope: 'subtab' as const,
            fromId: activeTab,
            toId: firstTabId,
            toLabel: meta?.label ?? formatTabIdLabel(firstTabId),
            toSubLabel: 'First Tab',
            toIcon: meta?.icon ?? Layers,
            commit: () => onTabChange(firstTabId),
          };
        }
        if (onBoundaryNext) {
          return {
            scope: 'subtab' as const,
            fromId: activeTab,
            toId: '__boundary_next__',
            toLabel: boundaryNextLabel ?? 'Next Section',
            toSubLabel: 'Next Section',
            toIcon: Layers,
            commit: handleBoundaryNext,
          };
        }
        const adj = resolveAdjacentMainScreen('next');
        if (adj) {
          return {
            scope: 'screen' as const,
            fromId: adj.currentRoute,
            toId: adj.targetRoute,
            toLabel: adj.label,
            toSubLabel: 'Next Screen',
            toIcon: adj.icon,
            commit: handleBoundaryNext,
          };
        }
        return null;
      }

      // direction === 'prev'
      if (current > 0) {
        const prevTabId = tabs[current - 1];
        const meta = tabMetaMap.get(prevTabId);
        return {
          scope: 'subtab' as const,
          fromId: activeTab,
          toId: prevTabId,
          toLabel: meta?.label ?? formatTabIdLabel(prevTabId),
          toSubLabel: 'Prev Tab',
          toIcon: meta?.icon ?? Layers,
          commit: () => onTabChange(prevTabId),
        };
      }
      if (loop && count > 1) {
        const lastTabId = tabs[count - 1];
        const meta = tabMetaMap.get(lastTabId);
        return {
          scope: 'subtab' as const,
          fromId: activeTab,
          toId: lastTabId,
          toLabel: meta?.label ?? formatTabIdLabel(lastTabId),
          toSubLabel: 'Last Tab',
          toIcon: meta?.icon ?? Layers,
          commit: () => onTabChange(lastTabId),
        };
      }
      if (onBoundaryPrev) {
        return {
          scope: 'subtab' as const,
          fromId: activeTab,
          toId: '__boundary_prev__',
          toLabel: boundaryPrevLabel ?? 'Prev Section',
          toSubLabel: 'Prev Section',
          toIcon: Layers,
          commit: handleBoundaryPrev,
        };
      }
      const adj = resolveAdjacentMainScreen('prev');
      if (adj) {
        return {
          scope: 'screen' as const,
          fromId: adj.currentRoute,
          toId: adj.targetRoute,
          toLabel: adj.label,
          toSubLabel: 'Prev Screen',
          toIcon: adj.icon,
          commit: handleBoundaryPrev,
        };
      }
      return null;
    },
    [
      currentIndex,
      tabs,
      loop,
      onBoundaryNext,
      onBoundaryPrev,
      boundaryNextLabel,
      boundaryPrevLabel,
      resolveAdjacentMainScreen,
      tabMetaMap,
      activeTab,
      onTabChange,
      handleBoundaryNext,
      handleBoundaryPrev,
    ],
  );

  const onTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    const target = e.target as HTMLElement | null;
    if (shouldIgnoreSwipeStart(target)) {
      isIgnoredRef.current = true;
      return;
    }

    isIgnoredRef.current = false;
    kinematicsRef.current = createSwipeKinematicState(
      e.touches[0].clientX,
      e.touches[0].clientY,
    );
    setIsDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation();
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
      setDragOffset(0);
      setIsDragging(false);
      setActiveSwipePreview(null);
      return;
    }

    if (step.isHorizontal) {
      const dest = resolveSwipeDestination(step.direction);
      if (!dest) {
        setDragOffset(0);
        setActiveSwipePreview(null);
        return;
      }

      setActiveSwipePreview({
        scope: dest.scope,
        direction: step.direction,
        fromId: dest.fromId,
        toId: dest.toId,
        toLabel: dest.toLabel,
        toSubLabel: dest.toSubLabel,
        toIcon: dest.toIcon,
        progress: step.progress,
        dragOffset: step.dragOffset,
        isArmed: step.isArmed,
        isCanceled: step.isCanceled,
      });

      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(() => {
        setDragOffset(step.dragOffset);
        rafRef.current = null;
      });
    }
  };

  const onTouchEnd = (e?: React.TouchEvent) => {
    e?.stopPropagation();
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    const kin = kinematicsRef.current;
    kinematicsRef.current = null;

    const preview = getActiveSwipePreview();
    setActiveSwipePreview(null);
    setDragOffset(0);
    setIsDragging(false);

    if (isIgnoredRef.current || !kin || !kin.isHorizontal) {
      return;
    }

    const direction: 'next' | 'prev' = kin.swipeSign < 0 ? 'next' : 'prev';
    const isReverseFlick =
      kin.peakAbsX > 20 && kin.velocityX * kin.swipeSign < -0.18;

    if (preview && preview.isArmed && !preview.isCanceled && !isReverseFlick) {
      const dest = resolveSwipeDestination(direction);
      if (dest) {
        dest.commit();
      }
    }
  };

  return (
    <div
      className={`swipeable-sub-tabs-container touch-pan-y flex flex-col flex-1 w-full overflow-x-clip ${
        className.includes('min-h') ? '' : 'min-h-[calc(100vh-180px)]'
      } ${className}`}
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
          transform: dragOffset
            ? `translate3d(${dragOffset}px, 0, 0)`
            : undefined,
          opacity: dragOffset
            ? Math.max(0.62, 1 - Math.abs(dragOffset) / 340)
            : undefined,
          transition: isDragging
            ? 'none'
            : 'transform 240ms cubic-bezier(0.22, 1, 0.36, 1), opacity 220ms ease-out',
        }}
      >
        {children}
      </div>
    </div>
  );
};
