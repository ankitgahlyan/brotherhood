/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useSyncExternalStore } from 'react';
import type React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface ActiveSwipePreview {
  /** Whether the swipe is transitioning between main bottom-nav screens, sub-tabs, or back from a drill-down route */
  scope: 'screen' | 'subtab' | 'back' | 'wallet';
  /** 'next' when swiping left (finger moves right-to-left), 'prev' when swiping right (finger moves left-to-right) */
  direction: 'next' | 'prev';
  fromId: string;
  toId: string;
  toLabel: string;
  toSubLabel: string;
  toIcon?: LucideIcon | React.ComponentType<{ className?: string }>;
  accentColor?: string;
  /** Normalized progress toward commit threshold (0 to 1) */
  progress: number;
  /** Visual rubber-band drag offset in px */
  dragOffset: number;
  /** True when swipe has crossed commit threshold or flick velocity and is NOT canceled */
  isArmed: boolean;
  /** True when user pulled finger back toward origin without lifting */
  isCanceled: boolean;
}

let currentPreview: ActiveSwipePreview | null = null;
const listeners = new Set<() => void>();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

export function setActiveSwipePreview(preview: ActiveSwipePreview | null) {
  if (currentPreview === preview) return;
  currentPreview = preview;
  emitChange();
}

export function getActiveSwipePreview(): ActiveSwipePreview | null {
  return currentPreview;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useActiveSwipePreview(): ActiveSwipePreview | null {
  return useSyncExternalStore(
    subscribe,
    getActiveSwipePreview,
    getActiveSwipePreview,
  );
}

/**
 * Checks whether a touch start event originated inside an element that should
 * isolate its own horizontal gestures (explicit opt-out or any horizontally scrollable container).
 */
export function shouldIgnoreSwipeStart(target: HTMLElement | null): boolean {
  if (!target) return false;

  if (
    target.closest('[data-swipe-ignore="true"]') ||
    target.closest('.no-swipe') ||
    target.closest('nav') ||
    target.closest('[aria-label="Bottom Navigation"]') ||
    target.closest('[role="dialog"]') ||
    target.closest(
      'input[type="range"], [role="slider"], [contenteditable="true"]',
    )
  ) {
    return true;
  }

  // Walk up DOM tree to auto-detect any horizontally scrollable container
  let el: HTMLElement | null = target;
  while (el && el !== document.body && el !== document.documentElement) {
    if (
      el.classList.contains('screen-swipe-container') ||
      el.classList.contains('swipeable-sub-tabs-container')
    ) {
      break;
    }

    if (el.scrollWidth > el.clientWidth + 4) {
      const style = window.getComputedStyle(el);
      const overflowX = style.overflowX;
      if (
        overflowX === 'auto' ||
        overflowX === 'scroll' ||
        overflowX === 'overlay'
      ) {
        return true;
      }
    }
    el = el.parentElement;
  }

  return false;
}

export const SWIPE_COMMIT_DISTANCE_PX = 64;
export const SWIPE_PULLBACK_CANCEL_PX = 12;
export const SWIPE_REARM_PUSH_PX = 14;
export const SWIPE_FLICK_MIN_DISTANCE_PX = 38;
export const SWIPE_FLICK_VELOCITY_PX_MS = 0.45;

export interface SwipeKinematicState {
  startX: number;
  startY: number;
  lastX: number;
  lastTime: number;
  velocityX: number;
  isHorizontal: boolean | null;
  swipeSign: number; // -1 for left swipe ('next'), +1 for right swipe ('prev')
  peakAbsX: number;
  troughAbsX: number;
  isCanceled: boolean;
}

export function createSwipeKinematicState(
  clientX: number,
  clientY: number,
): SwipeKinematicState {
  return {
    startX: clientX,
    startY: clientY,
    lastX: clientX,
    lastTime: performance.now(),
    velocityX: 0,
    isHorizontal: null,
    swipeSign: 0,
    peakAbsX: 0,
    troughAbsX: 0,
    isCanceled: false,
  };
}

export interface SwipeStepEvaluation {
  isHorizontal: boolean | null;
  diffX: number;
  dragOffset: number;
  progress: number;
  isArmed: boolean;
  isCanceled: boolean;
  direction: 'next' | 'prev';
}

export function computeRubberBandOffset(
  diffX: number,
  maxVisual = 110,
): number {
  const abs = Math.abs(diffX);
  const sign = Math.sign(diffX);
  // Smooth hyperbolic-like damping
  const damped = (abs * 0.48) / (1 + abs / (maxVisual * 2.4));
  return sign * Math.min(maxVisual, damped);
}

/**
 * Updates kinematic tracking on touchmove/mousemove and determines whether the
 * swipe is armed or canceled by a finger pullback without lifting.
 */
export function updateSwipeKinematics(
  state: SwipeKinematicState,
  clientX: number,
  clientY: number,
  commitDistance = SWIPE_COMMIT_DISTANCE_PX,
): SwipeStepEvaluation {
  const now = performance.now();
  const dt = Math.max(1, now - state.lastTime);
  const instantVx = (clientX - state.lastX) / dt;
  // Exponential moving average for smooth velocity
  state.velocityX = state.velocityX * 0.45 + instantVx * 0.55;
  state.lastX = clientX;
  state.lastTime = now;

  const diffX = clientX - state.startX;
  const diffY = clientY - state.startY;
  const absX = Math.abs(diffX);
  const absY = Math.abs(diffY);

  if (state.isHorizontal === null) {
    if (absX > 7 || absY > 7) {
      state.isHorizontal = absX > absY * 1.15;
    }
  }

  const sign = diffX < 0 ? -1 : diffX > 0 ? 1 : state.swipeSign || -1;
  const direction: 'next' | 'prev' = sign < 0 ? 'next' : 'prev';

  if (!state.isHorizontal) {
    return {
      isHorizontal: state.isHorizontal,
      diffX,
      dragOffset: 0,
      progress: 0,
      isArmed: false,
      isCanceled: false,
      direction,
    };
  }

  // If direction crossed over origin completely after peaking, reset or mark canceled
  if (state.swipeSign !== 0 && sign !== state.swipeSign) {
    state.swipeSign = sign;
    state.peakAbsX = absX;
    state.troughAbsX = absX;
    state.isCanceled = absX < commitDistance * 0.5;
  } else {
    state.swipeSign = sign;
    if (!state.isCanceled) {
      if (absX >= state.peakAbsX) {
        state.peakAbsX = absX;
      } else if (state.peakAbsX - absX >= SWIPE_PULLBACK_CANCEL_PX) {
        // User pulled their finger back toward origin >= 12px without lifting!
        state.isCanceled = true;
        state.troughAbsX = absX;
      }
    } else {
      // Currently in pullback-canceled state; track lowest trough and allow re-arming if user pushes outward again
      if (absX <= state.troughAbsX) {
        state.troughAbsX = absX;
      } else if (absX - state.troughAbsX >= SWIPE_REARM_PUSH_PX) {
        state.isCanceled = false;
        state.peakAbsX = absX;
      }
    }
  }

  const rawProgress = Math.min(1, absX / commitDistance);
  const isFlickForward =
    absX >= SWIPE_FLICK_MIN_DISTANCE_PX &&
    Math.abs(state.velocityX) >= SWIPE_FLICK_VELOCITY_PX_MS &&
    Math.sign(state.velocityX) === sign;

  // Also check if instantaneous velocity is strongly reversing toward origin
  const isVelocityReversing =
    state.peakAbsX > 24 && state.velocityX * sign < -0.22;

  const effectiveCanceled = state.isCanceled || isVelocityReversing;
  const isArmed =
    !effectiveCanceled && (absX >= commitDistance || isFlickForward);

  return {
    isHorizontal: true,
    diffX,
    dragOffset: computeRubberBandOffset(diffX),
    progress: rawProgress,
    isArmed,
    isCanceled: effectiveCanceled && state.peakAbsX >= 20,
    direction,
  };
}
