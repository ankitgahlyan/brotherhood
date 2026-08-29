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
import { buildSpendAllowanceBody, parseUnits } from '@/lib/brotherhood/deploy';
import { getFiWalletAddress } from '@/lib/brotherhood/ton';
import type { Network } from '@/lib/brotherhood/config';
import { useBrotherhoodTransaction, GAS } from './use-brotherhood-transaction';

export interface UseSpendAllowanceParams {
    wallet: Wallet | null | undefined;
    walletKit: ITonWalletKit | null;
    walletAddress: string | null;
    granterAddress: string;
    receiver: string;
    amount: string;
    network: Network;
}

export interface UseSpendAllowanceResult {
    send: () => Promise<void>;
    isDisabled: boolean;
    isSending: boolean;
    error: string | null;
}

export function useSpendAllowance({
    wallet,
    walletKit,
    walletAddress,
    granterAddress,
    receiver,
    amount,
    network,
}: UseSpendAllowanceParams): UseSpendAllowanceResult {
    const { send: sendTx, isSending, error } = useBrotherhoodTransaction(wallet, walletKit);

    const send = useCallback(async () => {
        if (!walletAddress) throw new Error('No wallet address');
        const ownerAddr = Address.parse(walletAddress);
        const granterOwnerAddr = Address.parse(granterAddress);
        const granterFiWalletAddr = await getFiWalletAddress(granterOwnerAddr, network);
        const receiverAddr = Address.parse(receiver);
        const amountNano = parseUnits(amount, 9);

        const payload = buildSpendAllowanceBody({
            amount: amountNano,
            receiver: receiverAddr,
            sendExcessesTo: ownerAddr,
        });

        await sendTx([{ toAddress: granterFiWalletAddr.toString(), amount: GAS.ALLOWANCE, payload }]);
    }, [walletAddress, granterAddress, receiver, amount, network, sendTx]);

    const isDisabled =
        !wallet ||
        !walletAddress ||
        !granterAddress ||
        !receiver ||
        !amount ||
        parseFloat(amount) <= 0 ||
        isSending;

    return { send, isDisabled, isSending, error };
}
