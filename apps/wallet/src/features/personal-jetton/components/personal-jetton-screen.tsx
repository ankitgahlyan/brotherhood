/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState } from 'react';
import { Sparkles, AlertCircle, CheckCircle2, Rocket, ArrowRight } from 'lucide-react';
import { useNavigate } from '@/core/routing';
import { useWallet, useWalletKit } from '@demo/wallet-core';
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

type Tab = 'info' | 'deploy' | 'mint' | 'burn' | 'admin' | 'topup';

export const PersonalJettonScreen: React.FC = () => {
  const navigate = useNavigate();
  const walletKit = useWalletKit();
  const { currentWallet, address, savedWallets, activeWalletId } = useWallet();
  const network =
    savedWallets.find((w) => w.id === activeWalletId)?.network ?? 'testnet';
  const { formatContractAddress } = useFormatAddress();
  const { canOperate } = useIsNetworkMember();

  const [activeTab, setActiveTab] = useState<Tab>('info');

  // Form inputs for Deploy
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [tokenDesc, setTokenDesc] = useState('');
  const [tokenImage, setTokenImage] = useState(DEFAULT_TOKEN_IMAGE);

  // Manual inputs for other actions
  const [customMinterAddr, setCustomMinterAddr] = useState('');
  const [customPersonalWalletAddr, setCustomPersonalWalletAddr] = useState('');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [newAdmin, setNewAdmin] = useState('');
  const [topUpTarget, setTopUpTarget] = useState('');

  // Explicit registration overrides (in Admin tab)
  const [adminRegisterMinter, setAdminRegisterMinter] = useState('');
  const [adminRegisterWallet, setAdminRegisterWallet] = useState('');

  const info = usePersonalJettonInfo(address ?? null);

  const activeMinter = customMinterAddr || info.personalMinterAddress || '';
  const activePersonalWallet =
    customPersonalWalletAddr || info.personalWalletAddress || '';

  const deployer = useDeployPersonalJetton({
    wallet: currentWallet,
    walletKit,
    walletAddress: address ?? null,
    name: tokenName,
    symbol: tokenSymbol,
    description: tokenDesc,
    image: tokenImage,
    network,
  });

  // Effective addresses to register
  const targetRegisterMinter =
    adminRegisterMinter ||
    deployer.deployedAddresses?.minterAddress ||
    customMinterAddr ||
    '';

  const targetRegisterWallet =
    adminRegisterWallet ||
    deployer.deployedAddresses?.personalWalletAddress ||
    customPersonalWalletAddr ||
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
    personalWalletAddress: activePersonalWallet,
    amount,
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
    name: tokenName,
    symbol: tokenSymbol,
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
            {(
              ['info', 'deploy', 'mint', 'burn', 'admin', 'topup'] as Tab[]
            ).map((tab) => (
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
                  {/* Case 1: Deployed recently but not registered */}
                  {!info.isRegistered && deployer.deployedAddresses && (
                    <div className="p-3.5 rounded-xl border border-amber-500/40 bg-amber-500/10 space-y-2.5">
                      <div className="flex items-start gap-2.5">
                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <div className="text-xs space-y-1">
                          <span className="font-semibold text-amber-700 dark:text-amber-400 block">
                            Registration Required
                          </span>
                          <p className="text-muted-foreground leading-relaxed">
                            Your Personal Token minter is deployed! Register
                            both minter & wallet addresses to your FI Account in
                            a single unified transaction.
                          </p>
                        </div>
                      </div>
                      <div className="space-y-1.5 text-[11px] bg-background/60 p-2 rounded-lg border border-border">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Minter:</span>
                          <span className="font-mono text-foreground font-medium">
                            {formatContractAddress(
                              deployer.deployedAddresses.minterAddress,
                            )}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Wallet:</span>
                          <span className="font-mono text-foreground font-medium">
                            {formatContractAddress(
                              deployer.deployedAddresses.personalWalletAddress,
                            )}
                          </span>
                        </div>
                      </div>
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
                  {!info.isRegistered && !deployer.deployedAddresses && (
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
                        {(info.personalMinterAddress ||
                          deployer.deployedAddresses?.minterAddress) && (
                          <CopyButton
                            address={
                              info.personalMinterAddress ||
                              deployer.deployedAddresses!.minterAddress
                            }
                            type="contract"
                            size="xs"
                          />
                        )}
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
                        {(info.personalWalletAddress ||
                          deployer.deployedAddresses?.personalWalletAddress) && (
                          <CopyButton
                            address={
                              info.personalWalletAddress ||
                              deployer.deployedAddresses!.personalWalletAddress
                            }
                            type="contract"
                            size="xs"
                          />
                        )}
                      </div>
                    </div>

                    <div className="bg-secondary/50 border border-border/50 p-2.5 rounded-xl">
                      <span className="text-muted-foreground block">
                        Personal Token Balance
                      </span>
                      <span className="font-medium font-semibold text-sm text-foreground">
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
              <div className="space-y-2">
                <InputScan
                  value={customMinterAddr}
                  onChange={setCustomMinterAddr}
                  placeholder={`Minter Address (Default: ${activeMinter || 'None'})`}
                  data-testid="personal-mint-minter"
                />
                <InputScan
                  value={recipient}
                  onChange={setRecipient}
                  placeholder={`Recipient Address (${network === 'mainnet' ? 'UQ...' : '0Q...'})`}
                  data-testid="personal-mint-recipient"
                />
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Amount to Mint"
                  className="w-full p-2.5 border border-border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="personal-mint-amount"
                />
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
              <div className="space-y-2">
                <InputScan
                  value={customPersonalWalletAddr}
                  onChange={setCustomPersonalWalletAddr}
                  placeholder={`Personal Wallet Address (Default: ${activePersonalWallet || 'None'})`}
                  data-testid="personal-burn-wallet-addr"
                />
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Amount to Burn"
                  className="w-full p-2.5 border border-border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="personal-burn-amount"
                />
              </div>
              <Button
                onClick={() => burner.burn()}
                disabled={!canOperate || burner.isDisabled}
                loading={burner.isSending}
                fullWidth
                data-testid="personal-burn-submit"
              >
                Burn Tokens
              </Button>
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

              <div className="space-y-2">
                <h3 className="font-semibold text-base">Update Metadata</h3>
                <input
                  type="text"
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                  placeholder="New Name"
                  className="w-full p-2.5 border border-border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="personal-meta-name"
                />
                <input
                  type="text"
                  value={tokenSymbol}
                  onChange={(e) => setTokenSymbol(e.target.value)}
                  placeholder="New Symbol"
                  className="w-full p-2.5 border border-border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="personal-meta-symbol"
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
