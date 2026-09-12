/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useMemo, useState } from 'react';
import { ChevronRight, Plus, RefreshCw } from 'lucide-react';
import { useNavigate } from '@/core/routing';
import { useJettons } from '@demo/wallet-core';
import { toast } from 'sonner';

import {
  AddTokenModal,
  AssetDetailsModal,
  AssetRow,
  AssetRowSkeleton,
  useAssetRows,
} from '@/features/assets';
import type { AssetRowData } from '@/features/assets';

const JETTON_SLOTS = 5;

export const DashboardAssets: React.FC = () => {
  const navigate = useNavigate();
  const { tonRow, jettonRows, assetsReady } = useAssetRows();
  const { loadUserJettons } = useJettons();

  const [selectedAsset, setSelectedAsset] = useState<AssetRowData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleAssetClick = (asset: AssetRowData) => {
    setSelectedAsset(asset);
    setIsModalOpen(true);
  };

  const handleRefreshTokens = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await loadUserJettons();
      toast.success('Tokens refreshed successfully');
    } catch (err) {
      console.error('[DashboardAssets] Failed to refresh tokens:', err);
      toast.error('Failed to refresh tokens');
    } finally {
      setIsRefreshing(false);
    }
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
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={() => navigate('/wallet/assets')}
          className="flex items-center gap-1 group cursor-pointer"
          aria-label="View all assets"
        >
          <h2 className="text-base font-semibold text-foreground">Assets</h2>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </button>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleRefreshTokens}
            disabled={isRefreshing}
            className="p-1 rounded-full bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh and discover tokens"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
            />
          </button>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="p-1 rounded-full bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors cursor-pointer"
            title="Add personal token by minter address"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="space-y-1">
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
