import {
  useState,
  useCallback,
  useMemo,
  useEffect,
  type FormEvent,
} from 'react';
import {
  useTonConnectUI,
  useTonWallet,
  type TonConnectUI,
} from '@tonconnect/ui-react';
import { Address, fromNano, toNano } from '@ton/core';
import { Search, AlertCircle, Wallet, Lock } from 'lucide-react';
import {
  getWalletAddress,
  fetchJettonMaster,
  getFiWalletState,
  getCircle,
  getPersonalMinterForIssuer,
  getPersonalWalletAddress,
} from '../lib/ton';
import type { JettonMetadata } from '../lib/jettonContent';
import {
  buildMintBody,
  buildChangeAdminBody,
  buildChangeContentBody,
  buildBurnBody,
  buildTransferBody,
  buildInviteBody,
  buildBuyCreditBody,
  buildVoteBody,
  buildUnvoteBody,
  buildTopUpTonsBody,
  buildApproveUpgradeBody,
  buildRejectUpgradeBody,
  parseUnits,
  buildDestroyBody,
} from '../lib/deploy';
import { getErrorMessage, isCancelledTransactionError } from '../lib/errors';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { StatusAlert, PreviewRow, NetworkBadge } from './DeployPage';
import { useTheme } from '../App';
import { InputScan } from '@/components/input-scan';
import { FiWalletStore } from '@wrappers/FossFiWallet.gen';
import { WalletSelector } from '@/components/wallet-selector';

const network = 'testnet';
export const FI_ADDRESS = 'kQCPnceJsnacJr4XNVq52TC5Sw4E1MrqWCMdd82KJJNenoOT';
const ZERO_ADDRESS =
  '0:0000000000000000000000000000000000000000000000000000000000000000';

function tryParseAddress(raw: string): Address | null {
  try {
    return Address.parse(raw.trim());
  } catch {
    return null;
  }
}

interface JettonInfo {
  totalSupply: bigint;
  mintable: boolean;
  adminAddress: Address | null;
  metadata: Partial<JettonMetadata>;
}

type ManageTab =
  'transfer' | 'burn' | 'credit' | 'admin' | 'invite' | 'vote' | 'destroy';
// type ManageAdminTab = 'mint' | 'upgrade';

