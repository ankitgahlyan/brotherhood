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
import { AskGoldCoinsTransfer } from '@wrappers/FossFiWallet.gen';
import { getFiWalletAddress } from '@/lib/brotherhood/ton';
import type { Network } from '@/lib/brotherhood/config';
import { useBrotherhoodTransaction, GAS } from './use-brotherhood-transaction';
import type { FiAccountData } from './use-fi-account';
import { getAccountActionError } from './use-is-network-member';

export interface UseGoldTransferParams {
  wallet: Wallet | null | undefined;
  walletKit: ITonWalletKit | null;
  walletAddress: string | null;
  recipient: string;
  amount: number;
  network: Network;
  accountData?: FiAccountData | null;
}

export interface UseGoldTransferResult {
  send: () => Promise<void>;
  isDisabled: boolean;
  isSending: boolean;
  error: string | null;
  validationError: string | null;
}

export function useGoldTransfer({
  wallet,
  walletKit,
  walletAddress,
  recipient,
  amount,
  network,
  accountData,
}: UseGoldTransferParams): UseGoldTransferResult {
  const {
    send: sendTx,
    isSending,
    error,
  } = useBrotherhoodTransaction(wallet, walletKit);

  const validationError = useMemo<string | null>(() => {
    if (!wallet || !walletAddress) return 'Connect wallet first';
    const actionErr = getAccountActionError(accountData);
    if (actionErr) return actionErr;
    if (!recipient.trim()) return 'Enter recipient address';
    try {
      Address.parse(recipient.trim());
    } catch {
      return 'Invalid recipient address';
    }
    if (!amount || amount <= 0) return 'Enter number of gold coins to transfer';

    if (accountData) {
      if (amount > accountData.goldCoins) {
        return `Insufficient gold coins (available: ${accountData.goldCoins})`;
      }
    }

    return null;
  }, [wallet, walletAddress, accountData, recipient, amount]);

  const send = useCallback(async () => {
    if (!walletAddress) throw new Error('No wallet address');
    const ownerAddr = Address.parse(walletAddress);
    const fiWalletAddr = await getFiWalletAddress(ownerAddr, network);
    const recipientAddr = Address.parse(recipient.trim());

    const payload = AskGoldCoinsTransfer.toCell(
      AskGoldCoinsTransfer.create({
        queryId: 0n,
        amount: BigInt(amount),
        receiver: recipientAddr,
        sendExcessesTo: ownerAddr,
      }),
    );

    await sendTx([
      { toAddress: fiWalletAddr.toString(), amount: GAS.GOLD, payload },
    ]);
  }, [walletAddress, recipient, amount, network, sendTx]);

  const isDisabled = Boolean(validationError) || isSending;

  return { send, isDisabled, isSending, error, validationError };
}
