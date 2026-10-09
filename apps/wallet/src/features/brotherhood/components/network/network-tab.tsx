/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState } from 'react';
import type { Address } from '@ton/core';
import { SwipeableSubTabs } from '@/core/components/shared/swipeable-sub-tabs';
import type { InvitedMemberEntry } from '../../hooks/use-fi-account';
import type { MemberProfileInfo } from '../../hooks/use-member-profiles';
import { CircleTab } from './circle-tab';
import { RingTab } from './ring-tab';
import { InviterCircleTab } from './inviter-circle-tab';
import { MemberDetailView } from './member-detail-view';

export type NetworkSubTab = 'circle' | 'ring' | 'inviter' | 'inviter0';

export interface NetworkTabProps {
  invitedMembers: InvitedMemberEntry[];
  resolvedProfiles?: Record<string, MemberProfileInfo>;
  isLoading?: boolean;
  invitorAddress?: Address | string | null;
  invitor0Address?: Address | string | null;
  onNavigateToInvite: () => void;
  onBoundaryPrev?: () => void;
  onBoundaryNext?: () => void;
  onQuickAction?: (
    action: 'send' | 'vote' | 'allowance',
    targetAddress: string,
  ) => void;
}

export const NetworkTab: React.FC<NetworkTabProps> = ({
  invitedMembers,
  resolvedProfiles,
  isLoading = false,
  invitorAddress,
  invitor0Address,
  onNavigateToInvite,
  onBoundaryPrev,
  onBoundaryNext,
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

  const safeInvitedMembers = Array.isArray(invitedMembers)
    ? invitedMembers
    : [];

  return (
    <div className="space-y-4 bg-card text-card-foreground p-4 border border-border rounded-2xl shadow-sm text-sm">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-base text-foreground">
            Trust Network
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your 1st-degree Circle, 2nd-degree Ring, and Inviter Lineage
          </p>
        </div>
      </div>

      {/* Network Explanation Banner */}
      <div className="p-3 bg-secondary/40 border border-border/50 rounded-xl space-y-1">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Your <strong className="text-foreground">Circle</strong> contains
          members you directly invited. Your{' '}
          <strong className="text-foreground">Ring</strong> expands to members
          invited by your Circle.{' '}
          <strong className="text-foreground">Inviter</strong> and{' '}
          <strong className="text-foreground">Inviter0</strong> show your direct
          and upstream sponsors with their respective circles.
        </p>
      </div>

      {/* Sub-tabs [Circle | Ring | Inviter | Inviter0] */}
      <div className="flex gap-1 bg-secondary/70 border border-border p-1 rounded-xl text-xs font-medium">
        <button
          type="button"
          onClick={() => setSubTab('circle')}
          className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer text-center ${
            subTab === 'circle'
              ? 'bg-card shadow-sm text-foreground font-semibold border border-border'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
          }`}
          data-testid="network-subtab-circle"
        >
          Circle ({safeInvitedMembers.length})
        </button>
        <button
          type="button"
          onClick={() => setSubTab('ring')}
          className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer text-center ${
            subTab === 'ring'
              ? 'bg-card shadow-sm text-foreground font-semibold border border-border'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
          }`}
          data-testid="network-subtab-ring"
        >
          Ring
        </button>
        <button
          type="button"
          onClick={() => setSubTab('inviter')}
          className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer text-center ${
            subTab === 'inviter'
              ? 'bg-card shadow-sm text-foreground font-semibold border border-border'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
          }`}
          data-testid="network-subtab-inviter"
        >
          Inviter
        </button>
        <button
          type="button"
          onClick={() => setSubTab('inviter0')}
          className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer text-center ${
            subTab === 'inviter0'
              ? 'bg-card shadow-sm text-foreground font-semibold border border-border'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
          }`}
          data-testid="network-subtab-inviter0"
        >
          Inviter0
        </button>
      </div>

      {/* Sub-tab content */}
      <SwipeableSubTabs
        tabs={['circle', 'ring', 'inviter', 'inviter0'] as const}
        activeTab={subTab}
        onTabChange={(tab) => setSubTab(tab as NetworkSubTab)}
        onBoundaryPrev={onBoundaryPrev}
        onBoundaryNext={onBoundaryNext}
      >
        {subTab === 'circle' && (
          <CircleTab
            invitedMembers={safeInvitedMembers}
            resolvedProfiles={resolvedProfiles}
            isLoading={isLoading}
            onSelectMember={(addr) => setSelectedMemberAddress(addr)}
            onNavigateToInvite={onNavigateToInvite}
          />
        )}
        {subTab === 'ring' && (
          <RingTab
            circleMembers={safeInvitedMembers}
            circleProfiles={resolvedProfiles}
            isLoading={isLoading}
            onSelectMember={(addr) => setSelectedMemberAddress(addr)}
            onNavigateToInvite={onNavigateToInvite}
          />
        )}
        {subTab === 'inviter' && (
          <InviterCircleTab
            inviterAddress={invitorAddress}
            roleLabel="Direct Inviter"
            isLoading={isLoading}
            onSelectMember={(addr) => setSelectedMemberAddress(addr)}
            onNavigateToInvite={onNavigateToInvite}
          />
        )}
        {subTab === 'inviter0' && (
          <InviterCircleTab
            inviterAddress={invitor0Address}
            roleLabel="Upstream Inviter (Inviter0)"
            isLoading={isLoading}
            onSelectMember={(addr) => setSelectedMemberAddress(addr)}
            onNavigateToInvite={onNavigateToInvite}
          />
        )}
      </SwipeableSubTabs>
    </div>
  );
};
