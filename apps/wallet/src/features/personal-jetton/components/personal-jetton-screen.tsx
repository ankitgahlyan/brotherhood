/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Address } from '@ton/core';
import {
  AlertCircle,
  CheckCircle2,
  Rocket,
  ExternalLink,
  Trash2,
  Info,
  Coins,
  Wallet,
  ShieldCheck,
  PlusCircle,
  Zap,
  ChevronDown,
  ChevronUp,
  type LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from '@/core/routing';
import { useWallet, useWalletKit, useAuth } from '@demo/wallet-core';
import {
  useExplorer,
  getExplorerAddressUrl,
} from '@/core/explorer/use-explorer';
import { NewLayout } from '@/core/components/shared/new-layout';
import { ScreenHeader } from '@/core/components/shared/screen-header';
import { SwipeableSubTabs } from '@/core/components/shared/swipeable-sub-tabs';
import { ScrollableTabBar } from '@/core/components/ui/tabs';
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
  GAS,
  useBrotherhoodTransaction,
} from '@/features/brotherhood';

import {
  useDeployPersonalJetton,
  DEFAULT_TOKEN_DESCRIPTION,
} from '../hooks/use-deploy-personal-jetton';
import { useRegisterPersonalJetton } from '../hooks/use-register-personal-jetton';
import { SyncStatusButton } from '@/features/dashboard/components/sync-status-button';
import { useMintPersonal } from '../hooks/use-mint-personal';
import { useDestroyPersonal } from '../hooks/use-destroy-personal';
import {
  usePersonalMinterAdmin,
  usePersonalMinterMetadata,
  useTopUp,
} from '../hooks/use-personal-minter-actions';
import { usePersonalJettonInfo } from '../hooks/use-personal-jetton-info';
import { TokenImagePicker } from './token-image-picker';
import { DEFAULT_TOKEN_IMAGE } from '../data/cryptoicons';
import {
  CONTRACT_CODE_HASHES,
  normalizeCodeHash,
} from '@/lib/brotherhood/account-hydrator.worker';
import { useContractState } from '@/lib/brotherhood/contract-cache';
import { brotherhoodSynchronizer } from '@/lib/brotherhood/synchronizer';
import {
  buildRequestUpgradeBody,
  buildPersonalUpgradeBody,
} from '@/lib/brotherhood/deploy';

type Tab = 'info' | 'mint' | 'admin';

type ManageSection = 'metadata' | 'operations' | 'danger';

const PERSONAL_JETTON_TAB_CONFIG: Record<
  Tab,
  {
    label: string;
    icon: LucideIcon | React.ComponentType<{ className?: string }>;
    activeColorClass?: string;
  }
> = {
  info: {
    label: 'Overview',
    icon: Info,
    activeColorClass:
      'bg-card text-blue-500 font-semibold border border-border shadow-xs',
  },
  mint: {
    label: 'Mint',
    icon: Coins,
    activeColorClass:
      'bg-card text-emerald-500 font-semibold border border-border shadow-xs',
  },
  admin: {
    label: 'Manage',
    icon: ShieldCheck,
    activeColorClass:
      'bg-card text-indigo-500 font-semibold border border-border shadow-xs',
  },
};

