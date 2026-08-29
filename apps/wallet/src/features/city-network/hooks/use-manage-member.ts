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
import { RegisterCityMember, UnregisterCityMember } from '@/contracts/brotherhood/CityMap.gen';
import { useBrotherhoodTransaction, GAS } from '@/features/brotherhood';

export interface UseManageMemberParams {
    wallet: Wallet | null | undefined;
    walletKit: ITonWalletKit | null;
    walletAddress: string | null;
    cityMapAddress: string;
    cityName: string;
    targetMember: string;
}

export interface UseManageMemberResult {
    registerMember: () => Promise<void>;
    unregisterMember: () => Promise<void>;
    isDisabled: boolean;
    isSending: boolean;
    error: string | null;
}

export function useManageMember({
    wallet,
    walletKit,
    walletAddress,
    cityMapAddress,
    cityName,
    targetMember,
}: UseManageMemberParams): UseManageMemberResult {
    const { send: sendTx, isSending, error } = useBrotherhoodTransaction(wallet, walletKit);

    const registerMember = useCallback(async () => {
        if (!walletAddress || !cityMapAddress || !targetMember) throw new Error('Missing parameter');
        const ownerAddr = Address.parse(targetMember);
        const senderAddr = Address.parse(walletAddress);

        const payload = RegisterCityMember.toCell(
            RegisterCityMember.create({
                queryId: 0n,
                ownerAddress: ownerAddr,
                cityName,
                sendExcessesTo: senderAddr,
            })
        );

        await sendTx([{ toAddress: cityMapAddress, amount: GAS.PROFILE, payload }]);
    }, [walletAddress, cityMapAddress, cityName, targetMember, sendTx]);

    const unregisterMember = useCallback(async () => {
        if (!walletAddress || !cityMapAddress || !targetMember) throw new Error('Missing parameter');
        const ownerAddr = Address.parse(targetMember);
        const senderAddr = Address.parse(walletAddress);

        const payload = UnregisterCityMember.toCell(
            UnregisterCityMember.create({
                queryId: 0n,
                ownerAddress: ownerAddr,
                cityName,
                sendExcessesTo: senderAddr,
            })
        );

        await sendTx([{ toAddress: cityMapAddress, amount: GAS.PROFILE, payload }]);
    }, [walletAddress, cityMapAddress, targetMember, sendTx]);

    const isDisabled = !wallet || !walletAddress || !cityMapAddress || !targetMember || isSending;

    return { registerMember, unregisterMember, isDisabled, isSending, error };
}
