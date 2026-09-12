/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { invalidateContractState } from '@/lib/brotherhood/queries';
import { getFiWalletAddress } from '@/lib/brotherhood/ton';
import { toast } from 'sonner';
import { Address, toNano, type Cell } from '@ton/core';
import type { ITonWalletKit, Wallet } from '@ton/walletkit';
import { isOnline } from '@/core/lib/network-status';

export interface BrotherhoodMessage {
  toAddress: string;
  amount: bigint;
  payload: Cell;
  stateInit?: Cell;
}

export interface UseBrotherhoodTransactionResult {
  send: (
    messages: BrotherhoodMessage[],
    options?: { affectedContracts?: (Address | string)[] },
  ) => Promise<void>;
  isSending: boolean;
  error: string | null;
}

/**
 * Shared hook for all BrotherHood write operations.
 * Adapts the jetton project's useSendFiTransaction pattern to the
 * demo-wallet's walletKit.handleNewTransaction() infrastructure.
 */
export function useBrotherhoodTransaction(
  wallet: Wallet | null | undefined,
  walletKit: ITonWalletKit | null,
): UseBrotherhoodTransactionResult {
  const queryClient = useQueryClient();
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(
    async (
      messages: BrotherhoodMessage[],
      options?: { affectedContracts?: (Address | string)[] },
    ) => {
      if (!wallet) {
        toast.error('No wallet connected');
        throw new Error('No wallet available');
      }
      if (!walletKit) {
        toast.error('WalletKit not initialized');
        throw new Error('WalletKit not initialized');
      }

      if (!isOnline()) {
        toast.error('Cannot send transactions while offline');
        throw new Error('Cannot send transactions while offline');
      }

      setIsSending(true);
      setError(null);

      try {
        if (messages.length === 1) {
          const msg = messages[0];
          const tx = await wallet.createTransferTonTransaction({
            recipientAddress: msg.toAddress,
            transferAmount: msg.amount.toString(),
            payload: msg.payload.toBoc().toString('base64'),
            stateInit: msg.stateInit
              ? msg.stateInit.toBoc().toString('base64')
              : undefined,
          });
          await walletKit.handleNewTransaction(wallet, tx);
        } else {
          for (const msg of messages) {
            const tx = await wallet.createTransferTonTransaction({
              recipientAddress: msg.toAddress,
              transferAmount: msg.amount.toString(),
              payload: msg.payload.toBoc().toString('base64'),
              stateInit: msg.stateInit
                ? msg.stateInit.toBoc().toString('base64')
                : undefined,
            });
            await walletKit.handleNewTransaction(wallet, tx);
          }
        }

        // Determine affected contracts
        const targets = new Set<string>();
        if (
          options?.affectedContracts &&
          options.affectedContracts.length > 0
        ) {
          options.affectedContracts.forEach((c) => targets.add(c.toString()));
        } else {
          // Default to destination contracts in messages
          messages.forEach((m) => targets.add(m.toAddress));
          // Plus user's own FiWallet address
          try {
            const userAddr = wallet.getAddress();
            if (userAddr) {
              const userFiWallet = await getFiWalletAddress(
                Address.parse(userAddr),
              );
              targets.add(userFiWallet.toString());
            }
          } catch {
            /* pass */
          }
        }

        // Target invalidation after 4 seconds (1-2 TON blocks)
        setTimeout(async () => {
          try {
            const targetList = Array.from(targets);
            await Promise.all(
              targetList.map((addr) =>
                invalidateContractState(addr, 'testnet', queryClient),
              ),
            );
            toast.info('On-chain state updated');
          } catch (refreshErr) {
            console.error(
              'Targeted refresh after transaction failed:',
              refreshErr,
            );
          }
        }, 4000);
      } catch (err) {
        const errMsg =
          err instanceof Error ? err.message : 'Transaction failed';
        setError(errMsg);
        toast.error('Transaction failed', { description: errMsg });
        throw err;
      } finally {
        setIsSending(false);
      }
    },
    [wallet, walletKit, queryClient],
  );

  return { send, isSending, error };
}

/** Default gas amounts for various operations */
export const GAS = {
  TRANSFER: toNano('0.5'),
  BURN: toNano('0.6'),
  CLAIM: toNano('0.5'),
  INVITE: toNano('1.0'),
  VOTE: toNano('0.5'),
  CREDIT: toNano('1.5'),
  REPAY: toNano('0.5'),
  ALLOWANCE: toNano('0.5'),
  GOLD: toNano('0.5'),
  PROFILE: toNano('1.0'),
  AUTHORITY: toNano('0.1'),
  LOTTERY: toNano('0.5'),
  DAO: toNano('0.1'),
  DEPLOY: toNano('0.5'),
  MINT: toNano('0.75'),
  TOP_UP: toNano('0.1'),
  REQUEST_UPGRADE: toNano('0.08'),
  SET_PERSONAL: toNano('0.6'),
  PAY_EMI: toNano('0.2'),
} as const;
