/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useEffect, useRef, useCallback } from 'react';
import {
  useWallet,
  useWalletStore,
  useShallow,
  useJettons,
} from '@demo/wallet-core';
import {
  saveCurrentSelectedWallet,
  initializeOrGetTrackedAddresses,
  getAllSavedWalletsTrackedAddresses,
  getAllTrackedAddressesList,
  loadTrackedAddresses,
  addInvitedToCircle,
  normalizeAddressString,
  addInvitedToRing,
  addPersonalWallets,
} from '@/lib/brotherhood/tracked-addresses-storage';
import {
  batchHydrateUniversal,
  computePersonalWalletAddress,
} from '@/lib/brotherhood/account-state-hydrator';
import { isOnline } from '@/core/lib/network-status';
import { network as defaultNetwork } from '@/lib/brotherhood/config';
import { extractInvitedAndLocationFromFiWallet } from '@/lib/brotherhood/use-tracked-contract-addresses';
import { Address } from '@ton/core';

/**
 * Top-level hook to manage tracked contract addresses lifecycle:
 * 1. Synchronizes selected active wallet to localStorage ("current_selected_wallet")
 * 2. Computes and saves base off-chain derived addresses for all saved wallets
 * 3. Triggers a single universal background hydration for all saved wallets on session start
 * 4. Discovers circle, ring, and personal wallet addresses across all saved wallets
 * 5. Immediately hydrates newly discovered fresh addresses in a single combined call
 * 6. Zero refetch on wallet switch (loads cached state from memory / IndexedDB)
 * 7. Re-hydrates all saved wallets upon manual dashboard refresh
 */
