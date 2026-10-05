/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useMemo, useState } from 'react';
import { ChevronRight, EyeOff, Search, Coins, Image } from 'lucide-react';
import { RefreshButton } from '@/core/components/ui/refresh-button';
import { useNavigate } from '@/core/routing';
import { useJettons, useNfts, usePreferences } from '@demo/wallet-core';

import {
  AddTokenModal,
  AssetDetailsModal,
  AssetRow,
  AssetRowSkeleton,
  useAssetRows,
} from '@/features/assets';
import type { AssetRowData } from '@/features/assets';
import { NftsCard } from '@/features/nft';
import { SwipeableSubTabs } from '@/core/components/shared/swipeable-sub-tabs';

const JETTON_SLOTS = 5;

export const DashboardAssets: React.FC = () => {
  const navigate = useNavigate();
  const { jettonRows, hiddenJettonRows, assetsReady } = useAssetRows();
  const { loadUserJettons } = useJettons();
  const { refreshNfts } = useNfts();

  const { viewMode } = usePreferences();
  const isPictorial = viewMode === 'icons_only';

  const [assetTab, setAssetTab] = useState<'tokens' | 'nfts'>('tokens');
  const [selectedAsset, setSelectedAsset] = useState<AssetRowData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const handleAssetClick = (asset: AssetRowData) => {
    setSelectedAsset(asset);
    setIsModalOpen(true);
  };

  // Preview: up to JETTON_SLOTS held member jettons or all if showAll is true
  const displayedJettons = useMemo<AssetRowData[]>(() => {
    if (showAll) {
      return jettonRows;
    }
    return jettonRows.slice(0, JETTON_SLOTS);
  }, [jettonRows, showAll]);

  const hasMoreJettons = jettonRows.length > JETTON_SLOTS;

  return (
    <section>
      <div className="flex items-center justify-between gap-1.5 mb-3 min-w-0">
        <div
          role="tablist"
          aria-label="Dashboard Asset Type"
          className="flex items-center gap-1 bg-secondary/80 p-1 rounded-2xl border border-border/70 min-w-0 shrink"
        >
          <button
            type="button"
            role="tab"
            aria-selected={assetTab === 'tokens'}
            onClick={() => setAssetTab('tokens')}
            aria-label="Tokens"
            title="Tokens"
            className={`inline-flex items-center justify-center gap-1.5 min-h-[36px] px-2.5 sm:px-3.5 py-1 rounded-xl text-xs sm:text-sm transition-all cursor-pointer active:scale-[0.97] min-w-0 ${
              assetTab === 'tokens'
                ? 'bg-card text-foreground shadow-sm font-bold border border-border/80 ring-1 ring-amber-500/20'
                : 'text-muted-foreground hover:text-foreground font-semibold hover:bg-secondary/60'
            }`}
            data-testid="dashboard-tab-tokens"
          >
            <Coins
              className={`w-4 h-4 shrink-0 ${
                assetTab === 'tokens'
                  ? 'text-amber-500 stroke-[2.2]'
                  : 'text-amber-500/75'
              }`}
              aria-hidden="true"
            />
            {isPictorial ? (
              <span className="sr-only">Tokens</span>
            ) : (
              <span className="truncate">Tokens</span>
            )}
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={assetTab === 'nfts'}
            onClick={() => {
              setAssetTab('nfts');
            }}
            aria-label="NFTs"
            title="NFTs"
            className={`inline-flex items-center justify-center gap-1.5 min-h-[36px] px-2.5 sm:px-3.5 py-1 rounded-xl text-xs sm:text-sm transition-all cursor-pointer active:scale-[0.97] min-w-0 ${
              assetTab === 'nfts'
                ? 'bg-card text-foreground shadow-sm font-bold border border-border/80 ring-1 ring-purple-500/20'
                : 'text-muted-foreground hover:text-foreground font-semibold hover:bg-secondary/60'
            }`}
            data-testid="dashboard-tab-nfts"
          >
            <Image
              className={`w-4 h-4 shrink-0 ${
                assetTab === 'nfts'
                  ? 'text-purple-500 stroke-[2.2]'
                  : 'text-purple-500/75'
              }`}
              aria-hidden="true"
            />
            {isPictorial ? (
              <span className="sr-only">NFTs</span>
            ) : (
              <span className="truncate">NFTs</span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() =>
              navigate(assetTab === 'tokens' ? '/wallet/assets' : '/wallet/nft')
            }
            className="inline-flex items-center gap-0.5 min-h-[36px] px-2 sm:px-3 py-1.5 rounded-xl bg-secondary/80 hover:bg-secondary text-xs font-semibold text-foreground border border-border/60 transition-colors cursor-pointer active:scale-95 shrink-0"
            aria-label="View all assets"
          >
            <span>All</span>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          </button>

          <RefreshButton
            iconOnly
            onRefresh={async () => {
              if (assetTab === 'tokens') {
                await loadUserJettons(undefined, true);
              } else {
                const { clearMyDomainsSessionCache } =
                  await import('@/features/dns/hooks/use-my-domains');
                const { clearAccountStatesCache } =
                  await import('@/lib/brotherhood/account-state-hydrator');
                clearMyDomainsSessionCache();
                clearAccountStatesCache();
                await refreshNfts();
              }
            }}
            className="rounded-xl bg-secondary/80 border border-border/60 p-2 min-h-[36px] min-w-[36px] flex items-center justify-center shrink-0"
            title={
              assetTab === 'tokens'
                ? 'Refresh and discover tokens'
                : 'Refresh NFTs'
            }
            ariaLabel={
              assetTab === 'tokens'
                ? 'Refresh and discover tokens'
                : 'Refresh NFTs'
            }
            testId="dashboard-assets-refresh-btn"
          />
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-xl bg-secondary/80 border border-border/60 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer active:scale-95 shrink-0"
            title="Inspect address, .bro domain, or @username & add Watch-Only wallet"
            aria-label="Inspect address or add Watch-Only wallet"
            data-testid="dashboard-assets-add-button"
          >
            <Search className="w-4 h-4 shrink-0" />
          </button>
        </div>
      </div>

      <SwipeableSubTabs
        tabs={['tokens', 'nfts'] as const}
        activeTab={assetTab}
        onTabChange={(tab) => setAssetTab(tab as 'tokens' | 'nfts')}
        loop={false}
        className="min-h-0"
      >
        {assetTab === 'tokens' ? (
          <>
            <div className="flex flex-col gap-1">
              {assetsReady ? (
                displayedJettons.length > 0 ? (
                  displayedJettons.map((row) => (
                    <AssetRow
                      key={row.id}
                      {...row}
                      onClick={() => handleAssetClick(row)}
                    />
                  ))
                ) : hiddenJettonRows.length > 0 ? (
                  <div className="p-4 bg-secondary/40 border border-border/70 rounded-2xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground shrink-0">
                        <EyeOff className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          All tokens hidden
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Manage visibility in the full Assets view.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('/wallet/assets')}
                      className="px-3 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-xs font-semibold text-foreground transition-colors shrink-0 cursor-pointer"
                    >
                      Manage
                    </button>
                  </div>
                ) : null
              ) : (
                <>
                  <AssetRowSkeleton />
                  <AssetRowSkeleton />
                </>
              )}
            </div>

            {hasMoreJettons && (
              <div className="mt-2 text-center">
                <button
                  type="button"
                  onClick={() => setShowAll((prev) => !prev)}
                  className="text-xs font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer py-1 px-3 rounded-md hover:bg-secondary/50"
                >
                  {showAll ? 'Show less' : `Show all (${jettonRows.length})`}
                </button>
              </div>
            )}
          </>
        ) : (
          <NftsCard hideHeader />
        )}
      </SwipeableSubTabs>

      <AssetDetailsModal
        asset={selectedAsset}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <AddTokenModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </section>
  );
};
