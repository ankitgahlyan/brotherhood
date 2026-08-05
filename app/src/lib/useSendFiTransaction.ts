import { useCallback, useState } from 'react';
import type { TonConnectUI } from '@tonconnect/ui-react';
import type { Cell } from '@ton/core';
import { getErrorMessage, isCancelledTransactionError } from './errors';
import type { Network } from './config';

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
 * Single entry point for sending a TON Connect transaction from any tab.
 * Owns the `loading` / `status` pair so handlers no longer duplicate the
 * info -> success/error -> clear pattern and the error mapping.
 */
export function useSendFiTransaction(
  tonConnectUI: TonConnectUI,
  network: Network,
) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<SendStatus | null>(null);

  const sendTransaction = useCallback(
    async (params: SendFiTransactionParams) => {
      setLoading(true);
      setStatus({ type: 'info', message: 'Confirm in your wallet...' });

      try {
        await tonConnectUI.sendTransaction({
          validUntil: Math.floor(Date.now() / 1000) + 300,
          network: network === 'mainnet' ? '-239' : '-3',
          messages: params.messages.map((m) => ({
            address: m.address,
            amount: m.amount.toString(),
            payload: m.payload?.toBoc().toString('base64'),
            stateInit: m.stateInit?.toBoc().toString('base64'),
          })),
        });

        setStatus({ type: 'success', message: params.successMessage });
        params.onSuccess?.();
      } catch (err) {
        setStatus({
          type: 'error',
          message: isCancelledTransactionError(err)
            ? 'Transaction cancelled'
            : getErrorMessage(err) || params.fallbackError || 'Transaction failed',
        });
      } finally {
        setLoading(false);
        setStatus((prev) => (prev?.type === 'info' ? null : prev));
      }
    },
    [tonConnectUI, network],
  );

  return { sendTransaction, loading, status, setStatus };
}
