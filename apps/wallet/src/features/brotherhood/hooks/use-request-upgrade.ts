/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useCallback, useMemo } from 'react';
import { Address } from '@ton/core';
import { useQueryClient } from '@tanstack/react-query';
import type { ITonWalletKit, Wallet } from '@ton/walletkit';
import { buildRequestUpgradeBody } from '@/lib/brotherhood/deploy';
import { getFiWalletAddress } from '@/lib/brotherhood/ton';
import type { Network } from '@/lib/brotherhood/config';
import { useBrotherhoodTransaction, GAS } from './use-brotherhood-transaction';
import type { FiAccountData } from './use-fi-account';

export interface UseRequestUpgradeParams {
  wallet: Wallet | null | undefined;
  walletKit: ITonWalletKit | null;
  walletAddress: string | null;
  network: Network;
  accountData?: FiAccountData | null;
  minterVersion?: number | null;
}

export interface UseRequestUpgradeResult {
  send: () => Promise<void>;
  isDisabled: boolean;
  isSending: boolean;
  error: string | null;
  validationError: string | null;
  hasUpgradeAvailable: boolean;
  walletVersion: number;
  minterVersion: number;
}

export function useRequestUpgrade({
  wallet,
  walletKit,
  walletAddress,
  network,
  accountData,
  minterVersion,
}: UseRequestUpgradeParams): UseRequestUpgradeResult {
  const queryClient = useQueryClient();
  const {
    send: sendTx,
    isSending,
    error,
  } = useBrotherhoodTransaction(wallet, walletKit);

  const walletVersion = accountData?.version ?? 0;
  const targetMinterVersion = minterVersion ?? 0;
  const hasUpgradeAvailable =
    accountData !== null &&
    accountData !== undefined &&
    walletVersion < targetMinterVersion;

  const validationError = useMemo<string | null>(() => {
    if (!wallet || !walletAddress) return 'Connect wallet first';
    if (!accountData) return 'Loading account data...';
    if (!accountData.active && !accountData.isPrevilegedAccount) {
      return 'Account must be activated to upgrade';
    }
    if (walletVersion >= targetMinterVersion) {
      return 'Contract code is already up to date with minter';
    }
    return null;
  }, [wallet, walletAddress, accountData, walletVersion, targetMinterVersion]);

  const send = useCallback(async () => {
    if (!walletAddress) throw new Error('No wallet address');
    const ownerAddr = Address.parse(walletAddress);
    const fiWalletAddr = await getFiWalletAddress(ownerAddr, network);

    const payload = buildRequestUpgradeBody();

    await sendTx([
      {
        toAddress: fiWalletAddr.toString(),
        amount: GAS.REQUEST_UPGRADE,
        payload,
      },
    ]);

    // Invalidate cached state so new version reflects on next refetch
    queryClient.invalidateQueries({ queryKey: ['fi-wallet-state'] });
    queryClient.invalidateQueries({ queryKey: ['fi-minter-state'] });
  }, [walletAddress, network, sendTx, queryClient]);

  const isDisabled = Boolean(validationError) || isSending;

  return {
    send,
    isDisabled,
    isSending,
    error,
    validationError,
    hasUpgradeAvailable,
    walletVersion,
    minterVersion: targetMinterVersion,
  };
}
