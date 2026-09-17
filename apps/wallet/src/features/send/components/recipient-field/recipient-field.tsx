/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState } from 'react';
import { QrCode, Check, AlertCircle, Loader2, RefreshCw } from 'lucide-react';

import { Input } from '@/core/components/ui/input';
import { QrScanner } from '@/core/components/ui/qr-scanner/qr-scanner';
import { useFormatAddress } from '@/core/utils/formatters';
import { useAddressUsernameResolution } from '@/core/hooks/use-address-username-resolution';

interface RecipientFieldProps {
  value: string;
  onChange: (value: string) => void;
  onResolvedAddressChange?: (address: string | null) => void;
  error?: string;
  /** When provided, renders a "Use my address" shortcut in the header. */
  onUseMyAddress?: () => void;
}

/**
 * Recipient field supporting Owner address or @username entry with automatic
 * localStorage caching, on-chain FiWallet profile resolution, and force refetch.
 */
export const RecipientField: React.FC<RecipientFieldProps> = ({
  value,
  onChange,
  onResolvedAddressChange,
  error,
  onUseMyAddress,
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
    net,
  } = useAddressUsernameResolution({
    value,
    onChange,
    onResolvedAddressChange,
    enabled: true,
  });

  return (
    <Input.Container error={Boolean(error)}>
      <Input.Header>
        <Input.Title>Recipient</Input.Title>
        {onUseMyAddress && (
          <button
            type="button"
            onClick={onUseMyAddress}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            data-testid="use-my-address"
          >
            Use my address
          </button>
        )}
      </Input.Header>
      <div className="relative">
        <Input.Field className="flex items-center gap-2 pr-2">
          <Input.Input
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => {
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            placeholder={
              net === 'mainnet'
                ? 'Owner address (UQ…) or @username'
                : 'Owner address (0Q…) or @username'
            }
            data-testid="recipient-input"
          />
          {isResolving && (
            <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />
          )}
          <button
            type="button"
            onClick={() => setIsScannerVisible(true)}
            aria-label="Scan QR code"
            title="Scan QR code"
            className="shrink-0 p-1.5 rounded-full bg-secondary text-primary hover:bg-secondary/80 transition-colors"
          >
            <QrCode className="w-4 h-4" />
          </button>
        </Input.Field>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-xl max-h-40 overflow-y-auto divide-y divide-border">
            {suggestions.map((item) => (
              <button
                key={`${item.username}-${item.address}`}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelectSuggestion(item);
                }}
                className="w-full px-3 py-2 text-left hover:bg-secondary/70 flex items-center justify-between text-xs transition-colors"
              >
                <span className="font-medium text-foreground">
                  @{item.username}
                </span>
                <span className="text-muted-foreground text-[11px] truncate max-w-[180px]">
                  {formatWalletAddress(item.address, false)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Resolved identity pill */}
      {resolvedAddress && (
        <div className="flex items-center justify-between mt-1 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-500">
          <div className="flex items-center gap-1.5 font-medium">
            <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>
              {resolvedUsername ? `@${resolvedUsername}` : 'Verified Owner'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-emerald-400/90 truncate max-w-[180px]">
              {formatWalletAddress(resolvedAddress, false)}
            </span>
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
        <div className="flex items-center justify-between mt-1 px-2 text-muted-foreground text-[11px]">
          <span>No username set for this address</span>
          <button
            type="button"
            onClick={() => void refetchProfile()}
            className="flex items-center gap-1 text-primary hover:underline transition-colors"
            title="Force refetch on-chain state"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Check again</span>
          </button>
        </div>
      )}

      {/* Unresolved username warning */}
      {isUsernameInput && !resolvedAddress && !isResolving && (
        <div className="flex items-center gap-1 mt-1 text-xs text-amber-500">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>
            Username not found in saved contacts. Please enter owner address.
          </span>
        </div>
      )}

      {error && <Input.Caption>{error}</Input.Caption>}

      <QrScanner
        isVisible={isScannerVisible}
        onClose={() => setIsScannerVisible(false)}
        onScan={(scanned) => {
          onChange(scanned);
          setIsScannerVisible(false);
        }}
      />
    </Input.Container>
  );
};
