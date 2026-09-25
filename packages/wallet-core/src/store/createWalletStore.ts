/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { create } from 'zustand';
import {
  devtools,
  persist,
  createJSONStorage,
  subscribeWithSelector,
  type StateStorage,
} from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { createAuthSlice, getSessionPassword } from './slices/authSlice';
import { createWalletCoreSlice } from './slices/walletCoreSlice';
import { createWalletManagementSlice } from './slices/walletManagementSlice';
import { createTonConnectSlice } from './slices/tonConnectSlice';
import { createJettonsSlice } from './slices/jettonsSlice';
import { createNftsSlice } from './slices/nftsSlice';
import { createRatesSlice } from './slices/ratesSlice';
import { createSwapSlice } from './slices/swapSlice';
import { createStakingSlice } from './slices/stakingSlice';
import { createGaslessSlice } from './slices/gaslessSlice';
import { createBrotherhoodSlice } from './slices/brotherhoodSlice';
import { createPreferencesSlice } from './slices/preferencesSlice';
import type { AppState } from '../types/store';
import type { StorageAdapter } from '../adapters/storage/types';
import type { WalletKitConfig } from '../types/wallet';

const STORE_VERSION = 2;

export interface CreateWalletStoreOptions {
  /**
   * Storage adapter for persisting wallet data
   * Use LocalStorageAdapter for web, AsyncStorageAdapter for React Native
   */
  storage?: StorageAdapter;

  /**
   * Enable Redux DevTools
   */
  enableDevtools?: boolean;

  /**
   * Custom logger function
   */
  logger?: {
    info: (...args: unknown[]) => void;
    warn: (...args: unknown[]) => void;
    error: (...args: unknown[]) => void;
  };

  walletKitConfig?: WalletKitConfig;
}

const createLogger = (customLogger?: CreateWalletStoreOptions['logger']) => {
  if (customLogger) return customLogger;

  return {
    info: (...args: unknown[]) => console.log('[WalletStore]', ...args),

    warn: (...args: unknown[]) => console.warn('[WalletStore]', ...args),

    error: (...args: unknown[]) => console.error('[WalletStore]', ...args),
  };
};

const migrate = (
  persistedState: unknown,
  fromVersion: number,
  log: ReturnType<typeof createLogger>,
): unknown => {
  log.info('Migrating store from version', fromVersion, 'to', STORE_VERSION);

  let state = persistedState as Record<string, any>;

  // Migration from v1 (old wallet slice) to v2 (split slices)
  if (fromVersion < 2) {
    // Move wallet state to walletManagement
    const walletState = state.wallet || {};

    state = {
      auth: state.auth || {},
      walletCore: {
        walletKit: null,
        walletKitInitializer: null,
      },
      walletManagement: {
        savedWallets: walletState.savedWallets || [],
        activeWalletId: walletState.activeWalletId,
        hasWallet: walletState.hasWallet || false,
        isAuthenticated: false,
        events: [],
      },
      tonConnect: {
        requestQueue: walletState.requestQueue || {
          items: [],
          currentRequestId: undefined,
          isProcessing: false,
        },
        pendingConnectRequest: walletState.pendingConnectRequest,
        isConnectModalOpen: walletState.isConnectModalOpen || false,
        pendingTransactionRequest: walletState.pendingTransactionRequest,
        isTransactionModalOpen: walletState.isTransactionModalOpen || false,
        pendingSignDataRequest: walletState.pendingSignDataRequest,
        isSignDataModalOpen: walletState.isSignDataModalOpen || false,
        disconnectedSessions: walletState.disconnectedSessions || [],
      },
      jettons: state.jettons,
      nfts: state.nfts,
    };
  }

  return state;
};

/**
 * Creates a Zustand store for wallet management
 */