export function ManagePage() {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();

  // function setContractAddr(addr: string) {
  //   setContractAddrRaw(addr);
  //   onAddressChange(addr);
  //   setJettonInfo(null);
  //   setStatus(null);
  // }
  const [jettonInfo, setJettonInfo] = useState<JettonInfo | null>(null);
  const [fiWalletState, setFiWalletState] = useState<FiWalletStore | null>(
    null,
  );
  const [circleFiWalletState, setCircleFiWalletState] = useState<
    FiWalletStore[] | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<ManageTab>('vote');
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const rawOwnerAddress = wallet?.account?.address ?? null;
  const ownerAddress = useMemo(
    () => (rawOwnerAddress ? Address.parse(rawOwnerAddress) : null),
    [rawOwnerAddress],
  );

  const isConnected = !!wallet;
  const { theme } = useTheme();

  const loadJettonInfo = useCallback(async () => {
    setLoading(true);
    setStatus(null);
    setJettonInfo(null);

    try {
      const data = await fetchJettonMaster();
      setJettonInfo({
        totalSupply: data.totalSupply,
        mintable: data.mintable,
        adminAddress: data.adminAddress,
        metadata: data.metadata,
      });
    } catch (err) {
      const msg = getErrorMessage(err);
      if (
        msg.includes('exit_code') ||
        msg.includes('-13') ||
        msg.includes('unable to execute')
      ) {
        setStatus({
          type: 'error',
          message:
            'Contract not found on testnet. Make sure the address is correct or try switching to otherNetwork.',
        });
      } else {
        setStatus({
          type: 'error',
          message: msg || 'Failed to load jetton data',
        });
      }
    } finally {
      setLoading(false);
      setStatus((prev) => (prev?.type === 'info' ? null : prev));
    }
  }, []);

  const loadFiWalletInfo = useCallback(async () => {
    if (!ownerAddress) {
      setFiWalletState(null);
      setCircleFiWalletState(null);
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      setFiWalletState(await getFiWalletState(ownerAddress));
    } catch (err) {
      const msg = getErrorMessage(err);
      setStatus({
        type: 'error',
        message: msg || 'Failed to load jetton data',
      });
    } finally {
      setLoading(false);
      setStatus((prev) => (prev?.type === 'info' ? null : prev));
    }
  }, [ownerAddress]);

  const loadCircleFiWalletInfo = useCallback(async () => {
    if (!fiWalletState) {
      setCircleFiWalletState(null);
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      setCircleFiWalletState(
        await getCircle(fiWalletState.maps.ref.invited.keys()),
      );
    } catch (err) {
      const msg = getErrorMessage(err);
      setStatus({
        type: 'error',
        message: msg || 'Failed to load jetton data',
      });
    } finally {
      setLoading(false);
      setStatus((prev) => (prev?.type === 'info' ? null : prev));
    }
  }, [fiWalletState]);

  useEffect(() => {
    loadJettonInfo();
    // Reload only when the network changes; address changes are handled via the input.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [FI_ADDRESS]);

  useEffect(() => {
    loadFiWalletInfo();
  }, [loadFiWalletInfo]);

  useEffect(() => {
    loadCircleFiWalletInfo();
  }, [loadCircleFiWalletInfo]);

  const isAdmin =
    jettonInfo && ownerAddress && jettonInfo.adminAddress
      ? jettonInfo.adminAddress.equals(ownerAddress)
      : false;

  const decimals = parseInt(jettonInfo?.metadata?.decimals || '9') || 9;
  const visibleTabs: ManageTab[] = isAdmin
    ? ['admin', 'credit', 'transfer', 'burn', 'invite', 'vote', 'destroy']
    : ['credit', 'invite', 'vote', 'transfer', 'burn'];

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
                  setStatus(null);
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
                    onSuccess={loadJettonInfo}
                  />
                </TabsContent>
                <TabsContent value="invite" className="mt-5">
                  <InviteTab
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
                      onSuccess={loadJettonInfo}
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
          error={
            !jettonInfo && status?.type === 'error' ? status.message : null
          }
          contractAddr={FI_ADDRESS}
        />
        <FiWalletInfoCard
          fiWalletState={fiWalletState}
          tokenSymbol={jettonInfo?.metadata?.symbol || 'FI'}
          loading={loading}
          error={
            !fiWalletState && status?.type === 'error' ? status.message : null
          }
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
  network: 'mainnet' | 'testnet';
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
  network: 'mainnet' | 'testnet';
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

function shortenAddress(addr: string): string {
  if (addr.length <= 12) return addr;
  return addr.slice(0, 4) + '...' + addr.slice(-4);
}

function AddressLink({
  address,
  network,
}: {
  address: string;
  network: 'mainnet' | 'testnet';
}) {
  const base =
    network === 'testnet'
      ? 'https://testnet.tonviewer.com'
      : 'https://tonviewer.com';
  return (
    <a
      href={`${base}/${address}`}
      target="_blank"
      rel="noopener noreferrer"
      title={address}
      className="text-[#0098EA] hover:underline"
    >
      {shortenAddress(address)}
    </a>
  );
}

function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="text-center py-8 px-4">
      <div className="mb-3.5 text-muted-foreground flex justify-center">
        {icon}
      </div>
      <div className="text-[15px] font-semibold mb-1.5">{title}</div>
      {description && (
        <p className="text-sm text-muted-foreground mb-4.5 leading-relaxed">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}

function WalletRequired() {
  return (
    <EmptyState
      icon={<Wallet className="size-8" />}
      title="Wallet not connected"
      description="Connect your wallet to perform this action"
      action={<WalletSelector className="rounded-full max-w-55 mx-auto" />}
    />
  );
}

function AdminRequired() {
  return (
    <EmptyState
      icon={<Lock className="size-8" />}
      title="Admin access required"
      description="Only the contract admin can perform this action"
    />
  );
}

function MintTab({
  contractAddr,
  decimals,
  isAdmin,
  isConnected,
  network,
  tonConnectUI,
  ownerAddress,
  onSuccess,
}: {
  contractAddr: string;
  decimals: number;
  isAdmin: boolean;
  isConnected: boolean;
  network: 'mainnet' | 'testnet';
  tonConnectUI: TonConnectUI;
  ownerAddress: Address | null;
  onSuccess: () => void;
}) {
  const [toAddr, setToAddr] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: string;
    message: string;
  } | null>(null);

  if (!isConnected) return <WalletRequired />;
  if (!isAdmin) return <AdminRequired />;

  async function handleMint(e: FormEvent) {
    e.preventDefault();
    if (!ownerAddress) return;

    const recipientRaw = toAddr.trim() || ownerAddress.toString();
    const recipientAddr = tryParseAddress(recipientRaw);
    if (!recipientAddr) {
      setStatus({ type: 'error', message: 'Invalid recipient address' });
      return;
    }
    const amountParsed = parseFloat(amount);
    if (isNaN(amountParsed) || amountParsed <= 0) {
      setStatus({ type: 'error', message: 'Enter a valid amount' });
      return;
    }

    setLoading(true);
    setStatus({ type: 'info', message: 'Confirm in your wallet...' });

    try {
      const mintAmountNano = parseUnits(amount.trim(), decimals);
      const body = buildMintBody({
        toAddress: recipientAddr,
        jettonAmount: mintAmountNano,
        forwardTonAmount: toNano('0.02'),
        totalTonAmount: toNano('0.05'),
      });

      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 300,
        network: network === 'mainnet' ? '-239' : '-3',
        messages: [
          {
            address: Address.parse(contractAddr).toString(),
            amount: toNano('0.1').toString(),
            payload: body.toBoc().toString('base64'),
          },
        ],
      });

      setStatus({ type: 'success', message: 'Mint transaction sent!' });
      setAmount('');
      setTimeout(onSuccess, 5000);
    } catch (err) {
      setStatus({
        type: 'error',
        message: isCancelledTransactionError(err)
          ? 'Transaction cancelled'
          : getErrorMessage(err) || 'Mint failed',
      });
    } finally {
      setLoading(false);
      setStatus((prev) => (prev?.type === 'info' ? null : prev));
    }
  }

  return (
    <form onSubmit={handleMint} className="space-y-4.5">
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Recipient Address
        </Label>
        <Input
          type="text"
          placeholder="Leave empty to mint to yourself"
          value={toAddr}
          onChange={(e) => setToAddr(e.target.value)}
          disabled={loading}
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Amount
        </Label>
        <Input
          type="text"
          placeholder="1000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={loading}
        />
      </div>
      <Button
        className="w-full h-12 rounded-full text-[15px] font-bold"
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="spinner" /> Minting...
          </>
        ) : (
          'Mint Tokens'
        )}
      </Button>
      {status && <StatusAlert type={status.type} message={status.message} />}
    </form>
  );
}

