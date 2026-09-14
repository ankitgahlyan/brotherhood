/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState, useMemo } from 'react';
import { User, Users, Check, AlertCircle } from 'lucide-react';
import { Input } from '@/core/components/ui/input';
import { useFormatAddress } from '@/core/utils/formatters';
import { getCachedUsername } from '../../lib/contact-storage';

export type SenderMode = 'self' | 'other';

interface SenderFieldProps {
  mode: SenderMode;
  onModeChange: (mode: SenderMode) => void;
  granterInput: string;
  onGranterInputChange: (value: string) => void;
  resolvedGranterAddress: string | null;
  allowance: bigint;
  formattedAllowance: string;
  isAllowanceLoading: boolean;
  userAddress: string | null;
  error?: string;
}

export const SenderField: React.FC<SenderFieldProps> = ({
  mode,
  onModeChange,
  granterInput,
  onGranterInputChange,
  resolvedGranterAddress,
  allowance: _allowance,
  formattedAllowance,
  isAllowanceLoading,
  userAddress,
  error,
}) => {
  const { network, formatWalletAddress } = useFormatAddress();
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Suggestions from localStorage matching granterInput
  const suggestions = useMemo(() => {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    try {
      const raw = localStorage.getItem(`brotherhood_usernames_${network}`);
      if (!raw) return [];
      const mapping = JSON.parse(raw) as Record<string, string>;
      const q = granterInput.trim().replace(/^@+/, '').toLowerCase();
      return Object.entries(mapping)
        .filter(([uname]) => (q ? uname.includes(q) : true))
        .map(([uname, addr]) => ({ username: uname, address: addr }));
    } catch {
      return [];
    }
  }, [granterInput, network]);

  const resolvedGranterUsername = useMemo(() => {
    if (!resolvedGranterAddress) return null;
    return getCachedUsername(resolvedGranterAddress, network);
  }, [resolvedGranterAddress, network]);

  const handleSelectSuggestion = (item: {
    username: string;
    address: string;
  }) => {
    onGranterInputChange(`@${item.username}`);
    setShowSuggestions(false);
  };

  return (
    <Input.Container error={Boolean(error)}>
      <Input.Header>
        <Input.Title>Sender</Input.Title>
        <div className="flex gap-1.5 p-0.5 bg-gray-100 rounded-lg text-xs font-medium">
          <button
            type="button"
            onClick={() => onModeChange('self')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              mode === 'self'
                ? 'bg-white shadow-sm text-foreground font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            data-testid="sender-mode-self"
          >
            Self
          </button>
          <button
            type="button"
            onClick={() => onModeChange('other')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              mode === 'other'
                ? 'bg-white shadow-sm text-foreground font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            data-testid="sender-mode-other"
          >
            Spend Allowance
          </button>
        </div>
      </Input.Header>

      {mode === 'self' ? (
        <div className="flex items-center gap-2 p-3 bg-gray-50/80 border border-gray-200/60 rounded-xl text-sm text-muted-foreground">
          <User className="w-4 h-4 text-primary shrink-0" />
          <span className="truncate">
            {userAddress
              ? `My Account (${formatWalletAddress(userAddress, false)})`
              : 'Connected Account'}
          </span>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="relative">
            <Input.Field className="flex items-center gap-2 pr-2">
              <Users className="w-4 h-4 text-muted-foreground shrink-0 ml-1" />
              <Input.Input
                value={granterInput}
                onChange={(e) => {
                  onGranterInputChange(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => {
                  // Small delay to allow click on suggestions
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
                placeholder="Granter Owner Address or @username"
                data-testid="sender-granter-input"
              />
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

          {/* Granter resolution & Allowance summary */}
          {resolvedGranterAddress && (
            <div className="flex flex-col gap-1 px-3 py-2 bg-blue-50/70 border border-blue-100 rounded-xl text-xs">
              <div className="flex items-center justify-between text-blue-900">
                <span className="font-medium flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-blue-600" />
                  Granter:{' '}
                  {resolvedGranterUsername
                    ? `@${resolvedGranterUsername}`
                    : 'Valid Owner'}
                </span>
                <span className="text-[11px] text-blue-700 truncate max-w-[150px]">
                  {formatWalletAddress(resolvedGranterAddress, false)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-blue-200/50">
                <span className="text-blue-800">Remaining Allowance:</span>
                <span className="font-semibold text-blue-950">
                  {isAllowanceLoading
                    ? 'Querying on-chain…'
                    : `${formattedAllowance} FI`}
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-1 text-xs text-red-500 mt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      )}
    </Input.Container>
  );
};
