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
import { buildBuyCreditBody, parseUnits } from '@/lib/brotherhood/deploy';
import { getFiWalletAddress } from '@/lib/brotherhood/ton';
import type { Network } from '@/lib/brotherhood/config';
import { useBrotherhoodTransaction, GAS } from './use-brotherhood-transaction';

export interface UseBuyCreditParams {
    wallet: Wallet | null | undefined;
    walletKit: ITonWalletKit | null;
    walletAddress: string | null;
    recipient: string;
    amount: string;
    network: Network;
}

export interface UseBuyCreditResult {
    send: () => Promise<void>;
    isDisabled: boolean;
    isSending: boolean;
    error: string | null;
}

export function useBuyCredit({
    wallet,
    walletKit,
    walletAddress,
    recipient,
    amount,
    network,
}: UseBuyCreditParams): UseBuyCreditResult {
    const { send: sendTx, isSending, error } = useBrotherhoodTransaction(wallet, walletKit);

    const send = useCallback(async () => {
        if (!walletAddress) throw new Error('No wallet address');
        const ownerAddr = Address.parse(walletAddress);
        const fiWalletAddr = await getFiWalletAddress(ownerAddr, network);
        const recipientAddr = Address.parse(recipient);
        const amountNano = parseUnits(amount, 9);

        const payload = buildBuyCreditBody({
            transferRecipient: recipientAddr,
            amount: amountNano,
            responseAddress: ownerAddr,
        });

        await sendTx([{ toAddress: fiWalletAddr.toString(), amount: GAS.CREDIT, payload }]);
    }, [walletAddress, recipient, amount, network, sendTx]);

    const isDisabled =
        !wallet || !walletAddress || !recipient || !amount || parseFloat(amount) <= 0 || isSending;

    return { send, isDisabled, isSending, error };
}
