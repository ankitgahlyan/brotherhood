/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from '@/core/routing';
import { isValidAddress } from '@ton/walletkit';
import type { TONTransferRequest } from '@ton/walletkit';
import {
  useAuth,
  useWallet,
  useWalletKit,
  getTransactionExplorerUrls,
} from '@demo/wallet-core';
import { toast } from 'sonner';
import { useExplorer } from '@/core/explorer';
import { useFormatAddress } from '@/core/utils/formatters';
import { isOnline } from '@/core/lib/network-status';
import { parseUnits } from '@/core/utils/units';

import { useSendToken } from '../../hooks/use-send-token';
import { useSendTokens } from '../../hooks/use-send-tokens';
import { useSpendAllowance } from '@/features/brotherhood/hooks/use-spend-allowance';
import { useAllowanceBalance } from '../../hooks/use-allowance-balance';
import { TokenSelectButton } from '../token-select-button';
import { TokenSelectModal } from '../token-select-modal';
import { AmountField } from '../amount-field';
import { RecipientField } from '../recipient-field';
import { SenderField, type SenderMode } from '../sender-field';
import { RecentTransactedList } from '../recent-transacted-list';
import {
  addRecentTransacted,
  getCachedAddressByUsername,
} from '../../lib/contact-storage';
import { isFiJetton } from '@/features/jettons';
import { FI_ADDRESS } from '@/lib/brotherhood/config';
import type { TokenOption } from '../../types';

import { Button } from '@/core/components/ui/button';
import { NewLayout } from '@/core/components/shared/new-layout';
import { ScreenHeader } from '@/core/components/shared/screen-header';
import { createComponentLogger } from '@/core/lib/logger';

const log = createComponentLogger('SendTransaction');

