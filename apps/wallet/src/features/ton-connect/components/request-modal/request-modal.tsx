/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useEffect, useMemo, useState } from 'react';
import type {
  SendTransactionRequestEvent,
  SignMessageRequestEvent,
  TransactionEmulatedPreview,
} from '@ton/walletkit';
import { useAuth, useWalletKit, useWalletStore } from '@demo/wallet-core';
import type { SavedWallet } from '@demo/wallet-core';
import { toast } from 'sonner';

import { DappRequestModal } from '../dapp-request-modal';
import { WalletPlate } from '../wallet-plate';

import { Button } from '@/core/components/ui/button';
import { HoldToSignButton } from '@/core/components/ui/hold-to-sign-button';
import { SlideToSignButton } from '@/core/components/ui/slide-to-sign-button';
import { JettonFlow } from '@/features/jettons';
import { createComponentLogger } from '@/core/lib/logger';
import { useNowSeconds } from '@/core/hooks';

type RequestEvent = SendTransactionRequestEvent | SignMessageRequestEvent;

interface RequestModalProps {
  request: RequestEvent;
  savedWallets: SavedWallet[];
  isOpen: boolean;
  verb: string;
  subtitle: string;
  details?: React.ReactNode;
  approveLabel: string;
  disclaimer: React.ReactNode;
  testIds: { approve: string; reject: string };
  /** Distinguishes the request type for tests (e.g. "transaction-request"). */
  modalTestId: string;
  onApprove: () => Promise<void>;
  onReject: () => void;
  loggerName: string;
  previewMode: 'send' | 'sign';
}

