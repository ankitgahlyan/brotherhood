import { useState } from 'react';
import type { Cell } from '@ton/core';
import { loadStateInit } from '@ton/core';
import { getErrorMessage, isCancelledTransactionError } from './errors';
import type { Network } from './config';
import { useAppWallet } from '@/providers/WalletContext';

export interface SendStatus {
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface SendFiMessage {
  address: string;
  amount: bigint;
  payload?: Cell;
  stateInit?: Cell;
}

export interface SendFiTransactionParams {
  messages: SendFiMessage[];
  successMessage: string;
  fallbackError?: string;
  onSuccess?: () => void;
}

/**
 * Single entry point for sending in-app TON transactions from any tab.
 */
export function useSendFiTransaction(
  _ignoredTonConnectUI?: unknown,
  _ignoredNetwork?: Network
) {
  const wallet = useAppWallet();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<SendStatus | null>(null);

  const sendTransaction = async (params: SendFiTransactionParams) => {
    setLoading(true);
    setStatus({ type: 'info', message: 'Signing and broadcasting transaction...' });

    try {
      if (!wallet.isUnlocked) {
        throw new Error('Please create or unlock your TON wallet first.');
      }

      for (const m of params.messages) {
        await wallet.sendTransaction({
          to: m.address,
          value: m.amount,
          body: m.payload,
          stateInit: m.stateInit
            ? loadStateInit(m.stateInit.asSlice())
            : undefined,
        });
      }

      setStatus({ type: 'success', message: params.successMessage });
      params.onSuccess?.();
    } catch (err) {
      setStatus({
        type: 'error',
        message: isCancelledTransactionError(err)
          ? 'Transaction cancelled'
          : getErrorMessage(err) ||
            params.fallbackError ||
            'Transaction failed',
      });
    } finally {
      setLoading(false);
      setStatus((prev) => (prev?.type === 'info' ? null : prev));
    }
  };

  return { sendTransaction, loading, status, setStatus };
}
