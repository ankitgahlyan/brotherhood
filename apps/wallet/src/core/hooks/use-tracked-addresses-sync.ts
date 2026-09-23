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
  useWalletStoreApi,
  useShallow,
  useJettons,
  useBrotherhood,
  normalizeAddressByNetwork,
} from '@demo/wallet-core';
import { batchHydrateUniversal } from '@/lib/brotherhood/account-state-hydrator';
import { isOnline } from '@/core/lib/network-status';
import {
  network as defaultNetwork,
  FI_ADDRESS,
} from '@/lib/brotherhood/config';
import { getFiWalletAddress } from '@/lib/brotherhood/ton';
import { extractInvitedAndLocationFromFiWallet } from '@/lib/brotherhood/use-tracked-contract-addresses';
import { calculateLocationAddress } from '@/features/city-network/hooks/use-cities';
import { purgeLegacyTrackedAddressesStorage } from '@/lib/brotherhood/clean-legacy-storage';
import { Address } from '@ton/core';

/**
 * Top-level hook to manage tracked contract addresses lifecycle in bro-store:
 * 1. Immediately purges legacy localStorage tracked_addresses keys
 * 2. Fetches jettons for all saved wallets (including isMember: false)
 * 3. Triggers 1 universal background hydration batch on session start for all persisted addresses
 * 4. Checks FiWallet initialization: uninit -> isMember: false; active -> isMember: true
 * 5. Discovers location and circle invites, adds fresh circle to bro-store
 * 6. Follow-up batch hydrates fresh circle members' FiWallets and records under ring[invitor]
 * 7. Zero refetch on wallet switch (0ms reads from bro-store & IndexedDB)
 */
