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
} from 'lucide-react';
import { QrScanner } from '../qr-scanner/qr-scanner';
import { cn } from '@/core/lib/utils';
import { useAddressUsernameResolution } from '@/core/hooks/use-address-username-resolution';
import { useFormatAddress } from '@/core/utils/formatters';

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
}) => {
  const [isScannerVisible, setIsScannerVisible] = useState(false);
  const { formatWalletAddress } = useFormatAddress();

  const {
    isDirectAddress,
    isUsernameInput,
    resolvedAddress,
    resolvedUsername,
    isResolving,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    handleSelectSuggestion,
    refetchProfile,
  } = useAddressUsernameResolution({
    value,
    onChange,
    onResolvedAddressChange,
    enabled: enableUsernameResolution,
  });

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
                    </div>
                    <span className="text-[11px] font-mono text-muted-foreground truncate max-w-[160px]">
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

      {/* Identity badge / Status info below input */}
      {enableUsernameResolution &&
        showResolvedBadge &&
        value.trim().length > 0 && (
          <div className="flex items-center justify-between px-2 py-1 rounded-md text-xs">
            {/* Resolving spinner */}
            {isResolving && (
              <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                <Loader2 className="w-3 h-3 animate-spin text-primary shrink-0" />
                <span>Checking username...</span>
              </div>
            )}

            {/* Resolved username display */}
            {!isResolving && resolvedUsername && (
              <div className="flex items-center justify-between w-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded text-emerald-500">
                <div className="flex items-center gap-1.5 font-medium">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{`@${resolvedUsername}`}</span>
                </div>
                <div className="flex items-center gap-2">
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
            {!isResolving && isDirectAddress && !resolvedUsername && (
              <div className="flex items-center justify-between w-full text-muted-foreground text-[11px]">
                <span>No username set for this address</span>
                <button
                  type="button"
                  onClick={() => void refetchProfile()}
                  className="flex items-center gap-1 text-primary hover:underline hover:text-primary/80 transition-colors"
                  title="Force refetch on-chain state"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Check again</span>
                </button>
              </div>
            )}

            {/* Unresolved username warning */}
            {!isResolving && isUsernameInput && !resolvedAddress && (
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
