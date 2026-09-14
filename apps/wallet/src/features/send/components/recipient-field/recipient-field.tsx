/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState, useEffect, useMemo } from 'react';
import { QrCode, Check, AlertCircle, Loader2 } from 'lucide-react';
import { isValidAddress } from '@ton/walletkit';
import { Address } from '@ton/core';

import { Input } from '@/core/components/ui/input';
import { QrScanner } from '@/core/components/ui/qr-scanner/qr-scanner';
import { useFormatAddress } from '@/core/utils/formatters';
import { getFiWalletState } from '@/lib/brotherhood/ton';
import {
  getCachedUsername,
  getCachedAddressByUsername,
  saveUsernameAddressMapping,
} from '../../lib/contact-storage';

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
 * localStorage caching and on-chain FiWallet profile resolution.
 */
export const RecipientField: React.FC<RecipientFieldProps> = ({
  value,
  onChange,
  onResolvedAddressChange,
  error,
  onUseMyAddress,
}) => {
  const [isScannerVisible, setIsScannerVisible] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [resolvedUsername, setResolvedUsername] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { network, formatWalletAddress } = useFormatAddress();
  const net = network === 'mainnet' ? 'mainnet' : 'testnet';

  const trimmed = value.trim();
  const isDirectAddress = isValidAddress(trimmed);
  const isUsernameInput =
    trimmed.startsWith('@') ||
    (!isDirectAddress && /^[a-zA-Z0-9_]{3,32}$/.test(trimmed));

  // 1. Suggestions from localStorage
  const suggestions = useMemo(() => {
    if (
      typeof window === 'undefined' ||
      !window.localStorage ||
      !isUsernameInput
    )
      return [];
    try {
      const raw = localStorage.getItem(`brotherhood_usernames_${net}`);
      if (!raw) return [];
      const mapping = JSON.parse(raw) as Record<string, string>;
      const q = trimmed.replace(/^@+/, '').toLowerCase();
      return Object.entries(mapping)
        .filter(([uname]) => (q ? uname.includes(q) : true))
        .map(([uname, addr]) => ({ username: uname, address: addr }));
    } catch {
      return [];
    }
  }, [trimmed, isUsernameInput, net]);

  // 2. Resolve username / address
  useEffect(() => {
    let isCancelled = false;

    if (!trimmed) {
      setResolvedUsername(null);
      onResolvedAddressChange?.(null);
      setIsResolving(false);
      return;
    }

    if (isDirectAddress) {
      // Input is an Owner address
      onResolvedAddressChange?.(trimmed);

      // Check localStorage first
      const cached = getCachedUsername(trimmed, net);
      if (cached) {
        setResolvedUsername(cached);
        setIsResolving(false);
        return;
      }

      // Not in localStorage: query on-chain FiWallet every time
      setResolvedUsername(null);
      setIsResolving(true);

      const timer = setTimeout(async () => {
        try {
          const parsed = Address.parse(trimmed);
          const fiState = await getFiWalletState(parsed, { net });
          if (isCancelled) return;

          const uname = (fiState as any)?.profile?.username;
          if (uname && typeof uname === 'string' && uname.trim().length > 0) {
            const clean = uname.trim().replace(/^@+/, '');
            setResolvedUsername(clean);
            // Save to localStorage for future suggestions
            saveUsernameAddressMapping(clean, trimmed, net);
          } else {
            // No username on-chain, do not cache empty
            setResolvedUsername(null);
          }
        } catch (_err) {
          if (!isCancelled) {
            setResolvedUsername(null);
          }
        } finally {
          if (!isCancelled) {
            setIsResolving(false);
          }
        }
      }, 400);

      return () => {
        isCancelled = true;
        clearTimeout(timer);
      };
    }

    if (isUsernameInput) {
      // Input is a username
      const clean = trimmed.replace(/^@+/, '');
      const cachedAddr = getCachedAddressByUsername(clean, net);
      if (cachedAddr) {
        setResolvedUsername(clean);
        onResolvedAddressChange?.(cachedAddr);
      } else {
        setResolvedUsername(null);
        onResolvedAddressChange?.(null);
      }
      setIsResolving(false);
      return;
    }

    // Neither direct address nor username
    setResolvedUsername(null);
    onResolvedAddressChange?.(null);
    setIsResolving(false);
  }, [trimmed, isDirectAddress, isUsernameInput, net, onResolvedAddressChange]);

  const handleSelectSuggestion = (item: {
    username: string;
    address: string;
  }) => {
    onChange(`@${item.username}`);
    onResolvedAddressChange?.(item.address);
    setResolvedUsername(item.username);
    setShowSuggestions(false);
  };

  const resolvedAddress = isDirectAddress
    ? trimmed
    : isUsernameInput
      ? getCachedAddressByUsername(trimmed.replace(/^@+/, ''), net)
      : null;

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
            <Loader2 className="w-4 h-4 text-blue-500 animate-spin shrink-0" />
          )}
          <button
            type="button"
            onClick={() => setIsScannerVisible(true)}
            aria-label="Scan QR code"
            title="Scan QR code"
            className="shrink-0 p-1.5 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <QrCode className="w-4 h-4 text-blue-600" />
          </button>
        </Input.Field>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-40 overflow-y-auto divide-y divide-gray-100">
            {suggestions.map((item) => (
              <button
                key={item.address}
                type="button"
                onMouseDown={() => handleSelectSuggestion(item)}
                className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between text-xs"
              >
                <span className="font-medium text-foreground">
                  @{item.username}
                </span>
                <span className="text-muted-foreground text-[11px] truncate max-w-[180px]">
                  {item.address}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Resolved identity pill */}
      {resolvedAddress && (
        <div className="flex items-center justify-between mt-1 px-3 py-1.5 bg-green-50/80 border border-green-200/60 rounded-lg text-xs text-green-900">
          <div className="flex items-center gap-1.5 font-medium">
            <Check className="w-3.5 h-3.5 text-green-600" />
            <span>
              {resolvedUsername ? `@${resolvedUsername}` : 'Verified Owner'}
            </span>
          </div>
          <span className="text-[11px] font-mono text-green-800 truncate max-w-[180px]">
            {formatWalletAddress(resolvedAddress, false)}
          </span>
        </div>
      )}

      {/* Unresolved username warning */}
      {isUsernameInput && !resolvedAddress && !isResolving && (
        <div className="flex items-center gap-1 mt-1 text-xs text-amber-600">
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
