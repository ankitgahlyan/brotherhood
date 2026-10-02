/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useMemo, useState } from 'react';
import { ChevronRight, Plus, Coins, Image } from 'lucide-react';
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

const JETTON_SLOTS = 5;

export const DashboardAssets: React.FC = () => {
  const navigate = useNavigate();
  const { tonRow, jettonRows, assetsReady } = useAssetRows();
  const { loadUserJettons } = useJettons();
  const { loadUserNfts, refreshNfts, lastNftsUpdate, isLoadingNfts } =
    useNfts();

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
      <div className="flex items-center justify-between gap-2 mb-3">
        <div
          role="tablist"
          aria-label="Dashboard Asset Type"
          className="flex items-center gap-1.5 bg-secondary/80 p-1 rounded-2xl border border-border/70"
        >
          <button
            type="button"
            role="tab"
            aria-selected={assetTab === 'tokens'}
            onClick={() => setAssetTab('tokens')}
            aria-label="Tokens"
            title="Tokens"
            className={`inline-flex items-center justify-center gap-2 min-h-[38px] px-4 py-1.5 rounded-xl text-sm transition-all cursor-pointer active:scale-[0.97] ${
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
              <span>Tokens</span>
            )}
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={assetTab === 'nfts'}
            onClick={() => {
              setAssetTab('nfts');
              if (lastNftsUpdate === 0 && !isLoadingNfts) {
                void loadUserNfts();
              }
            }}
            aria-label="NFTs"
            title="NFTs"
            className={`inline-flex items-center justify-center gap-2 min-h-[38px] px-4 py-1.5 rounded-xl text-sm transition-all cursor-pointer active:scale-[0.97] ${
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
              <span>NFTs</span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() =>
              navigate(assetTab === 'tokens' ? '/wallet/assets' : '/wallet/nft')
            }
            className="inline-flex items-center gap-1 min-h-[36px] px-3 py-1.5 rounded-xl bg-secondary/80 hover:bg-secondary text-xs font-semibold text-foreground border border-border/60 transition-colors cursor-pointer active:scale-95"
            aria-label="View all assets"
          >
            <span>All</span>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
          </button>

          <RefreshButton
            iconOnly
            onRefresh={async () => {
              if (assetTab === 'tokens') {
                await loadUserJettons();
              } else {
                await refreshNfts();
              }
            }}
            className="rounded-xl bg-secondary/80 border border-border/60 p-2 min-h-[36px] min-w-[36px] flex items-center justify-center"
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
          {assetTab === 'tokens' ? (
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-xl bg-secondary/80 border border-border/60 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer active:scale-95"
              title="Add personal token by minter address"
            >
              <Plus className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/dns')}
              className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-xl bg-secondary/80 border border-border/60 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer active:scale-95"
              title="Register sovereign .bro domain"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {assetTab === 'tokens' ? (
        <>
          <div className="flex flex-col gap-1">
            {tonRow ? (
              <AssetRow {...tonRow} onClick={() => handleAssetClick(tonRow)} />
            ) : (
              <AssetRowSkeleton />
            )}
            {assetsReady ? (
              displayedJettons.map((row) => (
                <AssetRow
                  key={row.id}
                  {...row}
                  onClick={() => handleAssetClick(row)}
                />
              ))
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
