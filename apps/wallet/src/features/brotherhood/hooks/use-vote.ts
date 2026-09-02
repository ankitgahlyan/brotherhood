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
import { buildVoteBody, buildUnvoteBody } from '@/lib/brotherhood/deploy';
import { getFiWalletAddress } from '@/lib/brotherhood/ton';
import type { Network } from '@/lib/brotherhood/config';
import { useBrotherhoodTransaction, GAS } from './use-brotherhood-transaction';
import type { FiAccountData } from './use-fi-account';
import { getAccountActionError } from './use-is-network-member';

export interface UseVoteParams {
  wallet: Wallet | null | undefined;
  walletKit: ITonWalletKit | null;
  walletAddress: string | null;
  targetAddress: string;
  count?: number;
  isUnvote?: boolean;
  network: Network;
  accountData?: FiAccountData | null;
  maxUnvoteCount?: number;
}

export interface UseVoteResult {
  send: () => Promise<void>;
  isDisabled: boolean;
  isSending: boolean;
  error: string | null;
  validationError: string | null;
}

export function useVote({
  wallet,
  walletKit,
  walletAddress,
  targetAddress,
  count = 1,
  isUnvote = false,
  network,
  accountData,
  maxUnvoteCount,
}: UseVoteParams): UseVoteResult {
  const {
    send: sendTx,
    isSending,
    error,
  } = useBrotherhoodTransaction(wallet, walletKit);

  const validationError = useMemo<string | null>(() => {
    if (!wallet || !walletAddress) return 'Connect wallet first';
    const actionErr = getAccountActionError(accountData);
    if (actionErr) return actionErr;

    if (!Number.isInteger(count) || count < 1 || count > 10) {
      return 'Votes must be a whole number between 1 and 10';
    }

    if (accountData) {
      if (!isUnvote) {
        if (accountData.votes <= 0) {
          return 'No votes available (all 10 votes are currently cast)';
        }
        if (count > accountData.votes) {
          return `Not enough votes available (only ${accountData.votes} remaining)`;
        }
      } else if (maxUnvoteCount !== undefined && count > maxUnvoteCount) {
        return `Cannot unvote more than ${maxUnvoteCount} ${maxUnvoteCount === 1 ? 'vote' : 'votes'} cast for this member`;
      }
    }
    if (!targetAddress.trim()) return 'Enter target member address';
    try {
      const parsed = Address.parse(targetAddress.trim());
      if (walletAddress) {
        const selfAddr = Address.parse(walletAddress);
        if (parsed.equals(selfAddr)) return 'Cannot vote for yourself';
      }
    } catch {
      return 'Invalid target address';
    }
    return null;
  }, [wallet, walletAddress, accountData, isUnvote, targetAddress, count, maxUnvoteCount]);

  const send = useCallback(async () => {
    if (!walletAddress) throw new Error('No wallet address');
    const ownerAddr = Address.parse(walletAddress);
    const fiWalletAddr = await getFiWalletAddress(ownerAddr, network);
    const target = Address.parse(targetAddress.trim());

    const payload = isUnvote
      ? buildUnvoteBody({ transferRecipient: target, count })
      : buildVoteBody({ transferRecipient: target, count });

    await sendTx([
      { toAddress: fiWalletAddr.toString(), amount: GAS.VOTE, payload },
    ]);
  }, [walletAddress, targetAddress, isUnvote, count, network, sendTx]);

  const isDisabled = Boolean(validationError) || isSending;

  return { send, isDisabled, isSending, error, validationError };
}
