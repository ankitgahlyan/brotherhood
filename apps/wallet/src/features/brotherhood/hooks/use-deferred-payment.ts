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
  buildFallbackReclaimBody,
  buildToggleDeferredPaymentBody,
  parseUnits,
} from '@/lib/brotherhood/deploy';
import { getFiWalletAddress } from '@/lib/brotherhood/ton';
import type { Network } from '@/lib/brotherhood/config';
import { useBrotherhoodTransaction, GAS } from './use-brotherhood-transaction';
import type { FiAccountData } from './use-fi-account';
import { getAccountActionError } from './use-is-network-member';

export interface UseRequestDeferredPaymentParams {
  wallet: Wallet | null | undefined;
  walletKit: ITonWalletKit | null;
  walletAddress: string | null;
  payerAddress: string;
  amount: string;
  network: Network;
  accountData?: FiAccountData | null;
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

  const send = useCallback(async () => {
    if (!walletAddress) throw new Error('No wallet address');
    const myOwnerAddr = Address.parse(walletAddress);
    const myFiWalletAddr = await getFiWalletAddress(myOwnerAddr, network);
    const payerOwnerAddr = Address.parse(payerAddress.trim());
    const amountNano = parseUnits(amount, 9);

    const payload = buildRequestDeferredPaymentBody({
      payer: payerOwnerAddr,
      amount: amountNano,
    });

    await sendTx([
      {
        toAddress: myFiWalletAddr.toString(),
        amount: GAS.DEFERRED_PAYMENT,
        payload,
      },
    ]);
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

  const send = useCallback(async () => {
    if (!walletAddress) throw new Error('No wallet address');
    const myOwnerAddr = Address.parse(walletAddress);
    const myFiWalletAddr = await getFiWalletAddress(myOwnerAddr, network);
    const targetHoldingAddr = Address.parse(holdingAddress.trim());

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
  }, [walletAddress, holdingAddress, network, sendTx]);

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

  const send = useCallback(async () => {
    if (!walletAddress) throw new Error('No wallet address');
    const myOwnerAddr = Address.parse(walletAddress);
    const myFiWalletAddr = await getFiWalletAddress(myOwnerAddr, network);
    const targetHoldingAddr = Address.parse(holdingAddress.trim());

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
  }, [walletAddress, holdingAddress, network, sendTx]);

  const isDisabled = Boolean(validationError) || isSending;
  return { send, isDisabled, isSending, error, validationError };
}

export function useFallbackReclaim({
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

  const send = useCallback(async () => {
    if (!walletAddress) throw new Error('No wallet address');
    const myOwnerAddr = Address.parse(walletAddress);
    const myFiWalletAddr = await getFiWalletAddress(myOwnerAddr, network);
    const targetHoldingAddr = Address.parse(holdingAddress.trim());

    const payload = buildFallbackReclaimBody({
      holdingAddress: targetHoldingAddr,
    });

    await sendTx([
      {
        toAddress: myFiWalletAddr.toString(),
        amount: GAS.DEFERRED_PAYMENT,
        payload,
      },
    ]);
  }, [walletAddress, holdingAddress, network, sendTx]);

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