export function useTrackedAddressesSync() {
  const storeApi = useWalletStoreApi();
  const { address, savedWallets } = useWallet();
  const { loadUserJettons } = useJettons();
  const { setBrotherhoodMemberData, addCircleInvites, setLocationContract } =
    useBrotherhood();

  const { loadEvents, setAssociatedAddresses } = useWalletStore(
    useShallow((state) => ({
      loadEvents: state.loadEvents,
      setAssociatedAddresses: state.setAssociatedAddresses,
    })),
  );

  const isWalletKitInitialized = useWalletStore(
    (state) => state.walletCore.isWalletKitInitialized,
  );

  const savedWalletsLengthRef = useRef(0);
  const lastHydratedRef = useRef(0);

  // Helper to normalize address matching helper
  const findDecodedStore = (
    stores: Record<string, any> | undefined,
    targetAddr: string,
  ) => {
    if (!stores) return null;
    if (stores[targetAddr]) return stores[targetAddr];

    try {
      const parsed = Address.parse(targetAddr);
      const raw = parsed.toRawString();
      const std = parsed.toString();
      return stores[raw] || stores[std] || null;
    } catch {
      return null;
    }
  };

  const hydrateAllSavedWallets = useCallback(
    async (force = false) => {
      if (!isOnline() || !savedWallets || savedWallets.length === 0) return;

      const now = Date.now();
      if (!force && now - lastHydratedRef.current < 60_000) {
        return;
      }
      lastHydratedRef.current = now;

      // 1. Purge legacy localStorage tracked_addresses
      purgeLegacyTrackedAddressesStorage();

      // 2. Fetch jettons for ALL saved wallets (including isMember: false)
      void loadUserJettons(undefined, force).catch(() => {});
      if (isWalletKitInitialized) {
        void loadEvents(20, 0, force).catch(() => {});
      }

      try {
        const currentState = storeApi.getState();
        const currentJettonsByAddress =
          currentState.jettons?.jettonsByAddress || {};
        const currentBrotherhoodByAddress =
          currentState.brotherhood?.brotherhoodByAddress || {};

        // 3. Assemble 1 master batch address list across all saved wallets
        const masterSet = new Set<string>();

        const addContract = (addr?: Address | string | null) => {
          if (!addr) return;
          const formatted = normalizeAddressByNetwork(
            addr,
            true,
            defaultNetwork,
          );
          if (formatted) masterSet.add(formatted);
        };

        const addWallet = (addr?: Address | string | null) => {
          if (!addr) return;
          const formatted = normalizeAddressByNetwork(
            addr,
            false,
            defaultNetwork,
          );
          if (formatted) masterSet.add(formatted);
        };

        // Root FI Minter
        addContract(FI_ADDRESS);

        for (const wallet of savedWallets) {
          if (!wallet.address) continue;
          addWallet(wallet.address);

          // Deterministic FiWallet
          try {
            const fiWallet = getFiWalletAddress(
              Address.parse(wallet.address),
              defaultNetwork,
            );
            addContract(fiWallet);
            setAssociatedAddresses(wallet.address, [fiWallet.toString()]);
          } catch {
            /* ignore parse error */
          }

          // Discovered jettons for this wallet
          const walletJettons =
            currentJettonsByAddress[wallet.address] ||
            currentJettonsByAddress[
              normalizeAddressByNetwork(wallet.address, false, defaultNetwork)
            ] ||
            [];
          for (const j of walletJettons) {
            if (j.address) addContract(j.address);
            if (j.walletAddress) addContract(j.walletAddress);
          }

          // Known location contract for this wallet
          const walletKey = normalizeAddressByNetwork(
            wallet.address,
            false,
            defaultNetwork,
          );
          const bData = currentBrotherhoodByAddress[walletKey];
          if (bData && bData.isMember && bData.location) {
            addContract(bData.location);
          }
        }

        // Manually watched locations
        const currentWatchedLocations =
          currentState.brotherhood?.watchedLocations || [];
        for (const loc of currentWatchedLocations) {
          addContract(loc);
        }

        const masterAddressList = Array.from(masterSet);
        if (masterAddressList.length === 0) return;

        // 4. Pass 1: Execute single universal batch hydration
        const res = await batchHydrateUniversal(
          masterAddressList,
          defaultNetwork,
          { force },
        );

        if (!res?.decodedStores) return;

        const newLocationsToHydrate: string[] = [];

        // 5. Evaluate FiWallet status and membership for each wallet
        for (const wallet of savedWallets) {
          if (!wallet.address) continue;
          const walletKey = normalizeAddressByNetwork(
            wallet.address,
            false,
            defaultNetwork,
          );
          let fiWallet: Address | null = null;
          try {
            fiWallet = getFiWalletAddress(
              Address.parse(wallet.address),
              defaultNetwork,
            );
          } catch {
            fiWallet = null;
          }
          if (!fiWallet) continue;

          const fiWalletAddr = normalizeAddressByNetwork(
            fiWallet,
            true,
            defaultNetwork,
          );

          const fiWalletStore = findDecodedStore(
            res.decodedStores,
            fiWalletAddr,
          );

          if (!fiWalletStore) {
            // Account is uninit or inactive: not a member of brotherhood ecosystem
            setBrotherhoodMemberData(walletKey, {
              isMember: false,
              location: undefined,
              circle: [],
              ring: {},
            });
            continue;
          }

          // Active member
          setBrotherhoodMemberData(walletKey, { isMember: true });

          const { invited, h3Cell } =
            extractInvitedAndLocationFromFiWallet(fiWalletStore);

          // Location derivation
          if (h3Cell && h3Cell.trim().length > 0) {
            try {
              const calculatedLoc = calculateLocationAddress(h3Cell.trim());
              setLocationContract(walletKey, calculatedLoc, defaultNetwork);
              if (calculatedLoc) {
                const normLoc = normalizeAddressByNetwork(
                  calculatedLoc,
                  true,
                  defaultNetwork,
                );
                if (normLoc && !masterSet.has(normLoc)) {
                  newLocationsToHydrate.push(normLoc);
                }
              }
            } catch (locErr) {
              console.warn(
                '[useTrackedAddressesSync] Failed to calculate location:',
                locErr,
              );
            }
          }

          // Circle invites
          if (invited.length > 0) {
            addCircleInvites(walletKey, invited, defaultNetwork);
          }
        }

        // 6. Pass 2: Follow-up targeted batch for newly discovered location contracts for saved wallets
        if (newLocationsToHydrate.length > 0) {
          const freshList = Array.from(new Set(newLocationsToHydrate));
          if (freshList.length > 0) {
            await batchHydrateUniversal(freshList, defaultNetwork, {
              force: true,
            });
          }
        }
      } catch (err) {
        console.error(
          '[useTrackedAddressesSync] Background universal hydration error:',
          err,
        );
      }
    },
    [
      storeApi,
      savedWallets,
      isWalletKitInitialized,
      loadEvents,
      setAssociatedAddresses,
      loadUserJettons,
      setBrotherhoodMemberData,
      addCircleInvites,
      setLocationContract,
    ],
  );

  // Session bootstrap + mid-session wallet addition: hydrate whenever the
  // wallet list grows (first load: 0→N, new wallet added: N→N+1).
  useEffect(() => {
    const currentLen = savedWallets?.length ?? 0;
    if (currentLen > savedWalletsLengthRef.current) {
      savedWalletsLengthRef.current = currentLen;
      void hydrateAllSavedWallets();
    } else if (currentLen < savedWalletsLengthRef.current) {
      savedWalletsLengthRef.current = currentLen;
    }
  }, [savedWallets?.length, hydrateAllSavedWallets]);

  // When WalletKit becomes ready, load initial events once across all saved wallets
  const initialEventsLoadedRef = useRef(false);
  useEffect(() => {
    if (isWalletKitInitialized && address && !initialEventsLoadedRef.current) {
      initialEventsLoadedRef.current = true;
      void loadEvents(50, 0).catch(() => {});
    }
  }, [isWalletKitInitialized, address, loadEvents]);

  // Listen for manual dashboard refresh events to re-hydrate all saved wallets
  useEffect(() => {
    const handleManualRefresh = () => {
      void hydrateAllSavedWallets(true);
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
