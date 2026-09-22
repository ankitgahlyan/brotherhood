/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useCallback, useMemo } from 'react';
import { Address } from '@ton/core';
import type { ITonWalletKit, Wallet } from '@ton/walletkit';
import {
  buildRequestDeferredPaymentBody,
  buildCancelDeferredPaymentBody,
  buildClaimDeferredPaymentBody,
  buildToggleDeferredPaymentBody,
  calculateHoldingAddress,
  parseUnits,
} from '@/lib/brotherhood/deploy';
import { getFiWalletAddress } from '@/lib/brotherhood/ton';
import type { Network } from '@/lib/brotherhood/config';
import { useBrotherhoodTransaction, GAS } from './use-brotherhood-transaction';
import type { FiAccountData } from './use-fi-account';
import { getAccountActionError } from './use-is-network-member';

export function generateDeferredQueryId(): bigint {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const buffer = new Uint8Array(8);
    crypto.getRandomValues(buffer);
    let hex = '';
    for (const b of buffer) {
      hex += b.toString(16).padStart(2, '0');
    }
    const raw = BigInt('0x' + hex) & 0x7fffffffffffffffn;
    return raw === 0n ? 1n : raw;
  }
  return BigInt(Date.now());
}

export interface UseRequestDeferredPaymentParams {
  wallet: Wallet | null | undefined;
  walletKit: ITonWalletKit | null;
  walletAddress: string | null;
  payerAddress: string;
  amount: string;
  network: Network;
  accountData?: FiAccountData | null;
}

export interface DeferredPaymentRequestResult {
  queryId: bigint;
  holdingAddress: Address;
  amount: string;
  payerAddress: string;
}

export function useRequestDeferredPayment({
  wallet,
  walletKit,
  walletAddress,
  payerAddress,
  amount,
  network,
  accountData,
}: UseRequestDeferredPaymentParams) {
  const {
    send: sendTx,
    isSending,
    error,
  } = useBrotherhoodTransaction(wallet, walletKit);

  const validationError = useMemo<string | null>(() => {
    if (!wallet || !walletAddress) return 'Connect wallet first';
    const actionErr = getAccountActionError(accountData);
    if (actionErr) return actionErr;
    if (!payerAddress.trim()) return 'Enter payer member address';
    try {
      Address.parse(payerAddress.trim());
    } catch {
      return 'Invalid payer address';
    }
    if (!amount || parseFloat(amount) <= 0) return 'Enter amount to request';
    return null;
  }, [wallet, walletAddress, accountData, payerAddress, amount]);

  const send = useCallback(async (): Promise<DeferredPaymentRequestResult> => {
    if (!walletAddress) throw new Error('No wallet address');
    const myOwnerAddr = Address.parse(walletAddress);
    const myFiWalletAddr = await getFiWalletAddress(myOwnerAddr, network);
    const payerOwnerAddr = Address.parse(payerAddress.trim());
    const payerFiWalletAddr = await getFiWalletAddress(payerOwnerAddr, network);
    const amountNano = parseUnits(amount, 9);
    const queryId = generateDeferredQueryId();

    const holdingAddr = calculateHoldingAddress({
      payer: payerFiWalletAddr,
      payee: myFiWalletAddr,
      amount: amountNano,
      queryId,
    });

    const payload = buildRequestDeferredPaymentBody({
      payer: payerOwnerAddr,
      amount: amountNano,
      queryId,
    });

    await sendTx([
      {
        toAddress: myFiWalletAddr.toString(),
        amount: GAS.DEFERRED_PAYMENT,
        payload,
      },
    ]);

    return {
      queryId,
      holdingAddress: holdingAddr,
      amount,
      payerAddress: payerAddress.trim(),
    };
  }, [walletAddress, payerAddress, amount, network, sendTx]);

  const isDisabled = Boolean(validationError) || isSending;
  return { send, isDisabled, isSending, error, validationError };
}

export interface UseCancelDeferredPaymentParams {
  wallet: Wallet | null | undefined;
  walletKit: ITonWalletKit | null;
  walletAddress: string | null;
  holdingAddress: string;
  network: Network;
  accountData?: FiAccountData | null;
}

