/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { JettonError, compareAddress } from '@ton/walletkit';
import type { Jetton, JettonTransfer, JettonInfo } from '@ton/walletkit';

import { createComponentLogger } from '../../utils/logger';
import { getChainNetwork } from '../../utils/network';
import type { SetState, JettonsSliceCreator } from '../../types/store';

const log = createComponentLogger('JettonsSlice');

export interface JettonsState {
  jettonsByAddress: Record<string, Jetton[]>;
  jettonTransfers: JettonTransfer[];
  popularJettons: JettonInfo[];
  isLoadingJettons: boolean;
  isLoadingTransfers: boolean;
  isLoadingPopular: boolean;
  isRefreshing: boolean;
  error: string | null;
  transferError: string | null;
  lastJettonsUpdate: number;
  lastTransfersUpdate: number;
  lastPopularUpdate: number;
}

export const createJettonsSlice: JettonsSliceCreator = (
  set: SetState,
  get,
) => ({
  jettons: {
    jettonsByAddress: {},
    jettonTransfers: [],
    popularJettons: [],
    isLoadingJettons: false,
    isLoadingTransfers: false,
    isLoadingPopular: false,
    isRefreshing: false,
    error: null,
    transferError: null,
    lastJettonsUpdate: 0,
    lastTransfersUpdate: 0,
    lastPopularUpdate: 0,
  },

  loadUserJettons: async (userAddress?: string) => {
    const state = get();
    const address = userAddress || state.walletManagement.address;

    if (!address) {
      log.warn('No user address available to load jettons');
      return;
    }

    if (!state.walletCore.walletKit) {
      log.warn('WalletKit not initialized');
      return;
    }

    set((state) => {
      state.jettons.isLoadingJettons = true;
      state.jettons.error = null;
    });

    try {
      const allSavedWallets = state.walletManagement.savedWallets;
      const allAddresses = Array.from(
        new Set(
          [address, ...allSavedWallets.map((w) => w.address).filter(Boolean)]
            .filter(Boolean)
            .map((a) => String(a)),
        ),
      );

      log.info('Loading user jettons for all addresses', {
        addresses: allAddresses,
      });

      const activeWallet = state.walletManagement.savedWallets.find(
        (w) => w.id === state.walletManagement.activeWalletId,
      );
      const walletNetwork = activeWallet?.network || 'testnet';
      const client =
        state.walletManagement.currentWallet?.getClient() ??
        state.walletCore.walletKit.getApiClient(getChainNetwork(walletNetwork));

      const jettonsResponse = await client.jettonsByOwnerAddress({
        ownerAddress:
          allAddresses.length === 1 ? allAddresses[0] : allAddresses,
        offset: 0,
        limit: Math.max(50, allAddresses.length * 20),
      });

      if (!jettonsResponse) {
        log.warn('No jettons response received');
        set((s) => {
          s.jettons.isLoadingJettons = false;
        });
        return;
      }

      const partitioned: Record<string, Jetton[]> = {};
      for (const addr of allAddresses) {
        partitioned[addr] = [];
      }

      for (const jetton of jettonsResponse.jettons) {
        if (jetton.ownerAddress) {
          const matchingAddr = allAddresses.find((a) =>
            compareAddress(a, jetton.ownerAddress!),
          );
          if (matchingAddr) {
            partitioned[matchingAddr].push(jetton);
          } else {
            if (!partitioned[jetton.ownerAddress]) {
              partitioned[jetton.ownerAddress] = [];
            }
            partitioned[jetton.ownerAddress].push(jetton);
          }
        } else {
          const fallbackTarget = userAddress || address;
          if (fallbackTarget) {
            if (!partitioned[fallbackTarget]) {
              partitioned[fallbackTarget] = [];
            }
            partitioned[fallbackTarget].push(jetton);
          }
        }
      }

      set((s) => {
        for (const [addr, jettons] of Object.entries(partitioned)) {
          s.jettons.jettonsByAddress[addr] = jettons;
        }
        s.jettons.lastJettonsUpdate = Date.now();
        s.jettons.isLoadingJettons = false;
        s.jettons.error = null;
      });

      log.info('Successfully loaded user jettons for all wallets', {
        totalCount: jettonsResponse.jettons.length,
        walletCount: allAddresses.length,
      });
    } catch (error) {
      log.error('Failed to load user jettons:', error);

      const errorMessage =
        error instanceof JettonError
          ? `Jettons error: ${error.message} (${error.code})`
          : error instanceof Error
            ? error.message
            : 'Failed to load jettons';

      set((state) => {
        state.jettons.isLoadingJettons = false;
        state.jettons.error = errorMessage;
      });
    }
  },

  refreshJettons: async (userAddress?: string) => {
    const state = get();
    const address = userAddress || state.walletManagement.address;

    if (!address) {
      return;
    }

    set((state) => {
      state.jettons.isRefreshing = true;
    });

    try {
      await get().loadUserJettons(address);
    } finally {
      set((state) => {
        state.jettons.isRefreshing = false;
      });
    }
  },

  updateJettonBalanceFromStream: (
    walletAddress: string,
    balance: string,
    decimals?: number,
  ) => {
    set((state) => {
      let updated = false;
      for (const addressKey of Object.keys(state.jettons.jettonsByAddress)) {
        const addressJetton = state.jettons.jettonsByAddress[addressKey]?.find(
          (j) => compareAddress(j.walletAddress, walletAddress),
        );
        if (addressJetton) {
          addressJetton.balance = balance;
          if (typeof decimals === 'number') {
            addressJetton.decimalsNumber = decimals;
          }
          updated = true;
        }
      }
      if (updated) {
        state.jettons.lastJettonsUpdate = Date.now();
      }
    });
  },

  validateJettonAddress: (address: string): boolean => {
    const state = get();
    if (!state.walletCore.walletKit) {
      log.warn('WalletKit not initialized');
      return false;
    }
    return state.walletCore.walletKit.jettons.validateJettonAddress(address);
  },

  clearJettons: () => {
    set((state) => {
      state.jettons.jettonsByAddress = {};
      state.jettons.jettonTransfers = [];
      state.jettons.popularJettons = [];
      state.jettons.isLoadingJettons = false;
      state.jettons.isLoadingTransfers = false;
      state.jettons.isLoadingPopular = false;
      state.jettons.isRefreshing = false;
      state.jettons.error = null;
      state.jettons.transferError = null;
      state.jettons.lastJettonsUpdate = 0;
      state.jettons.lastTransfersUpdate = 0;
      state.jettons.lastPopularUpdate = 0;
    });
  },

  getJettonByAddress: (jettonAddress: string): Jetton | undefined => {
    const state = get();
    const activeAddress = state.walletManagement.address;
    if (activeAddress) {
      const matchingKey = Object.keys(state.jettons.jettonsByAddress).find(
        (k) => compareAddress(k, activeAddress),
      );
      if (matchingKey) {
        const jetton = state.jettons.jettonsByAddress[matchingKey]?.find((j) =>
          compareAddress(j.address, jettonAddress),
        );
        if (jetton) return jetton;
      }
    }
    for (const list of Object.values(state.jettons.jettonsByAddress)) {
      const match = list.find((j) => compareAddress(j.address, jettonAddress));
      if (match) return match;
    }
    return undefined;
  },

  formatJettonAmount: (amount: string, decimals: number): string => {
    try {
      const amountBigInt = BigInt(amount);
      const divisor = BigInt(10 ** decimals);
      const wholePart = amountBigInt / divisor;
      const fractionalPart = amountBigInt % divisor;

      if (fractionalPart === 0n) {
        return wholePart.toString();
      }

      const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
      const trimmedFractional = fractionalStr.replace(/0+$/, '');

      return trimmedFractional
        ? `${wholePart}.${trimmedFractional}`
        : wholePart.toString();
    } catch (error) {
      log.error('Error formatting jetton amount:', error);
      return '0';
    }
  },
});
