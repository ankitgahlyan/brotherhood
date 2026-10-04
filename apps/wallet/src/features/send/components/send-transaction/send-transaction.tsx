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
import { useSpendAllowance } from '@/features/brotherhood/hooks/use-spend-pocket-money';
import { useAllowanceBalance } from '../../hooks/use-pocket-money-balance';
import { TokenSelectButton } from '../token-select-button';
import { TokenSelectModal } from '../token-select-modal';
import { AmountField } from '../amount-field';
import { RecipientField } from '../recipient-field';
import { CommentField } from '../comment-field';
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
import { isTonChainDns, resolveAddressByDomain } from '@/core/lib/dns';
import { useContactBookStore } from '@/core/storage/useContactBookStore';
import { useDeveloperMode } from '@/core/lib/developer-mode';
import { Layers, ChevronDown, Users } from 'lucide-react';
import { cn } from '@/core/lib/utils';

import { Button } from '@/core/components/ui/button';
import { TxButton } from '@/core/components/ui/tx-button';
import { NewLayout } from '@/core/components/shared/new-layout';
import { ScreenHeader } from '@/core/components/shared/screen-header';
import { createComponentLogger } from '@/core/lib/logger';

const log = createComponentLogger('SendTransaction');

const LAST_SEND_TOKEN_STORAGE_KEY = 'brotherhood_send_last_token_v1';

function getLastSendTokenForWallet(walletKey: string): string | null {
  if (typeof window === 'undefined' || !walletKey) return null;
  try {
    const raw = window.localStorage.getItem(LAST_SEND_TOKEN_STORAGE_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw) as Record<string, string>;
    return map[walletKey] || null;
  } catch {
    return null;
  }
}

