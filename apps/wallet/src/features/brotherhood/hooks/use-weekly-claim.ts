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
import { ActClaimWeeklyGrant } from '@wrappers/FossFiWallet.gen';
import { getFiWalletAddress } from '@/lib/brotherhood/ton';
import type { Network } from '@/lib/brotherhood/config';
import { useBrotherhoodTransaction, GAS } from './use-brotherhood-transaction';
import type { FiAccountData } from './use-fi-account';

export interface UseWeeklyClaimParams {
  wallet: Wallet | null | undefined;
  walletKit: ITonWalletKit | null;
  walletAddress: string | null;
  network: Network;
  accountData?: FiAccountData | null;
}

export interface UseWeeklyClaimResult {
  send: () => Promise<void>;
  isDisabled: boolean;
  isSending: boolean;
  error: string | null;
  validationError: string | null;
  isEligible: boolean;
  nextClaimSeconds: number;
  claimAmountFi: string;
  baseGrantFi: string;
  reputationGrantFi: string;
  isPostTwoYears: boolean;
  debtOffsetFi?: string;
  netCreditedFi?: string;
}

const ACTIVATION_WAIT_SEC = 86400; // 1 day (24 hours)
const CLAIM_WAIT_SEC = 7 * 86400; // 1 week (7 days)
const MAX_CLAIM_PERIOD_SEC = 2 * 365 * 86400; // 2 years
const VOTE_GRANT_RATE = 10n; // 10 FI per received vote

export function useWeeklyClaim({
  wallet,
  walletKit,
  walletAddress,
  network,
  accountData,
}: UseWeeklyClaimParams): UseWeeklyClaimResult {
  const {
    send: sendTx,
    isSending,
    error,
  } = useBrotherhoodTransaction(wallet, walletKit);

  const {
    isEligible,
    nextClaimSeconds,
    validationError,
    isPostTwoYears,
    claimAmounts,
  } = useMemo(() => {
    if (!wallet || !walletAddress) {
      return {
        isEligible: false,
        nextClaimSeconds: 0,
        validationError: 'Connect wallet first',
        isPostTwoYears: false,
        claimAmounts: {
          total: 11111n,
          base: 11111n,
          reputation: 0n,
          debtOffset: 0n,
          net: 11111n,
        },
      };
    }
    if (!accountData) {
      return {
        isEligible: true,
        nextClaimSeconds: 0,
        validationError: null,
        isPostTwoYears: false,
        claimAmounts: {
          total: 11111n,
          base: 11111n,
          reputation: 0n,
          debtOffset: 0n,
          net: 11111n,
        },
      };
    }
    if (!accountData.active) {
      return {
        isEligible: false,
        nextClaimSeconds: 0,
        validationError:
          'Account is not activated yet (must receive an invite)',
        isPostTwoYears: false,
        claimAmounts: {
          total: 11111n,
          base: 11111n,
          reputation: 0n,
          debtOffset: 0n,
          net: 11111n,
        },
      };
    }
    if (accountData.status !== 0) {
      return {
        isEligible: false,
        nextClaimSeconds: 0,
        validationError: 'Account is suspended or under review',
        isPostTwoYears: false,
        claimAmounts: {
          total: 11111n,
          base: 11111n,
          reputation: 0n,
          debtOffset: 0n,
          net: 11111n,
        },
      };
    }

    const now = Math.floor(Date.now() / 1000);
    const postTwoYears =
      accountData.accountInit > 0 &&
      now >= accountData.accountInit + MAX_CLAIM_PERIOD_SEC;
    const base = postTwoYears ? 500n : 11111n;
    const votes = BigInt(accountData.receivedVotes ?? 0n);
    const reputation = votes * VOTE_GRANT_RATE;
    const total = base + reputation;

    const currentDebt =
      typeof accountData.debt === 'bigint'
        ? accountData.debt / 1000000000n
        : 0n;
    const debtOffset =
      currentDebt > 0n ? (total < currentDebt ? total : currentDebt) : 0n;
    const net = total - debtOffset;

    // Initial 1-day activation wait
    if (accountData.accountInit > 0) {
      const firstClaimTime = accountData.accountInit + ACTIVATION_WAIT_SEC;
      if (now < firstClaimTime) {
        const remaining = firstClaimTime - now;
        return {
          isEligible: false,
          nextClaimSeconds: remaining,
          validationError: `Initial claim unlocks in ${Math.ceil(remaining / 3600)} hours`,
          isPostTwoYears: postTwoYears,
          claimAmounts: { total, base, reputation, debtOffset, net },
        };
      }
    }

    // Cooldown from last claim
    if (accountData.lastClaim > 0) {
      const nextClaimTime = accountData.lastClaim + CLAIM_WAIT_SEC;
      if (now < nextClaimTime) {
        const remaining = nextClaimTime - now;
        const days = Math.floor(remaining / 86400);
        const hours = Math.floor((remaining % 86400) / 3600);
        return {
          isEligible: false,
          nextClaimSeconds: remaining,
          validationError: `Next claim available in ${days}d ${hours}h`,
          isPostTwoYears: postTwoYears,
          claimAmounts: { total, base, reputation, debtOffset, net },
        };
      }
    }

    return {
      isEligible: true,
      nextClaimSeconds: 0,
      validationError: null,
      isPostTwoYears: postTwoYears,
      claimAmounts: { total, base, reputation, debtOffset, net },
    };
  }, [wallet, walletAddress, accountData]);

  const send = useCallback(async () => {
    if (!walletAddress) throw new Error('No wallet address');
    const ownerAddr = Address.parse(walletAddress);
    const fiWalletAddr = await getFiWalletAddress(ownerAddr, network);

    const payload = ActClaimWeeklyGrant.toCell(
      ActClaimWeeklyGrant.create({ queryId: 0n, sendExcessesTo: ownerAddr }),
    );

    await sendTx([
      { toAddress: fiWalletAddr.toString(), amount: GAS.CLAIM, payload },
    ]);
  }, [walletAddress, network, sendTx]);

  const isDisabled = Boolean(validationError) || isSending;

  return {
    send,
    isDisabled,
    isSending,
    error,
    validationError,
    isEligible,
    nextClaimSeconds,
    claimAmountFi: claimAmounts.total.toLocaleString(),
    baseGrantFi: claimAmounts.base.toLocaleString(),
    reputationGrantFi: claimAmounts.reputation.toLocaleString(),
    isPostTwoYears,
    debtOffsetFi:
      claimAmounts.debtOffset > 0n
        ? claimAmounts.debtOffset.toLocaleString()
        : undefined,
    netCreditedFi: claimAmounts.net.toLocaleString(),
  };
}
