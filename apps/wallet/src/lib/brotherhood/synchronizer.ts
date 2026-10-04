/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { type Address } from '@ton/core';
import { type QueryClient } from '@tanstack/react-query';
import { type Network, network as defaultNetwork } from './config';
import { batchHydrateUniversal } from './account-state-hydrator';
import { invalidateContractState } from './queries';
import { syncBroCollectionContacts } from '@/features/dns/hooks/use-my-domains';

/**
 * Centralized Offline-First Synchronizer for the BrotherHood ecosystem.
 *
 * Mirrors the NiA `Synchronizer` / `OfflineFirstRepository` pattern:
 * - Read hooks (`useFiAccount`, `useMemberDetail`, `useMemberProfiles`) are 100% passive
 *   stream readers over L1/L2 `contract-cache` + `useContactBookStore` + `useDnsStore`
 *   with zero `useEffect` network side-effects on mount.
 * - Background reconciliation (`reconcileStartup`, `reconcileContracts`, `schedulePostTxReconciliation`)
 *   is orchestrated exclusively through this Synchronizer.
 */
class BrotherhoodSynchronizerImpl {
  private pendingTimers = new Set<ReturnType<typeof setTimeout>>();

  /**
   * Reconciles `.bro` DNS collection contacts and any requested contract addresses
   * in the background without blocking UI rendering.
   */
  async reconcileDnsContacts(
    net: Network = defaultNetwork,
    force = false,
  ): Promise<void> {
    await syncBroCollectionContacts(net, force);
  }

  /**
   * Reconciles a batch of contract addresses via the Zero-Getter 50ms/30-address
   * Batch BOC Hydrator into L1 Memory + L2 IndexedDB (`contract-cache`).
   */
  async reconcileContracts(
    addresses: (Address | string)[],
    net: Network = defaultNetwork,
    options?: {
      force?: boolean;
      knownTypes?: Record<string, any>;
    },
  ) {
    if (addresses.length === 0) {
      return {
        decodedStores: {} as Record<string, any>,
        balances: {} as Record<string, string>,
        rawAccountStates: {} as Record<string, any>,
        outdatedAccounts: [] as string[],
      };
    }
    return batchHydrateUniversal(addresses, net, options);
  }

  /**
   * Schedules post-transaction reconciliation (2s and 5s follow-up passes)
   * after an on-chain write completes, updating L1/L2 `contract-cache` and
   * notifying any active TanStack Query observers.
   */
  schedulePostTxReconciliation(
    targetAddresses: string[],
    net: Network,
    queryClient?: QueryClient,
    onSettledToast?: () => void,
  ): void {
    if (targetAddresses.length === 0) return;

    const runPass = (delayMs: number, isFinalPass: boolean) => {
      const timer = setTimeout(async () => {
        this.pendingTimers.delete(timer);
        try {
          await Promise.all(
            targetAddresses.map((addr) =>
              invalidateContractState(addr, net, queryClient),
            ),
          );
          if (isFinalPass && onSettledToast) {
            onSettledToast();
          }
        } catch (err) {
          console.error(
            '[BrotherhoodSynchronizer] Post-tx reconciliation failed:',
            err,
          );
        }
      }, delayMs);
      this.pendingTimers.add(timer);
    };

    runPass(2000, false);
    runPass(5000, true);
  }
}

export const brotherhoodSynchronizer = new BrotherhoodSynchronizerImpl();
