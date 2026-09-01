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
import { buildSpendAllowanceBody, parseUnits } from '@/lib/brotherhood/deploy';
import { getFiWalletAddress } from '@/lib/brotherhood/ton';
import type { Network } from '@/lib/brotherhood/config';
import { useBrotherhoodTransaction, GAS } from './use-brotherhood-transaction';
import type { FiAccountData } from './use-fi-account';
import { getAccountActionError } from './use-is-network-member';

export interface UseSpendAllowanceParams {
  wallet: Wallet | null | undefined;
  walletKit: ITonWalletKit | null;
  walletAddress: string | null;
  granterAddress: string;
  receiver: string;
  amount: string;
  network: Network;
  accountData?: FiAccountData | null;
}

export interface UseSpendAllowanceResult {
  send: () => Promise<void>;
  isDisabled: boolean;
  isSending: boolean;
  error: string | null;
  validationError: string | null;
}

export function useSpendAllowance({
  wallet,
  walletKit,
  walletAddress,
  granterAddress,
  receiver,
  amount,
  network,
  accountData,
}: UseSpendAllowanceParams): UseSpendAllowanceResult {
  const {
    send: sendTx,
    isSending,
    error,
  } = useBrotherhoodTransaction(wallet, walletKit);

  const validationError = useMemo<string | null>(() => {
    if (!wallet || !walletAddress) return 'Connect wallet first';
    const actionErr = getAccountActionError(accountData);
    if (actionErr) return actionErr;
    if (!granterAddress.trim()) return 'Enter granter member address';
    try {
      Address.parse(granterAddress.trim());
    } catch {
      return 'Invalid granter address';
    }
    if (!receiver.trim()) return 'Enter receiver address';
    try {
      Address.parse(receiver.trim());
    } catch {
      return 'Invalid receiver address';
    }
    if (!amount || parseFloat(amount) <= 0) return 'Enter amount to spend';

    return null;
  }, [wallet, walletAddress, accountData, granterAddress, receiver, amount]);

  const send = useCallback(async () => {
    if (!walletAddress) throw new Error('No wallet address');
    const ownerAddr = Address.parse(walletAddress);
    const granterOwnerAddr = Address.parse(granterAddress.trim());
    const granterFiWalletAddr = await getFiWalletAddress(
      granterOwnerAddr,
      network,
    );
    const receiverAddr = Address.parse(receiver.trim());
    const amountNano = parseUnits(amount, 9);

    const payload = buildSpendAllowanceBody({
      amount: amountNano,
      receiver: receiverAddr,
      sendExcessesTo: ownerAddr,
    });

    await sendTx([
      {
        toAddress: granterFiWalletAddr.toString(),
        amount: GAS.ALLOWANCE,
        payload,
      },
    ]);
  }, [walletAddress, granterAddress, receiver, amount, network, sendTx]);

  const isDisabled = Boolean(validationError) || isSending;

  return { send, isDisabled, isSending, error, validationError };
}
