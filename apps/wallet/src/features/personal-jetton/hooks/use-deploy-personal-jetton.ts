/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useCallback, useState } from 'react';
import { Address, beginCell, storeStateInit } from '@ton/core';
import type { ITonWalletKit, Wallet } from '@ton/walletkit';
import { toast } from 'sonner';
import {
  buildPersonalMinterDeploy,
  buildMintBody,
  getExpectedPersonalWalletAddress,
  parseUnits,
} from '@/lib/brotherhood/deploy';
import { getFiWalletAddress } from '@/lib/brotherhood/ton';
import type { Network } from '@/lib/brotherhood/config';
import { useBrotherhoodTransaction, GAS } from '@/features/brotherhood';
import { DEFAULT_TOKEN_IMAGE } from '../data/cryptoicons';

export const DEFAULT_TOKEN_DESCRIPTION =
  'Personal Token backed by Member trust on BrotherHood Network';

export interface DeployedPersonalAddresses {
  minterAddress: string;
  personalWalletAddress: string;
}

export interface UseDeployPersonalJettonParams {
  wallet: Wallet | null | undefined;
  walletKit: ITonWalletKit | null;
  walletAddress: string | null;
  name: string;
  symbol: string;
  description?: string;
  image?: string;
  initialMintAmount?: string;
  network: Network;
  onDeploySuccess?: (addresses: DeployedPersonalAddresses) => void;
}

export interface UseDeployPersonalJettonResult {
  deploy: () => Promise<DeployedPersonalAddresses | undefined>;
  isDisabled: boolean;
  isSending: boolean;
  error: string | null;
  deployedAddresses: DeployedPersonalAddresses | null;
  resetDeployed: () => void;
}

export function useDeployPersonalJetton({
  wallet,
  walletKit,
  walletAddress,
  name,
  symbol,
  description,
  image,
  initialMintAmount,
  network,
  onDeploySuccess,
}: UseDeployPersonalJettonParams): UseDeployPersonalJettonResult {
  const {
    send: sendTx,
    isSending,
    error,
  } = useBrotherhoodTransaction(wallet, walletKit);

  const [deployedAddresses, setDeployedAddresses] =
    useState<DeployedPersonalAddresses | null>(null);

  const resetDeployed = useCallback(() => {
    setDeployedAddresses(null);
  }, []);

  const deploy = useCallback(async () => {
    if (!walletAddress) {
      toast.error('No wallet connected');
      throw new Error('No wallet address');
    }

    const trimmedName = name.trim();
    const trimmedSymbol = symbol.trim();

    if (!trimmedName || !trimmedSymbol) {
      toast.error('Token name and symbol are required');
      throw new Error('Token name and symbol are required');
    }

    const finalDescription =
      description && description.trim().length > 0
        ? description.trim()
        : DEFAULT_TOKEN_DESCRIPTION;

    const finalImage =
      image && image.trim().length > 0 ? image.trim() : DEFAULT_TOKEN_IMAGE;

    const ownerAddr = Address.parse(walletAddress);
    const fiWalletAddr = await getFiWalletAddress(ownerAddr, network);

    const { contractAddress, stateInit } = await buildPersonalMinterDeploy({
      issuerWallet: fiWalletAddr,
      adminAddress: ownerAddr,
      metadata: {
        name: trimmedName,
        symbol: trimmedSymbol,
        description: finalDescription,
        image: finalImage,
      },
    });

    const expectedWallet = getExpectedPersonalWalletAddress({
      personalMinter: contractAddress,
      owner: ownerAddr,
    });

    const stateInitCell = beginCell().store(storeStateInit(stateInit)).endCell();

    // Check if an initial mint amount was requested
    let payload = beginCell().endCell();
    let txAmount = GAS.DEPLOY;

    const mintVal = initialMintAmount ? parseFloat(initialMintAmount) : 0;
    if (mintVal > 0) {
      const mintNano = parseUnits(initialMintAmount!, 9);
      payload = buildMintBody({
        toAddress: ownerAddr,
        jettonAmount: mintNano,
        forwardTonAmount: 20000000n,
        totalTonAmount: 50000000n,
      });
      // Add mint gas to deploy transaction value
      txAmount = GAS.DEPLOY + GAS.MINT;
    }

    // Deploy message with stateInit and optional MintNewJettons payload
    await sendTx([
      {
        toAddress: contractAddress.toString(),
        amount: txAmount,
        payload,
        stateInit: stateInitCell,
      },
    ]);

    const result: DeployedPersonalAddresses = {
      minterAddress: contractAddress.toString(),
      personalWalletAddress: expectedWallet.toString(),
    };

    setDeployedAddresses(result);
    toast.success(
      mintVal > 0
        ? 'Personal Token minter deployed and initial tokens minted!'
        : 'Personal Token minter deployed!',
    );
    onDeploySuccess?.(result);
    return result;
  }, [
    walletAddress,
    name,
    symbol,
    description,
    image,
    initialMintAmount,
    network,
    sendTx,
    onDeploySuccess,
  ]);

  const isDisabled =
    !wallet ||
    !walletAddress ||
    !name.trim() ||
    !symbol.trim() ||
    isSending;

  return {
    deploy,
    isDisabled,
    isSending,
    error,
    deployedAddresses,
    resetDeployed,
  };
}
