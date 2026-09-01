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
import { buildSetAllowanceBody, parseUnits } from '@/lib/brotherhood/deploy';
import { getFiWalletAddress } from '@/lib/brotherhood/ton';
import type { Network } from '@/lib/brotherhood/config';
import { useBrotherhoodTransaction, GAS } from './use-brotherhood-transaction';
import type { FiAccountData } from './use-fi-account';
import { getAccountActionError } from './use-is-network-member';

export interface UseSetAllowanceParams {
  wallet: Wallet | null | undefined;
  walletKit: ITonWalletKit | null;
  walletAddress: string | null;
  grantee: string;
  amount: string;
  network: Network;
  accountData?: FiAccountData | null;
}

export interface UseSetAllowanceResult {
  send: () => Promise<void>;
  isDisabled: boolean;
  isSending: boolean;
  error: string | null;
  validationError: string | null;
}

export function useSetAllowance({
  wallet,
  walletKit,
  walletAddress,
  grantee,
  amount,
  network,
  accountData,
}: UseSetAllowanceParams): UseSetAllowanceResult {
  const {
    send: sendTx,
    isSending,
    error,
  } = useBrotherhoodTransaction(wallet, walletKit);

  const validationError = useMemo<string | null>(() => {
    if (!wallet || !walletAddress) return 'Connect wallet first';
    const actionErr = getAccountActionError(accountData);
    if (actionErr) return actionErr;
    if (!grantee.trim()) return 'Enter grantee address';
    try {
      const parsed = Address.parse(grantee.trim());
      if (walletAddress) {
        const self = Address.parse(walletAddress);
        if (parsed.equals(self)) return 'Cannot grant allowance to yourself';
      }
    } catch {
      return 'Invalid grantee address';
    }
    if (!amount || parseFloat(amount) < 0) return 'Enter allowance amount';

    if (accountData && parseFloat(amount) > 0) {
      try {
        const amountNano = parseUnits(amount, 9);
        if (amountNano > accountData.jettonBalance) {
          return `Insufficient balance (available: ${(Number(accountData.jettonBalance) / 1e9).toFixed(4)} FI)`;
        }
      } catch {
        return 'Invalid amount format';
      }
    }

    return null;
  }, [wallet, walletAddress, accountData, grantee, amount]);

  const send = useCallback(async () => {
    if (!walletAddress) throw new Error('No wallet address');
    const ownerAddr = Address.parse(walletAddress);
    const fiWalletAddr = await getFiWalletAddress(ownerAddr, network);
    const granteeAddr = Address.parse(grantee.trim());
    const amountNano = parseUnits(amount, 9);

    const payload = buildSetAllowanceBody({
      grantee: granteeAddr,
      amount: amountNano,
    });

    await sendTx([
      { toAddress: fiWalletAddr.toString(), amount: GAS.ALLOWANCE, payload },
    ]);
  }, [walletAddress, grantee, amount, network, sendTx]);

  const isDisabled = Boolean(validationError) || isSending;

  return { send, isDisabled, isSending, error, validationError };
}
