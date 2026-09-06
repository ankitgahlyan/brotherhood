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
import { ChangeProfile } from '@wrappers/FossFiWallet.gen';
import { getFiWalletAddress } from '@/lib/brotherhood/ton';
import type { Network } from '@/lib/brotherhood/config';
import { useBrotherhoodTransaction, GAS } from './use-brotherhood-transaction';
import type { FiAccountData } from './use-fi-account';
import { getAccountActionError } from './use-is-network-member';

export interface UseNomineeParams {
  wallet: Wallet | null | undefined;
  walletKit: ITonWalletKit | null;
  walletAddress: string | null;
  nomineeAddress: string;
  network: Network;
  accountData?: FiAccountData | null;
}

export interface UseNomineeResult {
  updateNominee: () => Promise<void>;
  isDisabled: boolean;
  isSending: boolean;
  error: string | null;
  validationError: string | null;
}

export function useNominee({
  wallet,
  walletKit,
  walletAddress,
  nomineeAddress,
  network,
  accountData,
}: UseNomineeParams): UseNomineeResult {
  const {
    send: sendTx,
    isSending,
    error,
  } = useBrotherhoodTransaction(wallet, walletKit);

  const validationError = useMemo<string | null>(() => {
    if (!wallet || !walletAddress) return 'Connect wallet first';
    const actionErr = getAccountActionError(accountData);
    if (actionErr) return actionErr;

    const trimmed = nomineeAddress.trim();
    if (!trimmed) return 'Enter a nominee address';

    try {
      Address.parse(trimmed);
    } catch {
      return 'Invalid TON address format';
    }

    return null;
  }, [wallet, walletAddress, accountData, nomineeAddress]);

  const updateNominee = useCallback(async () => {
    if (!walletAddress) throw new Error('No wallet address');
    if (validationError) throw new Error(validationError);

    const ownerAddr = Address.parse(walletAddress);
    const fiWalletAddr = await getFiWalletAddress(ownerAddr, network);
    const parsedNominee = Address.parse(nomineeAddress.trim());

    const payload = ChangeProfile.toCell(
      ChangeProfile.create({
        queryId: 0n,
        nominee: parsedNominee,
      }),
    );

    await sendTx([
      { toAddress: fiWalletAddr.toString(), amount: GAS.PROFILE, payload },
    ]);
  }, [walletAddress, nomineeAddress, network, sendTx, validationError]);

  return {
    updateNominee,
    isDisabled: Boolean(validationError) || isSending,
    isSending,
    error,
    validationError,
  };
}