export function useTrackedAddressesSync() {
  const { address, activeWalletId, savedWallets } = useWallet();
  const { loadUserJettons } = useJettons();
  const { events, loadEvents } = useWalletStore(
    useShallow((state) => {
      return {
        events: state.walletManagement.events,
        loadEvents: state.loadEvents,
      };
    }),
  );

  const isWalletKitInitialized = useWalletStore(
    (state) => state.walletCore.isWalletKitInitialized,
  );

  const hasHydratedSessionRef = useRef(false);

  const hydrateAllSavedWallets = useCallback(async () => {
    if (!isOnline() || !savedWallets || savedWallets.length === 0) return;

    // load userJettons for all saved wallets
    loadUserJettons();
    if (isWalletKitInitialized) {
      void loadEvents(50, 0).catch(() => {});
    }

    try {
      // Gather and format-insensitively deduplicate addresses across ALL saved wallets
      const allTrackedAddresses = getAllSavedWalletsTrackedAddresses(
        savedWallets,
        defaultNetwork,
      );

      if (allTrackedAddresses.length > 0) {
        const res = await batchHydrateUniversal(
          allTrackedAddresses,
          defaultNetwork,
        );

        if (res?.decodedStores) {
          const freshAddressesSet = new Set<string>();

          for (const wallet of savedWallets) {
            if (!wallet.address) continue;
            const walletAddrStr = normalizeAddressString(wallet.address);
            if (!walletAddrStr) continue;

            const currentData = loadTrackedAddresses(walletAddrStr);
            if (!currentData) continue;

            const existingBefore = new Set(
              getAllTrackedAddressesList(currentData)
                .map(normalizeAddressString)
                .filter(Boolean),
            );

            // 1. Check owner's FiWallet for new Circle invites and Location
            let updatedData = currentData;
            const fiWalletStr = currentData.base.fiWallet;
            const fiWalletStore = fiWalletStr
              ? res.decodedStores[fiWalletStr] ||
                res.decodedStores[normalizeAddressString(fiWalletStr)]
              : null;

            if (fiWalletStore) {
              const { invited, h3Cell } =
                extractInvitedAndLocationFromFiWallet(fiWalletStore);
              const existingCircle = new Set(
                (currentData.circle.invited || []).map(normalizeAddressString),
              );
              const freshInvites = invited.filter(
                (i) => !existingCircle.has(normalizeAddressString(i)),
              );

              if (
                freshInvites.length > 0 ||
                (h3Cell && !currentData.circle.location)
              ) {
                updatedData = addInvitedToCircle(
                  walletAddrStr,
                  invited,
                  h3Cell,
                );
              }
            }

            // 2. From any Circle FiWallets that are already decoded in decodedStores, extract Ring invites
            const ringInvites: string[] = [];
            for (const cAddr of updatedData.circle.invited) {
              const norm = normalizeAddressString(cAddr);
              const cStore =
                res.decodedStores[cAddr] || res.decodedStores[norm];
              if (cStore) {
                const { invited } =
                  extractInvitedAndLocationFromFiWallet(cStore);
                ringInvites.push(...invited);
              }
            }

            if (ringInvites.length > 0) {
              updatedData = addInvitedToRing(walletAddrStr, ringInvites);
            }

            // 3. For any personal minters in decodedStores, compute owner's personal wallet and track it
            const newWallets: string[] = [];
            let parsedOwner: Address | null = null;
            try {
              parsedOwner = Address.parse(walletAddrStr);
            } catch {
              parsedOwner = null;
            }

            if (parsedOwner) {
              for (const minterStr of updatedData.personalJettons || []) {
                const normMinter = normalizeAddressString(minterStr);
                const minterStore =
                  res.decodedStores[minterStr] || res.decodedStores[normMinter];
                const admin = minterStore?.adminAddress;
                if (admin) {
                  try {
                    const computed = computePersonalWalletAddress(
                      Address.parse(minterStr),
                      parsedOwner,
                      admin,
                    );
                    newWallets.push(computed.toString());
                  } catch {
                    /* ignore derivation error */
                  }
                }
              }
            }

            if (newWallets.length > 0) {
              updatedData = addPersonalWallets(walletAddrStr, newWallets);
            }

            // Detect fresh addresses for this wallet (not in storage before this discovery run)
            const afterList = getAllTrackedAddressesList(updatedData);
            for (const addr of afterList) {
              const norm = normalizeAddressString(addr);
              if (norm && !existingBefore.has(norm)) {
                freshAddressesSet.add(norm);
              }
            }
          }

          // If fresh addresses were found across any saved wallets, batch fetch them immediately in a single combined call
          if (freshAddressesSet.size > 0) {
            await batchHydrateUniversal(
              Array.from(freshAddressesSet),
              defaultNetwork,
            );
          }
        }
      }
    } catch (err) {
      console.error(
        '[useTrackedAddressesSync] Background universal hydration error across all wallets:',
        err,
      );
    }
  }, [savedWallets, isWalletKitInitialized, loadEvents, loadUserJettons]);

  // Session bootstrap: hydrate all saved wallets once
  useEffect(() => {
    if (
      !hasHydratedSessionRef.current &&
      savedWallets &&
      savedWallets.length > 0
    ) {
      hasHydratedSessionRef.current = true;
      void hydrateAllSavedWallets();
    }
  }, [savedWallets, hydrateAllSavedWallets]);

  // When WalletKit becomes ready, load events for active wallet
  useEffect(() => {
    if (isWalletKitInitialized && address) {
      void loadEvents(50, 0).catch(() => {});
    }
  }, [isWalletKitInitialized, address, loadEvents]);

  // Active wallet selection tracking (zero network refetch on switch)
  useEffect(() => {
    if (!address) return;

    // 1. Save current wallet selection change to localStorage
    saveCurrentSelectedWallet(address);

    // 2. Ensure base addresses are calculated off-chain and persisted to localStorage
    initializeOrGetTrackedAddresses(address, defaultNetwork);
  }, [address, activeWalletId]);

  // Listen for manual dashboard refresh events to re-hydrate all saved wallets
  useEffect(() => {
    const handleManualRefresh = () => {
      void hydrateAllSavedWallets();
    };

    window.addEventListener(
      'brotherhood_manual_wallet_refresh',
      handleManualRefresh,
    );
    return () => {
      window.removeEventListener(
        'brotherhood_manual_wallet_refresh',
        handleManualRefresh,
      );
    };
  }, [hydrateAllSavedWallets]);
}
