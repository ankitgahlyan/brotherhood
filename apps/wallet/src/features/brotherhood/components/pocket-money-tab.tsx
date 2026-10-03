/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState, useMemo } from 'react';
import { Address } from '@ton/core';
import type { ITonWalletKit, Wallet } from '@ton/walletkit';
import {
  CheckCircle2,
  PlusCircle,
  Send,
  Search,
  Lock,
  Unlock,
  Clock,
  Infinity as InfinityIcon,
  Calendar,
  Layers,
  Repeat,
  FileCheck2,
} from 'lucide-react';
import { SwipeableSubTabs } from '@/core/components/shared/swipeable-sub-tabs';
import { ScrollableTabBar } from '@/core/components/ui/tabs';
import { Button } from '@/core/components/ui/button';
import { TxButton } from '@/core/components/ui/tx-button';
import { InputScan } from '@/core/components/ui/input-scan';
import { CopyButton } from '@/core/components/ui/copy-button';
import { FI_ADDRESS, type Network } from '@/lib/brotherhood/config';
import type { PocketMoney } from '@/lib/brotherhood/deploy';
import type { TokenContractContext } from '@/features/send/lib/token-contract-resolution';
import { useFormatAddress, sameAddress } from '@/core/utils/formatters';
import { formatProfileUsernameDisplay } from '@/core/utils/telegram';
import { usePocketMoneyBalance } from '@/features/send/hooks/use-pocket-money-balance';
import type { AllowanceEntry, FiAccountData } from '../hooks/use-fi-account';
import {
  useSetPocketMoney,
  ONE_DAY_SEC,
  ONE_WEEK_SEC,
  ONE_MONTH_SEC,
  ONE_YEAR_SEC,
  formatFiCoins,
  formatPocketMoneyPeriod,
  formatPocketMoneyTimestamp,
  type PocketMoneyGrantMode,
} from '../hooks/use-set-pocket-money';
import { useSpendPocketMoney } from '../hooks/use-spend-pocket-money';
import type { SelectableMemberOption } from './credit';

const FI_TOKEN_CONTEXT: TokenContractContext = {
  tokenType: 'JETTON',
  symbol: 'FI',
  minterAddress: FI_ADDRESS,
};

export type PocketMoneySubTab = 'active' | 'lookup' | 'grant' | 'spend';

export interface PocketMoneyTabProps {
  wallet: Wallet | null | undefined;
  walletKit: ITonWalletKit | null;
  walletAddress: string | null;
  network: Network;
  accountData: FiAccountData | null;
  allowanceSubTab: PocketMoneySubTab;
  setAllowanceSubTab: (tab: PocketMoneySubTab) => void;
  grantee: string;
  setGrantee: (val: string) => void;
  granter: string;
  setGranter: (val: string) => void;
  recipient: string;
  setRecipient: (val: string) => void;
  amount: string;
  setAmount: (val: string) => void;
  circleMembers?: SelectableMemberOption[];
  onBoundaryPrev?: () => void;
  onBoundaryNext?: () => void;
  onRefetchAccount?: () => void;
}

