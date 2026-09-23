/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Address } from '@ton/core';

export interface ContactItem {
  address: string;
  rawAddress: string;
  customName?: string;
  onChainUsername?: string;
  notes?: string;
  updatedAt: number;
}

export interface RecentTransactedMember {
  address: string;
  username?: string;
  timestamp: number;
}

export interface ContactBookState {
  /** Map of network -> rawAddress -> ContactItem */
  contactsByNetwork: Record<string, Record<string, ContactItem>>;
  /** Map of network -> RecentTransactedMember[] */
  recentByNetwork: Record<string, RecentTransactedMember[]>;

  // Actions
  setCustomName: (
    address: string,
    customName: string,
    notes?: string,
    network?: string,
  ) => void;
  removeCustomName: (address: string, network?: string) => void;
  saveOnChainUsername: (
    address: string,
    username: string,
    network?: string,
  ) => void;
  addRecentRecipient: (
    member: { address: string; username?: string },
    network?: string,
  ) => void;
  deleteContact: (address: string, network?: string) => void;
  getContact: (address: string, network?: string) => ContactItem | null;
  getEffectiveName: (
    address: string,
    network?: string,
  ) => { name: string; isCustom: boolean; onChainName?: string } | null;
  resolveAddress: (nameOrAddress: string, network?: string) => string | null;
  getContactsList: (network?: string) => ContactItem[];
  importContacts: (
    data: string | Record<string, any>,
    network?: string,
  ) => { importedCount: number; error?: string };
  exportContacts: (network?: string) => string;
  clearContacts: (network?: string) => void;
}

export const normalizeContactAddress = (raw: string): string => {
  const trimmed = raw.trim();
  try {
    return Address.parse(trimmed).toRawString().toLowerCase();
  } catch {
    return trimmed.toLowerCase();
  }
};

export const normalizeContactName = (raw: string): string => {
  return raw.trim().replace(/^@+/, '').toLowerCase();
};

export const EMPTY_CONTACTS_MAP: Readonly<Record<string, ContactItem>> =
  Object.freeze({});
export const EMPTY_RECENT_ARRAY: Readonly<RecentTransactedMember[]> =
  Object.freeze([]);

const DEFAULT_NETWORK = 'testnet';

/**
 * Migration helper to ingest existing legacy localStorage data into Zustand
 */
function getMigratedInitialState(): {
  contactsByNetwork: Record<string, Record<string, ContactItem>>;
  recentByNetwork: Record<string, RecentTransactedMember[]>;
} {
  const contactsByNetwork: Record<string, Record<string, ContactItem>> = {
    testnet: {},
    mainnet: {},
  };
  const recentByNetwork: Record<string, RecentTransactedMember[]> = {
    testnet: [],
    mainnet: [],
  };

  if (typeof window === 'undefined' || !window.localStorage) {
    return { contactsByNetwork, recentByNetwork };
  }

  for (const net of ['testnet', 'mainnet']) {
    try {
      const customNames = JSON.parse(
        localStorage.getItem(`brotherhood_custom_names_${net}`) || '{}',
      );
      const onChainAddresses = JSON.parse(
        localStorage.getItem(`brotherhood_addresses_${net}`) || '{}',
      );
      const recent = JSON.parse(
        localStorage.getItem(`brotherhood_recent_transacted_${net}`) || '[]',
      );

      if (Array.isArray(recent)) {
        recentByNetwork[net] = recent;
      }

      // Populate from on-chain addresses
      for (const [addr, username] of Object.entries(onChainAddresses)) {
        if (typeof username === 'string' && username.trim()) {
          const raw = normalizeContactAddress(addr);
          contactsByNetwork[net][raw] = {
            address: addr,
            rawAddress: raw,
            onChainUsername: username.trim().replace(/^@+/, ''),
            updatedAt: Date.now(),
          };
        }
      }

      // Populate / override with custom names
      for (const [addr, name] of Object.entries(customNames)) {
        if (typeof name === 'string' && name.trim()) {
          const raw = normalizeContactAddress(addr);
          const existing = contactsByNetwork[net][raw];
          contactsByNetwork[net][raw] = {
            address: existing?.address || addr,
            rawAddress: raw,
            customName: name.trim().replace(/^@+/, ''),
            onChainUsername: existing?.onChainUsername,
            notes: existing?.notes,
            updatedAt: Date.now(),
          };
        }
      }
    } catch {
      // Ignore migration errors
    }
  }

  return { contactsByNetwork, recentByNetwork };
}

