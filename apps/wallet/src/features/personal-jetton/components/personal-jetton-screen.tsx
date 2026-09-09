/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState, useMemo } from 'react';
import { Address } from '@ton/core';
import {
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Rocket,
  ArrowRight,
  ExternalLink,
  Trash2,
  Info,
} from 'lucide-react';
import { useNavigate } from '@/core/routing';
import { useWallet, useWalletKit, useAuth } from '@demo/wallet-core';
import {
  useExplorer,
  getExplorerAddressUrl,
} from '@/core/explorer/use-explorer';
import { NewLayout } from '@/core/components/shared/new-layout';
import { ScreenHeader } from '@/core/components/shared/screen-header';
import { Button } from '@/core/components/ui/button';
import { InputScan } from '@/core/components/ui/input-scan';
import { CopyButton } from '@/core/components/ui/copy-button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/core/components/ui/dialog';
import { useFormatAddress } from '@/core/utils/formatters';
import {
  MemberGuard,
  ActivationBanner,
  useIsNetworkMember,
} from '@/features/brotherhood';

import {
  useDeployPersonalJetton,
  DEFAULT_TOKEN_DESCRIPTION,
} from '../hooks/use-deploy-personal-jetton';
import { useRegisterPersonalJetton } from '../hooks/use-register-personal-jetton';
import { SyncStatusButton } from '@/features/dashboard/components/sync-status-button';
import { useMintPersonal } from '../hooks/use-mint-personal';
import { useBurnPersonal } from '../hooks/use-burn-personal';
import { useDestroyPersonal } from '../hooks/use-destroy-personal';
import {
  usePersonalMinterAdmin,
  usePersonalMinterMetadata,
  useTopUp,
} from '../hooks/use-personal-minter-actions';
import { usePersonalJettonInfo } from '../hooks/use-personal-jetton-info';
import { TokenImagePicker } from './token-image-picker';
import { DEFAULT_TOKEN_IMAGE } from '../data/cryptoicons';

type Tab =
  | 'info'
  | 'deploy'
  | 'mint'
  | 'burn'
  | 'addresses'
  | 'admin'
  | 'topup'
  | 'destroy';