export const PersonalJettonScreen: React.FC = () => {
  const navigate = useNavigate();
  const walletKit = useWalletKit();
  const { currentWallet, address, savedWallets, activeWalletId } = useWallet();
  const network =
    savedWallets.find((w) => w.id === activeWalletId)?.network ?? 'testnet';
  const { formatContractAddress, formatWalletAddress } = useFormatAddress();
  const { canOperate } = useIsNetworkMember();

  const [activeTab, setActiveTab] = useState<Tab>('info');
  const [manageSection, setManageSection] = useState<ManageSection>('metadata');
  const [showManualLinkInWizard, setShowManualLinkInWizard] = useState(false);

  const { explorer } = useExplorer();

  // Issuance Wizard metadata + initial mint inputs
  const [deployTokenName, setDeployTokenName] = useState('');
  const [deployTokenSymbol, setDeployTokenSymbol] = useState('');
  const [deployTokenDesc, setDeployTokenDesc] = useState('');
  const [deployTokenImage, setDeployTokenImage] = useState(DEFAULT_TOKEN_IMAGE);
  const [initialMintAmount, setInitialMintAmount] = useState('1000');

  // Form inputs for Update Metadata in Manage tab
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

  // Destroy confirmation dialog states & auth gate
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

  const minterAdminAddress = info.minterDetails?.adminAddress;
  const detMinterAddress = info.deterministicMinterAddress;
  const isMinterAdmin = useMemo(() => {
    if (!address) return false;
    try {
      const userAddr = Address.parse(address);
      if (minterAdminAddress) {
        return userAddr.equals(minterAdminAddress);
      }
      if (detMinterAddress && activeMinter) {
        const detMinter = Address.parse(detMinterAddress);
        if (Address.parse(activeMinter).equals(detMinter)) {
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  }, [address, minterAdminAddress, detMinterAddress, activeMinter]);

  // Personal contract upgrade availability check (checks both Minter and Wallet case-insensitively)
  const activeMinterAddress = useMemo(() => {
    if (!activeMinter) return null;
    try {
      return Address.parse(activeMinter);
    } catch {
      return null;
    }
  }, [activeMinter]);

  const activePersonalWalletAddress = useMemo(() => {
    if (!activePersonalWallet) return null;
    try {
      return Address.parse(activePersonalWallet);
    } catch {
      return null;
    }
  }, [activePersonalWallet]);

  const minterCachedState = useContractState<any>(activeMinterAddress, network);
  const walletCachedState = useContractState<any>(
    activePersonalWalletAddress,
    network,
  );
  const isOutdatedChecking = minterCachedState.isLoading;

  const outdatedState = useMemo(() => {
    if (!activeMinterAddress || !info.isDeployedOnChain) {
      return {
        minterOutdated: false,
        walletOutdated: false,
        nextVersion: 2n,
      };
    }
    const minterOutdated = Boolean(
      minterCachedState.codeHash &&
      normalizeCodeHash(minterCachedState.codeHash) !==
        normalizeCodeHash(CONTRACT_CODE_HASHES.personalMinter),
    );
    const walletOutdated = Boolean(
      walletCachedState.codeHash &&
      normalizeCodeHash(walletCachedState.codeHash) !==
        normalizeCodeHash(CONTRACT_CODE_HASHES.personalWallet),
    );
    const nextVersion = BigInt(
      Number(minterCachedState.data?.version ?? 1n) + 1,
    );
    return {
      minterOutdated,
      walletOutdated,
      nextVersion,
    };
  }, [
    activeMinterAddress,
    info.isDeployedOnChain,
    minterCachedState.codeHash,
    minterCachedState.data,
    walletCachedState.codeHash,
  ]);

  const refetchOutdated = useCallback(() => {
    if (!activeMinterAddress) return;
    const addrs = [
      activeMinterAddress,
      ...(activePersonalWalletAddress ? [activePersonalWalletAddress] : []),
    ];
    void brotherhoodSynchronizer.reconcileContracts(addrs, network, {
      force: true,
    });
  }, [activeMinterAddress, activePersonalWalletAddress, network]);

  const isAnyPersonalContractOutdated = Boolean(
    outdatedState &&
    (isMinterAdmin
      ? outdatedState.minterOutdated || outdatedState.walletOutdated
      : outdatedState.walletOutdated),
  );

  const showUpgradeBanner =
    info.isDeployedOnChain &&
    !isOutdatedChecking &&
    isAnyPersonalContractOutdated;

  const { send: sendPersonalUpgradeTx, isSending: isPersonalUpgradeSending } =
    useBrotherhoodTransaction(currentWallet, walletKit);

  const handlePersonalUpgrade = async () => {
    if (!address || !activeMinter || !outdatedState) return;
    try {
      const ownerAddr = Address.parse(address);
      const messages = [];

      if (isMinterAdmin) {
        if (outdatedState.minterOutdated) {
          messages.push({
            toAddress: activeMinter,
            amount: GAS.REQUEST_UPGRADE,
            payload: buildPersonalUpgradeBody({
              walletUpgrade: false,
              walletVersion: outdatedState.nextVersion,
              sender: ownerAddr,
            }),
          });
        }
        if (outdatedState.walletOutdated) {
          messages.push({
            toAddress: activeMinter,
            amount: GAS.REQUEST_UPGRADE,
            payload: buildPersonalUpgradeBody({
              walletUpgrade: true,
              walletVersion: outdatedState.nextVersion,
              sender: ownerAddr,
            }),
          });
        }
      } else if (activePersonalWalletAddress) {
        messages.push({
          toAddress: activeMinter,
          amount: GAS.REQUEST_UPGRADE,
          payload: buildRequestUpgradeBody(activePersonalWalletAddress),
        });
      }

      if (messages.length === 0) return;

      await sendPersonalUpgradeTx(messages);
      toast.success('Personal contract upgrade dispatched!');
      info.refetch();
      refetchOutdated();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upgrade failed');
    }
  };

  const deployer = useDeployPersonalJetton({
    wallet: currentWallet,
    walletKit,
    walletAddress: address ?? null,
    network,
    initialMintAmount,
    metadata: {
      name: deployTokenName,
      symbol: deployTokenSymbol,
      description: deployTokenDesc || DEFAULT_TOKEN_DESCRIPTION,
      image: deployTokenImage,
      decimals: '9',
    },
    onDeploySuccess: () => {
      info.refetch();
      setActiveTab('info');
    },
  });

  const isDeployed =
    info.isDeployedOnChain || Boolean(deployer.deployedAddresses);

  const availableTabs: Tab[] = ['info', 'mint', 'admin'];

  // Effective addresses to register
  const defaultRegisterMinter =
    deployer.deployedAddresses?.minterAddress ||
    info.deterministicMinterAddress ||
    activeMinter ||
    '';

  const defaultRegisterWallet =
    deployer.deployedAddresses?.personalWalletAddress ||
    info.expectedPersonalWalletAddress ||
    activePersonalWallet ||
    '';

  const targetRegisterMinter =
    addressesTabMinter.trim() || defaultRegisterMinter;

  const targetRegisterWallet =
    addressesTabWallet.trim() || defaultRegisterWallet;

  const registrar = useRegisterPersonalJetton({
    wallet: currentWallet,
    walletKit,
    walletAddress: address ?? null,
    personalMinterAddress: targetRegisterMinter,
    personalWalletAddress: targetRegisterWallet,
    network,
    onSuccess: () => {
      setAddressesTabMinter('');
      setAddressesTabWallet('');
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

  const destroyer = useDestroyPersonal({
    wallet: currentWallet,
    walletKit,
    walletAddress: address ?? null,
    personalWalletAddress: activePersonalWallet || null,
    personalMinterAddress: activeMinter || null,
    onSuccess: () => {
      deployer.resetDeployed();
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
    name: adminTokenName.trim() || info.minterDetails?.metadata?.name || '',
    symbol:
      adminTokenSymbol.trim() || info.minterDetails?.metadata?.symbol || '',
    description:
      adminTokenDesc.trim() ||
      info.minterDetails?.metadata?.description ||
      DEFAULT_TOKEN_DESCRIPTION,
    image:
      adminTokenImage ||
      info.minterDetails?.metadata?.image ||
      DEFAULT_TOKEN_IMAGE,
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
        {!isDeployed ? (
          <div className="space-y-4">
            <ActivationBanner />

            {/* Single-View Issuance Wizard when undeployed */}
            <div className="space-y-4 bg-card text-card-foreground p-4 border border-border rounded-2xl shadow-sm text-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-base flex items-center gap-2">
                    <Rocket className="w-4.5 h-4.5 text-primary" />
                    Issue Your Personal Token
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    Configure your token branding, initial supply, and link it
                    to your FI Account in a single unified transaction.
                  </p>
                </div>
              </div>

              {info.isLoading ? (
                <p className="text-muted-foreground text-xs py-6 text-center">
                  Checking on-chain personal token state…
                </p>
              ) : (
                <div className="space-y-3.5">
                  {/* Branding Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-xs font-medium text-foreground block mb-1">
                        Token Name
                      </label>
                      <input
                        type="text"
                        value={deployTokenName}
                        onChange={(e) => setDeployTokenName(e.target.value)}
                        placeholder="e.g. Alice Credit"
                        className="w-full p-2.5 border border-border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="personal-deploy-name"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground block mb-1">
                        Symbol
                      </label>
                      <input
                        type="text"
                        value={deployTokenSymbol}
                        onChange={(e) =>
                          setDeployTokenSymbol(e.target.value.toUpperCase())
                        }
                        placeholder="e.g. ALICE"
                        className="w-full p-2.5 border border-border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="personal-deploy-symbol"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1">
                      Description{' '}
                      <span className="text-muted-foreground text-[10px] font-normal">
                        (Optional)
                      </span>
                    </label>
                    <textarea
                      value={deployTokenDesc}
                      onChange={(e) => setDeployTokenDesc(e.target.value)}
                      placeholder={DEFAULT_TOKEN_DESCRIPTION}
                      className="w-full p-2.5 border border-border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      data-testid="personal-deploy-desc"
                    />
                  </div>

                  <TokenImagePicker
                    value={deployTokenImage}
                    onChange={setDeployTokenImage}
                    disabled={deployer.isSending}
                  />

                  {/* Initial Mint Amount */}
                  <div className="space-y-1.5 bg-secondary/30 p-3 rounded-xl border border-border">
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
                      Minted directly to your personal token wallet upon
                      deployment.
                    </p>
                  </div>

                  {/* Deterministic Address Preview */}
                  <div className="p-3 rounded-xl border border-border/70 bg-secondary/20 space-y-2 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground text-[11px]">
                        Deterministic Minter:
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-foreground font-medium">
                          {info.deterministicMinterAddress
                            ? formatContractAddress(
                                info.deterministicMinterAddress,
                              )
                            : 'Calculating…'}
                        </span>
                        {info.deterministicMinterAddress && (
                          <CopyButton
                            address={info.deterministicMinterAddress}
                            type="contract"
                            size="xs"
                          />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground text-[11px]">
                        Personal Wallet:
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-foreground font-medium">
                          {info.expectedPersonalWalletAddress
                            ? formatContractAddress(
                                info.expectedPersonalWalletAddress,
                              )
                            : 'Calculating…'}
                        </span>
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
                    Issue, Mint & Register Personal Token
                  </Button>

                  {/* Optional Manual Link / Recovery Accordion */}
                  <div className="pt-2 border-t border-border/50">
                    <button
                      type="button"
                      onClick={() => setShowManualLinkInWizard((prev) => !prev)}
                      className="w-full flex items-center justify-between text-xs text-muted-foreground hover:text-foreground py-1 cursor-pointer"
                    >
                      <span>
                        Link an existing minter or manage stale contracts
                      </span>
                      {showManualLinkInWizard ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>

                    {showManualLinkInWizard && (
                      <div className="mt-2.5 space-y-2.5 p-3 rounded-xl bg-secondary/30 border border-border">
                        <InputScan
                          value={addressesTabMinter}
                          onChange={setAddressesTabMinter}
                          enableUsernameResolution={false}
                          placeholder={
                            defaultRegisterMinter
                              ? formatContractAddress(
                                  defaultRegisterMinter,
                                  false,
                                )
                              : 'Personal Minter Address'
                          }
                          data-testid="personal-addresses-minter-input"
                        />
                        <InputScan
                          value={addressesTabWallet}
                          onChange={setAddressesTabWallet}
                          enableUsernameResolution={false}
                          placeholder={
                            defaultRegisterWallet
                              ? formatContractAddress(
                                  defaultRegisterWallet,
                                  false,
                                )
                              : 'Personal Wallet Address'
                          }
                          data-testid="personal-addresses-wallet-input"
                        />
                        <Button
                          size="sm"
                          variant="gray"
                          onClick={() => registrar.register()}
                          disabled={!canOperate || registrar.isDisabled}
                          loading={registrar.isSending}
                          fullWidth
                          data-testid="personal-addresses-submit"
                        >
                          Register Addresses in FI Account
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <SwipeableSubTabs
            tabs={availableTabs}
            activeTab={activeTab}
            onTabChange={(t) => setActiveTab(t as Tab)}
            pinnedHeader={
              <div className="space-y-4 mb-2">
                <ActivationBanner />
              </div>
            }
            stickyTabBar={
              <ScrollableTabBar
                tabs={availableTabs.map((tab) => ({
                  id: tab,
                  label: PERSONAL_JETTON_TAB_CONFIG[tab].label,
                  icon: PERSONAL_JETTON_TAB_CONFIG[tab].icon,
                  testId: `personal-tab-${tab}`,
                  activeColorClass:
                    PERSONAL_JETTON_TAB_CONFIG[tab].activeColorClass,
                }))}
                activeTab={activeTab}
                onTabChange={(t) => setActiveTab(t as Tab)}
              />
            }
          >
            {/* Overview Tab */}
            {activeTab === 'info' && (
              <div className="space-y-3 bg-card text-card-foreground p-4 border border-border rounded-2xl shadow-sm text-sm">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h3 className="font-semibold text-base flex items-center gap-1.5">
                    <Wallet className="w-4 h-4 text-blue-500" />
                    Personal Jetton Overview
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                      info.isRegistered && !info.hasMismatchedRegistration
                        ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                        : 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20'
                    }`}
                  >
                    {info.isRegistered && !info.hasMismatchedRegistration ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        Registered & Matches Calculated
                      </>
                    ) : info.hasMismatchedRegistration ? (
                      <>
                        <AlertCircle className="w-3 h-3" />
                        Registration Mismatch
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3" />
                        Not Registered in FI Account
                      </>
                    )}
                  </span>
                </div>

                {info.isLoading ? (
                  <p className="text-muted-foreground text-xs py-4 text-center">
                    Querying minter & wallet contracts…
                  </p>
                ) : (
                  <div className="space-y-3">
                    {/* Registration form — only shown when NOT registered or mismatched */}
                    {(!info.isRegistered || info.hasMismatchedRegistration) && (
                      <div className="p-3.5 rounded-xl border border-amber-500/40 bg-amber-500/10 space-y-2.5">
                        <div className="flex items-start gap-2.5">
                          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          <div className="text-xs space-y-1">
                            <span className="font-semibold text-amber-700 dark:text-amber-400 block">
                              {info.hasMismatchedRegistration
                                ? 'FI Account Registration Mismatch'
                                : 'Registration Required'}
                            </span>
                            <p className="text-muted-foreground leading-relaxed">
                              {info.hasMismatchedRegistration
                                ? 'Your FI Account points to a legacy minter/wallet address that differs from your calculated deterministic addresses. Update registration below or destroy the legacy contracts in Manage -> Destroy.'
                                : 'Register your Personal Minter and Personal Wallet addresses in your FI Account below.'}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="space-y-1">
                            <label className="text-[11px] font-medium text-foreground block">
                              Personal Minter Address
                            </label>
                            <InputScan
                              value={addressesTabMinter}
                              onChange={setAddressesTabMinter}
                              enableUsernameResolution={false}
                              placeholder={
                                defaultRegisterMinter
                                  ? formatContractAddress(
                                      defaultRegisterMinter,
                                      false,
                                    )
                                  : `Personal Minter (${network === 'mainnet' ? 'EQ...' : 'kQ...'})`
                              }
                              data-testid="personal-addresses-minter-input"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-medium text-foreground block">
                              Personal Wallet Address
                            </label>
                            <InputScan
                              value={addressesTabWallet}
                              onChange={setAddressesTabWallet}
                              enableUsernameResolution={false}
                              placeholder={
                                defaultRegisterWallet
                                  ? formatContractAddress(
                                      defaultRegisterWallet,
                                      false,
                                    )
                                  : `Personal Wallet (${network === 'mainnet' ? 'EQ...' : 'kQ...'})`
                              }
                              data-testid="personal-addresses-wallet-input"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2">
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
                          {info.hasMismatchedRegistration && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => {
                                setManageSection('danger');
                                setActiveTab('admin');
                              }}
                              className="shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-1" />
                              Destroy Legacy Contracts
                            </Button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Personal contract upgrade banner */}
                    {showUpgradeBanner && (
                      <div className="p-3.5 bg-violet-500/10 border border-violet-500/30 rounded-xl flex flex-col gap-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-violet-500/15 border border-violet-500/30 flex items-center justify-center flex-shrink-0 text-violet-500">
                            <Zap className="w-3.5 h-3.5 fill-violet-500/30" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-foreground leading-tight">
                              Contract Upgrade Available
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {isMinterAdmin
                                ? 'New PersonalMinter / PersonalWallet code is available. Upgrade your minter and wallet contracts in one click.'
                                : 'New PersonalWallet code is available. Pull the upgrade from the minter to your personal wallet.'}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          disabled={isPersonalUpgradeSending}
                          onClick={handlePersonalUpgrade}
                          className="w-full text-xs font-semibold py-2 rounded-xl cursor-pointer bg-violet-600 hover:bg-violet-700 text-white"
                          data-testid="personal-upgrade-submit"
                        >
                          {isPersonalUpgradeSending
                            ? 'Upgrading…'
                            : isMinterAdmin
                              ? 'Upgrade Personal Token Contracts'
                              : 'Pull Wallet Upgrade'}
                        </Button>
                      </div>
                    )}

                    {/* Balance & Supply Cards */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-secondary/50 border border-border/50 p-3 rounded-xl">
                        <span className="text-muted-foreground block text-[11px]">
                          Your Balance
                        </span>
                        <span className="font-semibold text-base text-foreground mt-0.5 block">
                          {info.personalBalance !== null
                            ? (Number(info.personalBalance) / 1e9).toFixed(4)
                            : '0.0000'}
                        </span>
                      </div>
                      <div className="bg-secondary/50 border border-border/50 p-3 rounded-xl">
                        <span className="text-muted-foreground block text-[11px]">
                          Total Supply
                        </span>
                        <span className="font-semibold text-base text-foreground mt-0.5 block">
                          {info.minterDetails
                            ? (
                                Number(info.minterDetails.totalSupply) / 1e9
                              ).toFixed(4)
                            : '0.0000'}
                        </span>
                      </div>
                    </div>

                    {/* Addresses & Registration Verification Summary */}
                    <div className="space-y-2 text-xs">
                      <div className="bg-secondary/50 border border-border/50 p-2.5 rounded-xl break-all space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-muted-foreground text-[11px]">
                            Personal Minter (Contract)
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                              info.isRegistered &&
                              !info.hasMismatchedRegistration
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            }`}
                          >
                            {info.isRegistered &&
                            !info.hasMismatchedRegistration
                              ? '✓ Matches Calculated'
                              : info.registeredMinterAddress
                                ? '⚠ Mismatch'
                                : 'Unregistered'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-mono font-medium text-foreground">
                            {formatContractAddress(activeMinter)}
                          </span>
                          {activeMinter && (
                            <div className="flex items-center gap-1">
                              <CopyButton
                                address={activeMinter}
                                type="contract"
                                size="xs"
                              />
                              <a
                                href={getExplorerAddressUrl(
                                  network,
                                  activeMinter,
                                  explorer,
                                )}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                                title="View on Explorer"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          )}
                        </div>
                        {info.hasMismatchedRegistration &&
                          info.deterministicMinterAddress && (
                            <div className="text-[11px] text-muted-foreground pt-1 border-t border-border/40 flex items-center justify-between">
                              <span>Calculated Minter:</span>
                              <span className="font-mono">
                                {formatContractAddress(
                                  info.deterministicMinterAddress,
                                )}
                              </span>
                            </div>
                          )}
                      </div>

                      <div className="bg-secondary/50 border border-border/50 p-2.5 rounded-xl break-all space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-muted-foreground text-[11px]">
                            Personal Wallet (Contract)
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                              info.isRegistered &&
                              !info.hasMismatchedRegistration
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            }`}
                          >
                            {info.isRegistered &&
                            !info.hasMismatchedRegistration
                              ? '✓ Matches Calculated'
                              : info.registeredWalletAddress
                                ? '⚠ Mismatch'
                                : 'Unregistered'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-mono font-medium text-foreground">
                            {formatContractAddress(activePersonalWallet)}
                          </span>
                          {activePersonalWallet && (
                            <div className="flex items-center gap-1">
                              <CopyButton
                                address={activePersonalWallet}
                                type="contract"
                                size="xs"
                              />
                              <a
                                href={getExplorerAddressUrl(
                                  network,
                                  activePersonalWallet,
                                  explorer,
                                )}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                                title="View on Explorer"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          )}
                        </div>
                        {info.hasMismatchedRegistration &&
                          info.expectedPersonalWalletAddress && (
                            <div className="text-[11px] text-muted-foreground pt-1 border-t border-border/40 flex items-center justify-between">
                              <span>Calculated Wallet:</span>
                              <span className="font-mono">
                                {formatContractAddress(
                                  info.expectedPersonalWalletAddress,
                                )}
                              </span>
                            </div>
                          )}
                      </div>

                      {info.minterDetails?.adminAddress && (
                        <div className="bg-secondary/50 border border-border/50 p-2.5 rounded-xl break-all">
                          <span className="text-muted-foreground block text-[11px]">
                            Minter Admin (WalletV5)
                          </span>
                          <div className="flex items-center justify-between gap-1 mt-0.5">
                            <span className="font-mono font-medium text-foreground">
                              {formatWalletAddress(
                                info.minterDetails.adminAddress,
                                true,
                                6,
                              )}
                            </span>
                            <CopyButton
                              address={info.minterDetails.adminAddress}
                              type="wallet"
                              size="xs"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="gray"
                        onClick={() => setActiveTab('mint')}
                        className="text-xs font-medium"
                      >
                        <Coins className="w-3.5 h-3.5 mr-1.5" />
                        Mint Tokens
                      </Button>
                      <Button
                        size="sm"
                        variant="gray"
                        onClick={() => setActiveTab('admin')}
                        className="text-xs font-medium"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                        Manage Token
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mint Tab */}
            {activeTab === 'mint' && (
              <div className="space-y-3 bg-card text-card-foreground p-4 border border-border rounded-2xl shadow-sm text-sm">
                <h3 className="font-semibold text-base mb-1">
                  Mint Personal Tokens
                </h3>
                <div className="space-y-2.5">
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
                      enableUsernameResolution={false}
                      placeholder={`Recipient Address (${network === 'mainnet' ? 'UQ...' : '0Q...'})`}
                      data-testid="personal-mint-recipient"
                      tokenContext={{
                        tokenType: 'JETTON',
                        minterAddress:
                          activeMinter ||
                          info.personalMinterAddress ||
                          undefined,
                        adminAddress: address || undefined,
                      }}
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
                      placeholder="Amount to Mint (e.g. 1)"
                      className="w-full p-2.5 border border-border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                      data-testid="personal-mint-amount"
                    />
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1">
                      <span>
                        New personal wallets require 1 token (1 GRAM) to
                        activate.
                      </span>
                      <button
                        type="button"
                        onClick={() => setAmount('1')}
                        className="text-primary hover:underline font-medium shrink-0 ml-1"
                      >
                        Set 1 (Activation)
                      </button>
                    </div>
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

            {/* Consolidated Manage Tab */}
            {activeTab === 'admin' && (
              <div className="space-y-4 bg-card text-card-foreground p-4 border border-border rounded-2xl shadow-sm text-sm">
                <SwipeableSubTabs
                  tabs={['metadata', 'operations', 'danger']}
                  activeTab={manageSection}
                  onTabChange={(s) => setManageSection(s as ManageSection)}
                  loop={false}
                  className="min-h-0"
                  onBoundaryPrev={() => setActiveTab('mint')}
                  stickyTabBar={
                    <div className="grid grid-cols-3 gap-1 bg-secondary/70 border border-border p-1 rounded-xl text-xs font-medium">
                      <button
                        type="button"
                        onClick={() => setManageSection('metadata')}
                        className={`py-1.5 rounded-lg transition-colors cursor-pointer ${
                          manageSection === 'metadata'
                            ? 'bg-card shadow-sm text-foreground font-semibold border border-border'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                        data-testid="personal-admin-subtab-metadata"
                      >
                        Metadata
                      </button>
                      <button
                        type="button"
                        onClick={() => setManageSection('operations')}
                        className={`py-1.5 rounded-lg transition-colors cursor-pointer ${
                          manageSection === 'operations'
                            ? 'bg-card shadow-sm text-foreground font-semibold border border-border'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                        data-testid="personal-admin-subtab-transfer"
                      >
                        Admin / Gas
                      </button>
                      <button
                        type="button"
                        onClick={() => setManageSection('danger')}
                        className={`py-1.5 rounded-lg transition-colors cursor-pointer ${
                          manageSection === 'danger'
                            ? 'bg-card shadow-sm text-destructive font-semibold border border-destructive/30'
                            : 'text-muted-foreground hover:text-destructive'
                        }`}
                        data-testid="personal-tab-destroy"
                      >
                        Destroy
                      </button>
                    </div>
                  }
                >
                  {/* Section 1: Metadata */}
                  {manageSection === 'metadata' && (
                    <div className="space-y-3 pt-1">
                      <div>
                        <h3 className="font-semibold text-base">
                          Update Token Metadata
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Customize your Personal Token name, symbol,
                          description, and icon on-chain.
                        </p>
                      </div>
                      <div className="space-y-2.5">
                        <div>
                          <label className="text-xs font-medium text-foreground block mb-1">
                            Token Name
                          </label>
                          <input
                            type="text"
                            value={adminTokenName}
                            onChange={(e) => setAdminTokenName(e.target.value)}
                            placeholder={
                              info.minterDetails?.metadata?.name ||
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
                            onChange={(e) =>
                              setAdminTokenSymbol(e.target.value)
                            }
                            placeholder={
                              info.minterDetails?.metadata?.symbol ||
                              'Symbol (e.g. ALICE)'
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
                              info.minterDetails?.metadata?.description ||
                              DEFAULT_TOKEN_DESCRIPTION
                            }
                            className="w-full p-2.5 border border-border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={2}
                            data-testid="personal-meta-desc"
                          />
                        </div>

                        <TokenImagePicker
                          value={
                            adminTokenImage !== DEFAULT_TOKEN_IMAGE
                              ? adminTokenImage
                              : info.minterDetails?.metadata?.image ||
                                DEFAULT_TOKEN_IMAGE
                          }
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

                  {/* Section 2: Admin & Gas Operations */}
                  {manageSection === 'operations' && (
                    <div className="space-y-5 pt-1">
                      {/* Top Up TONs */}
                      <div className="space-y-2.5">
                        <h3 className="font-semibold text-base flex items-center gap-1.5">
                          <PlusCircle className="w-4 h-4 text-amber-500" />
                          Top Up Contract TON Balance
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Send TON to replenish storage and execution gas on
                          your Personal Minter or Wallet contract.
                        </p>
                        <InputScan
                          value={topUpTarget}
                          onChange={setTopUpTarget}
                          enableUsernameResolution={false}
                          placeholder={
                            activeMinter
                              ? `Target Contract Address (Default: ${formatContractAddress(activeMinter, true, 6)})`
                              : 'Target Contract Address'
                          }
                          data-testid="personal-topup-target"
                        />
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

                      {/* Transfer Minter Admin */}
                      <div className="space-y-2.5 pt-4 border-t border-border">
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
                          enableUsernameResolution={false}
                          placeholder={
                            info.minterDetails?.adminAddress
                              ? `Current Admin: ${formatWalletAddress(info.minterDetails.adminAddress, false)}`
                              : `New Admin Address (${network === 'mainnet' ? 'UQ...' : '0Q...'})`
                          }
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
                    </div>
                  )}

                  {/* Section 3: Danger Zone (Destroy) */}
                  {manageSection === 'danger' && (
                    <div className="space-y-4 pt-1">
                      {/* Wallet Destroy Card */}
                      <div className="p-3.5 border border-border rounded-xl space-y-2.5 bg-secondary/20">
                        <div className="flex items-center gap-2 text-destructive">
                          <Trash2 className="w-4.5 h-4.5 shrink-0" />
                          <h3 className="font-semibold text-sm text-foreground">
                            Destroy Personal Wallet
                          </h3>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Permanently destroys your Personal Jetton Wallet
                          contract (
                          {formatContractAddress(activePersonalWallet)}) and
                          reclaims remaining TON balance to your wallet.
                        </p>
                        <Button
                          variant="danger"
                          onClick={() => setIsConfirmWalletOpen(true)}
                          disabled={
                            !canOperate ||
                            !activePersonalWallet ||
                            destroyer.isSending
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
                      {isMinterAdmin && (
                        <div className="p-3.5 border border-destructive/30 rounded-xl space-y-2.5 bg-destructive/5">
                          <div className="flex items-center gap-2 text-destructive">
                            <Trash2 className="w-4.5 h-4.5 shrink-0" />
                            <h3 className="font-semibold text-sm text-foreground">
                              Destroy Personal Minter
                            </h3>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Permanently destroys the Personal Token Minter
                            contract ({formatContractAddress(activeMinter)}) and
                            returns its remaining TON balance to your admin
                            wallet.
                          </p>
                          <Button
                            variant="danger"
                            onClick={() => setIsConfirmMinterOpen(true)}
                            disabled={
                              !canOperate ||
                              !activeMinter ||
                              destroyer.isSending
                            }
                            loading={destroyer.isSending}
                            fullWidth
                            data-testid="personal-destroy-minter-trigger"
                          >
                            <Trash2 className="w-4 h-4 mr-1.5" />
                            Destroy Personal Minter
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </SwipeableSubTabs>
              </div>
            )}
          </SwipeableSubTabs>
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
                Are you sure you want to permanently self-destruct your Personal
                Jetton Wallet contract (
                {formatContractAddress(activePersonalWallet)})? Any remaining
                TON balance will be refunded to your address. This cannot be
                undone.
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
                  if (confirmDestroyPhrase.trim().toUpperCase() !== 'DESTROY') {
                    setDestroyAuthError('Please type DESTROY to confirm.');
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
                  confirmDestroyPhrase.trim().toUpperCase() !== 'DESTROY' ||
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
                Are you sure you want to permanently self-destruct your Personal
                Token Minter contract ({formatContractAddress(activeMinter)})?
                All token operations will terminate and remaining TON balance
                will be refunded to your admin address. This cannot be undone.
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
                  if (confirmDestroyPhrase.trim().toUpperCase() !== 'DESTROY') {
                    setDestroyAuthError('Please type DESTROY to confirm.');
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
                  confirmDestroyPhrase.trim().toUpperCase() !== 'DESTROY' ||
                  (isPasswordSet && !confirmDestroyPassword)
                }
                data-testid="personal-destroy-minter-confirm"
              >
                Yes, Destroy Minter
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </NewLayout>
    </MemberGuard>
  );
};
