/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useCallback, useMemo } from 'react';
import { Address, type Cell, toNano } from '@ton/core';
import { mnemonicToPrivateKey } from '@ton/crypto';
import {
  createCommentPayload,
  type ITonWalletKit,
  type Wallet,
} from '@ton/walletkit';
import { useWallet, useWalletStore, getChainNetwork } from '@demo/wallet-core';
import { buildBurnBody, parseUnits } from '@/lib/brotherhood/deploy';
import { useBrotherhoodTransaction } from '@/features/brotherhood';
import {
  getFiWalletAddress,
  getPersonalWalletAddress,
  isPersonalMinterContract,
} from '@/lib/brotherhood/ton';
import { isFiJetton } from '@/features/jettons';
import {
  encryptMessageComment,
  packBytesAsSnakeForEncryptedData,
} from '@/core/utils/encryption';
import { resolveRecipientPublicKey } from '@/core/storage/publicKeyCache';
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
  comment?: string;
  isEncrypted?: boolean;
  adminAddress?: string | null;
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
  comment = '',
  isEncrypted = true,
  adminAddress = null,
  customGasTon = DEFAULT_BURN_GAS_TON,
  network = 'testnet',
}: UseBurnTokenParams): UseBurnTokenResult {
  const {
    send: sendTx,
    isSending,
    error,
  } = useBrotherhoodTransaction(wallet, walletKit);
  const { getDecryptedMnemonic } = useWallet();
  const savedWallets = useWalletStore(
    (state) => state.walletManagement.savedWallets,
  );

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

    // Build optional customPayload for normal burn (e.g. encrypted bank details for fiat off-ramp)
    let customPayload: Cell | null = null;
    const trimmedComment = comment.trim();
    if (!isFi && !isPayback && trimmedComment) {
      let didEncrypt = false;
      if (isEncrypted && adminAddress) {
        try {
          let tonClient: any;
          if (walletKit) {
            try {
              const targetNet = getChainNetwork(network);
              tonClient =
                typeof walletKit.getApiClient === 'function'
                  ? walletKit.getApiClient(targetNet)
                  : (walletKit as any).getClient?.();
            } catch {
              tonClient = undefined;
            }
          }
          const theirPublicKey = await resolveRecipientPublicKey(
            adminAddress,
            network,
            tonClient,
            savedWallets,
          );
          if (theirPublicKey) {
            const mnemonic = await getDecryptedMnemonic();
            if (mnemonic && mnemonic.length > 0) {
              const keyPair = await mnemonicToPrivateKey(mnemonic);
              const encryptedBytes = await encryptMessageComment(
                trimmedComment,
                keyPair.publicKey,
                theirPublicKey,
                keyPair.secretKey,
                walletAddress,
              );
              customPayload = packBytesAsSnakeForEncryptedData(encryptedBytes);
              didEncrypt = true;
            }
          }
        } catch (err) {
          console.warn(
            '[useBurnToken] Comment encryption failed, fallback to plain:',
            err,
          );
        }
      }
      if (!didEncrypt) {
        customPayload = createCommentPayload(trimmedComment);
      }
    }

    // Build AskToBurn payload
    // If payback, pass ownerAddr so personal minter triggers Payback to issuer's FI wallet;
    // otherwise pass null (or ownerAddr for regular FI where it acts as responseAddress).
    const responseAddress = isFi ? ownerAddr : isPayback ? ownerAddr : null;
    const payload = buildBurnBody(
      amountNano,
      responseAddress,
      0n,
      customPayload,
    );

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
    comment,
    isEncrypted,
    adminAddress,
    customGasTon,
    isFi,
    isPayback,
    network,
    walletKit,
    savedWallets,
    getDecryptedMnemonic,
    sendTx,
  ]);

  const isDisabled = Boolean(validationError) || isSending;

  return { burn, isDisabled, isSending, error, validationError };
}
