/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState, useMemo } from 'react';
import type { FC } from 'react';
import {
  ArrowDownUp,
  ExternalLink,
  Flame,
  Landmark,
  Search,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  Check,
  Plus,
} from 'lucide-react';

import { SwapField } from '../swap-field';
import {
  useEcosystemSwap,
  formatMaturityDate,
  type EcosystemToken,
} from '../../hooks/use-ecosystem-swap';

import { Button } from '@/core/components/ui/button';
import { Modal } from '@/core/components/ui/modal';
import { FallbackImage } from '@/core/components/ui/fallback-image';
import { CommentField } from '@/features/send/components/comment-field';
import { formatFi } from '@/features/brotherhood/components/credit/credit-member-card';
import { useAddressUsernameResolution } from '@/core/hooks/use-address-username-resolution';
import { BRO_TREASURY_ADDRESS } from '@/lib/brotherhood/config';
import { cn } from '@/core/lib/utils';

interface SwapInterfaceProps {
  className?: string;
}

function getTokenBadge(token: EcosystemToken): string {
  if (token.kind === 'fi') return 'Network Gram';
  if (token.kind === 'reserve') return `Fiat Reserve · ${token.multiplier}x`;
  const degreeLabel =
    token.degree === 'circle'
      ? 'Circle'
      : token.degree === 'ring'
        ? 'Ring'
        : token.degree === 'voted'
          ? 'Voted'
          : 'Member';
  return `${degreeLabel} · ${token.multiplier}x`;
}

