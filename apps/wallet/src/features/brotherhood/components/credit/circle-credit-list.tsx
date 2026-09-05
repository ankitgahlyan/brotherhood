/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { RefreshCw, Users } from 'lucide-react';
import type { InvitedMemberEntry } from '../../hooks/use-fi-account';
import type { MemberProfileInfo } from '../../hooks/use-member-profiles';
import { CreditMemberCard } from './credit-member-card';

export interface CircleCreditListProps {
  circleMembers: InvitedMemberEntry[];
  profiles?: Record<string, MemberProfileInfo>;
  isLoading?: boolean;
  onRefresh?: () => void;
  onSendCredit: (ownerAddress: string, creditNeed: bigint) => void;
}

export const CircleCreditList: React.FC<CircleCreditListProps> = ({
  circleMembers,
  profiles,
  isLoading = false,
  onRefresh,
  onSendCredit,
}) => {
  // Members who have an active credit request (creditNeed > 0n)
  const creditMembers = circleMembers
    .map((m) => profiles?.[m.addressString])
    .filter(
      (p): p is MemberProfileInfo =>
        p !== undefined && p.creditNeed !== undefined && p.creditNeed > 0n,
    );

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-foreground flex items-center gap-1.5">
              Circle Credit Requests
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                {creditMembers.length}
              </span>
            </h4>
            <p className="text-[11px] text-muted-foreground">
              Direct invitees (1st-degree) seeking FI credit loans
            </p>
          </div>
        </div>

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh Circle credit requests"
            aria-label="Refresh Circle credit requests"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`}
            />
          </button>
        )}
      </div>

      {/* Content List / Empty State */}
      {creditMembers.length > 0 ? (
        <div className="space-y-2">
          {creditMembers.map((profile) => (
            <CreditMemberCard
              key={profile.address}
              profile={profile}
              degree="circle"
              onSendCredit={onSendCredit}
            />
          ))}
        </div>
      ) : (
        <div className="p-4 bg-secondary/30 border border-dashed border-border/80 rounded-xl text-center space-y-1">
          <p className="text-xs font-medium text-muted-foreground">
            No Circle members are currently requesting credit
          </p>
          <p className="text-[11px] text-muted-foreground/80">
            You can still extend credit to any Circle or Ring member by
            selecting them in the form below.
          </p>
        </div>
      )}
    </div>
  );
};