export const useContactBookStore = create<ContactBookState>()(
  persist(
    (set, get) => {
      const initial = getMigratedInitialState();

      return {
        contactsByNetwork: initial.contactsByNetwork,
        recentByNetwork: initial.recentByNetwork,

        setCustomName: (
          address,
          customName,
          notes,
          network = DEFAULT_NETWORK,
        ) => {
          const net = network || DEFAULT_NETWORK;
          const cleanAddr = address.trim();
          const cleanName = customName.trim().replace(/^@+/, '');
          if (!cleanAddr) return;

          const raw = normalizeContactAddress(cleanAddr);

          set((state) => {
            const netContacts = { ...(state.contactsByNetwork[net] || {}) };
            const existing = netContacts[raw];

            if (!cleanName) {
              // If name is cleared, remove custom name but keep onChainUsername if exists
              if (existing?.onChainUsername || existing?.notes) {
                netContacts[raw] = {
                  ...existing,
                  customName: undefined,
                  notes: notes !== undefined ? notes : existing.notes,
                  updatedAt: Date.now(),
                };
              } else {
                delete netContacts[raw];
              }
            } else {
              netContacts[raw] = {
                address: existing?.address || cleanAddr,
                rawAddress: raw,
                customName: cleanName,
                onChainUsername: existing?.onChainUsername,
                notes: notes !== undefined ? notes : existing?.notes,
                updatedAt: Date.now(),
              };
            }

            // Sync recent list
            const currentRecent = state.recentByNetwork[net] || [];
            const updatedRecent = currentRecent.map((item) => {
              if (normalizeContactAddress(item.address) === raw) {
                return {
                  ...item,
                  username: cleanName || existing?.onChainUsername,
                };
              }
              return item;
            });

            return {
              contactsByNetwork: {
                ...state.contactsByNetwork,
                [net]: netContacts,
              },
              recentByNetwork: {
                ...state.recentByNetwork,
                [net]: updatedRecent,
              },
            };
          });
        },

        removeCustomName: (address, network = DEFAULT_NETWORK) => {
          const net = network || DEFAULT_NETWORK;
          const raw = normalizeContactAddress(address);

          set((state) => {
            const netContacts = { ...(state.contactsByNetwork[net] || {}) };
            const existing = netContacts[raw];
            if (!existing) return state;

            if (existing.onChainUsername || existing.notes) {
              netContacts[raw] = {
                ...existing,
                customName: undefined,
                updatedAt: Date.now(),
              };
            } else {
              delete netContacts[raw];
            }

            const currentRecent = state.recentByNetwork[net] || [];
            const updatedRecent = currentRecent.map((item) => {
              if (normalizeContactAddress(item.address) === raw) {
                return {
                  ...item,
                  username: existing.onChainUsername,
                };
              }
              return item;
            });

            return {
              contactsByNetwork: {
                ...state.contactsByNetwork,
                [net]: netContacts,
              },
              recentByNetwork: {
                ...state.recentByNetwork,
                [net]: updatedRecent,
              },
            };
          });
        },

        saveOnChainUsername: (address, username, network = DEFAULT_NETWORK) => {
          const net = network || DEFAULT_NETWORK;
          const cleanAddr = address.trim();
          const cleanName = username.trim().replace(/^@+/, '');
          if (!cleanAddr || !cleanName) return;

          const raw = normalizeContactAddress(cleanAddr);

          set((state) => {
            const netContacts = { ...(state.contactsByNetwork[net] || {}) };
            const existing = netContacts[raw];

            netContacts[raw] = {
              address: existing?.address || cleanAddr,
              rawAddress: raw,
              customName: existing?.customName,
              onChainUsername: cleanName,
              notes: existing?.notes,
              updatedAt: Date.now(),
            };

            return {
              contactsByNetwork: {
                ...state.contactsByNetwork,
                [net]: netContacts,
              },
            };
          });
        },

        addRecentRecipient: (member, network = DEFAULT_NETWORK) => {
          const net = network || DEFAULT_NETWORK;
          if (!member.address) return;
          const raw = normalizeContactAddress(member.address);

          set((state) => {
            const currentRecent = state.recentByNetwork[net] || [];
            const contact = state.contactsByNetwork[net]?.[raw];
            const effectiveName =
              contact?.customName ||
              contact?.onChainUsername ||
              member.username;

            const filtered = currentRecent.filter(
              (item) => normalizeContactAddress(item.address) !== raw,
            );

            const newEntry: RecentTransactedMember = {
              address: member.address,
              username: effectiveName,
              timestamp: Date.now(),
            };

            return {
              recentByNetwork: {
                ...state.recentByNetwork,
                [net]: [newEntry, ...filtered].slice(0, 20),
              },
            };
          });
        },

        deleteContact: (address, network = DEFAULT_NETWORK) => {
          const net = network || DEFAULT_NETWORK;
          const raw = normalizeContactAddress(address);

          set((state) => {
            const netContacts = { ...(state.contactsByNetwork[net] || {}) };
            delete netContacts[raw];

            return {
              contactsByNetwork: {
                ...state.contactsByNetwork,
                [net]: netContacts,
              },
            };
          });
        },

        getContact: (address, network = DEFAULT_NETWORK) => {
          const net = network || DEFAULT_NETWORK;
          const raw = normalizeContactAddress(address);
          return get().contactsByNetwork[net]?.[raw] ?? null;
        },

        getEffectiveName: (address, network = DEFAULT_NETWORK) => {
          if (!address) return null;
          const net = network || DEFAULT_NETWORK;
          const raw = normalizeContactAddress(address);
          const contact = get().contactsByNetwork[net]?.[raw];
          if (!contact) return null;

          if (contact.customName) {
            return {
              name: contact.customName,
              isCustom: true,
              onChainName: contact.onChainUsername,
            };
          }
          if (contact.onChainUsername) {
            return {
              name: contact.onChainUsername,
              isCustom: false,
              onChainName: contact.onChainUsername,
            };
          }
          return null;
        },

        resolveAddress: (nameOrAddress, network = DEFAULT_NETWORK) => {
          if (!nameOrAddress) return null;
          const trimmed = nameOrAddress.trim();
          const net = network || DEFAULT_NETWORK;

          // If valid raw address already
          try {
            return Address.parse(trimmed).toString();
          } catch {
            // Not a direct address, search in contacts by name
          }

          const cleanName = normalizeContactName(trimmed);
          const contacts = Object.values(get().contactsByNetwork[net] || {});

          // 1. Check custom names first
          const customMatch = contacts.find(
            (c) =>
              c.customName && normalizeContactName(c.customName) === cleanName,
          );
          if (customMatch) return customMatch.address;

          // 2. Check on-chain usernames next
          const onChainMatch = contacts.find(
            (c) =>
              c.onChainUsername &&
              normalizeContactName(c.onChainUsername) === cleanName,
          );
          if (onChainMatch) return onChainMatch.address;

          return null;
        },

        getContactsList: (network = DEFAULT_NETWORK) => {
          const net = network || DEFAULT_NETWORK;
          return Object.values(get().contactsByNetwork[net] || {}).sort(
            (a, b) => (b.updatedAt || 0) - (a.updatedAt || 0),
          );
        },

        importContacts: (data, network = DEFAULT_NETWORK) => {
          const net = network || DEFAULT_NETWORK;
          try {
            let parsed: any = data;
            if (typeof data === 'string') {
              parsed = JSON.parse(data);
            }

            let contactsList: any[] = [];
            if (Array.isArray(parsed)) {
              contactsList = parsed;
            } else if (parsed && typeof parsed === 'object') {
              if (Array.isArray(parsed.contacts)) {
                contactsList = parsed.contacts;
              } else if (parsed.contactsByNetwork?.[net]) {
                contactsList = Object.values(parsed.contactsByNetwork[net]);
              } else {
                // Key-value address -> name
                contactsList = Object.entries(parsed).map(([k, v]) => {
                  if (typeof v === 'string') {
                    return { address: k, customName: v };
                  }
                  return { address: k, ...(v as object) };
                });
              }
            }

            let count = 0;
            const state = get();
            const netContacts = { ...(state.contactsByNetwork[net] || {}) };

            for (const item of contactsList) {
              if (!item || !item.address) continue;
              const raw = normalizeContactAddress(item.address);
              const existing = netContacts[raw];

              netContacts[raw] = {
                address: item.address,
                rawAddress: raw,
                customName:
                  item.customName || item.name || existing?.customName,
                onChainUsername:
                  item.onChainUsername || existing?.onChainUsername,
                notes: item.notes || existing?.notes,
                updatedAt: item.updatedAt || Date.now(),
              };
              count++;
            }

            set({
              contactsByNetwork: {
                ...state.contactsByNetwork,
                [net]: netContacts,
              },
            });

            return { importedCount: count };
          } catch (err) {
            return {
              importedCount: 0,
              error: err instanceof Error ? err.message : 'Invalid JSON format',
            };
          }
        },

        exportContacts: (network = DEFAULT_NETWORK) => {
          const net = network || DEFAULT_NETWORK;
          const contacts = get().contactsByNetwork[net] || {};
          const exportData = {
            version: '1.0',
            network: net,
            exportedAt: new Date().toISOString(),
            contacts: Object.values(contacts),
          };
          return JSON.stringify(exportData, null, 2);
        },

        clearContacts: (network = DEFAULT_NETWORK) => {
          const net = network || DEFAULT_NETWORK;
          set((state) => ({
            contactsByNetwork: {
              ...state.contactsByNetwork,
              [net]: {},
            },
            recentByNetwork: {
              ...state.recentByNetwork,
              [net]: [],
            },
          }));
        },
      };
    },
    {
      name: 'brotherhood_contact_book_store',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' && window.localStorage
          ? window.localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            },
      ),
    },
  ),
);
