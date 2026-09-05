/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { Button } from '@/core/components/ui/button';
import { CopyButton } from '@/core/components/ui/copy-button';
import { TelegramIcon } from '@/core/components/ui/icons';
import { openTelegramProfile } from '@/core/utils/telegram';
import { useFormatAddress } from '@/core/utils/formatters';
import type { MemberProfileInfo } from '../../hooks/use-member-profiles';

export function formatFi(amountNano: bigint | undefined | null): string {
  if (amountNano === undefined || amountNano === null) return '0';
  const whole = amountNano / 1_000_000_000n;
  const frac = (amountNano % 1_000_000_000n) / 1_000_000n;
  if (frac === 0n) return whole.toLocaleString();
  return `${whole.toLocaleString()}.${frac.toString().padStart(3, '0').replace(/0+$/, '')}`;
}

export interface CreditMemberCardProps {
  profile: MemberProfileInfo;
  inviterUsername?: string;
  degree?: 'circle' | 'ring';
  onSendCredit: (ownerAddress: string, creditNeed: bigint) => void;
}

export const CreditMemberCard: React.FC<CreditMemberCardProps> = ({
  profile,
  inviterUsername,
  degree = 'circle',
  onSendCredit,
}) => {
  const { formatWalletAddress, formatContractAddress } = useFormatAddress();
  const username = profile.username ? `@${profile.username}` : '@member';

  // Target address is borrower's Owner address; fallback to contract address if not resolved
  const targetAddress = profile.ownerAddress || profile.address;
  const displayAddress = profile.ownerAddress
    ? formatWalletAddress(profile.ownerAddress, true, 4)
    : formatContractAddress(profile.address, true, 4);

  return (
    <div className="p-3 bg-card border border-border/70 rounded-xl space-y-2.5 hover:border-border transition-colors shadow-xs">
      {/* Header: Username & Lineage/Degree Badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            role="button"
            tabIndex={0}
            onClick={() => {
              if (profile.username) openTelegramProfile(profile.username);
            }}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && profile.username) {
                openTelegramProfile(profile.username);
              }
            }}
            className={`font-semibold text-sm truncate ${
              profile.username
                ? 'text-foreground hover:text-primary hover:underline cursor-pointer'
                : 'text-muted-foreground'
            }`}
            title={
              profile.username
                ? `Open @${profile.username} on Telegram`
                : undefined
            }
          >
            {username}
          </span>
          {profile.username && (
            <button
              type="button"
              onClick={() => openTelegramProfile(profile.username)}
              className="text-primary hover:opacity-80 transition-opacity p-0.5"
              aria-label={`Open @${profile.username} on Telegram`}
            >
              <TelegramIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {inviterUsername && (
            <span className="text-[10px] bg-secondary/80 text-muted-foreground px-2 py-0.5 rounded-full border border-border/50 truncate max-w-[120px]">
              via {inviterUsername}
            </span>
          )}
          <span
            className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
              degree === 'circle'
                ? 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400'
                : 'bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400'
            }`}
          >
            {degree === 'circle' ? 'Circle (1st)' : 'Ring (2nd)'}
          </span>
        </div>
      </div>

      {/* Address & Copy */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5 font-mono">
          <span className="text-[11px] text-muted-foreground/80">Owner:</span>
          <span className="font-semibold text-foreground text-[11px]">
            {displayAddress}
          </span>
          <CopyButton address={targetAddress} type="wallet" size="xs" />
        </div>
      </div>

      {/* Credit Need & Multiplier Metrics */}
      <div className="grid grid-cols-2 gap-2 text-xs bg-secondary/40 p-2 rounded-lg border border-border/40">
        <div>
          <span className="text-[10px] text-muted-foreground block font-medium">
            Credit Need
          </span>
          <span className="font-bold text-foreground text-xs">
            {formatFi(profile.creditNeed)} FI
          </span>
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground block font-medium">
            Credit Multiplier
          </span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">
            {profile.multiplier}x{' '}
            <span className="text-[10px] text-muted-foreground font-normal">
              Tokens/FI
            </span>
          </span>
        </div>
      </div>

      {/* Action Button */}
      <Button
        size="sm"
        variant="primary"
        fullWidth
        onClick={() => onSendCredit(targetAddress, profile.creditNeed)}
        className="text-xs h-8"
        data-testid={`credit-send-${profile.address}`}
      >
        Send Credit
      </Button>
    </div>
  );
};