function toDatetimeLocalValue(sec: number): string {
  if (!sec || sec <= 0) return '';
  const d = new Date(sec * 1000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocalValue(val: string): number {
  if (!val.trim()) return 0;
  const ms = Date.parse(val);
  return Number.isNaN(ms) ? 0 : Math.floor(ms / 1000);
}

function getOffsetDatetimeLocalValue(secondsOffset: number): string {
  const targetSec = Math.floor(Date.now() / 1000) + secondsOffset;
  return toDatetimeLocalValue(targetSec);
}

export const PocketMoneySlotsBreakdown: React.FC<{
  pocketMoney?: PocketMoney | null;
  spendableAmount: bigint;
  compact?: boolean;
}> = ({ pocketMoney, spendableAmount, compact = false }) => {
  const [nowSec] = useState(() => BigInt(Math.floor(Date.now() / 1000)));

  if (!pocketMoney) {
    return (
      <div className="text-[11px] text-muted-foreground">
        Spendable Now:{' '}
        <strong className="text-foreground">
          {formatFiCoins(spendableAmount)} FI
        </strong>
      </div>
    );
  }

  const hasOpen =
    pocketMoney.openRecurring && pocketMoney.openRecurring.limit > 0n;
  const hasFixed =
    pocketMoney.fixedRecurring &&
    pocketMoney.fixedRecurring.limit > 0n &&
    nowSec < pocketMoney.fixedRecurring.validUntil;
  const hasOneTime =
    pocketMoney.oneTime &&
    pocketMoney.oneTime.remaining > 0n &&
    (pocketMoney.oneTime.validUntil === 0n ||
      nowSec < pocketMoney.oneTime.validUntil);

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] text-muted-foreground">
          Spendable Now:{' '}
          <strong className="text-foreground">
            {formatFiCoins(spendableAmount)} FI
          </strong>
        </span>
        {pocketMoney.unrestricted && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-500 text-[10px] font-semibold">
            <InfinityIcon className="w-3 h-3" />
            Unrestricted (Special One)
          </span>
        )}
      </div>

      {!compact && (
        <div className="grid grid-cols-1 gap-1.5 pt-0.5">
          {hasOpen && pocketMoney.openRecurring && (
            <div className="p-2 rounded-lg bg-background/60 border border-border/60 text-[11px] flex flex-col gap-0.5">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground flex items-center gap-1">
                  <Unlock className="w-3 h-3 text-emerald-500" />
                  Open Limit (Revocable)
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                  {formatPocketMoneyPeriod(pocketMoney.openRecurring.period)}
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between text-muted-foreground text-[10px]">
                <span>
                  Limit:{' '}
                  <strong className="text-foreground">
                    {formatFiCoins(pocketMoney.openRecurring.limit)} FI
                  </strong>{' '}
                  • Spent in cycle:{' '}
                  {formatFiCoins(pocketMoney.openRecurring.spent)} FI
                </span>
                {pocketMoney.openRecurring.startTime > nowSec && (
                  <span className="text-amber-500 font-medium">
                    Starts{' '}
                    {formatPocketMoneyTimestamp(
                      pocketMoney.openRecurring.startTime,
                    )}
                  </span>
                )}
              </div>
            </div>
          )}

          {hasFixed && pocketMoney.fixedRecurring && (
            <div className="p-2 rounded-lg bg-background/60 border border-border/60 text-[11px] flex flex-col gap-0.5">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-500" />
                  Fixed Recurring (Irrevocable)
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                  {formatPocketMoneyPeriod(pocketMoney.fixedRecurring.period)}
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between text-muted-foreground text-[10px]">
                <span>
                  Limit:{' '}
                  <strong className="text-foreground">
                    {formatFiCoins(pocketMoney.fixedRecurring.limit)} FI
                  </strong>{' '}
                  • Spent in cycle:{' '}
                  {formatFiCoins(pocketMoney.fixedRecurring.spent)} FI
                </span>
                <span>
                  Valid until:{' '}
                  <strong className="text-foreground">
                    {formatPocketMoneyTimestamp(
                      pocketMoney.fixedRecurring.validUntil,
                    )}
                  </strong>
                </span>
              </div>
              {pocketMoney.fixedRecurring.startTime > nowSec && (
                <div className="text-[10px] text-amber-500 font-medium">
                  Post-dated start:{' '}
                  {formatPocketMoneyTimestamp(
                    pocketMoney.fixedRecurring.startTime,
                  )}
                </div>
              )}
            </div>
          )}

          {hasOneTime && pocketMoney.oneTime && (
            <div className="p-2 rounded-lg bg-background/60 border border-border/60 text-[11px] flex flex-col gap-0.5">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground flex items-center gap-1">
                  <FileCheck2 className="w-3 h-3 text-primary" />
                  {pocketMoney.oneTime.startTime > nowSec
                    ? 'Post-Dated Bank Cheque (Irrevocable)'
                    : 'One-Time Limit (Irrevocable)'}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/15 text-primary font-semibold">
                  {formatFiCoins(pocketMoney.oneTime.remaining)} FI left
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between text-muted-foreground text-[10px]">
                <span>
                  {pocketMoney.oneTime.startTime > nowSec
                    ? `Unlocks: ${formatPocketMoneyTimestamp(pocketMoney.oneTime.startTime)}`
                    : 'Unlocked & Active'}
                </span>
                <span>
                  {pocketMoney.oneTime.validUntil > 0n
                    ? `Expires: ${formatPocketMoneyTimestamp(pocketMoney.oneTime.validUntil)}`
                    : 'No Expiry (Until Spent)'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const PocketMoneyTab: React.FC<PocketMoneyTabProps> = ({
  wallet,
  walletKit,
  walletAddress,
  network,
  accountData,
  allowanceSubTab,
  setAllowanceSubTab,
  grantee,
  setGrantee,
  granter,
  setGranter,
  recipient,
  setRecipient,
  amount,
  setAmount,
  circleMembers = [],
  onBoundaryPrev,
  onBoundaryNext,
  onRefetchAccount,
}) => {
  const { formatWalletAddress } = useFormatAddress();
  const formatShortWallet = (addr: Address | string | null | undefined) => {
    if (!addr) return 'None';
    return formatWalletAddress(addr, true, 4);
  };

  // Resolved addresses from InputScan (@username / .bro / raw address)
  const [resolvedGrantee, setResolvedGrantee] = useState<string | null>(null);
  const [resolvedGranter, setResolvedGranter] = useState<string | null>(null);
  const [resolvedSpendRecipient, setResolvedSpendRecipient] = useState<
    string | null
  >(null);

  // Filter in Active tab
  const [activeFilterQuery, setActiveFilterQuery] = useState('');

  // Lookup subtab state
  const [lookupInput, setLookupInput] = useState('');
  const [resolvedLookupAddress, setResolvedLookupAddress] = useState<
    string | null
  >(null);

  // Grant mode & slot states
  const [grantMode, setGrantMode] =
    useState<PocketMoneyGrantMode>('openRecurring');
  const [unrestrictedToggle, setUnrestrictedToggle] = useState<boolean>(true);

  // Open recurring slot inputs
  const [openEnabled, setOpenEnabled] = useState<boolean>(true);
  const [openPeriodPreset, setOpenPeriodPreset] = useState<string>('0');
  const [openCustomDays, setOpenCustomDays] = useState<string>('');
  const [openStartTimeLocal, setOpenStartTimeLocal] = useState<string>('');

  // One-time / cheque slot inputs
  const [oneTimeEnabled, setOneTimeEnabled] = useState<boolean>(false);
  const [oneTimeAmount, setOneTimeAmount] = useState<string>('');
  const [oneTimeStartTimeLocal, setOneTimeStartTimeLocal] =
    useState<string>('');
  const [oneTimeValidUntilLocal, setOneTimeValidUntilLocal] =
    useState<string>('');

  // Fixed recurring slot inputs
  const [fixedEnabled, setFixedEnabled] = useState<boolean>(false);
  const [fixedLimit, setFixedLimit] = useState<string>('');
  const [fixedPeriodPreset, setFixedPeriodPreset] = useState<string>(
    String(ONE_WEEK_SEC),
  );
  const [fixedCustomDays, setFixedCustomDays] = useState<string>('');
  const [fixedStartTimeLocal, setFixedStartTimeLocal] = useState<string>('');
  const [fixedValidUntilLocal, setFixedValidUntilLocal] = useState<string>('');

  const effectiveGrantee = useMemo(() => {
    const trimmed = grantee.trim();
    if (!trimmed) return '';
    try {
      Address.parse(trimmed);
      return trimmed;
    } catch {
      return resolvedGrantee ?? '';
    }
  }, [grantee, resolvedGrantee]);

  const effectiveGranter = useMemo(() => {
    const trimmed = granter.trim();
    if (!trimmed) return '';
    try {
      Address.parse(trimmed);
      return trimmed;
    } catch {
      return resolvedGranter ?? '';
    }
  }, [granter, resolvedGranter]);

  const effectiveSpendRecipient = useMemo(() => {
    const trimmed = recipient.trim();
    if (!trimmed) return '';
    try {
      Address.parse(trimmed);
      return trimmed;
    } catch {
      return resolvedSpendRecipient ?? '';
    }
  }, [recipient, resolvedSpendRecipient]);

  const effectiveLookup = useMemo(() => {
    const trimmed = lookupInput.trim();
    if (!trimmed) return '';
    try {
      Address.parse(trimmed);
      return trimmed;
    } catch {
      return resolvedLookupAddress ?? '';
    }
  }, [lookupInput, resolvedLookupAddress]);

  const allowances = accountData?.allowances;

  // Existing PocketMoney entry granted by us to effectiveGrantee
  const existingGranteeEntry = useMemo<AllowanceEntry | null>(() => {
    if (!effectiveGrantee || !allowances) return null;
    return (
      allowances.find((a) => sameAddress(a.addressString, effectiveGrantee)) ??
      null
    );
  }, [effectiveGrantee, allowances]);

  // Existing PocketMoney entry granted by us to effectiveLookup
  const lookupGrantedByMe = useMemo<AllowanceEntry | null>(() => {
    if (!effectiveLookup || !allowances) return null;
    return (
      allowances.find((a) => sameAddress(a.addressString, effectiveLookup)) ??
      null
    );
  }, [effectiveLookup, allowances]);

  // On-chain PocketMoney state on the searched Lookup account
  const lookupAccountState = usePocketMoneyBalance({
    granterOwnerAddress: effectiveLookup || null,
    userWalletAddress: walletAddress,
    network: network === 'mainnet' ? 'mainnet' : 'testnet',
  });

  // On-chain PocketMoney state on the Spend Granter account
  const spendGranterState = usePocketMoneyBalance({
    granterOwnerAddress: effectiveGranter || null,
    userWalletAddress: walletAddress,
    network: network === 'mainnet' ? 'mainnet' : 'testnet',
  });

  const openPeriodSec = useMemo(() => {
    if (openPeriodPreset === 'custom') {
      const d = parseFloat(openCustomDays);
      return d > 0 ? Math.round(d * ONE_DAY_SEC) : 0;
    }
    return parseInt(openPeriodPreset, 10) || 0;
  }, [openPeriodPreset, openCustomDays]);

  const fixedPeriodSec = useMemo(() => {
    if (fixedPeriodPreset === 'custom') {
      const d = parseFloat(fixedCustomDays);
      return d > 0 ? Math.round(d * ONE_DAY_SEC) : 0;
    }
    return parseInt(fixedPeriodPreset, 10) || ONE_WEEK_SEC;
  }, [fixedPeriodPreset, fixedCustomDays]);

  const setAllowance = useSetPocketMoney({
    wallet,
    walletKit,
    walletAddress,
    grantee: effectiveGrantee || grantee,
    amount,
    mode: grantMode,
    unrestricted:
      grantMode === 'unrestricted'
        ? unrestrictedToggle
        : grantMode === 'multi'
          ? unrestrictedToggle
          : null,
    openRecurringInput: {
      enabled: grantMode === 'multi' ? openEnabled : true,
      limit: amount,
      periodSec: openPeriodSec,
      startTimeSec: fromDatetimeLocalValue(openStartTimeLocal),
    },
    oneTimeInput: {
      enabled: grantMode === 'multi' ? oneTimeEnabled : true,
      amount: grantMode === 'oneTime' ? amount || oneTimeAmount : oneTimeAmount,
      startTimeSec: fromDatetimeLocalValue(oneTimeStartTimeLocal),
      validUntilSec: fromDatetimeLocalValue(oneTimeValidUntilLocal),
    },
    fixedRecurringInput: {
      enabled: grantMode === 'multi' ? fixedEnabled : true,
      limit: grantMode === 'fixedRecurring' ? amount || fixedLimit : fixedLimit,
      periodSec: fixedPeriodSec,
      startTimeSec: fromDatetimeLocalValue(fixedStartTimeLocal),
      validUntilSec: fromDatetimeLocalValue(fixedValidUntilLocal),
    },
    existingPocketMoney: existingGranteeEntry?.pocketMoney ?? null,
    network,
    accountData,
    onSuccess: () => {
      onRefetchAccount?.();
    },
  });

  const spendAllowance = useSpendPocketMoney({
    wallet,
    walletKit,
    walletAddress,
    granterAddress: effectiveGranter || granter,
    receiver: effectiveSpendRecipient || recipient,
    amount,
    network,
    accountData,
  });

  const filteredAllowances = useMemo(() => {
    const list = allowances ?? [];
    const q = activeFilterQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter((entry) => {
      if (entry.addressString.toLowerCase().includes(q)) return true;
      const member = circleMembers.find((m) =>
        sameAddress(m.ownerAddress, entry.addressString),
      );
      if (member?.username && member.username.toLowerCase().includes(q)) {
        return true;
      }
      return false;
    });
  }, [allowances, activeFilterQuery, circleMembers]);

  const applyValidUntilOffset = (
    setter: (val: string) => void,
    secondsOffset: number,
  ) => {
    setter(getOffsetDatetimeLocalValue(secondsOffset));
  };

  return (
    <div className="space-y-4 bg-card text-card-foreground p-4 border border-border rounded-2xl shadow-sm text-sm">
      <SwipeableSubTabs
        tabs={['active', 'lookup', 'grant', 'spend']}
        activeTab={allowanceSubTab}
        onTabChange={(tab) => setAllowanceSubTab(tab as PocketMoneySubTab)}
        loop={false}
        className="min-h-0"
        onBoundaryPrev={onBoundaryPrev}
        onBoundaryNext={onBoundaryNext}
        boundaryPrevLabel="Credit"
        boundaryNextLabel="Gold"
        stickyTabBar={
          <ScrollableTabBar
            tabs={[
              {
                id: 'active',
                label: `Granted (${accountData?.allowances.length ?? 0})`,
                icon: CheckCircle2,
                testId: 'brotherhood-allowance-subtab-active',
              },
              {
                id: 'lookup',
                label: 'Search / Check',
                icon: Search,
                testId: 'brotherhood-allowance-subtab-lookup',
              },
              {
                id: 'grant',
                label: 'Grant Pocket Money',
                icon: PlusCircle,
                testId: 'brotherhood-allowance-subtab-grant',
              },
              {
                id: 'spend',
                label: 'Spend',
                icon: Send,
                testId: 'brotherhood-allowance-subtab-spend',
              },
            ]}
            activeTab={allowanceSubTab}
            onTabChange={(tab) => setAllowanceSubTab(tab as PocketMoneySubTab)}
          />
        }
      >
        {/* 1. Active Granted Pocket Money Sub-Tab */}
        {allowanceSubTab === 'active' && (
          <div className="space-y-3 pt-1">
            <div className="flex justify-between items-center gap-2">
              <div>
                <h4 className="text-sm font-semibold text-foreground">
                  Granted Pocket Money
                </h4>
                <p className="text-xs text-muted-foreground">
                  Grantees with active or post-dated FI spending limits from
                  your wallet
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setAllowanceSubTab('lookup')}
                  className="text-xs"
                >
                  🔍 Check Any
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setAllowanceSubTab('grant')}
                  className="text-xs"
                >
                  + Grant
                </Button>
              </div>
            </div>

            {accountData && accountData.allowances.length > 0 && (
              <input
                type="text"
                value={activeFilterQuery}
                onChange={(e) => setActiveFilterQuery(e.target.value)}
                placeholder="Filter granted list by address or @username..."
                className="w-full p-2 border border-border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            )}

            {accountData && filteredAllowances.length > 0 ? (
              <div className="space-y-2.5">
                {filteredAllowances.map((entry) => {
                  const circleMatch = circleMembers.find((m) =>
                    sameAddress(m.ownerAddress, entry.addressString),
                  );
                  const pm = entry.pocketMoney;
                  const hasOpenOrUnrestricted = Boolean(
                    pm?.unrestricted ||
                    (pm?.openRecurring && pm.openRecurring.limit > 0n) ||
                    !pm,
                  );

                  return (
                    <div
                      key={entry.addressString}
                      className="p-3 bg-secondary/40 border border-border/60 rounded-xl text-xs space-y-2"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {circleMatch?.username && (
                              <span className="font-semibold text-primary">
                                {formatProfileUsernameDisplay(
                                  circleMatch.username,
                                )}
                              </span>
                            )}
                            <span className="font-mono text-foreground font-medium">
                              {formatShortWallet(entry.addressString)}
                            </span>
                            <CopyButton
                              address={entry.addressString}
                              type="wallet"
                              size="xs"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="text-xs h-7 px-2.5"
                            onClick={() => {
                              setGrantee(entry.addressString);
                              if (
                                pm?.oneTime &&
                                pm.oneTime.remaining > 0n &&
                                !pm?.openRecurring
                              ) {
                                setGrantMode('oneTime');
                                setAmount('');
                              } else if (
                                pm?.fixedRecurring &&
                                pm.fixedRecurring.limit > 0n &&
                                !pm?.openRecurring
                              ) {
                                setGrantMode('fixedRecurring');
                                setAmount('');
                              } else {
                                setGrantMode('openRecurring');
                                setAmount('');
                              }
                              setAllowanceSubTab('grant');
                            }}
                          >
                            Configure / Upgrade
                          </Button>
                          {hasOpenOrUnrestricted && (
                            <Button
                              size="sm"
                              variant="danger"
                              className="text-xs h-7 px-2.5"
                              onClick={() => {
                                setGrantee(entry.addressString);
                                if (pm?.unrestricted && !pm?.openRecurring) {
                                  setGrantMode('unrestricted');
                                  setUnrestrictedToggle(false);
                                } else {
                                  setGrantMode('openRecurring');
                                  setAmount('0');
                                }
                                setAllowanceSubTab('grant');
                              }}
                            >
                              Revoke
                            </Button>
                          )}
                        </div>
                      </div>

                      <PocketMoneySlotsBreakdown
                        pocketMoney={pm}
                        spendableAmount={entry.amount}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 px-4 text-center space-y-3 bg-secondary/20 border border-border/50 rounded-2xl">
                <div className="w-10 h-10 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary text-lg">
                  🛡️
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">
                    No Active Pocket Money Grants
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                    Grant one-time bank cheques, fixed or open recurring limits,
                    or unrestricted access to trusted accounts.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setAllowanceSubTab('grant')}
                    className="text-xs"
                  >
                    Grant Pocket Money
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setAllowanceSubTab('lookup')}
                    className="text-xs"
                  >
                    Search Any Account
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. Search / Lookup Grantee or Granter Sub-Tab */}
        {allowanceSubTab === 'lookup' && (
          <div className="space-y-3 pt-1">
            <div>
              <h4 className="text-sm font-semibold text-foreground">
                Search & Verify Pocket Money State
              </h4>
              <p className="text-xs text-muted-foreground">
                Search any address, @username, or .bro domain to inspect what
                you granted them, what they granted you, and all active Pocket
                Money slots on their wallet.
              </p>
            </div>

            <InputScan
              value={lookupInput}
              onChange={setLookupInput}
              onResolvedAddressChange={setResolvedLookupAddress}
              placeholder={`Search Address (${network === 'mainnet' ? 'UQ...' : '0Q...'}), @username, or .bro domain`}
              data-testid="brotherhood-pocket-lookup-input"
              tokenContext={FI_TOKEN_CONTEXT}
            />

            {circleMembers.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-swipe">
                <span className="text-[10px] text-muted-foreground shrink-0">
                  Circle:
                </span>
                {circleMembers
                  .filter((m) => m.ownerAddress)
                  .map((m) => (
                    <button
                      key={m.contractAddress}
                      type="button"
                      onClick={() => setLookupInput(m.ownerAddress)}
                      className="px-2 py-1 rounded-lg bg-secondary/70 hover:bg-secondary border border-border/60 text-[11px] text-foreground shrink-0 cursor-pointer"
                    >
                      {formatProfileUsernameDisplay(
                        m.username,
                        undefined,
                        formatShortWallet(m.ownerAddress),
                      )}
                    </button>
                  ))}
              </div>
            )}

            {effectiveLookup ? (
              <div className="space-y-3">
                {/* Section A: What YOU granted to this address */}
                <div className="p-3 rounded-xl bg-secondary/40 border border-border/60 space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="font-semibold text-foreground block">
                        1. Your Grant → To This Account
                      </span>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        Grantee: {formatShortWallet(effectiveLookup)}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="text-xs h-7"
                      onClick={() => {
                        setGrantee(effectiveLookup);
                        setAllowanceSubTab('grant');
                      }}
                    >
                      {lookupGrantedByMe ? 'Modify / Upgrade' : '+ Grant Now'}
                    </Button>
                  </div>

                  {lookupGrantedByMe ? (
                    <PocketMoneySlotsBreakdown
                      pocketMoney={lookupGrantedByMe.pocketMoney}
                      spendableAmount={lookupGrantedByMe.amount}
                    />
                  ) : (
                    <p className="text-[11px] text-muted-foreground">
                      You have not configured any Pocket Money for this account.
                    </p>
                  )}
                </div>

                {/* Section B: What THIS address granted to YOU */}
                <div className="p-3 rounded-xl bg-primary/10 border border-primary/25 space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="font-semibold text-foreground block">
                        2. Their Grant → To You (Incoming Pocket Money)
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {lookupAccountState.isLoading
                          ? 'Querying on-chain FiWallet…'
                          : `Granter Balance: ${formatFiCoins(lookupAccountState.granterBalance)} FI${lookupAccountState.granterUsername ? ` (@${lookupAccountState.granterUsername})` : ''}`}
                      </span>
                    </div>
                    {lookupAccountState.allowance > 0n && (
                      <Button
                        size="sm"
                        variant="primary"
                        className="text-xs h-7"
                        onClick={() => {
                          setGranter(effectiveLookup);
                          if (walletAddress && !recipient) {
                            setRecipient(
                              formatWalletAddress(walletAddress, false),
                            );
                          }
                          setAllowanceSubTab('spend');
                        }}
                      >
                        Spend Now
                      </Button>
                    )}
                  </div>

                  {lookupAccountState.isLoading ? (
                    <p className="text-[11px] text-muted-foreground">
                      Loading on-chain Pocket Money state…
                    </p>
                  ) : lookupAccountState.pocketMoney ||
                    lookupAccountState.allowance > 0n ? (
                    <PocketMoneySlotsBreakdown
                      pocketMoney={lookupAccountState.pocketMoney}
                      spendableAmount={lookupAccountState.allowance}
                    />
                  ) : (
                    <p className="text-[11px] text-muted-foreground">
                      This account has not granted Pocket Money to your wallet.
                    </p>
                  )}
                </div>

                {/* Section C: All Grantees configured on searched account's FiWallet */}
                <div className="p-3 rounded-xl bg-secondary/30 border border-border/50 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">
                      3. All Grantees Configured by This Account (
                      {lookupAccountState.allGrantees.length})
                    </span>
                  </div>
                  {lookupAccountState.allGrantees.length > 0 ? (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {lookupAccountState.allGrantees.map((item) => (
                        <div
                          key={item.addressString}
                          className="p-2.5 rounded-lg bg-background/70 border border-border/50 space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-medium text-foreground">
                                {formatShortWallet(item.addressString)}
                              </span>
                              {walletAddress &&
                                sameAddress(
                                  item.addressString,
                                  walletAddress,
                                ) && (
                                  <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary text-[10px] font-semibold">
                                    You
                                  </span>
                                )}
                              <CopyButton
                                address={item.addressString}
                                type="wallet"
                                size="xs"
                              />
                            </div>
                          </div>
                          <PocketMoneySlotsBreakdown
                            pocketMoney={item.pocketMoney}
                            spendableAmount={item.amount}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-muted-foreground">
                      No active Pocket Money grantees on this account.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-6 px-4 text-center bg-secondary/20 border border-border/50 rounded-2xl text-xs text-muted-foreground">
                Enter any wallet address, @username, or .bro domain above to
                inspect Pocket Money grants and live slot states.
              </div>
            )}
          </div>
        )}

        {/* 3. Grant / Configure Pocket Money Sub-Tab */}
        {allowanceSubTab === 'grant' && (
          <div className="space-y-3 pt-1">
            <div>
              <h3 className="font-semibold text-base">
                Grant / Configure Pocket Money
              </h3>
              <p className="text-xs text-muted-foreground">
                Set revocable open limits, irrevocable one-time or post-dated
                bank cheques, fixed-term recurring limits, or unrestricted
                access for special ones.
              </p>
            </div>

            {/* Scenario Mode Selector Pills */}
            <div
              className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 p-1 bg-secondary/50 border border-border/60 rounded-xl"
              role="tablist"
            >
              {(
                [
                  {
                    id: 'openRecurring',
                    label: 'Open / Pool',
                    icon: Unlock,
                  },
                  {
                    id: 'oneTime',
                    label: 'One-Time / Cheque',
                    icon: FileCheck2,
                  },
                  {
                    id: 'fixedRecurring',
                    label: 'Fixed Recurring',
                    icon: Repeat,
                  },
                  {
                    id: 'unrestricted',
                    label: 'Unrestricted ♾️',
                    icon: InfinityIcon,
                  },
                  {
                    id: 'multi',
                    label: 'Multi-Slot',
                    icon: Layers,
                  },
                ] as {
                  id: PocketMoneyGrantMode;
                  label: string;
                  icon: React.ComponentType<{ className?: string }>;
                }[]
              ).map((item) => {
                const Icon = item.icon;
                const active = grantMode === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setGrantMode(item.id)}
                    className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                      active
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="space-y-2.5">
              <InputScan
                value={grantee}
                onChange={setGrantee}
                onResolvedAddressChange={setResolvedGrantee}
                placeholder={`Grantee Address (${network === 'mainnet' ? 'UQ...' : '0Q...'}), @username, or .bro`}
                data-testid="brotherhood-grantee-address"
                tokenContext={FI_TOKEN_CONTEXT}
              />

              {/* Existing On-Chain State Banner for Grantee */}
              {existingGranteeEntry && (
                <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/25 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-primary text-[11px]">
                      Current On-Chain State for This Grantee
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Unselected slots remain untouched
                    </span>
                  </div>
                  <PocketMoneySlotsBreakdown
                    pocketMoney={existingGranteeEntry.pocketMoney}
                    spendableAmount={existingGranteeEntry.amount}
                  />
                </div>
              )}

              {/* Scenario 1: Open / Revocable Limit */}
              {(grantMode === 'openRecurring' || grantMode === 'multi') && (
                <div className="p-3 rounded-xl bg-secondary/30 border border-border/60 space-y-2.5">
                  {grantMode === 'multi' && (
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <Unlock className="w-3.5 h-3.5 text-emerald-500" />
                        Open-Ended Limit (Revocable Anytime)
                      </span>
                      <input
                        type="checkbox"
                        checked={openEnabled}
                        onChange={(e) => setOpenEnabled(e.target.checked)}
                        className="rounded border-border text-primary focus:ring-ring"
                      />
                    </label>
                  )}

                  {(grantMode === 'openRecurring' || openEnabled) && (
                    <div className="space-y-2">
                      {grantMode === 'openRecurring' && (
                        <div className="text-[11px] text-muted-foreground">
                          <strong className="text-foreground">
                            Open Limit (No Expiry Date):
                          </strong>{' '}
                          Can be modified or cancelled (set to 0) at any time.
                          Optionally resets every day, week, month, or custom
                          interval.
                        </div>
                      )}
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder={
                          existingGranteeEntry?.pocketMoney?.openRecurring
                            ? `Current Open Limit: ${formatFiCoins(existingGranteeEntry.pocketMoney.openRecurring.limit)} FI (0 to cancel)`
                            : 'Allowance / Open Limit Amount (FI, 0 to cancel)'
                        }
                        className="w-full p-2.5 border border-border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        data-testid="brotherhood-allowance-amount"
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] text-muted-foreground block mb-1">
                            Reset Frequency
                          </label>
                          <select
                            value={openPeriodPreset}
                            onChange={(e) =>
                              setOpenPeriodPreset(e.target.value)
                            }
                            className="w-full p-2 border border-border rounded-xl text-xs bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          >
                            <option value="0">
                              One-off Pool (Does not auto-reset)
                            </option>
                            <option value={String(ONE_DAY_SEC)}>
                              Daily (Every 24 hours)
                            </option>
                            <option value={String(ONE_WEEK_SEC)}>
                              Weekly (Every 7 days)
                            </option>
                            <option value={String(ONE_MONTH_SEC)}>
                              Monthly (Every 30 days)
                            </option>
                            <option value="custom">Custom Period (Days)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] text-muted-foreground block mb-1">
                            Start Time (Optional Post-Dated)
                          </label>
                          <input
                            type="datetime-local"
                            value={openStartTimeLocal}
                            onChange={(e) =>
                              setOpenStartTimeLocal(e.target.value)
                            }
                            className="w-full p-2 border border-border rounded-xl text-xs bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                      </div>

                      {openPeriodPreset === 'custom' && (
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={openCustomDays}
                          onChange={(e) => setOpenCustomDays(e.target.value)}
                          placeholder="Custom reset period in days (e.g. 14)"
                          className="w-full p-2 border border-border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Scenario 2: One-Time / Post-Dated Bank Cheque */}
              {(grantMode === 'oneTime' || grantMode === 'multi') && (
                <div className="p-3 rounded-xl bg-secondary/30 border border-border/60 space-y-2.5">
                  {grantMode === 'multi' && (
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <FileCheck2 className="w-3.5 h-3.5 text-primary" />
                        One-Time Limit / Post-Dated Cheque (Irrevocable)
                      </span>
                      <input
                        type="checkbox"
                        checked={oneTimeEnabled}
                        onChange={(e) => setOneTimeEnabled(e.target.checked)}
                        className="rounded border-border text-primary focus:ring-ring"
                      />
                    </label>
                  )}

                  {(grantMode === 'oneTime' || oneTimeEnabled) && (
                    <div className="space-y-2">
                      <div className="text-[11px] text-muted-foreground">
                        <strong className="text-foreground">
                          🏦 One-Time Cheque (Irrevocable while active):
                        </strong>{' '}
                        Set a future Start Time to act like a post-dated bank
                        cheque. Cannot be cancelled while active, but can be
                        upgraded upward (more FI, earlier start, or longer
                        validity).
                      </div>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={grantMode === 'oneTime' ? amount : oneTimeAmount}
                        onChange={(e) => {
                          if (grantMode === 'oneTime') {
                            setAmount(e.target.value);
                          } else {
                            setOneTimeAmount(e.target.value);
                          }
                        }}
                        placeholder={
                          existingGranteeEntry?.pocketMoney?.oneTime
                            ? `Current One-Time Remaining: ${formatFiCoins(existingGranteeEntry.pocketMoney.oneTime.remaining)} FI (Upgrade ≥ current)`
                            : 'One-Time / Cheque Amount (FI)'
                        }
                        className="w-full p-2.5 border border-border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        data-testid={
                          grantMode === 'oneTime'
                            ? 'brotherhood-allowance-amount'
                            : 'brotherhood-onetime-amount'
                        }
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] text-muted-foreground flex items-center gap-1 mb-1">
                            <Clock className="w-3 h-3" />
                            Payable From (Leave empty for Instant)
                          </label>
                          <input
                            type="datetime-local"
                            value={oneTimeStartTimeLocal}
                            onChange={(e) =>
                              setOneTimeStartTimeLocal(e.target.value)
                            }
                            className="w-full p-2 border border-border rounded-xl text-xs bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] text-muted-foreground flex items-center gap-1 mb-1">
                            <Calendar className="w-3 h-3" />
                            Valid Until (Leave empty for No Expiry)
                          </label>
                          <input
                            type="datetime-local"
                            value={oneTimeValidUntilLocal}
                            onChange={(e) =>
                              setOneTimeValidUntilLocal(e.target.value)
                            }
                            className="w-full p-2 border border-border rounded-xl text-xs bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Scenario 3: Fixed-Term Recurring Limit */}
              {(grantMode === 'fixedRecurring' || grantMode === 'multi') && (
                <div className="p-3 rounded-xl bg-secondary/30 border border-border/60 space-y-2.5">
                  {grantMode === 'multi' && (
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-amber-500" />
                        Fixed-Term Recurring Limit (Irrevocable Until Expiry)
                      </span>
                      <input
                        type="checkbox"
                        checked={fixedEnabled}
                        onChange={(e) => setFixedEnabled(e.target.checked)}
                        className="rounded border-border text-primary focus:ring-ring"
                      />
                    </label>
                  )}

                  {(grantMode === 'fixedRecurring' || fixedEnabled) && (
                    <div className="space-y-2">
                      <div className="text-[11px] text-muted-foreground">
                        <strong className="text-foreground">
                          🔒 Fixed-Term Recurring Commitment:
                        </strong>{' '}
                        Automatically resets each period until the specified
                        Valid Until date. Cannot be revoked before expiry, only
                        upgraded upward.
                      </div>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={
                          grantMode === 'fixedRecurring' ? amount : fixedLimit
                        }
                        onChange={(e) => {
                          if (grantMode === 'fixedRecurring') {
                            setAmount(e.target.value);
                          } else {
                            setFixedLimit(e.target.value);
                          }
                        }}
                        placeholder={
                          existingGranteeEntry?.pocketMoney?.fixedRecurring
                            ? `Current Fixed Limit: ${formatFiCoins(existingGranteeEntry.pocketMoney.fixedRecurring.limit)} FI per cycle`
                            : 'Recurring Limit per Cycle (FI)'
                        }
                        className="w-full p-2.5 border border-border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        data-testid={
                          grantMode === 'fixedRecurring'
                            ? 'brotherhood-allowance-amount'
                            : 'brotherhood-fixed-amount'
                        }
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] text-muted-foreground block mb-1">
                            Reset Period
                          </label>
                          <select
                            value={fixedPeriodPreset}
                            onChange={(e) =>
                              setFixedPeriodPreset(e.target.value)
                            }
                            className="w-full p-2 border border-border rounded-xl text-xs bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          >
                            <option value={String(ONE_DAY_SEC)}>
                              Daily (24 hours)
                            </option>
                            <option value={String(ONE_WEEK_SEC)}>
                              Weekly (7 days)
                            </option>
                            <option value={String(ONE_MONTH_SEC)}>
                              Monthly (30 days)
                            </option>
                            <option value="custom">Custom Period (Days)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] text-muted-foreground block mb-1">
                            Start Time (Optional Post-Dated)
                          </label>
                          <input
                            type="datetime-local"
                            value={fixedStartTimeLocal}
                            onChange={(e) =>
                              setFixedStartTimeLocal(e.target.value)
                            }
                            className="w-full p-2 border border-border rounded-xl text-xs bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                      </div>

                      {fixedPeriodPreset === 'custom' && (
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={fixedCustomDays}
                          onChange={(e) => setFixedCustomDays(e.target.value)}
                          placeholder="Custom cycle length in days (e.g. 14)"
                          className="w-full p-2 border border-border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      )}

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] text-muted-foreground font-medium">
                            Valid Until (Required Commitment End Date)
                          </label>
                          <div className="flex items-center gap-1">
                            {[
                              { label: '+1M', sec: ONE_MONTH_SEC },
                              { label: '+3M', sec: 3 * ONE_MONTH_SEC },
                              { label: '+6M', sec: 6 * ONE_MONTH_SEC },
                              { label: '+1Y', sec: ONE_YEAR_SEC },
                            ].map((preset) => (
                              <button
                                key={preset.label}
                                type="button"
                                onClick={() =>
                                  applyValidUntilOffset(
                                    setFixedValidUntilLocal,
                                    preset.sec,
                                  )
                                }
                                className="px-1.5 py-0.5 rounded bg-secondary hover:bg-secondary/80 text-[10px] text-foreground cursor-pointer"
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <input
                          type="datetime-local"
                          value={fixedValidUntilLocal}
                          onChange={(e) =>
                            setFixedValidUntilLocal(e.target.value)
                          }
                          className="w-full p-2 border border-border rounded-xl text-xs bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Scenario 4: Unrestricted Access (Special Ones) */}
              {(grantMode === 'unrestricted' || grantMode === 'multi') && (
                <div className="p-3 rounded-xl bg-secondary/30 border border-border/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <InfinityIcon className="w-4 h-4 text-emerald-500" />
                      Unrestricted Access (For Very Dear / Special Ones)
                    </span>
                    <button
                      type="button"
                      onClick={() => setUnrestrictedToggle((prev) => !prev)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                        unrestrictedToggle
                          ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/40'
                          : 'bg-rose-500/15 text-rose-500 border border-rose-500/30'
                      }`}
                    >
                      {unrestrictedToggle
                        ? 'Grant Unrestricted'
                        : 'Revoke Unrestricted'}
                    </button>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Allows this trusted account to spend FI directly from your
                    balance without time or amount caps. Can be revoked at any
                    time.
                  </p>
                </div>
              )}

              {setAllowance.validationError && (
                <p className="text-xs text-rose-500 font-medium">
                  {setAllowance.validationError}
                </p>
              )}

              <TxButton
                onAction={() => setAllowance.send()}
                disabled={setAllowance.isDisabled}
                loading={setAllowance.isSending}
                fullWidth
                testId="brotherhood-grant-allowance-submit"
              >
                {grantMode === 'unrestricted'
                  ? unrestrictedToggle
                    ? 'Grant Unrestricted Pocket Money'
                    : 'Revoke Unrestricted Pocket Money'
                  : grantMode === 'oneTime'
                    ? 'Issue One-Time / Cheque Pocket Money'
                    : grantMode === 'fixedRecurring'
                      ? 'Commit Fixed Recurring Pocket Money'
                      : grantMode === 'multi'
                        ? 'Save Multi-Slot Pocket Money'
                        : 'Save Open Pocket Money'}
              </TxButton>
            </div>
          </div>
        )}

        {/* 4. Spend Pocket Money Sub-Tab */}
        {allowanceSubTab === 'spend' && (
          <div className="space-y-3 pt-1">
            <div>
              <h3 className="font-semibold text-base">Spend Pocket Money</h3>
              <p className="text-xs text-muted-foreground">
                Spend FI tokens authorized to you by a granter account.
                Automatically deducts in optimal waterfall order: Open → Fixed →
                One-Time Cheque.
              </p>
            </div>
            <div className="space-y-2.5">
              <InputScan
                value={granter}
                onChange={setGranter}
                onResolvedAddressChange={setResolvedGranter}
                placeholder={`Granter Address (${network === 'mainnet' ? 'UQ...' : '0Q...'}), @username, or .bro`}
                data-testid="brotherhood-granter-address"
                tokenContext={FI_TOKEN_CONTEXT}
              />

              {/* Live Granter Pocket Money Status Card */}
              {effectiveGranter && (
                <div className="p-3 rounded-xl bg-primary/10 border border-primary/25 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-primary">
                      Your Pocket Money from This Granter
                    </span>
                    {spendGranterState.allowance > 0n && (
                      <button
                        type="button"
                        onClick={() =>
                          setAmount(spendGranterState.formattedAllowance)
                        }
                        className="px-2 py-0.5 rounded bg-primary text-primary-foreground text-[10px] font-semibold cursor-pointer"
                      >
                        Max: {spendGranterState.formattedAllowance} FI
                      </button>
                    )}
                  </div>
                  {spendGranterState.isLoading ? (
                    <p className="text-[11px] text-muted-foreground">
                      Checking granter’s on-chain FiWallet…
                    </p>
                  ) : (
                    <PocketMoneySlotsBreakdown
                      pocketMoney={spendGranterState.pocketMoney}
                      spendableAmount={spendGranterState.allowance}
                    />
                  )}
                </div>
              )}

              <div className="space-y-1">
                {walletAddress && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        setRecipient(formatWalletAddress(walletAddress, false))
                      }
                      className="text-[11px] text-primary hover:underline cursor-pointer"
                    >
                      Send to My Wallet
                    </button>
                  </div>
                )}
                <InputScan
                  value={recipient}
                  onChange={setRecipient}
                  onResolvedAddressChange={setResolvedSpendRecipient}
                  placeholder={`Receiver Address (${network === 'mainnet' ? 'UQ...' : '0Q...'}), @username, or .bro`}
                  data-testid="brotherhood-spend-receiver"
                  tokenContext={FI_TOKEN_CONTEXT}
                />
              </div>

              <input
                type="number"
                min="0"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={
                  spendGranterState.allowance > 0n
                    ? `Amount to Spend (Available: ${spendGranterState.formattedAllowance} FI)`
                    : 'Amount to Spend (FI)'
                }
                className="w-full p-2.5 border border-border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                data-testid="brotherhood-spend-amount"
              />

              {spendAllowance.validationError && (
                <p className="text-xs text-rose-500 font-medium">
                  {spendAllowance.validationError}
                </p>
              )}

              <TxButton
                onAction={() => spendAllowance.send()}
                disabled={spendAllowance.isDisabled}
                loading={spendAllowance.isSending}
                fullWidth
                testId="brotherhood-spend-allowance-submit"
              >
                Spend Pocket Money
              </TxButton>
            </div>
          </div>
        )}
      </SwipeableSubTabs>
    </div>
  );
};