export function useCancelDeferredPayment({
  wallet,
  walletKit,
  walletAddress,
  holdingAddress,
  network,
  accountData,
}: UseCancelDeferredPaymentParams) {
  const {
    send: sendTx,
    isSending,
    error,
  } = useBrotherhoodTransaction(wallet, walletKit);

  const validationError = useMemo<string | null>(() => {
    if (!wallet || !walletAddress) return 'Connect wallet first';
    const actionErr = getAccountActionError(accountData);
    if (actionErr) return actionErr;
    if (!holdingAddress.trim()) return 'Enter holding contract address';
    try {
      Address.parse(holdingAddress.trim());
    } catch {
      return 'Invalid holding address';
    }
    return null;
  }, [wallet, walletAddress, accountData, holdingAddress]);

  const send = useCallback(
    async (targetAddr?: string) => {
      if (!walletAddress) throw new Error('No wallet address');
      const myOwnerAddr = Address.parse(walletAddress);
      const myFiWalletAddr = await getFiWalletAddress(myOwnerAddr, network);
      const addrToCancel = (targetAddr || holdingAddress).trim();
      const targetHoldingAddr = Address.parse(addrToCancel);

      const payload = buildCancelDeferredPaymentBody({
        holdingAddress: targetHoldingAddr,
      });

      await sendTx([
        {
          toAddress: myFiWalletAddr.toString(),
          amount: GAS.DEFERRED_PAYMENT,
          payload,
        },
      ]);
    },
    [walletAddress, holdingAddress, network, sendTx],
  );

  const isDisabled = Boolean(validationError) || isSending;
  return { send, isDisabled, isSending, error, validationError };
}

export interface UseClaimDeferredPaymentParams {
  wallet: Wallet | null | undefined;
  walletKit: ITonWalletKit | null;
  walletAddress: string | null;
  holdingAddress: string;
  network: Network;
  accountData?: FiAccountData | null;
}

export function useClaimDeferredPayment({
  wallet,
  walletKit,
  walletAddress,
  holdingAddress,
  network,
  accountData,
}: UseClaimDeferredPaymentParams) {
  const {
    send: sendTx,
    isSending,
    error,
  } = useBrotherhoodTransaction(wallet, walletKit);

  const validationError = useMemo<string | null>(() => {
    if (!wallet || !walletAddress) return 'Connect wallet first';
    const actionErr = getAccountActionError(accountData);
    if (actionErr) return actionErr;
    if (!holdingAddress.trim()) return 'Enter holding contract address';
    try {
      Address.parse(holdingAddress.trim());
    } catch {
      return 'Invalid holding address';
    }
    return null;
  }, [wallet, walletAddress, accountData, holdingAddress]);

  const send = useCallback(
    async (targetAddr?: string) => {
      if (!walletAddress) throw new Error('No wallet address');
      const myOwnerAddr = Address.parse(walletAddress);
      const myFiWalletAddr = await getFiWalletAddress(myOwnerAddr, network);
      const addrToClaim = (targetAddr || holdingAddress).trim();
      const targetHoldingAddr = Address.parse(addrToClaim);

      const payload = buildClaimDeferredPaymentBody({
        holdingAddress: targetHoldingAddr,
      });

      await sendTx([
        {
          toAddress: myFiWalletAddr.toString(),
          amount: GAS.DEFERRED_PAYMENT,
          payload,
        },
      ]);
    },
    [walletAddress, holdingAddress, network, sendTx],
  );

  const isDisabled = Boolean(validationError) || isSending;
  return { send, isDisabled, isSending, error, validationError };
}

export interface UseToggleDeferredPaymentParams {
  wallet: Wallet | null | undefined;
  walletKit: ITonWalletKit | null;
  walletAddress: string | null;
  enabled: boolean;
  network: Network;
  accountData?: FiAccountData | null;
}

export function useToggleDeferredPayment({
  wallet,
  walletKit,
  walletAddress,
  enabled,
  network,
  accountData,
}: UseToggleDeferredPaymentParams) {
  const {
    send: sendTx,
    isSending,
    error,
  } = useBrotherhoodTransaction(wallet, walletKit);

  const validationError = useMemo<string | null>(() => {
    if (!wallet || !walletAddress) return 'Connect wallet first';
    const actionErr = getAccountActionError(accountData);
    if (actionErr) return actionErr;
    return null;
  }, [wallet, walletAddress, accountData]);

  const send = useCallback(async () => {
    if (!walletAddress) throw new Error('No wallet address');
    const myOwnerAddr = Address.parse(walletAddress);
    const myFiWalletAddr = await getFiWalletAddress(myOwnerAddr, network);

    const payload = buildToggleDeferredPaymentBody({
      enabled,
    });

    await sendTx([
      {
        toAddress: myFiWalletAddr.toString(),
        amount: GAS.DEFERRED_PAYMENT,
        payload,
      },
    ]);
  }, [walletAddress, enabled, network, sendTx]);

  const isDisabled = Boolean(validationError) || isSending;
  return { send, isDisabled, isSending, error, validationError };
}
