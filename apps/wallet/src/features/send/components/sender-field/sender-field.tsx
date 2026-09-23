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
import { useContactBookStore } from '@/core/storage/useContactBookStore';

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

  const contacts = useContactBookStore((state) =>
    state.getContactsList(network),
  );

  // Suggestions from Contact Book matching granterInput
  const suggestions = useMemo(() => {
    const q = granterInput.trim().replace(/^@+/, '').toLowerCase();
    const list: { username: string; address: string }[] = [];
    for (const c of contacts) {
      const name = c.customName || c.onChainUsername;
      if (name) {
        if (
          !q ||
          name.toLowerCase().includes(q) ||
          c.address.toLowerCase().includes(q)
        ) {
          list.push({ username: name, address: c.address });
        }
      }
    }
    return list;
  }, [contacts, granterInput]);

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
        <div className="flex gap-1.5 p-0.5 bg-secondary rounded-lg text-xs font-medium border border-border/50">
          <button
            type="button"
            onClick={() => onModeChange('self')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              mode === 'self'
                ? 'bg-card shadow-xs text-foreground font-semibold border border-border/60'
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
                ? 'bg-card shadow-xs text-foreground font-semibold border border-border/60'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            data-testid="sender-mode-other"
          >
            Spend Allowance
          </button>
        </div>
      </Input.Header>

      {mode === 'self' ? (
        <div className="flex items-center gap-2 p-3 bg-secondary/50 border border-border/80 rounded-xl text-sm text-muted-foreground">
          <User className="w-4 h-4 text-primary shrink-0" />
          <span className="truncate">
            {userAddress
              ? `My Account (${formatWalletAddress(userAddress, true)})`
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
              <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-xl max-h-40 overflow-y-auto divide-y divide-border">
                {suggestions.map((item) => (
                  <button
                    key={item.address}
                    type="button"
                    onMouseDown={() => handleSelectSuggestion(item)}
                    className="w-full px-3 py-2 text-left hover:bg-secondary/70 flex items-center justify-between text-xs transition-colors"
                  >
                    <span className="font-medium text-foreground">
                      @{item.username}
                    </span>
                    <span className="text-muted-foreground text-[11px] truncate max-w-45">
                      {item.address}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Granter resolution & Allowance summary */}
          {resolvedGranterAddress && (
            <div className="flex flex-col gap-1.5 px-3 py-2.5 bg-primary/10 border border-primary/20 rounded-xl text-xs">
              <div className="flex items-center justify-between text-primary">
                <span className="font-medium flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-primary" />
                  Granter:{' '}
                  {resolvedGranterUsername
                    ? `@${resolvedGranterUsername}`
                    : 'Valid Owner'}
                </span>
                <span className="text-[11px] font-mono text-primary/80 truncate max-w-37.5">
                  {formatWalletAddress(resolvedGranterAddress, false)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1.5 border-t border-primary/20">
                <span className="text-muted-foreground">
                  Remaining Allowance:
                </span>
                <span className="font-semibold text-foreground">
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
