/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useMemo, useEffect } from 'react';
import { Address, Dictionary } from '@ton/core';
import { Location, type LocationStore } from '@wrappers/Location.gen';
import { network, FI_ADDRESS } from '@/lib/brotherhood/config';
import { batchHydrateUniversal } from '@/lib/brotherhood/account-state-hydrator';
import { useContractState } from '@/lib/brotherhood/contract-cache';

export interface LocationInfo {
  h3Cell: string | null;
  memberCount: number | null;
  version: number | null;
  minterAddress: string | null;
  members: string[];
  isDeployed: boolean;
}

export interface LocationCellDetails {
  h3Cell: string;
  contractAddress: string;
  memberCount: number;
  version: number | null;
  minterAddress: string | null;
  members: string[];
  isDeployed: boolean;
}

export interface UseLocationResult {
  location: LocationInfo | null;
  isLoading: boolean;
  refetch: () => void;
}

export interface UseLocationByH3CellResult {
  data: LocationCellDetails | null;
  calculatedAddress: string | null;
  isLoading: boolean;
  refetch: () => void;
}

/**
 * Calculates the deterministic child Location contract address for an H3 spatial cell
 * using StateInit (code + initial storage data) and 8-bit shard depth prefix matching the Minter.
 */
export function calculateLocationAddress(
  h3Cell: string,
  minterAddress: Address = Address.parse(FI_ADDRESS),
): Address {
  const loc = Location.fromStorage(
    {
      h3Cell,
      minterAddress,
      memberCount: 0n,
      members: Dictionary.empty(
        Dictionary.Keys.Address(),
        Dictionary.Values.Bool(),
      ),
      version: 0n,
    },
    {
      toShard: { fixedPrefixLength: 8, closeTo: minterAddress },
    },
  );
  return loc.address;
}

export function useLocationByH3Cell(
  h3Cell: string | null,
  minterAddressString?: string | null,
): UseLocationByH3CellResult {
  const cleanH3Cell = h3Cell?.trim() ?? '';

  const calculatedAddress = useMemo(() => {
    if (!cleanH3Cell) return null;
    try {
      const minter = minterAddressString
        ? Address.parse(minterAddressString)
        : Address.parse(FI_ADDRESS);
      return calculateLocationAddress(cleanH3Cell, minter).toString();
    } catch {
      return null;
    }
  }, [cleanH3Cell, minterAddressString]);

  // Auto-hydrate newly calculated address
  useEffect(() => {
    if (!calculatedAddress) return;
    try {
      const locAddr = Address.parse(calculatedAddress);
      batchHydrateUniversal([locAddr], network, {
        knownTypes: { [calculatedAddress]: 'location' },
      }).catch(() => {});
    } catch {
      /* ignore */
    }
  }, [calculatedAddress]);

  const { data: store, isLoading } = useContractState<LocationStore>(
    calculatedAddress,
    network,
  );

  const data = useMemo<LocationCellDetails | null>(() => {
    if (!cleanH3Cell || !calculatedAddress) return null;
    if (!store) {
      return {
        h3Cell: cleanH3Cell,
        contractAddress: calculatedAddress,
        memberCount: 0,
        version: null,
        minterAddress: null,
        members: [],
        isDeployed: false,
      };
    }

    const memberAddrs: string[] = [];
    if (store.members && typeof store.members.keys === 'function') {
      try {
        for (const k of store.members.keys()) {
          memberAddrs.push(k.toString());
        }
      } catch {
        /* dictionary parse */
      }
    }

    return {
      h3Cell: store.h3Cell || cleanH3Cell,
      contractAddress: calculatedAddress,
      memberCount: Number(store.memberCount ?? memberAddrs.length),
      version:
        store.version !== null && store.version !== undefined
          ? Number(store.version)
          : null,
      minterAddress: store.minterAddress
        ? store.minterAddress.toString()
        : null,
      members: memberAddrs,
      isDeployed: true,
    };
  }, [cleanH3Cell, calculatedAddress, store]);

  return {
    data,
    calculatedAddress,
    isLoading: isLoading && Boolean(cleanH3Cell && calculatedAddress),
    refetch: () => {
      if (calculatedAddress) {
        batchHydrateUniversal([calculatedAddress], network, {
          knownTypes: { [calculatedAddress]: 'location' },
        }).catch(() => {});
      }
    },
  };
}

export function useLocation(
  locationAddressString: string | null,
): UseLocationResult {
  const cleanAddr = locationAddressString?.trim() || null;

  useEffect(() => {
    if (!cleanAddr) return;
    try {
      const locAddr = Address.parse(cleanAddr);
      batchHydrateUniversal([locAddr], network, {
        knownTypes: { [cleanAddr]: 'location' },
      }).catch(() => {});
    } catch {
      /* ignore */
    }
  }, [cleanAddr]);

  const { data: store, isLoading } = useContractState<LocationStore>(
    cleanAddr,
    network,
  );

  const location = useMemo<LocationInfo | null>(() => {
    if (!store) return null;
    const memberAddrs: string[] = [];
    if (store.members && typeof store.members.keys === 'function') {
      try {
        for (const k of store.members.keys()) {
          memberAddrs.push(k.toString());
        }
      } catch {
        /* dictionary parse */
      }
    }

    return {
      h3Cell: store.h3Cell ?? null,
      memberCount: Number(store.memberCount ?? memberAddrs.length),
      version:
        store.version !== null && store.version !== undefined
          ? Number(store.version)
          : null,
      minterAddress: store.minterAddress
        ? store.minterAddress.toString()
        : null,
      members: memberAddrs,
      isDeployed: true,
    };
  }, [store]);

  return {
    location,
    isLoading: isLoading && Boolean(cleanAddr),
    refetch: () => {
      if (cleanAddr) {
        batchHydrateUniversal([cleanAddr], network, {
          knownTypes: { [cleanAddr]: 'location' },
        }).catch(() => {});
      }
    },
  };
}
