/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import { useNavigate, useLocation } from '@/core/routing';
import { useWallet, useWalletKit } from '@demo/wallet-core';
import { NewLayout } from '@/core/components/shared/new-layout';
import { ScreenHeader } from '@/core/components/shared/screen-header';
import { Button } from '@/core/components/ui/button';
import { InputScan } from '@/core/components/ui/input-scan';
import { CountrySelect } from '@/core/components/ui/country-select';
import { CopyButton } from '@/core/components/ui/copy-button';
import { TelegramIcon } from '@/core/components/ui/icons';
import { openTelegramProfile } from '@/core/utils/telegram';
import { getH3ViewerUrl } from '@/core/utils/h3';
import { getCountryByCode } from '@/lib/brotherhood/countries';
import { useFormatAddress, sameAddress } from '@/core/utils/formatters';
import { NonMemberCard } from './non-member-card';
import { ActivationBanner } from './activation-banner';
import { useIsNetworkMember } from '../hooks/use-is-network-member';

import { useFiMinterState } from '@/lib/brotherhood/queries';
import { useFiAccount } from '../hooks/use-fi-account';
import {
  useMemberProfiles,
  type MemberProfileInfo,
} from '../hooks/use-member-profiles';
import { useSetCreditTerms } from '../hooks/use-set-credit-terms';
import { useFiBurn } from '../hooks/use-fi-burn';
import { useWeeklyClaim } from '../hooks/use-weekly-claim';
import { usePayEmi } from '../hooks/use-pay-emi';
import { useInviteMember } from '../hooks/use-invite-member';
import { useVote } from '../hooks/use-vote';
import { useBuyCredit } from '../hooks/use-buy-credit';
import { useRepayDebt } from '../hooks/use-repay-debt';
import { useSetAllowance } from '../hooks/use-set-allowance';
import { useSpendAllowance } from '../hooks/use-spend-allowance';
import { useGoldTransfer } from '../hooks/use-gold-transfer';
import { useProfile } from '../hooks/use-profile';
import { useAuthorityActions } from '../hooks/use-authority-actions';
import { useRequestUpgrade } from '../hooks/use-request-upgrade';
import { NetworkTab } from './network';
import {
  CircleCreditList,
  RingCreditList,
  MemberComboboxInput,
  type SelectableMemberOption,
} from './credit';
import { Address } from '@ton/core';
import { SyncStatusButton } from '@/features/dashboard/components/sync-status-button';

type Tab =
  | 'account'
  | 'network'
  | 'burn'
  | 'claim'
  | 'invite'
  | 'vote'
  | 'credit'
  | 'allowance'
  | 'gold'
  | 'profile'
  | 'authority';

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

