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
import { ActVoteProposal } from '@/contracts/brotherhood/FossFiWallet.gen';
import { getFiWalletAddress } from '@/lib/brotherhood/ton';
import type { Network } from '@/lib/brotherhood/config';
import { useBrotherhoodTransaction, GAS } from '@/features/brotherhood';

export interface UseVoteProposalParams {
    wallet: Wallet | null | undefined;
    walletKit: ITonWalletKit | null;
    walletAddress: string | null;
    daoAddress: string;
    proposalId: string;
    voteYes: boolean;
    network: Network;
}

export interface UseVoteProposalResult {
    vote: () => Promise<void>;
    isDisabled: boolean;
    isSending: boolean;
    error: string | null;
}

export function useVoteProposal({
    wallet,
    walletKit,
    walletAddress,
    daoAddress,
    proposalId,
    voteYes,
    network,
}: UseVoteProposalParams): UseVoteProposalResult {
    const { send: sendTx, isSending, error } = useBrotherhoodTransaction(wallet, walletKit);

    const vote = useCallback(async () => {
        if (!walletAddress || !daoAddress || !proposalId) throw new Error('Missing parameter');
        const ownerAddr = Address.parse(walletAddress);
        const fiWalletAddr = await getFiWalletAddress(ownerAddr, network);
        const daoAddr = Address.parse(daoAddress);
        const pId = BigInt(proposalId);

        const payload = ActVoteProposal.toCell(
            ActVoteProposal.create({
                queryId: 0n,
                daoAddress: daoAddr,
                proposalId: pId,
                vote: voteYes,
            })
        );

        await sendTx([{ toAddress: fiWalletAddr.toString(), amount: GAS.DAO, payload }]);
    }, [walletAddress, daoAddress, proposalId, voteYes, network, sendTx]);

    const isDisabled = !wallet || !walletAddress || !daoAddress || !proposalId || isSending;

    return { vote, isDisabled, isSending, error };
}
