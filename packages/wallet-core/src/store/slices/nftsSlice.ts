/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { compareAddress } from '@ton/walletkit';
import type { NFTsResponse } from '@ton/walletkit';
import type { NFT, NftItem } from '@ton/walletkit';

import { createComponentLogger } from '../../utils/logger';
import type { SetState, NftsSliceCreator } from '../../types/store';

const log = createComponentLogger('NftsSlice');

export interface NftsState {
  userNfts: NftItem[];
  nftsByAddress: Record<string, NftItem[]>;
  isLoadingNfts: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastNftsUpdate: number;
  hasMore: boolean;
  offset: number;
}

export const createNftsSlice: NftsSliceCreator = (set: SetState, get) => ({
  nfts: {
    userNfts: [],
    nftsByAddress: {},
    isLoadingNfts: false,
    isRefreshing: false,
    error: null,
    lastNftsUpdate: 0,
    hasMore: true,
    offset: 0,
  },

  loadUserNfts: async (userAddress?: string, limit: number = 20) => {
    const state = get();
    const address = userAddress || state.walletManagement.address;

    if (!address) {
      log.warn('No user address available to load NFTs');
      return;
    }

    if (!state.walletCore.walletKit) {
      log.warn('WalletKit not initialized');
      return;
    }

    set((state) => {
      state.nfts.isLoadingNfts = true;
      state.nfts.error = null;
    });

    try {
      log.info('Loading user NFTs', { address, limit });

      const wallet = state.walletManagement.currentWallet;

      if (!wallet) {
        throw new Error('Wallet not found');
      }

      const result: NFTsResponse = await wallet.getNfts({
        pagination: { limit, offset: 0 },
      });

      set((s) => {
        const targetAddress =
          userAddress || s.walletManagement.address || address;
        s.nfts.nftsByAddress[targetAddress] = result.nfts;

        const currentActiveAddress = s.walletManagement.address;
        if (
          !currentActiveAddress ||
          compareAddress(currentActiveAddress, targetAddress)
        ) {
          s.nfts.userNfts = result.nfts;
          s.nfts.lastNftsUpdate = Date.now();
          s.nfts.hasMore = result.nfts.length === limit;
          s.nfts.offset = result.nfts.length;
        }
        s.nfts.isLoadingNfts = false;
        s.nfts.error = null;
      });

      log.info('Successfully loaded user NFTs', { count: result.nfts.length });
    } catch (error) {
      log.error('Failed to load user NFTs:', error);

      const errorMessage =
        error instanceof Error ? error.message : 'Failed to load NFTs';

      set((state) => {
        state.nfts.isLoadingNfts = false;
        state.nfts.error = errorMessage;
      });
    }
  },

  refreshNfts: async (userAddress?: string) => {
    const state = get();
    const address = userAddress || state.walletManagement.address;

    if (!address) {
      log.warn('No user address available to refresh NFTs');
      return;
    }

    if (!state.walletCore.walletKit) {
      log.warn('WalletKit not initialized');
      return;
    }

    set((state) => {
      state.nfts.isRefreshing = true;
      state.nfts.error = null;
    });

    try {
      log.info('Refreshing user NFTs', { address });

      const wallet = state.walletManagement.currentWallet;

      if (!wallet) {
        throw new Error('Wallet not found');
      }

      const result: NFTsResponse = await wallet.getNfts({
        pagination: { limit: 20, offset: 0 },
      });

      set((s) => {
        const targetAddress =
          userAddress || s.walletManagement.address || address;
        s.nfts.nftsByAddress[targetAddress] = result.nfts;

        const currentActiveAddress = s.walletManagement.address;
        if (
          !currentActiveAddress ||
          compareAddress(currentActiveAddress, targetAddress)
        ) {
          s.nfts.userNfts = result.nfts;
          s.nfts.lastNftsUpdate = Date.now();
          s.nfts.hasMore = result.nfts.length === 20;
          s.nfts.offset = result.nfts.length;
        }
        s.nfts.isRefreshing = false;
        s.nfts.error = null;
      });

      log.info('Successfully refreshed user NFTs', {
        count: result.nfts.length,
      });
    } catch (error) {
      log.error('Failed to refresh user NFTs:', error);

      const errorMessage =
        error instanceof Error ? error.message : 'Failed to refresh NFTs';

      set((state) => {
        state.nfts.isRefreshing = false;
        state.nfts.error = errorMessage;
      });
    }
  },

  loadMoreNfts: async (userAddress?: string) => {
    const state = get();
    const address = userAddress || state.walletManagement.address;

    if (!address || !state.nfts.hasMore || state.nfts.isLoadingNfts) {
      return;
    }

    if (!state.walletCore.walletKit) {
      log.warn('WalletKit not initialized');
      return;
    }

    set((state) => {
      state.nfts.isLoadingNfts = true;
      state.nfts.error = null;
    });

    try {
      log.info('Loading more user NFTs', {
        address,
        offset: state.nfts.offset,
      });

      const wallet = state.walletManagement.currentWallet;

      if (!wallet) {
        throw new Error('Wallet not found');
      }

      const result: NFTsResponse = await wallet.getNfts({
        pagination: { limit: 20, offset: state.nfts.offset },
      });

      set((s) => {
        const targetAddress =
          userAddress || s.walletManagement.address || address;
        const currentList = s.nfts.nftsByAddress[targetAddress] || [];
        const mergedList = [...currentList, ...result.nfts];
        s.nfts.nftsByAddress[targetAddress] = mergedList;

        const currentActiveAddress = s.walletManagement.address;
        if (
          !currentActiveAddress ||
          compareAddress(currentActiveAddress, targetAddress)
        ) {
          s.nfts.userNfts = [...s.nfts.userNfts, ...result.nfts];
          s.nfts.lastNftsUpdate = Date.now();
          s.nfts.hasMore = result.nfts.length === 20;
          s.nfts.offset = s.nfts.offset + result.nfts.length;
        }
        s.nfts.isLoadingNfts = false;
        s.nfts.error = null;
      });

      log.info('Successfully loaded more user NFTs', {
        count: result.nfts.length,
      });
    } catch (error) {
      log.error('Failed to load more user NFTs:', error);

      const errorMessage =
        error instanceof Error ? error.message : 'Failed to load more NFTs';

      set((state) => {
        state.nfts.isLoadingNfts = false;
        state.nfts.error = errorMessage;
      });
    }
  },

  clearNfts: () => {
    set((state) => {
      state.nfts.userNfts = [];
      state.nfts.nftsByAddress = {};
      state.nfts.isLoadingNfts = false;
      state.nfts.isRefreshing = false;
      state.nfts.error = null;
      state.nfts.lastNftsUpdate = 0;
      state.nfts.hasMore = true;
      state.nfts.offset = 0;
    });
  },

  getNftByAddress: (address: string): NFT | undefined => {
    const state = get();
    return state.nfts.userNfts.find((nft) => nft.address === address);
  },

  formatNftIndex: (index: string): string => {
    return `#${index}`;
  },
});
