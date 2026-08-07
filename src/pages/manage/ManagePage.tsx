import { useState, useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Address, fromNano } from '@ton/core';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import {
  Search,
  AlertCircle,
  Wallet,
  Lock,
  Send,
  Sparkles,
  CreditCard,
  Flame,
  UserPlus,
  KeyRound,
  Vote,
  Ban,
  Shield,
  type LucideIcon,
} from 'lucide-react';
import { getErrorMessage } from '../../lib/errors';
import { network, FI_ADDRESS } from '@/lib/config';
import {
  useJettonMaster,
  useFiWalletState,
  useCircle,
} from '../../lib/queries';
import { FiWalletStore } from '@wrappers/FossFiWallet.gen';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { PreviewRow, NetworkBadge } from '../DeployPage';
import {
  AddressLink,
  EmptyState,
  type JettonInfo,
  type Network,
} from './common';
import { TransferTab } from './TransferTab';
import { IssueTokenTab } from './IssueTokenTab';
import { CreditTab } from './CreditTab';
import { BurnTab } from './BurnTab';
import { InviteTab } from './InviteTab';
import { AllowanceTab } from './AllowanceTab';
import { VoteTab } from './VoteTab';
import { DestroyTab } from './DestroyTab';
import { AdminTab } from './AdminTab';

type ManageTab =
  | 'admin'
  | 'allowance'
  | 'burn'
  | 'credit'
  | 'destroy'
  | 'invite'
  | 'issue'
  | 'transfer'
  | 'vote';

const TAB_ICONS: Record<ManageTab, LucideIcon> = {
  admin: Shield,
  allowance: KeyRound,
  burn: Flame,
  credit: CreditCard,
  destroy: Ban,
  invite: UserPlus,
  issue: Sparkles,
  transfer: Send,
  vote: Vote,
};

