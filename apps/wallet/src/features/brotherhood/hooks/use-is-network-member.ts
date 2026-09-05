/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useState, useEffect, useMemo } from 'react';
import { useWallet } from '@demo/wallet-core';
import { useFiAccount, type FiAccountData } from './use-fi-account';

export const ACTIVATION_WAIT_SECONDS = 86400; // 1 day (24 hours)

export type MemberState =
  'not_member' | 'pending_activation' | 'deactivated' | 'fully_active';

export interface UseIsNetworkMemberResult {
  /** True if the wallet is onboarded in the network (has an initialized FiWallet). */
  isMember: boolean;
  /** True only when the account is fully active and permitted to perform on-chain operations. */
  isFullyActive: boolean;
  /** Synonym for isFullyActive. */
  canOperate: boolean;
  /** Detailed lifecycle state of the member account. */
  memberState: MemberState;
  isLoading: boolean;
  fiAccount: FiAccountData | null;
  address: string | null;
  /** Timestamp (in seconds) when the 1-day activation waiting period unlocks. */
  activationUnlockTime: number;
  /** Remaining seconds until activation unlocks (0 if already unlocked). */
  activationRemainingSeconds: number;
  /** Human-readable countdown string (e.g. "4d 12h 30m"). */
  activationRemainingFormatted: string;
  refetch: () => void;
}

function formatRemainingTime(seconds: number): string {
  if (seconds <= 0) return '0s';
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

/**
 * Checks whether the currently active wallet is an onboarded, active member
 * of the BrotherHood / FI network and evaluates its 1-week activation status.
 */
export function useIsNetworkMember(): UseIsNetworkMemberResult {
  const { address } = useWallet();
  const account = useFiAccount(address ?? null);

  const [nowSec, setNowSec] = useState(() => Math.floor(Date.now() / 1000));

  useEffect(() => {
    const timer = setInterval(() => {
      setNowSec(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const {
    isMember,
    isFullyActive,
    memberState,
    activationUnlockTime,
    activationRemainingSeconds,
    activationRemainingFormatted,
  } = useMemo(() => {
    const data = account.data;

    if (!data || data.accountInit === 0) {
      return {
        isMember: false,
        isFullyActive: false,
        memberState: 'not_member' as MemberState,
        activationUnlockTime: 0,
        activationRemainingSeconds: 0,
        activationRemainingFormatted: '0s',
      };
    }

    const unlockTime = data.accountInit + ACTIVATION_WAIT_SECONDS;
    const remaining = Math.max(0, unlockTime - nowSec);

    // Authority manual deactivation or review/suspended status check
    const isManuallyDeactivated = !data.active || data.status !== 0;

    if (isManuallyDeactivated) {
      return {
        isMember: true,
        isFullyActive: false,
        memberState: 'deactivated' as MemberState,
        activationUnlockTime: unlockTime,
        activationRemainingSeconds: remaining,
        activationRemainingFormatted: formatRemainingTime(remaining),
      };
    }

    // 1-Day activation delay check (privileged accounts bypass this)
    const isPendingActivation = remaining > 0 && !data.isPrevilegedAccount;

    if (isPendingActivation) {
      return {
        isMember: true,
        isFullyActive: false,
        memberState: 'pending_activation' as MemberState,
        activationUnlockTime: unlockTime,
        activationRemainingSeconds: remaining,
        activationRemainingFormatted: formatRemainingTime(remaining),
      };
    }

    return {
      isMember: true,
      isFullyActive: true,
      memberState: 'fully_active' as MemberState,
      activationUnlockTime: unlockTime,
      activationRemainingSeconds: 0,
      activationRemainingFormatted: '0s',
    };
  }, [account.data, nowSec]);

  return {
    isMember,
    isFullyActive,
    canOperate: isFullyActive,
    memberState,
    isLoading: account.isLoading,
    fiAccount: account.data,
    address: address ?? null,
    activationUnlockTime,
    activationRemainingSeconds,
    activationRemainingFormatted,
    refetch: account.refetch,
  };
}

/**
 * Returns a user-friendly error message if the account is not permitted to perform
 * state-changing operations (due to 1-day activation delay, authority deactivation, or suspended status).
 */
export function getAccountActionError(
  accountData?: FiAccountData | null,
): string | null {
  if (!accountData) return null;
  if (!accountData.active || accountData.status !== 0) {
    return 'Account is deactivated or suspended by authority';
  }
  const now = Math.floor(Date.now() / 1000);
  if (
    !accountData.isPrevilegedAccount &&
    accountData.accountInit > 0 &&
    now <= accountData.accountInit + ACTIVATION_WAIT_SECONDS
  ) {
    const remaining = accountData.accountInit + ACTIVATION_WAIT_SECONDS - now;
    const formatted = formatRemainingTime(remaining);
    return `Account is in 1-day activation waiting period (${formatted} left)`;
  }
  return null;
}
