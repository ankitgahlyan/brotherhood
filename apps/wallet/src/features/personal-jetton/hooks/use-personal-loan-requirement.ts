/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useCallback, useMemo } from 'react';
import { toNano } from '@ton/core';
import type { ITonWalletKit, Wallet } from '@ton/walletkit';
import { toast } from 'sonner';
import { SetLoanRequirement } from '@wrappers/PersonalWallet.gen';
import { parseUnits } from '@/lib/brotherhood/deploy';
import { encodeOnchainMultiplier } from '@/lib/brotherhood/config';
import { useBrotherhoodTransaction } from '@/features/brotherhood/hooks/use-brotherhood-transaction';
import { useNowSeconds } from '@/core/hooks';
import type { PersonalCreditInfo } from '@wrappers/PersonalWallet.gen';

export interface UsePersonalLoanRequirementParams {
  wallet: Wallet | null | undefined;
  walletKit: ITonWalletKit | null;
  walletAddress: string | null;
  personalWalletAddress: string | null;
  personalMinterAddress: string | null;
  creditInfo?: PersonalCreditInfo | null;
  amount: string;
  maturityDays: string;
  cutoffDays?: string;
  multiplier: string;
  onSuccess?: () => void;
}

export interface UsePersonalLoanRequirementResult {
  updateLoanRequirement: () => Promise<void>;
  isDisabled: boolean;
  isSending: boolean;
  isDirty: boolean;
  error: string | null;
  amountValidationError: string | null;
  maturityValidationError: string | null;
  cutoffValidationError: string | null;
  multiplierValidationError: string | null;
}

const SET_TERMS_GAS = toNano('0.2');

