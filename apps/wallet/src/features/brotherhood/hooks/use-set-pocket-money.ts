/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useCallback, useMemo, useState } from 'react';
import { Address } from '@ton/core';
import type { ITonWalletKit, Wallet } from '@ton/walletkit';
import {
  buildSetPocketMoneyBody,
  parseUnits,
  type PocketMoney,
} from '@/lib/brotherhood/deploy';
import { getFiWalletAddress } from '@/lib/brotherhood/ton';
import type { Network } from '@/lib/brotherhood/config';
import { useBrotherhoodTransaction, GAS } from './use-brotherhood-transaction';
import type { FiAccountData } from './use-fi-account';
import { getAccountActionError } from './use-is-network-member';

export const ONE_MINUTE_SEC = 60;
export const ONE_HOUR_SEC = 3600;
export const ONE_DAY_SEC = 86400;
export const ONE_WEEK_SEC = 604800;
export const ONE_MONTH_SEC = 2592000;
export const ONE_YEAR_SEC = 31536000;

export type PocketMoneyGrantMode =
  'openRecurring' | 'oneTime' | 'fixedRecurring' | 'unrestricted' | 'multi';

export interface OneTimeSlotInput {
  enabled?: boolean;
  amount: string;
  startTimeSec?: number;
  validUntilSec?: number;
}

export interface FixedRecurringSlotInput {
  enabled?: boolean;
  limit: string;
  periodSec: number;
  startTimeSec?: number;
  validUntilSec: number;
}

export interface OpenRecurringSlotInput {
  enabled?: boolean;
  limit: string;
  periodSec?: number;
  startTimeSec?: number;
}

export interface UseSetPocketMoneyParams {
  wallet: Wallet | null | undefined;
  walletKit: ITonWalletKit | null;
  walletAddress: string | null;
  grantee: string;
  amount?: string;
  mode?: PocketMoneyGrantMode;
  unrestricted?: boolean | null;
  oneTimeInput?: OneTimeSlotInput | null;
  fixedRecurringInput?: FixedRecurringSlotInput | null;
  openRecurringInput?: OpenRecurringSlotInput | null;
  existingPocketMoney?: PocketMoney | null;
  network: Network;
  accountData?: FiAccountData | null;
  onSuccess?: () => void;
}

export type UseSetAllowanceParams = UseSetPocketMoneyParams;

export interface UseSetPocketMoneyResult {
  send: () => Promise<void>;
  isDisabled: boolean;
  isSending: boolean;
  error: string | null;
  validationError: string | null;
}

export type UseSetAllowanceResult = UseSetPocketMoneyResult;

export function formatPocketMoneyPeriod(periodSec: bigint | number): string {
  const sec = Number(periodSec);
  if (!sec || sec <= 0) return 'Non-recurring pool';
  if (sec === ONE_DAY_SEC) return 'Daily (24h)';
  if (sec === ONE_WEEK_SEC) return 'Weekly (7d)';
  if (sec === ONE_MONTH_SEC) return 'Monthly (30d)';
  if (sec === ONE_YEAR_SEC) return 'Yearly (365d)';
  if (sec % ONE_DAY_SEC === 0) return `Every ${sec / ONE_DAY_SEC}d`;
  if (sec % ONE_HOUR_SEC === 0) return `Every ${sec / ONE_HOUR_SEC}h`;
  return `Every ${sec}s`;
}

