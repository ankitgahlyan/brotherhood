/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState } from 'react';
import {
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Rocket,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useNavigate } from '@/core/routing';
import { useWallet, useWalletKit } from '@demo/wallet-core';
import { useExplorer, getExplorerAddressUrl } from '@/core/explorer/use-explorer';
import { NewLayout } from '@/core/components/shared/new-layout';
import { ScreenHeader } from '@/core/components/shared/screen-header';
import { Button } from '@/core/components/ui/button';
import { InputScan } from '@/core/components/ui/input-scan';
import { CopyButton } from '@/core/components/ui/copy-button';
import { useFormatAddress } from '@/core/utils/formatters';
import {
  MemberGuard,
  ActivationBanner,
  useIsNetworkMember,
} from '@/features/brotherhood';
import { isZeroAddress } from '@/lib/brotherhood/ton';

import {
  useDeployPersonalJetton,
  DEFAULT_TOKEN_DESCRIPTION,
} from '../hooks/use-deploy-personal-jetton';
import { useRegisterPersonalJetton } from '../hooks/use-register-personal-jetton';
import { SyncStatusButton } from '@/features/dashboard/components/sync-status-button';
import { useMintPersonal } from '../hooks/use-mint-personal';
import { useBurnPersonal } from '../hooks/use-burn-personal';
import {
  usePersonalMinterAdmin,
  usePersonalMinterMetadata,
  useTopUp,
} from '../hooks/use-personal-minter-actions';
import { usePersonalJettonInfo } from '../hooks/use-personal-jetton-info';
import { TokenImagePicker } from './token-image-picker';
import { DEFAULT_TOKEN_IMAGE } from '../data/cryptoicons';

