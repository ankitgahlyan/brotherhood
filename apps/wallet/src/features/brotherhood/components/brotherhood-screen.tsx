/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from '@/core/routing';
import { useWallet, useWalletKit } from '@demo/wallet-core';
import { NewLayout } from '@/core/components/shared/new-layout';
import { ScreenHeader } from '@/core/components/shared/screen-header';
import { Button } from '@/core/components/ui/button';
import { InputScan } from '@/core/components/ui/input-scan';
import { CountrySelect } from '@/core/components/ui/country-select';
import { CopyButton } from '@/core/components/ui/copy-button';
import { getCountryByCode } from '@/lib/brotherhood/countries';
import { useFormatAddress } from '@/core/utils/formatters';
import { NonMemberCard } from './non-member-card';
import { ActivationBanner } from './activation-banner';
import { useIsNetworkMember } from '../hooks/use-is-network-member';

import { useFiMinterState } from '@/lib/brotherhood/queries';
import { useFiAccount } from '../hooks/use-fi-account';
import { useMemberProfiles } from '../hooks/use-member-profiles';
import { useFiTransfer } from '../hooks/use-fi-transfer';
import { useFiBurn } from '../hooks/use-fi-burn';
import { useWeeklyClaim } from '../hooks/use-weekly-claim';
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

