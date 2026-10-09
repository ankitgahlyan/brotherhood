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
import { SetLoanRequirement as FiSetLoanRequirement } from '@wrappers/FossFiWallet.gen';
import { SetLoanRequirement as PersonalSetLoanRequirement } from '@wrappers/PersonalWallet.gen';
import { parseUnits } from '@/lib/brotherhood/deploy';
import { encodeOnchainMultiplier } from '@/lib/brotherhood/config';
import { useBrotherhoodTransaction } from '@/features/brotherhood/hooks/use-brotherhood-transaction';
import { useNowSeconds } from '@/core/hooks';
import type { BorrowToken } from '../types';

export interface UseBorrowTermsParams {
  wallet: Wallet | null | undefined;
  walletKit: ITonWalletKit | null;
  walletAddress: string | null;
  token: BorrowToken;
  amount: string;
  maturityDays: string;
  cutoffDays?: string;
  multiplier: string;
  onSuccess?: () => void;
}

export interface UseBorrowTermsResult {
  updateBorrowTerms: () => Promise<void>;
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

export function useBorrowTerms({
  wallet,
  walletKit,
  walletAddress,
  token,
  amount,
  maturityDays,
  cutoffDays = '',
  multiplier,
  onSuccess,
}: UseBorrowTermsParams): UseBorrowTermsResult {
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

  // On-chain active values for comparison
  const onchainNeed = useMemo<bigint | null>(() => {
    if (token.kind === 'fi') return token.fiCreditNeed ?? null;
    return token.creditInfo?.creditNeed ?? null;
  }, [token]);

  const onchainMaturitySec = useMemo<number>(() => {
    if (token.kind === 'fi') return token.fiCreditMaturity ?? 0;
    return Number(token.creditInfo?.creditMaturity ?? 0);
  }, [token]);

  const onchainCutoffSec = useMemo<number>(() => {
    if (token.kind === 'fi') return token.fiCreditCutoff ?? 0;
    return Number(token.creditInfo?.creditCutoff ?? 0);
  }, [token]);

  const onchainMultiplier = useMemo<number>(() => {
    if (token.kind === 'fi') return token.fiMultiplier ?? 1.0;
    if (token.creditInfo && token.creditInfo.multiplier > 0) {
      return Number(token.creditInfo.multiplier) / 1000;
    }
    return 1.0;
  }, [token]);

  // Dirty checks
  const isAmountDirty = useMemo(() => {
    if (onchainNeed === null) return trimmedAmount !== '';
    const currentNeedFormatted = (Number(onchainNeed) / 1e9).toString();
    return trimmedAmount !== '' && trimmedAmount !== currentNeedFormatted;
  }, [onchainNeed, trimmedAmount]);

  const isMaturityDirty = useMemo(() => {
    if (onchainMaturitySec === 0) {
      return trimmedMaturityDays !== '' && trimmedMaturityDays !== '0';
    }
    const currentDays = Math.max(
      0,
      Math.round((onchainMaturitySec - nowSec) / 86400),
    ).toString();
    return trimmedMaturityDays !== '' && trimmedMaturityDays !== currentDays;
  }, [onchainMaturitySec, trimmedMaturityDays, nowSec]);

  const isCutoffDirty = useMemo(() => {
    if (onchainCutoffSec === 0) {
      return trimmedCutoffDays !== '' && trimmedCutoffDays !== '0';
    }
    const currentDays = Math.max(
      0,
      Math.round((onchainCutoffSec - nowSec) / 86400),
    ).toString();
    return trimmedCutoffDays !== '' && trimmedCutoffDays !== currentDays;
  }, [onchainCutoffSec, trimmedCutoffDays, nowSec]);

  const isMultiplierDirty = useMemo(() => {
    if (!trimmedMultiplier) return false;
    const parsed = parseFloat(trimmedMultiplier);
    if (isNaN(parsed)) return false;
    return parsed.toFixed(3) !== onchainMultiplier.toFixed(3);
  }, [onchainMultiplier, trimmedMultiplier]);

  const isDirty =
    isAmountDirty || isMaturityDirty || isCutoffDirty || isMultiplierDirty;

  // Validation
  const amountValidationError = useMemo<string | null>(() => {
    if (!trimmedAmount) return null;
    const parsed = parseFloat(trimmedAmount);
    if (isNaN(parsed) || parsed < 0) {
      return 'Amount must be a non-negative number';
    }
    return null;
  }, [trimmedAmount]);

  const multiplierValidationError = useMemo<string | null>(() => {
    if (!trimmedMultiplier) return null;
    const parsed = parseFloat(trimmedMultiplier);
    if (isNaN(parsed) || parsed < 0.001) {
      return 'Multiplier must be at least 0.001x';
    }
    return null;
  }, [trimmedMultiplier]);

  const maturityValidationError = useMemo<string | null>(() => {
    if (!trimmedMaturityDays) return null;
    const parsed = parseInt(trimmedMaturityDays, 10);
    if (isNaN(parsed) || parsed < 0) {
      return 'Maturity must be 0 (instant) or a positive number of days';
    }
    const multParsed = parseFloat(trimmedMultiplier);
    const effectiveMult = !isNaN(multParsed) ? multParsed : onchainMultiplier;
    if (effectiveMult > 1.0 && parsed === 0) {
      return 'Bonus multipliers (> 1.000x) require a future maturity date (> 0 days)';
    }
    return null;
  }, [onchainMultiplier, trimmedMaturityDays, trimmedMultiplier]);

  const cutoffValidationError = useMemo<string | null>(() => {
    if (!trimmedCutoffDays) return null;
    const cutoffParsed = parseInt(trimmedCutoffDays, 10);
    if (isNaN(cutoffParsed) || cutoffParsed < 0) {
      return 'Funding deadline must be a non-negative number of days';
    }
    const maturityParsed = trimmedMaturityDays
      ? parseInt(trimmedMaturityDays, 10)
      : onchainMaturitySec > 0
        ? Math.max(0, Math.round((onchainMaturitySec - nowSec) / 86400))
        : null;
    if (
      maturityParsed !== null &&
      maturityParsed > 0 &&
      cutoffParsed > maturityParsed
    ) {
      return 'Funding deadline cannot exceed loan maturity date';
    }
    return null;
  }, [nowSec, onchainMaturitySec, trimmedCutoffDays, trimmedMaturityDays]);

  const hasValidationError =
    Boolean(amountValidationError) ||
    Boolean(maturityValidationError) ||
    Boolean(cutoffValidationError) ||
    Boolean(multiplierValidationError);

  const isDisabled =
    !token.userWalletAddress ||
    !token.isDeployed ||
    !isDirty ||
    hasValidationError ||
    isSending;

  const updateBorrowTerms = useCallback(async () => {
    if (!walletAddress || !token.userWalletAddress) {
      throw new Error('Wallet not available');
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

    // Build payload according to token kind
    const bodyCell =
      token.kind === 'fi'
        ? FiSetLoanRequirement.toCell(
            FiSetLoanRequirement.create({
              queryId: 0n,
              amount: amountNano,
              maturityDate: maturitySec,
              cutoffDate: cutoffSec,
              multiplier: multBigInt,
            }),
          )
        : PersonalSetLoanRequirement.toCell(
            PersonalSetLoanRequirement.create({
              queryId: 0n,
              amount: amountNano,
              maturityDate: maturitySec,
              cutoffDate: cutoffSec,
              multiplier: multBigInt,
            }),
          );

    const affectedContracts = [token.userWalletAddress];
    if (token.kind !== 'fi' && token.minterAddress) {
      affectedContracts.push(token.minterAddress);
    }

    await sendTx(
      [
        {
          toAddress: token.userWalletAddress,
          amount: SET_TERMS_GAS,
          payload: bodyCell,
        },
      ],
      { affectedContracts },
    );

    toast.success(`${token.symbol} borrowing terms updated successfully!`);
    onSuccess?.();
  }, [
    walletAddress,
    token,
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
    updateBorrowTerms,
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