function TransferTab({
  decimals,
  isConnected,
  network,
  tonConnectUI,
  ownerAddress,
}: {
  decimals: number;
  isConnected: boolean;
  network: 'mainnet' | 'testnet';
  tonConnectUI: TonConnectUI;
  ownerAddress: Address | null;
}) {
  const [toAddr, setToAddr] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: string;
    message: string;
  } | null>(null);

  if (!isConnected) return <WalletRequired />;

  async function handleTransfer(e: FormEvent) {
    e.preventDefault();
    if (!ownerAddress) return;

    const recipientAddr = tryParseAddress(toAddr);
    if (!recipientAddr) {
      setStatus({ type: 'error', message: 'Invalid recipient address' });
      return;
    }
    const amountParsed = parseFloat(amount);
    if (isNaN(amountParsed) || amountParsed <= 0) {
      setStatus({ type: 'error', message: 'Enter a valid amount' });
      return;
    }

    setLoading(true);
    setStatus({ type: 'info', message: 'Confirm in your wallet...' });

    try {
      const transferAmount = parseUnits(amount.trim(), decimals);
      const body = buildTransferBody({
        toAddress: recipientAddr,
        amount: transferAmount,
        responseAddress: ownerAddress,
        forwardTonAmount: toNano('0.001'),
      });

      const walletAddr = await getWalletAddress(ownerAddress);

      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 300,
        network: network === 'mainnet' ? '-239' : '-3',
        messages: [
          {
            address: walletAddr.toString(),
            amount: toNano('0.05').toString(),
            payload: body.toBoc().toString('base64'),
          },
        ],
      });

      setStatus({ type: 'success', message: 'Transfer transaction sent!' });
      setAmount('');
      setToAddr('');
    } catch (err) {
      setStatus({
        type: 'error',
        message: isCancelledTransactionError(err)
          ? 'Transaction cancelled'
          : getErrorMessage(err) || 'Transfer failed',
      });
    } finally {
      setLoading(false);
      setStatus((prev) => (prev?.type === 'info' ? null : prev));
    }
  }

  return (
    <form onSubmit={handleTransfer} className="space-y-4.5">
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Recipient Address
        </Label>
        <Input
          type="text"
          placeholder="0Q..."
          value={toAddr}
          onChange={(e) => setToAddr(e.target.value)}
          disabled={loading}
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Amount
        </Label>
        <Input
          type="text"
          placeholder="100"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={loading}
        />
      </div>
      <Button
        className="w-full h-12 rounded-full text-[15px] font-bold"
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="spinner" /> Transferring...
          </>
        ) : (
          'Transfer Tokens'
        )}
      </Button>
      {status && <StatusAlert type={status.type} message={status.message} />}
    </form>
  );
}

