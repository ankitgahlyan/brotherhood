/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Network } from '@/lib/brotherhood/config';

export interface OwnedDomain {
  /** Bare domain label, e.g. "alice" */
  name: string;
  /** TLD zone, e.g. "bro" */
  zone: string;
  /** Derived NFT item contract address (bounceable, testOnly adjusted) */
  nftAddress: string;
  /** Unix timestamp (seconds) of registration */
  registeredAt: number;
  /** Last fill-up unix timestamp from on-chain get_last_fill_up_time */
  lastFillUpTime?: number;
  /** Resolved wallet address from DNS record, if set */
  walletRecord?: string;
  /** Social contact link (ThatsApp, Telegram, Facebook, etc.) stored under sha256("uri") */
  contactLink?: string;
  /** Secondary channel / group link stored under sha256("description") */
  channelLink?: string;
  /** True if on-chain code hash does not match current DnsItem code */
  isOutdated?: boolean;
  /** Unix timestamp (seconds) when auction ends, if in auction */
  auctionEndTime?: number;
  /** Address of the current highest bidder, if in auction */
  maxBidAddress?: string | null;
  /** True if the domain is currently in active 5-minute auction */
  isAuctionActive?: boolean;
  /** True if the auction duration has passed but FinalizeAuction hasn't been called yet */
  isAuctionEnded?: boolean;
  /** True if domain has an assigned owner on-chain */
  hasOwner?: boolean;
}

interface DnsState {
  domainsByNetwork: Record<Network, OwnedDomain[]>;
  hydratedKeys: Record<string, boolean>;
}

interface DnsActions {
  addDomain(domain: OwnedDomain, network: Network): void;
  updateDomain(
    nftAddress: string,
    patch: Partial<OwnedDomain>,
    network: Network,
  ): void;
  removeDomain(nftAddress: string, network: Network): void;
  markKeyHydrated(key: string): void;
}

const EMPTY_DOMAINS: OwnedDomain[] = [] as OwnedDomain[];

const initialState: DnsState = {
  domainsByNetwork: { testnet: [], mainnet: [], tetra: [] },
  hydratedKeys: {},
};

export const useDnsStore = create<DnsState & DnsActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      addDomain(domain, network) {
        const existing = get().domainsByNetwork[network];
        // change guard: no-op if nftAddress already present
        if (existing.some((d) => d.nftAddress === domain.nftAddress)) {
          return;
        }
        set((state) => ({
          domainsByNetwork: {
            ...state.domainsByNetwork,
            [network]: [domain, ...state.domainsByNetwork[network]],
          },
        }));
      },

      updateDomain(nftAddress, patch, network) {
        set((state) => {
          const list = state.domainsByNetwork[network];
          const idx = list.findIndex((d) => d.nftAddress === nftAddress);
          if (idx === -1) return state;
          const next = [...list];
          next[idx] = { ...next[idx], ...patch };
          return {
            domainsByNetwork: {
              ...state.domainsByNetwork,
              [network]: next,
            },
          };
        });
      },

      removeDomain(nftAddress, network) {
        set((state) => ({
          domainsByNetwork: {
            ...state.domainsByNetwork,
            [network]: state.domainsByNetwork[network].filter(
              (d) => d.nftAddress !== nftAddress,
            ),
          },
        }));
      },

      markKeyHydrated(key) {
        if (get().hydratedKeys[key]) return;
        set((state) => ({
          hydratedKeys: {
            ...state.hydratedKeys,
            [key]: true,
          },
        }));
      },
    }),
    {
      name: 'dns_domains_store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        domainsByNetwork: state.domainsByNetwork,
        hydratedKeys: state.hydratedKeys,
      }),
    },
  ),
);

/** Stable empty fallback — avoids inline allocation in selectors */
export { EMPTY_DOMAINS };

/** Returns owned domains for a given network (stable ref when empty). */
export function selectOwnedDomains(
  state: DnsState & DnsActions,
  network: Network,
): OwnedDomain[] {
  return state.domainsByNetwork[network] ?? EMPTY_DOMAINS;
}