type Tab =
  | 'account'
  | 'transfer'
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
  const walletKit = useWalletKit();
  const { currentWallet, address, savedWallets, activeWalletId } = useWallet();
  const network =
    savedWallets.find((w) => w.id === activeWalletId)?.network ?? 'testnet';
  const { formatWalletAddress, formatContractAddress } = useFormatAddress();

  const formatShortWallet = (addr: Address | string | null | undefined) => {
    if (!addr) return 'None';
    return formatWalletAddress(addr, true, 4);
  };

  const formatShortContract = (addr: Address | string | null | undefined) => {
    if (!addr) return 'None';
    return formatContractAddress(addr, true, 4);
  };

  const [activeTab, setActiveTab] = useState<Tab>('account');

  // Forms state
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [invitee, setInvitee] = useState('');
  const [inviteUsername, setInviteUsername] = useState('');
  const [inviteH3Cell, setInviteH3Cell] = useState('');
  const [inviteCountry, setInviteCountry] = useState(840);
  const [targetAddress, setTargetAddress] = useState('');
  const [isUnvote, setIsUnvote] = useState(false);
  const [voteCount, setVoteCount] = useState<number>(1);
  const [showVotedDropdown, setShowVotedDropdown] = useState(false);
  const [grantee, setGrantee] = useState('');
  const [granter, setGranter] = useState('');
  const [goldRecipient, setGoldRecipient] = useState('');
  const [goldAmount, setGoldAmount] = useState(1);
  const [profileUsername, setProfileUsername] = useState('');
  const [profileH3Cell, setProfileH3Cell] = useState('');
  const [profileCountry, setProfileCountry] = useState(840);
  const [authTarget, setAuthTarget] = useState('');
  const [authStatus, setAuthStatus] = useState(0);

  // FiAccount hook
  const account = useFiAccount(address ?? null);

  const candidateVotedEntry = useMemo(() => {
    if (!account.data || !targetAddress.trim()) return undefined;
    return account.data.votedFor.find(
      (e) => e.addressString === targetAddress.trim(),
    );
  }, [account.data, targetAddress]);

  // Address batch resolver for voted candidates & invitees
  const addressesToResolve = useMemo(() => {
    const list: string[] = [];
    if (account.data?.votedFor) {
      account.data.votedFor.forEach((v) => list.push(v.addressString));
    }
    if (account.data?.invited) {
      account.data.invited.forEach((i) => list.push(i.addressString));
    }
    return list;
  }, [account.data]);

  const resolvedProfiles = useMemberProfiles(addressesToResolve, network);

  // Transaction hooks with connected FiAccount state
  const transfer = useFiTransfer({
    wallet: currentWallet,
    walletKit,
    walletAddress: address ?? null,
    recipient,
    amount,
    network,
    accountData: account.data,
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
    country: profileCountry,
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
        <ScreenHeader title="BrotherHood" onBack={() => navigate('/wallet')} />
      }
    >
      <div className="space-y-4">
        {/* Activation & Status Banner */}
        <ActivationBanner />

        {/* Contract Upgrade Alert Banner */}
        {upgrade.hasUpgradeAvailable && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-700 dark:text-amber-400 flex justify-between items-center gap-3">
            <div>
              <span className="font-semibold block flex items-center gap-1.5">
                <span>⚡ Contract Upgrade Available</span>
              </span>
              <span className="text-[11px] text-muted-foreground block mt-0.5">
                Your wallet is on <span className="font-semibold text-foreground">v{upgrade.walletVersion}</span>. Latest minter version is <span className="font-semibold text-foreground">v{upgrade.minterVersion}</span>.
              </span>
            </div>
            <Button
              size="sm"
              variant="default"
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
              'transfer',
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
                    <span className="text-base font-bold text-foreground block">
                      @{account.data.username || 'anonymous'}
                    </span>
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
                        href={`https://ankitgahlyan.github.io/h3-viewer/`}
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
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-[11px] text-foreground">
                        {formatShortWallet(account.data.nominee)}
                      </span>
                      {account.data.nominee && (
                        <CopyButton
                          address={account.data.nominee}
                          type="wallet"
                          size="xs"
                        />
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
                        v{account.data.version} (Minter: v{minterVersion ?? '...'})
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

        {/* Transfer FI */}
        {activeTab === 'transfer' && (
          <div className="space-y-3 bg-card text-card-foreground p-4 border border-border rounded-2xl shadow-sm text-sm">
            <h3 className="font-semibold text-base mb-1">Transfer FI Tokens</h3>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Available Balance:</span>
              <span className="font-semibold text-foreground">
                {formatFi(account.data?.jettonBalance)} FI
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Recipient Address
              </label>
              <InputScan
                value={recipient}
                onChange={setRecipient}
                placeholder="0Q..."
                data-testid="brotherhood-transfer-recipient"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-muted-foreground">
                  Amount (FI)
                </label>
                {account.data && (
                  <button
                    type="button"
                    onClick={() =>
                      setAmount(
                        (
                          Number(account.data?.jettonBalance ?? 0n) / 1e9
                        ).toString(),
                      )
                    }
                    className="text-[11px] text-blue-500 hover:underline font-medium"
                  >
                    Use Max
                  </button>
                )}
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                className="w-full p-2.5 border border-border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-testid="brotherhood-transfer-amount"
              />
            </div>

            {transfer.validationError && (
              <p className="text-xs text-rose-500 font-medium">
                {transfer.validationError}
              </p>
            )}

            <Button
              onClick={() => transfer.send()}
              disabled={transfer.isDisabled}
              loading={transfer.isSending}
              fullWidth
              data-testid="brotherhood-transfer-submit"
            >
              Send FI Transfer
            </Button>
          </div>
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

        {/* Weekly Claim */}
        {activeTab === 'claim' && (
          <div className="space-y-4 bg-card text-card-foreground p-4 border border-border rounded-2xl shadow-sm text-sm">
            <div className="text-center space-y-1">
              <h3 className="font-semibold text-base">
                Claim Weekly Grant (UBI)
              </h3>
              <p className="text-xs text-muted-foreground">
                Members are entitled to claim {claim.claimAmountFi} FI weekly
                for up to 2 years from activation.
              </p>
            </div>

            <div className="p-3 bg-secondary/50 rounded-xl border border-border/60 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Grant Amount</span>
                <span className="font-bold text-foreground">
                  {claim.claimAmountFi} FI
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Last Claimed</span>
                <span className="text-foreground">
                  {formatDate(account.data?.lastClaim)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Claim Eligibility</span>
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
                  placeholder="0Q..."
                  data-testid="brotherhood-invite-recipient"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Username
                </label>
                <input
                  type="text"
                  value={inviteUsername}
                  onChange={(e) => setInviteUsername(e.target.value)}
                  placeholder="alice"
                  className="w-full p-2.5 border border-border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="brotherhood-invite-username"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-medium text-muted-foreground">
                    H3 Spatial Cell
                  </label>
                  <a
                    href="https://ankitgahlyan.github.io/h3-viewer/"
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
                          <span className="font-semibold text-foreground block">
                            @{prof?.username || 'member'}
                          </span>
                          <span className="font-mono text-[10px] text-muted-foreground">
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
                {memberCountry.flag} {memberCountry.name}). Each member is endowed with
                10 votes that can be cast granularly and incrementally across multiple candidates.
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
                    return (
                      <div
                        key={entry.addressString}
                        className="p-3 bg-secondary/40 border border-border/60 rounded-xl text-xs flex justify-between items-center gap-2"
                      >
                        <div className="truncate">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-foreground truncate">
                              @{prof?.username || 'member'}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {candCountry.flag} {candCountry.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-mono text-[10px] text-muted-foreground truncate">
                              {formatShortContract(entry.addressString)}
                            </span>
                            <CopyButton
                              address={entry.addressString}
                              type="contract"
                              size="xs"
                            />
                          </div>
                          <span className="text-[10px] text-emerald-600 font-medium">
                            Endorsed with {entry.count} {entry.count === 1 ? 'vote' : 'votes'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setTargetAddress(entry.addressString);
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
                    setVoteCount((c) =>
                      Math.min(c, account.data?.votes ?? 10) || 1,
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
                    if (
                      (!targetAddress.trim() ||
                        !account.data?.votedFor.some(
                          (e) => e.addressString === targetAddress.trim(),
                        )) &&
                      account.data?.votedFor &&
                      account.data.votedFor.length > 0
                    ) {
                      const first = account.data.votedFor[0];
                      setTargetAddress(first.addressString);
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

              {/* Target Member Address with Dropdown Suggestions */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-medium text-muted-foreground">
                    Target Member Address
                  </label>
                  {account.data && account.data.votedFor.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowVotedDropdown((prev) => !prev)}
                      className="text-xs text-primary hover:underline font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <span>
                        {showVotedDropdown
                          ? 'Hide endorsements'
                          : `Pick from active (${account.data.votedFor.length}) ▾`}
                      </span>
                    </button>
                  )}
                </div>

                <InputScan
                  value={targetAddress}
                  onChange={(val) => {
                    setTargetAddress(val);
                    const matching = account.data?.votedFor.find(
                      (e) => e.addressString === val.trim(),
                    );
                    if (isUnvote && matching) {
                      setVoteCount((c) => Math.min(c, matching.count));
                    }
                  }}
                  placeholder="0Q..."
                  data-testid="brotherhood-vote-target"
                />

                {/* Dropdown suggestions list of already voted candidates */}
                {account.data &&
                  account.data.votedFor.length > 0 &&
                  (showVotedDropdown || (isUnvote && !targetAddress.trim())) && (
                    <div className="p-2 bg-secondary/80 border border-border rounded-xl space-y-1 mt-1 max-h-56 overflow-y-auto">
                      <span className="text-[11px] font-semibold text-muted-foreground px-2 block">
                        {isUnvote
                          ? 'Select an endorsed candidate to unvote:'
                          : 'Select an existing candidate to add votes:'}
                      </span>
                      {account.data.votedFor.map((entry) => {
                        const prof =
                          resolvedProfiles.data?.[entry.addressString];
                        const candCountry = getCountryByCode(prof?.country);
                        const isSelected =
                          targetAddress.trim() === entry.addressString;
                        return (
                          <button
                            key={entry.addressString}
                            type="button"
                            onClick={() => {
                              setTargetAddress(entry.addressString);
                              setShowVotedDropdown(false);
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
                              <div className="flex items-center gap-1.5">
                                <span className="truncate">
                                  @{prof?.username || 'member'}
                                </span>
                                <span className="text-[10px] opacity-80">
                                  {candCountry.flag} {candCountry.name}
                                </span>
                              </div>
                              <span className="font-mono text-[10px] opacity-70 block truncate">
                                {formatShortContract(entry.addressString)}
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

            {/* Buy Credit Section */}
            <div className="space-y-2 pt-1">
              <h3 className="font-semibold text-base">
                Buy Credit (Personal Loan)
              </h3>
              <p className="text-xs text-muted-foreground">
                Extend credit to an issuer by buying their Personal Tokens with
                FI.
              </p>

              <InputScan
                value={recipient}
                onChange={setRecipient}
                placeholder="Borrower Address (0Q...)"
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

            <hr className="border-border" />

            {/* Repay Debt Section */}
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
                    className="text-[11px] text-blue-500 hover:underline font-medium"
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

        {/* Allowances */}
        {activeTab === 'allowance' && (
          <div className="space-y-4 bg-card text-card-foreground p-4 border border-border rounded-2xl shadow-sm text-sm">
            {/* Active Allowances List */}
            {account.data && account.data.allowances.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-foreground">
                  Granted Spending Permissions ({account.data.allowances.length}
                  )
                </h4>
                <div className="space-y-1.5">
                  {account.data.allowances.map((entry) => (
                    <div
                      key={entry.addressString}
                      className="p-2.5 bg-secondary/40 border border-border/50 rounded-xl text-xs flex justify-between items-center"
                    >
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-foreground">
                            {formatShortWallet(entry.addressString)}
                          </span>
                          <CopyButton
                            address={entry.addressString}
                            type="wallet"
                            size="xs"
                          />
                        </div>
                        <span className="text-[11px] text-muted-foreground block">
                          Limit: {formatFi(entry.amount)} FI
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setGrantee(entry.addressString);
                          setAmount('0');
                        }}
                      >
                        Revoke
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Grant Allowance */}
            <div className="space-y-2 border-t border-border pt-2">
              <h3 className="font-semibold text-base">Grant Allowance</h3>
              <InputScan
                value={grantee}
                onChange={setGrantee}
                placeholder="Grantee Address (0Q...)"
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

            <hr className="border-border" />

            {/* Spend Allowance */}
            <div className="space-y-2">
              <h3 className="font-semibold text-base">Spend Allowance</h3>
              <InputScan
                value={granter}
                onChange={setGranter}
                placeholder="Granter Address (0Q...)"
                data-testid="brotherhood-granter-address"
              />
              <InputScan
                value={recipient}
                onChange={setRecipient}
                placeholder="Receiver Address (0Q...)"
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
                placeholder="0Q..."
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
            <h3 className="font-semibold text-base">Update Member Profile</h3>

            {/* Username */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                New Username
              </label>
              <input
                type="text"
                value={profileUsername}
                onChange={(e) => setProfileUsername(e.target.value)}
                placeholder="bob"
                className="w-full p-2.5 border border-border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-testid="brotherhood-profile-username"
              />
              {profile.usernameValidationError && (
                <p className="text-xs text-rose-500 font-medium">
                  {profile.usernameValidationError}
                </p>
              )}
              <Button
                onClick={() => profile.updateUsername()}
                disabled={
                  Boolean(profile.usernameValidationError) || profile.isSending
                }
                loading={profile.isSending}
                fullWidth
                data-testid="brotherhood-update-username-submit"
              >
                Update Username
              </Button>
            </div>

            <hr className="border-border" />

            {/* H3 Spatial Cell */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-muted-foreground">
                  New H3 Spatial Cell
                </label>
                <a
                  href="https://ankitgahlyan.github.io/h3-viewer/"
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
                placeholder="882681a339fffff"
                className="w-full p-2.5 border border-border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-testid="brotherhood-profile-location"
              />
              {profile.locationValidationError && (
                <p className="text-xs text-rose-500 font-medium">
                  {profile.locationValidationError}
                </p>
              )}
              <Button
                onClick={() => profile.updateLocation()}
                disabled={
                  Boolean(profile.locationValidationError) || profile.isSending
                }
                loading={profile.isSending}
                fullWidth
                data-testid="brotherhood-update-location-submit"
              >
                Update Location
              </Button>
            </div>

            <hr className="border-border" />

            {/* Country */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                New Country Code (ISO 3166-1)
              </label>
              <CountrySelect
                value={profileCountry}
                onChange={setProfileCountry}
                data-testid="brotherhood-profile-country"
              />
              {profile.countryValidationError && (
                <p className="text-xs text-amber-500 font-medium">
                  {profile.countryValidationError}
                </p>
              )}
              <Button
                onClick={() => profile.updateCountry()}
                disabled={!profile.canChangeCountry || profile.isSending}
                loading={profile.isSending}
                fullWidth
                data-testid="brotherhood-update-country-submit"
              >
                Update Country
              </Button>
            </div>
          </div>
        )}

        {/* Authority Panel */}
        {activeTab === 'authority' && isAuthority && (
          <div className="space-y-4 bg-amber-500/10 p-4 border rounded-2xl shadow-sm text-sm border-amber-500/30 text-card-foreground">
            <h3 className="font-semibold text-base text-amber-500 mb-1">
              Authority Actions
            </h3>

            <div className="space-y-2">
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

            <hr className="border-border" />

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Close Member Account
              </label>
              <InputScan
                value={authTarget}
                onChange={setAuthTarget}
                placeholder="Target Address (0Q...)"
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
          </div>
        )}
      </div>
    </NewLayout>
  );
};
