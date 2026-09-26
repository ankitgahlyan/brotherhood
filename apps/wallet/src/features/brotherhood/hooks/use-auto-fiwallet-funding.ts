/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useCallback, useEffect, useRef } from 'react';
import { Address } from '@ton/core';
import type { Wallet } from '@ton/walletkit';
import { useWallet, useAuth } from '@demo/wallet-core';
import { toast } from 'sonner';
import { isOnline } from '@/core/lib/network-status';
import { getFiWalletAddress } from '@/lib/brotherhood/ton';
import {
  batchFetchAccountStates,
  toCanonicalAddressString,
} from '@/lib/brotherhood/account-state-hydrator';
import {
  network as defaultNetwork,
  type Network,
} from '@/lib/brotherhood/config';

export const MIN_FIWALLET_BALANCE_NANO = 2_000_000_000n; // 2 TON / 2 grams threshold
export const FUNDING_AMOUNT_NANO = 2_000_000_000n; // 2 TON to fund
export const ACTIVE_WALLET_RESERVE_NANO = 500_000_000n; // 0.5 TON reserve kept for user
export const ESTIMATED_FEE_PER_MSG_NANO = 50_000_000n; // 0.05 TON estimated fee per msg

// Module-level session cache to avoid repeated funding loops
const sessionFundedFiWallets = new Set<string>();

export function resetFundedFiWalletsCacheForTests(): void {
  sessionFundedFiWallets.clear();
}

export function isFiWalletFundedThisSession(address: string): boolean {
  return sessionFundedFiWallets.has(toCanonicalAddressString(address));
}

export function markFiWalletFundedThisSession(address: string): void {
  sessionFundedFiWallets.add(toCanonicalAddressString(address));
}

export interface AutoFundFiWalletsParams {
  wallet: Wallet | null | undefined;
  isUnlocked?: boolean;
  savedWallets?: Array<{ address: string }> | null;
  network?: Network;
  extraFiWallets?: (Address | string)[];
  onTransactionSent?: (normalizedHash: string) => void;
  fetchAccountStatesFn?: typeof batchFetchAccountStates;
}

export interface AutoFundFiWalletsResult {
  attempted: boolean;
  fundedCount: number;
  fundedAddresses: string[];
  skippedReason?: string;
}

let isFundingInProgress = false;

