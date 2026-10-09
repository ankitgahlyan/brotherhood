import { useMemo, useCallback } from 'react';
import { Address } from '@ton/core';
import { useWalletStore, type NetworkType } from '@demo/wallet-core';
import { useContactBookStore } from '@/core/storage/useContactBookStore';
import {
  FI_ADDRESS,
  BRO_TREASURY_ADDRESS,
  BRO_COLLECTION_RESOLVER,
  DAO_PROXY_ADDRESS,
  type Network,
} from '@/lib/brotherhood/config';
import { getFiWalletAddress } from '@/lib/brotherhood/ton';
import {
  getPersonalMinter,
  getExpectedPersonalWalletAddress,
} from '@/lib/brotherhood/deploy';

export type AddressResolutionSource =
  'contact' | 'wallet' | 'derived' | 'protocol';

export function getResolutionBadgeClass(
  source: AddressResolutionSource,
): string {
  switch (source) {
    case 'wallet':
      return 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30';
    case 'derived':
      return 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30';
    case 'protocol':
      return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';
    case 'contact':
    default:
      return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
  }
}

export interface AddressResolution {
  name: string;
  source: AddressResolutionSource;
  rawAddress: string;
  subType?:
    | 'nickname'
    | 'username'
    | 'dns'
    | 'fi-wallet'
    | 'personal-minter'
    | 'personal-wallet';
}

interface SearchIndexEntry {
  name: string;
  variants: string[];
}

export interface AddressNameResolver {
  resolve: (addr: string | null | undefined) => AddressResolution | null;
  getName: (addr: string | null | undefined) => string | null;
  matchesSearch: (
    query: string,
    searchInTexts: (string | undefined | null)[],
  ) => boolean;
  knownAddresses: Map<string, AddressResolution>;
}

const EMPTY_MAP = Object.freeze({});
const EMPTY_ARRAY = Object.freeze([]);

function getSearchVariants(parsed: Address): string[] {
  const variants = new Set<string>();
  try {
    const raw = parsed.toRawString().toLowerCase();
    variants.add(raw);
    variants.add(
      parsed.toString({ bounceable: true, testOnly: false }).toLowerCase(),
    );
    variants.add(
      parsed.toString({ bounceable: false, testOnly: false }).toLowerCase(),
    );
    variants.add(
      parsed.toString({ bounceable: true, testOnly: true }).toLowerCase(),
    );
    variants.add(
      parsed.toString({ bounceable: false, testOnly: true }).toLowerCase(),
    );
  } catch {
    // ignore parsing errors
  }
  return Array.from(variants);
}

