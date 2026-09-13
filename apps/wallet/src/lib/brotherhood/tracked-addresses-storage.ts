/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Address } from '@ton/core';
import { FI_ADDRESS, network as defaultNetwork, type Network } from './config';
import { getFiWalletAddress } from './ton';
import { getPersonalMinter } from './deploy';
import { computePersonalWalletAddress } from './account-state-hydrator';
import { calculateLocationAddress } from '@/features/city-network/hooks/use-cities';

export const CURRENT_SELECTED_WALLET_KEY = 'current_selected_wallet';

export interface BaseAddresses {
  owner: string;
  fi: string;
  fiWallet: string;
  personal: string;
  personalWallet: string;
}

export interface CircleAddresses {
  invited: string[];
  location?: string;
}

export interface RingAddresses {
  invited: string[];
}

export interface TrackedAddressesData {
  base: BaseAddresses;
  circle: CircleAddresses;
  ring: RingAddresses;
  personalJettons: string[];
}

export function normalizeAddressString(addr: Address | string): string {
  try {
    const parsed = typeof addr === 'string' ? Address.parse(addr) : addr;
    return parsed.toString();
  } catch {
    return typeof addr === 'string' ? addr : '';
  }
}

export function getLocalStorage(): Storage | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
    return (globalThis as any).localStorage;
  }
  return null;
}

export function getCurrentSelectedWallet(): string | null {
  const storage = getLocalStorage();
  if (!storage) return null;
  return storage.getItem(CURRENT_SELECTED_WALLET_KEY);
}

export function saveCurrentSelectedWallet(
  walletAddress: Address | string,
): void {
  const storage = getLocalStorage();
  if (!storage) return;
  const normalized = normalizeAddressString(walletAddress);
  if (!normalized) return;
  storage.setItem(CURRENT_SELECTED_WALLET_KEY, normalized);
}

export function getTrackedAddressesKey(
  walletAddress: Address | string,
): string {
  const normalized = normalizeAddressString(walletAddress);
  return `tracked_addresses:${normalized}`;
}

export function calculateBaseAddresses(
  owner: Address | string,
  net: Network = defaultNetwork,
): BaseAddresses {
  const ownerAddress = typeof owner === 'string' ? Address.parse(owner) : owner;
  const fiAddress = Address.parse(FI_ADDRESS);

  const fiWalletAddress = getFiWalletAddress(ownerAddress, net);
  const personalMinter = getPersonalMinter({
    issuerWallet: fiWalletAddress,
    adminAddress: ownerAddress,
  }).contractAddress;

  const personalWallet = computePersonalWalletAddress(
    personalMinter,
    ownerAddress,
    ownerAddress,
  );

  return {
    owner: ownerAddress.toString(),
    fi: fiAddress.toString(),
    fiWallet: fiWalletAddress.toString(),
    personal: personalMinter.toString(),
    personalWallet: personalWallet.toString(),
  };
}

export function loadTrackedAddresses(
  walletAddress: Address | string,
): TrackedAddressesData | null {
  const storage = getLocalStorage();
  if (!storage) return null;
  const key = getTrackedAddressesKey(walletAddress);
  const raw = storage.getItem(key);
  if (!raw) return null;

  try {
    const data = JSON.parse(raw) as TrackedAddressesData;
    if (!data.base) return null;
    return {
      base: data.base,
      circle: {
        invited: Array.isArray(data.circle?.invited) ? data.circle.invited : [],
        location: data.circle?.location,
      },
      ring: {
        invited: Array.isArray(data.ring?.invited) ? data.ring.invited : [],
      },
      personalJettons: Array.isArray(data.personalJettons)
        ? data.personalJettons
        : [],
    };
  } catch (err) {
    console.error(`[TrackedAddressesStorage] Failed to parse key ${key}:`, err);
    return null;
  }
}

export function saveTrackedAddresses(
  walletAddress: Address | string,
  data: TrackedAddressesData,
): void {
  const storage = getLocalStorage();
  if (!storage) return;
  const key = getTrackedAddressesKey(walletAddress);
  try {
    storage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`[TrackedAddressesStorage] Failed to save key ${key}:`, err);
  }
}

