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
import { buildBurnBody, parseUnits } from '@/lib/brotherhood/deploy';
import { useBrotherhoodTransaction, GAS } from '@/features/brotherhood';

export interface UseBurnPersonalParams {
    wallet: Wallet | null | undefined;
    walletKit: ITonWalletKit | null;
    walletAddress: string | null;
    personalWalletAddress: string;
    amount: string;
}

export interface UseBurnPersonalResult {
    burn: () => Promise<void>;
    isDisabled: boolean;
    isSending: boolean;
    error: string | null;
}

export function useBurnPersonal({
    wallet,
    walletKit,
    walletAddress,
    personalWalletAddress,
    amount,
}: UseBurnPersonalParams): UseBurnPersonalResult {
    const { send: sendTx, isSending, error } = useBrotherhoodTransaction(wallet, walletKit);

    const burn = useCallback(async () => {
        if (!walletAddress || !personalWalletAddress) throw new Error('Missing address');
        const ownerAddr = Address.parse(walletAddress);
        const amountNano = parseUnits(amount, 9);

        const payload = buildBurnBody(amountNano, ownerAddr);

        await sendTx([{ toAddress: personalWalletAddress, amount: GAS.BURN, payload }]);
    }, [walletAddress, personalWalletAddress, amount, sendTx]);

    const isDisabled =
        !wallet ||
        !walletAddress ||
        !personalWalletAddress ||
        !amount ||
        parseFloat(amount) <= 0 ||
        isSending;

    return { burn, isDisabled, isSending, error };
}