/** Shared shell for transaction / sign-message requests, built on {@link DappRequestModal}. */
export const RequestModal: React.FC<RequestModalProps> = ({
  request,
  savedWallets,
  isOpen,
  verb,
  subtitle,
  details,
  approveLabel,
  disclaimer,
  testIds,
  modalTestId,
  onApprove,
  onReject,
  loggerName,
  previewMode,
}) => {
  const walletKit = useWalletKit();
  const isAuthenticated = useWalletStore(
    (state) => state.walletManagement.isAuthenticated,
  );
  const { holdToSign, slideToSign } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (prevIsOpen !== isOpen) {
    setPrevIsOpen(isOpen);
    if (!isOpen) {
      setIsLoading(false);
    }
  }

  const now = useNowSeconds();
  const validUntil = request.request?.validUntil;
  const isExpired = Boolean(validUntil && validUntil < now);

  const [localPreview, setLocalPreview] = useState<
    TransactionEmulatedPreview | undefined
  >(undefined);

  const log = useMemo(() => createComponentLogger(loggerName), [loggerName]);

  const currentWallet = useMemo(
    () =>
      request.walletAddress
        ? (savedWallets.find((w) => w.kitWalletId === request.walletId) ?? null)
        : null,
    [savedWallets, request.walletAddress, request.walletId],
  );

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    async function updatePreview() {
      if (request.preview.data) return;
      await walletKit?.ensureInitialized();
      const preview = await walletKit
        ?.getWallet(request.walletId ?? '')
        ?.getTransactionPreview(request.request, { mode: previewMode });
      if (!cancelled) {
        setLocalPreview(preview);
      }
    }
    updatePreview();
    return () => {
      cancelled = true;
    };
  }, [
    request.walletId,
    request.request,
    request.preview,
    walletKit,
    isAuthenticated,
    previewMode,
  ]);

  const preview = useMemo(
    () => localPreview ?? request.preview.data,
    [request, localPreview],
  );

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      await onApprove();
    } catch (error) {
      log.error(`Failed to approve ${loggerName}:`, error);
      toast.error('Failed to approve request', {
        description: (error as Error)?.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const hasNoTransfers =
    preview?.moneyFlow?.outputs === '0' &&
    preview?.moneyFlow?.inputs === '0' &&
    preview?.moneyFlow?.ourTransfers.length === 0;

  const activeWalletId = useWalletStore(
    (state) => state.walletManagement.activeWalletId,
  );
  const activeAddress = useWalletStore(
    (state) => state.walletManagement.address,
  );
  const activeBalance = useWalletStore(
    (state) => state.walletManagement.balance,
  );
  const balancesByAddress = useWalletStore(
    (state) => state.walletManagement.balancesByAddress,
  );

  const isWatchOnly = useMemo(() => {
    const target =
      currentWallet ??
      savedWallets.find((w) => w.id === activeWalletId) ??
      null;
    return target?.walletType === 'watch-only' || Boolean(target?.isWatchOnly);
  }, [currentWallet, savedWallets, activeWalletId]);

  const requestMessages = request.request?.messages;
  const requestWalletAddress =
    request.walletAddress ?? currentWallet?.address ?? activeAddress ?? '';

  const insufficientBalanceWarning = useMemo(() => {
    if (previewMode !== 'send' || !requestMessages?.length) return null;
    const minNeededNano = requestMessages.reduce((acc, msg) => {
      try {
        return acc + BigInt(msg.amount || '0');
      } catch {
        return acc;
      }
    }, 0n);
    if (minNeededNano <= 0n) return null;

    const walletBalStr: string | undefined =
      (requestWalletAddress && balancesByAddress?.[requestWalletAddress]) ??
      (requestWalletAddress &&
      activeAddress &&
      requestWalletAddress === activeAddress
        ? (activeBalance ?? undefined)
        : undefined);

    if (walletBalStr === undefined) return null;
    try {
      const balNano = BigInt(walletBalStr);
      if (balNano < minNeededNano) {
        const neededGram = (Number(minNeededNano) / 1e9)
          .toFixed(4)
          .replace(/\.?0+$/, '');
        const availGram = (Number(balNano) / 1e9)
          .toFixed(4)
          .replace(/\.?0+$/, '');
        return `Insufficient GRAM balance: requires ${neededGram} GRAM, available ${availGram} GRAM.`;
      }
    } catch {
      /* ignore */
    }
    return null;
  }, [
    previewMode,
    requestMessages,
    requestWalletAddress,
    balancesByAddress,
    activeAddress,
    activeBalance,
  ]);

  const primary = isWatchOnly ? (
    <Button fullWidth disabled data-testid={testIds.approve}>
      Watch-Only (Sending Disabled)
    </Button>
  ) : isExpired ? (
    <Button fullWidth disabled data-testid={testIds.approve}>
      Expired
    </Button>
  ) : slideToSign ? (
    <SlideToSignButton
      onComplete={handleApprove}
      loading={isLoading}
      disabled={isLoading}
      idleLabel={approveLabel}
      completeLabel="Signed!"
      testId={testIds.approve}
    />
  ) : holdToSign ? (
    <HoldToSignButton
      onComplete={handleApprove}
      loading={isLoading}
      disabled={isLoading}
      holdDuration={3000}
    />
  ) : (
    <Button
      fullWidth
      onClick={handleApprove}
      loading={isLoading}
      disabled={isLoading}
      data-testid={testIds.approve}
    >
      {approveLabel}
    </Button>
  );

  return (
    <DappRequestModal
      isOpen={isOpen}
      testId={modalTestId}
      dAppInfo={request.dAppInfo}
      domain={request.domain}
      verb={verb}
      subtitle={subtitle}
      walletSlot={
        currentWallet ? (
          <WalletPlate
            name={currentWallet.name}
            address={request.walletAddress ?? currentWallet.address}
          />
        ) : null
      }
      primary={primary}
      onReject={onReject}
      rejectDisabled={isLoading}
      rejectTestId={testIds.reject}
      disclaimer={disclaimer}
    >
      {isExpired ? (
        <div className="rounded-2xl bg-orange-50 p-4 text-sm text-orange-800">
          This request has expired and can no longer be signed. Reject it and
          request a new one from the dApp.
        </div>
      ) : (
        <>
          {insufficientBalanceWarning && (
            <div className="rounded-2xl bg-amber-500/15 border border-amber-500/30 p-3 text-xs font-medium text-amber-600 dark:text-amber-400">
              {insufficientBalanceWarning}
            </div>
          )}
          {details}
          {preview?.result === 'success' && !hasNoTransfers && (
            <JettonFlow transfers={preview.moneyFlow?.ourTransfers ?? []} />
          )}
          {preview && (preview.result === 'failure' || preview.error) && (
            <div className="rounded-2xl bg-red-50 p-3 text-sm text-red-800">
              <strong>Error:</strong> {preview.error?.message}
            </div>
          )}
        </>
      )}
    </DappRequestModal>
  );
};
