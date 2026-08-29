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
import { buildChangeAdminBody, buildChangeContentBody, buildTopUpTonsBody } from '@/lib/brotherhood/deploy';
import { useBrotherhoodTransaction, GAS } from '@/features/brotherhood';

export interface UsePersonalMinterAdminParams {
    wallet: Wallet | null | undefined;
    walletKit: ITonWalletKit | null;
    minterAddress: string;
    newAdmin: string;
}

export interface UsePersonalMinterAdminResult {
    changeAdmin: () => Promise<void>;
    isDisabled: boolean;
    isSending: boolean;
    error: string | null;
}

export function usePersonalMinterAdmin({
    wallet,
    walletKit,
    minterAddress,
    newAdmin,
}: UsePersonalMinterAdminParams): UsePersonalMinterAdminResult {
    const { send: sendTx, isSending, error } = useBrotherhoodTransaction(wallet, walletKit);

    const changeAdmin = useCallback(async () => {
        if (!minterAddress || !newAdmin) throw new Error('Missing address');
        const newAdminAddr = Address.parse(newAdmin);

        const payload = buildChangeAdminBody(newAdminAddr);

        await sendTx([{ toAddress: minterAddress, amount: GAS.TRANSFER, payload }]);
    }, [minterAddress, newAdmin, sendTx]);

    const isDisabled = !wallet || !minterAddress || !newAdmin || isSending;

    return { changeAdmin, isDisabled, isSending, error };
}

export interface UsePersonalMinterMetadataParams {
    wallet: Wallet | null | undefined;
    walletKit: ITonWalletKit | null;
    minterAddress: string;
    name: string;
    symbol: string;
    description: string;
    image: string;
}

export function usePersonalMinterMetadata({
    wallet,
    walletKit,
    minterAddress,
    name,
    symbol,
    description,
    image,
}: UsePersonalMinterMetadataParams) {
    const { send: sendTx, isSending, error } = useBrotherhoodTransaction(wallet, walletKit);

    const changeMetadata = useCallback(async () => {
        if (!minterAddress) throw new Error('Missing minter address');

        const payload = await buildChangeContentBody({ name, symbol, description, image });

        await sendTx([{ toAddress: minterAddress, amount: GAS.TRANSFER, payload }]);
    }, [minterAddress, name, symbol, description, image, sendTx]);

    const isDisabled = !wallet || !minterAddress || !name || !symbol || isSending;

    return { changeMetadata, isDisabled, isSending, error };
}

export interface UseTopUpParams {
    wallet: Wallet | null | undefined;
    walletKit: ITonWalletKit | null;
    targetAddress: string;
}

export function useTopUp({ wallet, walletKit, targetAddress }: UseTopUpParams) {
    const { send: sendTx, isSending, error } = useBrotherhoodTransaction(wallet, walletKit);

    const topUp = useCallback(async () => {
        if (!targetAddress) throw new Error('Missing target address');

        const payload = buildTopUpTonsBody();

        await sendTx([{ toAddress: targetAddress, amount: GAS.TOP_UP, payload }]);
    }, [targetAddress, sendTx]);

    const isDisabled = !wallet || !targetAddress || isSending;

    return { topUp, isDisabled, isSending, error };
}