export const SwapInterface: FC<SwapInterfaceProps> = ({ className }) => {
  const {
    tokens,
    fromToken,
    toToken,
    quote,
    isSwapping,
    txError,
    fiatBuyUrl,
    net,
    handleSelectFromToken,
    handleSelectToToken,
    flipDirection,
    handleFromAmountChange,
    handleToAmountChange,
    handleMaxFrom,
    addCustomMemberOwner,
    executeSwap,
    executeFiatOffRampBurn,
  } = useEcosystemSwap();

  const [selectorSide, setSelectorSide] = useState<'from' | 'to' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fiat Off-Ramp Modal State
  const [isOffRampOpen, setIsOffRampOpen] = useState(false);
  const [offRampAmount, setOffRampAmount] = useState('');
  const [offRampComment, setOffRampComment] = useState('');
  const [offRampEncrypted, setOffRampEncrypted] = useState(true);
  const [offRampError, setOffRampError] = useState<string | null>(null);

  // Resolution hook for custom member lookup in token selector (.bro, @username, or address)
  const resolution = useAddressUsernameResolution({
    value: searchQuery,
    onChange: setSearchQuery,
    enabled: Boolean(selectorSide && searchQuery.trim()),
  });

  const resolvedCustomAddress =
    resolution.resolvedAddress ||
    resolution.resolvedDnsAddress ||
    (resolution.isDirectAddress ? resolution.trimmed : null);

  const filteredTokens = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return tokens;
    return tokens.filter(
      (t) =>
        t.symbol.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.ownerAddress.toLowerCase().includes(q) ||
        t.fiWalletAddress.toLowerCase().includes(q),
    );
  }, [tokens, searchQuery]);

  const handleSelectTokenFromModal = (tokenId: string) => {
    if (selectorSide === 'from') {
      handleSelectFromToken(tokenId);
    } else if (selectorSide === 'to') {
      handleSelectToToken(tokenId);
    }
    setSelectorSide(null);
    setSearchQuery('');
  };

  const handleAddResolvedMember = () => {
    if (!resolvedCustomAddress) return;
    addCustomMemberOwner(resolvedCustomAddress);
    if (selectorSide === 'from') {
      handleSelectFromToken(resolvedCustomAddress);
    } else if (selectorSide === 'to') {
      handleSelectToToken(resolvedCustomAddress);
    }
    setSelectorSide(null);
    setSearchQuery('');
  };

  const handleExecuteSwap = async () => {
    try {
      await executeSwap();
    } catch {
      // Handled via validationError / txError
    }
  };

  const reserveToken = useMemo(
    () => tokens.find((t) => t.kind === 'reserve') ?? tokens[1],
    [tokens],
  );

  const handleSubmitOffRamp = async () => {
    setOffRampError(null);
    if (!offRampComment.trim()) {
      setOffRampError(
        'Please enter your bank account / payout details in the comment field.',
      );
      return;
    }
    try {
      const ok = await executeFiatOffRampBurn(
        offRampAmount,
        offRampComment,
        offRampEncrypted,
      );
      if (ok) {
        setOffRampAmount('');
        setOffRampComment('');
        setIsOffRampOpen(false);
      }
    } catch (e: any) {
      setOffRampError(e?.message || 'Off-ramp burn failed');
    }
  };

  const isSwapButtonDisabled =
    isSwapping || quote.inputNano <= 0n || Boolean(quote.validationError);

  const getSwapButtonLabel = (): string => {
    if (isSwapping) return 'Broadcasting Swap…';
    if (quote.inputNano <= 0n) return 'Enter Amount';
    if (quote.validationError) return 'Unavailable';
    if (quote.mode === 'multi-hop') {
      return `Multi-Hop Swap ${fromToken.symbol} → ${toToken.symbol}`;
    }
    if (quote.mode === 'payback') {
      return `Redeem ${fromToken.symbol} for FI`;
    }
    return `Swap ${fromToken.symbol} for ${toToken.symbol}`;
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Swap Fields (From / To) */}
      <div className="relative">
        <div className="space-y-1.5">
          <SwapField
            label="From"
            symbol={fromToken.symbol}
            subtitle={
              fromToken.kind === 'fi'
                ? 'Gram'
                : fromToken.kind === 'reserve'
                  ? 'Stablecoin'
                  : 'Personal'
            }
            badge={getTokenBadge(fromToken)}
            icon={fromToken.icon}
            amount={quote.fromAmountFormatted}
            balance={fromToken.userBalanceFormatted}
            onAmountChange={handleFromAmountChange}
            onMax={handleMaxFrom}
            onSelectToken={() => setSelectorSide('from')}
            testIdPrefix="swap-from"
          />
          <SwapField
            label="To"
            symbol={toToken.symbol}
            subtitle={
              toToken.kind === 'fi'
                ? 'Gram'
                : toToken.kind === 'reserve'
                  ? 'Stablecoin'
                  : 'Personal'
            }
            badge={getTokenBadge(toToken)}
            icon={toToken.icon}
            amount={quote.toAmountFormatted}
            balance={toToken.userBalanceFormatted}
            onAmountChange={handleToAmountChange}
            onSelectToken={() => setSelectorSide('to')}
            testIdPrefix="swap-to"
          />
        </div>

        <button
          type="button"
          onClick={flipDirection}
          className="absolute left-1/2 top-1/2 z-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-background bg-blue-600 text-white shadow-md transition-colors hover:bg-blue-700 cursor-pointer"
          aria-label="Swap direction"
          data-testid="swap-flip-button"
        >
          <ArrowDownUp className="h-4 w-4" />
        </button>
      </div>

      {/* Deterministic Ecosystem Route & Terms Summary */}
      <div className="rounded-2xl bg-secondary/40 border border-border/60 p-3.5 space-y-2.5 text-xs">
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground font-medium flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Route</span>
          </span>
          <span
            className="font-semibold text-foreground text-right"
            data-testid="swap-route-label"
          >
            {quote.routeLabel}
          </span>
        </div>

        <p className="text-[11px] text-muted-foreground leading-relaxed">
          {quote.routeDescription}
        </p>

        <div className="pt-2 border-t border-border/40 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Exchange Rate</span>
            <span className="font-mono font-semibold text-foreground">
              1 {fromToken.symbol} = {quote.effectiveRate} {toToken.symbol}
            </span>
          </div>

          {quote.mode !== 'payback' && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {quote.feeOrBonusPercent < 0
                  ? 'Issuer Service Charge'
                  : quote.feeOrBonusPercent > 0
                    ? 'Credit Bonus Multiplier'
                    : 'Multiplier'}
              </span>
              <span
                className={cn(
                  'font-semibold',
                  quote.feeOrBonusPercent < 0
                    ? 'text-amber-600 dark:text-amber-400'
                    : quote.feeOrBonusPercent > 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-foreground',
                )}
              >
                {toToken.multiplier}x (
                {quote.feeOrBonusPercent > 0
                  ? `+${quote.feeOrBonusPercent}%`
                  : quote.feeOrBonusPercent < 0
                    ? `${quote.feeOrBonusPercent}%`
                    : '1:1 Par'}
                )
              </span>
            </div>
          )}

          {(quote.mode === 'buy-credit' || quote.mode === 'multi-hop') && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {toToken.symbol} Credit Need Capacity
              </span>
              <span className="font-mono font-semibold text-foreground">
                {formatFi(toToken.creditNeedNano)} FI
              </span>
            </div>
          )}

          {(quote.mode === 'payback' || quote.mode === 'multi-hop') && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {fromToken.symbol} Available FI Reserve
                </span>
                <span className="font-mono font-semibold text-foreground">
                  {formatFi(fromToken.issuerFiBalanceNano)} FI
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {fromToken.symbol} Maturity
                </span>
                <span className="font-medium text-foreground">
                  {formatMaturityDate(fromToken.creditMaturity)}
                </span>
              </div>
            </>
          )}

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Attached Network Gas</span>
            <span className="font-mono text-foreground">
              {quote.gasTon} TON{' '}
              <span className="text-[10px] text-muted-foreground">
                (excess returned)
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Validation or Transaction Error */}
      {(quote.validationError || txError) && (
        <div
          className="flex items-center gap-2 rounded-2xl bg-rose-500/10 border border-rose-500/25 p-3 text-xs text-rose-600 dark:text-rose-400"
          data-testid="swap-error-banner"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{quote.validationError || txError}</span>
        </div>
      )}

      {/* Primary Swap Action Button */}
      <Button
        type="button"
        fullWidth
        onClick={handleExecuteSwap}
        loading={isSwapping}
        disabled={isSwapButtonDisabled}
        data-testid="swap-execute-button"
      >
        {getSwapButtonLabel()}
      </Button>

      {/* Reserve Token (Fiat Stablecoin) On-Ramp & Off-Ramp Gateway Card */}
      <div className="rounded-2xl bg-card border border-border/80 p-4 space-y-3 shadow-xs">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-bold text-foreground">
                  Reserve Token Fiat Gateway
                </h3>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Stablecoin
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Buy Reserve Token with fiat or burn to receive fiat payout to
                your bank account.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <a
            href={fiatBuyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2.5 px-3 transition-colors"
            data-testid="swap-fiat-buy-link"
          >
            <span>Buy with Fiat</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={() => setIsOffRampOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground border border-border font-semibold text-xs py-2.5 px-3 transition-colors cursor-pointer"
            data-testid="swap-fiat-sell-button"
          >
            <Flame className="w-3.5 h-3.5 text-rose-500" />
            <span>Sell for Fiat</span>
          </button>
        </div>
      </div>

      {/* Token Selector Modal */}
      <Modal.Container
        isOpened={selectorSide !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectorSide(null);
            setSearchQuery('');
          }
        }}
        className="px-2"
      >
        <Modal.Header
          onClose={() => {
            setSelectorSide(null);
            setSearchQuery('');
          }}
        >
          <Modal.Title>
            Select {selectorSide === 'from' ? 'Source' : 'Destination'} Token
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="space-y-3">
          {/* Search / Member Lookup Input (.bro, @username, or Address) */}
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search token or enter .bro domain, @username, or address…"
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-border bg-secondary/40 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              data-testid="swap-token-search-input"
            />
          </div>

          {/* Dynamic On-Chain Lookup Result (if not already in list) */}
          {resolvedCustomAddress &&
            !tokens.some((t) => t.ownerAddress === resolvedCustomAddress) && (
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-foreground truncate">
                    {resolution.resolvedUsername
                      ? `@${resolution.resolvedUsername}`
                      : searchQuery.trim()}
                  </div>
                  <div className="text-[11px] font-mono text-muted-foreground truncate">
                    {resolvedCustomAddress}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={handleAddResolvedMember}
                  data-testid="swap-add-resolved-member"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  <span>Select Member</span>
                </Button>
              </div>
            )}

          {resolution.isResolving && (
            <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 px-1">
              <span className="w-2.5 h-2.5 rounded-full border border-primary/40 border-t-primary animate-spin" />
              <span>Resolving member on-chain…</span>
            </div>
          )}

          {/* Token List */}
          <div className="space-y-1.5 max-h-[50dvh] overflow-y-auto pr-1">
            {filteredTokens.map((token) => {
              const isSelected =
                (selectorSide === 'from' && token.id === fromToken.id) ||
                (selectorSide === 'to' && token.id === toToken.id);

              return (
                <button
                  key={token.id}
                  type="button"
                  onClick={() => handleSelectTokenFromModal(token.id)}
                  className={cn(
                    'w-full flex items-center justify-between gap-3 p-3 rounded-xl border text-left transition-colors cursor-pointer',
                    isSelected
                      ? 'bg-primary/10 border-primary/40'
                      : 'bg-card hover:bg-secondary/50 border-border/60',
                  )}
                  data-testid={`swap-token-option-${token.symbol}`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary border border-border">
                      <FallbackImage
                        src={token.icon}
                        alt=""
                        className="h-full w-full object-cover"
                        fallback={
                          <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-[10px] font-bold text-white">
                            {token.symbol
                              .replace(/^@/, '')
                              .slice(0, 2)
                              .toUpperCase()}
                          </span>
                        }
                      />
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-foreground truncate">
                          {token.symbol}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border/50">
                          {getTokenBadge(token)}
                        </span>
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate mt-0.5">
                        {token.kind === 'fi'
                          ? 'Base Network Gram'
                          : `Need: ${formatFi(token.creditNeedNano)} FI · Reserve: ${formatFi(token.issuerFiBalanceNano)} FI`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-mono font-semibold text-foreground">
                        {token.userBalanceFormatted}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        Balance
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-primary" />}
                  </div>
                </button>
              );
            })}
          </div>
        </Modal.Body>
      </Modal.Container>

      {/* Sell Reserve Token for Fiat (Off-Ramp Burn) Modal */}
      <Modal.Container
        isOpened={isOffRampOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsOffRampOpen(false);
            setOffRampError(null);
          }
        }}
        className="px-2"
      >
        <Modal.Header
          onClose={() => {
            setIsOffRampOpen(false);
            setOffRampError(null);
          }}
        >
          <Modal.Title>Sell Reserve Token for Fiat</Modal.Title>
        </Modal.Header>
        <Modal.Body className="space-y-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Encrypted Off-Chain Bank Payout</p>
              <p className="text-[11px] opacity-90 mt-0.5">
                Burns your Reserve Token (without FI payback) and dispatches an
                on-chain notification to the Treasury with your encrypted bank
                account details for fiat transfer.
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <span>Amount of RESERVE to Burn</span>
              <button
                type="button"
                onClick={() =>
                  setOffRampAmount(reserveToken?.userBalanceFormatted ?? '0')
                }
                className="font-semibold text-primary hover:underline cursor-pointer"
              >
                Max ({reserveToken?.userBalanceFormatted ?? '0'} RESERVE)
              </button>
            </div>
            <input
              type="number"
              step="any"
              min="0"
              value={offRampAmount}
              onChange={(e) => setOffRampAmount(e.target.value)}
              placeholder="0.0"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
              data-testid="swap-offramp-amount-input"
            />
          </div>

          <CommentField
            comment={offRampComment}
            onChangeComment={setOffRampComment}
            isEncrypted={offRampEncrypted}
            onChangeIsEncrypted={setOffRampEncrypted}
            recipientAddress={BRO_TREASURY_ADDRESS}
            network={net}
            disabled={isSwapping}
          />

          {offRampError && (
            <div className="flex items-center gap-1.5 text-xs text-rose-500 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{offRampError}</span>
            </div>
          )}

          <Button
            fullWidth
            variant="danger"
            onClick={handleSubmitOffRamp}
            loading={isSwapping}
            disabled={
              isSwapping || !offRampAmount || !(parseFloat(offRampAmount) > 0)
            }
            data-testid="swap-offramp-submit-button"
          >
            <Flame className="w-4 h-4 mr-1.5" />
            <span>
              {isSwapping
                ? 'Broadcasting Off-Ramp Burn…'
                : 'Burn RESERVE & Request Fiat Payout'}
            </span>
          </Button>
        </Modal.Body>
      </Modal.Container>
    </div>
  );
};