export const BrotherhoodScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const walletKit = useWalletKit();
  const { currentWallet, address, savedWallets, activeWalletId } = useWallet();
  const network =
    savedWallets.find((w) => w.id === activeWalletId)?.network ?? 'testnet';
  const { formatWalletAddress, formatContractAddress } = useFormatAddress();
  const { canOperate } = useIsNetworkMember();

  const formatShortWallet = (addr: Address | string | null | undefined) => {
    if (!addr) return 'None';
    return formatWalletAddress(addr, true, 4);
  };

  const formatShortContract = (addr: Address | string | null | undefined) => {
    if (!addr) return 'None';
    return formatContractAddress(addr, true, 4);
  };

  const initialTab = useMemo<Tab>(() => {
    const searchParams = new URLSearchParams(location.search as any);
    const requestedTab = searchParams.get('tab') as Tab;
    const validTabs: Tab[] = [
      'account',
      'network',
      'burn',
      'claim',
      'invite',
      'vote',
      'credit',
      'allowance',
      'gold',
      'profile',
      'authority',
    ];
    if (requestedTab && validTabs.includes(requestedTab)) {
      return requestedTab;
    }
    return 'account';
  }, [location.search]);

  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search as any);
    const requestedTab = searchParams.get('tab') as Tab;
    const validTabs: Tab[] = [
      'account',
      'network',
      'burn',
      'claim',
      'invite',
      'vote',
      'credit',
      'allowance',
      'gold',
      'profile',
      'authority',
    ];
    if (requestedTab && validTabs.includes(requestedTab)) {
      setActiveTab(requestedTab);
    }
  }, [location.search]);

  // Forms state
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [invitee, setInvitee] = useState('');
  const [inviteUsername, setInviteUsername] = useState('');
  const [inviteH3Cell, setInviteH3Cell] = useState('');
  const [inviteCountry, setInviteCountry] = useState(0);
  const [targetAddress, setTargetAddress] = useState('');
  const [isUnvote, setIsUnvote] = useState(false);
  const [voteCount, setVoteCount] = useState<number>(1);
  const [showVotedDropdown, setShowVotedDropdown] = useState(true);
  const [candidateSourceTab, setCandidateSourceTab] = useState<
    'voted' | 'circle'
  >('voted');
  const [candidateFilterQuery, setCandidateFilterQuery] = useState('');
  const [grantee, setGrantee] = useState('');
  const [granter, setGranter] = useState('');
  const [allowanceSubTab, setAllowanceSubTab] = useState<
    'active' | 'grant' | 'spend'
  >('active');
  const [goldRecipient, setGoldRecipient] = useState('');
  const [goldAmount, setGoldAmount] = useState(1);
  const [profileUsername, setProfileUsername] = useState('');
  const [profileH3Cell, setProfileH3Cell] = useState('');
  const [profileCountry, setProfileCountry] = useState<number | null>(null);
  const [isEditingCountry, setIsEditingCountry] = useState(false);
  const [profileNominee, setProfileNominee] = useState('');
  const [creditSubTab, setCreditSubTab] = useState<
    'buy' | 'seekers' | 'terms' | 'repay'
  >('buy');
  const [authTarget, setAuthTarget] = useState('');
  const [authStatus, setAuthStatus] = useState(0);
  const [authoritySubTab, setAuthoritySubTab] = useState<'status' | 'close'>(
    'status',
  );

  // FiAccount hook
  const account = useFiAccount(address ?? null);

  // Sync candidate defaults when on-chain account data loads
  useEffect(() => {
    if (account.data) {
      if (
        account.data.votedFor.length === 0 &&
        account.data.invited.length > 0
      ) {
        setCandidateSourceTab('circle');
      }
    }
  }, [account.data]);

  // Address batch resolver for voted candidates & invitees
  const addressesToResolve = useMemo(() => {
    const list: string[] = [];
    if (account.data?.votedFor) {
      account.data.votedFor.forEach((v) => list.push(v.addressString));
    }
    if (account.data?.invited) {
      account.data.invited.forEach((i) => list.push(i.addressString));
    }
    if (account.data?.nominee) {
      list.push(account.data.nominee.toString());
    }
    return list;
  }, [account.data]);

  const resolvedProfiles = useMemberProfiles(addressesToResolve, network);

  const getCandidateWalletAddress = useCallback(
    (contractAddressStr: string) => {
      const prof = resolvedProfiles.data?.[contractAddressStr];
      if (prof?.ownerAddress) {
        return formatWalletAddress(prof.ownerAddress, false);
      }
      return formatWalletAddress(contractAddressStr, false);
    },
    [resolvedProfiles.data, formatWalletAddress],
  );

  const candidateVotedEntry = useMemo(() => {
    if (!account.data || !targetAddress.trim()) return undefined;
    const trimmed = targetAddress.trim();
    return account.data.votedFor.find((e) => {
      if (sameAddress(e.addressString, trimmed)) return true;
      const prof = resolvedProfiles.data?.[e.addressString];
      if (prof?.ownerAddress && sameAddress(prof.ownerAddress, trimmed))
        return true;
      const walletAddr = getCandidateWalletAddress(e.addressString);
      if (sameAddress(walletAddr, trimmed)) return true;
      return false;
    });
  }, [
    account.data,
    targetAddress,
    resolvedProfiles.data,
    getCandidateWalletAddress,
  ]);

  const creditFormRef = useRef<HTMLDivElement>(null);
  const [discoveredRingProfiles, setDiscoveredRingProfiles] = useState<
    Record<string, MemberProfileInfo>
  >({});

  const handleRegisterRingMembers = useCallback(
    (members: MemberProfileInfo[]) => {
      setDiscoveredRingProfiles((prev) => {
        let changed = false;
        const next = { ...prev };
        for (const m of members) {
          if (
            !next[m.address] ||
            next[m.address].creditNeed !== m.creditNeed ||
            next[m.address].multiplier !== m.multiplier ||
            next[m.address].ownerAddress !== m.ownerAddress
          ) {
            next[m.address] = m;
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    },
    [],
  );

  const circleSelectableMembers: SelectableMemberOption[] = useMemo(() => {
    if (!account.data?.invited) return [];
    return account.data.invited.map((m) => {
      const prof = resolvedProfiles.data?.[m.addressString];
      return {
        contractAddress: m.addressString,
        ownerAddress: prof?.ownerAddress || '',
        username: prof?.username || '',
        degree: 'circle',
        creditNeed: prof?.creditNeed,
        multiplier: prof?.multiplier,
      };
    });
  }, [account.data?.invited, resolvedProfiles.data]);

  const ringSelectableMembers: SelectableMemberOption[] = useMemo(() => {
    return Object.values(discoveredRingProfiles).map((prof) => ({
      contractAddress: prof.address,
      ownerAddress: prof.ownerAddress || '',
      username: prof.username || '',
      degree: 'ring',
      creditNeed: prof.creditNeed,
      multiplier: prof.multiplier,
    }));
  }, [discoveredRingProfiles]);

  const handleSendCredit = useCallback(
    (ownerAddress: string, creditNeedNano: bigint) => {
      setRecipient(formatWalletAddress(ownerAddress, false));
      if (account.data) {
        const maxAvailable = account.data.jettonBalance;
        const targetNano =
          creditNeedNano > 0n
            ? creditNeedNano < maxAvailable
              ? creditNeedNano
              : maxAvailable
            : 0n;
        if (targetNano > 0n) {
          const whole = targetNano / 1_000_000_000n;
          const frac = (targetNano % 1_000_000_000n) / 1_000_000n;
          const amountStr =
            frac === 0n
              ? whole.toString()
              : `${whole}.${frac.toString().padStart(3, '0').replace(/0+$/, '')}`;
          setAmount(amountStr);
        }
      }
      setCreditSubTab('buy');
      creditFormRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    },
    [account.data, formatWalletAddress],
  );

  // Credit terms state (Credit Need & Multiplier)
  const [creditNeedInput, setCreditNeedInput] = useState('');
  const [creditMaturityDays, setCreditMaturityDays] = useState('30');
  const [creditMultiplierInput, setCreditMultiplierInput] = useState('1');

  const creditTerms = useSetCreditTerms({
    wallet: currentWallet,
    walletKit,
    walletAddress: address ?? null,
    network,
    onSuccess: () => {
      account.refetch();
    },
  });

  const burn = useFiBurn({
    wallet: currentWallet,
    walletKit,
    walletAddress: address ?? null,
    amount,
    network,
    accountData: account.data,
  });

  const claim = useWeeklyClaim({
    wallet: currentWallet,
    walletKit,
    walletAddress: address ?? null,
    network,
    accountData: account.data,
  });

  const emi = usePayEmi({
    wallet: currentWallet,
    walletKit,
    walletAddress: address ?? null,
    network,
    accountData: account.data,
  });

  const invite = useInviteMember({
    wallet: currentWallet,
    walletKit,
    walletAddress: address ?? null,
    invitee,
    username: inviteUsername,
    h3Cell: inviteH3Cell,
    country: inviteCountry,
    network,
    accountData: account.data,
  });

  const vote = useVote({
    wallet: currentWallet,
    walletKit,
    walletAddress: address ?? null,
    targetAddress,
    count: voteCount,
    isUnvote,
    network,
    accountData: account.data,
    maxUnvoteCount: candidateVotedEntry?.count,
  });

  const credit = useBuyCredit({
    wallet: currentWallet,
    walletKit,
    walletAddress: address ?? null,
    recipient,
    amount,
    network,
    accountData: account.data,
  });

  const repay = useRepayDebt({
    wallet: currentWallet,
    walletKit,
    walletAddress: address ?? null,
    amount,
    network,
    accountData: account.data,
  });

  const setAllowance = useSetAllowance({
    wallet: currentWallet,
    walletKit,
    walletAddress: address ?? null,
    grantee,
    amount,
    network,
    accountData: account.data,
  });

  const spendAllowance = useSpendAllowance({
    wallet: currentWallet,
    walletKit,
    walletAddress: address ?? null,
    granterAddress: granter,
    receiver: recipient,
    amount,
    network,
    accountData: account.data,
  });

  const gold = useGoldTransfer({
    wallet: currentWallet,
    walletKit,
    walletAddress: address ?? null,
    recipient: goldRecipient,
    amount: goldAmount,
    network,
    accountData: account.data,
  });

  const profile = useProfile({
    wallet: currentWallet,
    walletKit,
    walletAddress: address ?? null,
    username: profileUsername,
    h3Cell: profileH3Cell,
    country: isEditingCountry ? profileCountry : null,
    nominee: profileNominee,
    network,
    accountData: account.data,
  });

  const authority = useAuthorityActions({
    wallet: currentWallet,
    walletKit,
    walletAddress: address ?? null,
    targetAddress: authTarget,
    newStatus: authStatus,
    network,
    accountData: account.data,
  });

  const minter = useFiMinterState();
  const minterVersion = minter.data ? Number(minter.data.walletVersion) : null;

  const upgrade = useRequestUpgrade({
    wallet: currentWallet,
    walletKit,
    walletAddress: address ?? null,
    network,
    accountData: account.data,
    minterVersion,
  });

  const isAuthority = account.data?.isAuthorityAccount ?? false;
  const memberCountry = getCountryByCode(account.data?.country);

  const { isMember, memberState, activationRemainingFormatted } =
    useIsNetworkMember();

  if (account.isLoading) {
    return (
      <NewLayout
        header={
          <ScreenHeader
            title="BrotherHood"
            onBack={() => navigate('/wallet')}
            rightElement={<SyncStatusButton />}
          />
        }
      >
        <div className="space-y-3 p-4 bg-card border border-border rounded-2xl animate-pulse">
          <div className="h-4 bg-secondary rounded w-1/3" />
          <div className="h-10 bg-secondary rounded" />
          <div className="h-20 bg-secondary/60 rounded" />
        </div>
      </NewLayout>
    );
  }

  if (!isMember) {
    return (
      <NewLayout
        header={
          <ScreenHeader
            title="BrotherHood"
            onBack={() => navigate('/wallet')}
            rightElement={<SyncStatusButton />}
          />
        }
      >
        <NonMemberCard onRefresh={account.refetch} />
      </NewLayout>
    );
  }

  return (
    <NewLayout
      header={
        <ScreenHeader
          title="BrotherHood"
          onBack={() => navigate('/wallet')}
          rightElement={<SyncStatusButton />}
        />
      }
    >
      <div className="space-y-4">
        {/* Activation & Status Banner */}
        <ActivationBanner />

        {/* Contract Upgrade Alert Banner */}
        {upgrade.hasUpgradeAvailable && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-700 dark:text-amber-400 flex justify-between items-center gap-3">
            <div>
              <span className="font-semibold flex items-center gap-1.5">
                <span>⚡ Contract Upgrade Available</span>
              </span>
              <span className="text-[11px] text-muted-foreground block mt-0.5">
                Your wallet is on{' '}
                <span className="font-semibold text-foreground">
                  v{upgrade.walletVersion}
                </span>
                . Latest minter version is{' '}
                <span className="font-semibold text-foreground">
                  v{upgrade.minterVersion}
                </span>
                .
              </span>
            </div>
            <Button
              size="sm"
              variant="primary"
              className="bg-amber-600 hover:bg-amber-700 text-white shrink-0"
              onClick={() => upgrade.send()}
              disabled={upgrade.isDisabled}
              loading={upgrade.isSending}
              data-testid="brotherhood-upgrade-submit"
            >
              Upgrade to v{upgrade.minterVersion}
            </Button>
          </div>
        )}

        {account.data && account.data.debts && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-600 dark:text-rose-400 flex justify-between items-center">
            <div>
              <span className="font-semibold block">Outstanding Debt</span>
              <span className="text-[11px] text-muted-foreground">
                Debt balance: {formatFi(account.data.debt)} FI
              </span>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setActiveTab('credit');
                setAmount((Number(account.data?.debt ?? 0n) / 1e9).toString());
              }}
            >
              Repay Debt
            </Button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1 bg-secondary/70 border border-border p-1 rounded-xl text-xs font-medium">
          {(
            [
              'account',
              'network',
              'burn',
              'claim',
              'invite',
              'vote',
              'credit',
              'allowance',
              'gold',
              'profile',
              ...(isAuthority ? ['authority'] : []),
            ] as Tab[]
          ).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-2.5 py-1.5 rounded-lg capitalize transition-colors ${
                activeTab === tab
                  ? 'bg-card shadow-sm text-foreground font-semibold border border-border'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
              }`}
              data-testid={`brotherhood-tab-${tab}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Account Dashboard */}
        {activeTab === 'account' && (
          <div className="space-y-3 bg-card text-card-foreground p-4 border border-border rounded-2xl shadow-sm text-sm">
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-semibold text-base">
                Member Account Profile
              </h3>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => account.refetch()}
              >
                Refresh
              </Button>
            </div>

            {account.isLoading ? (
              <p className="text-muted-foreground text-xs">
                Loading on-chain account state…
              </p>
            ) : account.data ? (
              <div className="space-y-3">
                {/* Header Summary */}
                <div className="p-3 bg-secondary/50 rounded-xl border border-border/60 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      Member Username
                    </span>
                    {account.data.username ? (
                      <button
                        type="button"
                        onClick={() =>
                          openTelegramProfile(account.data!.username)
                        }
                        className="inline-flex items-center gap-2 text-base font-bold text-primary hover:underline cursor-pointer group text-left py-0.5"
                        title={`Open @${account.data.username} on Telegram`}
                        data-testid="brotherhood-account-telegram-link"
                      >
                        <span>@{account.data.username}</span>
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
                        memberState === 'fully_active'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : memberState === 'pending_activation'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {memberState === 'fully_active'
                        ? '● Fully Active'
                        : memberState === 'pending_activation'
                          ? `⏳ Pending Activation (${activationRemainingFormatted} left)`
                          : '🚫 Deactivated / Suspended'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground block">
                      Country Scoped
                    </span>
                    <span className="text-xs font-medium text-foreground flex items-center gap-1 justify-end">
                      <span>{memberCountry.flag}</span>
                      <span>{memberCountry.name}</span>
                      <span className="text-muted-foreground text-[10px]">
                        ({memberCountry.code})
                      </span>
                    </span>
                  </div>
                </div>

                {/* Primary Stats Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-secondary/40 border border-border/50 p-2.5 rounded-xl">
                    <span className="text-muted-foreground block text-[11px]">
                      FI Balance
                    </span>
                    <span className="font-semibold text-sm text-foreground">
                      {formatFi(account.data.jettonBalance)} FI
                    </span>
                  </div>
                  <div className="bg-secondary/40 border border-border/50 p-2.5 rounded-xl">
                    <span className="text-muted-foreground block text-[11px]">
                      Gold Coins
                    </span>
                    <span className="font-semibold text-sm text-foreground">
                      🪙 {account.data.goldCoins}
                    </span>
                  </div>
                  <div className="bg-secondary/40 border border-border/50 p-2.5 rounded-xl">
                    <span className="text-muted-foreground block text-[11px]">
                      Available Votes
                    </span>
                    <span className="font-medium text-foreground">
                      {account.data.votes} / 10 power
                    </span>
                  </div>
                  <div className="bg-secondary/40 border border-border/50 p-2.5 rounded-xl">
                    <span className="text-muted-foreground block text-[11px]">
                      Received Votes
                    </span>
                    <span className="font-medium text-foreground">
                      {account.data.receivedVotes.toString()}
                    </span>
                  </div>
                  <div className="bg-secondary/40 border border-border/50 p-2.5 rounded-xl">
                    <span className="text-muted-foreground block text-[11px]">
                      Invites Capacity
                    </span>
                    <span className="font-medium text-foreground">
                      {account.data.connections} / 10 used
                    </span>
                  </div>
                  <div className="bg-secondary/40 border border-border/50 p-2.5 rounded-xl">
                    <span className="text-muted-foreground block text-[11px]">
                      Social Trust
                    </span>
                    <span className="font-medium text-foreground">
                      {account.data.followersCount} followers •{' '}
                      {account.data.followingCount} following
                    </span>
                  </div>
                </div>

                {/* Spatial & Lineage Details */}
                <div className="p-3 bg-secondary/30 rounded-xl border border-border/40 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      H3 Spatial Cell
                    </span>
                    {account.data.h3Cell ? (
                      <a
                        href={getH3ViewerUrl(account.data.h3Cell)}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-blue-500 hover:underline text-[11px]"
                      >
                        {account.data.h3Cell} ↗
                      </a>
                    ) : (
                      <span className="text-muted-foreground">Not set</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Invited By</span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-[11px] text-foreground">
                        {formatShortWallet(account.data.invitor)}
                      </span>
                      {account.data.invitor && (
                        <CopyButton
                          address={account.data.invitor}
                          type="wallet"
                          size="xs"
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      Nominee Successor
                    </span>
                    <div className="flex items-center gap-1.5">
                      {account.data.nominee ? (
                        <>
                          <span className="font-mono text-[11px] text-foreground">
                            {formatShortWallet(account.data.nominee)}
                          </span>
                          <CopyButton
                            address={account.data.nominee}
                            type="wallet"
                            size="xs"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-1.5 text-[10px] text-primary hover:text-primary hover:bg-primary/10"
                            onClick={() => setActiveTab('profile')}
                            data-testid="brotherhood-change-nominee-btn"
                          >
                            Change
                          </Button>
                        </>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                            Not Set
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-[10px] font-semibold text-primary border-primary/40 hover:bg-primary/10"
                            onClick={() => setActiveTab('profile')}
                            data-testid="brotherhood-set-nominee-btn"
                          >
                            🛡️ Set Nominee
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      Account Initialized
                    </span>
                    <span className="text-foreground text-[11px]">
                      {formatDate(account.data.accountInit)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      Contract Version
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-foreground font-medium text-[11px]">
                        v{account.data.version} (Minter: v
                        {minterVersion ?? '...'})
                      </span>
                      {upgrade.hasUpgradeAvailable ? (
                        <button
                          type="button"
                          onClick={() => upgrade.send()}
                          disabled={upgrade.isDisabled}
                          className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 transition disabled:opacity-50"
                        >
                          {upgrade.isSending
                            ? 'Upgrading...'
                            : `Upgrade to v${upgrade.minterVersion}`}
                        </button>
                      ) : (
                        <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          ✓ Up to date
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-xs">
                No BrotherHood account initialized for this wallet.
              </p>
            )}
          </div>
        )}

        {/* Trust Network & Lineage (Circle & Ring) */}
        {activeTab === 'network' && (
          <NetworkTab
            invitedMembers={account.data?.invited ?? []}
            resolvedProfiles={resolvedProfiles.data}
            isLoading={account.isLoading || resolvedProfiles.isLoading}
            onNavigateToInvite={() => setActiveTab('invite')}
            onQuickAction={(action, target) => {
              if (action === 'send') {
                navigate('/send');
              } else if (action === 'vote') {
                setTargetAddress(formatWalletAddress(target, false));
                setActiveTab('vote');
              } else if (action === 'allowance') {
                setGrantee(formatWalletAddress(target, false));
                setActiveTab('allowance');
              }
            }}
          />
        )}

        {/* Burn FI */}
        {activeTab === 'burn' && (
          <div className="space-y-3 bg-card text-card-foreground p-4 border border-border rounded-2xl shadow-sm text-sm">
            <h3 className="font-semibold text-base mb-1">Burn FI Tokens</h3>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Available Balance:</span>
              <span className="font-semibold text-foreground">
                {formatFi(account.data?.jettonBalance)} FI
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Amount to Burn (FI)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                className="w-full p-2.5 border border-border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-testid="brotherhood-burn-amount"
              />
            </div>

            {burn.validationError && (
              <p className="text-xs text-rose-500 font-medium">
                {burn.validationError}
              </p>
            )}

            <Button
              onClick={() => burn.send()}
              disabled={burn.isDisabled}
              loading={burn.isSending}
              fullWidth
              data-testid="brotherhood-burn-submit"
            >
              Burn FI
            </Button>
          </div>
        )}

        {/* Weekly Claim & Monthly Due (EMI) */}
        {activeTab === 'claim' && (
          <div className="space-y-4">
            <div className="space-y-4 bg-card text-card-foreground p-4 border border-border rounded-2xl shadow-sm text-sm">
              <div className="text-center space-y-1">
                <h3 className="font-semibold text-base">
                  Weekly Grant & Reputation Patronage
                </h3>
                <p className="text-xs text-muted-foreground">
                  {claim.isPostTwoYears
                    ? 'Initial 2-year window ended. You now receive a 500 FI lifetime baseline floor plus 10 FI per received vote weekly.'
                    : 'Universal weekly grant (11,111 FI for first 2 years) plus lifetime patronage based on received community trust.'}
                </p>
              </div>

              <div className="p-3 bg-secondary/50 rounded-xl border border-border/60 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Base Grant</span>
                  <span className="font-medium text-foreground">
                    {claim.baseGrantFi} FI{' '}
                    <span className="text-[10px] text-muted-foreground">
                      (
                      {claim.isPostTwoYears
                        ? 'Lifetime Floor'
                        : 'Years 0–2 UBI'}
                      )
                    </span>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    Reputation Grant
                  </span>
                  <span className="font-medium text-foreground">
                    +{claim.reputationGrantFi} FI{' '}
                    <span className="text-[10px] text-muted-foreground">
                      ({account.data?.receivedVotes.toString() ?? '0'} votes ×
                      10 FI)
                    </span>
                  </span>
                </div>
                <div className="border-t border-border/40 pt-2 flex justify-between items-center">
                  <span className="text-muted-foreground font-semibold">
                    Total Weekly Mint
                  </span>
                  <span className="font-bold text-foreground">
                    {claim.claimAmountFi} FI
                  </span>
                </div>

                {claim.debtOffsetFi && (
                  <div className="border-t border-amber-500/20 pt-2 space-y-1">
                    <div className="flex justify-between items-center text-amber-600 dark:text-amber-400">
                      <span>Debt Auto-Repayment</span>
                      <span className="font-semibold">
                        -{claim.debtOffsetFi} FI
                      </span>
                    </div>
                    <div className="flex justify-between items-center font-bold text-foreground">
                      <span>Net Credited to Balance</span>
                      <span className="text-emerald-500">
                        +{claim.netCreditedFi} FI
                      </span>
                    </div>
                  </div>
                )}

                <div className="border-t border-border/40 pt-2 flex justify-between items-center">
                  <span className="text-muted-foreground">Last Claimed</span>
                  <span className="text-foreground">
                    {formatDate(account.data?.lastClaim)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    Claim Eligibility
                  </span>
                  <span
                    className={`font-semibold ${
                      claim.isEligible ? 'text-emerald-500' : 'text-amber-500'
                    }`}
                  >
                    {claim.isEligible ? 'Claim Ready' : 'Cooldown Active'}
                  </span>
                </div>
              </div>

              {claim.validationError && !claim.isEligible && (
                <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-600 dark:text-amber-400 text-center font-medium">
                  {claim.validationError}
                </div>
              )}

              <Button
                onClick={() => claim.send()}
                disabled={claim.isDisabled}
                loading={claim.isSending}
                fullWidth
                data-testid="brotherhood-claim-submit"
              >
                Claim Weekly Grant
              </Button>
            </div>

            {/* Monthly Due (EMI) Card */}
            <div className="space-y-4 bg-card text-card-foreground p-4 border border-border rounded-2xl shadow-sm text-sm">
              <div className="text-center space-y-1">
                <h3 className="font-semibold text-base">Monthly Due (EMI)</h3>
                <p className="text-xs text-muted-foreground">
                  Recurring social commitment of {emi.emiAmountFi} FI every 30
                  days to counter inflation and retain good standing. Failure to
                  pay within 24h grace incurs debt and a 5% penalty.
                </p>
              </div>

              <div className="p-3 bg-secondary/50 rounded-xl border border-border/60 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Monthly Amount</span>
                  <span className="font-bold text-foreground">
                    {emi.emiAmountFi} FI
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status</span>
                  <span
                    className={`font-semibold ${
                      emi.isOverdue
                        ? 'text-destructive'
                        : emi.isInGrace
                          ? 'text-amber-500'
                          : emi.isDue
                            ? 'text-primary'
                            : 'text-emerald-500'
                    }`}
                  >
                    {emi.isOverdue
                      ? 'Overdue (Penalty Incurred)'
                      : emi.isInGrace
                        ? 'Due Now (24h Grace Active)'
                        : emi.isDue
                          ? 'Due Now'
                          : 'Up to date'}
                  </span>
                </div>
                {account.data?.debts && (
                  <div className="flex justify-between items-center text-destructive font-medium border-t border-destructive/20 pt-2">
                    <span>Outstanding Debt</span>
                    <span>
                      {(Number(account.data.debt) / 1e9).toLocaleString()} FI
                    </span>
                  </div>
                )}
              </div>

              {emi.validationError && (
                <div className="p-2.5 bg-secondary/70 border border-border/60 rounded-xl text-xs text-muted-foreground text-center font-medium">
                  {emi.validationError}
                </div>
              )}

              <Button
                onClick={() => emi.send()}
                disabled={emi.isDisabled}
                loading={emi.isSending}
                variant={emi.isDue ? 'default' : 'outline'}
                fullWidth
                data-testid="brotherhood-pay-emi-submit"
              >
                Pay Monthly Due ({emi.emiAmountFi} FI)
              </Button>
            </div>
          </div>
        )}

        {/* Invite Member */}
        {activeTab === 'invite' && (
          <div className="space-y-4 bg-card text-card-foreground p-4 border border-border rounded-2xl shadow-sm text-sm">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-base">Invite New Member</h3>
              <span className="text-xs bg-secondary px-2.5 py-1 rounded-full border border-border text-foreground font-medium">
                {account.data?.connections ?? 0} / 10 Used
              </span>
            </div>

            {invite.cooldownSeconds > 0 && (
              <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-600 dark:text-amber-400">
                ⏳ Invite cooldown active: Next invite available in{' '}
                {Math.floor(invite.cooldownSeconds / 3600)}h{' '}
                {Math.floor((invite.cooldownSeconds % 3600) / 60)}m
              </div>
            )}

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Invitee Wallet Address
                </label>
                <InputScan
                  value={invitee}
                  onChange={setInvitee}
                  placeholder={network === 'mainnet' ? 'UQ...' : '0Q...'}
                  data-testid="brotherhood-invite-recipient"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Invitee Telegram Username
                </label>
                <input
                  type="text"
                  value={inviteUsername}
                  onChange={(e) => setInviteUsername(e.target.value)}
                  placeholder="@username or username"
                  className="w-full p-2.5 border border-border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="brotherhood-invite-username"
                />
                <p className="text-[11px] text-muted-foreground">
                  Enter the invitee&apos;s Telegram handle. This will be
                  registered as their on-chain username for peer communication.
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-medium text-muted-foreground">
                    H3 Spatial Cell
                  </label>
                  <a
                    href={getH3ViewerUrl(inviteH3Cell)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-blue-500 hover:underline flex items-center gap-0.5"
                  >
                    <span>Get H3 Cell</span> ↗
                  </a>
                </div>
                <input
                  type="text"
                  value={inviteH3Cell}
                  onChange={(e) => setInviteH3Cell(e.target.value)}
                  placeholder="enter level 9 cell e.g. 882681a339fffff"
                  className="w-full p-2.5 border border-border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="brotherhood-invite-h3cell"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Country (ISO 3166-1)
                </label>
                <CountrySelect
                  value={inviteCountry}
                  onChange={setInviteCountry}
                  data-testid="brotherhood-invite-country"
                />
              </div>

              {invite.validationError && (
                <p className="text-xs text-rose-500 font-medium">
                  {invite.validationError}
                </p>
              )}

              <Button
                onClick={() => invite.send()}
                disabled={invite.isDisabled}
                loading={invite.isSending}
                fullWidth
                data-testid="brotherhood-invite-submit"
              >
                Send Invite
              </Button>
            </div>

            {/* List of Previously Invited Members */}
            {account.data && account.data.invited.length > 0 && (
              <div className="pt-2 space-y-2 border-t border-border">
                <h4 className="text-xs font-semibold text-foreground">
                  Invited Members ({account.data.invited.length})
                </h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {account.data.invited.map((entry) => {
                    const prof = resolvedProfiles.data?.[entry.addressString];
                    return (
                      <div
                        key={entry.addressString}
                        className="p-2.5 bg-secondary/40 border border-border/50 rounded-xl text-xs flex justify-between items-center"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (prof?.username)
                                  openTelegramProfile(prof.username);
                              }}
                              disabled={!prof?.username}
                              className={`font-semibold text-foreground text-left ${prof?.username ? 'hover:text-primary hover:underline cursor-pointer' : ''}`}
                              title={
                                prof?.username
                                  ? `Open @${prof.username} on Telegram`
                                  : undefined
                              }
                            >
                              @{prof?.username || 'member'}
                            </button>
                            {prof?.username && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openTelegramProfile(prof.username!);
                                }}
                                className="min-w-9 min-h-9 p-2 rounded-xl text-primary bg-primary/10 hover:bg-primary/20 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                                title={`Open @${prof.username} on Telegram`}
                                aria-label={`Open @${prof.username} on Telegram`}
                              >
                                <TelegramIcon className="w-4.5 h-4.5" />
                              </button>
                            )}
                          </div>
                          <span className="font-mono text-[10px] text-muted-foreground block">
                            {formatShortContract(entry.addressString)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              prof?.active
                                ? 'bg-emerald-500/10 text-emerald-600'
                                : 'bg-secondary text-muted-foreground'
                            }`}
                          >
                            {prof?.active ? 'Active' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Trust Graph Voting */}
        {activeTab === 'vote' && (
          <div className="space-y-4 bg-card text-card-foreground p-4 border border-border rounded-2xl shadow-sm text-sm">
            <div>
              <h3 className="font-semibold text-base">Trust Graph Voting</h3>
              <p className="text-xs text-muted-foreground">
                Cast endorsements for candidates within your Country (
                {memberCountry.flag} {memberCountry.name}). Each member is
                endowed with 10 votes that can be cast granularly and
                incrementally across multiple candidates.
              </p>
            </div>

            <div className="p-3 bg-secondary/50 rounded-xl border border-border/60 flex justify-between items-center text-xs">
              <div>
                <span className="text-muted-foreground block">
                  Your Available Voting Power
                </span>
                <span className="text-sm font-bold text-foreground">
                  {account.data?.votes ?? 10} / 10 available
                </span>
              </div>
              <div className="text-right">
                <span className="text-muted-foreground block">
                  Received Endorsements
                </span>
                <span className="text-sm font-bold text-foreground">
                  {account.data?.receivedVotes.toString() ?? '0'}
                </span>
              </div>
            </div>

            {/* List of currently voted candidates */}
            {account.data && account.data.votedFor.length > 0 && (
              <div className="space-y-2 border-t border-border pt-2">
                <h4 className="text-xs font-semibold text-foreground">
                  Your Current Endorsements ({account.data.votedFor.length})
                </h4>
                <div className="space-y-2">
                  {account.data.votedFor.map((entry) => {
                    const prof = resolvedProfiles.data?.[entry.addressString];
                    const candCountry = getCountryByCode(prof?.country);
                    const candidateWallet = getCandidateWalletAddress(
                      entry.addressString,
                    );
                    return (
                      <div
                        key={entry.addressString}
                        className="p-3 bg-secondary/40 border border-border/60 rounded-xl text-xs flex justify-between items-center gap-2"
                      >
                        <div className="truncate">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (prof?.username)
                                  openTelegramProfile(prof.username);
                              }}
                              disabled={!prof?.username}
                              className={`font-semibold text-foreground text-left truncate ${prof?.username ? 'hover:text-primary hover:underline cursor-pointer' : ''}`}
                              title={
                                prof?.username
                                  ? `Open @${prof.username} on Telegram`
                                  : undefined
                              }
                            >
                              @{prof?.username || 'member'}
                            </button>
                            {prof?.username && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openTelegramProfile(prof.username!);
                                }}
                                className="min-w-8 min-h-8 p-1.5 rounded-xl text-primary bg-primary/10 hover:bg-primary/20 active:scale-95 transition-all flex items-center justify-center cursor-pointer shrink-0"
                                title={`Open @${prof.username} on Telegram`}
                                aria-label={`Open @${prof.username} on Telegram`}
                              >
                                <TelegramIcon className="w-4 h-4" />
                              </button>
                            )}
                            <span className="text-[10px] text-muted-foreground truncate">
                              {candCountry.flag} {candCountry.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-mono text-[10px] text-muted-foreground truncate">
                              {formatShortWallet(candidateWallet)}
                            </span>
                            <CopyButton
                              address={candidateWallet}
                              type="wallet"
                              size="xs"
                            />
                          </div>
                          <span className="text-[10px] text-emerald-600 font-medium">
                            Endorsed with {entry.count}{' '}
                            {entry.count === 1 ? 'vote' : 'votes'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setTargetAddress(candidateWallet);
                              setIsUnvote(true);
                              setVoteCount(entry.count);
                            }}
                          >
                            Unvote All ({entry.count})
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Voting Action Form */}
            <div className="space-y-3.5 border-t border-border pt-3">
              {/* Big Vote / Unvote Radio Segmented Control */}
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-secondary/60 border border-border/80 rounded-2xl">
                <button
                  type="button"
                  onClick={() => {
                    setIsUnvote(false);
                    setVoteCount(
                      (c) => Math.min(c, account.data?.votes ?? 10) || 1,
                    );
                  }}
                  className={`flex flex-col items-start p-3 rounded-xl transition text-left cursor-pointer ${
                    !isUnvote
                      ? 'bg-card border-2 border-primary text-card-foreground shadow-sm'
                      : 'border-2 border-transparent text-muted-foreground hover:bg-secondary/70 hover:text-foreground'
                  }`}
                  data-testid="brotherhood-vote-mode-vote"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                      <span>🗳️ Vote</span>
                    </span>
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        !isUnvote
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-muted-foreground/50 bg-transparent'
                      }`}
                    >
                      {!isUnvote && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground mt-1">
                    Endorse member ({account.data?.votes ?? 10} power left)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsUnvote(true);
                    const isMatchingAny = account.data?.votedFor.some((e) => {
                      const walletAddr = getCandidateWalletAddress(
                        e.addressString,
                      );
                      return (
                        sameAddress(walletAddr, targetAddress) ||
                        sameAddress(e.addressString, targetAddress)
                      );
                    });
                    if (
                      (!targetAddress.trim() || !isMatchingAny) &&
                      account.data?.votedFor &&
                      account.data.votedFor.length > 0
                    ) {
                      const first = account.data.votedFor[0];
                      const walletAddr = getCandidateWalletAddress(
                        first.addressString,
                      );
                      setTargetAddress(walletAddr);
                      setVoteCount(first.count);
                    } else if (candidateVotedEntry) {
                      setVoteCount((c) =>
                        Math.min(c, candidateVotedEntry.count),
                      );
                    }
                  }}
                  className={`flex flex-col items-start p-3 rounded-xl transition text-left cursor-pointer ${
                    isUnvote
                      ? 'bg-card border-2 border-primary text-card-foreground shadow-sm'
                      : 'border-2 border-transparent text-muted-foreground hover:bg-secondary/70 hover:text-foreground'
                  }`}
                  data-testid="brotherhood-vote-mode-unvote"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                      <span>↩️ Unvote</span>
                    </span>
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isUnvote
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-muted-foreground/50 bg-transparent'
                      }`}
                    >
                      {isUnvote && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground mt-1">
                    Reclaim power ({account.data?.votedFor.length ?? 0} active)
                  </span>
                </button>
              </div>

              {/* Target Member Address with Candidate Suggestions */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs flex-wrap gap-1">
                  <label className="font-medium text-muted-foreground">
                    Target Member Address
                  </label>
                  {account.data &&
                    (account.data.votedFor.length > 0 ||
                      account.data.invited.length > 0) && (
                      <div className="flex items-center gap-1.5">
                        <select
                          aria-label="Select candidate account"
                          value={(() => {
                            if (!targetAddress.trim()) return '';
                            const matchVoted = account.data.votedFor.find(
                              (e) => {
                                const walletAddr = getCandidateWalletAddress(
                                  e.addressString,
                                );
                                return (
                                  sameAddress(walletAddr, targetAddress) ||
                                  sameAddress(e.addressString, targetAddress)
                                );
                              },
                            );
                            if (matchVoted)
                              return getCandidateWalletAddress(
                                matchVoted.addressString,
                              );
                            const matchInvited = account.data.invited.find(
                              (e) => {
                                const walletAddr = getCandidateWalletAddress(
                                  e.addressString,
                                );
                                return (
                                  sameAddress(walletAddr, targetAddress) ||
                                  sameAddress(e.addressString, targetAddress)
                                );
                              },
                            );
                            if (matchInvited)
                              return getCandidateWalletAddress(
                                matchInvited.addressString,
                              );
                            return '';
                          })()}
                          onChange={(e) => {
                            const selected = e.target.value;
                            if (selected) {
                              setTargetAddress(selected);
                              const matching = account.data?.votedFor.find(
                                (item) => {
                                  const walletAddr = getCandidateWalletAddress(
                                    item.addressString,
                                  );
                                  return (
                                    sameAddress(walletAddr, selected) ||
                                    sameAddress(item.addressString, selected)
                                  );
                                },
                              );
                              if (isUnvote && matching) {
                                setVoteCount(matching.count);
                              }
                            }
                          }}
                          className="bg-secondary text-foreground text-xs rounded-lg px-2 py-1 border border-border outline-none max-w-52.5 truncate cursor-pointer hover:bg-secondary/80 font-medium"
                          data-testid="brotherhood-voted-dropdown-select"
                        >
                          <option value="">
                            Choose candidate (
                            {account.data.votedFor.length +
                              account.data.invited.length}
                            ) ▾
                          </option>
                          {account.data.votedFor.length > 0 && (
                            <optgroup
                              label={`Previously Endorsed (${account.data.votedFor.length})`}
                            >
                              {account.data.votedFor.map((entry) => {
                                const prof =
                                  resolvedProfiles.data?.[entry.addressString];
                                const flag = getCountryByCode(
                                  prof?.country,
                                ).flag;
                                const walletAddr = getCandidateWalletAddress(
                                  entry.addressString,
                                );
                                const label = prof?.username
                                  ? `@${prof.username}`
                                  : formatShortWallet(walletAddr);
                                return (
                                  <option
                                    key={`voted-${entry.addressString}`}
                                    value={walletAddr}
                                  >
                                    {flag} {label} ({entry.count}{' '}
                                    {entry.count === 1 ? 'vote' : 'votes'})
                                  </option>
                                );
                              })}
                            </optgroup>
                          )}
                          {!isUnvote && account.data.invited.length > 0 && (
                            <optgroup
                              label={`Circle Members (${account.data.invited.length})`}
                            >
                              {account.data.invited.map((entry) => {
                                const prof =
                                  resolvedProfiles.data?.[entry.addressString];
                                const flag = getCountryByCode(
                                  prof?.country,
                                ).flag;
                                const walletAddr = getCandidateWalletAddress(
                                  entry.addressString,
                                );
                                const label = prof?.username
                                  ? `@${prof.username}`
                                  : formatShortWallet(walletAddr);
                                return (
                                  <option
                                    key={`circle-${entry.addressString}`}
                                    value={walletAddr}
                                  >
                                    {flag} {label} (Circle)
                                  </option>
                                );
                              })}
                            </optgroup>
                          )}
                        </select>
                        <button
                          type="button"
                          onClick={() => setShowVotedDropdown((prev) => !prev)}
                          className="text-xs text-primary hover:underline font-medium flex items-center gap-1 cursor-pointer"
                        >
                          <span>
                            {showVotedDropdown ? 'Hide cards' : 'Cards ▾'}
                          </span>
                        </button>
                      </div>
                    )}
                </div>

                <InputScan
                  value={targetAddress}
                  onChange={(val) => {
                    setTargetAddress(val);
                    const matching = account.data?.votedFor.find((e) => {
                      const walletAddr = getCandidateWalletAddress(
                        e.addressString,
                      );
                      return (
                        sameAddress(walletAddr, val.trim()) ||
                        sameAddress(e.addressString, val.trim())
                      );
                    });
                    if (isUnvote && matching) {
                      setVoteCount((c) => Math.min(c, matching.count));
                    }
                  }}
                  placeholder={network === 'mainnet' ? 'UQ...' : '0Q...'}
                  data-testid="brotherhood-vote-target"
                />

                {/* Candidate Selection Cards Container */}
                {account.data && showVotedDropdown && (
                  <div className="p-2.5 bg-secondary/80 border border-border rounded-xl space-y-2 mt-1">
                    {/* Candidate source tabs */}
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex gap-1 bg-background/60 p-0.5 rounded-lg border border-border/50 text-[11px] font-medium flex-1">
                        <button
                          type="button"
                          onClick={() => setCandidateSourceTab('voted')}
                          className={`flex-1 py-1 rounded-md transition-colors cursor-pointer text-center ${
                            candidateSourceTab === 'voted'
                              ? 'bg-card shadow-sm text-foreground font-semibold border border-border/60'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          Previously Voted ({account.data.votedFor.length})
                        </button>
                        {!isUnvote && (
                          <button
                            type="button"
                            onClick={() => setCandidateSourceTab('circle')}
                            className={`flex-1 py-1 rounded-md transition-colors cursor-pointer text-center ${
                              candidateSourceTab === 'circle'
                                ? 'bg-card shadow-sm text-foreground font-semibold border border-border/60'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            Circle Members ({account.data.invited.length})
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Search Filter if multiple candidates exist */}
                    {((candidateSourceTab === 'voted'
                      ? account.data.votedFor.length
                      : account.data.invited.length) > 2 ||
                      candidateFilterQuery) && (
                      <input
                        type="text"
                        value={candidateFilterQuery}
                        onChange={(e) =>
                          setCandidateFilterQuery(e.target.value)
                        }
                        placeholder="Filter candidates by name or address..."
                        className="w-full px-2.5 py-1 text-xs rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    )}

                    {/* Candidate Cards List */}
                    {candidateSourceTab === 'voted' ? (
                      account.data.votedFor.length === 0 ? (
                        <div className="py-4 text-center space-y-1">
                          <p className="text-xs text-muted-foreground">
                            You haven't endorsed any accounts yet.
                          </p>
                          {account.data.invited.length > 0 && !isUnvote && (
                            <button
                              type="button"
                              onClick={() => setCandidateSourceTab('circle')}
                              className="text-xs text-primary hover:underline font-medium cursor-pointer"
                            >
                              Pick from your Circle members (
                              {account.data.invited.length}) →
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-1 max-h-56 overflow-y-auto">
                          {account.data.votedFor
                            .filter((entry) => {
                              if (!candidateFilterQuery) return true;
                              const q = candidateFilterQuery.toLowerCase();
                              const prof =
                                resolvedProfiles.data?.[entry.addressString];
                              const walletAddr = getCandidateWalletAddress(
                                entry.addressString,
                              );
                              return (
                                prof?.username?.toLowerCase().includes(q) ||
                                entry.addressString.toLowerCase().includes(q) ||
                                walletAddr.toLowerCase().includes(q)
                              );
                            })
                            .map((entry) => {
                              const prof =
                                resolvedProfiles.data?.[entry.addressString];
                              const candCountry = getCountryByCode(
                                prof?.country,
                              );
                              const walletAddr = getCandidateWalletAddress(
                                entry.addressString,
                              );
                              const isSelected =
                                sameAddress(targetAddress, walletAddr) ||
                                sameAddress(targetAddress, entry.addressString);
                              return (
                                <button
                                  key={`card-voted-${entry.addressString}`}
                                  type="button"
                                  onClick={() => {
                                    setTargetAddress(walletAddr);
                                    if (isUnvote) {
                                      setVoteCount(entry.count);
                                    }
                                  }}
                                  className={`w-full p-2.5 rounded-lg text-left text-xs transition flex justify-between items-center cursor-pointer ${
                                    isSelected
                                      ? 'bg-primary text-primary-foreground font-semibold'
                                      : 'bg-card/70 hover:bg-card text-foreground border border-border/40'
                                  }`}
                                >
                                  <div className="truncate pr-2">
                                    <div className="flex items-center gap-2">
                                      <span className="truncate">
                                        @{prof?.username || 'member'}
                                      </span>
                                      {prof?.username && (
                                        <span
                                          role="button"
                                          tabIndex={0}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            openTelegramProfile(prof.username!);
                                          }}
                                          onKeyDown={(e) => {
                                            if (
                                              e.key === 'Enter' ||
                                              e.key === ' '
                                            ) {
                                              e.stopPropagation();
                                              openTelegramProfile(
                                                prof.username!,
                                              );
                                            }
                                          }}
                                          className={`min-w-7 min-h-7 p-1 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                                            isSelected
                                              ? 'bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30'
                                              : 'bg-primary/10 text-primary hover:bg-primary/20'
                                          }`}
                                          title={`Open @${prof.username} on Telegram`}
                                          aria-label={`Open @${prof.username} on Telegram`}
                                        >
                                          <TelegramIcon className="w-3.5 h-3.5" />
                                        </span>
                                      )}
                                      <span className="text-[10px] opacity-80">
                                        {candCountry.flag} {candCountry.name}
                                      </span>
                                    </div>
                                    <span className="font-mono text-[10px] opacity-70 block truncate">
                                      {formatShortWallet(walletAddr)}
                                    </span>
                                  </div>
                                  <span
                                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${
                                      isSelected
                                        ? 'bg-primary-foreground/20 text-primary-foreground'
                                        : 'bg-secondary text-emerald-600 dark:text-emerald-400'
                                    }`}
                                  >
                                    {entry.count}{' '}
                                    {entry.count === 1 ? 'vote' : 'votes'}
                                  </span>
                                </button>
                              );
                            })}
                        </div>
                      )
                    ) : account.data.invited.length === 0 ? (
                      <div className="py-4 text-center">
                        <p className="text-xs text-muted-foreground">
                          No Circle members found. Invite members in the Network
                          tab first.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1 max-h-56 overflow-y-auto">
                        {account.data.invited
                          .filter((entry) => {
                            if (!candidateFilterQuery) return true;
                            const q = candidateFilterQuery.toLowerCase();
                            const prof =
                              resolvedProfiles.data?.[entry.addressString];
                            const walletAddr = getCandidateWalletAddress(
                              entry.addressString,
                            );
                            return (
                              prof?.username?.toLowerCase().includes(q) ||
                              entry.addressString.toLowerCase().includes(q) ||
                              walletAddr.toLowerCase().includes(q)
                            );
                          })
                          .map((entry) => {
                            const prof =
                              resolvedProfiles.data?.[entry.addressString];
                            const candCountry = getCountryByCode(prof?.country);
                            const walletAddr = getCandidateWalletAddress(
                              entry.addressString,
                            );
                            const isSelected =
                              sameAddress(targetAddress, walletAddr) ||
                              sameAddress(targetAddress, entry.addressString);
                            return (
                              <button
                                key={`card-circle-${entry.addressString}`}
                                type="button"
                                onClick={() => {
                                  setTargetAddress(walletAddr);
                                }}
                                className={`w-full p-2.5 rounded-lg text-left text-xs transition flex justify-between items-center cursor-pointer ${
                                  isSelected
                                    ? 'bg-primary text-primary-foreground font-semibold'
                                    : 'bg-card/70 hover:bg-card text-foreground border border-border/40'
                                }`}
                              >
                                <div className="truncate pr-2">
                                  <div className="flex items-center gap-2">
                                    <span className="truncate">
                                      @{prof?.username || 'member'}
                                    </span>
                                    {prof?.username && (
                                      <span
                                        role="button"
                                        tabIndex={0}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openTelegramProfile(prof.username!);
                                        }}
                                        onKeyDown={(e) => {
                                          if (
                                            e.key === 'Enter' ||
                                            e.key === ' '
                                          ) {
                                            e.stopPropagation();
                                            openTelegramProfile(prof.username!);
                                          }
                                        }}
                                        className={`min-w-7 min-h-7 p-1 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                                          isSelected
                                            ? 'bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30'
                                            : 'bg-primary/10 text-primary hover:bg-primary/20'
                                        }`}
                                        title={`Open @${prof.username} on Telegram`}
                                        aria-label={`Open @${prof.username} on Telegram`}
                                      >
                                        <TelegramIcon className="w-3.5 h-3.5" />
                                      </span>
                                    )}
                                    <span className="text-[10px] opacity-80">
                                      {candCountry.flag} {candCountry.name}
                                    </span>
                                  </div>
                                  <span className="font-mono text-[10px] opacity-70 block truncate">
                                    {formatShortWallet(walletAddr)}
                                  </span>
                                </div>
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 bg-secondary text-muted-foreground">
                                  Circle
                                </span>
                              </button>
                            );
                          })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Vote Count / Number of Votes */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-medium text-muted-foreground">
                    Number of Votes ({isUnvote ? 'to unvote' : 'to cast'})
                  </label>
                  <span className="text-muted-foreground text-[11px]">
                    {isUnvote
                      ? candidateVotedEntry
                        ? `Max unvotable: ${candidateVotedEntry.count}`
                        : 'Select candidate above'
                      : `Available: ${account.data?.votes ?? 10}`}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center border border-border rounded-xl bg-background overflow-hidden">
                    <button
                      type="button"
                      className="px-3 py-2 text-foreground hover:bg-secondary transition disabled:opacity-40"
                      disabled={voteCount <= 1}
                      onClick={() => setVoteCount((c) => Math.max(1, c - 1))}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={
                        isUnvote
                          ? (candidateVotedEntry?.count ?? 10)
                          : (account.data?.votes ?? 10)
                      }
                      value={voteCount}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val)) {
                          const maxVal = isUnvote
                            ? (candidateVotedEntry?.count ?? 10)
                            : (account.data?.votes ?? 10);
                          setVoteCount(Math.max(1, Math.min(maxVal || 1, val)));
                        }
                      }}
                      className="w-14 text-center text-sm font-semibold bg-transparent text-foreground focus:outline-none"
                    />
                    <button
                      type="button"
                      className="px-3 py-2 text-foreground hover:bg-secondary transition disabled:opacity-40"
                      disabled={
                        voteCount >=
                        (isUnvote
                          ? (candidateVotedEntry?.count ?? 10)
                          : (account.data?.votes ?? 10))
                      }
                      onClick={() => {
                        const maxVal = isUnvote
                          ? (candidateVotedEntry?.count ?? 10)
                          : (account.data?.votes ?? 10);
                        setVoteCount((c) => Math.min(maxVal, c + 1));
                      }}
                    >
                      +
                    </button>
                  </div>

                  {/* Preset quick buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[1, 2, 5].map((preset) => {
                      const maxVal = isUnvote
                        ? (candidateVotedEntry?.count ?? 10)
                        : (account.data?.votes ?? 10);
                      if (preset > maxVal && maxVal > 0) return null;
                      return (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setVoteCount(preset)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
                            voteCount === preset
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-secondary/60 text-secondary-foreground border-border/70 hover:bg-secondary'
                          }`}
                        >
                          {preset}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => {
                        const maxVal = isUnvote
                          ? (candidateVotedEntry?.count ?? 10)
                          : (account.data?.votes ?? 10);
                        setVoteCount(Math.max(1, maxVal));
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
                        voteCount ===
                        (isUnvote
                          ? (candidateVotedEntry?.count ?? 10)
                          : (account.data?.votes ?? 10))
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-secondary/60 text-secondary-foreground border-border/70 hover:bg-secondary'
                      }`}
                    >
                      Max
                    </button>
                  </div>
                </div>

                {!isUnvote && account.data && (
                  <p className="text-[11px] text-muted-foreground">
                    Remaining voting power after vote:{' '}
                    {Math.max(0, account.data.votes - voteCount)} / 10
                  </p>
                )}
                {isUnvote && account.data && (
                  <p className="text-[11px] text-muted-foreground">
                    Will restore {voteCount}{' '}
                    {voteCount === 1 ? 'vote' : 'votes'} (available power will
                    become {account.data.votes + voteCount} / 10)
                  </p>
                )}
              </div>

              {vote.validationError && (
                <p className="text-xs text-rose-500 font-medium">
                  {vote.validationError}
                </p>
              )}

              <Button
                onClick={() => vote.send()}
                disabled={vote.isDisabled}
                loading={vote.isSending}
                fullWidth
                data-testid="brotherhood-vote-submit"
              >
                {isUnvote
                  ? `Unvote Candidate (${voteCount} ${voteCount === 1 ? 'Vote' : 'Votes'})`
                  : `Cast ${voteCount} ${voteCount === 1 ? 'Vote' : 'Votes'}`}
              </Button>
            </div>
          </div>
        )}

        {/* Buy Credit & Repay Debt */}
        {activeTab === 'credit' && (
          <div className="space-y-4 bg-card text-card-foreground p-4 border border-border rounded-2xl shadow-sm text-sm">
            {/* Sub-tabs header */}
            <div className="flex flex-wrap gap-1 bg-secondary/70 border border-border p-1 rounded-xl text-xs font-medium">
              <button
                type="button"
                onClick={() => setCreditSubTab('buy')}
                className={`flex-1 py-1.5 px-2 rounded-lg transition-colors cursor-pointer text-center whitespace-nowrap ${
                  creditSubTab === 'buy'
                    ? 'bg-card shadow-sm text-foreground font-semibold border border-border'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                }`}
                data-testid="brotherhood-credit-subtab-buy"
              >
                Buy Credit
              </button>
              <button
                type="button"
                onClick={() => setCreditSubTab('seekers')}
                className={`flex-1 py-1.5 px-2 rounded-lg transition-colors cursor-pointer text-center whitespace-nowrap ${
                  creditSubTab === 'seekers'
                    ? 'bg-card shadow-sm text-foreground font-semibold border border-border'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                }`}
                data-testid="brotherhood-credit-subtab-seekers"
              >
                Seekers Directory
              </button>
              <button
                type="button"
                onClick={() => setCreditSubTab('terms')}
                className={`flex-1 py-1.5 px-2 rounded-lg transition-colors cursor-pointer text-center whitespace-nowrap ${
                  creditSubTab === 'terms'
                    ? 'bg-card shadow-sm text-foreground font-semibold border border-border'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                }`}
                data-testid="brotherhood-credit-subtab-terms"
              >
                My Terms
              </button>
              <button
                type="button"
                onClick={() => setCreditSubTab('repay')}
                className={`flex-1 py-1.5 px-2 rounded-lg transition-colors cursor-pointer text-center whitespace-nowrap ${
                  creditSubTab === 'repay'
                    ? 'bg-card shadow-sm text-foreground font-semibold border border-border'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                }`}
                data-testid="brotherhood-credit-subtab-repay"
              >
                Repay Debt
              </button>
            </div>

            {/* Sub-tab 1: Buy Credit */}
            {creditSubTab === 'buy' && (
              <div ref={creditFormRef} className="space-y-3 pt-1">
                <div>
                  <h3 className="font-semibold text-base">
                    Buy Credit (Personal Loan)
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Extend credit to an issuer by buying their Personal Tokens
                    with FI. Select any Circle or Ring member from the list, or
                    type/scan their address.
                  </p>
                </div>

                <MemberComboboxInput
                  value={recipient}
                  onChange={setRecipient}
                  placeholder={`Borrower Address (${network === 'mainnet' ? 'UQ...' : '0Q...'})`}
                  circleMembers={circleSelectableMembers}
                  ringMembers={ringSelectableMembers}
                  onSelectMember={(m) => {
                    if (
                      m.creditNeed &&
                      m.creditNeed > 0n &&
                      (!amount || amount === '0')
                    ) {
                      const targetNano = account.data
                        ? m.creditNeed < account.data.jettonBalance
                          ? m.creditNeed
                          : account.data.jettonBalance
                        : m.creditNeed;
                      const whole = targetNano / 1_000_000_000n;
                      const frac = (targetNano % 1_000_000_000n) / 1_000_000n;
                      const amountStr =
                        frac === 0n
                          ? whole.toString()
                          : `${whole}.${frac.toString().padStart(3, '0').replace(/0+$/, '')}`;
                      setAmount(amountStr);
                    }
                  }}
                  data-testid="brotherhood-credit-recipient"
                />
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Credit Amount (FI)"
                  className="w-full p-2.5 border border-border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="brotherhood-credit-amount"
                />

                {credit.validationError && (
                  <p className="text-xs text-rose-500 font-medium">
                    {credit.validationError}
                  </p>
                )}

                <Button
                  onClick={() => credit.send()}
                  disabled={credit.isDisabled}
                  loading={credit.isSending}
                  fullWidth
                  data-testid="brotherhood-credit-submit"
                >
                  Buy Credit
                </Button>
              </div>
            )}

            {/* Sub-tab 2: Seekers Directory */}
            {creditSubTab === 'seekers' && (
              <div className="space-y-4">
                <CircleCreditList
                  circleMembers={account.data?.invited ?? []}
                  profiles={resolvedProfiles.data}
                  isLoading={resolvedProfiles.isLoading}
                  onRefresh={() => resolvedProfiles.refetch()}
                  onSendCredit={handleSendCredit}
                />

                <hr className="border-border/60" />

                <RingCreditList
                  circleMembers={account.data?.invited ?? []}
                  circleProfiles={resolvedProfiles.data}
                  onSendCredit={handleSendCredit}
                  onRegisterRingMembers={handleRegisterRingMembers}
                />
              </div>
            )}

            {/* Sub-tab 3: My Terms */}
            {creditSubTab === 'terms' && (
              <div className="space-y-4">
                {/* Credit Overview */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-secondary/50 rounded-xl border border-border/50">
                    <span className="text-muted-foreground block text-[11px]">
                      Your Credit Need
                    </span>
                    <span className="font-semibold text-foreground">
                      {formatFi(account.data?.creditNeed)} FI
                    </span>
                  </div>
                  <div className="p-2.5 bg-secondary/50 rounded-xl border border-border/50">
                    <span className="text-muted-foreground block text-[11px]">
                      Outstanding Debt
                    </span>
                    <span className="font-semibold text-rose-500">
                      {formatFi(account.data?.debt)} FI
                    </span>
                  </div>
                </div>

                {/* Borrowing Terms Configuration Card */}
                <div className="p-3.5 bg-secondary/40 border border-border/50 rounded-xl space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground text-sm">
                      My Borrowing Terms
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Multiplier:{' '}
                      <strong className="text-foreground">
                        {account.data?.multiplier ?? 1}x
                      </strong>
                      {account.data?.creditMaturity
                        ? ` • Due: ${formatDate(account.data.creditMaturity)}`
                        : ''}
                    </span>
                  </div>

                  {/* Set Credit Need Form */}
                  <div className="space-y-2 pt-1 border-t border-border/40">
                    <label className="text-xs font-medium text-foreground block">
                      Set Credit Need (FI to Borrow)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={creditNeedInput}
                        onChange={(e) => setCreditNeedInput(e.target.value)}
                        placeholder={`Current: ${formatFi(account.data?.creditNeed)}`}
                        className="w-full p-2.5 border border-border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="brotherhood-credit-need-input"
                      />
                      <input
                        type="number"
                        step="1"
                        min="1"
                        value={creditMaturityDays}
                        onChange={(e) => setCreditMaturityDays(e.target.value)}
                        placeholder="Maturity (Days, e.g. 30)"
                        className="w-full p-2.5 border border-border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="brotherhood-credit-days-input"
                      />
                    </div>
                    <Button
                      size="sm"
                      fullWidth
                      onClick={() => {
                        const days = parseInt(creditMaturityDays, 10) || 30;
                        const maturitySec =
                          Math.floor(Date.now() / 1000) + days * 86400;
                        creditTerms.setCreditNeed(
                          creditNeedInput || '0',
                          maturitySec,
                        );
                      }}
                      disabled={
                        !canOperate || creditTerms.isSending || !creditNeedInput
                      }
                      loading={creditTerms.isSending}
                      data-testid="brotherhood-set-credit-need-submit"
                    >
                      Update Credit Need
                    </Button>
                  </div>

                  {/* Set Multiplier Form */}
                  <div className="space-y-2 pt-2 border-t border-border/40">
                    <label className="text-xs font-medium text-foreground block">
                      Set Credit Multiplier (Tokens minted per 1 FI borrowed)
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="number"
                        step="1"
                        min="1"
                        value={creditMultiplierInput}
                        onChange={(e) =>
                          setCreditMultiplierInput(e.target.value)
                        }
                        placeholder={`Current: ${account.data?.multiplier ?? 1}`}
                        className="w-full p-2.5 border border-border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="brotherhood-credit-multiplier-input"
                      />
                      <Button
                        size="sm"
                        onClick={() => {
                          const mult = parseInt(creditMultiplierInput, 10) || 1;
                          creditTerms.setMultiplier(mult);
                        }}
                        disabled={
                          !canOperate ||
                          creditTerms.isSending ||
                          !creditMultiplierInput
                        }
                        loading={creditTerms.isSending}
                        className="shrink-0"
                        data-testid="brotherhood-set-multiplier-submit"
                      >
                        Set Multiplier
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-tab 4: Repay Debt */}
            {creditSubTab === 'repay' && (
              <div className="space-y-4">
                <div className="p-2.5 bg-secondary/50 rounded-xl border border-border/50 text-xs">
                  <span className="text-muted-foreground block text-[11px]">
                    Outstanding Debt
                  </span>
                  <span className="font-semibold text-rose-500 text-sm">
                    {formatFi(account.data?.debt)} FI
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-base">Repay Debt</h3>
                    {account.data && account.data.debt > 0n && (
                      <button
                        type="button"
                        onClick={() =>
                          setAmount(
                            (Number(account.data?.debt ?? 0n) / 1e9).toString(),
                          )
                        }
                        className="text-[11px] text-blue-500 hover:underline font-medium cursor-pointer"
                      >
                        Repay All Debt
                      </button>
                    )}
                  </div>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Repayment Amount (FI)"
                    className="w-full p-2.5 border border-border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="brotherhood-repay-amount"
                  />

                  {repay.validationError && (
                    <p className="text-xs text-rose-500 font-medium">
                      {repay.validationError}
                    </p>
                  )}

                  <Button
                    onClick={() => repay.send()}
                    disabled={repay.isDisabled}
                    loading={repay.isSending}
                    fullWidth
                    data-testid="brotherhood-repay-submit"
                  >
                    Repay Debt
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Allowances */}
        {activeTab === 'allowance' && (
          <div className="space-y-4 bg-card text-card-foreground p-4 border border-border rounded-2xl shadow-sm text-sm">
            {/* Sub-tabs header */}
            <div className="flex gap-1 bg-secondary/70 border border-border p-1 rounded-xl text-xs font-medium">
              <button
                type="button"
                onClick={() => setAllowanceSubTab('active')}
                className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  allowanceSubTab === 'active'
                    ? 'bg-card shadow-sm text-foreground font-semibold border border-border'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                }`}
                data-testid="brotherhood-allowance-subtab-active"
              >
                Active Permissions ({account.data?.allowances.length ?? 0})
              </button>
              <button
                type="button"
                onClick={() => setAllowanceSubTab('grant')}
                className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  allowanceSubTab === 'grant'
                    ? 'bg-card shadow-sm text-foreground font-semibold border border-border'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                }`}
                data-testid="brotherhood-allowance-subtab-grant"
              >
                Grant Allowance
              </button>
              <button
                type="button"
                onClick={() => setAllowanceSubTab('spend')}
                className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  allowanceSubTab === 'spend'
                    ? 'bg-card shadow-sm text-foreground font-semibold border border-border'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                }`}
                data-testid="brotherhood-allowance-subtab-spend"
              >
                Spend Allowance
              </button>
            </div>

            {/* Active Allowances List Sub-Tab */}
            {allowanceSubTab === 'active' && (
              <div className="space-y-3 pt-1">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">
                      Granted Spending Permissions
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Accounts authorized to spend FI tokens from your wallet
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setAllowanceSubTab('grant')}
                    className="text-xs"
                  >
                    + Grant New
                  </Button>
                </div>

                {account.data && account.data.allowances.length > 0 ? (
                  <div className="space-y-2">
                    {account.data.allowances.map((entry) => (
                      <div
                        key={entry.addressString}
                        className="p-3 bg-secondary/40 border border-border/50 rounded-xl text-xs flex justify-between items-center"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-foreground font-medium">
                              {formatShortWallet(entry.addressString)}
                            </span>
                            <CopyButton
                              address={entry.addressString}
                              type="wallet"
                              size="xs"
                            />
                          </div>
                          <span className="text-[11px] text-muted-foreground block">
                            Spending Limit:{' '}
                            <strong className="text-foreground">
                              {formatFi(entry.amount)} FI
                            </strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="text-xs h-7"
                            onClick={() => {
                              setGrantee(entry.addressString);
                              setAmount(formatFi(entry.amount));
                              setAllowanceSubTab('grant');
                            }}
                          >
                            Adjust
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            className="text-xs h-7"
                            onClick={() => {
                              setGrantee(entry.addressString);
                              setAmount('0');
                              setAllowanceSubTab('grant');
                            }}
                          >
                            Revoke
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 px-4 text-center space-y-3 bg-secondary/20 border border-border/50 rounded-2xl">
                    <div className="w-10 h-10 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary text-lg">
                      🛡️
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">
                        No Active Allowances
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                        You have not granted spending permissions to any account
                        yet.
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setAllowanceSubTab('grant')}
                      className="text-xs"
                    >
                      Grant First Allowance
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Grant Allowance Sub-Tab */}
            {allowanceSubTab === 'grant' && (
              <div className="space-y-3 pt-1">
                <div>
                  <h3 className="font-semibold text-base">Grant Allowance</h3>
                  <p className="text-xs text-muted-foreground">
                    Authorize an account to spend up to a maximum amount of FI
                    from your wallet. Setting amount to 0 revokes the allowance.
                  </p>
                </div>
                <div className="space-y-2">
                  <InputScan
                    value={grantee}
                    onChange={setGrantee}
                    placeholder={`Grantee Address (${network === 'mainnet' ? 'UQ...' : '0Q...'})`}
                    data-testid="brotherhood-grantee-address"
                  />
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Allowance Amount (FI)"
                    className="w-full p-2.5 border border-border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="brotherhood-allowance-amount"
                  />

                  {setAllowance.validationError && (
                    <p className="text-xs text-rose-500 font-medium">
                      {setAllowance.validationError}
                    </p>
                  )}

                  <Button
                    onClick={() => setAllowance.send()}
                    disabled={setAllowance.isDisabled}
                    loading={setAllowance.isSending}
                    fullWidth
                    data-testid="brotherhood-grant-allowance-submit"
                  >
                    Grant Allowance
                  </Button>
                </div>
              </div>
            )}

            {/* Spend Allowance Sub-Tab */}
            {allowanceSubTab === 'spend' && (
              <div className="space-y-3 pt-1">
                <div>
                  <h3 className="font-semibold text-base">Spend Allowance</h3>
                  <p className="text-xs text-muted-foreground">
                    Spend FI tokens authorized to you by a granter account.
                  </p>
                </div>
                <div className="space-y-2">
                  <InputScan
                    value={granter}
                    onChange={setGranter}
                    placeholder={`Granter Address (${network === 'mainnet' ? 'UQ...' : '0Q...'})`}
                    data-testid="brotherhood-granter-address"
                  />
                  <InputScan
                    value={recipient}
                    onChange={setRecipient}
                    placeholder={`Receiver Address (${network === 'mainnet' ? 'UQ...' : '0Q...'})`}
                    data-testid="brotherhood-spend-receiver"
                  />
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Amount to Spend (FI)"
                    className="w-full p-2.5 border border-border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="brotherhood-spend-amount"
                  />

                  {spendAllowance.validationError && (
                    <p className="text-xs text-rose-500 font-medium">
                      {spendAllowance.validationError}
                    </p>
                  )}

                  <Button
                    onClick={() => spendAllowance.send()}
                    disabled={spendAllowance.isDisabled}
                    loading={spendAllowance.isSending}
                    fullWidth
                    data-testid="brotherhood-spend-allowance-submit"
                  >
                    Spend Allowance
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Gold Coins */}
        {activeTab === 'gold' && (
          <div className="space-y-3 bg-card text-card-foreground p-4 border border-border rounded-2xl shadow-sm text-sm">
            <h3 className="font-semibold text-base mb-1">
              Transfer Gold Coins
            </h3>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Your Gold Coins:</span>
              <span className="font-semibold text-foreground">
                🪙 {account.data?.goldCoins ?? 0}
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Recipient Address
              </label>
              <InputScan
                value={goldRecipient}
                onChange={setGoldRecipient}
                placeholder={network === 'mainnet' ? 'UQ...' : '0Q...'}
                data-testid="brotherhood-gold-recipient"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Number of Gold Coins
              </label>
              <input
                type="number"
                value={goldAmount}
                onChange={(e) => setGoldAmount(parseInt(e.target.value) || 0)}
                placeholder="1"
                className="w-full p-2.5 border border-border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-testid="brotherhood-gold-amount"
              />
            </div>

            {gold.validationError && (
              <p className="text-xs text-rose-500 font-medium">
                {gold.validationError}
              </p>
            )}

            <Button
              onClick={() => gold.send()}
              disabled={gold.isDisabled}
              loading={gold.isSending}
              fullWidth
              data-testid="brotherhood-gold-submit"
            >
              Transfer Gold Coins
            </Button>
          </div>
        )}

        {/* Profile */}
        {activeTab === 'profile' && (
          <div className="space-y-4 bg-card text-card-foreground p-4 border border-border rounded-2xl shadow-sm text-sm">
            {/* Unified Edit Form */}
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-foreground text-sm">
                  Update Profile & Nominee
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  Modify any fields below. Changes are batched and applied in a
                  single on-chain transaction.
                </p>
              </div>

              {/* Username Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Telegram Username
                </label>
                <input
                  type="text"
                  value={profileUsername}
                  onChange={(e) => setProfileUsername(e.target.value)}
                  placeholder={
                    account.data?.username
                      ? `@${account.data.username}`
                      : '@username or username'
                  }
                  className="w-full p-2.5 border border-border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="brotherhood-profile-username"
                />
                {profile.usernameValidationError && (
                  <p className="text-xs text-rose-500 font-medium">
                    {profile.usernameValidationError}
                  </p>
                )}
              </div>

              {/* H3 Spatial Location Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-medium text-muted-foreground">
                    H3 Spatial Cell
                  </label>
                  <a
                    href={getH3ViewerUrl(
                      profileH3Cell || account.data?.h3Cell || '',
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-blue-500 hover:underline flex items-center gap-0.5"
                  >
                    <span>H3 Converter</span> ↗
                  </a>
                </div>
                <input
                  type="text"
                  value={profileH3Cell}
                  onChange={(e) => setProfileH3Cell(e.target.value)}
                  placeholder={account.data?.h3Cell || '882681a339fffff'}
                  className="w-full p-2.5 border border-border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="brotherhood-profile-location"
                />
                {profile.locationValidationError && (
                  <p className="text-xs text-rose-500 font-medium">
                    {profile.locationValidationError}
                  </p>
                )}
              </div>

              {/* Country Select */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-medium text-muted-foreground">
                    Country Code (ISO 3166-1)
                  </label>
                  {!isEditingCountry ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-1.5 text-[10px] text-primary hover:text-primary hover:bg-primary/10"
                      onClick={() => {
                        setProfileCountry(account.data?.country ?? 0);
                        setIsEditingCountry(true);
                      }}
                      data-testid="brotherhood-profile-country-edit-btn"
                    >
                      Edit
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-1.5 text-[10px] text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        setProfileCountry(null);
                        setIsEditingCountry(false);
                      }}
                      data-testid="brotherhood-profile-country-cancel-btn"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
                {!isEditingCountry ? (
                  <div className="p-2.5 border border-border rounded-xl text-xs bg-secondary/30 text-foreground flex items-center justify-between">
                    <span>
                      {account.data?.country
                        ? `${getCountryByCode(account.data.country)?.name || 'Country'} (${account.data.country})`
                        : 'Global (0)'}
                    </span>
                    <span className="text-[10px] text-muted-foreground italic">
                      Read-only
                    </span>
                  </div>
                ) : (
                  <>
                    <CountrySelect
                      value={profileCountry ?? account.data?.country ?? 0}
                      onChange={(code) => setProfileCountry(code)}
                      data-testid="brotherhood-profile-country"
                    />
                    {profile.countryValidationError && (
                      <p className="text-xs text-amber-500 font-medium">
                        {profile.countryValidationError}
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Nominee Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-medium text-muted-foreground">
                    Succession Nominee Address
                  </label>
                  {account.data?.nominee && (
                    <button
                      type="button"
                      onClick={() =>
                        setProfileNominee(
                          formatWalletAddress(
                            account.data?.nominee?.toString() ?? '',
                            false,
                          ),
                        )
                      }
                      className="text-[11px] text-primary hover:underline cursor-pointer"
                    >
                      Pre-fill current
                    </button>
                  )}
                </div>
                <InputScan
                  value={profileNominee}
                  onChange={(val) => setProfileNominee(val)}
                  placeholder={
                    account.data?.nominee
                      ? formatShortWallet(account.data.nominee.toString())
                      : network === 'mainnet'
                        ? 'UQ...'
                        : '0Q...'
                  }
                  data-testid="brotherhood-profile-nominee"
                />
                {profile.nomineeValidationError && (
                  <p className="text-xs text-rose-500 font-medium">
                    {profile.nomineeValidationError}
                  </p>
                )}
              </div>

              {/* Error feedback */}
              {profile.error && (
                <p className="text-xs text-rose-500 font-medium">
                  {profile.error}
                </p>
              )}

              {/* Submit Button */}
              <Button
                onClick={async () => {
                  await profile.updateProfile();
                  setProfileUsername('');
                  setProfileH3Cell('');
                  setProfileCountry(null);
                  setIsEditingCountry(false);
                  setProfileNominee('');
                }}
                disabled={profile.isDisabled}
                loading={profile.isSending}
                fullWidth
                data-testid="brotherhood-update-profile-submit"
              >
                {profile.isSending
                  ? 'Updating Profile...'
                  : profile.isDirty
                    ? 'Save Profile Changes'
                    : 'No Changes to Save'}
              </Button>

              <div className="text-[11px] text-muted-foreground space-y-0.5">
                <p>
                  • Requires 1.0 TON network gas; unspent gas is automatically
                  refunded to your wallet.
                </p>
                <p>
                  • Changing country requires no active votes cast (must unvote
                  all candidates first).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Authority Panel */}
        {activeTab === 'authority' && isAuthority && (
          <div className="space-y-4 bg-amber-500/10 p-4 border rounded-2xl shadow-sm text-sm border-amber-500/30 text-card-foreground">
            <div>
              <h3 className="font-semibold text-base text-amber-500 mb-0.5">
                Authority Actions
              </h3>
              <p className="text-xs text-muted-foreground">
                Administrative controls for governance and account status
                enforcement.
              </p>
            </div>

            {/* Sub-tabs header */}
            <div className="flex gap-1 bg-secondary/70 border border-border p-1 rounded-xl text-xs font-medium">
              <button
                type="button"
                onClick={() => setAuthoritySubTab('status')}
                className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  authoritySubTab === 'status'
                    ? 'bg-card shadow-sm text-foreground font-semibold border border-border'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                }`}
                data-testid="brotherhood-authority-subtab-status"
              >
                Set Account Status
              </button>
              <button
                type="button"
                onClick={() => setAuthoritySubTab('close')}
                className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  authoritySubTab === 'close'
                    ? 'bg-card shadow-sm text-foreground font-semibold border border-border'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                }`}
                data-testid="brotherhood-authority-subtab-close"
              >
                Close Member Account
              </button>
            </div>

            {authoritySubTab === 'status' && (
              <div className="space-y-2 pt-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Set Account Status (0 = Active, 1 = Suspended, 2 = Review)
                </label>
                <input
                  type="number"
                  value={authStatus}
                  onChange={(e) => setAuthStatus(parseInt(e.target.value) || 0)}
                  placeholder="0 = active, 1 = suspended, 2 = review"
                  className="w-full p-2.5 border border-border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="brotherhood-authority-status-input"
                />
                <Button
                  onClick={() => authority.setStatus()}
                  disabled={authority.isDisabled}
                  loading={authority.isSending}
                  fullWidth
                  data-testid="brotherhood-authority-set-status-submit"
                >
                  Set Account Status
                </Button>
              </div>
            )}

            {authoritySubTab === 'close' && (
              <div className="space-y-2 pt-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Close Member Account
                </label>
                <InputScan
                  value={authTarget}
                  onChange={setAuthTarget}
                  placeholder={`Target Address (${network === 'mainnet' ? 'UQ...' : '0Q...'})`}
                  data-testid="brotherhood-authority-target"
                />
                <Button
                  variant="secondary"
                  onClick={() => authority.closeAccount()}
                  disabled={authority.isDisabled || !authTarget}
                  loading={authority.isSending}
                  fullWidth
                  data-testid="brotherhood-authority-close-submit"
                >
                  Close Account (Authority)
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </NewLayout>
  );
};
