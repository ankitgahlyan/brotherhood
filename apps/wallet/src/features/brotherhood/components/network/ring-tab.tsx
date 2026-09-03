/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState } from 'react';
import { Address } from '@ton/core';
import { Button } from '@/core/components/ui/button';
import { useFormatAddress } from '@/core/utils/formatters';
import type { InvitedMemberEntry } from '../../hooks/use-fi-account';
import {
  useMemberProfiles,
  type MemberProfileInfo,
} from '../../hooks/use-member-profiles';
import { useRingInvitees } from '../../hooks/use-ring-invitees';

export interface RingTabProps {
  circleMembers: InvitedMemberEntry[];
  circleProfiles?: Record<string, MemberProfileInfo>;
  isLoading?: boolean;
  onSelectMember: (addressString: string) => void;
  onNavigateToInvite: () => void;
}

interface RingInviterAccordionItemProps {
  circleMember: InvitedMemberEntry;
  circleProfile?: MemberProfileInfo;
  isExpanded: boolean;
  onToggle: () => void;
  onSelectMember: (addressString: string) => void;
}

const RingInviterAccordionItem: React.FC<RingInviterAccordionItemProps> = ({
  circleMember,
  circleProfile,
  isExpanded,
  onToggle,
  onSelectMember,
}) => {
  const { network, formatContractAddress } = useFormatAddress();
  const inviterUsername = circleProfile?.username
    ? `@${circleProfile.username}`
    : '@member';

  const formatShortContract = (addr: Address | string | null | undefined) => {
    if (!addr) return 'None';
    return formatContractAddress(addr, true, 4);
  };

  const { invitees, isLoading, error, refetch } = useRingInvitees(
    circleMember.addressString,
    isExpanded,
  );

  const inviteeAddresses = invitees.map((i) => i.addressString);
  const resolvedRingProfiles = useMemberProfiles(
    inviteeAddresses,
    network === 'mainnet' ? 'mainnet' : 'testnet',
  );

  return (
    <div className="border border-border/60 rounded-xl overflow-hidden bg-secondary/30">
      {/* Accordion Header */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-3 flex justify-between items-center text-left hover:bg-secondary/60 transition-colors cursor-pointer"
      >
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm text-foreground">
              Invited by {inviterUsername}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              ({formatShortContract(circleMember.addressString)})
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground block">
            {isExpanded
              ? isLoading
                ? 'Loading 2nd-degree invitees…'
                : `${invitees.length} 2nd-degree ${invitees.length === 1 ? 'member' : 'members'}`
              : 'Click to expand 2nd-degree invitees'}
          </span>
        </div>
        <span
          className={`text-xs text-muted-foreground font-semibold px-2 py-1 rounded-lg bg-secondary/60 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        >
          ▼
        </span>
      </button>

      {/* Accordion Body (Lazy loaded on expand) */}
      {isExpanded && (
        <div className="p-2.5 pt-0 space-y-1.5 border-t border-border/40 bg-background/50">
          {isLoading ? (
            <div className="space-y-1.5 py-2">
              <div className="h-12 bg-secondary/40 rounded-lg animate-pulse" />
              <div className="h-12 bg-secondary/40 rounded-lg animate-pulse" />
            </div>
          ) : error ? (
            <div className="py-3 px-2 text-center space-y-1">
              <p className="text-xs text-destructive">
                Failed to load 2nd-degree invitees
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetch()}
                className="text-xs h-7"
              >
                Retry
              </Button>
            </div>
          ) : invitees.length === 0 ? (
            <div className="py-4 text-center">
              <p className="text-xs text-muted-foreground">
                No 2nd-degree invitees under {inviterUsername} yet.
              </p>
            </div>
          ) : (
            <div className="space-y-1.5 pt-1.5 max-h-64 overflow-y-auto">
              {invitees.map((entry) => {
                const prof = resolvedRingProfiles.data?.[entry.addressString];
                const username = prof?.username
                  ? `@${prof.username}`
                  : '@member';
                const isActive = prof?.active ?? false;

                return (
                  <button
                    key={entry.addressString}
                    type="button"
                    onClick={() => onSelectMember(entry.addressString)}
                    className="w-full text-left p-2.5 bg-secondary/40 hover:bg-secondary/80 border border-border/50 hover:border-primary/30 rounded-lg transition-all flex justify-between items-center group cursor-pointer"
                  >
                    <div className="space-y-0.5">
                      <span className="font-semibold text-xs text-foreground block group-hover:text-primary transition-colors">
                        {username}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground block">
                        {formatShortContract(entry.addressString)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${
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
          )}
        </div>
      )}
    </div>
  );
};

export const RingTab: React.FC<RingTabProps> = ({
  circleMembers,
  circleProfiles,
  isLoading = false,
  onSelectMember,
  onNavigateToInvite,
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  if (isLoading) {
    return (
      <div className="space-y-2 py-2">
        <div className="h-16 bg-secondary/40 rounded-xl animate-pulse" />
        <div className="h-16 bg-secondary/40 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (circleMembers.length === 0) {
    return (
      <div className="py-8 px-4 text-center space-y-3 bg-secondary/20 border border-border/50 rounded-2xl">
        <div className="w-10 h-10 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary text-lg">
          ⭕
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground">
            No Ring Invitees Yet
          </h4>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
            Your Ring represents 2nd-degree invitees (members invited by your
            Circle). You need active Circle members before Ring branches can
            grow.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={onNavigateToInvite}
          className="text-xs"
        >
          Invite to Circle
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center px-1">
        <span className="text-xs font-semibold text-foreground">
          Ring Branches ({circleMembers.length} Circle {circleMembers.length === 1 ? 'inviter' : 'inviters'})
        </span>
        <span className="text-[11px] text-muted-foreground">
          Expand inviter to view Ring members
        </span>
      </div>

      <div className="space-y-2 max-h-105 overflow-y-auto">
        {circleMembers.map((member, index) => {
          const prof = circleProfiles?.[member.addressString];
          const isExpanded = expandedIndex === index;

          return (
            <RingInviterAccordionItem
              key={member.addressString}
              circleMember={member}
              circleProfile={prof}
              isExpanded={isExpanded}
              onToggle={() =>
                setExpandedIndex(isExpanded ? null : index)
              }
              onSelectMember={onSelectMember}
            />
          );
        })}
      </div>
    </div>
  );
};