export function createWalletStore(options: CreateWalletStoreOptions = {}) {
  const {
    storage,
    enableDevtools = true,
    logger: customLogger,
    walletKitConfig,
  } = options;

  const log = createLogger(customLogger);

  const store = create<AppState>()(
    devtools(
      subscribeWithSelector(
        persist(
          immer((...a) => ({
            isHydrated: false,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            ...createAuthSlice(...a),
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            ...createWalletCoreSlice(walletKitConfig)(...a),
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            ...createWalletManagementSlice(walletKitConfig)(...a),
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            ...createTonConnectSlice(...a),
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            ...createJettonsSlice(...a),
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            ...createNftsSlice(...a),
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            ...createRatesSlice(...a),
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            ...createSwapSlice(...a),
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            ...createStakingSlice(...a),
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            ...createGaslessSlice(...a),
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            ...createBrotherhoodSlice(...a),
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            ...createPreferencesSlice(...a),
          })) as unknown as any,
          {
            name: 'bro-store',
            storage: createJSONStorage(
              () => {
                const targetStorage: StateStorage =
                  storage ||
                  (typeof window !== 'undefined'
                    ? window.localStorage
                    : (undefined as unknown as StateStorage));

                if (!targetStorage) {
                  return {
                    getItem: () => null,
                    setItem: () => {},
                    removeItem: () => {},
                  };
                }

                return {
                  getItem: (name: string) => targetStorage.getItem(name),
                  removeItem: (name: string) => targetStorage.removeItem(name),
                  setItem: (name: string, value: string) => {
                    try {
                      targetStorage.setItem(name, value);
                    } catch (err: any) {
                      const isQuotaError =
                        err?.name === 'QuotaExceededError' ||
                        err?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
                        err?.code === 22 ||
                        err?.code === 1014;

                      if (!isQuotaError) {
                        throw err;
                      }

                      log.warn(
                        '[createWalletStore] QuotaExceededError on setItem. Evicting non-essential event caches...',
                      );

                      try {
                        const parsed = JSON.parse(value);
                        if (parsed?.state?.walletManagement?.eventsByAddress) {
                          const pruned: Record<string, unknown[]> = {};
                          for (const [addr, evs] of Object.entries(
                            parsed.state.walletManagement.eventsByAddress,
                          )) {
                            pruned[addr] = Array.isArray(evs)
                              ? evs.slice(0, 5)
                              : [];
                          }
                          parsed.state.walletManagement.eventsByAddress =
                            pruned;
                        }
                        if (parsed?.state?.jettons?.jettonsByAddress) {
                          parsed.state.jettons.jettonsByAddress = {};
                        }
                        targetStorage.setItem(name, JSON.stringify(parsed));
                        log.info(
                          '[createWalletStore] Resumed write after emergency cache pruning.',
                        );
                      } catch (innerErr) {
                        log.error(
                          '[createWalletStore] Failed to write after cache pruning:',
                          innerErr,
                        );
                      }
                    }
                  },
                };
              },
              {
                replacer: (_key, value) =>
                  typeof value === 'bigint'
                    ? `@bigint:${value.toString()}`
                    : value,
                reviver: (_key, value) => {
                  if (
                    typeof value === 'string' &&
                    value.startsWith('@bigint:')
                  ) {
                    try {
                      return BigInt(value.slice(8));
                    } catch {
                      return value;
                    }
                  }
                  return value;
                },
              },
            ),
            version: STORE_VERSION,
            migrate: (persistedState, fromVersion) =>
              migrate(persistedState, fromVersion, log),
            partialize: (state) => ({
              auth: {
                isPasswordSet: state.auth.isPasswordSet,
                passwordHash: state.auth.passwordHash,
                persistPassword: state.auth.persistPassword,
                holdToSign: state.auth.holdToSign,
                showFastSend: state.auth.showFastSend,
                useWalletInterfaceType: state.auth.useWalletInterfaceType,
                ledgerAccountNumber: state.auth.ledgerAccountNumber,
                ...(state.auth.persistPassword && {
                  currentPassword: state.auth.currentPassword,
                }),
              },
              walletManagement: {
                hasWallet: state.walletManagement.hasWallet,
                savedWallets: state.walletManagement.savedWallets,
                activeWalletId: state.walletManagement.activeWalletId,
                address: state.walletManagement.address,
                balance: state.walletManagement.balance,
                balancesByAddress:
                  state.walletManagement.balancesByAddress || {},
                eventsByAddress: Object.fromEntries(
                  Object.entries(
                    state.walletManagement.eventsByAddress || {},
                  ).map(([addr, events]) => [
                    addr,
                    Array.isArray(events)
                      ? events.slice(0, 20).map((ev: any) => {
                          if (!ev || typeof ev !== 'object') return ev;
                          const {
                            trace: _trace,
                            transactions: _transactions,
                            ...cleaned
                          } = ev;
                          return cleaned;
                        })
                      : [],
                  ]),
                ),
                associatedAddressesByAddress:
                  state.walletManagement.associatedAddressesByAddress || {},
                confirmedTraceIds:
                  state.walletManagement.confirmedTraceIds?.slice(-100) || [],
                confirmedExternalHashes:
                  state.walletManagement.confirmedExternalHashes?.slice(-100) ||
                  [],
              },
              tonConnect: {
                requestQueue: {
                  items: state.tonConnect.requestQueue.items,
                },
                isSignDataModalOpen: state.tonConnect.isSignDataModalOpen,
                isTransactionModalOpen: state.tonConnect.isTransactionModalOpen,
                isConnectModalOpen: state.tonConnect.isConnectModalOpen,
                pendingSignDataRequest:
                  state.tonConnect.pendingSignDataRequestEvent,
                pendingTransactionRequest:
                  state.tonConnect.pendingTransactionRequestEvent,
                pendingConnectRequest:
                  state.tonConnect.pendingConnectRequestEvent,
              },
              jettons: {
                jettonsByAddress: state.jettons?.jettonsByAddress || {},
                lastJettonsUpdate: state.jettons?.lastJettonsUpdate || 0,
              },
              brotherhood: {
                brotherhoodByAddress:
                  state.brotherhood?.brotherhoodByAddress || {},
                pendingDeferredByAddress:
                  state.brotherhood?.pendingDeferredByAddress || {},
                watchedLocations: state.brotherhood?.watchedLocations || [],
              },
              preferences: {
                animationLevel: state.preferences?.animationLevel,
                isCustomAnimationLevel:
                  state.preferences?.isCustomAnimationLevel,
              },
            }),
            merge: (persistedState, currentState) => {
              const persisted = persistedState as any;

              const activeWallet = (
                persisted?.walletManagement?.savedWallets || []
              ).find(
                (w: any) =>
                  w.id === persisted?.walletManagement?.activeWalletId,
              );

              const sessionPassword = getSessionPassword();
              const effectivePassword =
                (persisted?.auth?.persistPassword
                  ? persisted?.auth?.currentPassword
                  : undefined) ||
                sessionPassword ||
                currentState?.auth?.currentPassword;

              const isUnlocked = Boolean(
                persisted?.auth?.isPasswordSet && effectivePassword,
              );

              const merged = {
                ...currentState,
                auth: {
                  ...currentState.auth,
                  ...persisted?.auth,
                  currentPassword: effectivePassword,
                  isUnlocked,
                },
                walletManagement: {
                  ...currentState.walletManagement,
                  savedWallets: persisted?.walletManagement?.savedWallets || [],
                  activeWalletId: persisted?.walletManagement?.activeWalletId,
                  address:
                    persisted?.walletManagement?.address ||
                    activeWallet?.address,
                  balancesByAddress:
                    persisted?.walletManagement?.balancesByAddress || {},
                  balance:
                    (activeWallet?.address &&
                      persisted?.walletManagement?.balancesByAddress?.[
                        activeWallet.address
                      ]) ||
                    persisted?.walletManagement?.balance,
                  eventsByAddress:
                    persisted?.walletManagement?.eventsByAddress || {},
                  associatedAddressesByAddress:
                    persisted?.walletManagement?.associatedAddressesByAddress ||
                    {},
                  events:
                    (activeWallet?.address &&
                      persisted?.walletManagement?.eventsByAddress?.[
                        activeWallet.address
                      ]) ||
                    [],
                  confirmedTraceIds:
                    persisted?.walletManagement?.confirmedTraceIds || [],
                  confirmedExternalHashes:
                    persisted?.walletManagement?.confirmedExternalHashes || [],
                  hasWallet:
                    (persisted?.walletManagement?.savedWallets?.length || 0) >
                    0,
                  localSeqnoByAddress:
                    persisted?.walletManagement?.localSeqnoByAddress || {},
                  transactions: [],
                },
                tonConnect: {
                  ...currentState.tonConnect,
                  ...persisted?.tonConnect,
                  disconnectedSessions: [],
                  requestQueue: {
                    items: persisted?.tonConnect?.requestQueue?.items || [],
                    currentRequestId: undefined,
                    isProcessing: false,
                  },
                },
                jettons: {
                  ...currentState.jettons,
                  ...persisted?.jettons,
                  jettonsByAddress: persisted?.jettons?.jettonsByAddress || {},
                  lastJettonsUpdate: persisted?.jettons?.lastJettonsUpdate || 0,
                },
                brotherhood: {
                  ...currentState.brotherhood,
                  ...persisted?.brotherhood,
                  brotherhoodByAddress:
                    persisted?.brotherhood?.brotherhoodByAddress || {},
                  pendingDeferredByAddress:
                    persisted?.brotherhood?.pendingDeferredByAddress || {},
                  watchedLocations:
                    persisted?.brotherhood?.watchedLocations || [],
                },
                preferences: {
                  ...currentState.preferences,
                  ...persisted?.preferences,
                  animationLevel:
                    persisted?.preferences?.animationLevel ||
                    currentState.preferences.animationLevel,
                },
              };

              return merged as AppState;
            },
            onRehydrateStorage: () => (state, error) => {
              if (error) {
                log.error('Store rehydration error:', error);
                return;
              }

              if (!state) {
                return;
              }

              log.info('Store rehydrated successfully');

              // Set hydration flag
              state.isHydrated = true;

              // Call actions after rehydration
              if (state.clearExpiredRequests) {
                state.clearExpiredRequests();
              }

              // Load wallets after rehydration (fixes refresh on /send when loadSavedWalletsIntoKit ran before rehydration)
              if (
                state.walletCore.walletKit &&
                state.auth.currentPassword &&
                (state.walletManagement.savedWallets?.length ?? 0) > 0
              ) {
                void state.loadAllWallets();
              }

              // Resume processing if there are queued requests
              // if (
              //     state.tonConnect.requestQueue.items.length > 0 &&
              //     !state.tonConnect.requestQueue.isProcessing &&
              //     state.processNextRequest
              // ) {
              //     log.info('Resuming queue processing after rehydration');
              //     state.processNextRequest();
              // }

              if (
                (state.tonConnect?.requestQueue?.items?.length ?? 0) > 0 &&
                !state.tonConnect.requestQueue.isProcessing &&
                state.processNextRequest
              ) {
                setTimeout(() => {
                  log.info('Calling processNextRequest after rehydration');
                  state.processNextRequest?.();
                }, 500);
              }
            },
          },
        ),
      ),
      {
        enabled: enableDevtools,
        serialize: {
          replacer: (_: unknown, value: unknown) =>
            typeof value === 'bigint' ? '' : value,
        },
      },
    ),
  );

  const storeState = store.getState();
  storeState.initializeWalletKit();

  return store;
}
