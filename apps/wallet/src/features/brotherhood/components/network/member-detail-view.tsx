/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Address } from '@ton/core';
import { useWallet, useWalletKit } from '@demo/wallet-core';
import { Button } from '@/core/components/ui/button';
import { CopyButton } from '@/core/components/ui/copy-button';
import { TelegramIcon } from '@/core/components/ui/icons';
import { openTelegramProfile } from '@/core/utils/telegram';
import { getH3ViewerUrl } from '@/core/utils/h3';
import { getCountryByCode } from '@/lib/brotherhood/countries';
import { getFiWalletAddress } from '@/lib/brotherhood/ton';
import { useFormatAddress } from '@/core/utils/formatters';
import { toast } from 'sonner';
import { useMemberDetail } from '../../hooks/use-member-detail';
import { useFiAccount } from '../../hooks/use-fi-account';
import { useDeactivateMember } from '../../hooks/use-deactivate-member';
import { useAuthorityActions } from '../../hooks/use-authority-actions';

export interface MemberDetailViewProps {
  memberAddress: Address | string;
  onBack: () => void;
  onQuickAction?: (
    action: 'send' | 'vote' | 'allowance',
    targetAddress: string,
  ) => void;
}

function formatFi(amountNano: bigint | undefined | null): string {
  if (amountNano === undefined || amountNano === null) return '0.0000';
  return (Number(amountNano) / 1e9).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
}

