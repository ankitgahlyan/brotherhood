import { useMemo, useCallback, useState } from 'react';
import { Address } from '@ton/core';
import { FI_ADDRESS, network as defaultNetwork, type Network } from './config';
import {
  batchHydrateUniversal,
  type UniversalHydrateResult,
} from './account-state-hydrator';
import { queryClient } from './ton';

export interface UseTrackedContractsOptions {
  ownerAddress?: Address | null;
  fiWalletAddress?: Address | null;
  personalMinters?: (Address | string)[];
  personalWallets?: (Address | string)[];
  ringMembers?: (Address | string)[];
  locationAddress?: Address | string | null;
  lotteryAddress?: Address | string | null;
  pollAddresses?: (Address | string)[];
  network?: Network;
}

export function useTrackedContractAddresses(
  options: UseTrackedContractsOptions,
) {
  const net = options.network ?? defaultNetwork;
  const [isHydrating, setIsHydrating] = useState(false);
  const [lastHydratedAt, setLastHydratedAt] = useState<number | null>(null);

  const trackedAddresses = useMemo(() => {
    const list: string[] = [];
    const add = (item?: Address | string | null) => {
      if (!item) return;
      try {
        const addr = typeof item === 'string' ? Address.parse(item) : item;
        list.push(addr.toString());
      } catch {
        // Ignore invalid address strings
      }
    };

    // Primary FI Minter
    add(FI_ADDRESS);

    // Connected owner & Primary FiWallet
    add(options.ownerAddress);
    add(options.fiWalletAddress);

    // Personal Tokens
    options.personalMinters?.forEach(add);
    options.personalWallets?.forEach(add);

    // Network / Ring members
    options.ringMembers?.forEach(add);

    // Location
    add(options.locationAddress);

    // Lottery & DAO Polls
    add(options.lotteryAddress);
    options.pollAddresses?.forEach(add);

    // Deduplicate
    return Array.from(new Set(list));
  }, [
    options.ownerAddress,
    options.fiWalletAddress,
    options.personalMinters,
    options.personalWallets,
    options.ringMembers,
    options.locationAddress,
    options.lotteryAddress,
    options.pollAddresses,
  ]);

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
      // Invalidate relevant react-query caches so components re-read from IndexedDB cache
      await queryClient.invalidateQueries();
      return res;
    } finally {
      setIsHydrating(false);
    }
  }, [trackedAddresses, net]);

  return {
    trackedAddresses,
    refetchAll,
    isHydrating,
    lastHydratedAt,
  };
}