export const SendTransaction: React.FC = () => {
  const navigate = useNavigate();
  const walletKit = useWalletKit();
  const { currentWallet, address, savedWallets, activeWalletId } = useWallet();
  const { showFastSend } = useAuth();
  const network =
    savedWallets.find((w) => w.id === activeWalletId)?.network ?? 'testnet';

  const [selectedId, setSelectedId] = useState('HD');
  const [recipient, setRecipient] = useState('');
  const [effectiveRecipientAddress, setEffectiveRecipientAddress] = useState<
    string | null
  >(null);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);

  const [senderMode, setSenderMode] = useState<SenderMode>('self');
  const [granterInput, setGranterInput] = useState('');

  const options = useSendTokens();
  const selected =
    options.find((option) => option.id === selectedId) ?? options[0];

  const isFiToken =
    selected.id === 'FI' ||
    selected.id === FI_ADDRESS ||
    selected.symbol === 'FI' ||
    (selected.token.type === 'JETTON' && isFiJetton(selected.token.data));

  const resolvedGranterAddress = useMemo(() => {
    if (senderMode !== 'other') return null;
    const trimmed = granterInput.trim();
    if (isValidAddress(trimmed)) return trimmed;
    if (trimmed.startsWith('@') || /^[a-zA-Z0-9_]{3,32}$/.test(trimmed)) {
      return getCachedAddressByUsername(trimmed.replace(/^@+/, ''), network);
    }
    return null;
  }, [senderMode, granterInput, network]);

  const {
    allowance,
    formattedAllowance,
    isLoading: isAllowanceLoading,
  } = useAllowanceBalance({
    granterOwnerAddress: senderMode === 'other' ? resolvedGranterAddress : null,
    userWalletAddress: address,
    network: network === 'mainnet' ? 'mainnet' : 'testnet',
  });

  const spendAllowance = useSpendAllowance({
    wallet: currentWallet,
    walletKit,
    walletAddress: address ?? null,
    granterAddress: resolvedGranterAddress ?? '',
    receiver: effectiveRecipientAddress ?? recipient,
    amount,
    network: network === 'mainnet' ? 'mainnet' : 'testnet',
  });

  const sender = useSendToken({
    wallet: currentWallet,
    walletKit,
    tokenType: selected.token.type,
    jetton: selected.token.data,
    recipient: effectiveRecipientAddress ?? recipient,
    amount,
  });
  const gasless = sender.gasless;
  const effectiveGasless = gasless.effective;

  // Success toast with explorer links — for flows that return a broadcast hash
  // immediately (gasless send, fast send).
  const { explorer } = useExplorer();
  const notifySent = (normalizedHash: string) => {
    const { tonScan, tonViewer } = getTransactionExplorerUrls(
      normalizedHash,
      network,
    );
    const primaryUrl = explorer === 'tonviewer' ? tonViewer : tonScan;
    const primaryLabel = explorer === 'tonviewer' ? 'TonViewer' : 'TonScan';
    const secondaryUrl = explorer === 'tonviewer' ? tonScan : tonViewer;
    const secondaryLabel = explorer === 'tonviewer' ? 'TonScan' : 'TonViewer';

    toast.success('Transaction is sent to the network', {
      description: (
        <span className="flex gap-3 mt-1 text-xs">
          <a
            href={primaryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-semibold underline"
          >
            {primaryLabel} (Preferred)
          </a>
          <a
            href={secondaryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground underline"
          >
            {secondaryLabel}
          </a>
        </span>
      ),
    });
  };

  const handleSelectToken = (option: TokenOption) => {
    setSelectedId(option.id);
    setAmount('');
    setError('');
    setShowTokenModal(false);
    const isNewFi =
      option.id === 'FI' ||
      option.id === FI_ADDRESS ||
      option.symbol === 'FI' ||
      (option.token.type === 'JETTON' && isFiJetton(option.token.data));
    if (!isNewFi) {
      setSenderMode('self');
    }
  };

  const { formatWalletAddress } = useFormatAddress();

  const handleSendToSelf = () => {
    if (address) {
      setRecipient(formatWalletAddress(address, false));
      setEffectiveRecipientAddress(address);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isOnline()) {
      toast.error('Cannot send transactions while offline');
      setError('Cannot send transactions while offline');
      return;
    }

    setIsLoading(true);

    try {
      const targetRecipient = (effectiveRecipientAddress || recipient).trim();
      if (!isValidAddress(targetRecipient)) {
        throw new Error('Invalid recipient address');
      }

      const inputAmount = parseFloat(amount);
      if (!(inputAmount > 0)) {
        throw new Error('Amount must be greater than 0');
      }

      if (senderMode === 'self') {
        if (inputAmount > selected.balance) {
          throw new Error('Insufficient balance');
        }

        const result = await sender.send();
        addRecentTransacted({ address: targetRecipient }, network);
        if (result?.normalizedHash) {
          notifySent(result.normalizedHash);
          navigate('/wallet');
        } else {
          navigate('/wallet', {
            state: { message: `${selected.symbol} sent successfully!` },
          });
        }
      } else {
        // Spend allowance flow
        if (
          !resolvedGranterAddress ||
          !isValidAddress(resolvedGranterAddress)
        ) {
          throw new Error(
            'Please enter a valid granter Owner address or username',
          );
        }
        const amountNano = parseUnits(amount, 9);
        if (amountNano > allowance) {
          throw new Error(
            `Amount exceeds remaining allowance of ${formattedAllowance} FI`,
          );
        }

        await spendAllowance.send();
        addRecentTransacted({ address: targetRecipient }, network);
        navigate('/wallet', {
          state: { message: `Spent ${amount} FI from allowance successfully!` },
        });
      }
    } catch (err) {
      log.error('Send transaction error:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to send transaction',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFastSend = async () => {
    if (!currentWallet) return;
    const recipientAddress =
      (effectiveRecipientAddress || recipient).trim() || address;
    if (!recipientAddress) return;
    if (!isValidAddress(recipientAddress)) {
      setError('Invalid recipient address');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      let result;
      if (selected.token.type === 'TON') {
        const params: TONTransferRequest = {
          recipientAddress,
          transferAmount: '1000000',
        };
        const tx = await currentWallet.createTransferTonTransaction(params);
        result = await currentWallet.sendTransaction(tx);
      } else if (selected.token.data) {
        const tx = await currentWallet.createTransferJettonTransaction({
          recipientAddress,
          jettonAddress: selected.token.data.address,
          transferAmount: '1',
        });
        result = await currentWallet.sendTransaction(tx);
      }
      if (result?.normalizedHash) {
        addRecentTransacted({ address: recipientAddress }, network);
        notifySent(result.normalizedHash);
      }
    } catch (err) {
      log.error('Fast send error:', err);
      setError(err instanceof Error ? err.message : 'Failed to send');
    } finally {
      setIsLoading(false);
    }
  };

  const targetRecipient = (effectiveRecipientAddress || recipient).trim();
  const recipientError =
    targetRecipient.length > 0 && !isValidAddress(targetRecipient)
      ? 'Invalid address'
      : '';
  const granterError =
    senderMode === 'other' && granterInput.length > 0 && !resolvedGranterAddress
      ? 'Invalid granter address or username'
      : '';

  const isSpendAllowanceDisabled =
    !currentWallet ||
    !resolvedGranterAddress ||
    !targetRecipient ||
    !isValidAddress(targetRecipient) ||
    !amount ||
    parseFloat(amount) <= 0 ||
    (allowance > 0n && parseUnits(amount, 9) > allowance) ||
    isAllowanceLoading ||
    spendAllowance.isSending ||
    Boolean(granterError);

  const isSendDisabled =
    senderMode === 'other'
      ? isSpendAllowanceDisabled
      : sender.isDisabled || Boolean(recipientError);

  const isSendFastDisabled =
    !currentWallet || !address || senderMode === 'other';

  return (
    <NewLayout
      header={<ScreenHeader title="Send" onBack={() => navigate('/wallet')} />}
    >
      {!currentWallet ? (
        <div className="py-10 text-center">
          <p className="mb-3 text-sm text-gray-500">Loading wallet…</p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/wallet')}
          >
            Back to dashboard
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSend} className="space-y-6">
          <TokenSelectButton
            token={selected}
            onClick={() => setShowTokenModal(true)}
          />

          <AmountField value={amount} onChange={setAmount} token={selected} />

          {/* Sender field: only shown when sending FI */}
          {isFiToken && (
            <SenderField
              mode={senderMode}
              onModeChange={setSenderMode}
              granterInput={granterInput}
              onGranterInputChange={setGranterInput}
              resolvedGranterAddress={resolvedGranterAddress}
              allowance={allowance}
              formattedAllowance={formattedAllowance}
              isAllowanceLoading={isAllowanceLoading}
              userAddress={address ?? null}
              error={granterError}
            />
          )}

          <RecipientField
            value={recipient}
            onChange={(val) => {
              setRecipient(val);
              if (isValidAddress(val.trim())) {
                setEffectiveRecipientAddress(val.trim());
              }
            }}
            onResolvedAddressChange={setEffectiveRecipientAddress}
            error={recipientError}
            onUseMyAddress={address ? handleSendToSelf : undefined}
          />

          {/* Gasless fees feature - hidden for now, will be re-enabled in future */}
          {/* <GaslessOptions gasless={gasless} /> */}

          {error && <p className="text-center text-sm text-red-500">{error}</p>}

          <div className="space-y-2">
            <Button
              type="submit"
              fullWidth
              loading={
                isLoading ||
                (senderMode === 'self'
                  ? gasless.isSending
                  : spendAllowance.isSending)
              }
              disabled={isSendDisabled}
              data-testid="send-submit"
            >
              {senderMode === 'other'
                ? spendAllowance.isSending
                  ? 'Spending Allowance…'
                  : isAllowanceLoading
                    ? 'Checking Allowance…'
                    : 'Spend Allowance'
                : effectiveGasless
                  ? gasless.isSending
                    ? 'Sending…'
                    : gasless.isQuoting
                      ? 'Quoting…'
                      : 'Send Gasless'
                  : isLoading
                    ? 'Sending…'
                    : `Send ${selected.symbol}`}
            </Button>
            {showFastSend && !effectiveGasless && senderMode === 'self' && (
              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={handleFastSend}
                loading={isLoading}
                disabled={isSendFastDisabled}
                data-testid="send-fast"
              >
                Send Fast
              </Button>
            )}
          </div>

          {/* Vertical list of recent transacted members */}
          <RecentTransactedList
            network={network}
            onSelectMember={(item) => {
              setRecipient(item.username ? `@${item.username}` : item.address);
              setEffectiveRecipientAddress(item.address);
            }}
          />
        </form>
      )}

      <TokenSelectModal
        isOpened={showTokenModal}
        onOpenChange={setShowTokenModal}
        options={options}
        selectedId={selectedId}
        onSelect={handleSelectToken}
      />
    </NewLayout>
  );
};
