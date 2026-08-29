/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useMemo } from 'react';
import { Address } from '@ton/core';
import { useFiWalletState } from '@/lib/brotherhood/queries';

export interface UseFiAccountResult {
    data: {
        jettonBalance: bigint;
        goldCoins: number;
        txnCount: number;
        status: number;
        isAuthorityAccount: boolean;
        creditNeed: bigint;
        multiplier: number;
        accumulatedFees: bigint;
        debt: bigint;
        votes: number;
        receivedVotes: bigint;
        connections: number;
        active: boolean;
        mintable: boolean;
        username: string;
        city: string;
    } | null;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
}

export function useFiAccount(walletAddress: string | null): UseFiAccountResult {
    const ownerAddress = useMemo(() => {
        if (!walletAddress) return null;
        try {
            return Address.parse(walletAddress);
        } catch {
            return null;
        }
    }, [walletAddress]);

    const { data: rawData, isLoading, error, refetch } = useFiWalletState(ownerAddress);

    const formattedData = useMemo(() => {
        if (!rawData) return null;
        return {
            jettonBalance: rawData.jettonBalance,
            goldCoins: Number(rawData.goldCoins),
            txnCount: Number(rawData.txnCount),
            status: Number(rawData.status),
            isAuthorityAccount: rawData.isAuthorityAccount,
            creditNeed: rawData.creditNeed,
            multiplier: Number(rawData.multiplier),
            accumulatedFees: rawData.accumulatedFees,
            debt: rawData.debt,
            votes: Number(rawData.votes),
            receivedVotes: rawData.receivedVotes,
            connections: Number(rawData.connections),
            active: rawData.active,
            mintable: rawData.mintable,
            username: rawData.profile.ref.username,
            city: rawData.profile.ref.city,
        };
    }, [rawData]);

    return {
        data: formattedData,
        isLoading,
        error: error instanceof Error ? error : null,
        refetch,
    };
}
