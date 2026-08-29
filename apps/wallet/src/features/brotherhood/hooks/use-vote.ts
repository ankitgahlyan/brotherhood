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
import { buildVoteBody, buildUnvoteBody } from '@/lib/brotherhood/deploy';
import { getFiWalletAddress } from '@/lib/brotherhood/ton';
import type { Network } from '@/lib/brotherhood/config';
import { useBrotherhoodTransaction, GAS } from './use-brotherhood-transaction';

export interface UseVoteParams {
    wallet: Wallet | null | undefined;
    walletKit: ITonWalletKit | null;
    walletAddress: string | null;
    targetAddress: string;
    isUnvote?: boolean;
    network: Network;
}

export interface UseVoteResult {
    send: () => Promise<void>;
    isDisabled: boolean;
    isSending: boolean;
    error: string | null;
}

export function useVote({
    wallet,
    walletKit,
    walletAddress,
    targetAddress,
    isUnvote = false,
    network,
}: UseVoteParams): UseVoteResult {
    const { send: sendTx, isSending, error } = useBrotherhoodTransaction(wallet, walletKit);

    const send = useCallback(async () => {
        if (!walletAddress) throw new Error('No wallet address');
        const ownerAddr = Address.parse(walletAddress);
        const fiWalletAddr = await getFiWalletAddress(ownerAddr, network);
        const target = Address.parse(targetAddress);

        const payload = isUnvote
            ? buildUnvoteBody({ transferRecipient: target })
            : buildVoteBody({ transferRecipient: target });

        await sendTx([{ toAddress: fiWalletAddr.toString(), amount: GAS.VOTE, payload }]);
    }, [walletAddress, targetAddress, isUnvote, network, sendTx]);

    const isDisabled = !wallet || !walletAddress || !targetAddress || isSending;

    return { send, isDisabled, isSending, error };
}
