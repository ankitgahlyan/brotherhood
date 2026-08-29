/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState } from 'react';
import { useNavigate } from '@/core/routing';
import { useWallet, useWalletKit } from '@demo/wallet-core';
import { NewLayout } from '@/core/components/shared/new-layout';
import { ScreenHeader } from '@/core/components/shared/screen-header';
import { Button } from '@/core/components/ui/button';
import { InputScan } from '@/core/components/ui/input-scan';

import { useDeployPersonalJetton } from '../hooks/use-deploy-personal-jetton';
import { useMintPersonal } from '../hooks/use-mint-personal';
import { useBurnPersonal } from '../hooks/use-burn-personal';
import {
  usePersonalMinterAdmin,
  usePersonalMinterMetadata,
  useTopUp,
} from '../hooks/use-personal-minter-actions';
import { usePersonalJettonInfo } from '../hooks/use-personal-jetton-info';

type Tab = 'info' | 'deploy' | 'mint' | 'burn' | 'admin' | 'topup';

export const PersonalJettonScreen: React.FC = () => {
  const navigate = useNavigate();
  const walletKit = useWalletKit();
  const { currentWallet, address, savedWallets, activeWalletId } = useWallet();
  const network =
    savedWallets.find((w) => w.id === activeWalletId)?.network ?? 'testnet';

  const [activeTab, setActiveTab] = useState<Tab>('info');

  // Form inputs
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [tokenDesc, setTokenDesc] = useState('');
  const [tokenImage, setTokenImage] = useState('');
  const [customMinterAddr, setCustomMinterAddr] = useState('');
  const [customPersonalWalletAddr, setCustomPersonalWalletAddr] = useState('');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [newAdmin, setNewAdmin] = useState('');
  const [topUpTarget, setTopUpTarget] = useState('');

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
    name: tokenName,
    symbol: tokenSymbol,
    description: tokenDesc,
    image: tokenImage,
  });

  const topup = useTopUp({
    wallet: currentWallet,
    walletKit,
    targetAddress: topUpTarget || activeMinter,
  });

  return (
    <NewLayout
      header={
        <ScreenHeader
          title="Personal Token Economy"
          onBack={() => navigate('/wallet')}
        />
      }
    >
      <div className="space-y-4">
        {/* Tabs */}
        <div className="flex flex-wrap gap-1 bg-secondary/70 border border-border p-1 rounded-xl text-xs font-medium">
          {(['info', 'deploy', 'mint', 'burn', 'admin', 'topup'] as Tab[]).map(
            (tab) => (
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
            ),
          )}
        </div>

        {/* Info Tab */}
        {activeTab === 'info' && (
          <div className="space-y-3 bg-card text-card-foreground p-4 border border-border rounded-2xl shadow-sm text-sm">
            <h3 className="font-semibold text-base mb-2">
              Personal Jetton Overview
            </h3>
            {info.isLoading ? (
              <p className="text-muted-foreground text-xs">
                Querying minter & wallet contracts…
              </p>
            ) : (
              <div className="space-y-2 text-xs">
                <div className="bg-secondary/50 border border-border/50 p-2.5 rounded-xl break-all">
                  <span className="text-muted-foreground block">
                    Personal Minter Address
                  </span>
                  <span className="font-medium text-foreground">
                    {info.personalMinterAddress || 'None deployed yet'}
                  </span>
                </div>
                <div className="bg-secondary/50 border border-border/50 p-2.5 rounded-xl break-all">
                  <span className="text-muted-foreground block">
                    Personal Wallet Address
                  </span>
                  <span className="font-medium text-foreground">
                    {info.personalWalletAddress || 'None'}
                  </span>
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
            )}
          </div>
        )}

        {/* Deploy Wizard */}
        {activeTab === 'deploy' && (
          <div className="space-y-3 bg-card text-card-foreground p-4 border border-border rounded-2xl shadow-sm text-sm">
            <h3 className="font-semibold text-base mb-1">
              Issue Personal Token
            </h3>
            <div className="space-y-2">
              <input
                type="text"
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
                placeholder="Token Name (e.g. Alice Credit)"
                className="w-full p-2.5 border border-border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-testid="personal-deploy-name"
              />
              <input
                type="text"
                value={tokenSymbol}
                onChange={(e) => setTokenSymbol(e.target.value)}
                placeholder="Symbol (e.g. ALICE)"
                className="w-full p-2.5 border border-border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-testid="personal-deploy-symbol"
              />
              <textarea
                value={tokenDesc}
                onChange={(e) => setTokenDesc(e.target.value)}
                placeholder="Description"
                className="w-full p-2.5 border border-border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                data-testid="personal-deploy-desc"
              />
              <input
                type="text"
                value={tokenImage}
                onChange={(e) => setTokenImage(e.target.value)}
                placeholder="Image URL (https://...)"
                className="w-full p-2.5 border border-border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-testid="personal-deploy-image"
              />
            </div>
            <Button
              onClick={() => deployer.deploy()}
              disabled={deployer.isDisabled}
              loading={deployer.isSending}
              fullWidth
              data-testid="personal-deploy-submit"
            >
              Deploy & Link Minter
            </Button>
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
                placeholder="Recipient Address (0Q...)"
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
              disabled={minter.isDisabled}
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
              disabled={burner.isDisabled}
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
            <div className="space-y-2">
              <h3 className="font-semibold text-base">Transfer Minter Admin</h3>
              <InputScan
                value={newAdmin}
                onChange={setNewAdmin}
                placeholder="New Admin Address (0Q...)"
                data-testid="personal-admin-new-admin"
              />
              <Button
                onClick={() => admin.changeAdmin()}
                disabled={admin.isDisabled}
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
                disabled={metadata.isDisabled}
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
              disabled={topup.isDisabled}
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
  );
};
