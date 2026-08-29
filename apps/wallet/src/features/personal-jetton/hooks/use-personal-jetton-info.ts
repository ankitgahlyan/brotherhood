/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useMemo } from 'react';
import { Address } from '@ton/core';
import {
    usePersonalMinterForIssuer,
    usePersonalWalletAddress,
    usePersonalWalletBalance,
} from '@/lib/brotherhood/queries';

export interface UsePersonalJettonInfoResult {
    personalMinterAddress: string | null;
    personalWalletAddress: string | null;
    personalBalance: bigint | null;
    isLoading: boolean;
}

export function usePersonalJettonInfo(walletAddress: string | null): UsePersonalJettonInfoResult {
    const ownerAddress = useMemo(() => {
        if (!walletAddress) return null;
        try {
            return Address.parse(walletAddress);
        } catch {
            return null;
        }
    }, [walletAddress]);

    const { data: minterAddrObj, isLoading: isMinterLoading } =
        usePersonalMinterForIssuer(ownerAddress);

    const { data: walletAddrObj, isLoading: isWalletAddrLoading } =
        usePersonalWalletAddress(minterAddrObj ?? null, ownerAddress);

    const { data: balance, isLoading: isBalanceLoading } =
        usePersonalWalletBalance(minterAddrObj ?? null, ownerAddress);

    return {
        personalMinterAddress: minterAddrObj?.toString() ?? null,
        personalWalletAddress: walletAddrObj?.toString() ?? null,
        personalBalance: balance ?? null,
        isLoading: isMinterLoading || isWalletAddrLoading || isBalanceLoading,
    };
}