function formatDate(timestampSec: number | undefined | null): string {
  if (!timestampSec || timestampSec === 0) return 'Never';
  return new Date(timestampSec * 1000).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const MemberDetailView: React.FC<MemberDetailViewProps> = ({
  memberAddress,
  onBack,
  onQuickAction,
}) => {
  const { currentWallet, address } = useWallet();
  const walletKit = useWalletKit();
  const { formatWalletAddress, formatContractAddress, network } =
    useFormatAddress();
  const { data, isLoading, error, refetch } = useMemberDetail(memberAddress);
  const { data: viewerAccount } = useFiAccount(address ?? null);

  const [viewerFiWallet, setViewerFiWallet] = useState<Address | null>(null);

  useEffect(() => {
    if (!address) {
      setViewerFiWallet(null);
      return;
    }
    let active = true;
    try {
      const ownerAddr = Address.parse(address);
      getFiWalletAddress(ownerAddr, network)
        .then((fiAddr) => {
          if (active) setViewerFiWallet(fiAddr);
        })
        .catch(() => {
          if (active) setViewerFiWallet(null);
        });
    } catch {
      setViewerFiWallet(null);
    }
    return () => {
      active = false;
    };
  }, [address, network]);

  const isDirectInviter = useMemo(() => {
    if (!viewerFiWallet || !data?.invitor) return false;
    return viewerFiWallet.equals(data.invitor);
  }, [viewerFiWallet, data?.invitor]);

  const isUpstreamInviter = useMemo(() => {
    if (!viewerFiWallet || !data?.invitor0) return false;
    return viewerFiWallet.equals(data.invitor0);
  }, [viewerFiWallet, data?.invitor0]);

  const canManageMember = isDirectInviter || isUpstreamInviter;

  const isAuthority = useMemo(() => {
    return Boolean(
      viewerAccount?.isAuthorityAccount || viewerAccount?.isPrevilegedAccount,
    );
  }, [viewerAccount]);

  const targetOwnerAddress = data?.ownerAddressString ?? '';

  const deactivate = useDeactivateMember({
    wallet: currentWallet,
    walletKit,
    walletAddress: address,
    targetAddress: targetOwnerAddress,
    network,
    accountData: viewerAccount,
  });

  const authority = useAuthorityActions({
    wallet: currentWallet,
    walletKit,
    walletAddress: address,
    targetAddress: targetOwnerAddress,
    newStatus: 1,
    network,
    accountData: viewerAccount,
  });

  const handleToggleActive = async () => {
    if (!data) return;
    const isCurrentlyActive = data.active;
    const memberName = data.username ? `@${data.username}` : 'this member';
    const confirmMsg = isCurrentlyActive
      ? `Are you sure you want to suspend ${memberName}? This will toggle their active state to inactive and pause member operations.`
      : `Are you sure you want to reactivate ${memberName}? This will restore their active state.`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await deactivate.toggleActive();
      toast.success(
        isCurrentlyActive
          ? 'Member suspension broadcasted'
          : 'Member reactivation broadcasted',
      );
      setTimeout(() => refetch(), 4000);
    } catch {
      // Handled in useBrotherhoodTransaction
    }
  };

  const handleAuthoritySanction = async () => {
    if (!data) return;
    const memberName = data.username ? `@${data.username}` : 'this member';
    const confirmMsg = `CRITICAL ACTION: Are you sure you want to sanction ${memberName}? This will toggle their active state and CONFISCATE ${formatFi(data.jettonBalance)} FI back to your Authority account.`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await authority.dispatchAuthorityAction();
      toast.success('Authority sanction and fund confiscation broadcasted');
      setTimeout(() => refetch(), 4000);
    } catch {
      // Handled in useBrotherhoodTransaction
    }
  };

  const country = getCountryByCode(data?.country || 0);

  const formatShortWallet = (addr: Address | string | null | undefined) => {
    if (!addr) return 'None';
    return formatWalletAddress(addr, true, 4);
  };

  const formatShortContract = (addr: Address | string | null | undefined) => {
    if (!addr) return 'None';
    return formatContractAddress(addr, true, 4);
  };

  return (
    <div className="space-y-3 bg-card text-card-foreground p-4 border border-border rounded-2xl shadow-sm text-sm">
      {/* Top navigation & header */}
      <div className="flex justify-between items-center pb-1 border-b border-border/60">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-xs -ml-2 text-muted-foreground hover:text-foreground"
        >
          ← Back to List
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
            className="text-xs"
          >
            Refresh
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3 py-4">
          <div className="h-16 bg-secondary/40 rounded-xl animate-pulse" />
          <div className="grid grid-cols-2 gap-2">
            <div className="h-14 bg-secondary/40 rounded-xl animate-pulse" />
            <div className="h-14 bg-secondary/40 rounded-xl animate-pulse" />
            <div className="h-14 bg-secondary/40 rounded-xl animate-pulse" />
            <div className="h-14 bg-secondary/40 rounded-xl animate-pulse" />
          </div>
          <div className="h-28 bg-secondary/40 rounded-xl animate-pulse" />
        </div>
      ) : error || !data ? (
        <div className="py-8 text-center space-y-2">
          <p className="text-destructive text-sm font-semibold">
            Failed to load member state
          </p>
          <p className="text-xs text-muted-foreground">
            {error?.message || 'Contract not found or invalid address.'}
          </p>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Header Summary */}
          <div className="p-3 bg-secondary/50 rounded-xl border border-border/60 flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground block">
                Member Profile
              </span>
              {data.username ? (
                <button
                  type="button"
                  onClick={() => openTelegramProfile(data.username!)}
                  className="inline-flex items-center gap-2 text-base font-bold text-primary hover:underline cursor-pointer group text-left py-0.5"
                  title={`Open @${data.username} on Telegram`}
                  data-testid="brotherhood-member-telegram-link"
                >
                  <span>@{data.username}</span>
                  <span className="min-w-8 min-h-8 p-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors">
                    <TelegramIcon className="w-4.5 h-4.5 text-primary" />
                  </span>
                </button>
              ) : (
                <span className="text-base font-bold text-foreground block">
                  @anonymous
                </span>
              )}
              <span
                className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 ${
                  data.status === 0 && data.active
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : data.status === 0 && !data.active
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                }`}
              >
                {data.status === 0 && data.active
                  ? '● Fully Active'
                  : data.status === 0 && !data.active
                    ? '⚠️ Inactive / Suspended'
                    : data.status === 1
                      ? '🚫 Suspended'
                      : '⚠️ Under Review'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-muted-foreground block">
                Country
              </span>
              <span className="text-xs font-medium text-foreground flex items-center gap-1 justify-end">
                <span>{country.flag}</span>
                <span>{country.name}</span>
                <span className="text-muted-foreground text-[10px]">
                  ({country.code})
                </span>
              </span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          {onQuickAction && (
            <div className="grid grid-cols-3 gap-1.5 pt-0.5">
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  onQuickAction(
                    'send',
                    data.ownerAddressString || data.contractAddressString,
                  )
                }
                className="text-xs py-1.5"
              >
                Send FI
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  onQuickAction(
                    'vote',
                    data.ownerAddressString || data.contractAddressString,
                  )
                }
                className="text-xs py-1.5"
              >
                Vote
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  onQuickAction(
                    'allowance',
                    data.ownerAddressString || data.contractAddressString,
                  )
                }
                className="text-xs py-1.5"
              >
                Set Allowance
              </Button>
            </div>
          )}

          {/* Circle / Ring Member Suspension / Reactivation */}
          {canManageMember && (
            <div className="p-3 bg-secondary/50 border border-border/70 rounded-xl space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-semibold text-foreground block">
                    Circle / Ring Management
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {isDirectInviter
                      ? 'You are this member’s direct inviter (Circle)'
                      : 'You are this member’s upstream inviter (Ring)'}
                  </span>
                </div>
                <Button
                  variant={data.active ? 'danger' : 'primary'}
                  size="sm"
                  disabled={deactivate.isDisabled || !targetOwnerAddress}
                  onClick={handleToggleActive}
                  className="text-xs shrink-0"
                >
                  {deactivate.isSending
                    ? 'Broadcasting...'
                    : data.active
                      ? 'Suspend Member'
                      : 'Reactivate Member'}
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {data.active
                  ? 'Suspending will toggle this account inactive, temporarily pausing their ability to perform member operations until reactivated.'
                  : 'Reactivating will restore this member’s active status in your trust network.'}
              </p>
            </div>
          )}

          {/* Authority Enforcement Action */}
          {isAuthority && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-semibold text-destructive block">
                    Authority Sanction
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Confiscate 100% of malicious member’s FI tokens
                  </span>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  disabled={authority.isDisabled || !targetOwnerAddress}
                  onClick={handleAuthoritySanction}
                  className="text-xs shrink-0"
                >
                  {authority.isSending
                    ? 'Sanctioning...'
                    : 'Sanction & Confiscate'}
                </Button>
              </div>
              <p className="text-[11px] text-destructive/80 leading-relaxed">
                Toggles active state and confiscates{' '}
                {formatFi(data.jettonBalance)} FI to your Authority wallet.
              </p>
            </div>
          )}

          {/* Primary Stats Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-secondary/40 border border-border/50 p-2.5 rounded-xl">
              <span className="text-muted-foreground block text-[11px]">
                FI Balance
              </span>
              <span className="font-semibold text-sm text-foreground">
                {formatFi(data.jettonBalance)} FI
              </span>
            </div>
            <div className="bg-secondary/40 border border-border/50 p-2.5 rounded-xl">
              <span className="text-muted-foreground block text-[11px]">
                Gold Coins
              </span>
              <span className="font-semibold text-sm text-foreground">
                🪙 {data.goldCoins}
              </span>
            </div>
            <div className="bg-secondary/40 border border-border/50 p-2.5 rounded-xl">
              <span className="text-muted-foreground block text-[11px]">
                Available Votes
              </span>
              <span className="font-medium text-foreground">
                {data.votes} / 10 power
              </span>
            </div>
            <div className="bg-secondary/40 border border-border/50 p-2.5 rounded-xl">
              <span className="text-muted-foreground block text-[11px]">
                Received Votes
              </span>
              <span className="font-medium text-foreground">
                {data.receivedVotes.toString()}
              </span>
            </div>
            <div className="bg-secondary/40 border border-border/50 p-2.5 rounded-xl">
              <span className="text-muted-foreground block text-[11px]">
                Direct Invites (Circle)
              </span>
              <span className="font-medium text-foreground">
                {data.invited.length} members ({data.connections} / 10 used)
              </span>
            </div>
            <div className="bg-secondary/40 border border-border/50 p-2.5 rounded-xl">
              <span className="text-muted-foreground block text-[11px]">
                Social Trust
              </span>
              <span className="font-medium text-foreground">
                {data.followersCount} followers • {data.followingCount}{' '}
                following
              </span>
            </div>
            <div className="bg-secondary/40 border border-border/50 p-2.5 rounded-xl">
              <span className="text-muted-foreground block text-[11px]">
                Outstanding Debt
              </span>
              <span className="font-medium text-foreground">
                {formatFi(data.debt)} FI
              </span>
            </div>
            <div className="bg-secondary/40 border border-border/50 p-2.5 rounded-xl">
              <span className="text-muted-foreground block text-[11px]">
                Credit Need
              </span>
              <span className="font-medium text-foreground">
                {formatFi(data.creditNeed)} FI
              </span>
            </div>
          </div>

          {/* Spatial & Lineage Details */}
          <div className="p-3 bg-secondary/30 rounded-xl border border-border/40 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">H3 Spatial Cell</span>
              {data.h3Cell ? (
                <a
                  href={getH3ViewerUrl(data.h3Cell)}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-blue-500 hover:underline text-[11px]"
                >
                  {data.h3Cell} ↗
                </a>
              ) : (
                <span className="text-muted-foreground">Not set</span>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">FiWallet Contract</span>
              <div className="flex items-center gap-1">
                <span className="font-mono text-[11px] text-foreground">
                  {formatShortContract(data.contractAddress)}
                </span>
                <CopyButton
                  address={data.contractAddress}
                  type="contract"
                  size="xs"
                />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Owner Wallet</span>
              <div className="flex items-center gap-1">
                <span className="font-mono text-[11px] text-foreground">
                  {formatShortWallet(data.ownerAddress)}
                </span>
                {data.ownerAddress && (
                  <CopyButton
                    address={data.ownerAddress}
                    type="wallet"
                    size="xs"
                  />
                )}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Invited By (Circle)</span>
              <div className="flex items-center gap-1">
                <span className="font-mono text-[11px] text-foreground">
                  {formatShortContract(data.invitor)}
                </span>
                {data.invitor && (
                  <CopyButton
                    address={data.invitor}
                    type="contract"
                    size="xs"
                  />
                )}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">
                Upstream Invitor (Ring)
              </span>
              <div className="flex items-center gap-1">
                <span className="font-mono text-[11px] text-foreground">
                  {formatShortContract(data.invitor0)}
                </span>
                {data.invitor0 && (
                  <CopyButton
                    address={data.invitor0}
                    type="contract"
                    size="xs"
                  />
                )}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Nominee Successor</span>
              <div className="flex items-center gap-1">
                <span className="font-mono text-[11px] text-foreground">
                  {formatShortWallet(data.nominee)}
                </span>
                {data.nominee && (
                  <CopyButton address={data.nominee} type="wallet" size="xs" />
                )}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Account Initialized</span>
              <span className="text-foreground text-[11px]">
                {formatDate(data.accountInit)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Last Claim</span>
              <span className="text-foreground text-[11px]">
                {formatDate(data.lastClaim)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Last Decay</span>
              <span className="text-foreground text-[11px]">
                {formatDate(data.lastDecay)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Contract Version</span>
              <span className="text-foreground font-medium text-[11px]">
                v{data.version}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