export const PersonalJettonScreen: React.FC = () => {
  const navigate = useNavigate();
  const walletKit = useWalletKit();
  const { currentWallet, address, savedWallets, activeWalletId } = useWallet();
  const network =
    savedWallets.find((w) => w.id === activeWalletId)?.network ?? 'testnet';
  const { formatContractAddress, formatWalletAddress } = useFormatAddress();
  const { canOperate } = useIsNetworkMember();

  const [activeTab, setActiveTab] = useState<Tab>('info');

  const { explorer } = useExplorer();

  // Form inputs for Update Metadata in Admin tab
  const [adminTokenName, setAdminTokenName] = useState('');
  const [adminTokenSymbol, setAdminTokenSymbol] = useState('');
  const [adminTokenDesc, setAdminTokenDesc] = useState('');
  const [adminTokenImage, setAdminTokenImage] = useState(DEFAULT_TOKEN_IMAGE);

  // Manual inputs for other actions
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [newAdmin, setNewAdmin] = useState('');
  const [topUpTarget, setTopUpTarget] = useState('');

  // Explicit registration overrides
  const [addressesTabMinter, setAddressesTabMinter] = useState('');
  const [addressesTabWallet, setAddressesTabWallet] = useState('');
  const [adminSubTab, setAdminSubTab] = useState<'metadata' | 'transfer'>(
    'metadata',
  );

  // Burn tab options
  const [isPayback, setIsPayback] = useState(true);

  // Destroy tab confirmation dialog states & auth gate
  const { isPasswordSet, unlock } = useAuth();
  const [isConfirmWalletOpen, setIsConfirmWalletOpen] = useState(false);
  const [isConfirmMinterOpen, setIsConfirmMinterOpen] = useState(false);
  const [confirmDestroyPhrase, setConfirmDestroyPhrase] = useState('');
  const [confirmDestroyPassword, setConfirmDestroyPassword] = useState('');
  const [destroyAuthError, setDestroyAuthError] = useState('');
  const [isAuthenticatingDestroy, setIsAuthenticatingDestroy] = useState(false);

  const info = usePersonalJettonInfo(address ?? null);

  const activeMinter =
    info.personalMinterAddress || info.deterministicMinterAddress || '';
  const activePersonalWallet =
    info.personalWalletAddress || info.expectedPersonalWalletAddress || '';

  const isMinterAdmin = useMemo(() => {
    if (!address) return false;
    try {
      const userAddr = Address.parse(address);
      if (info.minterDetails?.adminAddress) {
        return userAddr.equals(info.minterDetails.adminAddress);
      }
      // Fallback: If deterministic minter is defined and matches activeMinter,
      // the connected user is the default admin for their own deterministic minter
      if (info.deterministicMinterAddress && activeMinter) {
        const detMinter = Address.parse(info.deterministicMinterAddress);
        if (Address.parse(activeMinter).equals(detMinter)) {
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  }, [
    address,
    info.minterDetails?.adminAddress,
    info.deterministicMinterAddress,
    activeMinter,
  ]);

  // Deploy tab initial mint amount
  const [initialMintAmount, setInitialMintAmount] = useState('1000');

  const deployer = useDeployPersonalJetton({
    wallet: currentWallet,
    walletKit,
    walletAddress: address ?? null,
    network,
    initialMintAmount,
    onDeploySuccess: () => {
      info.refetch();
    },
  });

  const _isDeployed =
    info.isDeployedOnChain || Boolean(deployer.deployedAddresses);

  const availableTabs: Tab[] =
    info.isDeployedOnChain && !deployer.deployedAddresses
      ? ['info', 'mint', 'burn', 'addresses', 'admin', 'topup', 'destroy']
      : [
          'info',
          'deploy',
          'mint',
          'burn',
          'addresses',
          'admin',
          'topup',
          'destroy',
        ];

  // If already deployed on-chain and not in post-deploy success state, switch to info
  React.useEffect(() => {
    if (
      info.isDeployedOnChain &&
      !deployer.deployedAddresses &&
      activeTab === 'deploy'
    ) {
      setActiveTab('info');
    }
  }, [info.isDeployedOnChain, deployer.deployedAddresses, activeTab]);

  // Effective addresses to register
  const targetRegisterMinter =
    addressesTabMinter ||
    deployer.deployedAddresses?.minterAddress ||
    activeMinter ||
    info.deterministicMinterAddress ||
    '';

  const targetRegisterWallet =
    addressesTabWallet ||
    deployer.deployedAddresses?.personalWalletAddress ||
    activePersonalWallet ||
    info.expectedPersonalWalletAddress ||
    '';

  const registrar = useRegisterPersonalJetton({
    wallet: currentWallet,
    walletKit,
    walletAddress: address ?? null,
    personalMinterAddress: targetRegisterMinter,
    personalWalletAddress: targetRegisterWallet,
    network,
    onSuccess: () => {
      info.refetch();
    },
  });

  const minter = useMintPersonal({
    wallet: currentWallet,
    walletKit,
    minterAddress: activeMinter,
    recipient,
    amount,
  });

  const burner = useBurnPersonal({
    wallet: currentWallet,
    walletKit,
    walletAddress: address ?? null,
    personalWalletAddress: activePersonalWallet,
    amount,
    isPayback,
  });

  const destroyer = useDestroyPersonal({
    wallet: currentWallet,
    walletKit,
    walletAddress: address ?? null,
    personalWalletAddress: activePersonalWallet || null,
    personalMinterAddress: activeMinter || null,
    onSuccess: () => {
      info.refetch();
    },
  });

  const admin = usePersonalMinterAdmin({
    wallet: currentWallet,
    walletKit,
    minterAddress: activeMinter,
    newAdmin,
  });

  const metadata = usePersonalMinterMetadata({
    wallet: currentWallet,
    walletKit,
    minterAddress: activeMinter,
    name: adminTokenName,
    symbol: adminTokenSymbol,
    description: adminTokenDesc,
    image: adminTokenImage,
  });

  const topup = useTopUp({
    wallet: currentWallet,
    walletKit,
    targetAddress: topUpTarget || activeMinter,
  });

  return (
    <MemberGuard title="Personal Token Economy">
      <NewLayout
        header={
          <ScreenHeader
            title="Personal Token Economy"
            onBack={() => navigate('/wallet')}
            rightElement={<SyncStatusButton />}
          />
        }
      >
        <div className="space-y-4">
          <ActivationBanner />

          {/* Tabs */}
          <div className="flex flex-wrap gap-1 bg-secondary/70 border border-border p-1 rounded-xl text-xs font-medium">
            {availableTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
                  activeTab === tab
                    ? 'bg-card shadow-sm text-foreground font-semibold border border-border'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                }`}
                data-testid={`personal-tab-${tab}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Info Tab */}
          {activeTab === 'info' && (
            <div className="space-y-3 bg-card text-card-foreground p-4 border border-border rounded-2xl shadow-sm text-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-base">
                  Personal Jetton Overview
                </h3>
                {info.isRegistered && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    Active & Registered
                  </span>
                )}
              </div>

              {info.isLoading ? (
                <p className="text-muted-foreground text-xs py-4 text-center">
                  Querying minter & wallet contracts…
                </p>
              ) : (
                <div className="space-y-3">
                  {/* Case 1: Deployed (either recently or on-chain) but not registered */}
                  {!info.isRegistered &&
                    (deployer.deployedAddresses || info.isDeployedOnChain) && (
                      <div className="p-3.5 rounded-xl border border-amber-500/40 bg-amber-500/10 space-y-2.5">
                        <div className="flex items-start gap-2.5">
                          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          <div className="text-xs space-y-1">
                            <span className="font-semibold text-amber-700 dark:text-amber-400 block">
                              {info.hasMismatchedRegistration
                                ? 'Update FI Account Registration'
                                : 'Registration Required'}
                            </span>
                            <p className="text-muted-foreground leading-relaxed">
                              {info.hasMismatchedRegistration
                                ? 'Your FI Account points to outdated or mismatched addresses. Register both deterministic minter & wallet addresses to link your active token.'
                                : 'Your Personal Token minter is deployed on-chain! Register both minter & wallet addresses to your FI Account in a single unified transaction.'}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-1.5 text-[11px] bg-background/60 p-2 rounded-lg border border-border">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">
                              Minter:
                            </span>
                            <span className="font-mono text-foreground font-medium">
                              {formatContractAddress(targetRegisterMinter)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">
                              Wallet:
                            </span>
                            <span className="font-mono text-foreground font-medium">
                              {formatContractAddress(targetRegisterWallet)}
                            </span>
                          </div>
                        </div>
                        {!canOperate && (
                          <p className="text-[11px] text-amber-600 dark:text-amber-400">
                            Note: Account is pending 1-day activation delay or
                            suspended. Registration will be enabled once active.
                          </p>
                        )}
                        <Button
                          onClick={() => registrar.register()}
                          disabled={!canOperate || registrar.isDisabled}
                          loading={registrar.isSending}
                          fullWidth
                          size="sm"
                          className="bg-amber-600 hover:bg-amber-700 text-white font-medium"
                          data-testid="personal-register-info-submit"
                        >
                          Register Personal Token to Account
                        </Button>
                      </div>
                    )}

                  {/* Case 2: Not deployed yet */}
                  {!info.isRegistered &&
                    !info.isDeployedOnChain &&
                    !deployer.deployedAddresses && (
                      <div className="p-4 rounded-xl border border-dashed border-border bg-secondary/30 flex flex-col items-center text-center space-y-2.5 my-2">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
                          <Rocket className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground text-sm">
                            Personal Token Not Deployed
                          </h4>
                          <p className="text-xs text-muted-foreground mt-0.5 max-w-xs">
                            You haven't deployed your personal token yet. Deploy
                            it now to issue credit, establish member trust, and
                            borrow in BrotherHood Network.
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => setActiveTab('deploy')}
                          className="mt-1 text-xs"
                          data-testid="personal-deploy-prompt-btn"
                        >
                          <Sparkles className="w-3.5 h-3.5 mr-1" />
                          Deploy Personal Token
                        </Button>
                      </div>
                    )}

                  {/* Address & Balance Summary */}
                  <div className="space-y-2 text-xs">
                    <div className="bg-secondary/50 border border-border/50 p-2.5 rounded-xl break-all">
                      <span className="text-muted-foreground block">
                        Personal Minter Address
                      </span>
                      <div className="flex items-center justify-between gap-1 mt-0.5">
                        <span className="font-medium text-foreground">
                          {formatContractAddress(info.personalMinterAddress) ||
                            (deployer.deployedAddresses
                              ? formatContractAddress(
                                  deployer.deployedAddresses.minterAddress,
                                ) + ' (Pending Registration)'
                              : 'None deployed yet')}
                        </span>
                        <div className="flex items-center gap-1">
                          {(info.personalMinterAddress ||
                            deployer.deployedAddresses?.minterAddress) && (
                            <>
                              <CopyButton
                                address={
                                  info.personalMinterAddress ||
                                  deployer.deployedAddresses!.minterAddress
                                }
                                type="contract"
                                size="xs"
                              />
                              <a
                                href={getExplorerAddressUrl(
                                  network,
                                  info.personalMinterAddress ||
                                    deployer.deployedAddresses!.minterAddress,
                                  explorer,
                                )}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                                title={`View on ${explorer === 'tonviewer' ? 'Tonviewer' : 'Tonscan'}`}
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="bg-secondary/50 border border-border/50 p-2.5 rounded-xl break-all">
                      <span className="text-muted-foreground block">
                        Personal Wallet Address
                      </span>
                      <div className="flex items-center justify-between gap-1 mt-0.5">
                        <span className="font-medium text-foreground">
                          {formatContractAddress(info.personalWalletAddress) ||
                            (deployer.deployedAddresses
                              ? formatContractAddress(
                                  deployer.deployedAddresses
                                    .personalWalletAddress,
                                )
                              : 'None')}
                        </span>
                        <div className="flex items-center gap-1">
                          {(info.personalWalletAddress ||
                            deployer.deployedAddresses
                              ?.personalWalletAddress) && (
                            <>
                              <CopyButton
                                address={
                                  info.personalWalletAddress ||
                                  deployer.deployedAddresses!
                                    .personalWalletAddress
                                }
                                type="contract"
                                size="xs"
                              />
                              <a
                                href={getExplorerAddressUrl(
                                  network,
                                  info.personalWalletAddress ||
                                    deployer.deployedAddresses!
                                      .personalWalletAddress,
                                  explorer,
                                )}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                                title={`View on ${explorer === 'tonviewer' ? 'Tonviewer' : 'Tonscan'}`}
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Minter State: Total Supply & Mintable */}
                    {info.minterDetails && (
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-secondary/50 border border-border/50 p-2.5 rounded-xl">
                          <span className="text-muted-foreground block text-[11px]">
                            Total Supply
                          </span>
                          <span className="font-semibold text-foreground text-sm">
                            {(
                              Number(info.minterDetails.totalSupply) / 1e9
                            ).toFixed(4)}
                          </span>
                        </div>
                        <div className="bg-secondary/50 border border-border/50 p-2.5 rounded-xl">
                          <span className="text-muted-foreground block text-[11px]">
                            Status
                          </span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-1 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            {info.minterDetails.mintable !== false
                              ? 'Mintable'
                              : 'Fixed'}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="bg-secondary/50 border border-border/50 p-2.5 rounded-xl">
                      <span className="text-muted-foreground block">
                        Your Personal Token Balance
                      </span>
                      <span className="font-semibold text-sm text-foreground">
                        {info.personalBalance !== null
                          ? (Number(info.personalBalance) / 1e9).toFixed(4)
                          : '0.0000'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Deploy Wizard */}
          {activeTab === 'deploy' && (
            <div className="space-y-4 bg-card text-card-foreground p-4 border border-border rounded-2xl shadow-sm text-sm">
              <div>
                <h3 className="font-semibold text-base mb-1">
                  Issue Personal Token
                </h3>
                <p className="text-xs text-muted-foreground">
                  Deploy your Personal Token minter and link it to your FI
                  Account in a single transaction.
                </p>
              </div>

              {/* Success state after deployment & registration */}
              {deployer.deployedAddresses ? (
                <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 space-y-4">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    Personal Token Deployed & Registered!
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Your Personal Minter contract has been deployed and linked
                    to your FI Account in a single multi-message transaction.
                  </p>

                  <div className="space-y-2 text-xs bg-background/80 p-3 rounded-xl border border-border">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="min-w-0">
                        <span className="text-muted-foreground block text-[11px]">
                          Minter Address:
                        </span>
                        <span className="font-mono text-foreground font-medium text-xs break-all">
                          {deployer.deployedAddresses.minterAddress}
                        </span>
                      </div>
                      <CopyButton
                        address={deployer.deployedAddresses.minterAddress}
                        type="contract"
                        size="xs"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-2 border-t border-border/50">
                      <div className="min-w-0">
                        <span className="text-muted-foreground block text-[11px]">
                          Personal Wallet Address:
                        </span>
                        <span className="font-mono text-foreground font-medium text-xs break-all">
                          {deployer.deployedAddresses.personalWalletAddress}
                        </span>
                      </div>
                      <CopyButton
                        address={
                          deployer.deployedAddresses.personalWalletAddress
                        }
                        type="contract"
                        size="xs"
                      />
                    </div>
                  </div>

                  {/* Nudge user to configure metadata */}
                  <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-xs text-blue-700 dark:text-blue-300 space-y-1">
                    <p className="font-medium flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-blue-500" />
                      Set Token Name, Symbol & Icon
                    </p>
                    <p className="text-muted-foreground text-[11px]">
                      Your token was deployed with pure deterministic
                      parameters. Configure its branding and metadata now in the
                      Admin tab.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                    <Button
                      onClick={() => {
                        setAdminSubTab('metadata');
                        setActiveTab('admin');
                      }}
                      className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-medium cursor-pointer"
                      data-testid="personal-deploy-goto-metadata-btn"
                    >
                      <Sparkles className="w-4 h-4 mr-1.5" />
                      Set Token Metadata Now
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab('info')}
                      className="w-full sm:w-auto text-xs cursor-pointer"
                    >
                      View Token Overview{' '}
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl border border-border/70 bg-secondary/30 space-y-3">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                      <div className="space-y-1 text-xs leading-relaxed text-muted-foreground">
                        <p>
                          Personal Tokens on BrotherHood are deployed to
                          strictly{' '}
                          <span className="font-semibold text-foreground">
                            deterministic addresses
                          </span>{' '}
                          in the same shard as your wallet.
                        </p>
                        <p>
                          To guarantee predictable addresses across the network,
                          the contract is deployed initially without metadata.
                          Once deployed, you can customize your token's name,
                          symbol, description, and icon at any time in the{' '}
                          <strong className="text-foreground">Admin</strong>{' '}
                          tab.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-border/50 text-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 bg-background/80 p-2.5 rounded-lg border border-border">
                        <div className="min-w-0">
                          <span className="text-muted-foreground block text-[11px]">
                            Deterministic Minter Address
                          </span>
                          <span className="font-mono text-foreground font-medium text-xs break-all">
                            {info.deterministicMinterAddress ||
                              'Calculating...'}
                          </span>
                        </div>
                        {info.deterministicMinterAddress && (
                          <CopyButton
                            address={info.deterministicMinterAddress}
                            type="contract"
                            size="xs"
                          />
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 bg-background/80 p-2.5 rounded-lg border border-border">
                        <div className="min-w-0">
                          <span className="text-muted-foreground block text-[11px]">
                            Expected Personal Wallet Address
                          </span>
                          <span className="font-mono text-foreground font-medium text-xs break-all">
                            {info.expectedPersonalWalletAddress ||
                              'Calculating...'}
                          </span>
                        </div>
                        {info.expectedPersonalWalletAddress && (
                          <CopyButton
                            address={info.expectedPersonalWalletAddress}
                            type="contract"
                            size="xs"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Initial Mint Amount Input */}
                  <div className="space-y-1.5 bg-card p-3 rounded-xl border border-border">
                    <label className="text-xs font-medium text-foreground block">
                      Initial Mint Amount (Tokens to Self)
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="any"
                      value={initialMintAmount}
                      onChange={(e) => setInitialMintAmount(e.target.value)}
                      placeholder="e.g. 1000"
                      className="w-full p-2.5 border border-border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                      data-testid="personal-deploy-initial-mint"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Tokens will be minted directly to your connected wallet upon deployment in the same transaction.
                    </p>
                  </div>

                  <Button
                    onClick={() => deployer.deploy()}
                    disabled={
                      !canOperate ||
                      deployer.isDisabled ||
                      !info.deterministicMinterAddress
                    }
                    loading={deployer.isSending}
                    fullWidth
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5"
                    data-testid="personal-deploy-submit"
                  >
                    <Rocket className="w-4 h-4 mr-2" />
                    Deploy, Mint & Register Personal Token
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Mint Tokens */}
          {activeTab === 'mint' && (
            <div className="space-y-3 bg-card text-card-foreground p-4 border border-border rounded-2xl shadow-sm text-sm">
              <h3 className="font-semibold text-base mb-1">
                Mint Personal Tokens
              </h3>
              {!activeMinter && (
                <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-center justify-between gap-2 text-xs text-amber-700 dark:text-amber-400">
                  <span>
                    No personal minter registered. Deploy your token first or
                    specify a custom minter address.
                  </span>
                  <Button
                    size="sm"
                    onClick={() => setActiveTab('deploy')}
                    className="shrink-0 text-xs"
                  >
                    Deploy Token
                  </Button>
                </div>
              )}
              <div className="space-y-2">
                {activeMinter && (
                  <div className="bg-secondary/40 border border-border/50 p-2.5 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="text-muted-foreground block text-[11px]">
                        Minter Contract
                      </span>
                      <span className="font-mono text-foreground font-medium">
                        {formatContractAddress(activeMinter)}
                      </span>
                    </div>
                    <CopyButton
                      address={activeMinter}
                      type="contract"
                      size="xs"
                    />
                  </div>
                )}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-foreground">
                      Recipient Address
                    </label>
                    {address && (
                      <button
                        type="button"
                        onClick={() =>
                          setRecipient(formatWalletAddress(address, false))
                        }
                        className="text-[11px] text-primary hover:underline font-medium"
                      >
                        Use My Address
                      </button>
                    )}
                  </div>
                  <InputScan
                    value={recipient}
                    onChange={setRecipient}
                    placeholder={`Recipient Address (${network === 'mainnet' ? 'UQ...' : '0Q...'})`}
                    data-testid="personal-mint-recipient"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">
                    Amount to Mint
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Amount to Mint"
                    className="w-full p-2.5 border border-border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="personal-mint-amount"
                  />
                </div>
              </div>
              <Button
                onClick={() => minter.mint()}
                disabled={!canOperate || minter.isDisabled}
                loading={minter.isSending}
                fullWidth
                data-testid="personal-mint-submit"
              >
                Mint Tokens
              </Button>
            </div>
          )}

          {/* Burn Tokens */}
          {activeTab === 'burn' && (
            <div className="space-y-3 bg-card text-card-foreground p-4 border border-border rounded-2xl shadow-sm text-sm">
              <h3 className="font-semibold text-base mb-1">
                Burn Personal Tokens
              </h3>
              {!activePersonalWallet && (
                <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-center justify-between gap-2 text-xs text-amber-700 dark:text-amber-400">
                  <span>
                    No personal wallet registered. Deploy your token first or
                    specify a custom wallet address.
                  </span>
                  <Button
                    size="sm"
                    onClick={() => setActiveTab('deploy')}
                    className="shrink-0 text-xs"
                  >
                    Deploy Token
                  </Button>
                </div>
              )}
              <div className="space-y-2">
                <div className="bg-secondary/40 border border-border/50 p-2.5 rounded-xl space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-[11px]">
                      Minter Contract:
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-foreground font-medium">
                        {formatContractAddress(activeMinter) || 'None'}
                      </span>
                      {activeMinter && (
                        <CopyButton
                          address={activeMinter}
                          type="contract"
                          size="xs"
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-[11px]">
                      Personal Wallet:
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-foreground font-medium">
                        {formatContractAddress(activePersonalWallet) || 'None'}
                      </span>
                      {activePersonalWallet && (
                        <CopyButton
                          address={activePersonalWallet}
                          type="contract"
                          size="xs"
                        />
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">
                    Amount to Burn
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Amount to Burn"
                    className="w-full p-2.5 border border-border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="personal-burn-amount"
                  />
                </div>
              </div>

              {/* Payback vs Simple Burn Checkbox */}
              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-border bg-secondary/30 hover:bg-secondary/50 cursor-pointer select-none transition-colors">
                <input
                  type="checkbox"
                  checked={isPayback}
                  onChange={(e) => setIsPayback(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary accent-primary"
                  data-testid="personal-burn-payback-checkbox"
                />
                <div className="space-y-0.5 text-xs">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    Burn for FI Token Payback
                    <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                      Recommended
                    </span>
                  </span>
                  <p className="text-muted-foreground leading-relaxed">
                    Sends your wallet address with the burn request to trigger
                    an automatic FI token payback from the issuer's account
                    (requires credit maturity). Uncheck for a simple burn
                    without payback.
                  </p>
                </div>
              </label>

              <Button
                onClick={() => burner.burn()}
                disabled={!canOperate || burner.isDisabled}
                loading={burner.isSending}
                fullWidth
                data-testid="personal-burn-submit"
              >
                {isPayback ? 'Burn & Request Payback' : 'Burn Tokens'}
              </Button>
            </div>
          )}

          {/* Addresses Tab: Manage & Link Personal Minter and Wallet */}
          {activeTab === 'addresses' && (
            <div className="space-y-4 bg-card text-card-foreground p-4 border border-border rounded-2xl shadow-sm text-sm">
              <div>
                <h3 className="font-semibold text-base mb-1">
                  Personal Contract Addresses
                </h3>
                <p className="text-xs text-muted-foreground">
                  View and update the Personal Minter and Personal Wallet
                  contracts linked to your FI Account via{' '}
                  <code className="text-[11px] bg-secondary px-1 py-0.5 rounded">
                    ActSetPersonalJetton
                  </code>
                  .
                </p>
              </div>

              {/* Status Overview Card */}
              <div className="space-y-2.5 p-3 bg-secondary/40 border border-border/50 rounded-xl text-xs">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-muted-foreground">
                    On-Chain Deployment:
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-semibold px-2 py-0.5 rounded-full text-[11px] ${
                        info.isDeployedOnChain
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {info.isDeployedOnChain
                        ? 'Deployed On-Chain'
                        : 'Not Deployed'}
                    </span>
                    {!info.isDeployedOnChain && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => deployer.deploy()}
                        disabled={!canOperate || deployer.isDisabled}
                        loading={deployer.isSending}
                        className="text-xs px-2.5 py-1 h-7 font-medium rounded-lg"
                        data-testid="personal-addresses-deploy-button"
                      >
                        <Rocket className="w-3 h-3 mr-1" />
                        Deploy Now
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-muted-foreground">
                    Registration in FI Account:
                  </span>
                  <span
                    className={`font-semibold px-2 py-0.5 rounded-full text-[11px] ${
                      info.isRegistered
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : info.hasMismatchedRegistration
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {info.isRegistered
                      ? 'Registered'
                      : info.hasMismatchedRegistration
                        ? 'Outdated / Mismatched'
                        : 'Not Registered'}
                  </span>
                </div>
                {info.hasMismatchedRegistration && (
                  <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[11px] space-y-1 text-amber-700 dark:text-amber-400">
                    <p className="font-semibold">FI Account Address Mismatch</p>
                    <p className="text-muted-foreground">
                      FI Account points to registered minter{' '}
                      <span className="font-mono text-foreground font-medium">
                        {formatContractAddress(info.registeredMinterAddress)}
                      </span>{' '}
                      instead of current deterministic minter. Register below to
                      link your active token.
                    </p>
                  </div>
                )}
                <div className="pt-2 border-t border-border/50 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground shrink-0">
                      Deterministic Minter:
                    </span>
                    <span className="font-mono font-medium text-foreground truncate max-w-45 sm:max-w-60 text-right">
                      {formatContractAddress(info.deterministicMinterAddress)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground shrink-0">
                      Expected Personal Wallet:
                    </span>
                    <span className="font-mono font-medium text-foreground truncate max-w-45 sm:max-w-60 text-right">
                      {formatContractAddress(
                        info.expectedPersonalWalletAddress,
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Input Form */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <label className="text-xs font-medium text-foreground">
                      Personal Minter Address
                    </label>
                    {info.deterministicMinterAddress && (
                      <button
                        type="button"
                        onClick={() =>
                          setAddressesTabMinter(
                            info.deterministicMinterAddress || '',
                          )
                        }
                        className="text-[11px] text-primary hover:underline font-medium truncate max-w-50"
                      >
                        Use Deterministic Address
                      </button>
                    )}
                  </div>
                  <InputScan
                    value={addressesTabMinter || targetRegisterMinter}
                    onChange={setAddressesTabMinter}
                    placeholder="Enter Personal Minter Address"
                    data-testid="personal-addresses-minter-input"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <label className="text-xs font-medium text-foreground">
                      Personal Wallet Address
                    </label>
                    {info.expectedPersonalWalletAddress && (
                      <button
                        type="button"
                        onClick={() =>
                          setAddressesTabWallet(
                            info.expectedPersonalWalletAddress || '',
                          )
                        }
                        className="text-[11px] text-primary hover:underline font-medium truncate max-w-50"
                      >
                        Use Expected Wallet
                      </button>
                    )}
                  </div>
                  <InputScan
                    value={addressesTabWallet || targetRegisterWallet}
                    onChange={setAddressesTabWallet}
                    placeholder="Enter Personal Wallet Address"
                    data-testid="personal-addresses-wallet-input"
                  />
                </div>

                {!canOperate && (
                  <div className="p-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-xs text-amber-700 dark:text-amber-400">
                    Account is in 1-day activation period or suspended.
                    Transactions cannot be broadcast until activated.
                  </div>
                )}

                <Button
                  onClick={() => registrar.register()}
                  disabled={!canOperate || registrar.isDisabled}
                  loading={registrar.isSending}
                  fullWidth
                  data-testid="personal-addresses-submit"
                >
                  Register / Update Addresses in FI Account
                </Button>
              </div>
            </div>
          )}

          {/* Admin Management */}
          {activeTab === 'admin' && (
            <div className="space-y-4 bg-card text-card-foreground p-4 border border-border rounded-2xl shadow-sm text-sm">
              {/* Sub-tabs header */}
              <div className="flex gap-1 bg-secondary/70 border border-border p-1 rounded-xl text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setAdminSubTab('metadata')}
                  className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    adminSubTab === 'metadata'
                      ? 'bg-card shadow-sm text-foreground font-semibold border border-border'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                  }`}
                  data-testid="personal-admin-subtab-metadata"
                >
                  Metadata
                </button>
                <button
                  type="button"
                  onClick={() => setAdminSubTab('transfer')}
                  className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    adminSubTab === 'transfer'
                      ? 'bg-card shadow-sm text-foreground font-semibold border border-border'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                  }`}
                  data-testid="personal-admin-subtab-transfer"
                >
                  Transfer Admin
                </button>
              </div>

              {/* Transfer Minter Admin */}
              {adminSubTab === 'transfer' && (
                <div className="space-y-2 pt-1">
                  <h3 className="font-semibold text-base">
                    Transfer Minter Admin
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Transfer ownership and administration of this Personal
                    Minter contract to another TON address.
                  </p>
                  <InputScan
                    value={newAdmin}
                    onChange={setNewAdmin}
                    placeholder={`New Admin Address (${network === 'mainnet' ? 'UQ...' : '0Q...'})`}
                    data-testid="personal-admin-new-admin"
                  />
                  <Button
                    onClick={() => admin.changeAdmin()}
                    disabled={!canOperate || admin.isDisabled}
                    loading={admin.isSending}
                    fullWidth
                    data-testid="personal-admin-change-submit"
                  >
                    Transfer Admin
                  </Button>
                </div>
              )}

              {/* Update Metadata */}
              {adminSubTab === 'metadata' && (
                <div className="space-y-3 pt-1">
                  <h3 className="font-semibold text-base">Update Metadata</h3>
                  <p className="text-xs text-muted-foreground">
                    Update your Personal Token onchain metadata. All fields can
                    be customized.
                  </p>
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs font-medium text-foreground block mb-1">
                        Token Name
                      </label>
                      <input
                        type="text"
                        value={adminTokenName}
                        onChange={(e) => setAdminTokenName(e.target.value)}
                        placeholder={
                          info.minterDetails?.name ||
                          'Token Name (e.g. Alice Credit)'
                        }
                        className="w-full p-2.5 border border-border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="personal-meta-name"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground block mb-1">
                        Symbol
                      </label>
                      <input
                        type="text"
                        value={adminTokenSymbol}
                        onChange={(e) => setAdminTokenSymbol(e.target.value)}
                        placeholder={
                          info.minterDetails?.symbol || 'Symbol (e.g. ALICE)'
                        }
                        className="w-full p-2.5 border border-border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="personal-meta-symbol"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground block mb-1">
                        Description{' '}
                        <span className="text-muted-foreground text-[10px] font-normal">
                          (Optional)
                        </span>
                      </label>
                      <textarea
                        value={adminTokenDesc}
                        onChange={(e) => setAdminTokenDesc(e.target.value)}
                        placeholder={
                          info.minterDetails?.description ||
                          DEFAULT_TOKEN_DESCRIPTION
                        }
                        className="w-full p-2.5 border border-border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                        data-testid="personal-meta-desc"
                      />
                    </div>

                    {/* Token Image Picker */}
                    <TokenImagePicker
                      value={adminTokenImage}
                      onChange={setAdminTokenImage}
                      disabled={metadata.isSending}
                    />

                    <Button
                      onClick={() => metadata.changeMetadata()}
                      disabled={!canOperate || metadata.isDisabled}
                      loading={metadata.isSending}
                      fullWidth
                      data-testid="personal-meta-submit"
                    >
                      Update Metadata
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Top Up TONs */}
          {activeTab === 'topup' && (
            <div className="space-y-3 bg-card text-card-foreground p-4 border border-border rounded-2xl shadow-sm text-sm">
              <h3 className="font-semibold text-base mb-1">
                Top Up Contract TON Balance
              </h3>
              <div className="space-y-2">
                <InputScan
                  value={topUpTarget}
                  onChange={setTopUpTarget}
                  placeholder={`Target Contract Address (Default: ${activeMinter || 'None'})`}
                  data-testid="personal-topup-target"
                />
              </div>
              <Button
                onClick={() => topup.topUp()}
                disabled={!canOperate || topup.isDisabled}
                loading={topup.isSending}
                fullWidth
                data-testid="personal-topup-submit"
              >
                Top Up Contract TONs
              </Button>
            </div>
          )}

          {/* Destroy Contracts Tab */}
          {activeTab === 'destroy' && (
            <div className="space-y-4 text-sm">
              {/* Wallet Destroy Card */}
              <div className="bg-card text-card-foreground p-4 border border-border rounded-2xl shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-destructive">
                  <Trash2 className="w-5 h-5 shrink-0" />
                  <h3 className="font-semibold text-base text-foreground">
                    Destroy Personal Wallet
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Permanently destroys your Personal Jetton Wallet contract. Any
                  remaining TON balance in the contract will be reclaimed and
                  returned to your connected wallet address. This action is
                  irreversible.
                </p>

                <div className="space-y-1 text-xs bg-secondary/40 p-2.5 rounded-xl border border-border/50">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground shrink-0">
                      Wallet Contract:
                    </span>
                    <span className="font-mono font-medium text-foreground truncate max-w-50 text-right">
                      {activePersonalWallet
                        ? formatContractAddress(activePersonalWallet)
                        : 'Not configured'}
                    </span>
                  </div>
                </div>

                <Button
                  variant="danger"
                  onClick={() => setIsConfirmWalletOpen(true)}
                  disabled={
                    !canOperate || !activePersonalWallet || destroyer.isSending
                  }
                  loading={destroyer.isSending}
                  fullWidth
                  data-testid="personal-destroy-wallet-trigger"
                >
                  <Trash2 className="w-4 h-4 mr-1.5" />
                  Destroy Personal Wallet
                </Button>
              </div>

              {/* Minter Destroy Card */}
              {isMinterAdmin ? (
                <div className="bg-card text-card-foreground p-4 border border-destructive/30 rounded-2xl shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-destructive">
                    <Trash2 className="w-5 h-5 shrink-0" />
                    <h3 className="font-semibold text-base text-foreground">
                      Destroy Personal Minter
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Permanently destroys the Personal Token Minter contract. You
                    are verified as the Minter Admin. Any remaining TON balance
                    in the minter will be returned to your wallet. Once
                    destroyed, this token cannot be minted or recovered.
                  </p>

                  <div className="space-y-1 text-xs bg-secondary/40 p-2.5 rounded-xl border border-border/50">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground shrink-0">
                        Minter Contract:
                      </span>
                      <span className="font-mono font-medium text-foreground truncate max-w-50 text-right">
                        {activeMinter
                          ? formatContractAddress(activeMinter)
                          : 'Not configured'}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="danger"
                    onClick={() => setIsConfirmMinterOpen(true)}
                    disabled={
                      !canOperate || !activeMinter || destroyer.isSending
                    }
                    loading={destroyer.isSending}
                    fullWidth
                    data-testid="personal-destroy-minter-trigger"
                  >
                    <Trash2 className="w-4 h-4 mr-1.5" />
                    Destroy Personal Minter
                  </Button>
                </div>
              ) : (
                info.minterDetails?.adminAddress && (
                  <div className="p-3 bg-secondary/30 border border-border rounded-xl text-xs text-muted-foreground flex items-center justify-between gap-2">
                    <span>Personal Minter Admin:</span>
                    <span className="font-mono font-medium text-foreground truncate max-w-45">
                      {formatContractAddress(info.minterDetails.adminAddress)}
                    </span>
                  </div>
                )
              )}

              {/* Confirmation Dialog: Wallet */}
              <Dialog
                open={isConfirmWalletOpen}
                onOpenChange={(open) => {
                  setIsConfirmWalletOpen(open);
                  if (!open) {
                    setConfirmDestroyPhrase('');
                    setConfirmDestroyPassword('');
                    setDestroyAuthError('');
                  }
                }}
              >
                <DialogContent className="max-w-md w-[92vw] sm:w-full p-5 gap-4">
                  <DialogHeader>
                    <DialogTitle className="text-destructive flex items-center gap-2">
                      <Trash2 className="w-5 h-5" />
                      Confirm Destroy Personal Wallet
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground pt-1">
                      Are you sure you want to permanently self-destruct your
                      Personal Jetton Wallet contract (
                      {formatContractAddress(activePersonalWallet)})? Any
                      remaining TON balance will be refunded to your address.
                      This cannot be undone.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-3 py-1">
                    {isPasswordSet && (
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-foreground block">
                          Wallet Passcode / Password
                        </label>
                        <input
                          type="password"
                          value={confirmDestroyPassword}
                          onChange={(e) => {
                            setConfirmDestroyPassword(e.target.value);
                            setDestroyAuthError('');
                          }}
                          placeholder="Enter your wallet passcode"
                          className="w-full p-2.5 border border-border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-rose-500"
                          data-testid="personal-destroy-wallet-password"
                        />
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground block">
                        Type{' '}
                        <span className="font-mono font-bold text-rose-500">
                          DESTROY
                        </span>{' '}
                        to confirm
                      </label>
                      <input
                        type="text"
                        value={confirmDestroyPhrase}
                        onChange={(e) => {
                          setConfirmDestroyPhrase(e.target.value);
                          setDestroyAuthError('');
                        }}
                        placeholder="DESTROY"
                        className="w-full p-2.5 border border-border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-rose-500"
                        data-testid="personal-destroy-wallet-phrase"
                      />
                    </div>

                    {destroyAuthError && (
                      <p className="text-xs text-rose-500 font-medium">
                        {destroyAuthError}
                      </p>
                    )}
                  </div>

                  <DialogFooter className="flex-col sm:flex-row gap-2 mt-2">
                    <Button
                      variant="gray"
                      size="sm"
                      onClick={() => setIsConfirmWalletOpen(false)}
                      disabled={destroyer.isSending || isAuthenticatingDestroy}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={async () => {
                        if (
                          confirmDestroyPhrase.trim().toUpperCase() !==
                          'DESTROY'
                        ) {
                          setDestroyAuthError(
                            'Please type DESTROY to confirm.',
                          );
                          return;
                        }
                        if (isPasswordSet) {
                          if (!confirmDestroyPassword) {
                            setDestroyAuthError(
                              'Passcode is required to authorize destruction.',
                            );
                            return;
                          }
                          setIsAuthenticatingDestroy(true);
                          try {
                            const ok = await unlock(confirmDestroyPassword);
                            if (!ok) {
                              setDestroyAuthError('Incorrect passcode.');
                              setIsAuthenticatingDestroy(false);
                              return;
                            }
                          } catch (e) {
                            setDestroyAuthError(
                              e instanceof Error
                                ? e.message
                                : 'Authentication failed.',
                            );
                            setIsAuthenticatingDestroy(false);
                            return;
                          }
                          setIsAuthenticatingDestroy(false);
                        }
                        setIsConfirmWalletOpen(false);
                        await destroyer.destroyWallet();
                      }}
                      loading={destroyer.isSending || isAuthenticatingDestroy}
                      disabled={
                        confirmDestroyPhrase.trim().toUpperCase() !==
                          'DESTROY' ||
                        (isPasswordSet && !confirmDestroyPassword)
                      }
                      data-testid="personal-destroy-wallet-confirm"
                    >
                      Yes, Destroy Wallet
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Confirmation Dialog: Minter */}
              <Dialog
                open={isConfirmMinterOpen}
                onOpenChange={(open) => {
                  setIsConfirmMinterOpen(open);
                  if (!open) {
                    setConfirmDestroyPhrase('');
                    setConfirmDestroyPassword('');
                    setDestroyAuthError('');
                  }
                }}
              >
                <DialogContent className="max-w-md w-[92vw] sm:w-full p-5 gap-4">
                  <DialogHeader>
                    <DialogTitle className="text-destructive flex items-center gap-2">
                      <Trash2 className="w-5 h-5" />
                      Confirm Destroy Personal Minter
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground pt-1">
                      Are you sure you want to permanently self-destruct your
                      Personal Token Minter contract (
                      {formatContractAddress(activeMinter)})? All token
                      operations will terminate and remaining TON balance will
                      be refunded to your admin address. This cannot be undone.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-3 py-1">
                    {isPasswordSet && (
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-foreground block">
                          Wallet Passcode / Password
                        </label>
                        <input
                          type="password"
                          value={confirmDestroyPassword}
                          onChange={(e) => {
                            setConfirmDestroyPassword(e.target.value);
                            setDestroyAuthError('');
                          }}
                          placeholder="Enter your wallet passcode"
                          className="w-full p-2.5 border border-border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-rose-500"
                          data-testid="personal-destroy-minter-password"
                        />
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground block">
                        Type{' '}
                        <span className="font-mono font-bold text-rose-500">
                          DESTROY
                        </span>{' '}
                        to confirm
                      </label>
                      <input
                        type="text"
                        value={confirmDestroyPhrase}
                        onChange={(e) => {
                          setConfirmDestroyPhrase(e.target.value);
                          setDestroyAuthError('');
                        }}
                        placeholder="DESTROY"
                        className="w-full p-2.5 border border-border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-rose-500"
                        data-testid="personal-destroy-minter-phrase"
                      />
                    </div>

                    {destroyAuthError && (
                      <p className="text-xs text-rose-500 font-medium">
                        {destroyAuthError}
                      </p>
                    )}
                  </div>

                  <DialogFooter className="flex-col sm:flex-row gap-2 mt-2">
                    <Button
                      variant="gray"
                      size="sm"
                      onClick={() => setIsConfirmMinterOpen(false)}
                      disabled={destroyer.isSending || isAuthenticatingDestroy}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={async () => {
                        if (
                          confirmDestroyPhrase.trim().toUpperCase() !==
                          'DESTROY'
                        ) {
                          setDestroyAuthError(
                            'Please type DESTROY to confirm.',
                          );
                          return;
                        }
                        if (isPasswordSet) {
                          if (!confirmDestroyPassword) {
                            setDestroyAuthError(
                              'Passcode is required to authorize destruction.',
                            );
                            return;
                          }
                          setIsAuthenticatingDestroy(true);
                          try {
                            const ok = await unlock(confirmDestroyPassword);
                            if (!ok) {
                              setDestroyAuthError('Incorrect passcode.');
                              setIsAuthenticatingDestroy(false);
                              return;
                            }
                          } catch (e) {
                            setDestroyAuthError(
                              e instanceof Error
                                ? e.message
                                : 'Authentication failed.',
                            );
                            setIsAuthenticatingDestroy(false);
                            return;
                          }
                          setIsAuthenticatingDestroy(false);
                        }
                        setIsConfirmMinterOpen(false);
                        await destroyer.destroyMinter();
                      }}
                      loading={destroyer.isSending || isAuthenticatingDestroy}
                      disabled={
                        confirmDestroyPhrase.trim().toUpperCase() !==
                          'DESTROY' ||
                        (isPasswordSet && !confirmDestroyPassword)
                      }
                      data-testid="personal-destroy-minter-confirm"
                    >
                      Yes, Destroy Minter
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </NewLayout>
    </MemberGuard>
  );
};
