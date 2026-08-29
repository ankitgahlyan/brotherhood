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
import { ChangeUsername, ChangeCity } from '@/contracts/brotherhood/FossFiWallet.gen';
import { getFiWalletAddress } from '@/lib/brotherhood/ton';
import type { Network } from '@/lib/brotherhood/config';
import { useBrotherhoodTransaction, GAS } from './use-brotherhood-transaction';

export interface UseProfileParams {
    wallet: Wallet | null | undefined;
    walletKit: ITonWalletKit | null;
    walletAddress: string | null;
    username: string;
    city: string;
    cityLetter: number;
    network: Network;
}

export interface UseProfileResult {
    updateUsername: () => Promise<void>;
    updateCity: () => Promise<void>;
    isDisabled: boolean;
    isSending: boolean;
    error: string | null;
}

export function useProfile({
    wallet,
    walletKit,
    walletAddress,
    username,
    city,
    cityLetter,
    network,
}: UseProfileParams): UseProfileResult {
    const { send: sendTx, isSending, error } = useBrotherhoodTransaction(wallet, walletKit);

    const updateUsername = useCallback(async () => {
        if (!walletAddress) throw new Error('No wallet address');
        const ownerAddr = Address.parse(walletAddress);
        const fiWalletAddr = await getFiWalletAddress(ownerAddr, network);

        const payload = ChangeUsername.toCell(
            ChangeUsername.create({
                newUsername: username,
            })
        );

        await sendTx([{ toAddress: fiWalletAddr.toString(), amount: GAS.PROFILE, payload }]);
    }, [walletAddress, username, network, sendTx]);

    const updateCity = useCallback(async () => {
        if (!walletAddress) throw new Error('No wallet address');
        const ownerAddr = Address.parse(walletAddress);
        const fiWalletAddr = await getFiWalletAddress(ownerAddr, network);

        const payload = ChangeCity.toCell(
            ChangeCity.create({
                newCity: city,
                newCityLetter: BigInt(cityLetter),
            })
        );

        await sendTx([{ toAddress: fiWalletAddr.toString(), amount: GAS.PROFILE, payload }]);
    }, [walletAddress, city, cityLetter, network, sendTx]);

    const isDisabled = !wallet || !walletAddress || isSending;

    return { updateUsername, updateCity, isDisabled, isSending, error };
}
