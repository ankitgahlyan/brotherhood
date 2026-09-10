/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  isTelegramEnvironment,
  showTelegramBackButton,
  hideTelegramBackButton,
  subscribeTelegramBackButton,
} from '../telegram';

interface BackStackEntry {
  id: number;
  callback: () => void;
  syncHistory?: boolean;
  isClosed?: boolean;
}

const stack: BackStackEntry[] = [];
let nextId = 1;
let isTelegramSubscribed = false;
let isPopstateSubscribed = false;
let routerBackHandler: (() => void) | undefined = undefined;
let isAtRootRoute = true;
let isAlteringHistory = false;

function updateNativeBackButtonState(): void {
  const hasModals = stack.some((entry) => !entry.isClosed);
  const shouldShow = hasModals || !isAtRootRoute;

  if (shouldShow) {
    showTelegramBackButton();
  } else {
    hideTelegramBackButton();
  }
}

/**
 * Executes the topmost back action (modal dismiss or router back).
 */
export function handleGlobalBack(): boolean {
  for (let i = stack.length - 1; i >= 0; i--) {
    const entry = stack[i];
    if (!entry.isClosed) {
      entry.isClosed = true;
      try {
        entry.callback();
      } catch (err) {
        console.error('[BackStack] Error executing back callback:', err);
      }
      updateNativeBackButtonState();
      return true;
    }
  }

  // Tier 2: Router back navigation
  if (!isAtRootRoute && routerBackHandler) {
    try {
      routerBackHandler();
      return true;
    } catch (err) {
      console.error('[BackStack] Error executing router back:', err);
    }
  }

  updateNativeBackButtonState();
  return false;
}

function initTelegramBackButtonListener(): void {
  if (isTelegramSubscribed || typeof window === 'undefined') return;
  if (!isTelegramEnvironment()) return;

  subscribeTelegramBackButton(() => {
    handleGlobalBack();
  });
  isTelegramSubscribed = true;
}

function initPopstateListener(): void {
  if (isPopstateSubscribed || typeof window === 'undefined') return;

  window.addEventListener('popstate', () => {
    if (isAlteringHistory) {
      isAlteringHistory = false;
      return;
    }

    const hasOpenModal = stack.some((entry) => !entry.isClosed);
    if (hasOpenModal) {
      // Find top open modal
      for (let i = stack.length - 1; i >= 0; i--) {
        const entry = stack[i];
        if (!entry.isClosed) {
          entry.isClosed = true;
          try {
            entry.callback();
          } catch (err) {
            console.error('[BackStack] Error executing popstate callback:', err);
          }
          break;
        }
      }
      updateNativeBackButtonState();
    }
  });

  isPopstateSubscribed = true;
}

/**
 * Register router navigation handler and root route status for Tier 2/3 back handling.
 */
export function registerRouterBack(handler: () => void, isRoot: boolean): void {
  initTelegramBackButtonListener();
  initPopstateListener();
  routerBackHandler = handler;
  isAtRootRoute = isRoot;
  updateNativeBackButtonState();
}

/**
 * Registers an active modal/sheet with the back stack.
 */
export function registerBackCallback(
  callback: () => void,
  options?: { syncHistory?: boolean },
): number {
  initTelegramBackButtonListener();
  initPopstateListener();

  const id = nextId++;
  const syncHistory = options?.syncHistory ?? true;

  if (syncHistory && typeof window !== 'undefined' && !isTelegramEnvironment()) {
    try {
      window.history.pushState({ modalId: id }, '');
    } catch {
      // ignore
    }
  }

  stack.push({
    id,
    callback,
    syncHistory,
    isClosed: false,
  });

  updateNativeBackButtonState();
  return id;
}

/**
 * Unregisters a modal/sheet from the back stack.
 */
export function unregisterBackCallback(id: number): void {
  const index = stack.findIndex((entry) => entry.id === id);
  if (index !== -1) {
    const entry = stack[index];
    const wasOpen = !entry.isClosed;
    stack.splice(index, 1);

    if (wasOpen && entry.syncHistory && typeof window !== 'undefined' && !isTelegramEnvironment()) {
      try {
        if (window.history.state?.modalId === id) {
          isAlteringHistory = true;
          window.history.back();
        }
      } catch {
        // ignore
      }
    }

    updateNativeBackButtonState();
  }
}
