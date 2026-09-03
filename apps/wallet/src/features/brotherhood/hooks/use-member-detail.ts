/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useMemo } from 'react';
import { Address } from '@ton/core';
import { useFiWalletStateByContract } from '@/lib/brotherhood/queries';
import { useFormatAddress, formatTonAddress } from '@/core/utils/formatters';
import type {
  VotedCandidateEntry,
  InvitedMemberEntry,
  AllowanceEntry,
} from './use-fi-account';

export interface MemberDetailData {
  contractAddress: Address;
  contractAddressString: string;
  ownerAddress: Address | null;
  ownerAddressString: string;
  jettonBalance: bigint;
  goldCoins: number;
  txnCount: number;
  status: number; // 0 = active, 1 = suspended, 2 = review
  isAuthorityAccount: boolean;
  isPrevilegedAccount: boolean;
  creditNeed: bigint;
  creditMaturity: number;
  multiplier: number;
  accumulatedFees: bigint;
  debt: bigint;
  debts: boolean;
  votes: number;
  receivedVotes: bigint;
  connections: number;
  active: boolean;
  mintable: boolean;
  version: number;
  storeVersion: number;
  username: string;
  h3Cell: string;
  country: number;
  accountInit: number;
  lastInvite: number;
  lastClaim: number;
  lastDecay: number;
  nominee: Address | null;
  invitor: Address | null;
  invitor0: Address | null;
  minterAddr: Address | null;
  personalJettonMinter: Address | null;
  personalJettonWallet: Address | null;
  votedFor: VotedCandidateEntry[];
  invited: InvitedMemberEntry[];
  allowances: AllowanceEntry[];
  followingCount: number;
  followersCount: number;
  tosBreach: boolean;
  reporterCount: number;
  disputerCount: number;
}

export interface UseMemberDetailResult {
  data: MemberDetailData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useMemberDetail(
  addressInput: Address | string | null,
): UseMemberDetailResult {
  const { network } = useFormatAddress();

  const parsedAddress = useMemo(() => {
    if (!addressInput) return null;
    if (typeof addressInput === 'string') {
      try {
        return Address.parse(addressInput.trim());
      } catch {
        return null;
      }
    }
    return addressInput;
  }, [addressInput]);

  const {
    data: rawData,
    isLoading,
    error,
    refetch,
  } = useFiWalletStateByContract(
    parsedAddress,
    network === 'mainnet' ? 'mainnet' : 'testnet',
  );

  const formattedData = useMemo<MemberDetailData | null>(() => {
    if (!rawData || !parsedAddress) return null;
    try {
      const profile = rawData.profile?.ref;
      const timestamps = rawData.timestamps?.ref;
      const addresses = rawData.addresses?.ref;
      const nomins = addresses?.nomInAddrs?.ref;
      const trusted = addresses?.trustedJettonAddrs?.ref;
      const maps = rawData.maps?.ref;
      const social = maps?.social?.ref;
      const reportInfo = maps?.reportInfo?.ref;

      const votedFor: VotedCandidateEntry[] = [];
      if (social?.votedFor) {
        try {
          const keys = social.votedFor.keys();
          for (const k of keys) {
            const countVal = social.votedFor.get(k);
            votedFor.push({
              address: k,
              addressString: formatTonAddress(k, {
                isContract: true,
                network,
              }),
              count: countVal ? Number(countVal) : 10,
            });
          }
        } catch {
          /* ignore dict parse error */
        }
      }

      const invited: InvitedMemberEntry[] = [];
      if (maps?.invited) {
        try {
          const keys = maps.invited.keys();
          for (const k of keys) {
            const amountVal = maps.invited.get(k);
            invited.push({
              address: k,
              addressString: formatTonAddress(k, {
                isContract: true,
                network,
              }),
              amount: amountVal ?? 0n,
            });
          }
        } catch {
          /* ignore dict parse error */
        }
      }

      const allowances: AllowanceEntry[] = [];
      if (maps?.allowances) {
        try {
          const keys = maps.allowances.keys();
          for (const k of keys) {
            const amountVal = maps.allowances.get(k);
            allowances.push({
              address: k,
              addressString: formatTonAddress(k, {
                isContract: false,
                network,
              }),
              amount: amountVal ?? 0n,
            });
          }
        } catch {
          /* ignore dict parse error */
        }
      }

      const ownerAddr = addresses?.owner ?? null;

      return {
        contractAddress: parsedAddress,
        contractAddressString: formatTonAddress(parsedAddress, {
          isContract: true,
          network,
        }),
        ownerAddress: ownerAddr,
        ownerAddressString: ownerAddr
          ? formatTonAddress(ownerAddr, { isContract: false, network })
          : '',
        jettonBalance: rawData.jettonBalance ?? 0n,
        goldCoins: Number(rawData.goldCoins ?? 0),
        txnCount: Number(rawData.txnCount ?? 0),
        status: Number(rawData.status ?? 0),
        isAuthorityAccount: Boolean(rawData.isAuthorityAccount),
        isPrevilegedAccount: Boolean(rawData.isPrevilegedAccount),
        creditNeed: rawData.creditNeed ?? 0n,
        creditMaturity: Number(rawData.creditMaturity ?? 0),
        multiplier: Number(rawData.multiplier ?? 1),
        accumulatedFees: rawData.accumulatedFees ?? 0n,
        debt: rawData.debt ?? 0n,
        debts: Boolean(rawData.debts),
        votes: Number(rawData.votes ?? 10),
        receivedVotes: rawData.receivedVotes ?? 0n,
        connections: Number(rawData.connections ?? 0),
        active: Boolean(rawData.active),
        mintable: Boolean(rawData.mintable),
        version: Number(rawData.version ?? 0),
        storeVersion: Number(rawData.storeVersion ?? 0),
        username: profile?.username ?? '',
        h3Cell: profile?.h3Cell ?? '',
        country: profile?.country ? Number(profile.country) : 0,
        accountInit: timestamps?.accountInit
          ? Number(timestamps.accountInit)
          : 0,
        lastInvite: timestamps?.lastInvite ? Number(timestamps.lastInvite) : 0,
        lastClaim: timestamps?.lastClaim ? Number(timestamps.lastClaim) : 0,
        lastDecay: timestamps?.lastDecay ? Number(timestamps.lastDecay) : 0,
        nominee: nomins?.nominee ?? null,
        invitor: nomins?.invitor ?? null,
        invitor0: nomins?.invitor0 ?? null,
        minterAddr: trusted?.minterAddr ?? null,
        personalJettonMinter: trusted?.personalJettonMinter ?? null,
        personalJettonWallet: trusted?.personalJettonWallet ?? null,
        votedFor,
        invited,
        allowances,
        followingCount: social?.followingCount
          ? Number(social.followingCount)
          : 0,
        followersCount: social?.followersCount
          ? Number(social.followersCount)
          : 0,
        tosBreach: Boolean(reportInfo?.tosBreach),
        reporterCount: reportInfo?.reporterCount
          ? Number(reportInfo.reporterCount)
          : 0,
        disputerCount: reportInfo?.disputerCount
          ? Number(reportInfo.disputerCount)
          : 0,
      };
    } catch (e) {
      console.error('[useMemberDetail] Error parsing raw FiWallet store:', e);
      return null;
    }
  }, [rawData, parsedAddress, network]);

  return {
    data: formattedData,
    isLoading,
    error: error instanceof Error ? error : null,
    refetch,
  };
}