export function usePersonalLoanRequirement({
  wallet,
  walletKit,
  walletAddress,
  personalWalletAddress,
  personalMinterAddress,
  creditInfo,
  amount,
  maturityDays,
  cutoffDays = '',
  multiplier,
  onSuccess,
}: UsePersonalLoanRequirementParams): UsePersonalLoanRequirementResult {
  const {
    send: sendTx,
    isSending,
    error,
  } = useBrotherhoodTransaction(wallet, walletKit);
  const nowSec = useNowSeconds();

  const trimmedAmount = amount.trim();
  const trimmedMaturityDays = maturityDays.trim();
  const trimmedCutoffDays = cutoffDays.trim();
  const trimmedMultiplier = multiplier.trim();

  // Dirty check against current on-chain state
  const isAmountDirty = useMemo(() => {
    if (!creditInfo) return trimmedAmount !== '';
    const currentNeedFormatted = (
      Number(creditInfo.creditNeed) / 1e9
    ).toString();
    return trimmedAmount !== '' && trimmedAmount !== currentNeedFormatted;
  }, [creditInfo, trimmedAmount]);

  const isMaturityDirty = useMemo(() => {
    if (!creditInfo) return trimmedMaturityDays !== '';
    const currentMaturitySec = Number(creditInfo.creditMaturity);
    if (currentMaturitySec === 0) {
      return trimmedMaturityDays !== '' && trimmedMaturityDays !== '0';
    }
    const currentDays = Math.max(
      0,
      Math.round((currentMaturitySec - nowSec) / 86400),
    ).toString();
    return trimmedMaturityDays !== '' && trimmedMaturityDays !== currentDays;
  }, [creditInfo, trimmedMaturityDays, nowSec]);

  const isCutoffDirty = useMemo(() => {
    if (!creditInfo) return trimmedCutoffDays !== '';
    const currentCutoffSec = Number(creditInfo.creditCutoff ?? 0);
    if (currentCutoffSec === 0) {
      return trimmedCutoffDays !== '' && trimmedCutoffDays !== '0';
    }
    const currentDays = Math.max(
      0,
      Math.round((currentCutoffSec - nowSec) / 86400),
    ).toString();
    return trimmedCutoffDays !== '' && trimmedCutoffDays !== currentDays;
  }, [creditInfo, trimmedCutoffDays, nowSec]);

  const isMultiplierDirty = useMemo(() => {
    if (!creditInfo) return trimmedMultiplier !== '';
    const currentMultiplierFormatted = (
      Number(creditInfo.multiplier) / 1000
    ).toFixed(3);
    const parsedInput = parseFloat(trimmedMultiplier);
    if (isNaN(parsedInput)) return false;
    return parsedInput.toFixed(3) !== currentMultiplierFormatted;
  }, [creditInfo, trimmedMultiplier]);

  const isDirty =
    isAmountDirty || isMaturityDirty || isCutoffDirty || isMultiplierDirty;

  // Amount validation
  const amountValidationError = useMemo<string | null>(() => {
    if (!trimmedAmount) return null;
    const parsed = parseFloat(trimmedAmount);
    if (isNaN(parsed) || parsed < 0) {
      return 'Amount must be a non-negative number';
    }
    return null;
  }, [trimmedAmount]);

  // Multiplier validation
  const multiplierValidationError = useMemo<string | null>(() => {
    if (!trimmedMultiplier) return null;
    const parsed = parseFloat(trimmedMultiplier);
    if (isNaN(parsed) || parsed < 0.001) {
      return 'Multiplier must be at least 0.001x';
    }
    return null;
  }, [trimmedMultiplier]);

  // Maturity days validation
  const maturityValidationError = useMemo<string | null>(() => {
    if (!trimmedMaturityDays) return null;
    const parsed = parseInt(trimmedMaturityDays, 10);
    if (isNaN(parsed) || parsed < 0) {
      return 'Maturity must be 0 (instant) or a positive number of days';
    }
    const multParsed = parseFloat(trimmedMultiplier);
    const effectiveMult = !isNaN(multParsed)
      ? multParsed
      : creditInfo && creditInfo.multiplier > 0
        ? Number(creditInfo.multiplier) / 1000
        : 1.0;
    if (effectiveMult > 1.0 && parsed === 0) {
      return 'Bonus multipliers (> 1.000x) require a future maturity date (> 0 days)';
    }
    return null;
  }, [creditInfo, trimmedMaturityDays, trimmedMultiplier]);

  // Cutoff days validation
  const cutoffValidationError = useMemo<string | null>(() => {
    if (!trimmedCutoffDays) return null;
    const cutoffParsed = parseInt(trimmedCutoffDays, 10);
    if (isNaN(cutoffParsed) || cutoffParsed < 0) {
      return 'Funding deadline must be a non-negative number of days';
    }
    const maturityParsed = trimmedMaturityDays
      ? parseInt(trimmedMaturityDays, 10)
      : creditInfo && Number(creditInfo.creditMaturity) > 0
        ? Math.max(
            0,
            Math.round((Number(creditInfo.creditMaturity) - nowSec) / 86400),
          )
        : null;
    if (
      maturityParsed !== null &&
      maturityParsed > 0 &&
      cutoffParsed > maturityParsed
    ) {
      return 'Funding deadline cannot exceed loan maturity date';
    }
    return null;
  }, [creditInfo, nowSec, trimmedCutoffDays, trimmedMaturityDays]);

  const hasValidationError =
    Boolean(amountValidationError) ||
    Boolean(maturityValidationError) ||
    Boolean(cutoffValidationError) ||
    Boolean(multiplierValidationError);

  const isDisabled =
    !personalWalletAddress || !isDirty || hasValidationError || isSending;

  const updateLoanRequirement = useCallback(async () => {
    if (!walletAddress || !personalWalletAddress) {
      throw new Error('Personal Token wallet not available');
    }
    if (!isDirty || hasValidationError) return;

    let amountNano: bigint | null = null;
    if (isAmountDirty && trimmedAmount !== '') {
      amountNano = parseUnits(trimmedAmount, 9);
    }

    let maturitySec: bigint | null = null;
    if (isMaturityDirty) {
      const days = parseInt(trimmedMaturityDays, 10);
      maturitySec =
        days === 0 ? 0n : BigInt(Math.floor(Date.now() / 1000) + days * 86400);
    }

    let cutoffSec: bigint | null = null;
    if (isCutoffDirty) {
      const days = parseInt(trimmedCutoffDays, 10);
      cutoffSec =
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
        cutoffDate: cutoffSec,
        multiplier: multBigInt,
      }),
    );

    const affected = [personalWalletAddress];
    if (personalMinterAddress) {
      affected.push(personalMinterAddress);
    }

    await sendTx(
      [
        {
          toAddress: personalWalletAddress,
          amount: SET_TERMS_GAS,
          payload: body,
        },
      ],
      { affectedContracts: affected },
    );

    toast.success('Personal token credit terms updated successfully!');
    onSuccess?.();
  }, [
    walletAddress,
    personalWalletAddress,
    personalMinterAddress,
    isDirty,
    hasValidationError,
    isAmountDirty,
    trimmedAmount,
    isMaturityDirty,
    trimmedMaturityDays,
    isCutoffDirty,
    trimmedCutoffDays,
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
    amountValidationError,
    maturityValidationError,
    cutoffValidationError,
    multiplierValidationError,
  };
}
