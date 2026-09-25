/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { invalidateContractState } from '@/lib/brotherhood/queries';
import { getFiWalletAddress } from '@/lib/brotherhood/ton';
import { Address, Cell } from '@ton/core';
import { mnemonicToPrivateKey } from '@ton/crypto';
import { toast } from 'sonner';
import type {
  ITonWalletKit,
  Jetton,
  SendTransactionResponse,
  Wallet,
} from '@ton/walletkit';

import { useGaslessJettonSend } from './use-gasless-jetton-send';
import type { UseGaslessJettonSendResult } from './use-gasless-jetton-send';

import { parseUnits } from '@/core/utils/units';
import {
  useAuth,
  useWallet,
  useWalletStore,
  getChainNetwork,
} from '@demo/wallet-core';
import {
  encryptMessageComment,
  packBytesAsSnakeForEncryptedData,
} from '@/core/utils/encryption';
import { resolveRecipientPublicKey } from '@/core/storage/publicKeyCache';
import {
  createCommentPayloadBase64,
  createCommentPayload,
} from '@ton/walletkit';

const GRAM_DECIMALS = 9;

interface UseSendTokenParams {
  wallet: Wallet | null | undefined;
  walletKit: ITonWalletKit | null;
  tokenType: 'TON' | 'JETTON';
  /** Selected jetton when `tokenType === 'JETTON'`. */
  jetton: Jetton | undefined;
  recipient: string;
  amount: string;
  comment?: string;
  isEncrypted?: boolean;
}

export interface UseSendTokenResult {
  send: () => Promise<SendTransactionResponse | undefined>;
  isDisabled: boolean;
  gasless: UseGaslessJettonSendResult;
}

export const useSendToken = ({
  wallet,
  walletKit,
  tokenType,
  jetton,
  recipient,
  amount,
  comment = '',
  isEncrypted = false,
}: UseSendTokenParams): UseSendTokenResult => {
  const queryClient = useQueryClient();
  const { showFastSend, isUnlocked } = useAuth();
  const { getDecryptedMnemonic } = useWallet();
  const savedWallets = useWalletStore(
    (state) => state.walletManagement.savedWallets,
  );

  const gasless = useGaslessJettonSend({
    wallet,
    jetton: tokenType === 'JETTON' ? jetton : undefined,
    recipient,
    amount,
  });

  const { effective: gaslessEffective, send: gaslessSend } = gasless;

  const send = useCallback(async (): Promise<
    SendTransactionResponse | undefined
  > => {
    if (!wallet) throw new Error('No wallet available');

    // Gasless jetton transfer
    if (gaslessEffective && jetton) {
      return gaslessSend();
    }

    const senderAddress = wallet.getAddress();
    const net =
      String(wallet.getNetwork()?.chainId) === '-239' ? 'mainnet' : 'testnet';

    // Build comment payload (plain vs encrypted)
    let payloadCell: Cell | undefined;
    let payloadBase64: string | undefined;

    const trimmedComment = comment.trim();
    if (trimmedComment) {
      let didEncrypt = false;

      if (isEncrypted && senderAddress) {
        try {
          let tonClient: any;
          if (walletKit) {
            try {
              const targetNet = getChainNetwork(net || 'testnet');
              tonClient =
                typeof walletKit.getApiClient === 'function'
                  ? walletKit.getApiClient(targetNet)
                  : (walletKit as any).getClient?.();
            } catch {
              tonClient = undefined;
            }
          }
          const theirPublicKey = await resolveRecipientPublicKey(
            recipient,
            net,
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
                senderAddress.toString(),
              );
              payloadCell = packBytesAsSnakeForEncryptedData(encryptedBytes);
              payloadBase64 = payloadCell.toBoc().toString('base64');
              didEncrypt = true;
            }
          }
        } catch (err) {
          console.warn(
            '[useSendToken] Comment encryption failed, fallback to plain:',
            err,
          );
        }
      }

      if (!didEncrypt) {
        payloadCell = createCommentPayload(trimmedComment);
        payloadBase64 = createCommentPayloadBase64(trimmedComment);
      }
    }

    let sendResult: SendTransactionResponse | undefined;

    if (showFastSend && isUnlocked) {
      if (tokenType === 'TON') {
        const tx = await wallet.createTransferTonTransaction({
          recipientAddress: recipient,
          transferAmount: parseUnits(amount, GRAM_DECIMALS).toString(),
          payload: payloadBase64,
        });
        sendResult = await wallet.sendTransaction(tx);
      } else if (jetton) {
        const decimals = jetton.decimalsNumber;
        if (decimals == null) throw new Error('Jetton decimals not found');

        const tx = await wallet.createTransferJettonTransaction({
          recipientAddress: recipient,
          jettonAddress: jetton.address,
          transferAmount: parseUnits(amount, decimals).toString(),
          forwardPayload: payloadCell,
        });
        sendResult = await wallet.sendTransaction(tx);
      }
    } else {
      if (!walletKit) {
        toast.error('Cannot send transaction', {
          description: 'WalletKit is not initialized yet.',
        });
        throw new Error('WalletKit is not initialized');
      }

      if (tokenType === 'TON') {
        const tx = await wallet.createTransferTonTransaction({
          recipientAddress: recipient,
          transferAmount: parseUnits(amount, GRAM_DECIMALS).toString(),
          payload: payloadBase64,
        });
        await walletKit.handleNewTransaction(wallet, tx);
      } else if (jetton) {
        const decimals = jetton.decimalsNumber;
        if (decimals == null) throw new Error('Jetton decimals not found');

        const tx = await wallet.createTransferJettonTransaction({
          recipientAddress: recipient,
          jettonAddress: jetton.address,
          transferAmount: parseUnits(amount, decimals).toString(),
          forwardPayload: payloadCell,
        });
        await walletKit.handleNewTransaction(wallet, tx);
      }
    }

    if (senderAddress) {
      const scheduleRevalidation = (delayMs: number) => {
        setTimeout(async () => {
          try {
            await invalidateContractState(
              senderAddress.toString(),
              net,
              queryClient,
            );
            try {
              const userFiWallet = getFiWalletAddress(
                Address.parse(senderAddress.toString()),
                net,
              );
              await invalidateContractState(
                userFiWallet.toString(),
                net,
                queryClient,
              );
            } catch {
              // Ignore non-member wallet errors
            }
          } catch {
            // Ignore invalidation errors
          }
        }, delayMs);
      };

      scheduleRevalidation(2000);
      scheduleRevalidation(5000);
    }

    return sendResult;
  }, [
    wallet,
    walletKit,
    tokenType,
    jetton,
    recipient,
    amount,
    comment,
    isEncrypted,
    showFastSend,
    isUnlocked,
    gaslessEffective,
    gaslessSend,
    getDecryptedMnemonic,
    savedWallets,
    queryClient,
  ]);

  const isDisabled =
    !wallet ||
    !recipient ||
    !amount ||
    parseFloat(amount) <= 0 ||
    (gasless.effective && (gasless.isQuoting || !gasless.hasQuote));

  return {
    send,
    isDisabled,
    gasless,
  };
};
