/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useState, useMemo, useCallback } from 'react';
import { Address } from '@ton/core';
import { useWallet } from '@demo/wallet-core';
import {
  BRO_TREASURY_ADDRESS,
  FI_ADDRESS,
  type Network,
} from '@/lib/brotherhood/config';
import {
  getPersonalMinter,
  getExpectedPersonalWalletAddress,
} from '@/lib/brotherhood/deploy';
import { getFiWalletAddress, isZeroAddress } from '@/lib/brotherhood/ton';
import { useFiAccount } from '@/features/brotherhood/hooks/use-fi-account';
import {
  useFiMinterState,
  useFiWalletState,
  usePersonalMinterDetails,
} from '@/lib/brotherhood/queries';
import { useContractState } from '@/lib/brotherhood/contract-cache';
import { resolveBroDomainContact } from '@/core/lib/dns';
import { parseOnchainMetadataCell } from '@/lib/brotherhood/jettonContent';
import { assetUrl } from '@/core/utils';
import type { BorrowToken, PinnedTokenStorageEntry } from '../types';

const STORAGE_KEY_PREFIX = 'brotherhood_borrow_pinned_tokens_';

export function useBorrowTokens(network: Network) {
  const { address, savedWallets, activeWalletId } = useWallet();
  const currentNetwork =
    savedWallets.find((w) => w.id === activeWalletId)?.network ?? network;

  const userOwnerAddress = useMemo(() => {
    if (!address) return null;
    try {
      return Address.parse(address);
    } catch {
      return null;
    }
  }, [address]);

  // 1. Pinned Custom Tokens from LocalStorage
  const [pinnedEntries, setPinnedEntries] = useState<PinnedTokenStorageEntry[]>(
    () => {
      if (typeof window === 'undefined') return [];
      try {
        const raw = localStorage.getItem(
          `${STORAGE_KEY_PREFIX}${currentNetwork}`,
        );
        return raw ? (JSON.parse(raw) as PinnedTokenStorageEntry[]) : [];
      } catch {
        return [];
      }
    },
  );

  const savePinnedEntries = useCallback(
    (entries: PinnedTokenStorageEntry[]) => {
      setPinnedEntries(entries);
      try {
        localStorage.setItem(
          `${STORAGE_KEY_PREFIX}${currentNetwork}`,
          JSON.stringify(entries),
        );
      } catch {
        // ignore storage errors
      }
    },
    [currentNetwork],
  );

  // 2. FI Token Configuration
  const fiAccount = useFiAccount(address ?? null);
  const fiMinterState = useFiMinterState(true, currentNetwork);
  const fiOnchainMeta = useMemo(() => {
    const rawMeta = fiMinterState.data?.metadata;
    return rawMeta ? parseOnchainMetadataCell(rawMeta) : {};
  }, [fiMinterState.data?.metadata]);

  const userFiWalletAddress = useMemo(() => {
    if (!userOwnerAddress) return '';
    return getFiWalletAddress(userOwnerAddress, currentNetwork).toString();
  }, [userOwnerAddress, currentNetwork]);

  const fiToken = useMemo<BorrowToken>(() => {
    const fiData = fiAccount.data;
    return {
      id: 'FI',
      kind: 'fi',
      symbol: fiOnchainMeta.symbol?.trim() || 'FI',
      name: fiOnchainMeta.name?.trim() || 'FossFI Currency',
      icon: fiOnchainMeta.image?.trim() || assetUrl('fi.svg'),
      ownerAddress: address ?? FI_ADDRESS,
      minterAddress: FI_ADDRESS,
      userWalletAddress: userFiWalletAddress,
      isDeployed: true, // Always deployed for active network members
      fiCreditNeed: fiData?.creditNeed ?? 0n,
      fiCreditCutoff: fiData?.creditCutoff ?? 0,
      fiCreditMaturity: fiData?.creditMaturity ?? 0,
      fiMultiplier: fiData?.multiplier ?? 1.0,
      isPinned: true,
    };
  }, [address, fiAccount.data, fiOnchainMeta, userFiWalletAddress]);

  // 3. Reserve Token Configuration
  const treasuryOwnerAddress = useMemo(() => {
    const minterAdmin = fiMinterState.data?.adminAddress;
    if (minterAdmin && !isZeroAddress(minterAdmin)) {
      return minterAdmin;
    }
    try {
      return Address.parse(BRO_TREASURY_ADDRESS);
    } catch {
      return null;
    }
  }, [fiMinterState.data?.adminAddress]);

  const treasuryFiState = useFiWalletState(
    treasuryOwnerAddress,
    currentNetwork,
  );
  const treasuryMinterAddr = useMemo(() => {
    const m =
      treasuryFiState.data?.addresses?.ref?.trustedJettonAddrs?.ref
        ?.personalJettonMinter;
    return m && !isZeroAddress(m) ? m : null;
  }, [treasuryFiState.data]);

  const treasuryMinterDetails = usePersonalMinterDetails(
    treasuryMinterAddr,
    Boolean(treasuryMinterAddr),
  );

  const reserveUserWalletAddressObj = useMemo(() => {
    if (!treasuryMinterAddr || !userOwnerAddress) return null;
    try {
      return getExpectedPersonalWalletAddress({
        personalMinter: treasuryMinterAddr,
        owner: userOwnerAddress,
        adminAddress: treasuryOwnerAddress ?? userOwnerAddress,
      });
    } catch {
      return null;
    }
  }, [treasuryMinterAddr, userOwnerAddress, treasuryOwnerAddress]);

  const reserveUserWalletState = useContractState<any>(
    reserveUserWalletAddressObj,
    currentNetwork,
  );

  const reserveToken = useMemo<BorrowToken>(() => {
    const adminOnchainMeta = treasuryMinterDetails.data?.metadata;
    const treasuryStore = treasuryFiState.data;
    const treasuryUsername =
      treasuryStore?.profile?.ref?.username?.replace(/^@/, '') ?? '';
    const adminSymbol =
      adminOnchainMeta?.symbol?.trim() ||
      (treasuryUsername ? `@${treasuryUsername}` : 'RESERVE');
    const adminName =
      adminOnchainMeta?.name?.trim() || 'Brotherhood Reserve Currency';
    const adminIcon = adminOnchainMeta?.image?.trim() || undefined;

    const isDeployed = Boolean(
      reserveUserWalletState.data !== null &&
      reserveUserWalletState.data !== undefined,
    );

    return {
      id: 'RESERVE',
      kind: 'reserve',
      symbol: adminSymbol,
      name: adminName,
      icon: adminIcon,
      ownerAddress: treasuryOwnerAddress?.toString() ?? BRO_TREASURY_ADDRESS,
      minterAddress: treasuryMinterAddr?.toString() ?? '',
      userWalletAddress: reserveUserWalletAddressObj?.toString() ?? '',
      isDeployed,
      creditInfo: reserveUserWalletState.data?.credit?.ref ?? null,
      isPinned: true,
    };
  }, [
    treasuryMinterDetails.data?.metadata,
    treasuryFiState.data,
    reserveUserWalletState.data,
    treasuryOwnerAddress,
    treasuryMinterAddr,
    reserveUserWalletAddressObj,
  ]);

  // 4. Custom Pinned Tokens
  const [selectedTokenId, setSelectedTokenId] = useState<string>('FI');
  const [searchedToken, setSearchedToken] = useState<BorrowToken | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Active searched / custom token wallet state
  const activeCustomWalletAddrObj = useMemo(() => {
    if (selectedTokenId === 'FI' || selectedTokenId === 'RESERVE') return null;
    if (searchedToken && searchedToken.id === selectedTokenId) {
      try {
        return Address.parse(searchedToken.userWalletAddress);
      } catch {
        return null;
      }
    }
    const pinned = pinnedEntries.find((p) => p.id === selectedTokenId);
    if (pinned && userOwnerAddress) {
      try {
        return getExpectedPersonalWalletAddress({
          personalMinter: Address.parse(pinned.minterAddress),
          owner: userOwnerAddress,
          adminAddress: Address.parse(pinned.ownerAddress),
        });
      } catch {
        return null;
      }
    }
    return null;
  }, [selectedTokenId, searchedToken, pinnedEntries, userOwnerAddress]);

  const activeCustomWalletState = useContractState<any>(
    activeCustomWalletAddrObj,
    currentNetwork,
  );

  const pinnedTokens = useMemo<BorrowToken[]>(() => {
    if (!userOwnerAddress) return [];
    return pinnedEntries.map((entry) => {
      let userWalletAddr = '';
      try {
        userWalletAddr = getExpectedPersonalWalletAddress({
          personalMinter: Address.parse(entry.minterAddress),
          owner: userOwnerAddress,
          adminAddress: Address.parse(entry.ownerAddress),
        }).toString();
      } catch {
        // ignore
      }
      return {
        id: entry.id,
        kind: entry.kind,
        symbol: entry.symbol,
        name: entry.name,
        icon: entry.icon,
        ownerAddress: entry.ownerAddress,
        minterAddress: entry.minterAddress,
        userWalletAddress: userWalletAddr,
        isDeployed: false, // will update dynamically if selected
        isPinned: true,
        username: entry.username,
        domain: entry.domain,
      };
    });
  }, [pinnedEntries, userOwnerAddress]);

  // Combined token list for tabs/chips
  const tokens = useMemo<BorrowToken[]>(() => {
    const list: BorrowToken[] = [fiToken, reserveToken];
    for (const pt of pinnedTokens) {
      if (!list.some((t) => t.id === pt.id)) {
        list.push(pt);
      }
    }
    if (searchedToken && !list.some((t) => t.id === searchedToken.id)) {
      list.push(searchedToken);
    }
    return list;
  }, [fiToken, reserveToken, pinnedTokens, searchedToken]);

  // Selected Token object with up-to-date wallet state
  const selectedToken = useMemo<BorrowToken>(() => {
    if (selectedTokenId === 'FI') return fiToken;
    if (selectedTokenId === 'RESERVE') return reserveToken;

    const found = tokens.find((t) => t.id === selectedTokenId);
    if (found) {
      const isDeployed = Boolean(
        activeCustomWalletState.data !== null &&
        activeCustomWalletState.data !== undefined,
      );
      return {
        ...found,
        isDeployed,
        creditInfo: activeCustomWalletState.data?.credit?.ref ?? null,
      };
    }
    return fiToken;
  }, [selectedTokenId, fiToken, reserveToken, tokens, activeCustomWalletState]);

  // Search and resolve a token by username (@alice), domain (alice.bro), or address
  const searchToken = useCallback(
    async (query: string) => {
      const clean = query.trim();
      if (!clean) {
        setSearchedToken(null);
        setSearchError(null);
        return;
      }
      setIsSearching(true);
      setSearchError(null);

      try {
        let resolvedOwner: Address | null = null;
        let domain: string | undefined = undefined;
        let username: string | undefined = undefined;

        // 1. Resolve .bro domain or @username
        if (clean.includes('.bro') || clean.startsWith('@')) {
          const parsedDns = await resolveBroDomainContact(
            clean,
            currentNetwork,
          );
          const rawAddr = parsedDns?.walletRecord || parsedDns?.ownerAddress;
          if (rawAddr) {
            resolvedOwner = Address.parse(rawAddr);
            domain = clean.endsWith('.bro')
              ? clean
              : `${clean.replace(/^@/, '')}.bro`;
            username = clean.replace(/^@/, '').replace(/\.bro$/, '');
          } else {
            throw new Error(`Domain or username "${clean}" not found on-chain`);
          }
        } else {
          // 2. Direct Address resolution
          try {
            resolvedOwner = Address.parse(clean);
          } catch {
            // Try resolving as domain without extension
            const parsedDns = await resolveBroDomainContact(
              `${clean}.bro`,
              currentNetwork,
            );
            const rawAddr = parsedDns?.walletRecord || parsedDns?.ownerAddress;
            if (rawAddr) {
              resolvedOwner = Address.parse(rawAddr);
              domain = `${clean}.bro`;
              username = clean;
            } else {
              throw new Error(
                `Invalid address or unregistered username: "${clean}"`,
              );
            }
          }
        }

        if (!resolvedOwner) {
          throw new Error('Unable to resolve owner address');
        }

        // Derive deterministic Personal Minter for this owner
        const ownerFiWallet = getFiWalletAddress(resolvedOwner, currentNetwork);
        const { contractAddress: personalMinter } = getPersonalMinter({
          issuerWallet: ownerFiWallet,
          adminAddress: resolvedOwner,
        });

        const userWalletAddr = userOwnerAddress
          ? getExpectedPersonalWalletAddress({
              personalMinter,
              owner: userOwnerAddress,
              adminAddress: resolvedOwner,
            }).toString()
          : '';

        const tokenObj: BorrowToken = {
          id: personalMinter.toString(),
          kind: 'custom',
          symbol: username
            ? `@${username}`
            : `${clean.slice(0, 4)}…${clean.slice(-4)}`,
          name: domain ? `${domain} Token` : 'Personal Token',
          ownerAddress: resolvedOwner.toString(),
          minterAddress: personalMinter.toString(),
          userWalletAddress: userWalletAddr,
          isDeployed: false,
          isPinned: pinnedEntries.some(
            (p) => p.id === personalMinter.toString(),
          ),
          username,
          domain,
        };

        setSearchedToken(tokenObj);
        setSelectedTokenId(tokenObj.id);
      } catch (err) {
        setSearchError(
          err instanceof Error ? err.message : 'Failed to resolve token',
        );
      } finally {
        setIsSearching(false);
      }
    },
    [currentNetwork, userOwnerAddress, pinnedEntries],
  );

  const pinToken = useCallback(
    (token: BorrowToken) => {
      if (token.id === 'FI' || token.id === 'RESERVE') return;
      if (pinnedEntries.some((p) => p.id === token.id)) return;

      const newEntries: PinnedTokenStorageEntry[] = [
        ...pinnedEntries,
        {
          id: token.id,
          kind: token.kind,
          symbol: token.symbol,
          name: token.name,
          icon: token.icon,
          ownerAddress: token.ownerAddress,
          minterAddress: token.minterAddress,
          username: token.username,
          domain: token.domain,
        },
      ];
      savePinnedEntries(newEntries);
    },
    [pinnedEntries, savePinnedEntries],
  );

  const unpinToken = useCallback(
    (tokenId: string) => {
      if (tokenId === 'FI' || tokenId === 'RESERVE') return;
      const updated = pinnedEntries.filter((p) => p.id !== tokenId);
      savePinnedEntries(updated);
      if (selectedTokenId === tokenId) {
        setSelectedTokenId('FI');
      }
    },
    [pinnedEntries, savePinnedEntries, selectedTokenId],
  );

  return {
    tokens,
    selectedTokenId,
    setSelectedTokenId,
    selectedToken,
    searchToken,
    isSearching,
    searchError,
    pinToken,
    unpinToken,
    searchedToken,
  };
}
