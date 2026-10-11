/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useMemo } from 'react';
import { MapPin } from 'lucide-react';
import { RefreshButton } from '@/core/components/ui/refresh-button';
import { useLocationCredit } from '../../hooks/use-location-credit';
import {
  useMemberProfiles,
  type MemberProfileInfo,
} from '../../hooks/use-member-profiles';
import { CreditMemberCard } from './credit-member-card';

export interface LocationCreditListProps {
  h3Cell: string | null | undefined;
  onSendCredit: (ownerAddress: string, creditNeed: bigint) => void;
  onRegisterLocationMembers?: (members: MemberProfileInfo[]) => void;
}

export const LocationCreditList: React.FC<LocationCreditListProps> = ({
  h3Cell,
  onSendCredit,
  onRegisterLocationMembers,
}) => {
  const { entries, isLoading, isDeployed } = useLocationCredit(h3Cell);

  // Extract unique borrower owner addresses from LocationCredit entries
  const borrowerAddresses = useMemo(() => {
    return Array.from(new Set(entries.map((e) => e.borrowerAddress)));
  }, [entries]);

  const {
    data: borrowerProfiles,
    isLoading: isProfilesLoading,
    refetch: refetchProfiles,
  } = useMemberProfiles(borrowerAddresses);

  // Map entries into enriched MemberProfileInfo objects
  const creditMembers = useMemo<MemberProfileInfo[]>(() => {
    const list: MemberProfileInfo[] = [];
    for (const entry of entries) {
      const existingProfile = borrowerProfiles?.[entry.borrowerAddress];
      const profile: MemberProfileInfo = {
        address: existingProfile?.address || entry.borrowerAddress,
        ownerAddress: entry.borrowerAddress,
        username: existingProfile?.username ?? '',
        dnsDomain: existingProfile?.dnsDomain,
        contactLink: existingProfile?.contactLink,
        h3Cell: existingProfile?.h3Cell ?? h3Cell ?? '',
        country: existingProfile?.country ?? 0,
        active: existingProfile?.active ?? true,
        status: existingProfile?.status ?? 0,
        creditNeed: entry.amount,
        multiplier: entry.multiplier,
        creditCutoff: entry.cutoffDate,
        creditMaturity: entry.maturityDate,
        jettonBalance: existingProfile?.jettonBalance ?? 0n,
        personalJettonMinter: existingProfile?.personalJettonMinter,
      };
      list.push(profile);
    }
    return list;
  }, [entries, borrowerProfiles, h3Cell]);

  React.useEffect(() => {
    if (creditMembers.length > 0 && onRegisterLocationMembers) {
      onRegisterLocationMembers(creditMembers);
    }
  }, [creditMembers, onRegisterLocationMembers]);

  if (!h3Cell) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-foreground flex items-center gap-1.5">
              Location Credit Requests
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                {creditMembers.length}
              </span>
            </h4>
            <p className="text-[11px] text-muted-foreground">
              Seekers indexed in your H3 spatial cell ({h3Cell.slice(0, 7)}…)
            </p>
          </div>
        </div>

        <RefreshButton
          iconOnly
          onRefresh={() => refetchProfiles()}
          title="Refresh Location credit requests"
          ariaLabel="Refresh Location credit requests"
        />
      </div>

      {/* Content List / Empty State */}
      {isLoading || isProfilesLoading ? (
        <div className="p-4 text-center text-xs text-muted-foreground bg-secondary/30 rounded-xl border border-border/50">
          Loading location credit requests…
        </div>
      ) : creditMembers.length === 0 ? (
        <div className="p-4 text-center text-xs text-muted-foreground bg-secondary/30 rounded-xl border border-border/50">
          {!isDeployed
            ? 'No location credit contract deployed yet for this spatial cell.'
            : 'No active credit requests found in your location.'}
        </div>
      ) : (
        <div className="space-y-2">
          {creditMembers.map((member) => (
            <CreditMemberCard
              key={`${member.ownerAddress}-${member.address}`}
              profile={member}
              degree="location"
              onSendCredit={onSendCredit}
            />
          ))}
        </div>
      )}
    </div>
  );
};
