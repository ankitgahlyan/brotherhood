/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useCallback, useMemo } from 'react';
import { Address, toNano } from '@ton/core';
import type { ITonWalletKit, Wallet } from '@ton/walletkit';
import { ActPayEmi } from '@wrappers/FossFiWallet.gen';
import { getFiWalletAddress } from '@/lib/brotherhood/ton';
import type { Network } from '@/lib/brotherhood/config';
import { useBrotherhoodTransaction, GAS } from './use-brotherhood-transaction';
import type { FiAccountData } from './use-fi-account';

export interface UsePayEmiParams {
  wallet: Wallet | null | undefined;
  walletKit: ITonWalletKit | null;
  walletAddress: string | null;
  network: Network;
  accountData?: FiAccountData | null;
}

export interface UsePayEmiResult {
  send: () => Promise<void>;
  isDisabled: boolean;
  isSending: boolean;
  error: string | null;
  validationError: string | null;
  isDue: boolean;
  isInGrace: boolean;
  isOverdue: boolean;
  secondsUntilDue: number;
  secondsUntilGraceExpiry: number;
  emiAmountFi: string;
}

const DECAY_MONTH_SECONDS = 30 * 86400; // 30 days
const EMI_GRACE_PERIOD_SECONDS = 86400; // 24 hours
const EMI_AMOUNT_NANO = toNano('2500'); // 2,500 FI

export function usePayEmi({
  wallet,
  walletKit,
  walletAddress,
  network,
  accountData,
}: UsePayEmiParams): UsePayEmiResult {
  const {
    send: sendTx,
    isSending,
    error,
  } = useBrotherhoodTransaction(wallet, walletKit);

  const {
    isDue,
    isInGrace,
    isOverdue,
    secondsUntilDue,
    secondsUntilGraceExpiry,
    validationError,
  } = useMemo(() => {
    if (!wallet || !walletAddress) {
      return {
        isDue: false,
        isInGrace: false,
        isOverdue: false,
        secondsUntilDue: 0,
        secondsUntilGraceExpiry: 0,
        validationError: 'Connect wallet first',
      };
    }
    if (!accountData) {
      return {
        isDue: false,
        isInGrace: false,
        isOverdue: false,
        secondsUntilDue: 0,
        secondsUntilGraceExpiry: 0,
        validationError: null,
      };
    }
    if (!accountData.active) {
      return {
        isDue: false,
        isInGrace: false,
        isOverdue: false,
        secondsUntilDue: 0,
        secondsUntilGraceExpiry: 0,
        validationError: 'Account is not activated yet',
      };
    }

    const now = Math.floor(Date.now() / 1000);
    const baseTime =
      accountData.lastDecay > 0
        ? accountData.lastDecay
        : accountData.accountInit > 0
          ? accountData.accountInit
          : now;

    const dueDate = baseTime + DECAY_MONTH_SECONDS;
    const graceExpiry = dueDate + EMI_GRACE_PERIOD_SECONDS;

    const due = now >= dueDate;
    const inGrace = now >= dueDate && now <= graceExpiry;
    const overdue = now > graceExpiry;

    const secsUntilDue = now < dueDate ? dueDate - now : 0;
    const secsUntilGrace = now < graceExpiry ? graceExpiry - now : 0;

    let err: string | null = null;
    if (!due) {
      const days = Math.floor(secsUntilDue / 86400);
      const hours = Math.floor((secsUntilDue % 86400) / 3600);
      err = `Next monthly due in ${days}d ${hours}h`;
    } else if (accountData.jettonBalance < EMI_AMOUNT_NANO) {
      err = 'Insufficient FI balance (requires 2,500 FI)';
    }

    return {
      isDue: due,
      isInGrace: inGrace,
      isOverdue: overdue,
      secondsUntilDue: secsUntilDue,
      secondsUntilGraceExpiry: secsUntilGrace,
      validationError: err,
    };
  }, [wallet, walletAddress, accountData]);

  const send = useCallback(async () => {
    if (!walletAddress) throw new Error('No wallet address');
    const ownerAddr = Address.parse(walletAddress);
    const fiWalletAddr = await getFiWalletAddress(ownerAddr, network);

    const payload = ActPayEmi.toCell(
      ActPayEmi.create({ queryId: 0n, sendExcessesTo: ownerAddr }),
    );

    await sendTx([
      { toAddress: fiWalletAddr.toString(), amount: GAS.PAY_EMI, payload },
    ]);
  }, [walletAddress, network, sendTx]);

  const isDisabled = Boolean(validationError) || isSending;

  return {
    send,
    isDisabled,
    isSending,
    error,
    validationError,
    isDue,
    isInGrace,
    isOverdue,
    secondsUntilDue,
    secondsUntilGraceExpiry,
    emiAmountFi: '2,500',
  };
}