export function useAddressNameResolver(
  network: NetworkType,
): AddressNameResolver {
  const netStr: Network = network === 'mainnet' ? 'mainnet' : 'testnet';

  const contactsByNetwork = useContactBookStore(
    (state) => state.contactsByNetwork ?? EMPTY_MAP,
  );
  const savedWallets = useWalletStore(
    (state) => state.walletManagement?.savedWallets ?? EMPTY_ARRAY,
  );

  const { addressMap, searchIndex } = useMemo(() => {
    const map = new Map<string, AddressResolution>();
    const searchEntries: SearchIndexEntry[] = [];

    const register = (
      target: string | Address | null | undefined,
      resolution: Omit<AddressResolution, 'rawAddress'>,
    ) => {
      if (!target) return;
      try {
        const parsed =
          typeof target === 'string' ? Address.parse(target.trim()) : target;
        const raw = parsed.toRawString().toLowerCase();
        map.set(raw, { ...resolution, rawAddress: raw });

        const variants = getSearchVariants(parsed);
        searchEntries.push({
          name: resolution.name.toLowerCase(),
          variants,
        });
      } catch {
        // ignore invalid address
      }
    };

    // 1. Protocol Known Contracts
    register(FI_ADDRESS, {
      name: 'FI Minter',
      source: 'protocol',
    });
    register(BRO_TREASURY_ADDRESS, {
      name: 'Brotherhood Treasury',
      source: 'protocol',
    });
    register(BRO_COLLECTION_RESOLVER, {
      name: '.bro DNS Collection',
      source: 'protocol',
    });
    register(DAO_PROXY_ADDRESS, {
      name: 'DAO Proxy',
      source: 'protocol',
    });

    // 2. Contacts: Derived FiWallets & Usernames / DNS
    const networkContacts = contactsByNetwork[netStr] || {};
    for (const contact of Object.values(networkContacts)) {
      if (!contact?.address) continue;
      const effectiveName =
        contact.customName ||
        (contact.onChainUsername
          ? `@${contact.onChainUsername.replace(/^@+/, '')}`
          : undefined) ||
        contact.dnsDomain;

      if (!effectiveName) continue;

      // Contact's FiWallet derivation
      try {
        const cOwner = Address.parse(contact.address.trim());
        const cFiWallet = getFiWalletAddress(cOwner, netStr);
        register(cFiWallet, {
          name: `${effectiveName} • FiWallet`,
          source: 'contact',
          subType: 'fi-wallet',
        });
      } catch {
        // ignore
      }

      // Contact username or DNS
      if (contact.dnsDomain) {
        register(contact.address, {
          name: contact.dnsDomain,
          source: 'contact',
          subType: 'dns',
        });
      }
      if (contact.onChainUsername) {
        register(contact.address, {
          name: `@${contact.onChainUsername.replace(/^@+/, '')}`,
          source: 'contact',
          subType: 'username',
        });
      }
    }

    // 3. Saved Wallets: Derived Contracts & Wallet Addresses
    for (const wallet of savedWallets) {
      if (!wallet?.address) continue;
      const walletName = wallet.name || 'Saved Wallet';

      try {
        const parsedOwner = Address.parse(wallet.address.trim());

        // Deterministic FiWallet
        const fiWallet = getFiWalletAddress(parsedOwner, netStr);
        register(fiWallet, {
          name: `${walletName} • FiWallet`,
          source: 'derived',
          subType: 'fi-wallet',
        });

        // Deterministic PersonalMinter
        const { contractAddress: personalMinter } = getPersonalMinter({
          issuerWallet: fiWallet,
          adminAddress: parsedOwner,
        });
        register(personalMinter, {
          name: `${walletName} • PersonalMinter`,
          source: 'derived',
          subType: 'personal-minter',
        });

        // Deterministic PersonalWallet
        const personalWallet = getExpectedPersonalWalletAddress({
          personalMinter,
          owner: parsedOwner,
          adminAddress: parsedOwner,
        });
        register(personalWallet, {
          name: `${walletName} • PersonalWallet`,
          source: 'derived',
          subType: 'personal-wallet',
        });

        // Wallet Personal TON Address
        register(parsedOwner, {
          name: walletName,
          source: 'wallet',
        });
      } catch {
        // ignore
      }
    }

    // 4. Contact Custom Nicknames (Highest priority overrides)
    for (const contact of Object.values(networkContacts)) {
      if (!contact?.address || !contact?.customName) continue;
      register(contact.address, {
        name: contact.customName,
        source: 'contact',
        subType: 'nickname',
      });
    }

    return { addressMap: map, searchIndex: searchEntries };
  }, [contactsByNetwork, savedWallets, netStr]);

  const resolve = useCallback(
    (addr: string | null | undefined): AddressResolution | null => {
      if (!addr || typeof addr !== 'string') return null;
      const clean = addr.trim();
      if (!clean) return null;
      try {
        const raw = Address.parse(clean).toRawString().toLowerCase();
        return addressMap.get(raw) ?? null;
      } catch {
        return null;
      }
    },
    [addressMap],
  );

  const getName = useCallback(
    (addr: string | null | undefined): string | null => {
      return resolve(addr)?.name ?? null;
    },
    [resolve],
  );

  const matchesSearch = useCallback(
    (query: string, searchInTexts: (string | undefined | null)[]): boolean => {
      const q = query.trim().toLowerCase();
      if (!q) return false;

      const texts: string[] = [];
      for (const t of searchInTexts) {
        if (t) texts.push(t.toLowerCase());
      }
      if (texts.length === 0) return false;

      for (const entry of searchIndex) {
        if (entry.name.includes(q)) {
          for (const variant of entry.variants) {
            for (const text of texts) {
              if (text.includes(variant)) {
                return true;
              }
            }
          }
        }
      }
      return false;
    },
    [searchIndex],
  );

  return {
    resolve,
    getName,
    matchesSearch,
    knownAddresses: addressMap,
  };
}