export function ManagePage({ initialTab }: { initialTab: ManageTab }) {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const navigate = useNavigate();
  const tabsListRef = useRef<HTMLDivElement>(null);

  const rawOwnerAddress = wallet?.account?.address ?? null;
  const ownerAddress = rawOwnerAddress ? Address.parse(rawOwnerAddress) : null;

  const jettonInfoQuery = useJettonMaster();
  const fiWalletStateQuery = useFiWalletState(ownerAddress);

  const invitedList = fiWalletStateQuery.data
    ? fiWalletStateQuery.data.maps.ref.invited.keys()
    : null;
  const circleQuery = useCircle(invitedList);

  const jettonInfo: JettonInfo | null = jettonInfoQuery.data ?? null;
  const fiWalletState: FiWalletStore | null = fiWalletStateQuery.data ?? null;
  const circleFiWalletState: FiWalletStore[] | null = circleQuery.data ?? null;
  const loading =
    jettonInfoQuery.isLoading ||
    fiWalletStateQuery.isLoading ||
    circleQuery.isLoading;

  const jettonInfoError = jettonInfoQuery.isError
    ? getErrorMessage(jettonInfoQuery.error)
    : null;
  const fiWalletStateError = fiWalletStateQuery.isError
    ? getErrorMessage(fiWalletStateQuery.error)
    : null;

  const decimals = jettonInfo?.metadata.decimals
    ? parseInt(jettonInfo.metadata.decimals)
    : 9;
  const isConnected = !!wallet;

  const adminAddress = jettonInfo?.adminAddress ?? null;
  const isAdmin =
    !!ownerAddress &&
    !!adminAddress &&
    ownerAddress.toString() === adminAddress.toString();

  const [tab, setTab] = useState<ManageTab>(initialTab);

  const visibleTabs: ManageTab[] = isAdmin
    ? [
        'admin',
        'allowance',
        'burn',
        'credit',
        'destroy',
        'invite',
        'issue',
        'transfer',
        'vote',
      ]
    : [
        'allowance',
        'burn',
        'credit',
        'destroy',
        'invite',
        'issue',
        'transfer',
        'vote',
      ];

  // The active tab lives in the URL (?tab=...). If it is not reachable for the
  // current wallet (e.g. ?tab=admin for a non-admin), fall back to the first
  // visible tab without touching the URL.
  const activeTab: ManageTab = visibleTabs.includes(tab)
    ? tab
    : visibleTabs[0]!;

  function selectTab(next: ManageTab) {
    setTab(next);
    void navigate({ to: '/', search: (prev) => ({ ...prev, tab: next }) });
  }

  // Smoothly scroll selected tab button to center whenever activeTab changes
  useEffect(() => {
    if (!tabsListRef.current) return;
    const activeEl = tabsListRef.current.querySelector<HTMLElement>(
      '[data-state="active"]',
    );
    if (activeEl) {
      activeEl.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [activeTab]);

  function formatAmount(amount: bigint): string {
    const divisor = 10n ** BigInt(decimals);
    const whole = amount / divisor;
    const remainder = amount % divisor;
    if (remainder === 0n) return whole.toString();
    const fracStr = remainder
      .toString()
      .padStart(decimals, '0')
      .replace(/0+$/, '');
    return `${whole}.${fracStr}`;
  }

  return (
    <div className="grid grid-cols-[1fr_320px] gap-5 items-start max-md:grid-cols-1">
      <div className="space-y-4.5">
        {jettonInfo && (
          <Card>
            <CardContent>
              <Tabs
                value={activeTab}
                onValueChange={(v) => {
                  selectTab(v as ManageTab);
                }}
              >
                <TabsList
                  ref={tabsListRef}
                  className="w-full h-11 rounded-xl p-1 gap-1 overflow-x-auto snap-x snap-mandatory bg-secondary/80 max-md:justify-start max-md:flex-nowrap max-md:scrollbar-none"
                >
                  {visibleTabs.map((t) => {
                    const Icon = TAB_ICONS[t];
                    return (
                      <TabsTrigger
                        key={t}
                        value={t}
                        className="flex-1 h-9 rounded-lg text-[13px] font-mono font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground data-[state=active]:bg-[#ff4e00] data-[state=active]:text-white data-[state=active]:shadow-[0_4px_14px_-3px_rgba(255,78,0,0.5)] transition-all max-md:flex-none max-md:min-w-fit max-md:px-4 max-md:snap-start"
                      >
                        <Icon className="size-4 max-md:hidden" />
                        {t === 'issue'
                          ? 'Issue Token'
                          : t.charAt(0).toUpperCase() + t.slice(1)}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
                {isAdmin && (
                  <TabsContent value="admin" className="mt-5">
                    <AdminTab
                      contractAddr={FI_ADDRESS}
                      info={jettonInfo}
                      isAdmin={isAdmin}
                      isConnected={isConnected}
                      network={network}
                      tonConnectUI={tonConnectUI}
                      ownerAddress={ownerAddress}
                      onSuccess={() => jettonInfoQuery.refetch()}
                    />
                  </TabsContent>
                )}
                <TabsContent value="allowance" className="mt-5">
                  <AllowanceTab
                    decimals={decimals}
                    isConnected={isConnected}
                    network={network}
                    tonConnectUI={tonConnectUI}
                    ownerAddress={ownerAddress}
                    fiWalletState={fiWalletState}
                    onSuccess={() => fiWalletStateQuery.refetch()}
                  />
                </TabsContent>
                <TabsContent value="burn" className="mt-5">
                  <BurnTab
                    decimals={decimals}
                    isConnected={isConnected}
                    network={network}
                    tonConnectUI={tonConnectUI}
                    ownerAddress={ownerAddress}
                    onSuccess={() => jettonInfoQuery.refetch()}
                  />
                </TabsContent>
                <TabsContent value="credit" className="mt-5">
                  <CreditTab
                    decimals={decimals}
                    isConnected={isConnected}
                    network={network}
                    tonConnectUI={tonConnectUI}
                    ownerAddress={ownerAddress}
                  />
                </TabsContent>
                <TabsContent value="destroy" className="mt-5">
                  <DestroyTab
                    network={network}
                    tonConnectUI={tonConnectUI}
                    ownerAddress={ownerAddress}
                  />
                </TabsContent>
                <TabsContent value="invite" className="mt-5">
                  <InviteTab
                    network={network}
                    tonConnectUI={tonConnectUI}
                    ownerAddress={ownerAddress}
                  />
                </TabsContent>
                <TabsContent value="issue" className="mt-5">
                  <IssueTokenTab
                    network={network}
                    tonConnectUI={tonConnectUI}
                    ownerAddress={ownerAddress}
                  />
                </TabsContent>
                <TabsContent value="transfer" className="mt-5">
                  <TransferTab
                    decimals={decimals}
                    isConnected={isConnected}
                    network={network}
                    tonConnectUI={tonConnectUI}
                    ownerAddress={ownerAddress}
                  />
                </TabsContent>
                <TabsContent value="vote" className="mt-5">
                  <VoteTab
                    network={network}
                    tonConnectUI={tonConnectUI}
                    ownerAddress={ownerAddress}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="space-y-4">
        <JettonInfoCard
          userBalance={fiWalletState?.jettonBalance || 0n}
          info={jettonInfo}
          decimals={decimals}
          formatAmount={formatAmount}
          isAdmin={isAdmin}
          network={network}
          loading={loading}
          error={!jettonInfo ? jettonInfoError : null}
          contractAddr={FI_ADDRESS}
        />
        <FiWalletInfoCard
          fiWalletState={fiWalletState}
          tokenSymbol={jettonInfo?.metadata?.symbol || 'FI'}
          loading={loading}
          error={!fiWalletState ? fiWalletStateError : null}
          isConnected={isConnected}
          network={network}
        />
        {circleFiWalletState && circleFiWalletState.length > 0 && (
          <Card className="sticky top-20 max-md:static">
            <CardContent className="space-y-0">
              <div className="flex items-center gap-3.5 mb-5">
                <div className="size-14 rounded-full bg-violet-500/15 flex items-center justify-center">
                  <Lock className="size-7 text-violet-500" />
                </div>
                <div className="min-w-0">
                  <div className="font-display text-lg font-bold tracking-tight truncate">
                    Circle Members
                  </div>
                  <div className="font-mono text-[13px] font-semibold text-primary">
                    Invited FI Wallets
                  </div>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="space-y-2.5">
                {circleFiWalletState.map((fiWallet, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-2"
                  >
                    <span className="font-mono text-[13px] font-semibold text-right max-w-[65%] truncate">
                      <AddressLink
                        address={fiWallet.addresses.ref.owner.toString({
                          bounceable: true,
                          testOnly: network === 'testnet',
                        })}
                        network={network}
                      />
                    </span>
                    <span className="font-mono text-[13px] font-semibold text-right">
                      {fromNano(fiWallet.jettonBalance || 0n)}{' '}
                      {jettonInfo?.metadata?.symbol || 'FI'}
                    </span>
                  </div>
                ))}
              </div>
              <NetworkBadge network={network} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function JettonInfoCard({
  userBalance,
  info,
  decimals,
  formatAmount,
  isAdmin,
  network,
  loading,
  error,
  contractAddr,
}: {
  userBalance: bigint | null;
  info: JettonInfo | null;
  decimals: number;
  formatAmount: (n: bigint) => string;
  isAdmin: boolean;
  network: Network;
  loading: boolean;
  error: string | null;
  contractAddr: string;
}) {
  const [imgError, setImgError] = useState(false);

  if (loading) {
    return (
      <Card className="sticky top-20 max-md:static">
        <CardContent className="flex items-center justify-center min-h-50">
          <span className="spinner" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="sticky top-20 max-md:static">
        <CardContent className="flex items-center justify-center min-h-50">
          <EmptyState
            icon={<AlertCircle className="size-8" />}
            title="Jetton not found"
            description={error}
          />
        </CardContent>
      </Card>
    );
  }

  if (!info) {
    return (
      <Card className="sticky top-20 max-md:static">
        <CardContent className="flex items-center justify-center min-h-50">
          <EmptyState
            icon={<Search className="size-8" />}
            title="Load a jetton"
            description="Enter an address and press Load to see token details"
          />
        </CardContent>
      </Card>
    );
  }

  const symbol = info.metadata.symbol || '???';
  const name = info.metadata.name || 'Unknown Token';
  const initial = symbol.charAt(0).toUpperCase();
  const imageUrl = info.metadata.image || '';
  const formattedBalance = formatAmount(userBalance || 0n);

  return (
    <Card className="sticky top-20 max-md:static overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-4 pb-0">
        <span className="terminal-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          brotherhood — {symbol}
        </span>
      </div>
      <CardContent className="space-y-0 relative">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-56 pointer-events-none"
          style={{
            backgroundImage: 'var(--gradient-soft)',
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-56 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(45% 60% at 88% 0%, rgba(168,85,247,0.22), transparent 70%), radial-gradient(50% 60% at 4% 100%, rgba(229,77,94,0.18), transparent 70%)',
          }}
        />
        <div className="relative">
          <div className="flex items-center gap-3.5 mb-5">
            <div className="relative">
              <Avatar className="size-14 border-2 border-white/30 shadow-lg">
                {imageUrl && !imgError ? (
                  <AvatarImage
                    src={imageUrl}
                    alt={name}
                    onError={() => setImgError(true)}
                  />
                ) : null}
                <AvatarFallback className="bg-primary text-white text-xl font-extrabold">
                  {initial}
                </AvatarFallback>
              </Avatar>
              <span
                aria-hidden="true"
                className="absolute -inset-1.5 rounded-full border border-primary/40"
              />
              <span
                aria-hidden="true"
                className="absolute -inset-3 rounded-full border border-primary/20"
              />
            </div>
            <div className="min-w-0">
              <div className="font-display text-lg font-bold tracking-tight truncate">
                {name}
              </div>
              <div className="font-mono text-[13px] font-semibold text-primary">
                ${symbol}
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="mb-5">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Your Balance
            </div>
            <div className="font-display text-3xl font-bold tracking-tight mt-1">
              {formattedBalance}{' '}
              <span className="text-xl font-semibold text-muted-foreground">
                {symbol}
              </span>
            </div>
          </div>
        </div>

        <PreviewRow
          label="Supply"
          value={`${formatAmount(info.totalSupply)} ${symbol}`}
        />
        <PreviewRow label="Decimals" value={String(decimals)} />
        <PreviewRow label="Standard" value="TEP-74 Jetton" />
        <PreviewRow
          label="Mintable"
          value={info.mintable ? 'Yes' : 'No'}
          valueClassName={info.mintable ? 'text-success' : 'text-warning'}
        />
        <div className="flex justify-between items-center py-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Admin
          </span>
          <span className="font-mono text-[13px] font-semibold text-right max-w-[65%] truncate">
            {info.adminAddress ? (
              <span className="inline-flex items-center gap-1.5">
                <AddressLink
                  address={info.adminAddress.toString({
                    bounceable: true,
                    testOnly: network === 'testnet',
                  })}
                  network={network}
                />
                {isAdmin && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] bg-(--success)/10 text-success border-0"
                  >
                    You
                  </Badge>
                )}
              </span>
            ) : (
              'None (revoked)'
            )}
          </span>
        </div>
        <div className="flex justify-between items-center py-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Source
          </span>
          <span className="font-mono text-[13px] font-semibold text-right">
            <a
              href={`https://verifier.ton.org/${contractAddr.trim()}?testnet=`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              View on Verifier
            </a>
          </span>
        </div>

        {info.metadata.description && (
          <>
            <Separator className="my-4" />
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              About
            </div>
            <p className="text-sm text-muted-foreground line-clamp-33 leading-relaxed">
              {info.metadata.description}
            </p>
          </>
        )}

        <NetworkBadge network={network} />
      </CardContent>
    </Card>
  );
}

function FiWalletInfoCard({
  fiWalletState,
  tokenSymbol,
  loading,
  error,
  isConnected,
  network,
}: {
  fiWalletState: FiWalletStore | null;
  tokenSymbol: string;
  loading: boolean;
  error: string | null;
  isConnected: boolean;
  network: Network;
}) {
  if (loading) {
    return (
      <Card className="sticky top-20 max-md:static">
        <CardContent className="flex items-center justify-center min-h-50">
          <span className="spinner" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="sticky top-20 max-md:static">
        <CardContent className="flex items-center justify-center min-h-50">
          <EmptyState
            icon={<AlertCircle className="size-8" />}
            title="Wallet state unavailable"
            description={error}
          />
        </CardContent>
      </Card>
    );
  }

  if (!isConnected) {
    return (
      <Card className="sticky top-20 max-md:static">
        <CardContent className="flex items-center justify-center min-h-50">
          <EmptyState
            icon={<Wallet className="size-8" />}
            title="Wallet not connected"
            description="Connect your wallet to inspect the FI wallet state"
          />
        </CardContent>
      </Card>
    );
  }

  if (!fiWalletState) {
    return (
      <Card className="sticky top-20 max-md:static">
        <CardContent className="flex items-center justify-center min-h-50">
          <EmptyState
            icon={<Search className="size-8" />}
            title="No wallet state"
            description="The FI wallet state is still loading or unavailable"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="sticky top-20 max-md:static">
      <CardContent className="space-y-0">
        <div className="flex items-center gap-3.5 mb-5">
          <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Wallet className="size-7 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="font-display text-lg font-bold tracking-tight truncate">
              FI Wallet
            </div>
            <div className="font-mono text-[13px] font-semibold text-primary">
              Wallet state
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        <PreviewRow
          label="Balance"
          value={`${fromNano(fiWalletState.jettonBalance || 0n)} ${tokenSymbol}`}
        />
        <PreviewRow
          label="Gold Coins"
          value={String(fiWalletState.goldCoins ?? 0)}
        />
        <PreviewRow label="ID" value={fiWalletState.id || '—'} />
        <PreviewRow
          label="Txn Count"
          value={String(fiWalletState.txnCount ?? 0)}
        />
        <PreviewRow label="Status" value={String(fiWalletState.status ?? 0)} />
        <PreviewRow
          label="Votes"
          value={`${fiWalletState.votes ?? 0}/${fiWalletState.receivedVotes ?? 0}`}
        />
        <PreviewRow
          label="Connections"
          value={String(fiWalletState.connections ?? 0)}
        />
        <PreviewRow
          label="Active"
          value={fiWalletState.active ? 'Yes' : 'No'}
          valueClassName={
            fiWalletState.active ? 'text-success' : 'text-warning'
          }
        />
        <PreviewRow
          label="Mintable"
          value={fiWalletState.mintable ? 'Yes' : 'No'}
          valueClassName={
            fiWalletState.mintable ? 'text-success' : 'text-warning'
          }
        />
        <PreviewRow
          label="Authority"
          value={fiWalletState.isAuthorityAccount ? 'Yes' : 'No'}
        />
        <PreviewRow
          label="Credit Need"
          value={`${fromNano(fiWalletState.creditNeed || 0n)} TON`}
        />
        <PreviewRow
          label="Debt"
          value={`${fromNano(fiWalletState.debt || 0n)} TON`}
        />
        <PreviewRow
          label="Fees"
          value={`${fromNano(fiWalletState.accumulatedFees || 0n)} TON`}
        />
        <PreviewRow
          label="Version"
          value={`${fiWalletState.version ?? 0}/${fiWalletState.storeVersion ?? 0}`}
        />

        <NetworkBadge network={network} />
      </CardContent>
    </Card>
  );
}
