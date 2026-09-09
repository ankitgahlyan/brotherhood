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
  buildSetPersonalJettonBody,
  getExpectedPersonalWalletAddress,
} from '@/lib/brotherhood/deploy';
import { getFiWalletAddress } from '@/lib/brotherhood/ton';
import type { Network } from '@/lib/brotherhood/config';
import { useBrotherhoodTransaction, GAS } from '@/features/brotherhood';
import { useRefreshContractQueries } from '@/lib/brotherhood/queries';
import { deleteContractCache } from '@/lib/brotherhood/contract-cache';

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
  network: Network;
  initialMintAmount: string;
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
  network,
  initialMintAmount,
  onDeploySuccess,
}: UseDeployPersonalJettonParams): UseDeployPersonalJettonResult {
  const {
    send: sendTx,
    isSending,
    error,
  } = useBrotherhoodTransaction(wallet, walletKit);
  const refreshQueries = useRefreshContractQueries();

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

    const mintAmountNum = parseFloat(initialMintAmount);
    if (!initialMintAmount || isNaN(mintAmountNum) || mintAmountNum <= 0) {
      toast.error('Please specify a valid initial mint amount (> 0)');
      throw new Error('Invalid initial mint amount');
    }

    const ownerAddr = Address.parse(walletAddress);
    const fiWalletAddr = await getFiWalletAddress(ownerAddr, network);

    // Pure deterministic deployment: null metadata ensures minter address calculation is strictly deterministic
    const { contractAddress, stateInit } = await buildPersonalMinterDeploy({
      issuerWallet: fiWalletAddr,
      adminAddress: ownerAddr,
    });

    const expectedWallet = getExpectedPersonalWalletAddress({
      personalMinter: contractAddress,
      owner: ownerAddr,
    });

    const stateInitCell = beginCell()
      .store(storeStateInit(stateInit))
      .endCell();

    // Prepare initial MintNewJettons payload to mint directly to the deployer
    const mintAmountNano = parseUnits(initialMintAmount, 9);
    const mintPayload = buildMintBody({
      toAddress: ownerAddr,
      jettonAmount: mintAmountNano,
      forwardTonAmount: 20000000n,
      totalTonAmount: 700000000n, // 0.7 TON for child wallet deploy & storage
    });

    // Message 1: Deploy Personal Minter contract with stateInit and initial mint payload
    const deployMsg = {
      toAddress: contractAddress.toString(),
      amount: GAS.DEPLOY + GAS.MINT,
      payload: mintPayload,
      stateInit: stateInitCell,
    };

    // Message 2: Register minter and wallet to the issuer's FI Wallet in the same transaction
    const setBody = buildSetPersonalJettonBody({
      personalMinter: contractAddress,
      personalWallet: expectedWallet,
    });

    const registerMsg = {
      toAddress: fiWalletAddr.toString(),
      amount: GAS.SET_PERSONAL,
      payload: setBody,
    };

    // Send both messages bundled into a single multi-message transaction
    await sendTx([deployMsg, registerMsg]);

    // Clear local fi-wallet-state cache and trigger query refreshes
    await deleteContractCache(`fi-wallet-state:${ownerAddr.toString()}`);
    await refreshQueries([`fi-wallet-state:${ownerAddr.toString()}`]);

    const result: DeployedPersonalAddresses = {
      minterAddress: contractAddress.toString(),
      personalWalletAddress: expectedWallet.toString(),
    };

    setDeployedAddresses(result);
    toast.success('Personal Token deployed, minted, and registered to Account!');
    onDeploySuccess?.(result);
    return result;
  }, [walletAddress, initialMintAmount, network, sendTx, refreshQueries, onDeploySuccess]);

  const parsedMint = parseFloat(initialMintAmount);
  const isMintInvalid = !initialMintAmount || isNaN(parsedMint) || parsedMint <= 0;
  const isDisabled = !wallet || !walletAddress || isMintInvalid || isSending;

  return {
    deploy,
    isDisabled,
    isSending,
    error,
    deployedAddresses,
    resetDeployed,
  };
}
