/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

export interface RecentTransactedMember {
  address: string;
  username?: string;
  timestamp: number;
}

const normalizeUsername = (raw: string): string => {
  return raw.trim().replace(/^@+/, '').toLowerCase();
};

const getUsernamesKey = (network: string) =>
  `brotherhood_usernames_${network || 'testnet'}`;
const getAddressesKey = (network: string) =>
  `brotherhood_addresses_${network || 'testnet'}`;
const getRecentKey = (network: string) =>
  `brotherhood_recent_transacted_${network || 'testnet'}`;

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
 * Retrieve a cached username for a given Owner address.
 */
export function getCachedUsername(
  address: string,
  network: string,
): string | null {
  if (!address) return null;
  const addresses = safeGetItem<Record<string, string>>(
    getAddressesKey(network),
    {},
  );
  return addresses[address.trim()] || null;
}

/**
 * Retrieve a cached Owner address for a given username.
 */
export function getCachedAddressByUsername(
  username: string,
  network: string,
): string | null {
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
  addresses[addr] = username.trim().replace(/^@+/, '');
  safeSetItem(getAddressesKey(network), addresses);
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
