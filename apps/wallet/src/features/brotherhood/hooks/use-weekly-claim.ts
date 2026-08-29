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
import { ActClaimWeeklyGrant } from '@/contracts/brotherhood/FossFiWallet.gen';
import { getFiWalletAddress } from '@/lib/brotherhood/ton';
import type { Network } from '@/lib/brotherhood/config';
import { useBrotherhoodTransaction, GAS } from './use-brotherhood-transaction';

export interface UseWeeklyClaimParams {
    wallet: Wallet | null | undefined;
    walletKit: ITonWalletKit | null;
    walletAddress: string | null;
    network: Network;
}

export interface UseWeeklyClaimResult {
    send: () => Promise<void>;
    isDisabled: boolean;
    isSending: boolean;
    error: string | null;
}

export function useWeeklyClaim({
    wallet,
    walletKit,
    walletAddress,
    network,
}: UseWeeklyClaimParams): UseWeeklyClaimResult {
    const { send: sendTx, isSending, error } = useBrotherhoodTransaction(wallet, walletKit);

    const send = useCallback(async () => {
        if (!walletAddress) throw new Error('No wallet address');
        const ownerAddr = Address.parse(walletAddress);
        const fiWalletAddr = await getFiWalletAddress(ownerAddr, network);

        const payload = ActClaimWeeklyGrant.toCell(
            ActClaimWeeklyGrant.create({ queryId: 0n, sendExcessesTo: ownerAddr })
        );

        await sendTx([{ toAddress: fiWalletAddr.toString(), amount: GAS.CLAIM, payload }]);
    }, [walletAddress, network, sendTx]);

    const isDisabled = !wallet || !walletAddress || isSending;

    return { send, isDisabled, isSending, error };
}
