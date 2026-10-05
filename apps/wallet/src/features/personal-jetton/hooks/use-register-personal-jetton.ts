/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useCallback } from 'react';
import { Address } from '@ton/core';
import type { ITonWalletKit, Wallet } from '@ton/walletkit';
import { toast } from 'sonner';
import {
  buildSetPersonalJettonBody,
  getExpectedPersonalWalletAddress,
} from '@/lib/brotherhood/deploy';
import { getFiWalletAddress } from '@/lib/brotherhood/ton';
import type { Network } from '@/lib/brotherhood/config';
import { useBrotherhoodTransaction, GAS } from '@/features/brotherhood';

export interface UseRegisterPersonalJettonParams {
  wallet: Wallet | null | undefined;
  walletKit: ITonWalletKit | null;
  walletAddress: string | null;
  personalMinterAddress: string;
  personalWalletAddress?: string;
  network: Network;
  onSuccess?: () => void;
}

export interface UseRegisterPersonalJettonResult {
  register: () => Promise<void>;
  isDisabled: boolean;
  isSending: boolean;
  error: string | null;
}

export function useRegisterPersonalJetton({
  wallet,
  walletKit,
  walletAddress,
  personalMinterAddress,
  personalWalletAddress,
  network,
  onSuccess,
}: UseRegisterPersonalJettonParams): UseRegisterPersonalJettonResult {
  const {
    send: sendTx,
    isSending,
    error,
  } = useBrotherhoodTransaction(wallet, walletKit);

  const register = useCallback(async () => {
    if (!walletAddress) throw new Error('No wallet connected');
    if (!personalMinterAddress)
      throw new Error('No Personal Minter address provided');

    const ownerAddr = Address.parse(walletAddress);
    const minterAddr = Address.parse(personalMinterAddress);
    const fiWalletAddr = await getFiWalletAddress(ownerAddr, network);

    const walletAddr = personalWalletAddress
      ? Address.parse(personalWalletAddress)
      : getExpectedPersonalWalletAddress({
          personalMinter: minterAddr,
          owner: ownerAddr,
        });

    const setBody = buildSetPersonalJettonBody({
      personalMinter: minterAddr,
      personalWallet: walletAddr,
    });

    await sendTx(
      [
        {
          toAddress: fiWalletAddr.toString(),
          amount: GAS.SET_PERSONAL,
          payload: setBody,
        },
      ],
      { affectedContracts: [fiWalletAddr, minterAddr, walletAddr] },
    );

    toast.success('Personal Jetton registered successfully!');
    onSuccess?.();
  }, [
    walletAddress,
    personalMinterAddress,
    personalWalletAddress,
    network,
    sendTx,
    onSuccess,
  ]);

  const isValid =
    Boolean(wallet) &&
    Boolean(walletAddress) &&
    Boolean(personalMinterAddress) &&
    !isSending;

  return {
    register,
    isDisabled: !isValid,
    isSending,
    error,
  };
}
