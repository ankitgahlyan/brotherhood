/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState } from 'react';
import { Card } from '@/core/components/ui/card';
import { Button } from '@/core/components/ui/button';
import { InputScan } from '@/core/components/ui/input-scan';
import {
  Clock,
  ShieldAlert,
  CheckCircle2,
  ArrowDownLeft,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import { useWallet, useWalletKit } from '@demo/wallet-core';
import type { Network } from '@/lib/brotherhood/config';
import type { FiAccountData } from '../hooks/use-fi-account';
import {
  useRequestDeferredPayment,
  useCancelDeferredPayment,
  useClaimDeferredPayment,
  useFallbackReclaim,
} from '../hooks/use-deferred-payment';

interface DeferredPaymentTabProps {
  network: Network;
  accountData?: FiAccountData | null;
}

export const DeferredPaymentTab: React.FC<DeferredPaymentTabProps> = ({
  network,
  accountData,
}) => {
  const walletKit = useWalletKit();
  const { currentWallet, address } = useWallet();

  // Mode: 'request' | 'claim' | 'cancel' | 'fallback'
  const [mode, setMode] = useState<'request' | 'manage'>('request');

  // Request state
  const [payerAddress, setPayerAddress] = useState('');
  const [amount, setAmount] = useState('');

  // Manage state
  const [holdingAddress, setHoldingAddress] = useState('');

  const requestHook = useRequestDeferredPayment({
    wallet: currentWallet,
    walletKit,
    walletAddress: address ?? null,
    payerAddress,
    amount,
    network,
    accountData,
  });

  const cancelHook = useCancelDeferredPayment({
    wallet: currentWallet,
    walletKit,
    walletAddress: address ?? null,
    holdingAddress,
    network,
    accountData,
  });

  const claimHook = useClaimDeferredPayment({
    wallet: currentWallet,
    walletKit,
    walletAddress: address ?? null,
    holdingAddress,
    network,
    accountData,
  });

  const fallbackHook = useFallbackReclaim({
    wallet: currentWallet,
    walletKit,
    walletAddress: address ?? null,
    holdingAddress,
    network,
    accountData,
  });

  return (
    <div className="space-y-6">
      <Card className="p-4 bg-muted/40 border space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-semibold">
            Deferred Payments (Offline Pay)
          </h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Pay or receive FI even if the payer does not have their wallet device.
          Funds are escrowed in a disposable Holding contract for 72 hours
          before being claimed by the payee. Payers can cancel fraudulent pulls
          within 72 hours to receive a full refund and penalize dishonest
          requesters.
        </p>

        <div className="flex gap-2 pt-1">
          <Button
            size="sm"
            variant={mode === 'request' ? 'primary' : 'secondary'}
            onClick={() => setMode('request')}
            className="flex-1 text-xs"
          >
            <ArrowDownLeft className="w-3.5 h-3.5 mr-1.5" />
            Request Pull (Payee)
          </Button>
          <Button
            size="sm"
            variant={mode === 'manage' ? 'primary' : 'secondary'}
            onClick={() => setMode('manage')}
            className="flex-1 text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Claim / Dispute
          </Button>
        </div>
      </Card>

      {mode === 'request' ? (
        <Card className="p-4 space-y-4 border">
          <div className="space-y-1">
            <h4 className="text-sm font-medium">Request Deferred Payment</h4>
            <p className="text-xs text-muted-foreground">
              Pull FI tokens from a member without requiring their device
              present.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Payer Member Address
              </label>
              <InputScan
                placeholder="Enter payer TON address"
                value={payerAddress}
                onChange={setPayerAddress}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Amount (FI)
              </label>
              <input
                type="number"
                step="any"
                min="0"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-md border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {requestHook.validationError && (
              <p className="text-xs text-destructive">
                {requestHook.validationError}
              </p>
            )}

            <Button
              className="w-full"
              disabled={requestHook.isDisabled}
              onClick={() => requestHook.send()}
            >
              {requestHook.isSending
                ? 'Initiating Pull...'
                : 'Request Deferred Payment'}
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="p-4 space-y-4 border">
          <div className="space-y-1">
            <h4 className="text-sm font-medium">Manage Deferred Payment</h4>
            <p className="text-xs text-muted-foreground">
              Claim unlocked funds after 72 hours, cancel fraudulent requests,
              or recover abandoned payments.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Holding Contract Address
              </label>
              <InputScan
                placeholder="Enter Holding contract address"
                value={holdingAddress}
                onChange={setHoldingAddress}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              <Button
                variant="primary"
                disabled={claimHook.isDisabled}
                onClick={() => claimHook.send()}
                className="w-full text-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                {claimHook.isSending ? 'Claiming...' : 'Claim (After 72h)'}
              </Button>

              <Button
                variant="danger"
                disabled={cancelHook.isDisabled}
                onClick={() => cancelHook.send()}
                className="w-full text-xs"
              >
                <ShieldAlert className="w-3.5 h-3.5 mr-1.5" />
                {cancelHook.isSending ? 'Cancelling...' : 'Cancel & Dispute'}
              </Button>
            </div>

            <div className="pt-2 border-t">
              <Button
                variant="ghost"
                disabled={fallbackHook.isDisabled}
                onClick={() => fallbackHook.send()}
                className="w-full text-xs text-muted-foreground hover:text-foreground"
              >
                <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
                {fallbackHook.isSending
                  ? 'Reclaiming...'
                  : 'Fallback Reclaim (After 30 Days)'}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
