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
import {
  encodeOnchainMultiplier,
  type Network,
} from '@/lib/brotherhood/config';
import { useBrotherhoodTransaction } from './use-brotherhood-transaction';
import type { FiAccountData } from './use-fi-account';
import { useNowSeconds } from '@/core/hooks';
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

  const nowSec = useNowSeconds();
  const creditMaturity = accountData?.creditMaturity;

  const effectiveMultiplier = useMemo(() => {
    if (isMultiplierDirty) {
      const parsed = parseFloat(trimmedMultiplier);
      return Number.isFinite(parsed) ? parsed : 1;
    }
    return accountData?.multiplier ?? 1;
  }, [isMultiplierDirty, trimmedMultiplier, accountData?.multiplier]);

  const isBonusMultiplier = effectiveMultiplier > 1;

  const amountValidationError = useMemo<string | null>(() => {
    if (!wallet || !walletAddress) return 'Connect wallet first';
    const actionErr = getAccountActionError(accountData);
    if (actionErr) return actionErr;
    if (!hasPersonalToken) return 'Personal Token must be registered first';

    if (isAmountDirty) {
      const num = parseFloat(trimmedAmount);
      if (isNaN(num) || num < 0) return 'Invalid loan amount';
      if (num > 0 && isBonusMultiplier) {
        if (isMaturityDirty) {
          const days = parseInt(trimmedMaturityDays, 10);
          if (isNaN(days) || days <= 0) {
            return 'Maturity must be at least 1 day when multiplier > 1x';
          }
        } else {
          if (!creditMaturity || creditMaturity <= nowSec) {
            return 'Maturity date is required when multiplier > 1x';
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
    isBonusMultiplier,
    isMaturityDirty,
    trimmedMaturityDays,
    creditMaturity,
    nowSec,
  ]);

  const maturityValidationError = useMemo<string | null>(() => {
    if (!isMaturityDirty) return null;
    const days = parseInt(trimmedMaturityDays, 10);
    if (isNaN(days) || days < 0) return 'Maturity days cannot be negative';
    if (isBonusMultiplier && days <= 0) {
      return 'Maturity must be at least 1 day when multiplier > 1x';
    }

    const targetMaturity = days === 0 ? 0 : nowSec + days * 86400;
    if (
      creditMaturity &&
      creditMaturity > nowSec &&
      targetMaturity < creditMaturity
    ) {
      return 'Cannot shorten an active maturity date';
    }

    return null;
  }, [
    isMaturityDirty,
    trimmedMaturityDays,
    isBonusMultiplier,
    creditMaturity,
    nowSec,
  ]);

  const multiplierValidationError = useMemo<string | null>(() => {
    if (!isMultiplierDirty) return null;
    if (!/^\d+(\.\d{1,3})?$/.test(trimmedMultiplier)) {
      return 'Multiplier supports up to 3 decimal places (e.g. 0.95, 1, 1.25)';
    }
    const mult = parseFloat(trimmedMultiplier);
    if (isNaN(mult) || mult < 0.001 || mult > 65.535) {
      return 'Multiplier must be between 0.001x and 65.535x';
    }
    if (
      mult > 1 &&
      !isMaturityDirty &&
      (!creditMaturity || creditMaturity <= nowSec) &&
      (isAmountDirty
        ? parseFloat(trimmedAmount) > 0
        : (accountData?.creditNeed ?? 0n) > 0n)
    ) {
      return 'Future maturity date required when multiplier > 1x';
    }
    return null;
  }, [
    isMultiplierDirty,
    trimmedMultiplier,
    isMaturityDirty,
    creditMaturity,
    nowSec,
    isAmountDirty,
    trimmedAmount,
    accountData?.creditNeed,
  ]);

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
      maturitySec =
        days === 0 ? 0n : BigInt(Math.floor(Date.now() / 1000) + days * 86400);
    }

    let multBigInt: bigint | null = null;
    if (isMultiplierDirty) {
      multBigInt = encodeOnchainMultiplier(parseFloat(trimmedMultiplier));
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

    toast.success('Loan requirement updated successfully!');
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
