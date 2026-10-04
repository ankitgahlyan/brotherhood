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
import { brotherhoodSynchronizer } from '@/lib/brotherhood/synchronizer';
import { computePersonalWalletAddress } from '@/lib/brotherhood/account-state-hydrator';
import {
  getContractCacheSync,
  getNormalizedContractCacheKey,
} from '@/lib/brotherhood/contract-cache';
import { isOnline } from '@/core/lib/network-status';
import {
  network as defaultNetwork,
  FI_ADDRESS,
  BRO_TREASURY_ADDRESS,
} from '@/lib/brotherhood/config';
import { getFiWalletAddress, isZeroAddress } from '@/lib/brotherhood/ton';
import { extractInvitedAndLocationFromFiWallet } from '@/lib/brotherhood/use-tracked-contract-addresses';
import { calculateLocationAddress } from '@/features/city-network/hooks/use-cities';
import { purgeLegacyTrackedAddressesStorage } from '@/lib/brotherhood/clean-legacy-storage';
import { autoFundUnderfundedFiWallets } from '@/features/brotherhood/hooks/use-auto-fiwallet-funding';
import { Address } from '@ton/core';

/**
 * Top-level hook to manage tracked contract addresses lifecycle in bro-store:
 * 1. Immediately purges legacy localStorage tracked_addresses keys
 * 2. Fetches jettons for saved wallets only if missing from localStorage (unless force = true)
 * 3. Triggers 1 universal background hydration batch on session start for all persisted addresses
 *    including FI Minter, FI Admin FiWallet + PersonalMinter + user PersonalWallet (for Swap),
 *    saved wallets' FiWallets, and watched locations
 * 4. Checks FiWallet initialization: uninit -> isMember: false; active -> isMember: true
 * 5. Discovers location and circle invites, adds fresh circle to bro-store
 * 6. Follow-up batch hydrates newly discovered location contracts and FI Admin PersonalMinter/PersonalWallet
 * 7. Zero refetch on wallet switch (0ms reads from bro-store & IndexedDB)
 */
