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
}

const ACTIVATION_WAIT_SEC = 86400; // 1 day (24 hours)
const CLAIM_WAIT_SEC = 7 * 86400; // 1 week (7 days)
const MAX_CLAIM_PERIOD_SEC = 2 * 365 * 86400; // 2 years

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

  const { isEligible, nextClaimSeconds, validationError } = useMemo(() => {
    if (!wallet || !walletAddress) {
      return {
        isEligible: false,
        nextClaimSeconds: 0,
        validationError: 'Connect wallet first',
      };
    }
    if (!accountData) {
      return {
        isEligible: true,
        nextClaimSeconds: 0,
        validationError: null,
      };
    }
    if (!accountData.active) {
      return {
        isEligible: false,
        nextClaimSeconds: 0,
        validationError:
          'Account is not activated yet (must receive an invite)',
      };
    }
    if (accountData.status !== 0) {
      return {
        isEligible: false,
        nextClaimSeconds: 0,
        validationError: 'Account is suspended or under review',
      };
    }

    const now = Math.floor(Date.now() / 1000);

    // Initial 1-day activation wait
    if (accountData.accountInit > 0) {
      const firstClaimTime = accountData.accountInit + ACTIVATION_WAIT_SEC;
      if (now < firstClaimTime) {
        const remaining = firstClaimTime - now;
        return {
          isEligible: false,
          nextClaimSeconds: remaining,
          validationError: `Initial claim unlocks in ${Math.ceil(remaining / 3600)} hours`,
        };
      }

      // Max 2 years claim period
      if (now >= accountData.accountInit + MAX_CLAIM_PERIOD_SEC) {
        return {
          isEligible: false,
          nextClaimSeconds: 0,
          validationError:
            '2-year weekly claim allocation window has concluded',
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
        };
      }
    }

    return {
      isEligible: true,
      nextClaimSeconds: 0,
      validationError: null,
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
    claimAmountFi: '11,111',
  };
}
