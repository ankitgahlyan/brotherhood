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
import { SetStatus, AuthorityCloseAccount } from '@/contracts/brotherhood/FossFiWallet.gen';
import { getFiWalletAddress } from '@/lib/brotherhood/ton';
import type { Network } from '@/lib/brotherhood/config';
import { useBrotherhoodTransaction, GAS } from './use-brotherhood-transaction';

export interface UseAuthorityActionsParams {
    wallet: Wallet | null | undefined;
    walletKit: ITonWalletKit | null;
    walletAddress: string | null;
    targetAddress: string;
    newStatus: number;
    network: Network;
}

export interface UseAuthorityActionsResult {
    setStatus: () => Promise<void>;
    closeAccount: () => Promise<void>;
    isDisabled: boolean;
    isSending: boolean;
    error: string | null;
}

export function useAuthorityActions({
    wallet,
    walletKit,
    walletAddress,
    targetAddress,
    newStatus,
    network,
}: UseAuthorityActionsParams): UseAuthorityActionsResult {
    const { send: sendTx, isSending, error } = useBrotherhoodTransaction(wallet, walletKit);

    const setStatus = useCallback(async () => {
        if (!walletAddress) throw new Error('No wallet address');
        const ownerAddr = Address.parse(walletAddress);
        const fiWalletAddr = await getFiWalletAddress(ownerAddr, network);

        const payload = SetStatus.toCell(
            SetStatus.create({
                sender: ownerAddr,
                status: BigInt(newStatus),
            })
        );

        await sendTx([{ toAddress: fiWalletAddr.toString(), amount: GAS.AUTHORITY, payload }]);
    }, [walletAddress, newStatus, network, sendTx]);

    const closeAccount = useCallback(async () => {
        if (!walletAddress) throw new Error('No wallet address');
        const ownerAddr = Address.parse(walletAddress);
        const fiWalletAddr = await getFiWalletAddress(ownerAddr, network);
        const target = Address.parse(targetAddress);

        const payload = AuthorityCloseAccount.toCell(
            AuthorityCloseAccount.create({
                queryId: 0n,
                target,
            })
        );

        await sendTx([{ toAddress: fiWalletAddr.toString(), amount: GAS.AUTHORITY, payload }]);
    }, [walletAddress, targetAddress, network, sendTx]);

    const isDisabled = !wallet || !walletAddress || isSending;

    return { setStatus, closeAccount, isDisabled, isSending, error };
}
