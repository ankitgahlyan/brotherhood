/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { type Address } from '@ton/core';
import type { FiWalletStore } from '@wrappers/FossFiWallet.gen';
import {
  calcSpendablePocketMoney,
  unwrapPocketMoneyEntry,
} from '@/lib/brotherhood/ton';
import type { PocketMoney } from '@/lib/brotherhood/deploy';
import { normalizeOnchainMultiplier } from '@/lib/brotherhood/config';
import { formatTonAddress, type AddressNetwork } from '@/core/utils/formatters';
import { resolveCachedDnsContact } from '@/core/utils/telegram';
import type { ContactItem } from '@/core/storage/useContactBookStore';
import type { OwnedDomain } from '@/features/dns/store/dns-store';

export interface VotedCandidateEntry {
  address: Address;
  addressString: string;
  count: number;
}

export interface InvitedMemberEntry {
  address: Address;
  addressString: string;
  amount: bigint;
}

export interface AllowanceEntry {
  address: Address;
  addressString: string;
  amount: bigint;
  pocketMoney?: PocketMoney;
}

export interface FiAccountData {
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
  allowDeferred: boolean;
  votes: number;
  receivedVotes: bigint;
  connections: number;
  active: boolean;
  mintable: boolean;
  version: number;
  storeVersion: number;
  username: string;
  dnsDomain?: string;
  contactLink?: string;
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

export interface MemberDetailData extends FiAccountData {
  contractAddress: Address;
  contractAddressString: string;
  ownerAddress: Address | null;
  ownerAddressString: string;
}

export interface MemberProfileInfo {
  address: string;
  ownerAddress: string;
  username: string;
  dnsDomain?: string;
  contactLink?: string;
  h3Cell: string;
  country: number;
  active: boolean;
  jettonBalance: bigint;
  status: number;
  creditNeed: bigint;
  creditMaturity: number;
  multiplier: number;
  personalJettonMinter?: string;
  isOutdatedCode?: boolean;
}

export interface ProjectFiAccountContext {
  network: AddressNetwork;
  contactsForNet?: Record<string, ContactItem>;
  domainsForNet?: OwnedDomain[];
  candidateAddresses: (string | null | undefined)[];
  stripBroSuffixFromUsername?: boolean;
}

/**
 * Pure domain projector: combines raw on-chain `FiWalletStore` with cached ContactBook
 * and `.bro` DNS records into a strongly typed `FiAccountData` view model.
 * Zero React hooks or network side-effects.
 */
export function projectFiAccountData(
  rawData: FiWalletStore | null | undefined,
  ctx: ProjectFiAccountContext,
): FiAccountData | null {
  if (!rawData) return null;

  const {
    network,
    contactsForNet,
    domainsForNet,
    candidateAddresses,
    stripBroSuffixFromUsername = false,
  } = ctx;
  const net = network === 'mainnet' ? 'mainnet' : 'testnet';

  const profile = rawData.profile?.ref;
  const timestamps = rawData.timestamps?.ref;
  const addresses = rawData.addresses?.ref;
  const nomins = addresses?.nomInAddrs?.ref;
  const trusted = addresses?.trustedJettonAddrs?.ref;
  const maps = rawData.maps?.ref;
  const social = maps?.social?.ref;
  const reportInfo = maps?.reportInfo?.ref;

  // Extract votedFor entries (FiWallet contract addresses -> bounceable)
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

  // Extract invited entries (FiWallet contract addresses -> bounceable)
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

  // Extract pocketMoney / allowances entries
  const allowances: AllowanceEntry[] = [];
  const pocketMoneyMap =
    maps?.pocketMoney ?? (maps as { allowances?: any } | undefined)?.allowances;
  if (pocketMoneyMap) {
    try {
      const grantorBal = rawData.jettonBalance ?? 0n;
      const keys = pocketMoneyMap.keys();
      for (const k of keys) {
        const rawVal = pocketMoneyMap.get(k);
        const unwrapped = unwrapPocketMoneyEntry(rawVal);
        allowances.push({
          address: k,
          addressString: formatTonAddress(k, {
            isContract: false,
            network,
          }),
          amount: calcSpendablePocketMoney(rawVal, grantorBal),
          pocketMoney:
            unwrapped && typeof unwrapped === 'object' ? unwrapped : undefined,
        });
      }
    } catch {
      /* ignore dict parse error */
    }
  }

  const rawUsername = stripBroSuffixFromUsername
    ? (profile?.username ?? '').trim()
    : (profile?.username ?? '');
  const isBroUsername =
    stripBroSuffixFromUsername && rawUsername.toLowerCase().endsWith('.bro');

  const resolvedDns = resolveCachedDnsContact(
    candidateAddresses,
    net,
    contactsForNet,
    domainsForNet,
    rawUsername,
  );

  return {
    jettonBalance: rawData.jettonBalance ?? 0n,
    goldCoins: Number(rawData.goldCoins ?? 0),
    txnCount: Number(rawData.txnCount ?? 0),
    status: Number(rawData.status ?? 0),
    isAuthorityAccount: Boolean(rawData.isAuthorityAccount),
    isPrevilegedAccount: Boolean(rawData.isPrevilegedAccount),
    creditNeed: rawData.creditNeed ?? 0n,
    creditMaturity: Number(rawData.creditMaturity ?? 0),
    multiplier: normalizeOnchainMultiplier(rawData.multiplier),
    accumulatedFees: rawData.accumulatedFees ?? 0n,
    debt: rawData.debt ?? 0n,
    allowDeferred: Boolean(rawData.allowDeferred),
    votes: Number(rawData.votes ?? 10),
    receivedVotes: rawData.receivedVotes ?? 0n,
    connections: Number(rawData.connections ?? 0),
    active: Boolean(rawData.active),
    mintable: Boolean(rawData.mintable),
    version: Number(rawData.version ?? 0),
    storeVersion: Number(rawData.storeVersion ?? 0),
    username: isBroUsername ? '' : rawUsername,
    dnsDomain:
      resolvedDns.dnsDomain ||
      (isBroUsername ? rawUsername.toLowerCase() : undefined),
    contactLink: resolvedDns.contactLink,
    h3Cell: profile?.h3Cell ?? '',
    country: profile?.country ? Number(profile.country) : 0,
    accountInit: timestamps?.accountInit ? Number(timestamps.accountInit) : 0,
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
    followingCount: social?.followingCount ? Number(social.followingCount) : 0,
    followersCount: social?.followersCount ? Number(social.followersCount) : 0,
    tosBreach: Boolean(reportInfo?.tosBreach),
    reporterCount: reportInfo?.reporterCount
      ? Number(reportInfo.reporterCount)
      : 0,
    disputerCount: reportInfo?.disputerCount
      ? Number(reportInfo.disputerCount)
      : 0,
  };
}

/**
 * Pure domain projector for `MemberDetailData` from a raw `FiWalletStore` and contract `Address`.
 */
export function projectMemberDetailData(
  rawData: FiWalletStore | null | undefined,
  contractAddress: Address | null | undefined,
  ctx: Omit<
    ProjectFiAccountContext,
    'candidateAddresses' | 'stripBroSuffixFromUsername'
  >,
): MemberDetailData | null {
  if (!rawData || !contractAddress) return null;

  const ownerAddr = rawData.addresses?.ref?.owner ?? null;
  const contractAddressString = formatTonAddress(contractAddress, {
    isContract: true,
    network: ctx.network,
  });
  const ownerAddressString = ownerAddr
    ? formatTonAddress(ownerAddr, { isContract: false, network: ctx.network })
    : '';

  const base = projectFiAccountData(rawData, {
    ...ctx,
    candidateAddresses: [ownerAddressString, contractAddressString],
    stripBroSuffixFromUsername: true,
  });
  if (!base) return null;

  return {
    ...base,
    contractAddress,
    contractAddressString,
    ownerAddress: ownerAddr,
    ownerAddressString,
  };
}

/**
 * Pure domain projector for a single `MemberProfileInfo` summary card from raw `FiWalletStore`.
 */
export function projectMemberProfileInfo(
  addrStr: string,
  store: any,
  options: {
    network: AddressNetwork;
    fallbackUsername?: string;
    isOutdated?: boolean;
    contactsForNet?: Record<string, ContactItem>;
    domainsForNet?: OwnedDomain[];
  },
): MemberProfileInfo {
  const {
    network,
    fallbackUsername: fallbackOverride,
    isOutdated = false,
    contactsForNet,
    domainsForNet,
  } = options;
  const net = network === 'mainnet' ? 'mainnet' : 'testnet';

  const ownerAddr = store?.addresses?.ref?.owner ?? null;
  const ownerAddress = ownerAddr
    ? formatTonAddress(ownerAddr, { isContract: false, network })
    : '';
  const minterAddr =
    store?.addresses?.ref?.trustedJettonAddrs?.ref?.personalJettonMinter ??
    null;
  const personalJettonMinter = minterAddr
    ? formatTonAddress(minterAddr, { isContract: true, network })
    : undefined;

  const rawProfileUsername = (store?.profile?.ref?.username ?? '').trim();
  const fallbackUsername = rawProfileUsername || fallbackOverride || '';
  const isBroUsername = fallbackUsername.toLowerCase().endsWith('.bro');

  const cachedDns = resolveCachedDnsContact(
    [ownerAddress, addrStr],
    net,
    contactsForNet,
    domainsForNet,
    fallbackUsername,
  );

  return {
    address: addrStr,
    ownerAddress,
    username: isBroUsername ? '' : fallbackUsername,
    dnsDomain:
      cachedDns.dnsDomain ||
      (isBroUsername ? fallbackUsername.toLowerCase() : undefined),
    contactLink: cachedDns.contactLink,
    h3Cell: store?.profile?.ref?.h3Cell ?? '',
    country: store?.profile?.ref?.country
      ? Number(store.profile.ref.country)
      : 0,
    active: Boolean(store?.active),
    jettonBalance: store?.jettonBalance ?? 0n,
    status: store?.status ? Number(store.status) : 0,
    creditNeed: store?.creditNeed ?? 0n,
    creditMaturity: Number(store?.creditMaturity ?? 0),
    multiplier: normalizeOnchainMultiplier(store?.multiplier),
    personalJettonMinter,
    isOutdatedCode: isOutdated || Boolean(store?.isCodeHashOutdated),
  };
}
