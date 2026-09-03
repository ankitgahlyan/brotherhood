/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { Address } from '@ton/core';
import { Button } from '@/core/components/ui/button';
import { TelegramIcon } from '@/core/components/ui/icons';
import { openTelegramProfile } from '@/core/utils/telegram';
import { useFormatAddress } from '@/core/utils/formatters';
import type { InvitedMemberEntry } from '../../hooks/use-fi-account';
import type { MemberProfileInfo } from '../../hooks/use-member-profiles';

export interface CircleTabProps {
  invitedMembers: InvitedMemberEntry[];
  resolvedProfiles?: Record<string, MemberProfileInfo>;
  isLoading?: boolean;
  onSelectMember: (addressString: string) => void;
  onNavigateToInvite: () => void;
}

export const CircleTab: React.FC<CircleTabProps> = ({
  invitedMembers,
  resolvedProfiles,
  isLoading = false,
  onSelectMember,
  onNavigateToInvite,
}) => {
  const { formatContractAddress } = useFormatAddress();

  const formatShortContract = (addr: Address | string | null | undefined) => {
    if (!addr) return 'None';
    return formatContractAddress(addr, true, 4);
  };

  if (isLoading) {
    return (
      <div className="space-y-2 py-2">
        <div className="h-14 bg-secondary/40 rounded-xl animate-pulse" />
        <div className="h-14 bg-secondary/40 rounded-xl animate-pulse" />
        <div className="h-14 bg-secondary/40 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (invitedMembers.length === 0) {
    return (
      <div className="py-8 px-4 text-center space-y-3 bg-secondary/20 border border-border/50 rounded-2xl">
        <div className="w-10 h-10 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary text-lg">
          👥
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground">
            Your Circle is Empty
          </h4>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
            You haven't directly invited any members yet. Inviting new members
            grows your 1st-degree trust circle and mints FI rewards.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={onNavigateToInvite}
          className="text-xs"
        >
          Invite a Member
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center px-1">
        <span className="text-xs font-semibold text-foreground">
          Direct Invitees ({invitedMembers.length})
        </span>
        <span className="text-[11px] text-muted-foreground">
          Click any member to inspect
        </span>
      </div>

      <div className="space-y-1.5 max-h-105 overflow-y-auto">
        {invitedMembers.map((entry) => {
          const prof = resolvedProfiles?.[entry.addressString];
          const username = prof?.username ? `@${prof.username}` : '@member';
          const isActive = prof?.active ?? false;

          return (
            <button
              key={entry.addressString}
              type="button"
              onClick={() => onSelectMember(entry.addressString)}
              className="w-full text-left p-3 bg-secondary/40 hover:bg-secondary/70 border border-border/50 hover:border-primary/30 rounded-xl transition-all flex justify-between items-center group cursor-pointer"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                    {username}
                  </span>
                  {prof?.username && (
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        openTelegramProfile(prof.username!);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.stopPropagation();
                          openTelegramProfile(prof.username!);
                        }
                      }}
                      className="p-1 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                      title={`Open @${prof.username} on Telegram`}
                      aria-label={`Open @${prof.username} on Telegram`}
                    >
                      <TelegramIcon className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
                <span className="font-mono text-[11px] text-muted-foreground block">
                  {formatShortContract(entry.addressString)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : 'bg-secondary text-muted-foreground border border-border'
                  }`}
                >
                  {isActive ? 'Active' : 'Pending'}
                </span>
                <span className="text-muted-foreground text-xs group-hover:translate-x-0.5 transition-transform">
                  →
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