function saveLastSendTokenForWallet(walletKey: string, tokenId: string): void {
  if (typeof window === 'undefined' || !walletKey || !tokenId) return;
  try {
    const raw = window.localStorage.getItem(LAST_SEND_TOKEN_STORAGE_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    map[walletKey] = tokenId;
    window.localStorage.setItem(
      LAST_SEND_TOKEN_STORAGE_KEY,
      JSON.stringify(map),
    );
  } catch {
    // Ignore storage quota errors
  }
}

export const SendTransaction: React.FC = () => {
  const navigate = useNavigate();
  const walletKit = useWalletKit();
  const { currentWallet, address, savedWallets, activeWalletId } = useWallet();
  const network =
    savedWallets.find((w) => w.id === activeWalletId)?.network ?? 'testnet';
  const walletStorageKey = activeWalletId || address || 'default';

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

  const [selectedId, setSelectedId] = useState<string>(
    () => getLastSendTokenForWallet(walletStorageKey) || 'HD',
  );
  const [recipient, setRecipient] = useState(initialParams.recipient);
  const [effectiveRecipientAddress, setEffectiveRecipientAddress] = useState<
    string | null
  >(initialParams.recipient ? initialParams.recipient : null);
  const [amount, setAmount] = useState(initialParams.amount);
  const [comment, setComment] = useState('');
  const [isEncryptedComment, setIsEncryptedComment] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);

  const [senderMode, setSenderMode] = useState<SenderMode>('self');
  const [granterInput, setGranterInput] = useState('');
  const [isDeveloperMode] = useDeveloperMode();

  const options = useSendTokens();

  const [prevWalletStorageKey, setPrevWalletStorageKey] =
    useState(walletStorageKey);
  if (walletStorageKey !== prevWalletStorageKey) {
    setPrevWalletStorageKey(walletStorageKey);
    const remembered = getLastSendTokenForWallet(walletStorageKey);
    if (remembered) {
      setSelectedId(remembered);
    }
  }

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
      saveLastSendTokenForWallet(walletStorageKey, match.id);
    }
  }

  const rememberedTokenId = getLastSendTokenForWallet(walletStorageKey);
  const selected =
    options.find(
      (option) =>
        option.id.toLowerCase() === selectedId.toLowerCase() ||
        option.symbol?.toLowerCase() === selectedId.toLowerCase(),
    ) ??
    (rememberedTokenId
      ? options.find(
          (option) =>
            option.id.toLowerCase() === rememberedTokenId.toLowerCase() ||
            option.symbol?.toLowerCase() === rememberedTokenId.toLowerCase(),
        )
      : undefined) ??
    options[0];

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
    if (!isDeveloperMode || !address || tokenContext.tokenType !== 'JETTON') {
      return;
    }

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
  }, [isDeveloperMode, address, tokenContext, network]);

  const trimmedGranter = granterInput.trim();
  const isGranterDns = isTonChainDns(trimmedGranter);
  const canGranterFallbackToBro =
    Boolean(trimmedGranter) &&
    !isValidAddress(trimmedGranter) &&
    !isGranterDns &&
    !trimmedGranter.startsWith('@') &&
    /^[-\da-z]{1,126}$/i.test(trimmedGranter);
  const granterBroDomain = isGranterDns
    ? trimmedGranter.toLowerCase()
    : canGranterFallbackToBro
      ? `${trimmedGranter.toLowerCase()}.bro`
      : null;

  const localGranterAddress = useMemo(() => {
    if (senderMode !== 'other' || !trimmedGranter) return null;
    if (isValidAddress(trimmedGranter)) return trimmedGranter;
    if (isGranterDns) {
      return useContactBookStore
        .getState()
        .resolveAddress(trimmedGranter, network);
    }
    const cleanUsername = trimmedGranter.replace(/^@+/, '');
    if (cleanUsername.length > 0) {
      const cachedUserAddr = getCachedAddressByUsername(cleanUsername, network);
      if (cachedUserAddr) return cachedUserAddr;
    }
    if (granterBroDomain) {
      return useContactBookStore
        .getState()
        .resolveAddress(granterBroDomain, network);
    }
    return null;
  }, [senderMode, trimmedGranter, isGranterDns, granterBroDomain, network]);

  const [asyncResolvedGranter, setAsyncResolvedGranter] = useState<{
    domain: string;
    address: string;
  } | null>(null);

  const dnsResolvedGranterAddress =
    localGranterAddress ||
    (granterBroDomain &&
    asyncResolvedGranter?.domain.toLowerCase() === granterBroDomain
      ? asyncResolvedGranter.address
      : null);

  useEffect(() => {
    if (senderMode !== 'other' || !granterBroDomain || localGranterAddress) {
      return;
    }

    if (asyncResolvedGranter?.domain.toLowerCase() === granterBroDomain) {
      return;
    }

    let isCancelled = false;
    const timer = setTimeout(async () => {
      try {
        const resolved = await resolveAddressByDomain(
          granterBroDomain,
          network === 'mainnet' ? 'mainnet' : 'testnet',
        );
        if (!isCancelled && resolved) {
          setAsyncResolvedGranter({
            domain: granterBroDomain,
            address: resolved,
          });
          useContactBookStore
            .getState()
            .saveDnsDomain(resolved, granterBroDomain, network);
        }
      } catch {
        // Ignore resolution failure
      }
    }, 3000);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [
    senderMode,
    granterBroDomain,
    localGranterAddress,
    asyncResolvedGranter,
    network,
  ]);

  const resolvedGranterAddress = useMemo(() => {
    if (senderMode !== 'other') return null;
    return localGranterAddress || dnsResolvedGranterAddress;
  }, [senderMode, localGranterAddress, dnsResolvedGranterAddress]);

  const {
    allowance,
    formattedAllowance,
    pocketMoney,
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
    comment,
    isEncrypted: isEncryptedComment,
  });
  const gasless = sender.gasless;
  const effectiveGasless = gasless.effective;

  // Success toast with explorer links — for flows that return a broadcast hash
  // immediately (gasless send, fast send).
  const { explorer } = useExplorer();
  const notifySent = (normalizedHash: string) => {
    notifyTransactionSent(normalizedHash, network, explorer, address);
  };

  const handleSelectToken = (option: TokenOption) => {
    setSelectedId(option.id);
    saveLastSendTokenForWallet(walletStorageKey, option.id);
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

  const handleSend = async (
    e?: React.FormEvent,
    options?: { fastSend?: boolean },
  ) => {
    e?.preventDefault();
    setError('');

    if (!isOnline()) {
      toast.error('Cannot send transactions while offline');
      setError('Cannot send transactions while offline');
      return;
    }

    setIsLoading(true);

    try {
      let targetRecipient = (effectiveRecipientAddress || recipient).trim();
      if (!isValidAddress(targetRecipient) && isTonChainDns(targetRecipient)) {
        const resolved = await resolveAddressByDomain(
          targetRecipient,
          network === 'mainnet' ? 'mainnet' : 'testnet',
        );
        if (resolved) {
          targetRecipient = resolved;
          setEffectiveRecipientAddress(resolved);
        }
      }
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

        if (isDeveloperMode && tokenContext.tokenType === 'JETTON' && address) {
          await deriveTokenWalletAddressOffchain({
            minterAddress: tokenContext.minterAddress,
            ownerAddress: address,
            network: network === 'mainnet' ? 'mainnet' : 'testnet',
            tokenSymbol: tokenContext.symbol,
            adminAddress: tokenContext.adminAddress,
          });
        }

        const result = await sender.send(options);
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
            'Please enter a valid granter Owner address, @username, or .bro domain',
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
    targetRecipient.length > 0 &&
    !isValidAddress(targetRecipient) &&
    !isTonChainDns(recipient.trim())
      ? 'Invalid address'
      : '';
  const granterError =
    senderMode === 'other' && granterInput.length > 0 && !resolvedGranterAddress
      ? 'Invalid granter address, username, or .bro domain'
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

  const isSendingAny =
    isLoading ||
    (senderMode === 'self' ? gasless.isSending : spendAllowance.isSending);

  const sendActionLabel =
    senderMode === 'other'
      ? 'Spend Pocket Money'
      : effectiveGasless
        ? 'Send Gasless'
        : `Send ${selected.symbol}`;

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
        <form
          onSubmit={(e) => void handleSend(e)}
          className="flex flex-col gap-6"
        >
          <TokenSelectButton
            token={selected}
            onClick={() => setShowTokenModal(true)}
          />

          <AmountField value={amount} onChange={setAmount} token={selected} />

          {/* Spend pocket money toggle for FI tokens */}
          {isFiToken && (
            <div className="space-y-3">
              <button
                type="button"
                role="switch"
                aria-checked={senderMode === 'other'}
                onClick={() => {
                  const next = senderMode === 'other' ? 'self' : 'other';
                  setSenderMode(next);
                  if (next === 'self') {
                    setGranterInput('');
                  }
                }}
                className={cn(
                  'w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-2xl border transition-all duration-200 cursor-pointer text-left active:scale-[0.99]',
                  senderMode === 'other'
                    ? 'bg-primary/10 border-primary/40 shadow-xs'
                    : 'bg-secondary/50 hover:bg-secondary/80 border-border/70',
                )}
                data-testid="toggle-spend-allowance"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors',
                      senderMode === 'other'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background/80 text-muted-foreground border border-border/60',
                    )}
                  >
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-foreground leading-tight">
                      Spend from Pocket Money
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {senderMode === 'other'
                        ? 'Sending FI from a granter wallet (open → fixed → cheque)'
                        : 'Use delegated FI pocket money, recurring limit, or cheque'}
                    </div>
                  </div>
                </div>

                <div
                  className={cn(
                    'w-9 h-5 rounded-full p-0.5 transition-colors duration-200 shrink-0 flex items-center',
                    senderMode === 'other'
                      ? 'bg-primary justify-end'
                      : 'bg-muted-foreground/30 justify-start',
                  )}
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-xs transition-transform" />
                </div>
              </button>

              {senderMode === 'other' && (
                <SenderField
                  mode={senderMode}
                  onModeChange={setSenderMode}
                  granterInput={granterInput}
                  onGranterInputChange={setGranterInput}
                  resolvedGranterAddress={resolvedGranterAddress}
                  allowance={allowance}
                  formattedAllowance={formattedAllowance}
                  pocketMoney={pocketMoney}
                  isAllowanceLoading={isAllowanceLoading}
                  userAddress={address ?? null}
                  error={granterError}
                />
              )}
            </div>
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
            tokenContext={isDeveloperMode ? tokenContext : undefined}
            onDerivedTokenWalletChange={setDerivedRecipientTokenWallet}
          />

          {/* Comment / Memo field with Encrypted/Plain toggle */}
          <CommentField
            comment={comment}
            onChangeComment={setComment}
            isEncrypted={isEncryptedComment}
            onChangeIsEncrypted={setIsEncryptedComment}
            recipientAddress={effectiveRecipientAddress || recipient}
            network={network}
            disabled={isLoading}
          />

          {/* Expandable Contract Routing Details for Jetton / FI / Personal Tokens: Only shown when developer mode is on */}
          {tokenContext.tokenType === 'JETTON' && isDeveloperMode && (
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

          <div className="flex flex-col gap-2.5">
            <TxButton
              type="submit"
              fullWidth
              loading={isSendingAny}
              disabled={isSendDisabled}
              data-testid="send-submit"
              actionLabel={sendActionLabel}
              onAction={() => {
                void handleSend();
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
        selectedId={selected.id}
        onSelect={handleSelectToken}
      />
    </NewLayout>
  );
};
