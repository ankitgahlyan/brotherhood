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
import {
  ChangeUsername,
  ChangeLocation,
  ChangeCountry,
} from '@wrappers/FossFiWallet.gen';
import { getFiWalletAddress } from '@/lib/brotherhood/ton';
import type { Network } from '@/lib/brotherhood/config';
import { useBrotherhoodTransaction, GAS } from './use-brotherhood-transaction';

export interface UseProfileParams {
  wallet: Wallet | null | undefined;
  walletKit: ITonWalletKit | null;
  walletAddress: string | null;
  username: string;
  h3Cell: string;
  country: number;
  network: Network;
}

export interface UseProfileResult {
  updateUsername: () => Promise<void>;
  updateLocation: () => Promise<void>;
  updateCountry: () => Promise<void>;
  isDisabled: boolean;
  isSending: boolean;
  error: string | null;
}

export function useProfile({
  wallet,
  walletKit,
  walletAddress,
  username,
  h3Cell,
  country,
  network,
}: UseProfileParams): UseProfileResult {
  const {
    send: sendTx,
    isSending,
    error,
  } = useBrotherhoodTransaction(wallet, walletKit);

  const updateUsername = useCallback(async () => {
    if (!walletAddress) throw new Error('No wallet address');
    const ownerAddr = Address.parse(walletAddress);
    const fiWalletAddr = await getFiWalletAddress(ownerAddr, network);

    const payload = ChangeUsername.toCell(
      ChangeUsername.create({
        newUsername: username,
      }),
    );

    await sendTx([
      { toAddress: fiWalletAddr.toString(), amount: GAS.PROFILE, payload },
    ]);
  }, [walletAddress, username, network, sendTx]);

  const updateLocation = useCallback(async () => {
    if (!walletAddress) throw new Error('No wallet address');
    const ownerAddr = Address.parse(walletAddress);
    const fiWalletAddr = await getFiWalletAddress(ownerAddr, network);

    const payload = ChangeLocation.toCell(
      ChangeLocation.create({
        newH3Cell: h3Cell,
      }),
    );

    await sendTx([
      { toAddress: fiWalletAddr.toString(), amount: GAS.PROFILE, payload },
    ]);
  }, [walletAddress, h3Cell, network, sendTx]);

  const updateCountry = useCallback(async () => {
    if (!walletAddress) throw new Error('No wallet address');
    const ownerAddr = Address.parse(walletAddress);
    const fiWalletAddr = await getFiWalletAddress(ownerAddr, network);

    const payload = ChangeCountry.toCell(
      ChangeCountry.create({
        newCountry: BigInt(country),
      }),
    );

    await sendTx([
      { toAddress: fiWalletAddr.toString(), amount: GAS.PROFILE, payload },
    ]);
  }, [walletAddress, country, network, sendTx]);

  const isDisabled = !wallet || !walletAddress || isSending;

  return {
    updateUsername,
    updateLocation,
    updateCountry,
    isDisabled,
    isSending,
    error,
  };
}
