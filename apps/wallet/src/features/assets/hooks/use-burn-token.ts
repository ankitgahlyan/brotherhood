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
import {
  useActiveJettons,
  useWallet,
  useWalletStore,
  getChainNetwork,
} from '@demo/wallet-core';
import {
  buildBurnBody,
  buildSwapTargetPayload,
  parseUnits,
} from '@/lib/brotherhood/deploy';
import { useBrotherhoodTransaction } from '@/features/brotherhood';
import {
  computePersonalWalletAddress,
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
import { FI_ADDRESS, type Network } from '@/lib/brotherhood/config';
import type { AssetRowData } from '../components/asset-row';

export const DEFAULT_BURN_GAS_TON = '0.6';

export interface UseBurnTokenParams {
  wallet: Wallet | null | undefined;
  walletKit: ITonWalletKit | null;
  walletAddress: string | null | undefined;
  asset: AssetRowData | null;
  amount: string;
  isPersonal?: boolean;
  isPayback?: boolean;
  paybackTargetAddress?: string | null;
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
  isPersonal: knownIsPersonal,
  isPayback = true,
  paybackTargetAddress = null,
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
  const activeJettons = useActiveJettons();
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
    const affectedContracts: (Address | string)[] = [];

    if (isFi) {
      // BrotherHood FI: targets the user's FossFiWallet
      targetWalletAddress = getFiWalletAddress(ownerAddr, network);
      affectedContracts.push(targetWalletAddress, FI_ADDRESS);
    } else {
      // For personal tokens and other Jettons, compute or resolve the user's token wallet
      let isPersonal = knownIsPersonal ?? false;
      if (knownIsPersonal === undefined) {
        try {
          const parsed = Address.parse(asset.id);
          isPersonal = await isPersonalMinterContract(parsed);
        } catch {
          isPersonal = false;
        }
      }

      if (isPersonal) {
        const minterAddr = Address.parse(asset.id);
        if (adminAddress) {
          targetWalletAddress = computePersonalWalletAddress(
            minterAddr,
            ownerAddr,
            Address.parse(adminAddress),
          );
        } else {
          targetWalletAddress = await getPersonalWalletAddress(
            minterAddr,
            ownerAddr,
            network,
          );
        }
        affectedContracts.push(
          targetWalletAddress,
          minterAddr,
          getFiWalletAddress(ownerAddr, network),
        );
        if (adminAddress) {
          try {
            affectedContracts.push(
              getFiWalletAddress(Address.parse(adminAddress), network),
            );
          } catch {
            // ignore
          }
        }
      } else {
        const matchingJetton = activeJettons.find((j) => {
          try {
            return Address.parse(j.address).equals(Address.parse(asset.id));
          } catch {
            return j.address === asset.id;
          }
        });
        const resolved =
          matchingJetton?.walletAddress ||
          (await wallet.getJettonWalletAddress(asset.id));
        if (!resolved) {
          throw new Error('Could not resolve Jetton wallet address');
        }
        targetWalletAddress = Address.parse(resolved);
        affectedContracts.push(targetWalletAddress, asset.id);
      }
    }

    // Build optional customPayload:
    // If payback with a specific target token (Reserve, other Personal token, etc.), pack target address.
    // Otherwise fallback to comment encryption for normal fiat off-ramp burns.
    let customPayload: Cell | null = null;
    const trimmedTargetAddress = paybackTargetAddress?.trim();
    if (isPayback && trimmedTargetAddress) {
      try {
        const targetOwnerAddr = Address.parse(trimmedTargetAddress);
        customPayload = buildSwapTargetPayload(targetOwnerAddr);
        affectedContracts.push(targetOwnerAddr);
      } catch (err) {
        console.warn(
          '[useBurnToken] Failed to parse payback target address:',
          err,
        );
      }
    } else {
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
                customPayload =
                  packBytesAsSnakeForEncryptedData(encryptedBytes);
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

    await sendTx(
      [
        {
          toAddress: targetWalletAddress.toString(),
          amount: gasValue,
          payload,
        },
      ],
      { affectedContracts },
    );
  }, [
    wallet,
    walletAddress,
    asset,
    amount,
    knownIsPersonal,
    activeJettons,
    comment,
    isEncrypted,
    adminAddress,
    customGasTon,
    isFi,
    isPayback,
    paybackTargetAddress,
    network,
    walletKit,
    savedWallets,
    getDecryptedMnemonic,
    sendTx,
  ]);

  const isDisabled = Boolean(validationError) || isSending;

  return { burn, isDisabled, isSending, error, validationError };
}
