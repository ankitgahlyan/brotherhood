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
import { toast } from 'sonner';
import { SetLoanRequirement } from '@wrappers/FossFiWallet.gen';
import { parseUnits } from '@/lib/brotherhood/deploy';
import { getFiWalletAddress, isZeroAddress } from '@/lib/brotherhood/ton';
import type { Network } from '@/lib/brotherhood/config';
import { useBrotherhoodTransaction } from './use-brotherhood-transaction';
import { useRefreshContractQueries } from '@/lib/brotherhood/queries';
import { deleteContractCache } from '@/lib/brotherhood/contract-cache';
import type { FiAccountData } from './use-fi-account';
import { getAccountActionError } from './use-is-network-member';

export interface UseLoanRequirementParams {
  wallet: Wallet | null | undefined;
  walletKit: ITonWalletKit | null;
  walletAddress: string | null;
  network: Network;
  accountData?: FiAccountData | null;
  amount: string;
  maturityDays: string;
  multiplier: string;
  onSuccess?: () => void;
}

export interface UseLoanRequirementResult {
  updateLoanRequirement: () => Promise<void>;
  isDisabled: boolean;
  isSending: boolean;
  isDirty: boolean;
  error: string | null;
  hasPersonalToken: boolean;
  amountValidationError: string | null;
  maturityValidationError: string | null;
  multiplierValidationError: string | null;
}

const SET_TERMS_GAS = toNano('0.2');

export function useLoanRequirement({
  wallet,
  walletKit,
  walletAddress,
  network,
  accountData,
  amount,
  maturityDays,
  multiplier,
  onSuccess,
}: UseLoanRequirementParams): UseLoanRequirementResult {
  const {
    send: sendTx,
    isSending,
    error,
  } = useBrotherhoodTransaction(wallet, walletKit);
  const refreshQueries = useRefreshContractQueries();

  const hasPersonalToken = useMemo(() => {
    const minter = accountData?.personalJettonMinter;
    return Boolean(minter && !isZeroAddress(minter));
  }, [accountData?.personalJettonMinter]);

  const trimmedAmount = amount.trim();
  const isAmountDirty = Boolean(trimmedAmount);

  const trimmedMaturityDays = maturityDays.trim();
  const isMaturityDirty = Boolean(trimmedMaturityDays);

  const trimmedMultiplier = multiplier.trim();
  const isMultiplierDirty = Boolean(trimmedMultiplier);

  const isDirty = isAmountDirty || isMaturityDirty || isMultiplierDirty;

  const amountValidationError = useMemo<string | null>(() => {
    if (!wallet || !walletAddress) return 'Connect wallet first';
    const actionErr = getAccountActionError(accountData);
    if (actionErr) return actionErr;
    if (!hasPersonalToken) return 'Personal Token must be registered first';

    if (isAmountDirty) {
      const num = parseFloat(trimmedAmount);
      if (isNaN(num) || num < 0) return 'Invalid loan amount';
      if (num > 0) {
        if (isMaturityDirty) {
          const days = parseInt(trimmedMaturityDays, 10);
          if (isNaN(days) || days <= 0) {
            return 'Maturity must be at least 1 day when borrowing';
          }
        } else {
          const nowSec = Math.floor(Date.now() / 1000);
          if (
            !accountData?.creditMaturity ||
            accountData.creditMaturity <= nowSec
          ) {
            return 'Maturity date is required when requesting a loan';
          }
        }
      }
    }
    return null;
  }, [
    wallet,
    walletAddress,
    accountData,
    hasPersonalToken,
    isAmountDirty,
    trimmedAmount,
    isMaturityDirty,
    trimmedMaturityDays,
  ]);

  const maturityValidationError = useMemo<string | null>(() => {
    if (!isMaturityDirty) return null;
    const days = parseInt(trimmedMaturityDays, 10);
    if (isNaN(days) || days <= 0) return 'Maturity must be at least 1 day';

    const nowSec = Math.floor(Date.now() / 1000);
    const targetMaturity = nowSec + days * 86400;
    if (
      accountData?.creditMaturity &&
      accountData.creditMaturity > nowSec &&
      targetMaturity < accountData.creditMaturity
    ) {
      return 'Cannot shorten an active maturity date';
    }

    return null;
  }, [isMaturityDirty, trimmedMaturityDays, accountData?.creditMaturity]);

  const multiplierValidationError = useMemo<string | null>(() => {
    if (!isMultiplierDirty) return null;
    const mult = parseInt(trimmedMultiplier, 10);
    if (
      isNaN(mult) ||
      mult < 1 ||
      !Number.isInteger(Number(trimmedMultiplier))
    ) {
      return 'Multiplier must be an integer >= 1';
    }
    return null;
  }, [isMultiplierDirty, trimmedMultiplier]);

  const hasValidationError =
    Boolean(amountValidationError) ||
    Boolean(maturityValidationError) ||
    Boolean(multiplierValidationError);

  const isDisabled =
    !wallet ||
    !walletAddress ||
    isSending ||
    !hasPersonalToken ||
    !isDirty ||
    hasValidationError;

  const updateLoanRequirement = useCallback(async () => {
    if (!walletAddress) throw new Error('No wallet connected');
    if (!hasPersonalToken)
      throw new Error('Personal Token must be registered first');
    if (!isDirty) throw new Error('No fields modified');
    if (hasValidationError) throw new Error('Resolve validation errors first');

    const ownerAddr = Address.parse(walletAddress);
    const fiWalletAddr = await getFiWalletAddress(ownerAddr, network);

    let amountNano: bigint | null = null;
    if (isAmountDirty) {
      amountNano = parseUnits(trimmedAmount, 9);
    }

    let maturitySec: bigint | null = null;
    if (isMaturityDirty) {
      const days = parseInt(trimmedMaturityDays, 10);
      maturitySec = BigInt(Math.floor(Date.now() / 1000) + days * 86400);
    }

    let multBigInt: bigint | null = null;
    if (isMultiplierDirty) {
      multBigInt = BigInt(parseInt(trimmedMultiplier, 10));
    }

    const body = SetLoanRequirement.toCell(
      SetLoanRequirement.create({
        queryId: 0n,
        amount: amountNano,
        maturityDate: maturitySec,
        multiplier: multBigInt,
      }),
    );

    await sendTx([
      {
        toAddress: fiWalletAddr.toString(),
        amount: SET_TERMS_GAS,
        payload: body,
      },
    ]);

    await deleteContractCache(`fi-wallet-state:${ownerAddr.toString()}`);
    toast.success('Loan requirement updated successfully!');
    await refreshQueries([`fi-wallet-state:${ownerAddr.toString()}`]);
    onSuccess?.();
  }, [
    walletAddress,
    hasPersonalToken,
    isDirty,
    hasValidationError,
    network,
    isAmountDirty,
    trimmedAmount,
    isMaturityDirty,
    trimmedMaturityDays,
    isMultiplierDirty,
    trimmedMultiplier,
    sendTx,
    refreshQueries,
    onSuccess,
  ]);

  return {
    updateLoanRequirement,
    isDisabled,
    isSending,
    isDirty,
    error,
    hasPersonalToken,
    amountValidationError,
    maturityValidationError,
    multiplierValidationError,
  };
}
