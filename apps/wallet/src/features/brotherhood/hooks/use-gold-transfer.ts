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
import { AskGoldCoinsTransfer } from '@/contracts/brotherhood/FossFiWallet.gen';
import { getFiWalletAddress } from '@/lib/brotherhood/ton';
import type { Network } from '@/lib/brotherhood/config';
import { useBrotherhoodTransaction, GAS } from './use-brotherhood-transaction';

export interface UseGoldTransferParams {
    wallet: Wallet | null | undefined;
    walletKit: ITonWalletKit | null;
    walletAddress: string | null;
    recipient: string;
    amount: number;
    network: Network;
}

export interface UseGoldTransferResult {
    send: () => Promise<void>;
    isDisabled: boolean;
    isSending: boolean;
    error: string | null;
}

export function useGoldTransfer({
    wallet,
    walletKit,
    walletAddress,
    recipient,
    amount,
    network,
}: UseGoldTransferParams): UseGoldTransferResult {
    const { send: sendTx, isSending, error } = useBrotherhoodTransaction(wallet, walletKit);

    const send = useCallback(async () => {
        if (!walletAddress) throw new Error('No wallet address');
        const ownerAddr = Address.parse(walletAddress);
        const fiWalletAddr = await getFiWalletAddress(ownerAddr, network);
        const recipientAddr = Address.parse(recipient);

        const payload = AskGoldCoinsTransfer.toCell(
            AskGoldCoinsTransfer.create({
                queryId: 0n,
                amount: BigInt(amount),
                receiver: recipientAddr,
                sendExcessesTo: ownerAddr,
            })
        );

        await sendTx([{ toAddress: fiWalletAddr.toString(), amount: GAS.GOLD, payload }]);
    }, [walletAddress, recipient, amount, network, sendTx]);

    const isDisabled =
        !wallet || !walletAddress || !recipient || !amount || amount <= 0 || isSending;

    return { send, isDisabled, isSending, error };
}