function InviteTab({
  network,
  tonConnectUI,
  ownerAddress,
}: {
  network: 'mainnet' | 'testnet';
  tonConnectUI: TonConnectUI;
  ownerAddress: Address | null;
}) {
  const [toAddr, setToAddr] = useState('');
  const [inviteId, setInviteId] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: string;
    message: string;
  } | null>(null);

  if (!ownerAddress) return <WalletRequired />;

  async function handleInvite(e: FormEvent) {
    e.preventDefault();

    const recipientAddr = tryParseAddress(toAddr);
    if (!recipientAddr) {
      setStatus({ type: 'error', message: 'Invalid recipient address' });
      return;
    }
    if (!ownerAddress) {
      setStatus({ type: 'error', message: 'Wallet not connected' });
      return;
    }

    setLoading(true);
    setStatus({ type: 'info', message: 'Confirm in your wallet...' });

    try {
      const body = buildInviteBody({
        transferRecipient: recipientAddr,
        sendExcessesTo: ownerAddress,
        forwardPayload: inviteId.trim(),
      });
      // const client = getTonClient(network);
      const walletAddr = await getWalletAddress(
        // client,
        // Address.parse(contractAddr),
        ownerAddress,
      );

      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 300,
        network: network === 'mainnet' ? '-239' : '-3',
        messages: [
          {
            address: walletAddr.toString(),
            amount: toNano('0.6').toString(),
            payload: body.toBoc().toString('base64'),
          },
        ],
      });

      setStatus({ type: 'success', message: 'Invite transaction sent!' });
      setToAddr('');
      setInviteId('');
    } catch (err) {
      setStatus({
        type: 'error',
        message: isCancelledTransactionError(err)
          ? 'Transaction cancelled'
          : getErrorMessage(err) || 'Invite failed',
      });
    } finally {
      setLoading(false);
      setStatus((prev) => (prev?.type === 'info' ? null : prev));
    }
  }

  return (
    <form onSubmit={handleInvite} className="space-y-4.5">
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Recipient Address
        </Label>
        <InputScan toAddr={toAddr} setToAddr={setToAddr} />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Invite ID (optional)
        </Label>
        <Input
          type="text"
          placeholder="Invite reference"
          value={inviteId}
          onChange={(e) => setInviteId(e.target.value)}
          disabled={loading}
        />
        <p className="text-xs text-muted-foreground">
          This will send an invite message through your wallet contract.
        </p>
      </div>
      <Button
        className="w-full h-12 rounded-full text-[15px] font-bold"
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="spinner" /> Sending invite...
          </>
        ) : (
          'Send Invite'
        )}
      </Button>
      {status && <StatusAlert type={status.type} message={status.message} />}
    </form>
  );
}

function VoteTab({
  network,
  tonConnectUI,
  ownerAddress,
}: {
  network: 'mainnet' | 'testnet';
  tonConnectUI: TonConnectUI;
  ownerAddress: Address | null;
}) {
  const [toAddr, setToAddr] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: string;
    message: string;
  } | null>(null);

  if (!ownerAddress) return <WalletRequired />;
  const owner = ownerAddress;

  async function sendVote(positive: boolean) {
    const recipientAddr = tryParseAddress(toAddr);
    if (!recipientAddr) {
      setStatus({ type: 'error', message: 'Invalid recipient address' });
      return;
    }
    setLoading(true);
    setStatus({ type: 'info', message: 'Confirm in your wallet...' });

    try {
      const body = positive
        ? buildVoteBody({
            transferRecipient: recipientAddr,
            sendExcessesTo: owner,
          })
        : buildUnvoteBody({
            transferRecipient: recipientAddr,
            sendExcessesTo: owner,
          });
      // const client = getTonClient(network);
      const walletAddr = await getWalletAddress(
        // client,
        // Address.parse(contractAddr),
        owner,
      );

      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 300,
        network: network === 'mainnet' ? '-239' : '-3',
        messages: [
          {
            address: walletAddr.toString(),
            amount: toNano('0.6').toString(),
            payload: body.toBoc().toString('base64'),
          },
        ],
      });

      setStatus({
        type: 'success',
        message: positive
          ? 'Vote transaction sent!'
          : 'Unvote transaction sent!',
      });
      setToAddr('');
    } catch (err) {
      setStatus({
        type: 'error',
        message: isCancelledTransactionError(err)
          ? 'Transaction cancelled'
          : getErrorMessage(err) || 'Vote failed',
      });
    } finally {
      setLoading(false);
      setStatus((prev) => (prev?.type === 'info' ? null : prev));
    }
  }

  return (
    <div className="space-y-4.5">
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Delegate Address
        </Label>
        <Input
          type="text"
          placeholder="0Q..."
          value={toAddr}
          onChange={(e) => setToAddr(e.target.value)}
          disabled={loading}
        />
      </div>
      <div className="grid grid-cols-2 gap-3.5 max-sm:grid-cols-1">
        <Button
          className="h-12 rounded-full text-[15px] font-bold"
          disabled={loading}
          onClick={() => sendVote(true)}
        >
          {loading ? (
            <>
              <span className="spinner" /> Sending vote...
            </>
          ) : (
            'Vote'
          )}
        </Button>
        <Button
          variant="destructive"
          className="h-12 rounded-full text-[15px] font-bold"
          disabled={loading}
          onClick={() => sendVote(false)}
        >
          {loading ? (
            <>
              <span className="spinner" /> Sending unvote...
            </>
          ) : (
            'Unvote'
          )}
        </Button>
      </div>
      {status && <StatusAlert type={status.type} message={status.message} />}
    </div>
  );
}

