/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState } from 'react';
import {
  QrCode,
  Check,
  AlertCircle,
  Loader2,
  RefreshCw,
  User,
  Pencil,
  RotateCcw,
  X,
  Tag,
} from 'lucide-react';
import { QrScanner } from '../qr-scanner/qr-scanner';
import { cn } from '@/core/lib/utils';
import { useAddressUsernameResolution } from '@/core/hooks/use-address-username-resolution';
import { useFormatAddress } from '@/core/utils/formatters';
import type { TokenContractContext } from '@/features/send/lib/token-contract-resolution';

export interface InputScanProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  scannerTitle?: string;
  containerClassName?: string;
  className?: string;
  'data-testid'?: string;
  enableUsernameResolution?: boolean;
  onResolvedAddressChange?: (address: string | null) => void;
  showResolvedBadge?: boolean;
  tokenContext?: TokenContractContext;
}

export const InputScan: React.FC<InputScanProps> = ({
  value,
  onChange,
  placeholder = 'UQ... or @username',
  disabled = false,
  scannerTitle = 'Scan address QR code',
  containerClassName,
  className,
  'data-testid': dataTestId,
  enableUsernameResolution = true,
  onResolvedAddressChange,
  showResolvedBadge = true,
  tokenContext,
}) => {
  const [isScannerVisible, setIsScannerVisible] = useState(false);
  const [isEditingCustomName, setIsEditingCustomName] = useState(false);
  const [customNameDraft, setCustomNameDraft] = useState('');
  const { formatWalletAddress } = useFormatAddress();

  const {
    isDirectAddress,
    isUsernameInput,
    resolvedAddress,
    resolvedUsername,
    isCustomName,
    onChainUsername,
    isResolving,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    handleSelectSuggestion,
    refetchProfile,
    setCustomName,
    removeCustomName,
    childContractCorrection,
    applyChildContractCorrection,
  } = useAddressUsernameResolution({
    value,
    onChange,
    onResolvedAddressChange,
    enabled: enableUsernameResolution,
    tokenContext,
  });

  const handleStartEdit = () => {
    setCustomNameDraft(resolvedUsername || '');
    setIsEditingCustomName(true);
  };

  const handleSaveCustomName = () => {
    const trimmedDraft = customNameDraft.trim().replace(/^@+/, '');
    if (trimmedDraft) {
      setCustomName(trimmedDraft);
    } else {
      removeCustomName();
    }
    setIsEditingCustomName(false);
  };

  const handleCancelEdit = () => {
    setIsEditingCustomName(false);
    setCustomNameDraft('');
  };

  const handleRevertToOnChain = () => {
    removeCustomName();
    setIsEditingCustomName(false);
  };

  const handleScan = (data: string) => {
    if (!data) return;
    onChange(data.trim());
    setIsScannerVisible(false);
  };

  return (
    <div className={cn('flex flex-col gap-1 w-full', containerClassName)}>
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              if (enableUsernameResolution) {
                setShowSuggestions(true);
              }
            }}
            onFocus={() => {
              if (enableUsernameResolution) {
                setShowSuggestions(true);
              }
            }}
            onBlur={() => {
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            placeholder={placeholder}
            disabled={disabled}
            data-testid={dataTestId}
            className={cn(
              'w-full p-2 border border-border bg-card rounded-lg text-xs text-foreground outline-none focus:border-primary',
              className,
            )}
          />

          {/* Autocomplete suggestions dropdown */}
          {enableUsernameResolution &&
            showSuggestions &&
            suggestions.length > 0 && (
              <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-popover border border-border rounded-lg shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                {suggestions.map((item) => (
                  <button
                    key={`${item.username}-${item.address}`}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectSuggestion(item);
                    }}
                    className="w-full px-3 py-2 text-left text-xs hover:bg-muted flex items-center justify-between transition-colors border-b border-border/40 last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="font-semibold text-foreground">
                        @{item.username}
                      </span>
                      {item.isCustom && (
                        <span className="text-[9px] bg-primary/20 text-primary px-1 py-0.5 rounded font-normal">
                          Custom
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-muted-foreground truncate max-w-40">
                      {formatWalletAddress(item.address, false)}
                    </span>
                  </button>
                ))}
              </div>
            )}
        </div>

        <button
          type="button"
          onClick={() => setIsScannerVisible(true)}
          disabled={disabled}
          aria-label="Scan QR code"
          title="Scan QR code"
          className="shrink-0 p-2 rounded-lg bg-secondary text-primary hover:bg-secondary/80 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50 border border-border"
        >
          <QrCode className="w-4 h-4" />
        </button>
      </div>

      {/* Auto-correction notice if a child contract address was entered */}
      {childContractCorrection && childContractCorrection.ownerAddress && (
        <div className="flex items-center justify-between px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-md text-xs text-amber-600 dark:text-amber-400">
          <div className="flex items-center gap-1.5 font-medium">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>
              Child {childContractCorrection.contractType} detected.
              Auto-corrected to Owner address.
            </span>
          </div>
          <button
            type="button"
            onClick={applyChildContractCorrection}
            className="text-[11px] font-semibold underline hover:opacity-80 transition-opacity ml-2 shrink-0"
          >
            Use Owner
          </button>
        </div>
      )}

      {/* Identity badge / Status info below input */}
      {enableUsernameResolution &&
        showResolvedBadge &&
        value.trim().length > 0 && (
          <div className="flex items-center justify-between px-2 py-1 rounded-md text-xs">
            {/* Resolving spinner */}
            {isResolving && !isEditingCustomName && (
              <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                <Loader2 className="w-3 h-3 animate-spin text-primary shrink-0" />
                <span>Checking username...</span>
              </div>
            )}

            {/* Inline custom name editing mode */}
            {isEditingCustomName && (
              <div className="flex items-center gap-1.5 w-full bg-card border border-primary/40 px-2 py-1 rounded shadow-sm">
                <Tag className="w-3.5 h-3.5 text-primary shrink-0" />
                <input
                  type="text"
                  value={customNameDraft}
                  onChange={(e) => setCustomNameDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSaveCustomName();
                    } else if (e.key === 'Escape') {
                      e.preventDefault();
                      handleCancelEdit();
                    }
                  }}
                  placeholder="Enter custom name..."
                  autoFocus
                  className="flex-1 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
                />
                <button
                  type="button"
                  onClick={handleSaveCustomName}
                  className="p-1 text-emerald-500 hover:bg-emerald-500/10 rounded transition-colors"
                  title="Save name (Enter)"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                {isCustomName && onChainUsername && (
                  <button
                    type="button"
                    onClick={handleRevertToOnChain}
                    className="p-1 text-amber-500 hover:bg-amber-500/10 rounded transition-colors"
                    title={`Revert to on-chain (@${onChainUsername})`}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="p-1 text-muted-foreground hover:bg-muted rounded transition-colors"
                  title="Cancel (Esc)"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Resolved username display */}
            {!isResolving && !isEditingCustomName && resolvedUsername && (
              <div className="flex items-center justify-between w-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded text-emerald-500">
                <div className="flex items-center gap-1.5 font-medium">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{`@${resolvedUsername}`}</span>
                  {isCustomName && (
                    <span className="text-[9px] bg-primary/20 text-primary px-1 py-0.5 rounded font-normal">
                      Custom
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleStartEdit}
                    className="p-1 hover:bg-emerald-500/20 rounded transition-colors text-emerald-500"
                    title={
                      isCustomName ? 'Edit custom name' : 'Set custom name'
                    }
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  {isCustomName && (
                    <button
                      type="button"
                      onClick={handleRevertToOnChain}
                      className="p-1 hover:bg-emerald-500/20 rounded transition-colors text-emerald-500/80 hover:text-emerald-500"
                      title={
                        onChainUsername
                          ? `Revert to @${onChainUsername}`
                          : 'Remove custom name'
                      }
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  )}
                  {resolvedAddress && isUsernameInput && (
                    <button
                      type="button"
                      onClick={() => onChange(resolvedAddress)}
                      className="text-[10px] bg-emerald-500/20 hover:bg-emerald-500/30 px-1.5 py-0.5 rounded text-emerald-400 font-mono transition-colors"
                      title="Click to insert address"
                    >
                      {formatWalletAddress(resolvedAddress, false)}
                    </button>
                  )}
                  {isDirectAddress && (
                    <button
                      type="button"
                      onClick={() => void refetchProfile()}
                      title="Refetch profile from on-chain"
                      className="p-1 hover:bg-emerald-500/20 rounded transition-colors text-emerald-500"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Valid direct address with no username found */}
            {!isResolving &&
              !isEditingCustomName &&
              isDirectAddress &&
              !resolvedUsername && (
                <div className="flex items-center justify-between w-full text-muted-foreground text-[11px]">
                  <span>No username set for this address</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleStartEdit}
                      className="flex items-center gap-1 text-primary hover:underline hover:text-primary/80 transition-colors font-medium"
                      title="Set custom nickname"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>Set name</span>
                    </button>
                    <span className="text-border">|</span>
                    <button
                      type="button"
                      onClick={() => void refetchProfile()}
                      className="flex items-center gap-1 text-muted-foreground hover:underline hover:text-foreground transition-colors"
                      title="Force refetch on-chain state"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Check again</span>
                    </button>
                  </div>
                </div>
              )}

            {/* Unresolved username warning */}
            {!isResolving &&
              !isEditingCustomName &&
              isUsernameInput &&
              !resolvedAddress && (
                <div className="flex items-center gap-1.5 text-amber-500 text-[11px]">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    Username not in local address book. Enter TON address
                    directly.
                  </span>
                </div>
              )}
          </div>
        )}

      <QrScanner
        isVisible={isScannerVisible}
        onClose={() => setIsScannerVisible(false)}
        onScan={handleScan}
        title={scannerTitle}
      />
    </div>
  );
};
