/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  useContactBookStore,
  normalizeContactAddress as normalizeAddr,
  normalizeContactName,
  type RecentTransactedMember,
} from '../storage/useContactBookStore';

export type { RecentTransactedMember };

const negativeUsernameCache = new Set<string>();

export const getNegativeUsernameCache = (): Set<string> =>
  negativeUsernameCache;

export const clearNegativeUsernameCacheForAddress = (
  address: string,
  network: string,
): void => {
  const net = network || 'testnet';
  const rawKey = normalizeContactAddress(address);
  negativeUsernameCache.delete(`${net}:${address.trim()}`);
  negativeUsernameCache.delete(`${net}:${rawKey}`);
};

export const normalizeUsername = (raw: string): string => {
  return normalizeContactName(raw);
};

export const normalizeContactAddress = (raw: string): string => {
  return normalizeAddr(raw);
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
  return normalizeContactName(raw);
};

/**
 * Retrieve a manually set custom nickname for an address.
 */
export function getCustomAddressName(
  address: string,
  network: string,
): string | null {
  if (!address) return null;
  const store = useContactBookStore.getState();
  const contact = store.getContact(address, network);
  return contact?.customName ?? null;
}

/**
 * Retrieve all custom names mapping address -> nickname.
 */
export function getAllCustomNames(network: string): Record<string, string> {
  const store = useContactBookStore.getState();
  const list = store.getContactsList(network);
  const result: Record<string, string> = {};
  for (const c of list) {
    if (c.customName) {
      result[c.address] = c.customName;
      result[c.rawAddress] = c.customName;
    }
  }
  return result;
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
 */
export function setCustomAddressName(
  address: string,
  customName: string,
  network: string,
): void {
  useContactBookStore
    .getState()
    .setCustomName(address, customName, undefined, network);
}

/**
 * Remove a custom name for an address.
 */
export function removeCustomAddressName(
  address: string,
  network: string,
): void {
  useContactBookStore.getState().removeCustomName(address, network);
}

/**
 * Internal: retrieve on-chain cached username without custom override.
 */
export function getOnChainCachedUsername(
  address: string,
  network: string,
): string | null {
  if (!address) return null;
  const store = useContactBookStore.getState();
  const contact = store.getContact(address, network);
  return contact?.onChainUsername ?? null;
}

/**
 * Retrieve the effective username (custom name takes priority over on-chain).
 */
export function getEffectiveUsername(
  address: string,
  network: string,
): { name: string; isCustom: boolean; onChainName?: string } | null {
  return useContactBookStore.getState().getEffectiveName(address, network);
}

/**
 * Retrieve all cached username-to-address entries for a network.
 */
export function getAllUsernames(network: string): Record<string, string> {
  const store = useContactBookStore.getState();
  const list = store.getContactsList(network);
  const result: Record<string, string> = {};
  for (const c of list) {
    const effective = c.customName || c.onChainUsername;
    if (effective) {
      result[normalizeUsername(effective)] = c.address;
    }
  }
  return result;
}

/**
 * Resolve an address from a username or custom nickname.
 */
export function getCachedAddressByUsername(
  username: string,
  network: string,
): string | null {
  return useContactBookStore.getState().resolveAddress(username, network);
}

/**
 * Lookup the cached username or custom nickname for a given address.
 */
export function getCachedUsername(
  address: string,
  network: string,
): string | null {
  const effective = useContactBookStore
    .getState()
    .getEffectiveName(address, network);
  return effective?.name ?? null;
}

/**
 * Save an on-chain username <-> address mapping into local cache.
 */
export function saveUsernameAddressMapping(
  username: string,
  address: string,
  network: string,
): void {
  const clean = username.trim().replace(/^@+/, '');
  const addr = address.trim();
  if (!clean || !addr) return;
  useContactBookStore.getState().saveOnChainUsername(addr, clean, network);
}

/**
 * Remove an on-chain username <-> address mapping from local cache.
 */
export function removeUsernameAddressMapping(
  username: string,
  addressOrNetwork?: string,
  networkArg?: string,
): void {
  const net =
    networkArg ||
    (addressOrNetwork && !addressOrNetwork.includes(':')
      ? addressOrNetwork
      : 'testnet');
  const targetAddress =
    addressOrNetwork && addressOrNetwork.includes(':')
      ? addressOrNetwork
      : getCachedAddressByUsername(username, net);

  if (targetAddress) {
    useContactBookStore.getState().deleteContact(targetAddress, net);
  }
}

/**
 * Save multiple username <-> address mappings in batch.
 */
export function saveUsernameAddressMappingsBatch(
  mappings: { username: string; address: string }[],
  network: string,
): void {
  const store = useContactBookStore.getState();
  for (const m of mappings) {
    if (m.username && m.address) {
      store.saveOnChainUsername(m.address, m.username, network);
    }
  }
}

/**
 * Get the list of recently transacted members.
 */
export function getRecentTransacted(network: string): RecentTransactedMember[] {
  const net = network || 'testnet';
  return useContactBookStore.getState().recentByNetwork[net] || [];
}

/**
 * Record a transaction with a member.
 */
export function addRecentTransacted(
  member: { address: string; username?: string },
  network: string,
): void {
  useContactBookStore.getState().addRecentRecipient(member, network);
}

/**
 * Clear recent transacted members list.
 */
export function clearRecentTransacted(network: string): void {
  const net = network || 'testnet';
  useContactBookStore.setState((state) => ({
    recentByNetwork: {
      ...state.recentByNetwork,
      [net]: [],
    },
  }));
}
