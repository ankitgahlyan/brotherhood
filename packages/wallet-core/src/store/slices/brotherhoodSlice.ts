/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Address } from '@ton/core';
import type {
  SetState,
  BrotherhoodSliceCreator,
  PendingDeferredPayment,
} from '../../types/store';
import type { NetworkType } from '../../utils/network';

export type { PendingDeferredPayment };

export interface BrotherhoodMemberData {
  isMember: boolean;
  location?: string;
  circle: string[];
  ring: Record<string, string[]>;
}

export function normalizeAddressByNetwork(
  address: Address | string,
  isContract: boolean,
  network: NetworkType = 'testnet',
): string {
  try {
    const parsed =
      typeof address === 'string' ? Address.parse(address.trim()) : address;
    return parsed.toString({
      urlSafe: true,
      bounceable: isContract,
      testOnly: network === 'testnet',
    });
  } catch {
    return typeof address === 'string' ? address.trim() : String(address);
  }
}

export const EMPTY_CIRCLE: readonly string[] = Object.freeze([]);
export const EMPTY_RING: Readonly<Record<string, string[]>> = Object.freeze({});
export const EMPTY_PENDING_DEFERRED: readonly PendingDeferredPayment[] =
  Object.freeze([]);

export interface BrotherhoodState {
  brotherhoodByAddress: Record<string, BrotherhoodMemberData>;
  pendingDeferredByAddress: Record<string, PendingDeferredPayment[]>;
}

