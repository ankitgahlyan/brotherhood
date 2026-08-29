/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useCallback } from 'react';
import type { ITonWalletKit, Wallet } from '@ton/walletkit';
import { DrawWinner } from '@/contracts/brotherhood/Lottery.gen';
import { useBrotherhoodTransaction, GAS } from '@/features/brotherhood';

export interface UseDrawWinnerParams {
    wallet: Wallet | null | undefined;
    walletKit: ITonWalletKit | null;
    lotteryAddress: string;
}

export interface UseDrawWinnerResult {
    draw: () => Promise<void>;
    isDisabled: boolean;
    isSending: boolean;
    error: string | null;
}

export function useDrawWinner({
    wallet,
    walletKit,
    lotteryAddress,
}: UseDrawWinnerParams): UseDrawWinnerResult {
    const { send: sendTx, isSending, error } = useBrotherhoodTransaction(wallet, walletKit);

    const draw = useCallback(async () => {
        if (!lotteryAddress) throw new Error('Missing lottery address');

        const payload = DrawWinner.toCell(DrawWinner.create({ queryId: 0n }));

        await sendTx([{ toAddress: lotteryAddress, amount: GAS.LOTTERY, payload }]);
    }, [lotteryAddress, sendTx]);

    const isDisabled = !wallet || !lotteryAddress || isSending;

    return { draw, isDisabled, isSending, error };
}
