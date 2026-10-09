/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useMemo } from 'react';
import { Address } from '@ton/core';
import { Globe, User, ShieldCheck, ChevronRight } from 'lucide-react';
import { Button } from '@/core/components/ui/button';
import { RefreshButton } from '@/core/components/ui/refresh-button';
import { TelegramIcon } from '@/core/components/ui/icons';
import {
  getMemberContactDisplay,
  openMemberContact,
} from '@/core/utils/telegram';
import { useFormatAddress, formatTonAddress } from '@/core/utils/formatters';
import { isZeroAddress } from '@/lib/brotherhood/ton';
import { useRingInvitees } from '../../hooks/use-ring-invitees';
import {
  useMemberProfiles,
  type MemberProfileInfo,
} from '../../hooks/use-member-profiles';

export interface InviterCircleTabProps {
  inviterAddress: Address | string | null | undefined;
  roleLabel: string;
  isLoading?: boolean;
  onSelectMember: (addressString: string) => void;
  onNavigateToInvite?: () => void;
}

export const InviterCircleTab: React.FC<InviterCircleTabProps> = ({
  inviterAddress,
  roleLabel,
  isLoading = false,
  onSelectMember,
  onNavigateToInvite,
}) => {
  const { network, formatContractAddress } = useFormatAddress();
  const net = network === 'mainnet' ? 'mainnet' : 'testnet';

  const parsedInviter = useMemo<Address | null>(() => {
    if (!inviterAddress) return null;
    try {
      const parsed =
        typeof inviterAddress === 'string'
          ? Address.parse(inviterAddress.trim())
          : inviterAddress;
      if (isZeroAddress(parsed)) return null;
      return parsed;
    } catch {
      return null;
    }
  }, [inviterAddress]);

  const inviterAddressString = useMemo(() => {
    if (!parsedInviter) return null;
    return formatTonAddress(parsedInviter, {
      isContract: true,
      network: net,
    });
  }, [parsedInviter, net]);

  // Load inviter's profile
  const inviterAddressArray = useMemo(
    () => (inviterAddressString ? [inviterAddressString] : []),
    [inviterAddressString],
  );
  const inviterProfileQuery = useMemberProfiles(inviterAddressArray, net);
  const inviterProfile: MemberProfileInfo | undefined = inviterAddressString
    ? inviterProfileQuery.data?.[inviterAddressString]
    : undefined;

  // Load inviter's circle of directly invited members
  const {
    invitees,
    isLoading: isInviteesLoading,
    refetch: refetchInvitees,
  } = useRingInvitees(inviterAddressString, Boolean(inviterAddressString));

  const inviteeAddressStrings = useMemo(() => {
    if (!Array.isArray(invitees)) return [];
    return invitees.map((i) => i.addressString);
  }, [invitees]);

  const circleProfilesQuery = useMemberProfiles(inviteeAddressStrings, net);
  const safeInvitees = Array.isArray(invitees) ? invitees : [];

  const formatShortContract = (addr: Address | string | null | undefined) => {
    if (!addr) return 'None';
    return formatContractAddress(addr, true, 4);
  };

  if (isLoading) {
    return (
      <div className="space-y-3 py-2">
        <div className="h-20 bg-secondary/40 rounded-xl animate-pulse" />
        <div className="h-14 bg-secondary/40 rounded-xl animate-pulse" />
        <div className="h-14 bg-secondary/40 rounded-xl animate-pulse" />
      </div>
    );
  }

  // Empty state when account has no inviter registered at this level
  if (!parsedInviter || !inviterAddressString) {
    return (
      <div className="py-8 px-4 text-center space-y-3 bg-secondary/20 border border-border/50 rounded-2xl">
        <div className="w-10 h-10 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground">
            No {roleLabel} Registered
          </h4>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
            This account does not have a {roleLabel.toLowerCase()} registered in
            its smart contract storage.
          </p>
        </div>
        {onNavigateToInvite && (
          <Button
            variant="primary"
            size="sm"
            onClick={onNavigateToInvite}
            className="text-xs"
          >
            Invite Members
          </Button>
        )}
      </div>
    );
  }

  const contactDisplay = getMemberContactDisplay({
    username: inviterProfile?.username,
    dnsDomain: inviterProfile?.dnsDomain,
    contactLink: inviterProfile?.contactLink,
    fallbackLabel: formatShortContract(inviterAddressString),
  });

  const dnsDomain = inviterProfile?.dnsDomain;
  const username = inviterProfile?.username;
  const isInviterActive = inviterProfile?.active ?? true;

  return (
    <div className="space-y-4">
      {/* 1. Inviter Profile Card */}
      <div className="border border-border/70 rounded-2xl p-3.5 bg-secondary/30 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-primary uppercase tracking-wider flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            {roleLabel} Profile
          </span>
          <RefreshButton
            iconOnly
            onRefresh={async () => {
              refetchInvitees();
              if (inviterProfileQuery.refetch) {
                await inviterProfileQuery.refetch();
              }
              if (circleProfilesQuery.refetch) {
                await circleProfilesQuery.refetch();
              }
            }}
            title={`Refresh ${roleLabel}`}
            ariaLabel={`Refresh ${roleLabel}`}
          />
        </div>

        <div className="flex items-center justify-between gap-3 bg-card border border-border/50 rounded-xl p-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-sm shrink-0">
              {username
                ? username.replace(/^@+/, '').charAt(0).toUpperCase()
                : 'I'}
            </div>
            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-sm text-foreground truncate">
                  {username ? (
                    username.startsWith('@') ? (
                      username
                    ) : (
                      `@${username}`
                    )
                  ) : dnsDomain ? (
                    dnsDomain
                  ) : (
                    <span className="font-mono">
                      {formatShortContract(inviterAddressString)}
                    </span>
                  )}
                </span>

                {dnsDomain && (
                  <span className="text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">
                    <Globe className="w-2.5 h-2.5" />
                    {dnsDomain}
                  </span>
                )}

                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                    isInviterActive
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {isInviterActive ? 'Active' : 'Outdated/Pending'}
                </span>
              </div>

              <div className="text-[11px] font-mono text-muted-foreground truncate">
                {formatShortContract(inviterAddressString)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {contactDisplay.canOpen && (
              <button
                type="button"
                onClick={() =>
                  openMemberContact({
                    username: inviterProfile?.username,
                    dnsDomain: inviterProfile?.dnsDomain,
                    contactLink: inviterProfile?.contactLink,
                  })
                }
                className="p-2 rounded-xl text-primary bg-primary/10 hover:bg-primary/20 transition-all cursor-pointer"
                title={contactDisplay.title}
                aria-label={contactDisplay.title}
              >
                {contactDisplay.platform === 'telegram' ? (
                  <TelegramIcon className="w-4 h-4" />
                ) : (
                  <span className="text-xs">{contactDisplay.icon}</span>
                )}
              </button>
            )}

            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => onSelectMember(inviterAddressString)}
              className="text-xs gap-1"
            >
              <span>Inspect</span>
              <ChevronRight className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Inviter's Trust Circle */}
      <div className="space-y-2">
        <div className="flex justify-between items-center px-1">
          <span className="text-xs font-semibold text-foreground">
            {roleLabel}'s Circle ({safeInvitees.length})
          </span>
          <span className="text-[11px] text-muted-foreground">
            Members directly invited by this account
          </span>
        </div>

        {isInviteesLoading ? (
          <div className="space-y-2 py-1">
            <div className="h-12 bg-secondary/40 rounded-xl animate-pulse" />
            <div className="h-12 bg-secondary/40 rounded-xl animate-pulse" />
          </div>
        ) : safeInvitees.length === 0 ? (
          <div className="py-6 px-4 text-center space-y-1.5 bg-secondary/20 border border-border/40 rounded-xl text-xs text-muted-foreground">
            <p className="font-medium text-foreground">No Invitees Found</p>
            <p>
              This {roleLabel.toLowerCase()} has not invited any members yet.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-96 overflow-y-auto">
            {safeInvitees.map((entry) => {
              const prof = circleProfilesQuery.data?.[entry.addressString];
              const memberContact = getMemberContactDisplay({
                username: prof?.username,
                dnsDomain: prof?.dnsDomain,
                contactLink: prof?.contactLink,
                fallbackLabel: '@member',
              });
              const isActive = prof?.active ?? false;

              return (
                <div
                  key={entry.addressString}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectMember(entry.addressString)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onSelectMember(entry.addressString);
                    }
                  }}
                  className="w-full text-left p-2.5 rounded-xl border border-border/50 bg-secondary/30 hover:bg-secondary/60 hover:border-primary/40 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                      {memberContact.label.replace(/^@/, '').charAt(0) || 'M'}
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors truncate">
                          {memberContact.label}
                        </span>
                        {prof?.dnsDomain && (
                          <span className="text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-1 py-0.2 rounded font-medium flex items-center gap-0.5">
                            <Globe className="w-2.5 h-2.5" />
                            {prof.dnsDomain}
                          </span>
                        )}
                        <span
                          className={`text-[9px] px-1 py-0.2 rounded font-medium ${
                            isActive
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                              : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {isActive ? 'Active' : 'Pending'}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-muted-foreground truncate">
                        {formatShortContract(entry.addressString)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {memberContact.canOpen && (
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          openMemberContact({
                            username: prof?.username,
                            dnsDomain: prof?.dnsDomain,
                            contactLink: prof?.contactLink,
                          });
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.stopPropagation();
                            openMemberContact({
                              username: prof?.username,
                              dnsDomain: prof?.dnsDomain,
                              contactLink: prof?.contactLink,
                            });
                          }
                        }}
                        className="p-1.5 rounded-lg text-primary bg-primary/10 hover:bg-primary/20 transition-all cursor-pointer"
                        title={memberContact.title}
                        aria-label={memberContact.title}
                      >
                        {memberContact.platform === 'telegram' ? (
                          <TelegramIcon className="w-3.5 h-3.5" />
                        ) : (
                          <span className="text-xs">{memberContact.icon}</span>
                        )}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
