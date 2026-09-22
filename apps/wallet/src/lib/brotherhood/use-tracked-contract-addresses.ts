/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Address } from '@ton/core';
import { network as defaultNetwork, type Network } from './config';
import {
  batchHydrateUniversal,
  type UniversalHydrateResult,
} from './account-state-hydrator';
import type { FiWalletStore } from '@wrappers/FossFiWallet.gen';

export function normalizeAddressString(addr: Address | string): string {
  try {
    const parsed = typeof addr === 'string' ? Address.parse(addr.trim()) : addr;
    return parsed.toString();
  } catch {
    return typeof addr === 'string' ? addr.trim() : String(addr);
  }
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
  // No-op: all components subscribe synchronously to L1 in-memory cache via useContractState
}

/**
 * Global helper for targeted refetching of affected addresses after state-mutating transactions.
 * Delays 4 seconds to wait for on-chain block finalization before batch fetching.
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

  // Wait 4 seconds for block inclusion on TON blockchain
  await new Promise((resolve) => setTimeout(resolve, 4000));

  try {
    const res = await batchHydrateUniversal(cleanAddrs, net);
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
