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
import { buildMintBody, parseUnits } from '@/lib/brotherhood/deploy';
import { useBrotherhoodTransaction, GAS } from '@/features/brotherhood';

export interface UseMintPersonalParams {
    wallet: Wallet | null | undefined;
    walletKit: ITonWalletKit | null;
    minterAddress: string;
    recipient: string;
    amount: string;
}

export interface UseMintPersonalResult {
    mint: () => Promise<void>;
    isDisabled: boolean;
    isSending: boolean;
    error: string | null;
}

export function useMintPersonal({
    wallet,
    walletKit,
    minterAddress,
    recipient,
    amount,
}: UseMintPersonalParams): UseMintPersonalResult {
    const { send: sendTx, isSending, error } = useBrotherhoodTransaction(wallet, walletKit);

    const mint = useCallback(async () => {
        if (!minterAddress || !recipient) throw new Error('Missing minter or recipient');
        const recipientAddr = Address.parse(recipient);
        const amountNano = parseUnits(amount, 9);

        const payload = buildMintBody({
            toAddress: recipientAddr,
            jettonAmount: amountNano,
            forwardTonAmount: 20000000n,
            totalTonAmount: 50000000n,
        });

        await sendTx([{ toAddress: minterAddress, amount: GAS.MINT, payload }]);
    }, [minterAddress, recipient, amount, sendTx]);

    const isDisabled =
        !wallet || !minterAddress || !recipient || !amount || parseFloat(amount) <= 0 || isSending;

    return { mint, isDisabled, isSending, error };
}
