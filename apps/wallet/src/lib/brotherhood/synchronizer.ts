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
import { awakenAddress, awakenAddresses } from './dormant-hydration-store';
import { syncBroCollectionContacts } from '@/features/dns/hooks/use-my-domains';

export interface ManualWalletRefreshDetail {
  isPostTx?: boolean;
  extraAddresses?: string[];
  queryClient?: QueryClient;
  onSettledToast?: () => void;
  handled?: boolean;
}

function invalidateDependentQueries(queryClient?: QueryClient): void {
  if (!queryClient?.invalidateQueries) return;
  queryClient.invalidateQueries({ queryKey: ['member-profiles'] });
  queryClient.invalidateQueries({ queryKey: ['tracked-personal-tokens'] });
  queryClient.invalidateQueries({ queryKey: ['verified-personal-minters'] });
  queryClient.invalidateQueries({ queryKey: ['is-personal-minter'] });
}

class BrotherhoodSynchronizerImpl {
  private fallbackTimer: ReturnType<typeof setTimeout> | null = null;
  private stagedTargets = new Set<string>();
  private stagedIsContractTx = false;
  private stagedQueryClient?: QueryClient;
  private stagedCallbacks = new Set<() => void>();

  private awaitingTargets = new Set<string>();
  private awaitingQueryClient?: QueryClient;
  private awaitingCallbacks = new Set<() => void>();
  private wsListenerBound = false;

  constructor() {
    this.ensureWsListener();
  }

  private ensureWsListener(): void {
    if (
      this.wsListenerBound ||
      typeof window === 'undefined' ||
      typeof window.addEventListener !== 'function'
    ) {
      return;
    }
    this.wsListenerBound = true;
    window.addEventListener(
      'brotherhood_ws_transaction_finalized',
      (event: Event) => {
        const customEvent = event as CustomEvent<
          { address?: string } | undefined
        >;
        if (customEvent.detail?.address) {
          awakenAddress(customEvent.detail.address);
        }
        if (
          this.awaitingTargets.size === 0 &&
          this.awaitingCallbacks.size === 0
        ) {
          return;
        }
        this.dispatchMasterRefresh(defaultNetwork);
      },
    );
    window.addEventListener('brotherhood_tx_modal_approved', (event: Event) => {
      const customEvent = event as CustomEvent<
        { isStreamingConnected?: boolean } | undefined
      >;
      this.flushStagedPostTxReconciliation(
        defaultNetwork,
        Boolean(customEvent.detail?.isStreamingConnected),
      );
    });
    window.addEventListener('brotherhood_tx_modal_rejected', () => {
      this.clearStagedPostTxReconciliation();
    });
  }

  private dispatchMasterRefresh(net: Network): void {
    if (this.fallbackTimer) {
      clearTimeout(this.fallbackTimer);
      this.fallbackTimer = null;
    }

    const extraAddresses = Array.from(this.awaitingTargets);
    if (extraAddresses.length > 0) {
      awakenAddresses(extraAddresses);
    }
    const queryClient = this.awaitingQueryClient;
    const callbacks = Array.from(this.awaitingCallbacks);

    this.awaitingTargets.clear();
    this.awaitingQueryClient = undefined;
    this.awaitingCallbacks.clear();

    const onSettledToast = () => {
      invalidateDependentQueries(queryClient);
      callbacks.forEach((cb) => {
        try {
          cb();
        } catch {
          /* ignore */
        }
      });
    };

    if (typeof window !== 'undefined') {
      const detail: ManualWalletRefreshDetail = {
        isPostTx: true,
        extraAddresses,
        queryClient,
        onSettledToast,
        handled: false,
      };
      window.dispatchEvent(
        new CustomEvent('brotherhood_manual_wallet_refresh', { detail }),
      );
      if (detail.handled) {
        return;
      }
    }

    // Fallback when TrackedAddressesSyncMount is not mounted (e.g. isolated tests)
    if (extraAddresses.length > 0) {
      void batchHydrateUniversal(extraAddresses, net, { force: true })
        .then(() => {
          onSettledToast();
        })
        .catch((err) => {
          console.error(
            '[BrotherhoodSynchronizer] Fallback batch hydration failed:',
            err,
          );
        });
    } else {
      onSettledToast();
    }
  }

