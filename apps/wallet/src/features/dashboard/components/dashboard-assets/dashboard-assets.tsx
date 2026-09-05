/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useMemo, useState } from 'react';
import { ChevronRight, Compass, Plus } from 'lucide-react';
import { useNavigate } from '@/core/routing';

import {
  AddTokenModal,
  AssetDetailsModal,
  AssetRow,
  AssetRowSkeleton,
  useAssetRows,
  useTrackedPersonalTokens,
} from '@/features/assets';
import type { AssetRowData } from '@/features/assets';

const JETTON_SLOTS = 3;

export const DashboardAssets: React.FC = () => {
  const navigate = useNavigate();
  const { tonRow, jettonRows, assetsReady } = useAssetRows();
  const { discoverTokens, isDiscovering } = useTrackedPersonalTokens();

  const [selectedAsset, setSelectedAsset] = useState<AssetRowData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAssetClick = (asset: AssetRowData) => {
    setSelectedAsset(asset);
    setIsModalOpen(true);
  };

  // Preview: up to JETTON_SLOTS held member jettons (FI + Personal Tokens)
  const selected = useMemo<AssetRowData[]>(() => {
    return jettonRows.slice(0, JETTON_SLOTS);
  }, [jettonRows]);

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
            onClick={() => void discoverTokens()}
            disabled={isDiscovering}
            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors cursor-pointer"
            title="Discover personal tokens from network & transactions"
          >
            <Compass
              className={`w-3.5 h-3.5 ${isDiscovering ? 'animate-spin' : ''}`}
            />
            <span>{isDiscovering ? 'Discovering...' : 'Discover'}</span>
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
          selected.map((row) => (
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
