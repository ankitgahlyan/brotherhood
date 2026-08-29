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
import { EnterLottery } from '@/contracts/brotherhood/Lottery.gen';
import { useBrotherhoodTransaction, GAS } from '@/features/brotherhood';

export interface UseEnterLotteryParams {
    wallet: Wallet | null | undefined;
    walletKit: ITonWalletKit | null;
    walletAddress: string | null;
    lotteryAddress: string;
}

export interface UseEnterLotteryResult {
    enter: () => Promise<void>;
    isDisabled: boolean;
    isSending: boolean;
    error: string | null;
}

export function useEnterLottery({
    wallet,
    walletKit,
    walletAddress,
    lotteryAddress,
}: UseEnterLotteryParams): UseEnterLotteryResult {
    const { send: sendTx, isSending, error } = useBrotherhoodTransaction(wallet, walletKit);

    const enter = useCallback(async () => {
        if (!walletAddress || !lotteryAddress) throw new Error('Missing address');
        const sender = Address.parse(walletAddress);

        const payload = EnterLottery.toCell(
            EnterLottery.create({
                sender,
                amount: GAS.LOTTERY,
            })
        );

        await sendTx([{ toAddress: lotteryAddress, amount: GAS.LOTTERY, payload }]);
    }, [walletAddress, lotteryAddress, sendTx]);

    const isDisabled = !wallet || !walletAddress || !lotteryAddress || isSending;

    return { enter, isDisabled, isSending, error };
}
