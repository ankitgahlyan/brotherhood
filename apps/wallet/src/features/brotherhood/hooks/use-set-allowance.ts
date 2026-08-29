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
import { buildSetAllowanceBody, parseUnits } from '@/lib/brotherhood/deploy';
import { getFiWalletAddress } from '@/lib/brotherhood/ton';
import type { Network } from '@/lib/brotherhood/config';
import { useBrotherhoodTransaction, GAS } from './use-brotherhood-transaction';

export interface UseSetAllowanceParams {
    wallet: Wallet | null | undefined;
    walletKit: ITonWalletKit | null;
    walletAddress: string | null;
    grantee: string;
    amount: string;
    network: Network;
}

export interface UseSetAllowanceResult {
    send: () => Promise<void>;
    isDisabled: boolean;
    isSending: boolean;
    error: string | null;
}

export function useSetAllowance({
    wallet,
    walletKit,
    walletAddress,
    grantee,
    amount,
    network,
}: UseSetAllowanceParams): UseSetAllowanceResult {
    const { send: sendTx, isSending, error } = useBrotherhoodTransaction(wallet, walletKit);

    const send = useCallback(async () => {
        if (!walletAddress) throw new Error('No wallet address');
        const ownerAddr = Address.parse(walletAddress);
        const fiWalletAddr = await getFiWalletAddress(ownerAddr, network);
        const granteeAddr = Address.parse(grantee);
        const amountNano = parseUnits(amount, 9);

        const payload = buildSetAllowanceBody({
            grantee: granteeAddr,
            amount: amountNano,
        });

        await sendTx([{ toAddress: fiWalletAddr.toString(), amount: GAS.ALLOWANCE, payload }]);
    }, [walletAddress, grantee, amount, network, sendTx]);

    const isDisabled =
        !wallet || !walletAddress || !grantee || !amount || parseFloat(amount) <= 0 || isSending;

    return { send, isDisabled, isSending, error };
}
