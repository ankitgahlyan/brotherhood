/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState } from 'react';
import type { InvitedMemberEntry } from '../../hooks/use-fi-account';
import type { MemberProfileInfo } from '../../hooks/use-member-profiles';
import { CircleTab } from './circle-tab';
import { RingTab } from './ring-tab';
import { MemberDetailView } from './member-detail-view';

export type NetworkSubTab = 'circle' | 'ring';

export interface NetworkTabProps {
  invitedMembers: InvitedMemberEntry[];
  resolvedProfiles?: Record<string, MemberProfileInfo>;
  isLoading?: boolean;
  onNavigateToInvite: () => void;
  onQuickAction?: (
    action: 'send' | 'vote' | 'allowance',
    targetAddress: string,
  ) => void;
}

export const NetworkTab: React.FC<NetworkTabProps> = ({
  invitedMembers,
  resolvedProfiles,
  isLoading = false,
  onNavigateToInvite,
  onQuickAction,
}) => {
  const [subTab, setSubTab] = useState<NetworkSubTab>('circle');
  const [selectedMemberAddress, setSelectedMemberAddress] = useState<
    string | null
  >(null);

  // If a member is selected, show the full member drilldown inspector view
  if (selectedMemberAddress) {
    return (
      <MemberDetailView
        memberAddress={selectedMemberAddress}
        onBack={() => setSelectedMemberAddress(null)}
        onQuickAction={onQuickAction}
      />
    );
  }

  return (
    <div className="space-y-3 bg-card text-card-foreground p-4 border border-border rounded-2xl shadow-sm text-sm">
      {/* Title & Info */}
      <div>
        <h3 className="font-semibold text-base">Trust Network & Lineage</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Explore your 1st-degree Circle (direct invitees) and 2nd-degree Ring
          (invitees of invitees) within the BrotherHood trust graph.
        </p>
      </div>

      {/* Sub-tabs [Circle | Ring] */}
      <div className="flex gap-1 bg-secondary/70 border border-border p-1 rounded-xl text-xs font-medium">
        <button
          type="button"
          onClick={() => setSubTab('circle')}
          className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
            subTab === 'circle'
              ? 'bg-card shadow-sm text-foreground font-semibold border border-border'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
          }`}
          data-testid="network-subtab-circle"
        >
          Circle ({invitedMembers.length})
        </button>
        <button
          type="button"
          onClick={() => setSubTab('ring')}
          className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
            subTab === 'ring'
              ? 'bg-card shadow-sm text-foreground font-semibold border border-border'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
          }`}
          data-testid="network-subtab-ring"
        >
          Ring
        </button>
      </div>

      {/* Sub-tab content */}
      {subTab === 'circle' ? (
        <CircleTab
          invitedMembers={invitedMembers}
          resolvedProfiles={resolvedProfiles}
          isLoading={isLoading}
          onSelectMember={(addr) => setSelectedMemberAddress(addr)}
          onNavigateToInvite={onNavigateToInvite}
        />
      ) : (
        <RingTab
          circleMembers={invitedMembers}
          circleProfiles={resolvedProfiles}
          isLoading={isLoading}
          onSelectMember={(addr) => setSelectedMemberAddress(addr)}
          onNavigateToInvite={onNavigateToInvite}
        />
      )}
    </div>
  );
};