export function initializeOrGetTrackedAddresses(
  walletAddress: Address | string,
  net: Network = defaultNetwork,
): TrackedAddressesData {
  const existing = loadTrackedAddresses(walletAddress);
  if (existing) {
    return existing;
  }

  const base = calculateBaseAddresses(walletAddress, net);
  const initialData: TrackedAddressesData = {
    base,
    circle: { invited: [] },
    ring: { invited: [] },
    personalJettons: [],
  };
  saveTrackedAddresses(walletAddress, initialData);
  return initialData;
}

export function addInvitedToCircle(
  walletAddress: Address | string,
  newInvited: (Address | string)[],
  h3Cell?: string | null,
): TrackedAddressesData {
  const current = initializeOrGetTrackedAddresses(walletAddress);
  const invitedSet = new Set(current.circle.invited);

  for (const inv of newInvited) {
    const str = normalizeAddressString(inv);
    if (str && !invitedSet.has(str)) {
      invitedSet.add(str);
    }
  }

  let locationAddress = current.circle.location;
  if (h3Cell && h3Cell.trim().length > 0) {
    try {
      locationAddress = calculateLocationAddress(h3Cell.trim()).toString();
    } catch (err) {
      console.error(
        '[TrackedAddressesStorage] Failed to calculate location address from h3Cell:',
        h3Cell,
        err,
      );
    }
  }

  const updated: TrackedAddressesData = {
    ...current,
    circle: {
      invited: Array.from(invitedSet).slice(0, 10),
      location: locationAddress,
    },
  };

  saveTrackedAddresses(walletAddress, updated);
  return updated;
}

export function addInvitedToRing(
  walletAddress: Address | string,
  newInvited: (Address | string)[],
): TrackedAddressesData {
  const current = initializeOrGetTrackedAddresses(walletAddress);
  const ringSet = new Set(current.ring.invited);
  const circleSet = new Set(current.circle.invited);
  const baseAddrs = new Set(Object.values(current.base));

  for (const inv of newInvited) {
    const str = normalizeAddressString(inv);
    if (
      str &&
      !ringSet.has(str) &&
      !circleSet.has(str) &&
      !baseAddrs.has(str)
    ) {
      ringSet.add(str);
    }
  }

  const updated: TrackedAddressesData = {
    ...current,
    ring: {
      invited: Array.from(ringSet),
    },
  };

  saveTrackedAddresses(walletAddress, updated);
  return updated;
}

export function addPersonalJettons(
  walletAddress: Address | string,
  minterAddresses: (Address | string)[],
): TrackedAddressesData {
  const current = initializeOrGetTrackedAddresses(walletAddress);
  const existingSet = new Set(current.personalJettons || []);

  for (const minter of minterAddresses) {
    const str = normalizeAddressString(minter);
    if (str && !existingSet.has(str)) {
      existingSet.add(str);
    }
  }

  const updated: TrackedAddressesData = {
    ...current,
    personalJettons: Array.from(existingSet),
  };

  saveTrackedAddresses(walletAddress, updated);
  return updated;
}

export function getAllTrackedAddressesList(
  data: TrackedAddressesData,
): string[] {
  const list: string[] = [];
  const add = (addr?: string | null) => {
    if (addr && !list.includes(addr)) {
      list.push(addr);
    }
  };

  // Base
  add(data.base.owner);
  add(data.base.fi);
  add(data.base.fiWallet);
  add(data.base.personal);
  add(data.base.personalWallet);

  // Personal Jettons
  (data.personalJettons || []).forEach(add);

  // Circle
  data.circle.invited.forEach(add);
  if (data.circle.location) {
    add(data.circle.location);
  }

  // Ring
  data.ring.invited.forEach(add);

  return list;
}

export function getTrackedAddressesByCategory(
  data: TrackedAddressesData,
  category: 'base' | 'circle' | 'ring' | 'personalJettons',
): string[] {
  if (category === 'base') {
    return [
      data.base.owner,
      data.base.fi,
      data.base.fiWallet,
      data.base.personal,
      data.base.personalWallet,
    ].filter(Boolean);
  }

  if (category === 'personalJettons') {
    return [...(data.personalJettons || [])];
  }

  if (category === 'circle') {
    const list = [...data.circle.invited];
    if (data.circle.location) {
      list.push(data.circle.location);
    }
    return list;
  }

  if (category === 'ring') {
    return [...data.ring.invited];
  }

  return [];
}
