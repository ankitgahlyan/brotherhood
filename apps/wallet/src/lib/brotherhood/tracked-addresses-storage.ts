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

export function sanitizeTrackedAddressesData(
  data: TrackedAddressesData,
): TrackedAddressesData {
  const seen = new Set<string>();

  // 1. Base addresses have highest priority
  const base: BaseAddresses = {
    owner: normalizeAddressString(data.base.owner),
    fi: normalizeAddressString(data.base.fi),
    fiWallet: normalizeAddressString(data.base.fiWallet),
    personal: normalizeAddressString(data.base.personal),
    personalWallet: normalizeAddressString(data.base.personalWallet),
  };

  for (const addr of Object.values(base)) {
    if (addr) seen.add(addr);
  }

  // 2. Circle addresses (max 10 invited + location)
  const circleInvited: string[] = [];
  for (const inv of data.circle?.invited || []) {
    const str = normalizeAddressString(inv);
    if (str && !seen.has(str)) {
      seen.add(str);
      circleInvited.push(str);
      if (circleInvited.length === 10) break;
    }
  }

  const locationStr = data.circle?.location
    ? normalizeAddressString(data.circle.location)
    : undefined;
  if (locationStr && seen.has(locationStr)) {
    // If location address collides with base or circle invited, keep it if it's identical or let it pass
    // but register it in seen
    seen.add(locationStr);
  } else if (locationStr) {
    seen.add(locationStr);
  }

  // 3. Ring addresses
  const ringInvited: string[] = [];
  for (const inv of data.ring?.invited || []) {
    const str = normalizeAddressString(inv);
    if (str && !seen.has(str)) {
      seen.add(str);
      ringInvited.push(str);
    }
  }

  // 4. Personal jetton minters
  const personalJettons: string[] = [];
  for (const jetton of data.personalJettons || []) {
    const str = normalizeAddressString(jetton);
    if (str && !seen.has(str)) {
      seen.add(str);
      personalJettons.push(str);
    }
  }

  return {
    base,
    circle: {
      invited: circleInvited,
      location: locationStr,
    },
    ring: {
      invited: ringInvited,
    },
    personalJettons,
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
    return sanitizeTrackedAddressesData(data);
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
    const sanitized = sanitizeTrackedAddressesData(data);
    storage.setItem(key, JSON.stringify(sanitized));
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

  // Cross-group exclusion: cannot exist in base, ring, or personalJettons
  const baseAddrs = new Set(Object.values(current.base));
  const ringSet = new Set(current.ring.invited);
  const personalSet = new Set(current.personalJettons || []);
  const circleSet = new Set(current.circle.invited);

  for (const inv of newInvited) {
    const str = normalizeAddressString(inv);
    if (
      str &&
      !circleSet.has(str) &&
      !baseAddrs.has(str) &&
      !ringSet.has(str) &&
      !personalSet.has(str)
    ) {
      circleSet.add(str);
    }
  }

  let locationAddress = current.circle.location;
  if (h3Cell && h3Cell.trim().length > 0) {
    try {
      const calculated = calculateLocationAddress(h3Cell.trim()).toString();
      const normLoc = normalizeAddressString(calculated);
      if (
        !baseAddrs.has(normLoc) &&
        !circleSet.has(normLoc) &&
        !ringSet.has(normLoc) &&
        !personalSet.has(normLoc)
      ) {
        locationAddress = normLoc;
      } else {
        locationAddress = normLoc;
      }
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
      invited: Array.from(circleSet).slice(0, 10),
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
  if (current.circle.location) {
    circleSet.add(normalizeAddressString(current.circle.location));
  }
  const baseAddrs = new Set(Object.values(current.base));
  const personalSet = new Set(current.personalJettons || []);

  for (const inv of newInvited) {
    const str = normalizeAddressString(inv);
    if (
      str &&
      !ringSet.has(str) &&
      !circleSet.has(str) &&
      !baseAddrs.has(str) &&
      !personalSet.has(str)
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
  const baseAddrs = new Set(Object.values(current.base));
  const circleSet = new Set(current.circle.invited);
  if (current.circle.location) {
    circleSet.add(normalizeAddressString(current.circle.location));
  }
  const ringSet = new Set(current.ring.invited);

  for (const minter of minterAddresses) {
    const str = normalizeAddressString(minter);
    if (
      str &&
      !existingSet.has(str) &&
      !baseAddrs.has(str) &&
      !circleSet.has(str) &&
      !ringSet.has(str)
    ) {
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
