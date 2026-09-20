/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from '@/core/routing';
import { isValidAddress } from '@ton/walletkit';
import { useWallet, useWalletKit } from '@demo/wallet-core';
import { toast } from 'sonner';
import { useExplorer } from '@/core/explorer';
import { notifyTransactionSent } from '@/core/utils/transaction-toast';
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
import {
  deriveTokenWalletAddressOffchain,
  type TokenContractContext,
} from '../../lib/token-contract-resolution';
import { Layers, ChevronDown } from 'lucide-react';
import { cn } from '@/core/lib/utils';

import { Button } from '@/core/components/ui/button';
import { TxButton } from '@/core/components/ui/tx-button';
import { NewLayout } from '@/core/components/shared/new-layout';
import { ScreenHeader } from '@/core/components/shared/screen-header';
import { createComponentLogger } from '@/core/lib/logger';

const log = createComponentLogger('SendTransaction');

export const SendTransaction: React.FC = () => {
  const navigate = useNavigate();
  const walletKit = useWalletKit();
  const { currentWallet, address, savedWallets, activeWalletId } = useWallet();
  const network =
    savedWallets.find((w) => w.id === activeWalletId)?.network ?? 'testnet';

  const initialParams = useMemo(() => {
    if (typeof window === 'undefined')
      return { recipient: '', amount: '', token: '' };
    const sp = new URLSearchParams(window.location.search);
    return {
      recipient: sp.get('recipient') || '',
      amount: sp.get('amount') || '',
      token: sp.get('token') || '',
    };
  }, []);

  const [selectedId, setSelectedId] = useState('HD');
  const [recipient, setRecipient] = useState(initialParams.recipient);
  const [effectiveRecipientAddress, setEffectiveRecipientAddress] = useState<
    string | null
  >(initialParams.recipient ? initialParams.recipient : null);
  const [amount, setAmount] = useState(initialParams.amount);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);

  const [senderMode, setSenderMode] = useState<SenderMode>('self');
  const [granterInput, setGranterInput] = useState('');

  const options = useSendTokens();

  const [hasAppliedInitialToken, setHasAppliedInitialToken] = useState(false);
  if (!hasAppliedInitialToken && initialParams.token && options.length > 0) {
    const match = options.find(
      (o) =>
        o.symbol?.toLowerCase() === initialParams.token.toLowerCase() ||
        o.id.toLowerCase() === initialParams.token.toLowerCase(),
    );
    if (match) {
      setHasAppliedInitialToken(true);
      setSelectedId(match.id);
    }
  }

  const selected =
    options.find((option) => option.id === selectedId) ?? options[0];

  const isFiToken =
    selected.id === 'FI' ||
    selected.id === FI_ADDRESS ||
    selected.symbol === 'FI' ||
    (selected.token.type === 'JETTON' && isFiJetton(selected.token.data));

  const tokenContext = useMemo<TokenContractContext>(() => {
    if (selected.token.type === 'TON') {
      return { tokenType: 'TON' };
    }
    const minterAddr =
      selected.token.data?.address || (isFiToken ? FI_ADDRESS : selected.id);
    return {
      tokenType: 'JETTON',
      minterAddress: minterAddr,
      symbol: selected.symbol,
      adminAddress: (selected.token.data as any)?.adminAddress,
    };
  }, [selected, isFiToken]);

  const [derivedRecipientTokenWallet, setDerivedRecipientTokenWallet] =
    useState<string | null>(null);
  const [derivedSenderTokenWallet, setDerivedSenderTokenWallet] = useState<
    string | null
  >(null);
  const [showRoutingDetails, setShowRoutingDetails] = useState(false);

  const tokenContextKey = `${address}:${tokenContext.tokenType}:${tokenContext.minterAddress ?? ''}:${network}`;
  const [prevContextKey, setPrevContextKey] = useState(tokenContextKey);
  if (tokenContextKey !== prevContextKey) {
    setPrevContextKey(tokenContextKey);
    if (!address || tokenContext.tokenType !== 'JETTON') {
      setDerivedSenderTokenWallet(null);
    }
  }

  useEffect(() => {
    if (!address || tokenContext.tokenType !== 'JETTON') return;

    let isCancelled = false;
    void deriveTokenWalletAddressOffchain({
      minterAddress: tokenContext.minterAddress,
      ownerAddress: address,
      network: network === 'mainnet' ? 'mainnet' : 'testnet',
      tokenSymbol: tokenContext.symbol,
      adminAddress: tokenContext.adminAddress,
    }).then((wallet) => {
      if (!isCancelled) {
        setDerivedSenderTokenWallet(wallet);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [address, tokenContext, network]);

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
    notifyTransactionSent(normalizedHash, network, explorer);
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

        if (tokenContext.tokenType === 'JETTON' && address) {
          await deriveTokenWalletAddressOffchain({
            minterAddress: tokenContext.minterAddress,
            ownerAddress: address,
            network: network === 'mainnet' ? 'mainnet' : 'testnet',
            tokenSymbol: tokenContext.symbol,
            adminAddress: tokenContext.adminAddress,
          });
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

  return (
    <NewLayout
      header={<ScreenHeader title="Send" onBack={() => navigate('/wallet')} />}
    >
      {!currentWallet ? (
        <div className="py-10 text-center">
          <p className="mb-3 text-sm text-muted-foreground">Loading wallet…</p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/wallet')}
          >
            Back to dashboard
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSend} className="flex flex-col gap-6">
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
            tokenContext={tokenContext}
            onDerivedTokenWalletChange={setDerivedRecipientTokenWallet}
          />

          {/* Expandable Contract Routing Details for Jetton / FI / Personal Tokens */}
          {tokenContext.tokenType === 'JETTON' && (
            <div className="border border-border/60 bg-card/50 rounded-xl p-3 text-xs space-y-2">
              <button
                type="button"
                onClick={() => setShowRoutingDetails((prev) => !prev)}
                className="w-full flex items-center justify-between font-medium text-foreground hover:text-primary transition-colors text-left"
              >
                <div className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-primary" />
                  <span>Contract Routing Details</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                  <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono">
                    0 RPC Calls (Off-Chain)
                  </span>
                  <ChevronDown
                    className={cn(
                      'w-3.5 h-3.5 transition-transform duration-200',
                      showRoutingDetails && 'rotate-180',
                    )}
                  />
                </div>
              </button>

              {showRoutingDetails && (
                <div className="pt-2 border-t border-border/40 space-y-2 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Token Minter:</span>
                    <span className="font-mono text-foreground">
                      {formatWalletAddress(
                        tokenContext.minterAddress || selected.id,
                        false,
                      )}
                    </span>
                  </div>
                  {derivedSenderTokenWallet && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Sender Token Wallet:
                      </span>
                      <span className="font-mono text-emerald-500">
                        {formatWalletAddress(derivedSenderTokenWallet, false)}
                      </span>
                    </div>
                  )}
                  {derivedRecipientTokenWallet && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Recipient Token Wallet:
                      </span>
                      <span className="font-mono text-emerald-500">
                        {formatWalletAddress(
                          derivedRecipientTokenWallet,
                          false,
                        )}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-muted-foreground text-[10px]">
                    <span>Routing Mode:</span>
                    <span>Deterministic Off-Chain Derivation</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Gasless fees feature - hidden for now, will be re-enabled in future */}
          {/* <GaslessOptions gasless={gasless} /> */}

          {error && <p className="text-center text-sm text-red-500">{error}</p>}

          <div className="flex flex-col gap-2">
            <TxButton
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
              actionLabel={
                senderMode === 'other'
                  ? 'Spend Allowance'
                  : effectiveGasless
                    ? 'Send Gasless'
                    : `Send ${selected.symbol}`
              }
              onAction={() => {
                const syntheticEvent = {
                  preventDefault: () => {},
                } as unknown as React.FormEvent;
                void handleSend(syntheticEvent);
              }}
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
            </TxButton>
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
