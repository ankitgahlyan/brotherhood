import { useMemo, useCallback, useState, useEffect } from 'react';
import { Address } from '@ton/core';
import { FI_ADDRESS, network as defaultNetwork, type Network } from './config';
import {
  batchHydrateUniversal,
  type UniversalHydrateResult,
} from './account-state-hydrator';
import { queryClient } from './ton';
import {
  initializeOrGetTrackedAddresses,
  loadTrackedAddresses,
  addInvitedToCircle,
  addInvitedToRing,
  getAllTrackedAddressesList,
  getTrackedAddressesByCategory,
  normalizeAddressString,
  type TrackedAddressesData,
} from './tracked-addresses-storage';
import type { FiWalletStore } from '@wrappers/FossFiWallet.gen';

export interface UseTrackedContractsOptions {
  ownerAddress?: Address | string | null;
  fiWalletAddress?: Address | string | null;
  personalMinters?: (Address | string)[];
  personalWallets?: (Address | string)[];
  ringMembers?: (Address | string)[];
  locationAddress?: Address | string | null;
  lotteryAddress?: Address | string | null;
  pollAddresses?: (Address | string)[];
  network?: Network;
}

/**
 * Extract invited addresses and h3Cell from a deserialized FiWallet store
 */
export function extractInvitedAndLocationFromFiWallet(store: any): {
  invited: string[];
  h3Cell: string | null;
} {
  const invited: string[] = [];
  let h3Cell: string | null = null;

  try {
    if (store && store.$ === 'FiWalletStore') {
      const fiStore = store as FiWalletStore;
      const dict = fiStore.maps?.ref?.invited;
      if (dict && typeof dict.keys === 'function') {
        const keys = dict.keys();
        for (const k of keys) {
          const str = normalizeAddressString(k);
          if (str && !invited.includes(str)) {
            invited.push(str);
          }
        }
      }

      const cell = fiStore.profile?.ref?.h3Cell;
      if (typeof cell === 'string' && cell.trim().length > 0) {
        h3Cell = cell.trim();
      }
    }
  } catch (err) {
    console.error(
      '[extractInvitedAndLocationFromFiWallet] Error extracting data:',
      err,
    );
  }

  return { invited, h3Cell };
}

/**
 * Invalidate specifically Brotherhood queries without blasting the entire app's query cache
 */
export async function invalidateBrotherhoodQueries() {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['fi-wallet-state'] }),
    queryClient.invalidateQueries({
      queryKey: ['fi-wallet-state-by-contract'],
    }),
    queryClient.invalidateQueries({ queryKey: ['member-profiles'] }),
    queryClient.invalidateQueries({ queryKey: ['ring-invitees'] }),
    queryClient.invalidateQueries({ queryKey: ['fi-minter-state'] }),
    queryClient.invalidateQueries({ queryKey: ['fi-total-accounts'] }),
  ]);
}

/**
 * Global helper for targeted refetching of affected addresses after state-mutating transactions
 */
export async function refetchAffectedAddresses(
  addresses: (Address | string)[],
  net: Network = defaultNetwork,
): Promise<UniversalHydrateResult> {
  const cleanAddrs = addresses
    .map((a) => normalizeAddressString(a))
    .filter(Boolean);

  if (cleanAddrs.length === 0) {
    return {
      totalRequested: 0,
      hydrated: 0,
      outdatedAccounts: [],
      failedAddresses: [],
    };
  }

  try {
    const res = await batchHydrateUniversal(cleanAddrs, net);
    await invalidateBrotherhoodQueries();
    return res;
  } catch (err) {
    console.error(
      '[refetchAffectedAddresses] Failed to refetch addresses:',
      cleanAddrs,
      err,
    );
    return {
      totalRequested: cleanAddrs.length,
      hydrated: 0,
      outdatedAccounts: [],
      failedAddresses: cleanAddrs,
    };
  }
}

