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
import { SetStatus, AuthorityCloseAccount } from '@wrappers/FossFiWallet.gen';
import { getFiWalletAddress } from '@/lib/brotherhood/ton';
import type { Network } from '@/lib/brotherhood/config';
import { useBrotherhoodTransaction, GAS } from './use-brotherhood-transaction';
import type { FiAccountData } from './use-fi-account';

export interface UseAuthorityActionsParams {
  wallet: Wallet | null | undefined;
  walletKit: ITonWalletKit | null;
  walletAddress: string | null;
  targetAddress: string;
  newStatus: number;
  network: Network;
  accountData?: FiAccountData | null;
}

export interface UseAuthorityActionsResult {
  setStatus: () => Promise<void>;
  closeAccount: () => Promise<void>;
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
    if (accountData) {
      if (!accountData.isAuthorityAccount && !accountData.isPrevilegedAccount) {
        return 'Connected account is not an authorized Authority';
      }
    }
    if (!targetAddress.trim()) return 'Enter target member address';
    try {
      Address.parse(targetAddress.trim());
    } catch {
      return 'Invalid target address';
    }
    if (newStatus < 0 || newStatus > 2)
      return 'Status must be 0 (Active), 1 (Suspended), or 2 (Review)';

    return null;
  }, [wallet, walletAddress, accountData, targetAddress, newStatus]);

  const setStatus = useCallback(async () => {
    if (!walletAddress) throw new Error('No wallet address');
    const ownerAddr = Address.parse(walletAddress);
    const fiWalletAddr = await getFiWalletAddress(ownerAddr, network);

    const payload = SetStatus.toCell(
      SetStatus.create({
        sender: ownerAddr,
        status: BigInt(newStatus),
      }),
    );

    await sendTx([
      { toAddress: fiWalletAddr.toString(), amount: GAS.AUTHORITY, payload },
    ]);
  }, [walletAddress, newStatus, network, sendTx]);

  const closeAccount = useCallback(async () => {
    if (!walletAddress) throw new Error('No wallet address');
    const ownerAddr = Address.parse(walletAddress);
    const fiWalletAddr = await getFiWalletAddress(ownerAddr, network);
    const target = Address.parse(targetAddress.trim());

    const payload = AuthorityCloseAccount.toCell(
      AuthorityCloseAccount.create({
        queryId: 0n,
        target,
      }),
    );

    await sendTx([
      { toAddress: fiWalletAddr.toString(), amount: GAS.AUTHORITY, payload },
    ]);
  }, [walletAddress, targetAddress, network, sendTx]);

  const isDisabled = Boolean(validationError) || isSending;

  return {
    setStatus,
    closeAccount,
    isDisabled,
    isSending,
    error,
    validationError,
  };
}
