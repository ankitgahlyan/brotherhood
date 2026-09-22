/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '@/core/components/ui/card';
import { Button } from '@/core/components/ui/button';
import { InputScan } from '@/core/components/ui/input-scan';
import {
  Clock,
  ShieldAlert,
  CheckCircle2,
  ArrowDownLeft,
  SlidersHorizontal,
  Copy,
  Layers,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { useWallet, useWalletKit, useBrotherhood } from '@demo/wallet-core';
import { formatTonAddress } from '@/core/utils/formatters';
import { useExplorer, getExplorerAddressUrl } from '@/core/explorer';
import type { Network } from '@/lib/brotherhood/config';
import type { FiAccountData } from '../hooks/use-fi-account';
import { useMemberProfiles } from '../hooks/use-member-profiles';
import {
  useRequestDeferredPayment,
  useCancelDeferredPayment,
  useClaimDeferredPayment,
  useToggleDeferredPayment,
} from '../hooks/use-deferred-payment';

interface DeferredPaymentTabProps {
  network: Network;
  accountData?: FiAccountData | null;
}

function formatRemainingTime(secondsRemaining: number): string {
  if (secondsRemaining <= 0) return 'Ready to claim';
  const hours = Math.floor(secondsRemaining / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  const seconds = secondsRemaining % 60;
  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s remaining`;
  }
  return `${seconds}s remaining`;
}

export const DeferredPaymentTab: React.FC<DeferredPaymentTabProps> = ({
  network,
  accountData,
}) => {
  const walletKit = useWalletKit();
  const { currentWallet, address } = useWallet();
  const { explorer } = useExplorer();
  const {
    pendingDeferred,
    addPendingDeferredPayment,
    removePendingDeferredPayment,
  } = useBrotherhood();

  // Mode: 'request' | 'pending' | 'manage'
  const [mode, setMode] = useState<'request' | 'pending' | 'manage'>('request');

  // Live timer tick every 10 seconds for countdown calculations
  const [nowSec, setNowSec] = useState<number>(() =>
    Math.floor(Date.now() / 1000),
  );
  useEffect(() => {
    const timer = setInterval(() => {
      setNowSec(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Request state
  const [payerAddress, setPayerAddress] = useState('');
  const [amount, setAmount] = useState('');

  // Manage state
  const [holdingAddress, setHoldingAddress] = useState('');

  // Action in flight id
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(
    null,
  );

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

  const isEnabled = Boolean(accountData?.allowDeferred);
  const toggleHook = useToggleDeferredPayment({
    wallet: currentWallet,
    walletKit,
    walletAddress: address ?? null,
    enabled: !isEnabled,
    network,
    accountData,
  });

  // Resolve profiles of counterparties in pending deferred list
  const counterpartyAddresses = useMemo(() => {
    return pendingDeferred.map((p) => p.counterpartyAddress);
  }, [pendingDeferred]);

  const memberProfiles = useMemberProfiles(counterpartyAddresses, network);
  const counterpartyProfiles = memberProfiles.data;

  const handleCopy = (text: string, label: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    }
  };

  const handleRequestSubmit = async () => {
    try {
      const res = await requestHook.send();
      if (address && res?.holdingAddress) {
        const currentTime = Math.floor(Date.now() / 1000);
        addPendingDeferredPayment(address, {
          id: res.holdingAddress.toString(),
          holdingAddress: res.holdingAddress.toString(),
          queryId: res.queryId.toString(),
          role: 'payee',
          amount: res.amount,
          counterpartyAddress: res.payerAddress,
          createdAt: currentTime,
          expiresAt: currentTime + 72 * 3600,
          status: 'pending',
        });
        toast.success('Deferred pull initiated! Tracking under Pending.');
        setPayerAddress('');
        setAmount('');
        setMode('pending');
      }
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Failed to request deferred payment';
      toast.error(msg);
    }
  };

  const handleClaimPending = async (itemHoldingAddress: string) => {
    if (!address) return;
    setActionInProgressId(itemHoldingAddress);
    try {
      await claimHook.send(itemHoldingAddress);
      removePendingDeferredPayment(address, itemHoldingAddress);
      toast.success('Funds successfully claimed!');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Claim failed';
      toast.error(msg);
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleCancelPending = async (itemHoldingAddress: string) => {
    if (!address) return;
    setActionInProgressId(itemHoldingAddress);
    try {
      await cancelHook.send(itemHoldingAddress);
      removePendingDeferredPayment(address, itemHoldingAddress);
      toast.success('Payment cancelled and disputed!');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Cancellation failed';
      toast.error(msg);
    } finally {
      setActionInProgressId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Feature Toggle / Permission Card */}
      <Card className="p-4 border space-y-2.5">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">
                Offline Pay Permission
              </span>
              <span
                className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  isEnabled
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-muted text-muted-foreground border'
                }`}
              >
                {isEnabled ? 'Enabled' : 'Disabled (Default)'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {isEnabled
                ? 'Your wallet allows other members to pull deferred payments from you.'
                : 'Deferred fund pulls from your wallet are blocked. Enable to allow offline payments.'}
            </p>
          </div>
          <Button
            size="sm"
            variant={isEnabled ? 'gray' : 'primary'}
            onClick={() => toggleHook.send()}
            disabled={toggleHook.isDisabled}
            className="text-xs shrink-0 cursor-pointer"
          >
            {toggleHook.isSending
              ? 'Updating...'
              : isEnabled
                ? 'Disable'
                : 'Enable'}
          </Button>
        </div>
        {toggleHook.error && (
          <p className="text-xs text-destructive">{toggleHook.error}</p>
        )}
      </Card>

      <Card className="p-4 bg-muted/40 border space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-semibold">
            Deferred Payments (Offline Pay)
          </h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Pay or receive FI even if the payer does not carry their signing
          device. Funds are held in a disposable Holding contract for 72 hours
          before being claimable by the payee. Payers can cancel fraudulent
          pulls within 72 hours to receive a full refund and penalize dishonest
          requesters.
        </p>

        {/* 3 Sub-tabs Navigation */}
        <div className="flex gap-2 pt-1">
          <Button
            size="sm"
            variant={mode === 'request' ? 'primary' : 'secondary'}
            onClick={() => setMode('request')}
            className="flex-1 text-xs cursor-pointer"
          >
            <ArrowDownLeft className="w-3.5 h-3.5 mr-1.5" />
            Request Pull
          </Button>
          <Button
            size="sm"
            variant={mode === 'pending' ? 'primary' : 'secondary'}
            onClick={() => setMode('pending')}
            className="flex-1 text-xs relative cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 mr-1.5" />
            Pending
            {pendingDeferred.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-primary text-primary-foreground">
                {pendingDeferred.length}
              </span>
            )}
          </Button>
          <Button
            size="sm"
            variant={mode === 'manage' ? 'primary' : 'secondary'}
            onClick={() => setMode('manage')}
            className="flex-1 text-xs cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5" />
            Manual
          </Button>
        </div>
      </Card>

      {/* Mode 1: Request Pull */}
      {mode === 'request' && (
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
              className="w-full cursor-pointer"
              disabled={requestHook.isDisabled}
              onClick={handleRequestSubmit}
            >
              {requestHook.isSending
                ? 'Initiating Pull...'
                : 'Request Deferred Payment'}
            </Button>
          </div>
        </Card>
      )}

      {/* Mode 2: Pending Payments List */}
      {mode === 'pending' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Active Deferred Payments</h4>
            <span className="text-xs text-muted-foreground">
              {pendingDeferred.length} active
            </span>
          </div>

          {pendingDeferred.length === 0 ? (
            <Card className="p-8 text-center border space-y-2">
              <div className="w-10 h-10 mx-auto rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-sm font-semibold">No Pending Payments</p>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                No active 72-hour timelocked deferred payments found for this
                wallet account.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {pendingDeferred.map((item) => {
                const isPayee = item.role === 'payee';
                const profile =
                  counterpartyProfiles?.[item.counterpartyAddress];
                const username =
                  item.counterpartyUsername || profile?.username || '';
                const remaining = item.expiresAt - nowSec;
                const canClaim = isPayee && remaining <= 0;
                const canCancel = !isPayee && remaining > 0;
                const isItemProcessing =
                  actionInProgressId === item.holdingAddress;

                return (
                  <Card
                    key={item.id}
                    className="p-4 border space-y-3 shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              isPayee
                                ? 'bg-primary/10 text-primary border-primary/20'
                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                            }`}
                          >
                            {isPayee
                              ? 'Incoming Pull (Receiving)'
                              : 'Outgoing Pull (Paying)'}
                          </span>
                          <span className="font-bold text-sm text-foreground">
                            {item.amount} FI
                          </span>
                        </div>

                        <div className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
                          <span>{isPayee ? 'Payer:' : 'Payee:'}</span>
                          {username ? (
                            <span className="font-semibold text-foreground">
                              @{username}
                            </span>
                          ) : null}
                          <span>
                            {formatTonAddress(item.counterpartyAddress, {
                              network,
                              shorten: true,
                              count: 4,
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Live 72h status pill */}
                      <div className="text-right shrink-0">
                        <span
                          className={`text-[11px] font-medium px-2 py-1 rounded-md flex items-center gap-1 ${
                            remaining <= 0
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              : 'bg-muted text-muted-foreground border'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          {formatRemainingTime(remaining)}
                        </span>
                      </div>
                    </div>

                    {/* Holding Contract Address with copy and explorer link */}
                    <div className="p-2 bg-muted/40 rounded-lg flex items-center justify-between gap-2 text-[11px]">
                      <div className="min-w-0 flex items-center gap-1.5">
                        <span className="text-muted-foreground shrink-0">
                          Holding:
                        </span>
                        <span className="font-mono truncate">
                          {formatTonAddress(item.holdingAddress, {
                            network,
                            shorten: true,
                            count: 5,
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            handleCopy(
                              item.holdingAddress,
                              'Holding Contract Address',
                            )
                          }
                          className="p-1 hover:text-foreground text-muted-foreground transition-colors cursor-pointer"
                          title="Copy Address"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        {explorer && (
                          <a
                            href={getExplorerAddressUrl(
                              network,
                              item.holdingAddress,
                              explorer,
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 hover:text-foreground text-muted-foreground transition-colors"
                            title="View on Explorer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Action button */}
                    {isPayee ? (
                      <Button
                        size="sm"
                        variant={canClaim ? 'primary' : 'gray'}
                        disabled={!canClaim || isItemProcessing}
                        onClick={() => handleClaimPending(item.holdingAddress)}
                        className="w-full text-xs font-semibold cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                        {isItemProcessing
                          ? 'Claiming FI...'
                          : canClaim
                            ? `Claim ${item.amount} FI`
                            : `Unlocks in ${formatRemainingTime(remaining)}`}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="danger"
                        disabled={!canCancel || isItemProcessing}
                        onClick={() => handleCancelPending(item.holdingAddress)}
                        className="w-full text-xs font-semibold cursor-pointer"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 mr-1.5" />
                        {isItemProcessing
                          ? 'Cancelling & Disputing...'
                          : `Cancel & Dispute (${formatRemainingTime(remaining)})`}
                      </Button>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Mode 3: Manual / Advanced */}
      {mode === 'manage' && (
        <Card className="p-4 space-y-4 border">
          <div className="space-y-1">
            <h4 className="text-sm font-medium">Manual Contract Recovery</h4>
            <p className="text-xs text-muted-foreground">
              Directly interact with a specific Holding Contract by address to
              claim unlocked funds or cancel fraudulent requests.
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
                className="w-full text-xs cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                {claimHook.isSending ? 'Claiming...' : 'Claim (After 72h)'}
              </Button>

              <Button
                variant="danger"
                disabled={cancelHook.isDisabled}
                onClick={() => cancelHook.send()}
                className="w-full text-xs cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5 mr-1.5" />
                {cancelHook.isSending ? 'Cancelling...' : 'Cancel & Dispute'}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
