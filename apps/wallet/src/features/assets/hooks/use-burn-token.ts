/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useCallback, useMemo } from 'react';
import { Address, toNano } from '@ton/core';
import type { ITonWalletKit, Wallet } from '@ton/walletkit';
import { buildBurnBody, parseUnits } from '@/lib/brotherhood/deploy';
import { useBrotherhoodTransaction } from '@/features/brotherhood';
import {
  getFiWalletAddress,
  getPersonalWalletAddress,
  isPersonalMinterContract,
} from '@/lib/brotherhood/ton';
import { isFiJetton } from '@/features/jettons';
import type { Network } from '@/lib/brotherhood/config';
import type { AssetRowData } from '../components/asset-row';

export const DEFAULT_BURN_GAS_TON = '0.6';

export interface UseBurnTokenParams {
  wallet: Wallet | null | undefined;
  walletKit: ITonWalletKit | null;
  walletAddress: string | null | undefined;
  asset: AssetRowData | null;
  amount: string;
  isPayback?: boolean;
  customGasTon?: string;
  network?: Network;
}

export interface UseBurnTokenResult {
  burn: () => Promise<void>;
  isDisabled: boolean;
  isSending: boolean;
  error: string | null;
  validationError: string | null;
}

export function useBurnToken({
  wallet,
  walletKit,
  walletAddress,
  asset,
  amount,
  isPayback = true,
  customGasTon = DEFAULT_BURN_GAS_TON,
  network = 'testnet',
}: UseBurnTokenParams): UseBurnTokenResult {
  const {
    send: sendTx,
    isSending,
    error,
  } = useBrotherhoodTransaction(wallet, walletKit);

  const isFi = useMemo(() => {
    if (!asset) return false;
    return isFiJetton({ address: asset.id, symbol: asset.symbol });
  }, [asset]);

  const validationError = useMemo<string | null>(() => {
    if (!wallet || !walletAddress) return 'Connect wallet first';
    if (!asset) return 'No asset selected';
    if (asset.id === 'TON' || asset.symbol === 'GRAM') {
      return 'Native TON cannot be burned';
    }

    const inputAmount = parseFloat(amount);
    if (!amount || !(inputAmount > 0)) return 'Enter amount to burn';
    if (inputAmount > asset.amount) {
      return `Insufficient balance (available: ${asset.amount} ${asset.symbol})`;
    }

    const gasNum = parseFloat(customGasTon);
    if (!customGasTon || !(gasNum > 0)) return 'Enter valid gas fee';

    return null;
  }, [wallet, walletAddress, asset, amount, customGasTon]);

  const burn = useCallback(async () => {
    if (!wallet || !walletAddress || !asset) {
      throw new Error('Missing wallet or asset');
    }

    const ownerAddr = Address.parse(walletAddress);
    const amountNano = parseUnits(amount, 9);
    const gasValue = toNano(customGasTon || DEFAULT_BURN_GAS_TON);

    let targetWalletAddress: Address;

    if (isFi) {
      // BrotherHood FI: targets the user's FossFiWallet
      targetWalletAddress = getFiWalletAddress(ownerAddr, network);
    } else {
      // For personal tokens and other Jettons, compute or resolve the user's token wallet
      let isPersonal = false;
      try {
        const parsed = Address.parse(asset.id);
        isPersonal = await isPersonalMinterContract(parsed);
      } catch {
        isPersonal = false;
      }

      if (isPersonal) {
        targetWalletAddress = await getPersonalWalletAddress(
          Address.parse(asset.id),
          ownerAddr,
          network,
        );
      } else {
        const resolved = await wallet.getJettonWalletAddress(asset.id);
        if (!resolved) {
          throw new Error('Could not resolve Jetton wallet address');
        }
        targetWalletAddress = Address.parse(resolved);
      }
    }

    // Build AskToBurn payload
    // If payback, pass ownerAddr so personal minter triggers Payback to issuer's FI wallet;
    // otherwise pass null (or ownerAddr for regular FI where it acts as responseAddress).
    const responseAddress = isFi ? ownerAddr : isPayback ? ownerAddr : null;
    const payload = buildBurnBody(amountNano, responseAddress);

    await sendTx([
      {
        toAddress: targetWalletAddress.toString(),
        amount: gasValue,
        payload,
      },
    ]);
  }, [
    wallet,
    walletAddress,
    asset,
    amount,
    customGasTon,
    isFi,
    isPayback,
    network,
    sendTx,
  ]);

  const isDisabled = Boolean(validationError) || isSending;

  return { burn, isDisabled, isSending, error, validationError };
}