function DestroyTab({
  network,
  tonConnectUI,
  ownerAddress,
}: {
  network: 'mainnet' | 'testnet';
  tonConnectUI: TonConnectUI;
  ownerAddress: Address | null;
}) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: string;
    message: string;
  } | null>(null);

  if (!ownerAddress) return <WalletRequired />;
  const owner = ownerAddress;

  async function sendDestroy() {
    setLoading(true);
    setStatus({ type: 'info', message: 'Confirm in your wallet...' });

    try {
      const body = buildDestroyBody();
      // const client = getTonClient(network);
      const walletAddr = await getWalletAddress(
        // client,
        // Address.parse(contractAddr),
        owner,
      );

      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 300,
        network: network === 'mainnet' ? '-239' : '-3',
        messages: [
          {
            address: walletAddr.toString(),
            amount: toNano('0.6').toString(),
            payload: body.toBoc().toString('base64'),
          },
        ],
      });

      setStatus({
        type: 'success',
        message: 'Destroy transaction sent!',
      });
    } catch (err) {
      setStatus({
        type: 'error',
        message: isCancelledTransactionError(err)
          ? 'Transaction cancelled'
          : getErrorMessage(err) || 'Txn failed',
      });
    } finally {
      setLoading(false);
      setStatus((prev) => (prev?.type === 'info' ? null : prev));
    }
  }

  return (
    <div className="space-y-4.5">
      <Button
        className="h-12 rounded-full text-[15px] font-bold"
        disabled={loading}
        onClick={() => sendDestroy()}
      >
        {loading ? (
          <>
            <span className="spinner" /> Sending Txn...
          </>
        ) : (
          'Destroy Account'
        )}
      </Button>
      {status && <StatusAlert type={status.type} message={status.message} />}
    </div>
  );
}

function CreditTab({
  decimals,
  isConnected,
  network,
  tonConnectUI,
  ownerAddress,
}: {
  decimals: number;
  isConnected: boolean;
  network: 'mainnet' | 'testnet';
  tonConnectUI: TonConnectUI;
  ownerAddress: Address | null;
}) {
  const [buyIssuer, setBuyIssuer] = useState('');
  const [buyAmount, setBuyAmount] = useState('');
  const [paybackIssuer, setPaybackIssuer] = useState('');
  const [paybackAmount, setPaybackAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: string;
    message: string;
  } | null>(null);

  if (!isConnected) return <WalletRequired />;

  async function handleBuyCredit(e: FormEvent) {
    e.preventDefault();
    if (!ownerAddress) return;

    const issuerAddr = tryParseAddress(buyIssuer);
    if (!issuerAddr) {
      setStatus({ type: 'error', message: 'Invalid issuer address' });
      return;
    }
    const amountParsed = parseFloat(buyAmount);
    if (isNaN(amountParsed) || amountParsed <= 0) {
      setStatus({ type: 'error', message: 'Enter a valid amount' });
      return;
    }

    setLoading(true);
    setStatus({ type: 'info', message: 'Confirm in your wallet...' });

    try {
      const body = buildBuyCreditBody({
        transferRecipient: issuerAddr,
        amount: parseUnits(buyAmount.trim(), decimals),
        responseAddress: ownerAddress,
      });
      const walletAddr = await getWalletAddress(ownerAddress);

      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 300,
        network: network === 'mainnet' ? '-239' : '-3',
        messages: [
          {
            address: walletAddr.toString(),
            amount: toNano('1.5').toString(),
            payload: body.toBoc().toString('base64'),
          },
        ],
      });

      setStatus({
        type: 'success',
        message:
          'Buy transaction sent! The issuer mints your Personal Token on receipt.',
      });
      setBuyAmount('');
      setBuyIssuer('');
    } catch (err) {
      setStatus({
        type: 'error',
        message: isCancelledTransactionError(err)
          ? 'Transaction cancelled'
          : getErrorMessage(err) || 'Buy failed',
      });
    } finally {
      setLoading(false);
      setStatus((prev) => (prev?.type === 'info' ? null : prev));
    }
  }

  async function handlePayback(e: FormEvent) {
    e.preventDefault();
    if (!ownerAddress) return;

    const issuerAddr = tryParseAddress(paybackIssuer);
    if (!issuerAddr) {
      setStatus({ type: 'error', message: 'Invalid issuer address' });
      return;
    }
    const amountParsed = parseFloat(paybackAmount);
    if (isNaN(amountParsed) || amountParsed <= 0) {
      setStatus({ type: 'error', message: 'Enter a valid amount' });
      return;
    }

    setLoading(true);
    setStatus({ type: 'info', message: 'Confirm in your wallet...' });

    try {
      const personalMinter = await getPersonalMinterForIssuer(issuerAddr);
      if (!personalMinter) {
        setStatus({
          type: 'error',
          message: 'This issuer has no Personal Token minter deployed',
        });
        return;
      }
      const personalWallet = await getPersonalWalletAddress(
        personalMinter,
        ownerAddress,
      );
      // burning with sendExcessesTo set triggers the issuer's payback leg
      const body = buildBurnBody(
        parseUnits(paybackAmount.trim(), decimals),
        ownerAddress,
      );

      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 300,
        network: network === 'mainnet' ? '-239' : '-3',
        messages: [
          {
            address: personalWallet.toString(),
            amount: toNano('0.6').toString(),
            payload: body.toBoc().toString('base64'),
          },
        ],
      });

      setStatus({
        type: 'success',
        message:
          'Payback transaction sent! Burning your Personal Token returns the FI loan.',
      });
      setPaybackAmount('');
      setPaybackIssuer('');
    } catch (err) {
      setStatus({
        type: 'error',
        message: isCancelledTransactionError(err)
          ? 'Transaction cancelled'
          : getErrorMessage(err) || 'Payback failed',
      });
    } finally {
      setLoading(false);
      setStatus((prev) => (prev?.type === 'info' ? null : prev));
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleBuyCredit} className="space-y-4.5">
        <h3 className="text-base font-semibold">Buy Credit</h3>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Issuer Address
          </Label>
          <InputScan toAddr={buyIssuer} setToAddr={setBuyIssuer} />
          <p className="text-xs text-muted-foreground">
            Lend FI to an issuer and receive their Personal Token as credit.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Amount (FI)
          </Label>
          <Input
            type="text"
            placeholder="100"
            value={buyAmount}
            onChange={(e) => setBuyAmount(e.target.value)}
            disabled={loading}
          />
        </div>
        <Button
          className="w-full h-12 rounded-full text-[15px] font-bold"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner" /> Buying credit...
            </>
          ) : (
            'Buy Credit'
          )}
        </Button>
        {status && <StatusAlert type={status.type} message={status.message} />}
      </form>

      <Separator />

      <form onSubmit={handlePayback} className="space-y-4.5">
        <h3 className="text-base font-semibold">Pay Back</h3>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Issuer Address
          </Label>
          <InputScan toAddr={paybackIssuer} setToAddr={setPaybackIssuer} />
          <p className="text-xs text-muted-foreground">
            Burn your Personal Token; the issuer returns the FI loan.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Amount (Personal Tokens)
          </Label>
          <Input
            type="text"
            placeholder="100"
            value={paybackAmount}
            onChange={(e) => setPaybackAmount(e.target.value)}
            disabled={loading}
          />
        </div>
        <Button
          variant="destructive"
          className="w-full h-12 rounded-full text-[15px] font-bold"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner" /> Paying back...
            </>
          ) : (
            'Pay Back'
          )}
        </Button>
        {status && <StatusAlert type={status.type} message={status.message} />}
      </form>
    </div>
  );
}