export function useTrackedAddressesSync() {
  const storeApi = useWalletStoreApi();
  const { savedWallets } = useWallet();
  const { loadUserJettons } = useJettons();
  const { setBrotherhoodMemberData, addCircleInvites, setLocationContract } =
    useBrotherhood();

  const { setAssociatedAddresses } = useWalletStore(
    useShallow((state) => ({
      setAssociatedAddresses: state.setAssociatedAddresses,
    })),
  );

  const savedWalletsLengthRef = useRef(0);
  const lastHydratedRef = useRef(0);
  const hydrateAllSavedWalletsRef = useRef<
    ((force?: boolean) => Promise<void>) | null
  >(null);

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

      // 2. Fetch jettons (only if missing from localStorage unless force = true) and reconcile .bro DNS contacts
      void loadUserJettons(undefined, force).catch(() => {});
      void brotherhoodSynchronizer
        .reconcileDnsContacts(defaultNetwork, force)
        .catch(() => {});

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

        // FI Admin FiWallet & PersonalMinter (from cached FiStore.adminAddress or fallback BRO_TREASURY_ADDRESS)
        let cachedAdminOwner: Address | null = null;
        try {
          const cachedFiMinter = getContractCacheSync<any>(
            getNormalizedContractCacheKey(defaultNetwork, FI_ADDRESS),
          )?.data;
          if (
            cachedFiMinter?.adminAddress &&
            !isZeroAddress(cachedFiMinter.adminAddress)
          ) {
            cachedAdminOwner =
              typeof cachedFiMinter.adminAddress === 'string'
                ? Address.parse(cachedFiMinter.adminAddress)
                : cachedFiMinter.adminAddress;
          } else {
            cachedAdminOwner = Address.parse(BRO_TREASURY_ADDRESS);
          }
        } catch {
          cachedAdminOwner = null;
        }

        let cachedAdminMinter: Address | null = null;
        if (cachedAdminOwner) {
          try {
            const adminFiWallet = getFiWalletAddress(
              cachedAdminOwner,
              defaultNetwork,
            );
            addContract(adminFiWallet);
            const cachedAdminFiStore = getContractCacheSync<any>(
              getNormalizedContractCacheKey(defaultNetwork, adminFiWallet),
            )?.data;
            const minterCandidate =
              cachedAdminFiStore?.addresses?.ref?.trustedJettonAddrs?.ref
                ?.personalJettonMinter;
            if (minterCandidate && !isZeroAddress(minterCandidate)) {
              cachedAdminMinter =
                typeof minterCandidate === 'string'
                  ? Address.parse(minterCandidate)
                  : minterCandidate;
              addContract(cachedAdminMinter);
            }
          } catch {
            /* ignore */
          }
        }

        for (const wallet of savedWallets) {
          if (!wallet.address) continue;
          addWallet(wallet.address);

          // Deterministic FiWallet & user's PersonalWallet for FI Admin's Personal Token (for Swap)
          try {
            const parsedOwner = Address.parse(wallet.address);
            const fiWallet = getFiWalletAddress(parsedOwner, defaultNetwork);
            addContract(fiWallet);
            setAssociatedAddresses(wallet.address, [fiWallet.toString()]);

            if (cachedAdminMinter && cachedAdminOwner) {
              const adminPersonalWallet = computePersonalWalletAddress(
                cachedAdminMinter,
                parsedOwner,
                cachedAdminOwner,
              );
              addContract(adminPersonalWallet);
            }
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
        const res = await brotherhoodSynchronizer.reconcileContracts(
          masterAddressList,
          defaultNetwork,
          { force },
        );

        if (res?.balances && Object.keys(res.balances).length > 0) {
          storeApi.setState((state) => {
            const nextBalances = {
              ...state.walletManagement.balancesByAddress,
            };
            let nextBalance = state.walletManagement.balance;
            for (const wallet of savedWallets) {
              if (!wallet.address) continue;
              let resolvedBal = res.balances?.[wallet.address];
              if (resolvedBal === undefined) {
                try {
                  const parsed = Address.parse(wallet.address);
                  resolvedBal =
                    res.balances?.[parsed.toString()] ??
                    res.balances?.[parsed.toRawString()] ??
                    res.balances?.[
                      normalizeAddressByNetwork(
                        wallet.address,
                        false,
                        defaultNetwork,
                      )
                    ];
                } catch {
                  /* ignore */
                }
              }
              if (resolvedBal !== undefined) {
                nextBalances[wallet.address] = resolvedBal;
                if (
                  state.walletManagement.activeWalletId === wallet.id ||
                  state.walletManagement.address === wallet.address
                ) {
                  nextBalance = resolvedBal;
                }
              }
            }
            return {
              walletManagement: {
                ...state.walletManagement,
                balancesByAddress: nextBalances,
                balance: nextBalance,
              },
            };
          });
        }

        if (
          !res?.decodedStores ||
          Object.keys(res.decodedStores).length === 0
        ) {
          lastHydratedRef.current = 0;
          setTimeout(() => {
            void hydrateAllSavedWalletsRef.current?.(true);
          }, 4000);
          return;
        }

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

        // 5b. Discover FI Admin FiWallet, PersonalMinter, and user PersonalWallets from Pass 1 decodedStores
        try {
          const decodedFiMinter = findDecodedStore(
            res.decodedStores,
            FI_ADDRESS,
          );
          let resolvedAdminOwner = cachedAdminOwner;
          if (
            decodedFiMinter?.adminAddress &&
            !isZeroAddress(decodedFiMinter.adminAddress)
          ) {
            resolvedAdminOwner =
              typeof decodedFiMinter.adminAddress === 'string'
                ? Address.parse(decodedFiMinter.adminAddress)
                : decodedFiMinter.adminAddress;
          }

          if (resolvedAdminOwner) {
            const adminFiWallet = getFiWalletAddress(
              resolvedAdminOwner,
              defaultNetwork,
            );
            const normAdminFiWallet = normalizeAddressByNetwork(
              adminFiWallet,
              true,
              defaultNetwork,
            );
            if (normAdminFiWallet && !masterSet.has(normAdminFiWallet)) {
              newLocationsToHydrate.push(normAdminFiWallet);
            }

            const decodedAdminFiStore =
              findDecodedStore(res.decodedStores, normAdminFiWallet) ??
              getContractCacheSync<any>(
                getNormalizedContractCacheKey(defaultNetwork, adminFiWallet),
              )?.data;
            const minterCandidate =
              decodedAdminFiStore?.addresses?.ref?.trustedJettonAddrs?.ref
                ?.personalJettonMinter;
            if (minterCandidate && !isZeroAddress(minterCandidate)) {
              const adminMinterAddr =
                typeof minterCandidate === 'string'
                  ? Address.parse(minterCandidate)
                  : minterCandidate;
              const normAdminMinter = normalizeAddressByNetwork(
                adminMinterAddr,
                true,
                defaultNetwork,
              );
              if (normAdminMinter && !masterSet.has(normAdminMinter)) {
                newLocationsToHydrate.push(normAdminMinter);
              }
              for (const wallet of savedWallets) {
                if (!wallet.address) continue;
                try {
                  const parsedOwner = Address.parse(wallet.address);
                  const adminPersonalWallet = computePersonalWalletAddress(
                    adminMinterAddr,
                    parsedOwner,
                    resolvedAdminOwner,
                  );
                  const normPw = normalizeAddressByNetwork(
                    adminPersonalWallet,
                    true,
                    defaultNetwork,
                  );
                  if (normPw && !masterSet.has(normPw)) {
                    newLocationsToHydrate.push(normPw);
                  }
                } catch {
                  /* ignore */
                }
              }
            }
          }
        } catch {
          /* ignore */
        }

        // 6. Pass 2: Follow-up targeted batch for newly discovered location & FI Admin swap contracts
        if (newLocationsToHydrate.length > 0) {
          const freshList = Array.from(new Set(newLocationsToHydrate));
          if (freshList.length > 0) {
            await brotherhoodSynchronizer.reconcileContracts(
              freshList,
              defaultNetwork,
              {
                force: true,
              },
            );
          }
        }

        // 7. Auto-fund underfunded FiWallets (< 2 TON) across saved wallets & circle invitees
        const latestState = storeApi.getState();
        const latestBrotherhood =
          latestState.brotherhood?.brotherhoodByAddress || {};
        const circleFiWallets: string[] = [];
        for (const wallet of savedWallets) {
          if (!wallet.address) continue;
          const walletKey = normalizeAddressByNetwork(
            wallet.address,
            false,
            defaultNetwork,
          );
          const bData = latestBrotherhood[walletKey];
          if (bData?.circle && bData.circle.length > 0) {
            for (const invitee of bData.circle) {
              try {
                // bData.circle already contains the invitee's FiWallet contract address
                const parsed = Address.parse(invitee);
                circleFiWallets.push(parsed.toString());
              } catch {
                /* pass */
              }
            }
          }
        }

        const activeWallet = latestState.walletManagement?.currentWallet;
        const isWalletUnlocked = latestState.auth?.isUnlocked ?? false;

        void autoFundUnderfundedFiWallets({
          wallet: activeWallet,
          isUnlocked: isWalletUnlocked,
          savedWallets,
          network: defaultNetwork,
          extraFiWallets: circleFiWallets,
          onTransactionSent: (hash) => {
            latestState.addPendingTransaction?.({
              traceId: hash,
              externalHash: hash,
              finality: 'pending',
            });
          },
        }).catch((err) => {
          console.warn(
            '[useTrackedAddressesSync] Auto-funding check error:',
            err,
          );
        });
      } catch (err) {
        console.error(
          '[useTrackedAddressesSync] Background universal hydration error:',
          err,
        );
        lastHydratedRef.current = 0;
        setTimeout(() => {
          void hydrateAllSavedWalletsRef.current?.(true);
        }, 5000);
      }
    },
    [
      storeApi,
      savedWallets,
      setAssociatedAddresses,
      loadUserJettons,
      setBrotherhoodMemberData,
      addCircleInvites,
      setLocationContract,
    ],
  );

  useEffect(() => {
    hydrateAllSavedWalletsRef.current = hydrateAllSavedWallets;
  }, [hydrateAllSavedWallets]);

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

  // Trigger hydration & auto-funding when wallet becomes unlocked mid-session
  const isUnlocked = useWalletStore((state) => state.auth.isUnlocked);
  const currentWallet = useWalletStore(
    (state) => state.walletManagement.currentWallet,
  );
  const unlockedFundingDoneRef = useRef(false);
  useEffect(() => {
    if (isUnlocked && currentWallet && !unlockedFundingDoneRef.current) {
      unlockedFundingDoneRef.current = true;
      void hydrateAllSavedWallets();
    }
  }, [isUnlocked, currentWallet, hydrateAllSavedWallets]);

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
