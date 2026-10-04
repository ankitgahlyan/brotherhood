/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Address } from '@ton/core';

export function normalizeAssetVisibilityKey(idOrAddress: string): string {
  const trimmed = (idOrAddress || '').trim();
  if (!trimmed) return '';
  try {
    return Address.parse(trimmed).toRawString().toLowerCase();
  } catch {
    return trimmed.toLowerCase();
  }
}

export interface AssetVisibilityState {
  /** Normalized token IDs in pin order (index 0 = most recently pinned at top) */
  pinnedTokenIds: string[];
  /** Normalized token IDs hidden from dashboard & collapsed on /wallet/assets */
  hiddenTokenIds: string[];
  /** Normalized NFT addresses in pin order (index 0 = most recently pinned at top) */
  pinnedNftIds: string[];
  /** Normalized NFT addresses hidden from dashboard & collapsed on /wallet/nft */
  hiddenNftIds: string[];

  togglePinToken: (id: string) => void;
  toggleHideToken: (id: string) => void;
  togglePinNft: (address: string) => void;
  toggleHideNft: (address: string) => void;
  clearAssetVisibility: () => void;
}

export const useAssetVisibilityStore = create<AssetVisibilityState>()(
  persist(
    (set) => ({
      pinnedTokenIds: [],
      hiddenTokenIds: [],
      pinnedNftIds: [],
      hiddenNftIds: [],

      togglePinToken: (id: string) => {
        const key = normalizeAssetVisibilityKey(id);
        if (!key) return;
        set((state) => {
          const isAlreadyPinned = state.pinnedTokenIds.includes(key);
          if (isAlreadyPinned) {
            return {
              pinnedTokenIds: state.pinnedTokenIds.filter((k) => k !== key),
            };
          }
          // Place newly pinned item at the top and ensure it is unhidden
          return {
            pinnedTokenIds: [
              key,
              ...state.pinnedTokenIds.filter((k) => k !== key),
            ],
            hiddenTokenIds: state.hiddenTokenIds.filter((k) => k !== key),
          };
        });
      },

      toggleHideToken: (id: string) => {
        const key = normalizeAssetVisibilityKey(id);
        if (!key) return;
        set((state) => {
          const isAlreadyHidden = state.hiddenTokenIds.includes(key);
          if (isAlreadyHidden) {
            return {
              hiddenTokenIds: state.hiddenTokenIds.filter((k) => k !== key),
            };
          }
          // Hiding automatically unpins the token
          return {
            hiddenTokenIds: [
              ...state.hiddenTokenIds.filter((k) => k !== key),
              key,
            ],
            pinnedTokenIds: state.pinnedTokenIds.filter((k) => k !== key),
          };
        });
      },

      togglePinNft: (address: string) => {
        const key = normalizeAssetVisibilityKey(address);
        if (!key) return;
        set((state) => {
          const isAlreadyPinned = state.pinnedNftIds.includes(key);
          if (isAlreadyPinned) {
            return {
              pinnedNftIds: state.pinnedNftIds.filter((k) => k !== key),
            };
          }
          // Place newly pinned item at the top and ensure it is unhidden
          return {
            pinnedNftIds: [key, ...state.pinnedNftIds.filter((k) => k !== key)],
            hiddenNftIds: state.hiddenNftIds.filter((k) => k !== key),
          };
        });
      },

      toggleHideNft: (address: string) => {
        const key = normalizeAssetVisibilityKey(address);
        if (!key) return;
        set((state) => {
          const isAlreadyHidden = state.hiddenNftIds.includes(key);
          if (isAlreadyHidden) {
            return {
              hiddenNftIds: state.hiddenNftIds.filter((k) => k !== key),
            };
          }
          // Hiding automatically unpins the NFT
          return {
            hiddenNftIds: [...state.hiddenNftIds.filter((k) => k !== key), key],
            pinnedNftIds: state.pinnedNftIds.filter((k) => k !== key),
          };
        });
      },

      clearAssetVisibility: () => {
        set({
          pinnedTokenIds: [],
          hiddenTokenIds: [],
          pinnedNftIds: [],
          hiddenNftIds: [],
        });
      },
    }),
    {
      name: 'brotherhood_asset_visibility_v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        pinnedTokenIds: state.pinnedTokenIds,
        hiddenTokenIds: state.hiddenTokenIds,
        pinnedNftIds: state.pinnedNftIds,
        hiddenNftIds: state.hiddenNftIds,
      }),
    },
  ),
);
