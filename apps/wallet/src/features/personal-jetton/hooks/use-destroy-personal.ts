/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useCallback } from 'react';
import type { ITonWalletKit, Wallet } from '@ton/walletkit';
import { toNano } from '@ton/core';
import { buildDestroyBody } from '@/lib/brotherhood/deploy';
import { useBrotherhoodTransaction } from '@/features/brotherhood';

export interface UseDestroyPersonalParams {
  wallet: Wallet | null | undefined;
  walletKit: ITonWalletKit | null;
  walletAddress: string | null;
  personalWalletAddress: string | null;
  personalMinterAddress: string | null;
  onSuccess?: () => void;
}

export interface UseDestroyPersonalResult {
  destroyWallet: () => Promise<void>;
  destroyMinter: () => Promise<void>;
  destroyAll: () => Promise<void>;
  isSending: boolean;
  error: string | null;
}

export function useDestroyPersonal({
  wallet,
  walletKit,
  walletAddress,
  personalWalletAddress,
  personalMinterAddress,
  onSuccess,
}: UseDestroyPersonalParams): UseDestroyPersonalResult {
  const {
    send: sendTx,
    isSending,
    error,
  } = useBrotherhoodTransaction(wallet, walletKit);

  const destroyWallet = useCallback(async () => {
    if (!walletAddress || !personalWalletAddress) {
      throw new Error('Missing personal wallet address');
    }
    const payload = buildDestroyBody();
    await sendTx(
      [
        {
          toAddress: personalWalletAddress,
          amount: toNano('0.05'),
          payload,
        },
      ],
      {
        affectedContracts: [
          personalWalletAddress,
          ...(personalMinterAddress ? [personalMinterAddress] : []),
        ],
      },
    );
    onSuccess?.();
  }, [
    walletAddress,
    personalWalletAddress,
    personalMinterAddress,
    sendTx,
    onSuccess,
  ]);

  const destroyMinter = useCallback(async () => {
    if (!walletAddress || !personalMinterAddress) {
      throw new Error('Missing personal minter address');
    }
    const payload = buildDestroyBody();
    await sendTx(
      [
        {
          toAddress: personalMinterAddress,
          amount: toNano('0.05'),
          payload,
        },
      ],
      {
        affectedContracts: [
          personalMinterAddress,
          ...(personalWalletAddress ? [personalWalletAddress] : []),
        ],
      },
    );
    onSuccess?.();
  }, [
    walletAddress,
    personalMinterAddress,
    personalWalletAddress,
    sendTx,
    onSuccess,
  ]);

  const destroyAll = useCallback(async () => {
    if (!walletAddress) {
      throw new Error('Missing wallet address');
    }
    const payload = buildDestroyBody();
    const messages: {
      toAddress: string;
      amount: bigint;
      payload: typeof payload;
    }[] = [];
    const affectedContracts: string[] = [];

    if (personalWalletAddress) {
      messages.push({
        toAddress: personalWalletAddress,
        amount: toNano('0.05'),
        payload,
      });
      affectedContracts.push(personalWalletAddress);
    }

    if (personalMinterAddress) {
      messages.push({
        toAddress: personalMinterAddress,
        amount: toNano('0.05'),
        payload,
      });
      affectedContracts.push(personalMinterAddress);
    }

    if (messages.length === 0) {
      throw new Error('No active personal contracts to destroy');
    }

    await sendTx(messages, {
      affectedContracts,
    });
    onSuccess?.();
  }, [
    walletAddress,
    personalWalletAddress,
    personalMinterAddress,
    sendTx,
    onSuccess,
  ]);

  return {
    destroyWallet,
    destroyMinter,
    destroyAll,
    isSending,
    error,
  };
}