  /**
   * Reconciles `.bro` DNS collection contacts and any requested contract addresses
   * in the background without blocking UI rendering.
   */
  async reconcileDnsContacts(
    net: Network = defaultNetwork,
    force = false,
    usePrehydratedCache = false,
  ): Promise<void> {
    await syncBroCollectionContacts(net, force, usePrehydratedCache);
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
   * Stages post-transaction reconciliation targets when an emulation confirmation modal
   * is enqueued so no network requests fire until the user actually approves and broadcasts.
   */
  stagePostTxReconciliation(
    targetAddresses: string[],
    queryClient?: QueryClient,
    onSettledToast?: () => void,
    isContractTx = true,
  ): void {
    targetAddresses.forEach((addr) => {
      if (addr) this.stagedTargets.add(addr);
    });
    if (isContractTx) {
      this.stagedIsContractTx = true;
    }
    if (queryClient) {
      this.stagedQueryClient = queryClient;
    }
    if (onSettledToast) {
      this.stagedCallbacks.add(onSettledToast);
    }
  }

  /**
   * Clears any staged post-transaction reconciliation targets when the user rejects the modal.
   */
  clearStagedPostTxReconciliation(): void {
    this.stagedTargets.clear();
    this.stagedIsContractTx = false;
    this.stagedQueryClient = undefined;
    this.stagedCallbacks.clear();
  }

  /**
   * Flushes staged post-transaction reconciliation once the user approves and broadcasts
   * inside TransactionRequestModal.
   */
  flushStagedPostTxReconciliation(
    net: Network = defaultNetwork,
    isStreamingConnected = false,
  ): void {
    const targets = Array.from(this.stagedTargets);
    const isContractTx = this.stagedIsContractTx;
    const queryClient = this.stagedQueryClient;
    const callbacks = Array.from(this.stagedCallbacks);

    this.clearStagedPostTxReconciliation();

    const combinedCallback =
      callbacks.length > 0
        ? () => {
            callbacks.forEach((cb) => cb());
          }
        : undefined;

    this.schedulePostTxReconciliation(
      targets,
      net,
      queryClient,
      combinedCallback,
      {
        isStreamingConnected,
        isContractTx,
      },
    );
  }

  /**
   * Schedules post-transaction state sync after an on-chain transaction is broadcast:
   * - If WebSocket streaming is connected:
   *   - Standard TON/Jetton sends make 0 post-tx accountStates calls.
   *   - Contract sends wait for the WebSocket `finalized` event and trigger a single
   *     universal `brotherhood_manual_wallet_refresh` master batch.
   * - If WebSocket streaming is disconnected:
   *   - Schedules a single 4s delayed `brotherhood_manual_wallet_refresh` master batch.
   */
  schedulePostTxReconciliation(
    targetAddresses: string[],
    net: Network,
    queryClient?: QueryClient,
    onSettledToast?: () => void,
    options?: {
      isStreamingConnected?: boolean;
      isContractTx?: boolean;
    },
  ): void {
    const isStreamingConnected = options?.isStreamingConnected ?? false;
    const isContractTx = options?.isContractTx ?? targetAddresses.length > 0;

    // Standard TON/Jetton send with active WebSocket needs 0 accountStates polling
    if (isStreamingConnected && !isContractTx && targetAddresses.length === 0) {
      return;
    }

    targetAddresses.forEach((addr) => {
      if (addr) {
        this.awaitingTargets.add(addr);
        awakenAddress(addr);
      }
    });
    if (queryClient) {
      this.awaitingQueryClient = queryClient;
    }
    if (onSettledToast) {
      this.awaitingCallbacks.add(onSettledToast);
    }

    if (isStreamingConnected) {
      this.ensureWsListener();
      return;
    }

    if (this.fallbackTimer) {
      clearTimeout(this.fallbackTimer);
    }
    this.fallbackTimer = setTimeout(() => {
      this.fallbackTimer = null;
      this.dispatchMasterRefresh(net);
    }, 4000);
  }
}

export const brotherhoodSynchronizer = new BrotherhoodSynchronizerImpl();
