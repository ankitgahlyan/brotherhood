/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Network as NetworkIcon,
  Loader2,
} from 'lucide-react';
import { useFormatAddress } from '@/core/utils/formatters';
import type { InvitedMemberEntry } from '../../hooks/use-fi-account';
import {
  useMemberProfiles,
  type MemberProfileInfo,
} from '../../hooks/use-member-profiles';
import { useRingInvitees } from '../../hooks/use-ring-invitees';
import { CreditMemberCard } from './credit-member-card';

interface RingCreditAccordionItemProps {
  circleMember: InvitedMemberEntry;
  circleProfile?: MemberProfileInfo;
  isExpanded: boolean;
  onToggle: () => void;
  onSendCredit: (ownerAddress: string, creditNeed: bigint) => void;
  onRegisterRingMembers?: (members: MemberProfileInfo[]) => void;
}

const RingCreditAccordionItem: React.FC<RingCreditAccordionItemProps> = ({
  circleMember,
  circleProfile,
  isExpanded,
  onToggle,
  onSendCredit,
  onRegisterRingMembers,
}) => {
  const { network } = useFormatAddress();
  const inviterUsername = circleProfile?.username
    ? `@${circleProfile.username}`
    : '@member';

  const {
    invitees,
    isLoading: isInviteesLoading,
    refetch: refetchInvitees,
  } = useRingInvitees(circleMember.addressString, isExpanded);

  const inviteeAddresses = invitees.map((i) => i.addressString);
  const {
    data: ringProfiles,
    isLoading: isProfilesLoading,
    refetch: refetchProfiles,
  } = useMemberProfiles(
    inviteeAddresses,
    network === 'mainnet' ? 'mainnet' : 'testnet',
  );

  const isLoading = isInviteesLoading || isProfilesLoading;

  // Filter for members with active credit need
  const creditMembers = invitees
    .map((i) => ringProfiles?.[i.addressString])
    .filter(
      (p): p is MemberProfileInfo =>
        p !== undefined && p.creditNeed !== undefined && p.creditNeed > 0n,
    );

  // Register all discovered Ring member profiles upward for the combobox
  useEffect(() => {
    if (
      ringProfiles &&
      Object.keys(ringProfiles).length > 0 &&
      onRegisterRingMembers
    ) {
      const allProfiles = Object.values(ringProfiles);
      onRegisterRingMembers(allProfiles);
    }
  }, [ringProfiles, onRegisterRingMembers]);

  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    refetchInvitees();
    refetchProfiles();
  };

  return (
    <div className="border border-border/70 rounded-xl overflow-hidden bg-card transition-colors">
      {/* Accordion Header */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-3 flex justify-between items-center text-left hover:bg-secondary/40 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2 min-w-0">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
          )}
          <span className="font-semibold text-xs text-foreground truncate">
            Invited by {inviterUsername}
          </span>
          {isExpanded && creditMembers.length > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 border border-purple-500/20 dark:text-purple-400">
              {creditMembers.length}{' '}
              {creditMembers.length === 1 ? 'request' : 'requests'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors cursor-pointer disabled:opacity-50"
            title={`Refresh invitees for ${inviterUsername}`}
            aria-label={`Refresh invitees for ${inviterUsername}`}
          >
            <RefreshCw
              className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`}
            />
          </button>
          <span className="text-[11px] text-muted-foreground">
            {isExpanded
              ? isLoading
                ? 'Loading...'
                : `${invitees.length} in Ring`
              : 'Click to inspect'}
          </span>
        </div>
      </button>

      {/* Accordion Body */}
      {isExpanded && (
        <div className="p-3 border-t border-border/60 bg-secondary/15 space-y-2">
          {isLoading && invitees.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              Scanning Ring invitees for credit requests...
            </div>
          ) : creditMembers.length > 0 ? (
            <div className="space-y-2">
              {creditMembers.map((profile) => (
                <CreditMemberCard
                  key={profile.address}
                  profile={profile}
                  inviterUsername={inviterUsername}
                  degree="ring"
                  onSendCredit={onSendCredit}
                />
              ))}
            </div>
          ) : (
            <div className="p-3 text-center text-xs text-muted-foreground bg-background/50 rounded-lg border border-border/40">
              {invitees.length === 0
                ? `${inviterUsername} has not invited anyone into their Ring yet.`
                : `No members in ${inviterUsername}'s Ring are currently requesting credit.`}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export interface RingCreditListProps {
  circleMembers: InvitedMemberEntry[];
  circleProfiles?: Record<string, MemberProfileInfo>;
  onSendCredit: (ownerAddress: string, creditNeed: bigint) => void;
  onRegisterRingMembers?: (members: MemberProfileInfo[]) => void;
}

export const RingCreditList: React.FC<RingCreditListProps> = ({
  circleMembers,
  circleProfiles,
  onSendCredit,
  onRegisterRingMembers,
}) => {
  const [expandedAddress, setExpandedAddress] = useState<string | null>(null);

  const toggleAccordion = (address: string) => {
    setExpandedAddress((curr) => (curr === address ? null : address));
  };

  if (circleMembers.length === 0) {
    return (
      <div className="p-4 bg-secondary/30 border border-dashed border-border/80 rounded-xl text-center space-y-1">
        <p className="text-xs font-medium text-muted-foreground">
          Your Ring is empty
        </p>
        <p className="text-[11px] text-muted-foreground/80">
          Invite members to build your Circle and extend trust to 2nd-degree
          Ring members.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <NetworkIcon className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-foreground flex items-center gap-1.5">
              Ring Credit Requests
            </h4>
            <p className="text-[11px] text-muted-foreground">
              2nd-degree members (invitees of invitees) seeking FI credit loans
            </p>
          </div>
        </div>
      </div>

      {/* Accordion Group by Circle Member */}
      <div className="space-y-2">
        {circleMembers.map((member) => (
          <RingCreditAccordionItem
            key={member.addressString}
            circleMember={member}
            circleProfile={circleProfiles?.[member.addressString]}
            isExpanded={expandedAddress === member.addressString}
            onToggle={() => toggleAccordion(member.addressString)}
            onSendCredit={onSendCredit}
            onRegisterRingMembers={onRegisterRingMembers}
          />
        ))}
      </div>
    </div>
  );
};
