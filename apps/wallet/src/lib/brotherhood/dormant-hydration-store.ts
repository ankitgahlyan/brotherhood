/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Address } from '@ton/core';

const DORMANT_STORAGE_KEY = 'brotherhood_dormant_hydration_addresses';
const PROBED_STORAGE_KEY = 'brotherhood_probed_hydration_addresses';

/**
 * Normalizes any Address or address string into its canonical raw form (0:xxx...).
 * Raw strings ensure stable, collision-free lookups independent of user-friendly or bounceable flags.
 */
export function toDormantAddressKey(addr: Address | string): string {
  if (!addr) return '';
  if (typeof addr !== 'string') {
    return addr.toRawString();
  }
  const trimmed = addr.trim();
  if (!trimmed) return '';
  try {
    return Address.parse(trimmed).toRawString();
  } catch {
    return trimmed.toLowerCase();
  }
}

// In-memory sets for O(1) synchronous checks
const dormantSet = new Set<string>();
const probedSet = new Set<string>();
let isInitialized = false;

function loadFromStorage(): void {
  if (isInitialized || typeof localStorage === 'undefined') return;
  isInitialized = true;
  try {
    const rawDormant = localStorage.getItem(DORMANT_STORAGE_KEY);
    if (rawDormant) {
      const parsed: unknown = JSON.parse(rawDormant);
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (typeof item === 'string' && item) {
            dormantSet.add(item);
          }
        }
      }
    }

    const rawProbed = localStorage.getItem(PROBED_STORAGE_KEY);
    if (rawProbed) {
      const parsed: unknown = JSON.parse(rawProbed);
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (typeof item === 'string' && item) {
            probedSet.add(item);
          }
        }
      }
    }
  } catch {
    // Ignore storage parse errors
  }
}

function persistDormant(): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(
      DORMANT_STORAGE_KEY,
      JSON.stringify(Array.from(dormantSet)),
    );
  } catch {
    // Ignore storage write quota errors
  }
}

function persistProbed(): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(
      PROBED_STORAGE_KEY,
      JSON.stringify(Array.from(probedSet)),
    );
  } catch {
    // Ignore storage write quota errors
  }
}

/** Check if an address has ever completed an initial accountStates probe. */
export function hasEverBeenProbed(addr: Address | string): boolean {
  loadFromStorage();
  const key = toDormantAddressKey(addr);
  return key ? probedSet.has(key) : false;
}

/** Mark an address as having been probed at least once. */
export function markAddressProbed(addr: Address | string): void {
  loadFromStorage();
  const key = toDormantAddressKey(addr);
  if (!key || probedSet.has(key)) return;
  probedSet.add(key);
  persistProbed();
}

/** Mark multiple addresses as probed. */
export function markAddressesProbed(addrs: (Address | string)[]): void {
  loadFromStorage();
  let changed = false;
  for (const addr of addrs) {
    const key = toDormantAddressKey(addr);
    if (key && !probedSet.has(key)) {
      probedSet.add(key);
      changed = true;
    }
  }
  if (changed) {
    persistProbed();
  }
}

/** Check if an address is currently flagged as dormant (suppressed from auto-hydration). */
export function isDormantAddress(addr: Address | string): boolean {
  loadFromStorage();
  const key = toDormantAddressKey(addr);
  return key ? dormantSet.has(key) : false;
}

/** Add an address to the dormant set, suppressing future automated background queries. */
export function markAddressDormant(addr: Address | string): void {
  loadFromStorage();
  const key = toDormantAddressKey(addr);
  if (!key) return;
  markAddressProbed(addr);
  if (dormantSet.has(key)) return;
  dormantSet.add(key);
  persistDormant();
}

/** Mark multiple addresses as dormant. */
export function markAddressesDormant(addrs: (Address | string)[]): void {
  loadFromStorage();
  let changed = false;
  for (const addr of addrs) {
    const key = toDormantAddressKey(addr);
    if (!key) continue;
    if (!probedSet.has(key)) {
      probedSet.add(key);
    }
    if (!dormantSet.has(key)) {
      dormantSet.add(key);
      changed = true;
    }
  }
  if (changed) {
    persistDormant();
    persistProbed();
  }
}

/**
 * Awaken an address, removing it from dormancy so it resumes active auto-hydration.
 * Returns true if the address was previously dormant.
 */
export function awakenAddress(addr: Address | string): boolean {
  loadFromStorage();
  const key = toDormantAddressKey(addr);
  if (!key || !dormantSet.has(key)) return false;
  dormantSet.delete(key);
  persistDormant();
  return true;
}

/** Awaken multiple addresses from dormancy. Returns count of awakened addresses. */
export function awakenAddresses(addrs: (Address | string)[]): number {
  loadFromStorage();
  let count = 0;
  for (const addr of addrs) {
    const key = toDormantAddressKey(addr);
    if (key && dormantSet.has(key)) {
      dormantSet.delete(key);
      count++;
    }
  }
  if (count > 0) {
    persistDormant();
  }
  return count;
}

/** Filters a list of addresses, omitting those currently marked as dormant unless unprobed. */
export function filterDormantAddresses<T extends Address | string>(
  addrs: T[],
  options?: { allowUnprobedOnly?: boolean },
): T[] {
  loadFromStorage();
  return addrs.filter((addr) => {
    const key = toDormantAddressKey(addr);
    if (!key) return false;
    // Always allow addresses that haven't had an initial probe yet
    if (!probedSet.has(key)) {
      return true;
    }
    if (options?.allowUnprobedOnly) {
      return false;
    }
    // Suppress addresses marked dormant
    return !dormantSet.has(key);
  });
}

/** Clears all dormant and probed addresses (used during Nuclear Reset or full manual cache clear). */
export function clearDormancyStorage(): void {
  dormantSet.clear();
  probedSet.clear();
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem(DORMANT_STORAGE_KEY);
      localStorage.removeItem(PROBED_STORAGE_KEY);
    } catch {
      // Ignore
    }
  }
}
