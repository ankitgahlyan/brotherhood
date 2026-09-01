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
import { buildBuyCreditBody, parseUnits } from '@/lib/brotherhood/deploy';
import { getFiWalletAddress } from '@/lib/brotherhood/ton';
import type { Network } from '@/lib/brotherhood/config';
import { useBrotherhoodTransaction, GAS } from './use-brotherhood-transaction';
import type { FiAccountData } from './use-fi-account';
import { getAccountActionError } from './use-is-network-member';

export interface UseBuyCreditParams {
  wallet: Wallet | null | undefined;
  walletKit: ITonWalletKit | null;
  walletAddress: string | null;
  recipient: string;
  amount: string;
  network: Network;
  accountData?: FiAccountData | null;
}

export interface UseBuyCreditResult {
  send: () => Promise<void>;
  isDisabled: boolean;
  isSending: boolean;
  error: string | null;
  validationError: string | null;
}

export function useBuyCredit({
  wallet,
  walletKit,
  walletAddress,
  recipient,
  amount,
  network,
  accountData,
}: UseBuyCreditParams): UseBuyCreditResult {
  const {
    send: sendTx,
    isSending,
    error,
  } = useBrotherhoodTransaction(wallet, walletKit);

  const validationError = useMemo<string | null>(() => {
    if (!wallet || !walletAddress) return 'Connect wallet first';
    const actionErr = getAccountActionError(accountData);
    if (actionErr) return actionErr;
    if (accountData) {
      if (accountData.debts || accountData.debt > 0n) {
        return 'Cannot buy credit while having outstanding debt';
      }
    }
    if (!recipient.trim()) return 'Enter borrower address';
    try {
      Address.parse(recipient.trim());
    } catch {
      return 'Invalid borrower address';
    }
    if (!amount || parseFloat(amount) <= 0) return 'Enter credit amount';

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
  }, [wallet, walletAddress, accountData, recipient, amount]);

  const send = useCallback(async () => {
    if (!walletAddress) throw new Error('No wallet address');
    const ownerAddr = Address.parse(walletAddress);
    const fiWalletAddr = await getFiWalletAddress(ownerAddr, network);
    const recipientAddr = Address.parse(recipient.trim());
    const amountNano = parseUnits(amount, 9);

    const payload = buildBuyCreditBody({
      transferRecipient: recipientAddr,
      amount: amountNano,
      responseAddress: ownerAddr,
    });

    await sendTx([
      { toAddress: fiWalletAddr.toString(), amount: GAS.CREDIT, payload },
    ]);
  }, [walletAddress, recipient, amount, network, sendTx]);

  const isDisabled = Boolean(validationError) || isSending;

  return { send, isDisabled, isSending, error, validationError };
}
