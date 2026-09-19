/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useCallback, useState } from 'react';
import { Address } from '@ton/core';
import type { ITonWalletKit, Wallet } from '@ton/walletkit';
import { buildRequestUpgradeBody } from '@/lib/brotherhood/deploy';
import { FI_ADDRESS } from '@/lib/brotherhood/config';
import { useBrotherhoodTransaction, GAS } from './use-brotherhood-transaction';
import { toast } from 'sonner';

export interface UsePushUpgradeParams {
  wallet: Wallet | null | undefined;
  walletKit: ITonWalletKit | null;
}

export function usePushUpgrade({ wallet, walletKit }: UsePushUpgradeParams) {
  const {
    send: sendTx,
    isSending,
    error,
  } = useBrotherhoodTransaction(wallet, walletKit);
  const [targetAddress, setTargetAddress] = useState('');

  const sendPushUpgrade = useCallback(
    async (target: string) => {
      const cleanTarget = target.trim();
      if (!cleanTarget) {
        toast.error('Please enter a target address');
        return;
      }

      let parsedTarget: Address;
      try {
        parsedTarget = Address.parse(cleanTarget);
      } catch {
        toast.error('Invalid target TON address');
        return;
      }

      const payload = buildRequestUpgradeBody(parsedTarget);

      await sendTx([
        {
          toAddress: FI_ADDRESS,
          amount: GAS.REQUEST_UPGRADE,
          payload,
        },
      ]);

      toast.success('Push upgrade transaction sent to Minter');
    },
    [sendTx],
  );

  return {
    targetAddress,
    setTargetAddress,
    sendPushUpgrade,
    isSending,
    error,
  };
}