type Tab = 'info' | 'deploy' | 'mint' | 'burn' | 'addresses' | 'admin' | 'topup';

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

  // Form inputs for Deploy
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [tokenDesc, setTokenDesc] = useState('');
  const [tokenImage, setTokenImage] = useState(DEFAULT_TOKEN_IMAGE);
  const [initialMintAmount, setInitialMintAmount] = useState('');

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
  const [adminRegisterMinter, setAdminRegisterMinter] = useState('');
  const [adminRegisterWallet, setAdminRegisterWallet] = useState('');
  const [addressesTabMinter, setAddressesTabMinter] = useState('');
  const [addressesTabWallet, setAddressesTabWallet] = useState('');

  // Burn tab options
  const [isPayback, setIsPayback] = useState(true);

  const info = usePersonalJettonInfo(address ?? null);

  const isDeployed =
    info.isRegistered ||
    info.isDeployedOnChain ||
    (Boolean(info.personalMinterAddress) &&
      !isZeroAddress(info.personalMinterAddress));

  const availableTabs: Tab[] = isDeployed
    ? ['info', 'mint', 'burn', 'addresses', 'admin', 'topup']
    : ['info', 'deploy', 'mint', 'burn', 'addresses', 'admin', 'topup'];

  // If already deployed and currently on deploy tab, switch to info
  React.useEffect(() => {
    if (isDeployed && activeTab === 'deploy') {
      setActiveTab('info');
    }
  }, [isDeployed, activeTab]);

  const activeMinter =
    info.personalMinterAddress ||
    (info.isDeployedOnChain ? info.deterministicMinterAddress : null) ||
    '';
  const activePersonalWallet =
    info.personalWalletAddress ||
    info.expectedPersonalWalletAddress ||
    '';

  const deployer = useDeployPersonalJetton({
    wallet: currentWallet,
    walletKit,
    walletAddress: address ?? null,
    name: tokenName,
    symbol: tokenSymbol,
    description: tokenDesc,
    image: tokenImage,
    initialMintAmount,
    network,
  });

  // Effective addresses to register
  const targetRegisterMinter =
    addressesTabMinter ||
    adminRegisterMinter ||
    deployer.deployedAddresses?.minterAddress ||
    activeMinter ||
    info.deterministicMinterAddress ||
    '';

  const targetRegisterWallet =
    addressesTabWallet ||
    adminRegisterWallet ||
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

  const admin = usePersonalMinterAdmin({
    wallet: currentWallet,
    walletKit,
    minterAddress: activeMinter,
    newAdminAddress: newAdmin,
  });

  const metadata = usePersonalMinterMetadata({
    wallet: currentWallet,
    walletKit,
    minterAddress: activeMinter,
    name: adminTokenName || tokenName,
    symbol: adminTokenSymbol || tokenSymbol,
    description: adminTokenDesc || tokenDesc,
    image: adminTokenImage || tokenImage,
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
                  {!info.isRegistered && (deployer.deployedAddresses || info.isDeployedOnChain) && (
                    <div className="p-3.5 rounded-xl border border-amber-500/40 bg-amber-500/10 space-y-2.5">
                      <div className="flex items-start gap-2.5">
                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <div className="text-xs space-y-1">
                          <span className="font-semibold text-amber-700 dark:text-amber-400 block">
                            Registration Required
                          </span>
                          <p className="text-muted-foreground leading-relaxed">
                            Your Personal Token minter is deployed on-chain! Register
                            both minter & wallet addresses to your FI Account in
                            a single unified transaction.
                          </p>
                        </div>
                      </div>
                      <div className="space-y-1.5 text-[11px] bg-background/60 p-2 rounded-lg border border-border">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Minter:</span>
                          <span className="font-mono text-foreground font-medium">
                            {formatContractAddress(targetRegisterMinter)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Wallet:</span>
                          <span className="font-mono text-foreground font-medium">
                            {formatContractAddress(targetRegisterWallet)}
                          </span>
                        </div>
                      </div>
                      {!canOperate && (
                        <p className="text-[11px] text-amber-600 dark:text-amber-400">
                          Note: Account is pending 1-day activation delay or suspended. Registration will be enabled once active.
                        </p>
                      )}
                      <Button
                        onClick={() => registrar.register()}
                        disabled={!canOperate || registrar.isDisabled}
                        loading={registrar.isSending}
                        fullWidth
                        size="xs"
                        className="bg-amber-600 hover:bg-amber-700 text-white font-medium"
                        data-testid="personal-register-info-submit"
                      >
                        Register Personal Token to Account
                      </Button>
                    </div>
                  )}

                  {/* Case 2: Not deployed yet */}
                  {!info.isRegistered && !info.isDeployedOnChain && !deployer.deployedAddresses && (
                    <div className="p-4 rounded-xl border border-dashed border-border bg-secondary/30 flex flex-col items-center text-center space-y-2.5 my-2">
                      <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
                        <Rocket className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground text-sm">
                          Personal Token Not Deployed
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5 max-w-xs">
                          You haven't deployed your personal token yet. Deploy it
                          now to issue credit, establish member trust, and borrow
                          in BrotherHood Network.
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
                            deployer.deployedAddresses?.personalWalletAddress) && (
                            <>
                              <CopyButton
                                address={
                                  info.personalWalletAddress ||
                                  deployer.deployedAddresses!.personalWalletAddress
                                }
                                type="contract"
                                size="xs"
                              />
                              <a
                                href={getExplorerAddressUrl(
                                  network,
                                  info.personalWalletAddress ||
                                    deployer.deployedAddresses!.personalWalletAddress,
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
                            {(Number(info.minterDetails.totalSupply) / 1e9).toFixed(4)}
                          </span>
                        </div>
                        <div className="bg-secondary/50 border border-border/50 p-2.5 rounded-xl">
                          <span className="text-muted-foreground block text-[11px]">
                            Status
                          </span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-1 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            {info.minterDetails.mintable !== false ? 'Mintable' : 'Fixed'}
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
                  Deploy your Personal Token minter contract. Name and symbol are
                  required. Description and token icon are optional with
                  sensible defaults.
                </p>
              </div>

              {/* Success & Registration step after deployment */}
              {deployer.deployedAddresses ? (
                <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    Personal Token Minter Deployed!
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Contract created at{' '}
                    <span className="font-mono font-medium text-foreground">
                      {formatContractAddress(
                        deployer.deployedAddresses.minterAddress,
                      )}
                    </span>
                    . Now register both your Personal Minter and Personal Wallet
                    to your Account (FI Wallet) in a single unified message.
                  </p>

                  <div className="space-y-1.5 text-xs bg-background/70 p-2.5 rounded-lg border border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Minter:</span>
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-foreground font-medium">
                          {formatContractAddress(
                            deployer.deployedAddresses.minterAddress,
                          )}
                        </span>
                        <CopyButton
                          address={deployer.deployedAddresses.minterAddress}
                          type="contract"
                          size="xs"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Personal Wallet:</span>
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-foreground font-medium">
                          {formatContractAddress(
                            deployer.deployedAddresses.personalWalletAddress,
                          )}
                        </span>
                        <CopyButton
                          address={
                            deployer.deployedAddresses.personalWalletAddress
                          }
                          type="contract"
                          size="xs"
                        />
                      </div>
                    </div>
                  </div>

                  {info.isRegistered ? (
                    <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex items-center justify-between">
                      <span>✓ Successfully Registered to Account!</span>
                      <Button
                        size="xs"
                        onClick={() => setActiveTab('info')}
                        className="text-xs"
                      >
                        View Overview <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => registrar.register()}
                      disabled={!canOperate || registrar.isDisabled}
                      loading={registrar.isSending}
                      fullWidth
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                      data-testid="personal-deploy-register-btn"
                    >
                      Register to Account (ActSetPersonalJetton)
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground flex items-center gap-1">
                      Token Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={tokenName}
                      onChange={(e) => setTokenName(e.target.value)}
                      placeholder="Token Name (e.g. Alice Credit)"
                      className="w-full p-2.5 border border-border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                      data-testid="personal-deploy-name"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground flex items-center gap-1">
                      Symbol <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={tokenSymbol}
                      onChange={(e) => setTokenSymbol(e.target.value)}
                      placeholder="Symbol (e.g. ALICE)"
                      className="w-full p-2.5 border border-border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                      data-testid="personal-deploy-symbol"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">
                      Description <span className="text-muted-foreground text-[10px] font-normal">(Optional)</span>
                    </label>
                    <textarea
                      value={tokenDesc}
                      onChange={(e) => setTokenDesc(e.target.value)}
                      placeholder={DEFAULT_TOKEN_DESCRIPTION}
                      className="w-full p-2.5 border border-border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      data-testid="personal-deploy-desc"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground flex items-center justify-between">
                      <span>Initial Mint Amount</span>
                      <span className="text-muted-foreground text-[10px] font-normal">
                        (Optional, defaults to 0)
                      </span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={initialMintAmount}
                      onChange={(e) => setInitialMintAmount(e.target.value)}
                      placeholder="e.g. 1000 (tokens minted to you upon deploy)"
                      className="w-full p-2.5 border border-border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                      data-testid="personal-deploy-initial-mint"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Tokens will be minted directly to your connected wallet in the deployment transaction.
                    </p>
                  </div>

                  {/* Token Image Picker with Cryptofonts icon browser & TON default */}
                  <TokenImagePicker
                    value={tokenImage}
                    onChange={setTokenImage}
                    disabled={deployer.isSending}
                  />

                  <Button
                    onClick={() => deployer.deploy()}
                    disabled={!canOperate || deployer.isDisabled}
                    loading={deployer.isSending}
                    fullWidth
                    data-testid="personal-deploy-submit"
                  >
                    Deploy Personal Token
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
                    No personal minter registered. Deploy your token first or specify a custom minter address.
                  </span>
                  <Button
                    size="xs"
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
                    <CopyButton address={activeMinter} type="contract" size="xs" />
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
                    No personal wallet registered. Deploy your token first or specify a custom wallet address.
                  </span>
                  <Button
                    size="xs"
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
                    <span className="text-muted-foreground text-[11px]">Minter Contract:</span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-foreground font-medium">
                        {formatContractAddress(activeMinter) || 'None'}
                      </span>
                      {activeMinter && (
                        <CopyButton address={activeMinter} type="contract" size="xs" />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-[11px]">Personal Wallet:</span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-foreground font-medium">
                        {formatContractAddress(activePersonalWallet) || 'None'}
                      </span>
                      {activePersonalWallet && (
                        <CopyButton address={activePersonalWallet} type="contract" size="xs" />
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
                    Sends your wallet address with the burn request to trigger an automatic FI token payback from the issuer's account (requires credit maturity). Uncheck for a simple burn without payback.
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
                  View and update the Personal Minter and Personal Wallet contracts linked to your FI Account via <code className="text-[11px] bg-secondary px-1 py-0.5 rounded">ActSetPersonalJetton</code>.
                </p>
              </div>

              {/* Status Overview Card */}
              <div className="space-y-2 p-3 bg-secondary/40 border border-border/50 rounded-xl text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">On-Chain Deployment:</span>
                  <span
                    className={`font-semibold px-2 py-0.5 rounded-full text-[11px] ${
                      info.isDeployedOnChain
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {info.isDeployedOnChain ? 'Deployed On-Chain' : 'Not Deployed'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Registration in FI Account:</span>
                  <span
                    className={`font-semibold px-2 py-0.5 rounded-full text-[11px] ${
                      info.isRegistered
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {info.isRegistered ? 'Registered' : 'Not Registered'}
                  </span>
                </div>
                <div className="pt-1.5 border-t border-border/50 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Deterministic Minter:</span>
                    <span className="font-mono font-medium text-foreground">
                      {formatContractAddress(info.deterministicMinterAddress)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Expected Personal Wallet:</span>
                    <span className="font-mono font-medium text-foreground">
                      {formatContractAddress(info.expectedPersonalWalletAddress)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Input Form */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-foreground">
                      Personal Minter Address
                    </label>
                    {info.deterministicMinterAddress && (
                      <button
                        type="button"
                        onClick={() =>
                          setAddressesTabMinter(info.deterministicMinterAddress || '')
                        }
                        className="text-[11px] text-primary hover:underline font-medium"
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
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-foreground">
                      Personal Wallet Address
                    </label>
                    {info.expectedPersonalWalletAddress && (
                      <button
                        type="button"
                        onClick={() =>
                          setAddressesTabWallet(info.expectedPersonalWalletAddress || '')
                        }
                        className="text-[11px] text-primary hover:underline font-medium"
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
                    Account is in 1-day activation period or suspended. Transactions cannot be broadcast until activated.
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
              {/* Register / Link Personal Jetton to FI Account */}
              <div className="space-y-2">
                <h3 className="font-semibold text-base">
                  Register Personal Jetton to Account
                </h3>
                <p className="text-xs text-muted-foreground">
                  Send a unified <code className="text-[11px] bg-secondary px-1 py-0.5 rounded">ActSetPersonalJetton</code> message to register both minter and wallet addresses in your FI Wallet contract.
                </p>
                <div className="space-y-2">
                  <InputScan
                    value={adminRegisterMinter}
                    onChange={setAdminRegisterMinter}
                    placeholder={`Personal Minter Address (Default: ${activeMinter || 'None'})`}
                    data-testid="personal-admin-register-minter"
                  />
                  <InputScan
                    value={adminRegisterWallet}
                    onChange={setAdminRegisterWallet}
                    placeholder="Personal Wallet Address (Leave blank to auto-calculate)"
                    data-testid="personal-admin-register-wallet"
                  />
                  <Button
                    onClick={() => registrar.register()}
                    disabled={!canOperate || registrar.isDisabled}
                    loading={registrar.isSending}
                    fullWidth
                    data-testid="personal-admin-register-submit"
                  >
                    Register to Account
                  </Button>
                </div>
              </div>

              <hr className="border-border" />

              <div className="space-y-2">
                <h3 className="font-semibold text-base">
                  Transfer Minter Admin
                </h3>
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

              <hr className="border-border" />

              <div className="space-y-3">
                <h3 className="font-semibold text-base">Update Metadata</h3>
                <p className="text-xs text-muted-foreground">
                  Update your Personal Token onchain metadata. All fields can be customized.
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
                      placeholder={tokenName || 'Token Name'}
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
                      placeholder={tokenSymbol || 'Symbol'}
                      className="w-full p-2.5 border border-border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                      data-testid="personal-meta-symbol"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1">
                      Description <span className="text-muted-foreground text-[10px] font-normal">(Optional)</span>
                    </label>
                    <textarea
                      value={adminTokenDesc}
                      onChange={(e) => setAdminTokenDesc(e.target.value)}
                      placeholder={tokenDesc || DEFAULT_TOKEN_DESCRIPTION}
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
        </div>
      </NewLayout>
    </MemberGuard>
  );
};
