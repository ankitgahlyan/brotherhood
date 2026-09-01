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
import { buildBurnBody, parseUnits } from '@/lib/brotherhood/deploy';
import { useBrotherhoodTransaction, GAS } from './use-brotherhood-transaction';
import { getFiWalletAddress } from '@/lib/brotherhood/ton';
import type { Network } from '@/lib/brotherhood/config';
import type { FiAccountData } from './use-fi-account';
import { getAccountActionError } from './use-is-network-member';

export interface UseFiBurnParams {
  wallet: Wallet | null | undefined;
  walletKit: ITonWalletKit | null;
  walletAddress: string | null;
  amount: string;
  network: Network;
  accountData?: FiAccountData | null;
}

export interface UseFiBurnResult {
  send: () => Promise<void>;
  isDisabled: boolean;
  isSending: boolean;
  error: string | null;
  validationError: string | null;
}

export function useFiBurn({
  wallet,
  walletKit,
  walletAddress,
  amount,
  network,
  accountData,
}: UseFiBurnParams): UseFiBurnResult {
  const {
    send: sendTx,
    isSending,
    error,
  } = useBrotherhoodTransaction(wallet, walletKit);

  const validationError = useMemo<string | null>(() => {
    if (!wallet || !walletAddress) return 'Connect wallet first';
    const actionErr = getAccountActionError(accountData);
    if (actionErr) return actionErr;
    if (!amount || parseFloat(amount) <= 0) return 'Enter amount to burn';

    if (accountData) {
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
  }, [wallet, walletAddress, accountData, amount]);

  const send = useCallback(async () => {
    if (!walletAddress) throw new Error('No wallet address');
    const ownerAddr = Address.parse(walletAddress);
    const fiWalletAddr = await getFiWalletAddress(ownerAddr, network);
    const amountNano = parseUnits(amount, 9);

    const payload = buildBurnBody(amountNano, ownerAddr);

    await sendTx([
      { toAddress: fiWalletAddr.toString(), amount: GAS.BURN, payload },
    ]);
  }, [walletAddress, amount, network, sendTx]);

  const isDisabled = Boolean(validationError) || isSending;

  return { send, isDisabled, isSending, error, validationError };
}
