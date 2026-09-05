/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useCallback } from 'react';
import { Address, toNano } from '@ton/core';
import type { ITonWalletKit, Wallet } from '@ton/walletkit';
import { toast } from 'sonner';
import { SetCreditNeed, SetMultiplier } from '@wrappers/FossFiWallet.gen';
import { parseUnits } from '@/lib/brotherhood/deploy';
import { getFiWalletAddress } from '@/lib/brotherhood/ton';
import type { Network } from '@/lib/brotherhood/config';
import { useBrotherhoodTransaction } from './use-brotherhood-transaction';
import { useRefreshContractQueries } from '@/lib/brotherhood/queries';
import { deleteContractCache } from '@/lib/brotherhood/contract-cache';

export interface UseSetCreditTermsParams {
  wallet: Wallet | null | undefined;
  walletKit: ITonWalletKit | null;
  walletAddress: string | null;
  network: Network;
  onSuccess?: () => void;
}

export interface UseSetCreditTermsResult {
  setCreditNeed: (amount: string, maturityDateSec: number) => Promise<void>;
  setMultiplier: (multiplier: number) => Promise<void>;
  isSending: boolean;
  error: string | null;
}

const SET_TERMS_GAS = toNano('0.2');

export function useSetCreditTerms({
  wallet,
  walletKit,
  walletAddress,
  network,
  onSuccess,
}: UseSetCreditTermsParams): UseSetCreditTermsResult {
  const {
    send: sendTx,
    isSending,
    error,
  } = useBrotherhoodTransaction(wallet, walletKit);
  const refreshQueries = useRefreshContractQueries();

  const setCreditNeed = useCallback(
    async (amount: string, maturityDateSec: number) => {
      if (!walletAddress) {
        toast.error('No wallet connected');
        throw new Error('No wallet connected');
      }

      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount < 0) {
        toast.error('Invalid credit amount');
        throw new Error('Invalid credit amount');
      }

      const ownerAddr = Address.parse(walletAddress);
      const fiWalletAddr = await getFiWalletAddress(ownerAddr, network);
      const amountNano = parseUnits(amount, 9);

      const body = SetCreditNeed.toCell(
        SetCreditNeed.create({
          queryId: 0n,
          amount: amountNano,
          maturityDate: maturityDateSec,
        }),
      );

      await sendTx([
        {
          toAddress: fiWalletAddr.toString(),
          amount: SET_TERMS_GAS,
          payload: body,
        },
      ]);

      await deleteContractCache(`fi-wallet-state:${ownerAddr.toString()}`);
      toast.success('Credit need updated successfully!');
      await refreshQueries([`fi-wallet-state:${ownerAddr.toString()}`]);
      onSuccess?.();
    },
    [walletAddress, network, sendTx, refreshQueries, onSuccess],
  );

  const setMultiplier = useCallback(
    async (multiplier: number) => {
      if (!walletAddress) {
        toast.error('No wallet connected');
        throw new Error('No wallet connected');
      }

      if (multiplier <= 0 || !Number.isInteger(multiplier)) {
        toast.error('Multiplier must be an integer >= 1');
        throw new Error('Invalid multiplier');
      }

      const ownerAddr = Address.parse(walletAddress);
      const fiWalletAddr = await getFiWalletAddress(ownerAddr, network);

      const body = SetMultiplier.toCell(
        SetMultiplier.create({
          queryId: 0n,
          multiplier,
        }),
      );

      await sendTx([
        {
          toAddress: fiWalletAddr.toString(),
          amount: SET_TERMS_GAS,
          payload: body,
        },
      ]);

      await deleteContractCache(`fi-wallet-state:${ownerAddr.toString()}`);
      toast.success('Credit multiplier updated successfully!');
      await refreshQueries([`fi-wallet-state:${ownerAddr.toString()}`]);
      onSuccess?.();
    },
    [walletAddress, network, sendTx, refreshQueries, onSuccess],
  );

  return {
    setCreditNeed,
    setMultiplier,
    isSending,
    error,
  };
}