export async function autoFundUnderfundedFiWallets({
  wallet,
  isUnlocked,
  savedWallets,
  network = defaultNetwork,
  extraFiWallets = [],
  onTransactionSent,
  fetchAccountStatesFn = batchFetchAccountStates,
}: AutoFundFiWalletsParams): Promise<AutoFundFiWalletsResult> {
  if (isFundingInProgress) {
    return {
      attempted: false,
      fundedCount: 0,
      fundedAddresses: [],
      skippedReason: 'in_progress',
    };
  }

  if (!wallet) {
    return {
      attempted: false,
      fundedCount: 0,
      fundedAddresses: [],
      skippedReason: 'no_wallet',
    };
  }

  if (!isUnlocked) {
    return {
      attempted: false,
      fundedCount: 0,
      fundedAddresses: [],
      skippedReason: 'wallet_locked',
    };
  }

  if (!isOnline()) {
    return {
      attempted: false,
      fundedCount: 0,
      fundedAddresses: [],
      skippedReason: 'offline',
    };
  }

  isFundingInProgress = true;

  try {
    const candidateSet = new Set<string>();

    // 1. Collect all saved wallets' FiWallets
    if (savedWallets && savedWallets.length > 0) {
      for (const sw of savedWallets) {
        if (!sw.address) continue;
        try {
          const fiAddr = getFiWalletAddress(Address.parse(sw.address), network);
          const canonical = toCanonicalAddressString(fiAddr);
          if (canonical && !sessionFundedFiWallets.has(canonical)) {
            candidateSet.add(canonical);
          }
        } catch {
          /* pass */
        }
      }
    }

    // 2. Collect any extra FiWallets (e.g. circle members)
    if (extraFiWallets && extraFiWallets.length > 0) {
      for (const extra of extraFiWallets) {
        if (!extra) continue;
        try {
          const canonical = toCanonicalAddressString(extra);
          if (canonical && !sessionFundedFiWallets.has(canonical)) {
            candidateSet.add(canonical);
          }
        } catch {
          /* pass */
        }
      }
    }

    const candidateAddresses = Array.from(candidateSet);
    if (candidateAddresses.length === 0) {
      return {
        attempted: false,
        fundedCount: 0,
        fundedAddresses: [],
        skippedReason: 'no_candidates',
      };
    }

    // 3. Check active wallet balance and calculate budget
    let activeBalanceNano = 0n;
    try {
      const rawBalance = await wallet.getBalance();
      activeBalanceNano = BigInt(rawBalance || '0');
    } catch (balErr) {
      console.warn(
        '[autoFundFiWallets] Could not read active wallet balance:',
        balErr,
      );
      return {
        attempted: false,
        fundedCount: 0,
        fundedAddresses: [],
        skippedReason: 'balance_check_failed',
      };
    }

    const costPerRecipient = FUNDING_AMOUNT_NANO + ESTIMATED_FEE_PER_MSG_NANO;
    if (activeBalanceNano < ACTIVE_WALLET_RESERVE_NANO + costPerRecipient) {
      return {
        attempted: false,
        fundedCount: 0,
        fundedAddresses: [],
        skippedReason: 'insufficient_active_balance',
      };
    }

    const maxAffordable = Number(
      (activeBalanceNano - ACTIVE_WALLET_RESERVE_NANO) / costPerRecipient,
    );
    if (maxAffordable <= 0) {
      return {
        attempted: false,
        fundedCount: 0,
        fundedAddresses: [],
        skippedReason: 'insufficient_active_balance',
      };
    }

    // 4. Query current balances of candidates
    const fetchRes = await fetchAccountStatesFn(candidateAddresses, network);
    const accountBalanceMap = new Map<string, bigint>();

    for (const acc of fetchRes.accounts) {
      try {
        const parsed = Address.parse(acc.address);
        const bal = acc.balance ? BigInt(acc.balance) : 0n;
        accountBalanceMap.set(parsed.toString(), bal);
        accountBalanceMap.set(parsed.toRawString(), bal);
      } catch {
        if (acc.balance) {
          accountBalanceMap.set(acc.address, BigInt(acc.balance));
        }
      }
    }

    const underfundedTargets: string[] = [];
    for (const cand of candidateAddresses) {
      const bal = accountBalanceMap.get(cand) ?? 0n;
      if (bal < MIN_FIWALLET_BALANCE_NANO) {
        underfundedTargets.push(cand);
      }
    }

    if (underfundedTargets.length === 0) {
      return {
        attempted: true,
        fundedCount: 0,
        fundedAddresses: [],
        skippedReason: 'all_sufficiently_funded',
      };
    }

    // Cap at what active wallet can afford
    const targetsToFund = underfundedTargets.slice(0, maxAffordable);

    // 5. Send batched transfer silently without confirmation modal
    // Chunk by 4 to support standard TON limits
    const CHUNK_SIZE = 4;
    for (let i = 0; i < targetsToFund.length; i += CHUNK_SIZE) {
      const chunk = targetsToFund.slice(i, i + CHUNK_SIZE);
      if (chunk.length === 1) {
        const tx = await wallet.createTransferTonTransaction({
          recipientAddress: chunk[0],
          transferAmount: FUNDING_AMOUNT_NANO.toString(),
        });
        const res = await wallet.sendTransaction(tx);
        if (res?.normalizedHash && onTransactionSent) {
          onTransactionSent(res.normalizedHash);
        }
      } else {
        const tx = await (wallet as any).createTransferMultiTonTransaction(
          chunk.map((addr) => ({
            recipientAddress: addr,
            transferAmount: FUNDING_AMOUNT_NANO.toString(),
          })),
        );
        const res = await wallet.sendTransaction(tx);
        if (res?.normalizedHash && onTransactionSent) {
          onTransactionSent(res.normalizedHash);
        }
      }
    }

    // 6. Record funded in session cache
    for (const addr of targetsToFund) {
      sessionFundedFiWallets.add(addr);
    }

    // 7. Toast notification
    const count = targetsToFund.length;
    toast.success(
      count === 1 ? 'FiWallet funded' : `${count} FiWallets funded`,
      {
        description: 'Auto-topped up with 2 TON for instant upgrades',
      },
    );

    return {
      attempted: true,
      fundedCount: count,
      fundedAddresses: targetsToFund,
    };
  } catch (err) {
    console.error(
      '[autoFundUnderfundedFiWallets] Error during auto-funding:',
      err,
    );
    return {
      attempted: false,
      fundedCount: 0,
      fundedAddresses: [],
      skippedReason: 'execution_error',
    };
  } finally {
    isFundingInProgress = false;
  }
}

export function useAutoFiWalletFunding() {
  const { currentWallet, savedWallets, addPendingTransaction } = useWallet();
  const { isUnlocked } = useAuth();
  const hasTriggeredRef = useRef(false);

  const triggerAutoFunding = useCallback(
    async (extraFiWallets?: (Address | string)[]) => {
      return autoFundUnderfundedFiWallets({
        wallet: currentWallet,
        isUnlocked,
        savedWallets,
        extraFiWallets,
        onTransactionSent: (hash) => {
          if (addPendingTransaction) {
            addPendingTransaction({
              traceId: hash,
              externalHash: hash,
              finality: 'pending',
            });
          }
        },
      });
    },
    [currentWallet, isUnlocked, savedWallets, addPendingTransaction],
  );

  useEffect(() => {
    if (isUnlocked && currentWallet && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      void triggerAutoFunding().catch(() => {});
    }
  }, [isUnlocked, currentWallet, triggerAutoFunding]);

  return { triggerAutoFunding };
}
