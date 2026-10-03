/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState, useMemo } from 'react';
import { User, Users, Check, AlertCircle, Globe, X } from 'lucide-react';
import { Input } from '@/core/components/ui/input';
import { useFormatAddress } from '@/core/utils/formatters';
import { getCachedUsername } from '../../lib/contact-storage';
import {
  useContactBookStore,
  EMPTY_CONTACTS_MAP,
} from '@/core/storage/useContactBookStore';
import { isTonChainDns } from '@/core/lib/dns';
import type { PocketMoney } from '@/lib/brotherhood/deploy';
import {
  formatFiCoins,
  formatPocketMoneyPeriod,
  formatPocketMoneyTimestamp,
} from '@/features/brotherhood/hooks/use-set-pocket-money';

export type SenderMode = 'self' | 'other';

interface SenderFieldProps {
  mode: SenderMode;
  onModeChange: (mode: SenderMode) => void;
  granterInput: string;
  onGranterInputChange: (value: string) => void;
  resolvedGranterAddress: string | null;
  allowance: bigint;
  formattedAllowance: string;
  pocketMoney?: PocketMoney | null;
  isAllowanceLoading: boolean;
  userAddress: string | null;
  error?: string;
}

export const SenderField: React.FC<SenderFieldProps> = ({
  mode,
  onModeChange: _onModeChange,
  granterInput,
  onGranterInputChange,
  resolvedGranterAddress,
  allowance: _allowance,
  formattedAllowance,
  pocketMoney,
  isAllowanceLoading,
  userAddress,
  error,
}) => {
  const { network, formatWalletAddress } = useFormatAddress();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [nowMs] = useState(() => Date.now());

  const contactsMap = useContactBookStore(
    (state) => state.contactsByNetwork[network] || EMPTY_CONTACTS_MAP,
  );

  // Suggestions from Contact Book matching granterInput
  const suggestions = useMemo(() => {
    const contacts = Object.values(contactsMap);
    const q = granterInput.trim().replace(/^@+/, '').toLowerCase();
    const list: { username: string; address: string; isDns?: boolean }[] = [];
    for (const c of contacts) {
      if (c.dnsDomain) {
        if (
          !q ||
          c.dnsDomain.toLowerCase().includes(q) ||
          c.address.toLowerCase().includes(q)
        ) {
          list.push({ username: c.dnsDomain, address: c.address, isDns: true });
        }
      }
      const name = c.customName || c.onChainUsername;
      if (name) {
        if (
          !q ||
          name.toLowerCase().includes(q) ||
          c.address.toLowerCase().includes(q)
        ) {
          if (!list.some((l) => l.address === c.address)) {
            list.push({ username: name, address: c.address });
          }
        }
      }
    }
    return list;
  }, [contactsMap, granterInput]);

  const resolvedGranterUsername = useMemo(() => {
    if (!resolvedGranterAddress) return null;
    return getCachedUsername(resolvedGranterAddress, network);
  }, [resolvedGranterAddress, network]);

  const handleSelectSuggestion = (item: {
    username: string;
    address: string;
    isDns?: boolean;
  }) => {
    onGranterInputChange(item.isDns ? item.username : `@${item.username}`);
    setShowSuggestions(false);
  };

  return (
    <Input.Container error={Boolean(error)}>
      <Input.Header>
        <Input.Title>Pocket Money Granter</Input.Title>
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
                placeholder="Granter Owner Address, @username, or .bro domain"
                data-testid="sender-granter-input"
              />
              {granterInput && (
                <button
                  type="button"
                  onClick={() => onGranterInputChange('')}
                  aria-label="Clear granter address"
                  title="Clear granter address"
                  className="shrink-0 p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary/80 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </Input.Field>

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-xl max-h-40 overflow-y-auto divide-y divide-border">
                {suggestions.map((item) => (
                  <button
                    key={`${item.username}-${item.address}`}
                    type="button"
                    onMouseDown={() => handleSelectSuggestion(item)}
                    className="w-full px-3 py-2 text-left hover:bg-secondary/70 flex items-center justify-between text-xs transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      {item.isDns ? (
                        <Globe className="w-3.5 h-3.5 text-primary shrink-0" />
                      ) : (
                        <User className="w-3.5 h-3.5 text-primary shrink-0" />
                      )}
                      <span className="font-medium text-foreground">
                        {item.isDns ? item.username : `@${item.username}`}
                      </span>
                      {item.isDns && (
                        <span className="text-[9px] bg-primary/20 text-primary px-1 py-0.5 rounded font-normal">
                          DNS
                        </span>
                      )}
                    </div>
                    <span className="text-muted-foreground text-[11px] truncate max-w-45">
                      {item.address}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Granter resolution & Pocket Money summary */}
          {resolvedGranterAddress && (
            <div className="flex flex-col gap-1.5 px-3 py-2.5 bg-primary/10 border border-primary/20 rounded-xl text-xs">
              <div className="flex items-center justify-between text-primary">
                <span className="font-medium flex items-center gap-1.5 truncate">
                  {isTonChainDns(granterInput.trim()) ? (
                    <Globe className="w-3.5 h-3.5 text-primary shrink-0" />
                  ) : (
                    <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                  )}
                  <span className="truncate">
                    Granter:{' '}
                    {isTonChainDns(granterInput.trim())
                      ? granterInput.trim()
                      : resolvedGranterUsername
                        ? `@${resolvedGranterUsername}`
                        : 'Valid Owner'}
                  </span>
                </span>
                <span className="text-[11px] font-mono text-primary/80 truncate max-w-37.5 shrink-0 ml-2">
                  {formatWalletAddress(resolvedGranterAddress, false)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1.5 border-t border-primary/20">
                <span className="text-muted-foreground">
                  Spendable Pocket Money Now:
                </span>
                <span className="font-semibold text-foreground">
                  {isAllowanceLoading
                    ? 'Querying on-chain…'
                    : `${formattedAllowance} FI`}
                </span>
              </div>

              {pocketMoney && !isAllowanceLoading && (
                <div className="flex flex-wrap gap-1 pt-1 text-[10px]">
                  {pocketMoney.unrestricted && (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-500 font-medium">
                      ♾️ Unrestricted Access
                    </span>
                  )}
                  {pocketMoney.openRecurring &&
                    pocketMoney.openRecurring.limit > 0n && (
                      <span className="px-1.5 py-0.5 rounded bg-secondary text-foreground">
                        Open:{' '}
                        {formatFiCoins(
                          pocketMoney.openRecurring.limit >
                            pocketMoney.openRecurring.spent
                            ? pocketMoney.openRecurring.limit -
                                pocketMoney.openRecurring.spent
                            : 0n,
                        )}
                        /{formatFiCoins(pocketMoney.openRecurring.limit)} FI (
                        {formatPocketMoneyPeriod(
                          pocketMoney.openRecurring.period,
                        )}
                        )
                      </span>
                    )}
                  {pocketMoney.fixedRecurring &&
                    pocketMoney.fixedRecurring.limit > 0n && (
                      <span className="px-1.5 py-0.5 rounded bg-secondary text-foreground">
                        Fixed:{' '}
                        {formatFiCoins(
                          pocketMoney.fixedRecurring.limit >
                            pocketMoney.fixedRecurring.spent
                            ? pocketMoney.fixedRecurring.limit -
                                pocketMoney.fixedRecurring.spent
                            : 0n,
                        )}
                        /{formatFiCoins(pocketMoney.fixedRecurring.limit)} FI (
                        {formatPocketMoneyPeriod(
                          pocketMoney.fixedRecurring.period,
                        )}{' '}
                        until{' '}
                        {formatPocketMoneyTimestamp(
                          pocketMoney.fixedRecurring.validUntil,
                        )}
                        )
                      </span>
                    )}
                  {pocketMoney.oneTime &&
                    pocketMoney.oneTime.remaining > 0n && (
                      <span className="px-1.5 py-0.5 rounded bg-secondary text-foreground">
                        One-Time: {formatFiCoins(pocketMoney.oneTime.remaining)}{' '}
                        FI
                        {Number(pocketMoney.oneTime.startTime) * 1000 > nowMs
                          ? ` (Cheque unlocks ${formatPocketMoneyTimestamp(pocketMoney.oneTime.startTime)})`
                          : ''}
                      </span>
                    )}
                </div>
              )}
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
