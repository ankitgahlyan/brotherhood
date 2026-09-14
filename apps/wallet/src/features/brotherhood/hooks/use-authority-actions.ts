/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useCallback, useMemo } from 'react';
import { Address } from '@ton/core';
import type { ITonWalletKit, Wallet } from '@ton/walletkit';
import {
  SetStatus,
  AuthorityCloseAccount,
  ActDispatchAuthorityAction,
} from '@wrappers/FossFiWallet.gen';
import { getFiWalletAddress } from '@/lib/brotherhood/ton';
import type { Network } from '@/lib/brotherhood/config';
import { useBrotherhoodTransaction, GAS } from './use-brotherhood-transaction';
import type { FiAccountData } from './use-fi-account';

export interface UseAuthorityActionsParams {
  wallet: Wallet | null | undefined;
  walletKit: ITonWalletKit | null;
  walletAddress: string | null | undefined;
  targetAddress: string;
  newStatus: number;
  network: Network;
  accountData?: FiAccountData | null;
}

export interface DispatchAuthorityActionOptions {
  fundsReceiver?: string | null;
  amount?: bigint;
  toggleActive?: boolean;
}

export interface UseAuthorityActionsResult {
  setStatus: () => Promise<void>;
  closeAccount: () => Promise<void>;
  dispatchAuthorityAction: (
    options?: DispatchAuthorityActionOptions,
  ) => Promise<void>;
  isDisabled: boolean;
  isSending: boolean;
  error: string | null;
  validationError: string | null;
}

export function useAuthorityActions({
  wallet,
  walletKit,
  walletAddress,
  targetAddress,
  newStatus,
  network,
  accountData,
}: UseAuthorityActionsParams): UseAuthorityActionsResult {
  const {
    send: sendTx,
    isSending,
    error,
  } = useBrotherhoodTransaction(wallet, walletKit);

  const validationError = useMemo<string | null>(() => {
    if (!wallet || !walletAddress) return 'Connect wallet first';
    if (
      accountData &&
      !accountData.isAuthorityAccount &&
      !accountData.isPrevilegedAccount
    ) {
      return 'You must be an Authority account to perform authority actions';
    }
    if (!targetAddress.trim()) return 'Target member address is required';
    try {
      Address.parse(targetAddress.trim());
    } catch {
      return 'Invalid target address';
    }
    return null;
  }, [wallet, walletAddress, accountData, targetAddress]);

  const setStatus = useCallback(async () => {
    if (!walletAddress) throw new Error('No wallet address');
    const ownerAddr = Address.parse(walletAddress);
    const fiWalletAddr = await getFiWalletAddress(ownerAddr, network);
    const target = Address.parse(targetAddress.trim());
    let targetFiWallet: Address | null = null;
    try {
      targetFiWallet = await getFiWalletAddress(target, network);
    } catch {
      // ignore
    }

    const payload = SetStatus.toCell(
      SetStatus.create({
        sender: ownerAddr,
        status: BigInt(newStatus),
      }),
    );

    const affected = [fiWalletAddr];
    if (targetFiWallet) {
      affected.push(targetFiWallet);
    }

    await sendTx(
      [{ toAddress: fiWalletAddr.toString(), amount: GAS.AUTHORITY, payload }],
      { affectedContracts: affected },
    );
  }, [walletAddress, targetAddress, newStatus, network, sendTx]);

  const closeAccount = useCallback(async () => {
    if (!walletAddress) throw new Error('No wallet address');
    const ownerAddr = Address.parse(walletAddress);
    const fiWalletAddr = await getFiWalletAddress(ownerAddr, network);
    const target = Address.parse(targetAddress.trim());
    let targetFiWallet: Address | null = null;
    try {
      targetFiWallet = await getFiWalletAddress(target, network);
    } catch {
      // ignore
    }

    const payload = AuthorityCloseAccount.toCell(
      AuthorityCloseAccount.create({
        queryId: 0n,
        target,
      }),
    );

    const affected = [fiWalletAddr];
    if (targetFiWallet) {
      affected.push(targetFiWallet);
    }

    await sendTx(
      [{ toAddress: fiWalletAddr.toString(), amount: GAS.AUTHORITY, payload }],
      { affectedContracts: affected },
    );
  }, [walletAddress, targetAddress, network, sendTx]);

  const dispatchAuthorityAction = useCallback(
    async (options?: DispatchAuthorityActionOptions) => {
      if (!walletAddress) throw new Error('No wallet address');
      const ownerAddr = Address.parse(walletAddress);
      const fiWalletAddr = await getFiWalletAddress(ownerAddr, network);
      const target = Address.parse(targetAddress.trim());
      let targetFiWallet: Address | null = null;
      try {
        targetFiWallet = await getFiWalletAddress(target, network);
      } catch {
        // ignore
      }

      let parsedReceiver: Address | null = null;
      if (options?.fundsReceiver?.trim()) {
        try {
          parsedReceiver = Address.parse(options.fundsReceiver.trim());
        } catch {
          // ignore
        }
      }

      const payload = ActDispatchAuthorityAction.toCell(
        ActDispatchAuthorityAction.create({
          transferRecipient: target,
          fundsReceiver: parsedReceiver,
          amount: options?.amount ?? 0n,
          toggleActive: options?.toggleActive ?? true,
        }),
      );

      const affected = [fiWalletAddr];
      if (targetFiWallet) {
        affected.push(targetFiWallet);
      }

      await sendTx(
        [
          {
            toAddress: fiWalletAddr.toString(),
            amount: GAS.AUTHORITY,
            payload,
          },
        ],
        { affectedContracts: affected },
      );
    },
    [walletAddress, targetAddress, network, sendTx],
  );

  const isDisabled = Boolean(validationError) || isSending;

  return {
    setStatus,
    closeAccount,
    dispatchAuthorityAction,
    isDisabled,
    isSending,
    error,
    validationError,
  };
}
