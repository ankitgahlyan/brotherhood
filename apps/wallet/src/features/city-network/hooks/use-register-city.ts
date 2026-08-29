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
import { LocationRegisterCity } from '@/contracts/brotherhood/Location.gen';
import { useBrotherhoodTransaction, GAS } from '@/features/brotherhood';

export interface UseRegisterCityParams {
    wallet: Wallet | null | undefined;
    walletKit: ITonWalletKit | null;
    walletAddress: string | null;
    locationAddress: string;
    cityName: string;
}

export interface UseRegisterCityResult {
    registerCity: () => Promise<void>;
    isDisabled: boolean;
    isSending: boolean;
    error: string | null;
}

export function useRegisterCity({
    wallet,
    walletKit,
    walletAddress,
    locationAddress,
    cityName,
}: UseRegisterCityParams): UseRegisterCityResult {
    const { send: sendTx, isSending, error } = useBrotherhoodTransaction(wallet, walletKit);

    const registerCity = useCallback(async () => {
        if (!walletAddress || !locationAddress || !cityName) throw new Error('Missing parameter');
        const ownerAddr = Address.parse(walletAddress);

        const payload = LocationRegisterCity.toCell(
            LocationRegisterCity.create({
                queryId: 0n,
                ownerAddress: ownerAddr,
                cityName,
                sendExcessesTo: ownerAddr,
            })
        );

        await sendTx([{ toAddress: locationAddress, amount: GAS.PROFILE, payload }]);
    }, [walletAddress, locationAddress, cityName, sendTx]);

    const isDisabled = !wallet || !walletAddress || !locationAddress || !cityName || isSending;

    return { registerCity, isDisabled, isSending, error };
}
