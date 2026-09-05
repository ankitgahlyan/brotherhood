/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useCallback, useMemo } from 'react';
import { Address } from '@ton/core';
import type { ITonWalletKit, Wallet } from '@ton/walletkit';
import { buildInviteBody } from '@/lib/brotherhood/deploy';
import { getFiWalletAddress } from '@/lib/brotherhood/ton';
import type { Network } from '@/lib/brotherhood/config';
import { useBrotherhoodTransaction, GAS } from './use-brotherhood-transaction';
import type { FiAccountData } from './use-fi-account';
import { cleanTelegramUsername } from '@/core/utils/telegram';

export interface UseInviteMemberParams {
  wallet: Wallet | null | undefined;
  walletKit: ITonWalletKit | null;
  walletAddress: string | null;
  invitee: string;
  username: string;
  h3Cell: string;
  country: number;
  network: Network;
  accountData?: FiAccountData | null;
}

export interface UseInviteMemberResult {
  send: () => Promise<void>;
  isDisabled: boolean;
  isSending: boolean;
  error: string | null;
  validationError: string | null;
  cooldownSeconds: number;
}

const INVITE_COOLDOWN_SEC = 4 * 3600; // 4 hours
const ACTIVATION_WAIT_SEC = 86400; // 1 day (24 hours)

export function useInviteMember({
  wallet,
  walletKit,
  walletAddress,
  invitee,
  username,
  h3Cell,
  country,
  network,
  accountData,
}: UseInviteMemberParams): UseInviteMemberResult {
  const {
    send: sendTx,
    isSending,
    error,
  } = useBrotherhoodTransaction(wallet, walletKit);

  const cooldownSeconds = useMemo<number>(() => {
    if (!accountData || accountData.isPrevilegedAccount) return 0;
    const now = Math.floor(Date.now() / 1000);

    // Initial activation wait check
    if (accountData.accountInit > 0) {
      const activationEligibleAt =
        accountData.accountInit + ACTIVATION_WAIT_SEC;
      if (now < activationEligibleAt) {
        return activationEligibleAt - now;
      }
    }

    // 4-hour cooldown between invites
    if (accountData.lastInvite > 0) {
      const nextInviteAt = accountData.lastInvite + INVITE_COOLDOWN_SEC;
      if (now < nextInviteAt) {
        return nextInviteAt - now;
      }
    }

    return 0;
  }, [accountData]);

  const validationError = useMemo<string | null>(() => {
    if (!wallet || !walletAddress) return 'Connect wallet first';
    if (accountData) {
      if (!accountData.active)
        return 'Account is inactive (must be invited first)';
      if (accountData.status !== 0)
        return 'Account is suspended or under review';
      if (accountData.connections >= 10) {
        return 'Maximum connections reached (10/10 invites used)';
      }
      if (!accountData.isPrevilegedAccount && cooldownSeconds > 0) {
        const hours = Math.floor(cooldownSeconds / 3600);
        const mins = Math.floor((cooldownSeconds % 3600) / 60);
        return `Invite cooldown active: wait ${hours}h ${mins}m`;
      }
    }
    if (!invitee.trim()) return 'Enter invitee wallet address';
    try {
      const parsed = Address.parse(invitee.trim());
      if (walletAddress) {
        const selfAddr = Address.parse(walletAddress);
        if (parsed.equals(selfAddr)) return 'Cannot invite your own address';
      }
    } catch {
      return 'Invalid invitee address';
    }
    if (!cleanTelegramUsername(username)) return 'Enter a Telegram username for the new member';
    if (!h3Cell.trim()) return 'Enter an H3 spatial cell';
    if (country < 0 || isNaN(country)) return 'Select a valid country';

    return null;
  }, [
    wallet,
    walletAddress,
    accountData,
    cooldownSeconds,
    invitee,
    username,
    h3Cell,
    country,
  ]);

  const send = useCallback(async () => {
    if (!walletAddress) throw new Error('No wallet address');
    const ownerAddr = Address.parse(walletAddress);
    const fiWalletAddr = await getFiWalletAddress(ownerAddr, network);
    const inviteeAddr = Address.parse(invitee.trim());

    const payload = buildInviteBody({
      transferRecipient: inviteeAddr,
      username: cleanTelegramUsername(username),
      h3Cell: h3Cell.trim(),
      country,
    });

    await sendTx([
      { toAddress: fiWalletAddr.toString(), amount: GAS.INVITE, payload },
    ]);
  }, [walletAddress, invitee, username, h3Cell, country, network, sendTx]);

  const isDisabled = Boolean(validationError) || isSending;

  return {
    send,
    isDisabled,
    isSending,
    error,
    validationError,
    cooldownSeconds,
  };
}
