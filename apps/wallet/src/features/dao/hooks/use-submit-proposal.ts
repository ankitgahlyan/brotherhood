/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useCallback } from 'react';
import { Address, Cell } from '@ton/core';
import type { ITonWalletKit, Wallet } from '@ton/walletkit';
import { ActSubmitProposal } from '@/contracts/brotherhood/FossFiWallet.gen';
import { getFiWalletAddress } from '@/lib/brotherhood/ton';
import type { Network } from '@/lib/brotherhood/config';
import { useBrotherhoodTransaction, GAS } from '@/features/brotherhood';

export interface UseSubmitProposalParams {
    wallet: Wallet | null | undefined;
    walletKit: ITonWalletKit | null;
    walletAddress: string | null;
    daoAddress: string;
    proposalTargetPayload?: Cell;
    network: Network;
}

export interface UseSubmitProposalResult {
    submit: () => Promise<void>;
    isDisabled: boolean;
    isSending: boolean;
    error: string | null;
}

export function useSubmitProposal({
    wallet,
    walletKit,
    walletAddress,
    daoAddress,
    proposalTargetPayload,
    network,
}: UseSubmitProposalParams): UseSubmitProposalResult {
    const { send: sendTx, isSending, error } = useBrotherhoodTransaction(wallet, walletKit);

    const submit = useCallback(async () => {
        if (!walletAddress || !daoAddress) throw new Error('Missing wallet or DAO address');
        const ownerAddr = Address.parse(walletAddress);
        const fiWalletAddr = await getFiWalletAddress(ownerAddr, network);
        const daoAddr = Address.parse(daoAddress);
        const targetMsg = proposalTargetPayload ?? Cell.EMPTY;

        const payload = ActSubmitProposal.toCell(
            ActSubmitProposal.create({
                queryId: 0n,
                daoAddress: daoAddr,
                targetMsg,
            })
        );

        await sendTx([{ toAddress: fiWalletAddr.toString(), amount: GAS.DAO, payload }]);
    }, [walletAddress, daoAddress, proposalTargetPayload, network, sendTx]);

    const isDisabled = !wallet || !walletAddress || !daoAddress || isSending;

    return { submit, isDisabled, isSending, error };
}
