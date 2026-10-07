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
  BadgeCheck,
  Copy,
  Download,
  Flame,
  Landmark,
  Search,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  AlertCircle,
  Check,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';
import QRCodeStyling from 'qr-code-styling';

import { useWalletStore } from '@demo/wallet-core';
import { SwapField } from '../swap-field';
import {
  useEcosystemSwap,
  formatMaturityDate,
  type EcosystemToken,
} from '../../hooks/use-ecosystem-swap';

import { Button } from '@/core/components/ui/button';
import { Modal } from '@/core/components/ui/modal';
import { FallbackImage } from '@/core/components/ui/fallback-image';
import { useTheme } from '@/core/theme';
import { CommentField } from '@/features/send/components/comment-field';
import { buildPaletteQrOptions, StyledQrCode } from '@/features/wallets';
import { formatFi } from '@/features/brotherhood/components/credit/credit-member-card';
import { useAddressUsernameResolution } from '@/core/hooks/use-address-username-resolution';
import {
  BRO_TREASURY_ADDRESS,
  RESERVE_TOKEN_UPI_CONFIG,
  buildReserveUpiLinks,
} from '@/lib/brotherhood/config';
import { cn } from '@/core/lib/utils';

interface SwapInterfaceProps {
  className?: string;
}

function getTokenBadge(token: EcosystemToken): string {
  if (token.kind === 'fi') return token.name;
  if (token.kind === 'reserve') return `${token.name} · ${token.multiplier}x`;
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
    fiToken,
    fromToken,
    toToken,
    quote,
    isSwapping,
    txError,
    userWalletAddress,
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

  const { palette, resolvedTheme } = useTheme();
  const [selectorSide, setSelectorSide] = useState<'from' | 'to' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const reserveToken = useMemo(
    () => tokens.find((t) => t.kind === 'reserve') ?? tokens[1],
    [tokens],
  );

  // Fiat On-Ramp (Personal UPI) Modal State — default 100 INR, minimum 100 INR
  const [isOnRampOpen, setIsOnRampOpen] = useState(false);
  const [upiAmountInr, setUpiAmountInr] = useState<string>(
    RESERVE_TOKEN_UPI_CONFIG.defaultAmount,
  );
  const [isSharingQr, setIsSharingQr] = useState(false);
  const [isDownloadingQr, setIsDownloadingQr] = useState(false);
  const [upiRefSeed, setUpiRefSeed] = useState<string>(() =>
    Date.now().toString(36),
  );

  const upiLinks = useMemo(
    () =>
      buildReserveUpiLinks({
        amountInr: upiAmountInr,
        walletAddress: userWalletAddress,
        referenceSeed: upiRefSeed,
      }),
    [upiAmountInr, userWalletAddress, upiRefSeed],
  );

  const handleCopyText = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied`);
    } catch {
      toast.error(`Failed to copy ${label}`);
    }
  };

  const handleUpiPay = () => {
    if (upiLinks.isBelowMinAmount) return;
    const isAndroid =
      typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent);
    window.location.href = isAndroid
      ? upiLinks.upiIntentUrl
      : upiLinks.bhimOrOthersUrl;
  };

  const generateUpiQrPngBlob = async (): Promise<{
    blob: Blob;
    fileName: string;
  }> => {
    const qr = new QRCodeStyling({
      ...buildPaletteQrOptions(palette, resolvedTheme, { showLogo: false }),
      width: 512,
      height: 512,
      margin: 24,
      data: upiLinks.qrUpiUrl,
    });
    const rawData = await qr.getRawData('png');
    if (!rawData) {
      throw new Error('Could not generate QR image');
    }
    const blob =
      rawData instanceof Blob
        ? rawData
        : new Blob([rawData as unknown as BlobPart], { type: 'image/png' });
    const fileName = `upi-${(reserveToken?.symbol ?? 'token').toLowerCase()}-${upiLinks.txRef}.png`;
    return { blob, fileName };
  };

  const triggerBlobDownload = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShareUpiQr = async () => {
    if (isSharingQr || upiLinks.isBelowMinAmount) return;
    setIsSharingQr(true);
    try {
      const { blob, fileName } = await generateUpiQrPngBlob();
      const file = new File([blob], fileName, { type: 'image/png' });

      if (
        typeof navigator !== 'undefined' &&
        navigator.share &&
        (!navigator.canShare || navigator.canShare({ files: [file] }))
      ) {
        await navigator.share({
          title: `Buy ${reserveToken?.symbol ?? ''} via UPI`,
          text: `Pay ₹${upiLinks.amountStr} to ${upiLinks.payeeName} (${upiLinks.upiId}) · Note: ${upiLinks.note}`,
          files: [file],
        });
      } else {
        triggerBlobDownload(blob, fileName);
        toast.success('QR code downloaded');
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        toast.error('Failed to share QR code');
      }
    } finally {
      setIsSharingQr(false);
    }
  };

  const handleDownloadUpiQr = async () => {
    if (isDownloadingQr || upiLinks.isBelowMinAmount) return;
    setIsDownloadingQr(true);
    try {
      const { blob, fileName } = await generateUpiQrPngBlob();
      triggerBlobDownload(blob, fileName);
      toast.success('QR code downloaded');
    } catch {
      toast.error('Failed to download QR code');
    } finally {
      setIsDownloadingQr(false);
    }
  };

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

  const savedWallets = useWalletStore((s) => s.walletManagement.savedWallets);
  const activeWalletId = useWalletStore(
    (s) => s.walletManagement.activeWalletId,
  );
  const activeWallet = savedWallets.find((w) => w.id === activeWalletId);
  const isWatchOnly = Boolean(
    activeWallet?.walletType === 'watch-only' || activeWallet?.isWatchOnly,
  );

  const isSwapButtonDisabled =
    isWatchOnly ||
    isSwapping ||
    quote.inputNano <= 0n ||
    Boolean(quote.validationError);

  const getSwapButtonLabel = (): string => {
    if (isWatchOnly) return 'Watch-Only (Sending Disabled)';
    if (isSwapping) return 'Broadcasting Swap…';
    if (quote.inputNano <= 0n) return 'Enter Amount';
    if (quote.validationError) return 'Unavailable';
    if (quote.mode === 'multi-hop') {
      return `Multi-Hop Swap ${fromToken.symbol} → ${toToken.symbol}`;
    }
    if (quote.mode === 'payback') {
      return `Redeem ${fromToken.symbol} for ${fiToken.symbol}`;
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
            subtitle={fromToken.name}
            badge={getTokenBadge(fromToken)}
            icon={fromToken.icon}
            isVerified={fromToken.kind === 'fi' || fromToken.kind === 'reserve'}
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
            subtitle={toToken.name}
            badge={getTokenBadge(toToken)}
            icon={toToken.icon}
            isVerified={toToken.kind === 'fi' || toToken.kind === 'reserve'}
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
          className="absolute left-1/2 top-1/2 z-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-background bg-primary text-primary-foreground shadow-md transition-opacity hover:opacity-90 cursor-pointer"
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
                {formatFi(toToken.creditNeedNano)} {fiToken.symbol}
              </span>
            </div>
          )}

          {(quote.mode === 'payback' || quote.mode === 'multi-hop') && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {fromToken.symbol} Available {fiToken.symbol} Reserve
                </span>
                <span className="font-mono font-semibold text-foreground">
                  {formatFi(fromToken.issuerFiBalanceNano)} {fiToken.symbol}
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

      {/* FI Admin Personal Token Fiat On-Ramp & Off-Ramp Gateway Card */}
      <div className="rounded-2xl bg-card border border-border/80 p-4 space-y-3 shadow-xs">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-bold text-foreground">
                  {reserveToken?.name ?? reserveToken?.symbol} Fiat Gateway
                </h3>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {reserveToken?.symbol}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Buy {reserveToken?.symbol} with fiat or burn to receive fiat
                payout to your bank account.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => {
              setUpiRefSeed(Date.now().toString(36));
              setIsOnRampOpen(true);
            }}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2.5 px-3 transition-colors cursor-pointer"
            data-testid="swap-fiat-buy-link"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Buy via UPI (INR)</span>
          </button>

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
              const isDisabledAsDestination =
                selectorSide === 'to' &&
                token.kind === 'reserve' &&
                token.creditNeedNano <= 0n;

              return (
                <button
                  key={token.id}
                  type="button"
                  disabled={isDisabledAsDestination}
                  onClick={() => handleSelectTokenFromModal(token.id)}
                  className={cn(
                    'w-full flex items-center justify-between gap-3 p-3 rounded-xl border text-left transition-colors',
                    isDisabledAsDestination
                      ? 'opacity-50 cursor-not-allowed bg-secondary/20 border-border/40'
                      : isSelected
                        ? 'bg-primary/10 border-primary/40 cursor-pointer'
                        : 'bg-card hover:bg-secondary/50 border-border/60 cursor-pointer',
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
                        {(token.kind === 'fi' || token.kind === 'reserve') && (
                          <BadgeCheck
                            className="w-3.5 h-3.5 text-emerald-500 shrink-0 fill-emerald-500/20"
                            aria-label="Verified token"
                          />
                        )}
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border/50">
                          {getTokenBadge(token)}
                        </span>
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate mt-0.5">
                        {token.kind === 'fi'
                          ? token.name
                          : isDisabledAsDestination
                            ? `No credit required (0 ${fiToken.symbol} need)`
                            : `Need: ${formatFi(token.creditNeedNano)} ${fiToken.symbol} · Reserve: ${formatFi(token.issuerFiBalanceNano)} ${fiToken.symbol}`}
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

      {/* Sell for Fiat (Off-Ramp Burn) Modal */}
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
          <Modal.Title>Sell {reserveToken?.symbol} for Fiat</Modal.Title>
        </Modal.Header>
        <Modal.Body className="space-y-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Encrypted Off-Chain Bank Payout</p>
              <p className="text-[11px] opacity-90 mt-0.5">
                Burns your {reserveToken?.name ?? reserveToken?.symbol} (without{' '}
                {fiToken.symbol} payback) and dispatches an on-chain
                notification to the Treasury with your encrypted bank account
                details for fiat transfer.
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <span>Amount of {reserveToken?.symbol} to Burn</span>
              <button
                type="button"
                onClick={() =>
                  setOffRampAmount(reserveToken?.userBalanceFormatted ?? '0')
                }
                className="font-semibold text-primary hover:underline cursor-pointer"
              >
                Max ({reserveToken?.userBalanceFormatted ?? '0'}{' '}
                {reserveToken?.symbol})
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
                : `Burn ${reserveToken?.symbol} & Request Fiat Payout`}
            </span>
          </Button>
        </Modal.Body>
      </Modal.Container>

      {/* Buy via Personal UPI (On-Ramp) Modal */}
      <Modal.Container
        isOpened={isOnRampOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsOnRampOpen(false);
          }
        }}
        className="px-2"
      >
        <Modal.Header onClose={() => setIsOnRampOpen(false)}>
          <Modal.Title>Buy {reserveToken?.symbol} via UPI</Modal.Title>
        </Modal.Header>
        <Modal.Body className="space-y-3.5">
          {/* Verified Payee Summary */}
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-center justify-between gap-2">
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-300">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Verified Payee: {upiLinks.payeeName}</span>
              </div>
              <div className="font-mono text-[11px] text-foreground truncate">
                VPA: {upiLinks.upiId} · Currency: {upiLinks.currency} (Min ₹
                {upiLinks.minAmount})
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleCopyText(upiLinks.upiId, 'UPI ID')}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-background/80 hover:bg-background border border-border text-[11px] font-semibold text-foreground shrink-0 cursor-pointer"
              data-testid="upi-copy-vpa-button"
            >
              <Copy className="w-3 h-3" />
              <span>Copy VPA</span>
            </button>
          </div>

          {/* INR Amount Input & Presets (Default ₹100, Min ₹100) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <span>Amount to Pay (INR)</span>
              <span className="font-mono text-[11px]">
                Min ₹{upiLinks.minAmount}
              </span>
            </div>
            <input
              type="number"
              step="1"
              min={upiLinks.minAmount}
              value={upiAmountInr}
              onChange={(e) => setUpiAmountInr(e.target.value)}
              placeholder={upiLinks.minAmount}
              className={cn(
                'w-full px-3.5 py-2.5 rounded-xl border bg-background text-foreground text-sm font-mono focus:outline-none focus:ring-2',
                upiLinks.isBelowMinAmount
                  ? 'border-rose-500/60 focus:ring-rose-500'
                  : 'border-border focus:ring-primary',
              )}
              data-testid="upi-amount-input"
            />
            {upiLinks.isBelowMinAmount && (
              <p
                className="text-[11px] font-medium text-rose-500 px-1"
                data-testid="upi-min-amount-error"
              >
                Enter at least ₹{upiLinks.minAmount} to enable UPI payment and
                QR actions.
              </p>
            )}
            <div className="flex items-center gap-1.5 pt-0.5">
              {['100', '500', '1000', '2000'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setUpiAmountInr(preset)}
                  className={cn(
                    'flex-1 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer',
                    upiAmountInr === preset
                      ? 'bg-primary/15 border-primary/40 text-primary'
                      : 'bg-secondary/60 border-border/60 text-muted-foreground hover:text-foreground',
                  )}
                >
                  ₹{preset}
                </button>
              ))}
            </div>
          </div>

          {/* NPCI > ₹2,000 Deep-Link Cap Warning */}
          {upiLinks.isOverDeepLinkCap && (
            <div
              className="flex items-start gap-2 rounded-xl bg-amber-500/10 border border-amber-500/30 p-2.5 text-[11px] text-amber-700 dark:text-amber-300"
              data-testid="upi-cap-warning"
            >
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">
                  Amount exceeds ₹2,000 NPCI P2P Deep-Link Cap
                </span>
                <span>
                  Google Pay & PhonePe often reject browser deep links over
                  ₹2,000 for personal VPAs. Scan or share the{' '}
                  <strong>QR Code</strong> below, or copy the VPA + Note
                  manually.
                </span>
              </div>
            </div>
          )}

          {/* UPI QR Code */}
          <div
            className={cn(
              'flex flex-col items-center justify-center p-4 rounded-2xl bg-card border border-border shadow-2xs space-y-2 transition-opacity',
              upiLinks.isBelowMinAmount && 'opacity-40 pointer-events-none',
            )}
          >
            <StyledQrCode
              value={upiLinks.qrUpiUrl}
              walletKey="upi_onramp"
              size={184}
              showLogo={false}
            />
            <span className="text-[11px] font-medium text-muted-foreground text-center">
              {upiLinks.isBelowMinAmount
                ? `Enter at least ₹${upiLinks.minAmount} to activate QR`
                : `Scan or share with your UPI app (${upiLinks.payeeName} · ₹${upiLinks.amountStr})`}
            </span>
          </div>

          {/* 3 UPI Action Buttons: UPI Pay, Share QR, Download QR */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={handleUpiPay}
              disabled={upiLinks.isBelowMinAmount}
              className="flex items-center justify-center gap-1.5 py-2.5 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="upi-pay-button"
            >
              <Smartphone className="w-4 h-4 shrink-0" />
              <span>UPI Pay</span>
            </button>

            <button
              type="button"
              onClick={handleShareUpiQr}
              disabled={isSharingQr || upiLinks.isBelowMinAmount}
              className="flex items-center justify-center gap-1.5 py-2.5 px-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground border border-border font-semibold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="upi-share-qr-button"
            >
              <Share2 className="w-4 h-4 shrink-0" />
              <span>{isSharingQr ? 'Sharing…' : 'Share QR'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadUpiQr}
              disabled={isDownloadingQr || upiLinks.isBelowMinAmount}
              className="flex items-center justify-center gap-1.5 py-2.5 px-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground border border-border font-semibold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="upi-download-qr-button"
            >
              <Download className="w-4 h-4 shrink-0" />
              <span>{isDownloadingQr ? 'Saving…' : 'Save QR'}</span>
            </button>
          </div>

          {/* Embedded Wallet Note (tn) & Order Reference (tr) */}
          <div className="rounded-xl bg-secondary/40 border border-border/60 p-3 space-y-2 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground font-medium">
                Required UPI Note (tn)
              </span>
              <button
                type="button"
                onClick={() => handleCopyText(upiLinks.note, 'UPI Note')}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                data-testid="upi-copy-note-button"
              >
                <Copy className="w-3 h-3" />
                <span>Copy Note</span>
              </button>
            </div>
            <div
              className="font-mono text-[11px] text-foreground bg-background/80 px-2.5 py-1.5 rounded-lg border border-border/50 break-all select-all"
              data-testid="upi-note-value"
            >
              {upiLinks.note}
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
              <span>Ref ID (tr):</span>
              <span className="font-mono text-foreground">
                {upiLinks.txRef}
              </span>
            </div>
          </div>

          {/* Security & Helper Warnings to User */}
          <div
            className="rounded-xl bg-amber-500/10 border border-amber-500/25 p-3 space-y-1.5 text-[11px] text-amber-800 dark:text-amber-300"
            data-testid="upi-security-warnings"
          >
            <div className="flex items-center gap-1.5 font-bold text-xs">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Important Security & Payment Warnings</span>
            </div>
            <ul className="list-disc pl-4 space-y-1 leading-relaxed opacity-95">
              <li>
                <strong>Do NOT edit the UPI Note (tn):</strong> Personal UPI
                apps allow modifying the note field before entering your PIN.
                Keep <code className="font-mono">{upiLinks.notePrefix}</code> +
                your wallet address intact so your TON wallet is credited
                accurately.
              </li>
              <li>
                <strong>Verify Payee VPA:</strong> Confirm your UPI app shows{' '}
                <code className="font-mono">{upiLinks.upiId}</code> (
                <strong>{upiLinks.payeeName}</strong>) before entering your UPI
                PIN.
              </li>
              <li>
                <strong>Save your 12-digit UTR:</strong> Keep the 12-digit UPI
                reference ID from your payment receipt until{' '}
                {reserveToken?.symbol} tokens arrive in your wallet.
              </li>
            </ul>
          </div>
        </Modal.Body>
      </Modal.Container>
    </div>
  );
};
