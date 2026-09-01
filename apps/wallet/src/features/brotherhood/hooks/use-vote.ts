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
  isUnvote?: boolean;
  network: Network;
  accountData?: FiAccountData | null;
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
  isUnvote = false,
  network,
  accountData,
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
    if (accountData) {
      if (!isUnvote && accountData.votes <= 0) {
        return 'No votes available (all 10 votes are currently cast)';
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
  }, [wallet, walletAddress, accountData, isUnvote, targetAddress]);

  const send = useCallback(async () => {
    if (!walletAddress) throw new Error('No wallet address');
    const ownerAddr = Address.parse(walletAddress);
    const fiWalletAddr = await getFiWalletAddress(ownerAddr, network);
    const target = Address.parse(targetAddress.trim());

    const payload = isUnvote
      ? buildUnvoteBody({ transferRecipient: target })
      : buildVoteBody({ transferRecipient: target });

    await sendTx([
      { toAddress: fiWalletAddr.toString(), amount: GAS.VOTE, payload },
    ]);
  }, [walletAddress, targetAddress, isUnvote, network, sendTx]);

  const isDisabled = Boolean(validationError) || isSending;

  return { send, isDisabled, isSending, error, validationError };
}
