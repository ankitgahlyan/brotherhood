/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Address } from '@ton/core';

export interface RecentTransactedMember {
  address: string;
  username?: string;
  timestamp: number;
}

export const normalizeUsername = (raw: string): string => {
  return raw.trim().replace(/^@+/, '').toLowerCase();
};

export const normalizeContactAddress = (raw: string): string => {
  const trimmed = raw.trim();
  try {
    return Address.parse(trimmed).toRawString();
  } catch {
    return trimmed.toLowerCase();
  }
};

export const getUsernamesKey = (network: string) =>
  `brotherhood_usernames_${network || 'testnet'}`;
export const getAddressesKey = (network: string) =>
  `brotherhood_addresses_${network || 'testnet'}`;
export const getRecentKey = (network: string) =>
  `brotherhood_recent_transacted_${network || 'testnet'}`;
export const getCustomNamesKey = (network: string) =>
  `brotherhood_custom_names_${network || 'testnet'}`;
export const getCustomNamesReverseKey = (network: string) =>
  `brotherhood_custom_names_reverse_${network || 'testnet'}`;

export const normalizeCustomName = (raw: string): string => {
  return raw.trim().replace(/^@+/, '').toLowerCase();
};

function safeGetItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined' || !window.localStorage) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSetItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`[contact-storage] Failed to set ${key}:`, err);
  }
}

/**
 * Retrieve a manually set custom nickname for an address.
 */
export function getCustomAddressName(
  address: string,
  network: string,
): string | null {
  if (!address) return null;
  const customMap = safeGetItem<Record<string, string>>(
    getCustomNamesKey(network),
    {},
  );
  const rawKey = normalizeContactAddress(address);
  return customMap[rawKey] || customMap[address.trim()] || null;
}

/**
 * Retrieve all custom names mapping address -> nickname.
 */
export function getAllCustomNames(network: string): Record<string, string> {
  return safeGetItem<Record<string, string>>(getCustomNamesKey(network), {});
}

/**
 * Check whether an address has a manually set custom name.
 */
export function hasCustomAddressName(
  address: string,
  network: string,
): boolean {
  return Boolean(getCustomAddressName(address, network));
}

/**
 * Set or update a custom manual name for an address.
 * Overrides any on-chain username across the entire app.
 */
export function setCustomAddressName(
  address: string,
  customName: string,
  network: string,
): void {
  const addr = address.trim();
  const cleanName = customName.trim().replace(/^@+/, '');
  if (!addr) return;

  if (!cleanName) {
    removeCustomAddressName(addr, network);
    return;
  }

  const customMap = safeGetItem<Record<string, string>>(
    getCustomNamesKey(network),
    {},
  );
  const reverseMap = safeGetItem<Record<string, string>>(
    getCustomNamesReverseKey(network),
    {},
  );

  // Remove existing reverse mapping for this address if present
  const oldName = getCustomAddressName(addr, network);
  if (oldName) {
    delete reverseMap[normalizeCustomName(oldName)];
  }

  const rawKey = normalizeContactAddress(addr);
  customMap[addr] = cleanName;
  customMap[rawKey] = cleanName;
  reverseMap[normalizeCustomName(cleanName)] = addr;

  safeSetItem(getCustomNamesKey(network), customMap);
  safeSetItem(getCustomNamesReverseKey(network), reverseMap);

  // Synchronize recent transacted entries with new custom name
  const recent = getRecentTransacted(network);
  let changedRecent = false;
  const updatedRecent = recent.map((item) => {
    if (
      item.address.toLowerCase() === addr.toLowerCase() ||
      normalizeContactAddress(item.address) === rawKey
    ) {
      changedRecent = true;
      return { ...item, username: cleanName };
    }
    return item;
  });
  if (changedRecent) {
    safeSetItem(getRecentKey(network), updatedRecent);
  }
}

/**
 * Remove a custom name for an address, restoring the on-chain profile name if available.
 */
export function removeCustomAddressName(
  address: string,
  network: string,
): void {
  const addr = address.trim();
  if (!addr) return;

  const customMap = safeGetItem<Record<string, string>>(
    getCustomNamesKey(network),
    {},
  );
  const reverseMap = safeGetItem<Record<string, string>>(
    getCustomNamesReverseKey(network),
    {},
  );

  const oldName = getCustomAddressName(addr, network);
  if (oldName) {
    delete reverseMap[normalizeCustomName(oldName)];
  }

  const rawKey = normalizeContactAddress(addr);
  delete customMap[addr];
  delete customMap[rawKey];

  safeSetItem(getCustomNamesKey(network), customMap);
  safeSetItem(getCustomNamesReverseKey(network), reverseMap);

  // Synchronize recent transacted entries back to on-chain username or undefined
  const onChainFallback = getOnChainCachedUsername(addr, network) || undefined;
  const recent = getRecentTransacted(network);
  let changedRecent = false;
  const updatedRecent = recent.map((item) => {
    if (
      item.address.toLowerCase() === addr.toLowerCase() ||
      normalizeContactAddress(item.address) === rawKey
    ) {
      changedRecent = true;
      return { ...item, username: onChainFallback };
    }
    return item;
  });
  if (changedRecent) {
    safeSetItem(getRecentKey(network), updatedRecent);
  }
}

/**
 * Internal: retrieve on-chain cached username without custom override.
 */
export function getOnChainCachedUsername(
  address: string,
  network: string,
): string | null {
  if (!address) return null;
  const addresses = safeGetItem<Record<string, string>>(
    getAddressesKey(network),
    {},
  );
  const rawKey = normalizeContactAddress(address);
  return addresses[rawKey] || addresses[address.trim()] || null;
}