export const createBrotherhoodSlice: BrotherhoodSliceCreator = (
  set: SetState,
  get,
) => ({
  brotherhood: {
    brotherhoodByAddress: {},
    pendingDeferredByAddress: {},
  },

  setBrotherhoodMemberData: (
    walletAddress: string,
    data: Partial<BrotherhoodMemberData>,
  ) => {
    if (!walletAddress) return;
    const key = normalizeAddressByNetwork(walletAddress, false);

    const current = get().brotherhood.brotherhoodByAddress[key];
    if (current) {
      let hasChange = false;
      for (const [k, v] of Object.entries(data)) {
        if ((current as any)[k] !== v) {
          hasChange = true;
          break;
        }
      }
      if (!hasChange) return;
    }

    set((state) => {
      const existing = state.brotherhood.brotherhoodByAddress[key] || {
        isMember: false,
        circle: [],
        ring: {},
      };

      state.brotherhood.brotherhoodByAddress[key] = {
        ...existing,
        ...data,
      };
    });
  },

  addCircleInvites: (
    walletAddress: string,
    invites: (Address | string)[],
    network: NetworkType = 'testnet',
  ) => {
    if (!walletAddress || !invites || invites.length === 0) return [];
    const walletKey = normalizeAddressByNetwork(walletAddress, false, network);
    const freshAdded: string[] = [];

    set((state) => {
      const current = state.brotherhood.brotherhoodByAddress[walletKey] || {
        isMember: true,
        circle: [],
        ring: {},
      };

      const circleSet = new Set(current.circle);

      for (const inv of invites) {
        const norm = normalizeAddressByNetwork(inv, true, network);
        if (norm && !circleSet.has(norm) && norm !== walletKey) {
          if (circleSet.size < 10) {
            circleSet.add(norm);
            freshAdded.push(norm);
          }
        }
      }

      state.brotherhood.brotherhoodByAddress[walletKey] = {
        ...current,
        circle: Array.from(circleSet).slice(0, 10),
      };
    });

    return freshAdded;
  },

  addRingInvites: (
    walletAddress: string,
    invitorAddress: Address | string,
    invites: (Address | string)[],
    network: NetworkType = 'testnet',
  ) => {
    if (!walletAddress || !invitorAddress || !invites || invites.length === 0)
      return;
    const walletKey = normalizeAddressByNetwork(walletAddress, false, network);
    const invitorKey = normalizeAddressByNetwork(invitorAddress, true, network);

    set((state) => {
      const current = state.brotherhood.brotherhoodByAddress[walletKey] || {
        isMember: true,
        circle: [],
        ring: {},
      };

      const circleSet = new Set(current.circle);
      const ringBuckets = { ...current.ring };
      const currentInvitorBucket = new Set(ringBuckets[invitorKey] || []);

      // Count total existing ring members across all buckets
      let totalRingCount = 0;
      for (const bucket of Object.values(ringBuckets)) {
        totalRingCount += bucket.length;
      }

      for (const inv of invites) {
        const norm = normalizeAddressByNetwork(inv, true, network);
        if (
          norm &&
          norm !== walletKey &&
          norm !== invitorKey &&
          !circleSet.has(norm) &&
          !currentInvitorBucket.has(norm)
        ) {
          if (totalRingCount < 100) {
            currentInvitorBucket.add(norm);
            totalRingCount++;
          }
        }
      }

      ringBuckets[invitorKey] = Array.from(currentInvitorBucket);

      state.brotherhood.brotherhoodByAddress[walletKey] = {
        ...current,
        ring: ringBuckets,
      };
    });
  },

  setLocationContract: (
    walletAddress: string,
    locationAddress: Address | string,
    network: NetworkType = 'testnet',
  ) => {
    if (!walletAddress || !locationAddress) return;
    const walletKey = normalizeAddressByNetwork(walletAddress, false, network);
    const locationKey = normalizeAddressByNetwork(
      locationAddress,
      true,
      network,
    );

    const current = get().brotherhood.brotherhoodByAddress[walletKey];
    if (current && current.location === locationKey) return;

    set((state) => {
      const current = state.brotherhood.brotherhoodByAddress[walletKey] || {
        isMember: true,
        circle: [],
        ring: {},
      };

      state.brotherhood.brotherhoodByAddress[walletKey] = {
        ...current,
        location: locationKey,
      };
    });
  },

  removeBrotherhoodWallet: (walletAddress: string) => {
    if (!walletAddress) return;
    // Remove by both raw/unnormalized and normalized keys to be format-safe
    set((state) => {
      const byAddress = state.brotherhood.brotherhoodByAddress;
      const pendingByAddress = state.brotherhood.pendingDeferredByAddress;
      for (const k of Object.keys(byAddress)) {
        try {
          if (
            k === walletAddress ||
            Address.parse(k).equals(Address.parse(walletAddress))
          ) {
            delete byAddress[k];
          }
        } catch {
          if (k === walletAddress) {
            delete byAddress[k];
          }
        }
      }
      for (const k of Object.keys(pendingByAddress)) {
        try {
          if (
            k === walletAddress ||
            Address.parse(k).equals(Address.parse(walletAddress))
          ) {
            delete pendingByAddress[k];
          }
        } catch {
          if (k === walletAddress) {
            delete pendingByAddress[k];
          }
        }
      }
    });
  },

  addPendingDeferredPayment: (
    walletAddress: string,
    payment: PendingDeferredPayment,
    network: NetworkType = 'testnet',
  ) => {
    if (!walletAddress || !payment) return;
    const walletKey = normalizeAddressByNetwork(walletAddress, false, network);

    set((state) => {
      const current =
        state.brotherhood.pendingDeferredByAddress[walletKey] || [];
      const existingIndex = current.findIndex((p) => p.id === payment.id);
      if (existingIndex >= 0) {
        current[existingIndex] = { ...current[existingIndex], ...payment };
      } else {
        current.push(payment);
      }
      state.brotherhood.pendingDeferredByAddress[walletKey] = [...current];
    });
  },

  updatePendingDeferredPayment: (
    walletAddress: string,
    id: string,
    patch: Partial<PendingDeferredPayment>,
    network: NetworkType = 'testnet',
  ) => {
    if (!walletAddress || !id) return;
    const walletKey = normalizeAddressByNetwork(walletAddress, false, network);

    set((state) => {
      const current =
        state.brotherhood.pendingDeferredByAddress[walletKey] || [];
      const idx = current.findIndex((p) => p.id === id);
      if (idx >= 0) {
        current[idx] = { ...current[idx], ...patch };
        state.brotherhood.pendingDeferredByAddress[walletKey] = [...current];
      }
    });
  },

  removePendingDeferredPayment: (
    walletAddress: string,
    id: string,
    network: NetworkType = 'testnet',
  ) => {
    if (!walletAddress || !id) return;
    const walletKey = normalizeAddressByNetwork(walletAddress, false, network);

    set((state) => {
      const current =
        state.brotherhood.pendingDeferredByAddress[walletKey] || [];
      state.brotherhood.pendingDeferredByAddress[walletKey] = current.filter(
        (p) => p.id !== id,
      );
    });
  },
});
