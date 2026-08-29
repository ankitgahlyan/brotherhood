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
import { buildPersonalMinterDeploy, buildPointPersonalMinterBody } from '@/lib/brotherhood/deploy';
import { getFiWalletAddress } from '@/lib/brotherhood/ton';
import type { Network } from '@/lib/brotherhood/config';
import { useBrotherhoodTransaction, GAS } from '@/features/brotherhood';

export interface UseDeployPersonalJettonParams {
    wallet: Wallet | null | undefined;
    walletKit: ITonWalletKit | null;
    walletAddress: string | null;
    name: string;
    symbol: string;
    description: string;
    image: string;
    network: Network;
}

export interface UseDeployPersonalJettonResult {
    deploy: () => Promise<void>;
    isDisabled: boolean;
    isSending: boolean;
    error: string | null;
}

export function useDeployPersonalJetton({
    wallet,
    walletKit,
    walletAddress,
    name,
    symbol,
    description,
    image,
    network,
}: UseDeployPersonalJettonParams): UseDeployPersonalJettonResult {
    const { send: sendTx, isSending, error } = useBrotherhoodTransaction(wallet, walletKit);

    const deploy = useCallback(async () => {
        if (!walletAddress) throw new Error('No wallet address');
        const ownerAddr = Address.parse(walletAddress);
        const fiWalletAddr = await getFiWalletAddress(ownerAddr, network);

        const { contractAddress, stateInit } = await buildPersonalMinterDeploy({
            issuerWallet: fiWalletAddr,
            adminAddress: ownerAddr,
            metadata: { name, symbol, description, image },
        });

        // First message deploys PersonalMinter, second message points FI wallet to it
        const pointBody = buildPointPersonalMinterBody({ personalMinter: contractAddress });

        await sendTx([
            {
                toAddress: contractAddress.toString(),
                amount: GAS.DEPLOY,
                payload: pointBody, // stateInit deployment
            },
            {
                toAddress: fiWalletAddr.toString(),
                amount: GAS.TRANSFER,
                payload: pointBody,
            },
        ]);
    }, [walletAddress, name, symbol, description, image, network, sendTx]);

    const isDisabled = !wallet || !walletAddress || !name || !symbol || isSending;

    return { deploy, isDisabled, isSending, error };
}