/**
 * Retrieve the effective username (custom name takes priority over on-chain).
 * Also returns metadata on whether it was custom and what the underlying on-chain name is.
 */
export function getEffectiveUsername(
  address: string,
  network: string,
): { name: string; isCustom: boolean; onChainName?: string } | null {
  if (!address) return null;
  const custom = getCustomAddressName(address, network);
  const onChain = getOnChainCachedUsername(address, network) || undefined;

  if (custom) {
    return { name: custom, isCustom: true, onChainName: onChain };
  }
  if (onChain) {
    return { name: onChain, isCustom: false, onChainName: onChain };
  }
  return null;
}

/**
 * Retrieve all cached username-to-address entries for a network,
 * combining custom names (taking priority) with on-chain usernames.
 */
export function getAllUsernames(network: string): Record<string, string> {
  const onChain = safeGetItem<Record<string, string>>(
    getUsernamesKey(network),
    {},
  );
  const customReverse = safeGetItem<Record<string, string>>(
    getCustomNamesReverseKey(network),
    {},
  );
  return { ...onChain, ...customReverse };
}

/**
 * Retrieve a cached username for a given Owner address.
 * Custom manual names take highest priority and override on-chain usernames everywhere.
 */
export function getCachedUsername(
  address: string,
  network: string,
): string | null {
  if (!address) return null;
  const custom = getCustomAddressName(address, network);
  if (custom) return custom;
  return getOnChainCachedUsername(address, network);
}

/**
 * Retrieve a cached Owner address for a given username or custom name.
 * Custom names take highest priority in reverse lookup.
 */
export function getCachedAddressByUsername(
  username: string,
  network: string,
): string | null {
  if (!username) return null;
  const customReverse = safeGetItem<Record<string, string>>(
    getCustomNamesReverseKey(network),
    {},
  );
  const normCustom = normalizeCustomName(username);
  if (normCustom && customReverse[normCustom]) {
    return customReverse[normCustom];
  }

  const norm = normalizeUsername(username);
  if (!norm) return null;
  const usernames = safeGetItem<Record<string, string>>(
    getUsernamesKey(network),
    {},
  );
  return usernames[norm] || null;
}

/**
 * Persist bidirectional mapping between username and owner address.
 * Only non-empty usernames should be persisted.
 */
export function saveUsernameAddressMapping(
  username: string,
  address: string,
  network: string,
): void {
  const norm = normalizeUsername(username);
  const addr = address.trim();
  if (!norm || !addr) return;

  const usernames = safeGetItem<Record<string, string>>(
    getUsernamesKey(network),
    {},
  );
  usernames[norm] = addr;
  safeSetItem(getUsernamesKey(network), usernames);

  const addresses = safeGetItem<Record<string, string>>(
    getAddressesKey(network),
    {},
  );
  const cleanUname = username.trim().replace(/^@+/, '');
  const rawKey = normalizeContactAddress(addr);
  addresses[addr] = cleanUname;
  addresses[rawKey] = cleanUname;
  safeSetItem(getAddressesKey(network), addresses);
}

/**
 * Remove username and address mapping if needed.
 */
export function removeUsernameAddressMapping(
  username: string,
  address: string,
  network: string,
): void {
  const norm = normalizeUsername(username);
  const addr = address.trim();

  if (norm) {
    const usernames = safeGetItem<Record<string, string>>(
      getUsernamesKey(network),
      {},
    );
    delete usernames[norm];
    safeSetItem(getUsernamesKey(network), usernames);
  }

  if (addr) {
    const addresses = safeGetItem<Record<string, string>>(
      getAddressesKey(network),
      {},
    );
    delete addresses[addr];
    delete addresses[normalizeContactAddress(addr)];
    safeSetItem(getAddressesKey(network), addresses);
  }
}

/**
 * Get all recent transacted members, ordered by most recent first.
 */
export function getRecentTransacted(network: string): RecentTransactedMember[] {
  return safeGetItem<RecentTransactedMember[]>(getRecentKey(network), []);
}

/**
 * Add or bump a member to the top of recent transacted members list (unbounded).
 */
export function addRecentTransacted(
  member: { address: string; username?: string },
  network: string,
): void {
  const addr = member.address.trim();
  if (!addr) return;

  const existing = getRecentTransacted(network);
  const filtered = existing.filter(
    (item) => item.address.toLowerCase() !== addr.toLowerCase(),
  );

  const resolvedUsername =
    member.username?.trim().replace(/^@+/, '') ||
    getCachedUsername(addr, network) ||
    undefined;

  const updated: RecentTransactedMember[] = [
    {
      address: addr,
      username: resolvedUsername,
      timestamp: Date.now(),
    },
    ...filtered,
  ];

  safeSetItem(getRecentKey(network), updated);

  if (resolvedUsername) {
    saveUsernameAddressMapping(resolvedUsername, addr, network);
  }
}

/**
 * Remove a single entry from recent transacted list.
 */
export function removeRecentTransacted(address: string, network: string): void {
  const addr = address.trim().toLowerCase();
  const existing = getRecentTransacted(network);
  const updated = existing.filter(
    (item) => item.address.toLowerCase() !== addr,
  );
  safeSetItem(getRecentKey(network), updated);
}

/**
 * Clear all recent transacted members.
 */
export function clearAllRecentTransacted(network: string): void {
  safeSetItem(getRecentKey(network), []);
}
