/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { Clock, ShieldAlert } from 'lucide-react';
import { useIsNetworkMember } from '../hooks/use-is-network-member';

interface ActivationBannerProps {
  className?: string;
}

export const ActivationBanner: React.FC<ActivationBannerProps> = ({
  className = '',
}) => {
  const {
    memberState,
    activationRemainingFormatted,
    activationUnlockTime,
    fiAccount,
  } = useIsNetworkMember();

  if (memberState === 'fully_active' || memberState === 'not_member') {
    return null;
  }

  const unlockDateStr =
    activationUnlockTime > 0
      ? new Date(activationUnlockTime * 1000).toLocaleString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '';

  if (memberState === 'deactivated') {
    const isSuspended = fiAccount?.status === 1;
    const isReview = fiAccount?.status === 2;
    const statusLabel = isSuspended
      ? 'Suspended'
      : isReview
        ? 'Under Review'
        : 'Deactivated';

    return (
      <div
        className={`p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs space-y-1.5 text-rose-700 dark:text-rose-300 ${className}`}
        data-testid="deactivated-banner"
      >
        <div className="flex items-center gap-2 font-semibold text-rose-800 dark:text-rose-200">
          <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
          <span>Account {statusLabel} by Authority</span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          This account has been {statusLabel.toLowerCase()} by network
          authority. All state-changing actions are disabled. You can view
          balances, lineage, and network state in read-only mode.
        </p>
      </div>
    );
  }

  if (memberState === 'pending_activation') {
    return (
      <div
        className={`p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs space-y-2 text-amber-800 dark:text-amber-200 ${className}`}
        data-testid="pending-activation-banner"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold">
            <Clock className="w-4 h-4 text-amber-500 shrink-0" />
            <span>1-Week Activation Waiting Period</span>
          </div>
          <span className="font-mono font-bold text-xs bg-amber-500/20 px-2 py-0.5 rounded-lg text-amber-700 dark:text-amber-300">
            {activationRemainingFormatted} left
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          New members undergo a mandatory 7-day security activation delay before
          write operations unlock. Full network operations will unlock on{' '}
          <strong className="text-foreground">{unlockDateStr}</strong>.
          Currently in view-only mode.
        </p>
      </div>
    );
  }

  return null;
};
