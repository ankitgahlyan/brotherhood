import { useMemo, useState } from 'react';
import { Address, fromNano } from '@ton/core';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { Search, AlertCircle, Wallet, Lock } from 'lucide-react';
import { getErrorMessage } from '../../lib/errors';
import { network, FI_ADDRESS } from '@/lib/config';
import { useJettonMaster, useFiWalletState, useCircle } from '../../lib/queries';
import { FiWalletStore } from '@wrappers/FossFiWallet.gen';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { PreviewRow, NetworkBadge } from '../DeployPage';
import { useTheme } from '../../App';
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
  | 'transfer'
  | 'burn'
  | 'credit'
  | 'admin'
  | 'invite'
  | 'vote'
  | 'destroy'
  | 'issue'
  | 'allowance';
// type ManageAdminTab = 'mint' | 'upgrade';

export function ManagePage() {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();

  const rawOwnerAddress = wallet?.account?.address ?? null;
  const ownerAddress = useMemo(
    () => (rawOwnerAddress ? Address.parse(rawOwnerAddress) : null),
    [rawOwnerAddress],
  );

  const jettonInfoQuery = useJettonMaster();
  const fiWalletStateQuery = useFiWalletState(ownerAddress);
  const circleQuery = useCircle(
    fiWalletStateQuery.data
      ? fiWalletStateQuery.data.maps.ref.invited.keys()
      : null,
  );

  const jettonInfo: JettonInfo | null = jettonInfoQuery.data ?? null;
  const fiWalletState: FiWalletStore | null = fiWalletStateQuery.data ?? null;
  const circleFiWalletState: FiWalletStore[] | null =
    circleQuery.data ?? null;
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

  const [tab, setTab] = useState<ManageTab>('vote');

  const isConnected = !!wallet;
  const { theme } = useTheme();

  const isAdmin =
    jettonInfo && ownerAddress && jettonInfo.adminAddress
      ? jettonInfo.adminAddress.equals(ownerAddress)
      : false;

  const decimals = parseInt(jettonInfo?.metadata?.decimals || '9') || 9;
  const visibleTabs: ManageTab[] = isAdmin
    ? [
        'issue',
        'admin',
        'credit',
        'allowance',
        'transfer',
        'burn',
        'invite',
        'vote',
        'destroy',
      ]
    : ['issue', 'credit', 'allowance', 'invite', 'vote', 'transfer', 'burn'];

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
                value={tab}
                onValueChange={(v) => {
                  setTab(v as ManageTab);
                }}
              >
                <TabsList
                  className="w-full h-10 rounded-full p-0.75"
                  style={{
                    background: theme === 'light' ? '#F0F1F3' : '#222224',
                  }}
                >
                  {visibleTabs.map((t) => (
                    <TabsTrigger
                      key={t}
                      value={t}
                      className="flex-1 h-8.5 rounded-full text-[13px] font-bold uppercase tracking-wider text-[#9a9a9f] hover:text-foreground data-[state=active]:bg-[#0098EA] data-[state=active]:text-white"
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <TabsContent value="transfer" className="mt-5">
                  <TransferTab
                    decimals={decimals}
                    isConnected={isConnected}
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
                <TabsContent value="credit" className="mt-5">
                  <CreditTab
                    decimals={decimals}
                    isConnected={isConnected}
                    network={network}
                    tonConnectUI={tonConnectUI}
                    ownerAddress={ownerAddress}
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
                <TabsContent value="invite" className="mt-5">
                  <InviteTab
                    network={network}
                    tonConnectUI={tonConnectUI}
                    ownerAddress={ownerAddress}
                  />
                </TabsContent>
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
                <TabsContent value="vote" className="mt-5">
                  <VoteTab
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
                <div className="size-14 rounded-full bg-[#0098EA]/10 flex items-center justify-center">
                  <Lock className="size-7 text-[#0098EA]" />
                </div>
                <div className="min-w-0">
                  <div className="text-lg font-bold tracking-tight truncate">
                    Circle Members
                  </div>
                  <div className="font-mono text-[13px] font-semibold text-[#0098EA]">
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

  return (
    <Card className="sticky top-20 max-md:static">
      <CardContent className="space-y-0">
        <div className="flex items-center gap-3.5 mb-5">
          <Avatar className="size-14 border-2 border-border">
            {imageUrl && !imgError ? (
              <AvatarImage
                src={imageUrl}
                alt={name}
                onError={() => setImgError(true)}
              />
            ) : null}
            <AvatarFallback className="bg-[#0098EA] text-white text-xl font-extrabold">
              {initial}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="text-lg font-bold tracking-tight truncate">
              {name}
            </div>
            <div className="font-mono text-[13px] font-semibold text-[#0098EA]">
              ${symbol}
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        <PreviewRow
          label="Balance"
          value={`${fromNano(userBalance || 0)} ${symbol}`}
        />
        {/* <PreviewRow label="Balance" value={userBalance!.toString()} /> */}
        <PreviewRow
          label="Supply"
          value={`${formatAmount(info.totalSupply)} ${symbol}`}
        />
        <PreviewRow label="Decimals" value={String(decimals)} />
        <PreviewRow label="Standard" value="TEP-74 Jetton" />
        <PreviewRow
          label="Mintable"
          value={info.mintable ? 'Yes' : 'No'}
          valueClassName={
            info.mintable ? 'text-[var(--success)]' : 'text-[var(--warning)]'
          }
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
              className="text-[#0098EA] hover:underline"
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
          <div className="size-14 rounded-full bg-[#0098EA]/10 flex items-center justify-center">
            <Wallet className="size-7 text-[#0098EA]" />
          </div>
          <div className="min-w-0">
            <div className="text-lg font-bold tracking-tight truncate">
              FI Wallet
            </div>
            <div className="font-mono text-[13px] font-semibold text-[#0098EA]">
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
            fiWalletState.active
              ? 'text-[var(--success)]'
              : 'text-[var(--warning)]'
          }
        />
        <PreviewRow
          label="Mintable"
          value={fiWalletState.mintable ? 'Yes' : 'No'}
          valueClassName={
            fiWalletState.mintable
              ? 'text-[var(--success)]'
              : 'text-[var(--warning)]'
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