export function useTrackedContractAddresses(
  options: UseTrackedContractsOptions = {},
) {
  const net = options.network ?? defaultNetwork;
  const ownerStr = options.ownerAddress
    ? normalizeAddressString(options.ownerAddress)
    : '';

  const [isHydrating, setIsHydrating] = useState(false);
  const [lastHydratedAt, setLastHydratedAt] = useState<number | null>(null);
  const [trackedData, setTrackedData] = useState<TrackedAddressesData | null>(
    () => {
      if (!ownerStr) return null;
      return loadTrackedAddresses(ownerStr);
    },
  );

  // Keep trackedData synced when ownerStr changes
  useEffect(() => {
    if (!ownerStr) {
      setTrackedData(null);
      return;
    }
    const data = initializeOrGetTrackedAddresses(ownerStr, net);
    setTrackedData(data);
  }, [ownerStr, net]);

  // Consolidate tracked addresses list
  const trackedAddresses = useMemo(() => {
    const set = new Set<string>();

    if (trackedData) {
      getAllTrackedAddressesList(trackedData).forEach((a) => set.add(a));
    }

    const add = (item?: Address | string | null) => {
      if (!item) return;
      const str = normalizeAddressString(item);
      if (str) set.add(str);
    };

    add(FI_ADDRESS);
    add(options.ownerAddress);
    add(options.fiWalletAddress);
    options.personalMinters?.forEach(add);
    options.personalWallets?.forEach(add);
    options.ringMembers?.forEach(add);
    add(options.locationAddress);
    add(options.lotteryAddress);
    options.pollAddresses?.forEach(add);

    return Array.from(set);
  }, [
    trackedData,
    options.ownerAddress,
    options.fiWalletAddress,
    options.personalMinters,
    options.personalWallets,
    options.ringMembers,
    options.locationAddress,
    options.lotteryAddress,
    options.pollAddresses,
  ]);

  const processFollowUpDiscovery = useCallback(
    async (ownerAddressStr: string, decodedStores: Record<string, any>) => {
      if (!ownerAddressStr || !decodedStores) return;

      const currentData = loadTrackedAddresses(ownerAddressStr);
      if (!currentData) return;

      const fiWalletStr = currentData.base.fiWallet;
      const fiWalletStore = decodedStores[fiWalletStr];

      // 1. Check owner's FiWallet for new Circle invites and Location
      let newlyDiscoveredCircle: string[] = [];
      if (fiWalletStore) {
        const { invited, h3Cell } =
          extractInvitedAndLocationFromFiWallet(fiWalletStore);
        const existingCircle = new Set(currentData.circle.invited);
        const freshInvites = invited.filter((i) => !existingCircle.has(i));

        if (
          freshInvites.length > 0 ||
          (h3Cell && !currentData.circle.location)
        ) {
          const updated = addInvitedToCircle(ownerAddressStr, invited, h3Cell);
          setTrackedData(updated);
          newlyDiscoveredCircle = freshInvites;
        }
      }

      // If new circle addresses found, hydrate them in the background
      const circleToHydrate =
        newlyDiscoveredCircle.length > 0
          ? newlyDiscoveredCircle
          : currentData.circle.invited.filter((c) => {
              const norm = normalizeAddressString(c);
              return !decodedStores[c] && !decodedStores[norm];
            });

      if (circleToHydrate.length > 0) {
        try {
          const circleRes = await batchHydrateUniversal(circleToHydrate, net);
          if (circleRes.decodedStores) {
            // 2. From Circle FiWallets, extract Ring invites
            const ringInvites: string[] = [];
            for (const cAddr of circleToHydrate) {
              const cStore = circleRes.decodedStores[cAddr];
              if (cStore) {
                const { invited } =
                  extractInvitedAndLocationFromFiWallet(cStore);
                ringInvites.push(...invited);
              }
            }

            if (ringInvites.length > 0) {
              const updatedWithRing = addInvitedToRing(
                ownerAddressStr,
                ringInvites,
              );
              setTrackedData(updatedWithRing);

              // Background fetch for newly added Ring members
              const ringToHydrate = updatedWithRing.ring.invited.filter((r) => {
                const norm = normalizeAddressString(r);
                return !decodedStores[r] && !decodedStores[norm];
              });
              if (ringToHydrate.length > 0) {
                await batchHydrateUniversal(ringToHydrate, net).catch((err) => {
                  console.error(
                    '[useTrackedContractAddresses] Ring hydration error:',
                    err,
                  );
                });
              }
            }
          }
        } catch (err) {
          console.error(
            '[useTrackedContractAddresses] Circle hydration error:',
            err,
          );
        }
      }
    },
    [net],
  );

  const refetchAddresses = useCallback(
    async (
      addresses: (Address | string)[],
    ): Promise<UniversalHydrateResult> => {
      const res = await refetchAffectedAddresses(addresses, net);
      if (res.decodedStores && ownerStr) {
        processFollowUpDiscovery(ownerStr, res.decodedStores).catch((err) => {
          console.error(
            '[useTrackedContractAddresses] Follow-up discovery error:',
            err,
          );
        });
      }
      return res;
    },
    [net, ownerStr, processFollowUpDiscovery],
  );

  const refetchCategory = useCallback(
    async (
      category: 'base' | 'circle' | 'ring',
    ): Promise<UniversalHydrateResult> => {
      if (!ownerStr) {
        return {
          totalRequested: 0,
          hydrated: 0,
          outdatedAccounts: [],
          failedAddresses: [],
        };
      }

      const data = loadTrackedAddresses(ownerStr);
      if (!data) {
        return {
          totalRequested: 0,
          hydrated: 0,
          outdatedAccounts: [],
          failedAddresses: [],
        };
      }

      const targetAddresses = getTrackedAddressesByCategory(data, category);
      return refetchAddresses(targetAddresses);
    },
    [ownerStr, refetchAddresses],
  );

  const refetchAll = useCallback(async (): Promise<UniversalHydrateResult> => {
    if (trackedAddresses.length === 0) {
      return {
        totalRequested: 0,
        hydrated: 0,
        outdatedAccounts: [],
        failedAddresses: [],
      };
    }

    setIsHydrating(true);
    try {
      const res = await batchHydrateUniversal(trackedAddresses, net);
      setLastHydratedAt(Date.now());
      await invalidateBrotherhoodQueries();

      if (res.decodedStores && ownerStr) {
        processFollowUpDiscovery(ownerStr, res.decodedStores).catch((err) => {
          console.error(
            '[useTrackedContractAddresses] Background discovery error:',
            err,
          );
        });
      }

      return res;
    } catch (err) {
      console.error('[useTrackedContractAddresses] Hydration error:', err);
      return {
        totalRequested: trackedAddresses.length,
        hydrated: 0,
        outdatedAccounts: [],
        failedAddresses: trackedAddresses,
      };
    } finally {
      setIsHydrating(false);
    }
  }, [trackedAddresses, net, ownerStr, processFollowUpDiscovery]);

  return {
    trackedAddresses,
    trackedData,
    refetchAll,
    refetchCategory,
    refetchAddresses,
    isHydrating,
    lastHydratedAt,
  };
}