export function formatPocketMoneyTimestamp(tsSec: bigint | number): string {
  const sec = Number(tsSec);
  if (!sec || sec <= 0) return 'Immediate / Never';
  return new Date(sec * 1000).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatFiCoins(nano: bigint | undefined | null): string {
  if (!nano || nano <= 0n) return '0';
  const whole = nano / 1_000_000_000n;
  const frac = nano % 1_000_000_000n;
  if (frac === 0n) return whole.toString();
  const fracStr = frac.toString().padStart(9, '0').replace(/0+$/, '');
  return `${whole}.${fracStr}`;
}

export function useSetPocketMoney({
  wallet,
  walletKit,
  walletAddress,
  grantee,
  amount = '',
  mode = 'openRecurring',
  unrestricted = null,
  oneTimeInput = null,
  fixedRecurringInput = null,
  openRecurringInput = null,
  existingPocketMoney = null,
  network,
  accountData,
  onSuccess,
}: UseSetPocketMoneyParams): UseSetPocketMoneyResult {
  const {
    send: sendTx,
    isSending,
    error,
  } = useBrotherhoodTransaction(wallet, walletKit);

  const [nowSec] = useState(() => BigInt(Math.floor(Date.now() / 1000)));

  const resolvedSlots = useMemo(() => {
    let effUnrestricted: boolean | null = null;
    let effOneTime: {
      remaining: bigint;
      startTime: bigint;
      validUntil: bigint;
    } | null = null;
    let effFixed: {
      limit: bigint;
      period: bigint;
      startTime: bigint;
      validUntil: bigint;
    } | null = null;
    let effOpen: {
      limit: bigint;
      period: bigint;
      startTime: bigint;
    } | null = null;
    let slotErr: string | null = null;

    const parseAmountOrErr = (raw: string, label: string): bigint | null => {
      if (!raw.trim() || Number.isNaN(Number(raw)) || Number(raw) < 0) {
        slotErr = `Enter valid ${label} amount`;
        return null;
      }
      try {
        return parseUnits(raw.trim(), 9);
      } catch {
        slotErr = `Invalid ${label} amount format`;
        return null;
      }
    };

    const buildOneTime = (inp: OneTimeSlotInput) => {
      const rem = parseAmountOrErr(inp.amount, 'one-time');
      if (rem === null) return;
      if (rem <= 0n) {
        slotErr =
          'One-time limit is irrevocable while active; enter an amount > 0 FI';
        return;
      }
      const start = BigInt(Math.max(0, Math.floor(inp.startTimeSec ?? 0)));
      const until = BigInt(Math.max(0, Math.floor(inp.validUntilSec ?? 0)));
      const effStart = start === 0n ? nowSec : start;
      if (until > 0n && (until <= nowSec || until <= effStart)) {
        slotErr = 'One-time expiry must be in the future and after start time';
        return;
      }
      const prev = existingPocketMoney?.oneTime;
      if (
        prev &&
        prev.remaining > 0n &&
        (prev.validUntil === 0n || nowSec < prev.validUntil)
      ) {
        if (rem < prev.remaining) {
          slotErr = `Active one-time cheque can only be upgraded upward (current remaining: ${formatFiCoins(prev.remaining)} FI)`;
          return;
        }
        if (start > 0n && start > prev.startTime) {
          slotErr =
            'Upgrading an active one-time cheque cannot push start time later';
          return;
        }
        if (until > 0n && (prev.validUntil === 0n || until < prev.validUntil)) {
          slotErr =
            'Upgrading an active one-time cheque cannot shorten its validity';
          return;
        }
      }
      effOneTime = {
        remaining: rem,
        startTime: start,
        validUntil: until,
      };
    };

    const buildFixed = (inp: FixedRecurringSlotInput) => {
      const lim = parseAmountOrErr(inp.limit, 'fixed recurring');
      if (lim === null) return;
      if (lim <= 0n) {
        slotErr =
          'Fixed-term recurring limit is irrevocable until expiry; enter a limit > 0 FI';
        return;
      }
      const period = BigInt(Math.max(0, Math.floor(inp.periodSec ?? 0)));
      if (period <= 0n) {
        slotErr = 'Select a valid reset period for fixed recurring limit';
        return;
      }
      const start = BigInt(Math.max(0, Math.floor(inp.startTimeSec ?? 0)));
      const until = BigInt(Math.max(0, Math.floor(inp.validUntilSec ?? 0)));
      const effStart = start === 0n ? nowSec : start;
      if (until <= nowSec || until <= effStart) {
        slotErr =
          'Fixed recurring limit requires a Valid Until date in the future (after start time)';
        return;
      }
      const prev = existingPocketMoney?.fixedRecurring;
      if (prev && prev.limit > 0n && nowSec < prev.validUntil) {
        if (lim < prev.limit) {
          slotErr = `Active fixed recurring limit can only be upgraded upward (current: ${formatFiCoins(prev.limit)} FI)`;
          return;
        }
        if (period > prev.period) {
          slotErr =
            'Upgrading an active fixed recurring limit cannot lengthen the reset period';
          return;
        }
        if (until < prev.validUntil) {
          slotErr =
            'Upgrading an active fixed recurring limit cannot shorten Valid Until';
          return;
        }
        if (start > 0n && start > prev.startTime) {
          slotErr =
            'Upgrading an active fixed recurring limit cannot push start time later';
          return;
        }
      }
      effFixed = {
        limit: lim,
        period,
        startTime: start,
        validUntil: until,
      };
    };

    const buildOpen = (inp: OpenRecurringSlotInput) => {
      const lim = parseAmountOrErr(inp.limit, 'open limit');
      if (lim === null) return;
      const period = BigInt(Math.max(0, Math.floor(inp.periodSec ?? 0)));
      const start = BigInt(Math.max(0, Math.floor(inp.startTimeSec ?? 0)));
      effOpen = {
        limit: lim,
        period,
        startTime: start,
      };
    };

    if (mode === 'unrestricted') {
      if (unrestricted === null || unrestricted === undefined) {
        slotErr = 'Select whether to grant or revoke unrestricted access';
      } else {
        effUnrestricted = unrestricted;
      }
    } else if (mode === 'oneTime') {
      buildOneTime(
        oneTimeInput ?? {
          amount,
          startTimeSec: 0,
          validUntilSec: 0,
        },
      );
    } else if (mode === 'fixedRecurring') {
      if (!fixedRecurringInput) {
        slotErr = 'Configure fixed recurring parameters';
      } else {
        buildFixed(fixedRecurringInput);
      }
    } else if (mode === 'openRecurring') {
      buildOpen(
        openRecurringInput ?? {
          limit: amount,
          periodSec: 0,
          startTimeSec: 0,
        },
      );
    } else if (mode === 'multi') {
      if (unrestricted !== null && unrestricted !== undefined) {
        effUnrestricted = unrestricted;
      }
      if (oneTimeInput?.enabled) {
        buildOneTime(oneTimeInput);
      }
      if (!slotErr && fixedRecurringInput?.enabled) {
        buildFixed(fixedRecurringInput);
      }
      if (!slotErr && openRecurringInput?.enabled) {
        buildOpen(openRecurringInput);
      }
      if (
        !slotErr &&
        effUnrestricted === null &&
        !effOneTime &&
        !effFixed &&
        !effOpen
      ) {
        slotErr = 'Enable at least one Pocket Money slot to configure';
      }
    }

    return {
      effUnrestricted,
      effOneTime,
      effFixed,
      effOpen,
      slotErr,
    };
  }, [
    nowSec,
    mode,
    amount,
    unrestricted,
    oneTimeInput,
    fixedRecurringInput,
    openRecurringInput,
    existingPocketMoney,
  ]);

  const validationError = useMemo<string | null>(() => {
    if (!wallet || !walletAddress) return 'Connect wallet first';
    const actionErr = getAccountActionError(accountData);
    if (actionErr) return actionErr;
    if (!grantee.trim())
      return 'Enter grantee address, @username, or .bro domain';
    try {
      const parsed = Address.parse(grantee.trim());
      if (walletAddress) {
        const self = Address.parse(walletAddress);
        if (parsed.equals(self)) return 'Cannot grant pocket money to yourself';
      }
    } catch {
      return 'Invalid or unresolved grantee address';
    }

    if (resolvedSlots.slotErr) return resolvedSlots.slotErr;

    return null;
  }, [wallet, walletAddress, accountData, grantee, resolvedSlots.slotErr]);

  const send = useCallback(async () => {
    if (!walletAddress) throw new Error('No wallet address');
    const ownerAddr = Address.parse(walletAddress);
    const fiWalletAddr = await getFiWalletAddress(ownerAddr, network);
    const granteeAddr = Address.parse(grantee.trim());

    const granteeFiWalletAddr = getFiWalletAddress(granteeAddr, network);

    const payload = buildSetPocketMoneyBody({
      grantee: granteeAddr,
      unrestricted: resolvedSlots.effUnrestricted,
      oneTime: resolvedSlots.effOneTime,
      fixedRecurring: resolvedSlots.effFixed,
      openRecurring: resolvedSlots.effOpen,
    });

    await sendTx(
      [{ toAddress: fiWalletAddr.toString(), amount: GAS.ALLOWANCE, payload }],
      { affectedContracts: [fiWalletAddr, granteeFiWalletAddr] },
    );
    onSuccess?.();
  }, [walletAddress, grantee, network, resolvedSlots, sendTx, onSuccess]);

  const isDisabled = Boolean(validationError) || isSending;

  return { send, isDisabled, isSending, error, validationError };
}

export const useSetAllowance = useSetPocketMoney;
