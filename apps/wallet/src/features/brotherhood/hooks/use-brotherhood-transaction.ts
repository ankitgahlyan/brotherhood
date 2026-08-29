/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import type { Cell } from '@ton/core';
import type { ITonWalletKit, Wallet } from '@ton/walletkit';
import { toNano } from '@ton/core';

export interface BrotherhoodMessage {
    toAddress: string;
    amount: bigint;
    payload: Cell;
}

export interface UseBrotherhoodTransactionResult {
    send: (messages: BrotherhoodMessage[]) => Promise<void>;
    isSending: boolean;
    error: string | null;
}

/**
 * Shared hook for all BrotherHood write operations.
 * Adapts the jetton project's useSendFiTransaction pattern to the
 * demo-wallet's walletKit.handleNewTransaction() infrastructure.
 */
export function useBrotherhoodTransaction(
    wallet: Wallet | null | undefined,
    walletKit: ITonWalletKit | null,
): UseBrotherhoodTransactionResult {
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const send = useCallback(
        async (messages: BrotherhoodMessage[]) => {
            if (!wallet) {
                toast.error('No wallet connected');
                throw new Error('No wallet available');
            }
            if (!walletKit) {
                toast.error('WalletKit not initialized');
                throw new Error('WalletKit not initialized');
            }

            setIsSending(true);
            setError(null);

            try {
                for (const msg of messages) {
                    const tx = await wallet.createTransferTonTransaction({
                        recipientAddress: msg.toAddress,
                        transferAmount: msg.amount.toString(),
                        payload: msg.payload.toBoc().toString('base64'),
                    });
                    await walletKit.handleNewTransaction(wallet, tx);
                }
            } catch (err) {
                const errMsg = err instanceof Error ? err.message : 'Transaction failed';
                setError(errMsg);
                toast.error('Transaction failed', { description: errMsg });
                throw err;
            } finally {
                setIsSending(false);
            }
        },
        [wallet, walletKit],
    );

    return { send, isSending, error };
}

/** Default gas amounts for various operations */
export const GAS = {
    TRANSFER: toNano('0.05'),
    BURN: toNano('0.05'),
    CLAIM: toNano('0.05'),
    INVITE: toNano('0.1'),
    VOTE: toNano('0.05'),
    CREDIT: toNano('0.1'),
    REPAY: toNano('0.05'),
    ALLOWANCE: toNano('0.05'),
    GOLD: toNano('0.05'),
    PROFILE: toNano('0.05'),
    AUTHORITY: toNano('0.1'),
    LOTTERY: toNano('0.5'),
    DAO: toNano('0.1'),
    DEPLOY: toNano('0.5'),
    MINT: toNano('0.1'),
    TOP_UP: toNano('0.1'),
} as const;