function BurnTab({
  decimals,
  isConnected,
  network,
  tonConnectUI,
  ownerAddress,
  onSuccess,
}: {
  decimals: number;
  isConnected: boolean;
  network: 'mainnet' | 'testnet';
  tonConnectUI: TonConnectUI;
  ownerAddress: Address | null;
  onSuccess: () => void;
}) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: string;
    message: string;
  } | null>(null);

  if (!isConnected) return <WalletRequired />;

  async function handleBurn(e: FormEvent) {
    e.preventDefault();
    if (!ownerAddress) return;

    const amountParsed = parseFloat(amount);
    if (isNaN(amountParsed) || amountParsed <= 0) {
      setStatus({ type: 'error', message: 'Enter a valid amount' });
      return;
    }

    setLoading(true);
    setStatus({ type: 'info', message: 'Confirm in your wallet...' });

    try {
      const burnAmount = parseUnits(amount.trim(), decimals);
      const body = buildBurnBody(burnAmount, ownerAddress);

      // const client = getTonClient(network);
      const walletAddr = await getWalletAddress(
        // client,
        // Address.parse(contractAddr),
        ownerAddress,
      );

      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 300,
        network: network === 'mainnet' ? '-239' : '-3',
        messages: [
          {
            address: walletAddr.toString(),
            amount: toNano('0.05').toString(),
            payload: body.toBoc().toString('base64'),
          },
        ],
      });

      setStatus({ type: 'success', message: 'Burn transaction sent!' });
      setAmount('');
      setTimeout(onSuccess, 5000);
    } catch (err) {
      setStatus({
        type: 'error',
        message: isCancelledTransactionError(err)
          ? 'Transaction cancelled'
          : getErrorMessage(err) || 'Burn failed',
      });
    } finally {
      setLoading(false);
      setStatus((prev) => (prev?.type === 'info' ? null : prev));
    }
  }

  return (
    <form onSubmit={handleBurn} className="space-y-4.5">
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Amount to Burn
        </Label>
        <Input
          type="text"
          placeholder="1000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={loading}
        />
        <p className="text-xs text-muted-foreground">
          Burns tokens from your wallet. This action is irreversible.
        </p>
      </div>
      <Button
        variant="destructive"
        className="w-full h-12 rounded-full text-[15px] font-bold"
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="spinner" /> Burning...
          </>
        ) : (
          'Burn Tokens'
        )}
      </Button>
      {status && <StatusAlert type={status.type} message={status.message} />}
    </form>
  );
}

