/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useMemo, useEffect } from 'react';
import { Address } from '@ton/core';
import { network } from '@/lib/brotherhood/config';
import {
  useContractState,
  getContractCache,
  getNormalizedContractCacheKey,
} from '@/lib/brotherhood/contract-cache';
import { batchHydrateUniversal } from '@/lib/brotherhood/account-state-hydrator';
import type { LocationStore } from '@wrappers/Location.gen';

export interface UseLocationMembersResult {
  h3Cell: string | null;
  members: string[];
  isTargetMember: boolean | null;
  isLoading: boolean;
  refetch: () => Promise<void> | void;
}

export function useLocationMembers(
  locationAddressString: string | null,
  targetMemberAddressString?: string | null,
): UseLocationMembersResult {
  const cleanAddr = locationAddressString?.trim() || null;

  // Auto-hydrate on valid address input only if not yet cached
  useEffect(() => {
    if (!cleanAddr) return;
    let isCancelled = false;
    getContractCache(getNormalizedContractCacheKey(network, cleanAddr)).then(
      (cached) => {
        if (isCancelled || cached?.data) return;
        try {
          const parsed = Address.parse(cleanAddr);
          batchHydrateUniversal([parsed], network, {
            knownTypes: { [parsed.toString()]: 'location' },
          }).catch((err) => {
            console.warn('[useLocationMembers] Auto-hydration error:', err);
          });
        } catch {
          /* ignore invalid address */
        }
      },
    );
    return () => {
      isCancelled = true;
    };
  }, [cleanAddr]);

  const { data: store, isLoading } = useContractState<LocationStore>(
    cleanAddr,
    network,
  );

  const result = useMemo(() => {
    if (!store) {
      return {
        h3Cell: null,
        members: [],
        isTargetMember: null,
      };
    }

    const memberAddrs: string[] = [];
    let isTarget = false;

    if (store.members && typeof store.members.keys === 'function') {
      try {
        for (const k of store.members.keys()) {
          const str = k.toString();
          memberAddrs.push(str);
          if (
            targetMemberAddressString &&
            str.toLowerCase() === targetMemberAddressString.trim().toLowerCase()
          ) {
            isTarget = true;
          }
        }
      } catch {
        /* dictionary traversal error */
      }
    }

    return {
      h3Cell: store.h3Cell ?? null,
      members: memberAddrs,
      isTargetMember: targetMemberAddressString ? isTarget : null,
    };
  }, [store, targetMemberAddressString]);

  return {
    ...result,
    isLoading: isLoading && Boolean(cleanAddr),
    refetch: async () => {
      if (cleanAddr) {
        await batchHydrateUniversal([cleanAddr], network, {
          knownTypes: { [cleanAddr]: 'location' },
        });
      }
    },
  };
}

// Backwards compatibility alias
export const useCityMembers = useLocationMembers;