function AdminTab({
  contractAddr,
  info,
  isAdmin,
  isConnected,
  network,
  tonConnectUI,
  ownerAddress,
  onSuccess,
}: {
  contractAddr: string;
  info: JettonInfo;
  isAdmin: boolean;
  isConnected: boolean;
  network: 'mainnet' | 'testnet';
  tonConnectUI: TonConnectUI;
  ownerAddress: Address | null;
  onSuccess: () => void;
}) {
  const [newAdmin, setNewAdmin] = useState(ZERO_ADDRESS);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: string;
    message: string;
  } | null>(null);

  const [newName, setNewName] = useState(info.metadata.name || '');
  const [newSymbol, setNewSymbol] = useState(info.metadata.symbol || '');
  const newDecimals = info.metadata.decimals || '9';
  const [newDescription, setNewDescription] = useState(
    info.metadata.description || '',
  );
  const [newImage, setNewImage] = useState(info.metadata.image || '');

  if (!isConnected) return <WalletRequired />;
  if (!isAdmin) return <AdminRequired />;

  async function handleChangeAdmin(e: FormEvent) {
    e.preventDefault();
    const adminAddr = tryParseAddress(newAdmin);
    if (!adminAddr) {
      setStatus({ type: 'error', message: 'Invalid admin address' });
      return;
    }

    setLoading(true);
    setStatus({ type: 'info', message: 'Confirm in your wallet...' });

    try {
      const body = buildChangeAdminBody(adminAddr);
      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 300,
        network: network === 'mainnet' ? '-239' : '-3',
        messages: [
          {
            address: Address.parse(contractAddr).toString(),
            amount: toNano('0.05').toString(),
            payload: body.toBoc().toString('base64'),
          },
        ],
      });
      setStatus({ type: 'success', message: 'Admin change transaction sent!' });
      setTimeout(onSuccess, 5000);
    } catch (err) {
      setStatus({
        type: 'error',
        message: isCancelledTransactionError(err)
          ? 'Transaction cancelled'
          : getErrorMessage(err) || 'Failed',
      });
    } finally {
      setLoading(false);
      setStatus((prev) => (prev?.type === 'info' ? null : prev));
    }
  }

  async function handleTopUpTons() {
    setLoading(true);
    setStatus({ type: 'info', message: 'Confirm in your wallet...' });

    try {
      const body = buildTopUpTonsBody();
      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 300,
        network: network === 'mainnet' ? '-239' : '-3',
        messages: [
          {
            address: Address.parse(contractAddr).toString(),
            amount: toNano('0.1').toString(),
            payload: body.toBoc().toString('base64'),
          },
        ],
      });
      setStatus({ type: 'success', message: 'Top-up transaction sent!' });
      setTimeout(onSuccess, 5000);
    } catch (err) {
      setStatus({
        type: 'error',
        message: isCancelledTransactionError(err)
          ? 'Transaction cancelled'
          : getErrorMessage(err) || 'Top up failed',
      });
    } finally {
      setLoading(false);
      setStatus((prev) => (prev?.type === 'info' ? null : prev));
    }
  }

  async function handleApproveUpgrade() {
    setLoading(true);
    setStatus({ type: 'info', message: 'Confirm in your wallet...' });

    try {
      const body = buildApproveUpgradeBody();
      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 300,
        network: network === 'mainnet' ? '-239' : '-3',
        messages: [
          {
            address: Address.parse(contractAddr).toString(),
            amount: toNano('0.05').toString(),
            payload: body.toBoc().toString('base64'),
          },
        ],
      });
      setStatus({
        type: 'success',
        message: 'Approve upgrade transaction sent!',
      });
      setTimeout(onSuccess, 5000);
    } catch (err) {
      setStatus({
        type: 'error',
        message: isCancelledTransactionError(err)
          ? 'Transaction cancelled'
          : getErrorMessage(err) || 'Approve failed',
      });
    } finally {
      setLoading(false);
      setStatus((prev) => (prev?.type === 'info' ? null : prev));
    }
  }

  async function handleRejectUpgrade() {
    setLoading(true);
    setStatus({ type: 'info', message: 'Confirm in your wallet...' });

    try {
      const body = buildRejectUpgradeBody();
      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 300,
        network: network === 'mainnet' ? '-239' : '-3',
        messages: [
          {
            address: Address.parse(contractAddr).toString(),
            amount: toNano('0.05').toString(),
            payload: body.toBoc().toString('base64'),
          },
        ],
      });
      setStatus({
        type: 'success',
        message: 'Reject upgrade transaction sent!',
      });
      setTimeout(onSuccess, 5000);
    } catch (err) {
      setStatus({
        type: 'error',
        message: isCancelledTransactionError(err)
          ? 'Transaction cancelled'
          : getErrorMessage(err) || 'Reject failed',
      });
    } finally {
      setLoading(false);
      setStatus((prev) => (prev?.type === 'info' ? null : prev));
    }
  }

  async function handleUpdateContent(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: 'info', message: 'Confirm in your wallet...' });

    try {
      const body = await buildChangeContentBody({
        name: newName,
        symbol: newSymbol,
        decimals: newDecimals,
        description: newDescription || undefined,
        image: newImage || undefined,
      });
      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 300,
        network: network === 'mainnet' ? '-239' : '-3',
        messages: [
          {
            address: Address.parse(contractAddr).toString(),
            amount: toNano('0.05').toString(),
            payload: body.toBoc().toString('base64'),
          },
        ],
      });
      setStatus({
        type: 'success',
        message: 'Content update transaction sent!',
      });
      setTimeout(onSuccess, 5000);
    } catch (err) {
      setStatus({
        type: 'error',
        message: isCancelledTransactionError(err)
          ? 'Transaction cancelled'
          : getErrorMessage(err) || 'Failed',
      });
    } finally {
      setLoading(false);
      setStatus((prev) => (prev?.type === 'info' ? null : prev));
    }
  }

  const decimals = parseInt(info.metadata.decimals || '9') || 9;

  return (
    <div className="space-y-0">
      <div className="space-y-4.5">
        <h3 className="text-base font-semibold">Mint Tokens</h3>
        <MintTab
          contractAddr={contractAddr}
          decimals={decimals}
          isAdmin={isAdmin}
          isConnected={isConnected}
          network={network}
          tonConnectUI={tonConnectUI}
          ownerAddress={ownerAddress}
          onSuccess={onSuccess}
        />
      </div>

      <Separator className="my-6" />

      <form onSubmit={handleUpdateContent} className="space-y-4.5">
        <h3 className="text-base font-semibold">Update Metadata</h3>
        <div className="grid grid-cols-2 gap-3.5 max-sm:grid-cols-1">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Name
            </Label>
            <Input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Symbol
            </Label>
            <Input
              type="text"
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Description
          </Label>
          <Textarea
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Image URL
          </Label>
          <Input
            type="text"
            value={newImage}
            onChange={(e) => setNewImage(e.target.value)}
            disabled={loading}
          />
        </div>
        <Button
          className="w-full h-12 rounded-full text-[15px] font-bold"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner" /> Updating...
            </>
          ) : (
            'Update Metadata'
          )}
        </Button>
      </form>

      <Separator className="my-6" />

      <form onSubmit={handleChangeAdmin} className="space-y-4.5">
        <h3 className="text-base font-semibold">Transfer Admin</h3>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            New Admin Address
          </Label>
          <Input
            type="text"
            placeholder="0Q..."
            value={newAdmin}
            onChange={(e) => setNewAdmin(e.target.value)}
            disabled={loading}
          />
          <p className="text-xs text-muted-foreground">
            Zero address (0:000...0) revokes admin rights permanently
          </p>
        </div>
        <Button
          variant="destructive"
          className="w-full h-12 rounded-full text-[15px] font-bold"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner" /> Transferring...
            </>
          ) : (
            'Transfer Admin Rights'
          )}
        </Button>
      </form>

      <Separator className="my-6" />

      <div className="space-y-4.5">
        <h3 className="text-base font-semibold">Admin Actions</h3>
        <div className="grid grid-cols-3 gap-3.5 max-sm:grid-cols-1">
          <Button
            className="h-12 rounded-full text-[15px] font-bold"
            disabled={loading}
            onClick={handleTopUpTons}
          >
            {loading ? (
              <>
                <span className="spinner" /> Top Up...
              </>
            ) : (
              'Top Up Tons'
            )}
          </Button>
          <Button
            className="h-12 rounded-full text-[15px] font-bold"
            disabled={loading}
            onClick={handleApproveUpgrade}
          >
            {loading ? (
              <>
                <span className="spinner" /> Approving...
              </>
            ) : (
              'Approve Upgrade'
            )}
          </Button>
          <Button
            variant="destructive"
            className="h-12 rounded-full text-[15px] font-bold"
            disabled={loading}
            onClick={handleRejectUpgrade}
          >
            {loading ? (
              <>
                <span className="spinner" /> Rejecting...
              </>
            ) : (
              'Reject Upgrade'
            )}
          </Button>
        </div>
      </div>

      {status && (
        <StatusAlert
          type={status.type}
          message={status.message}
          className="mt-4"
        />
      )}
    </div>
  );
}
