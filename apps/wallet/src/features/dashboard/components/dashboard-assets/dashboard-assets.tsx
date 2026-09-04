/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useMemo, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from '@/core/routing';

import {
  AssetDetailsModal,
  AssetRow,
  AssetRowSkeleton,
  useAssetRows,
} from '@/features/assets';
import type { AssetRowData } from '@/features/assets';

const JETTON_SLOTS = 3;

export const DashboardAssets: React.FC = () => {
  const navigate = useNavigate();
  const { tonRow, jettonRows, assetsReady } = useAssetRows();

  const [selectedAsset, setSelectedAsset] = useState<AssetRowData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      <button
        type="button"
        onClick={() => navigate('/wallet/assets')}
        className="flex items-center gap-1 mb-2 group cursor-pointer"
        aria-label="View all assets"
      >
        <h2 className="text-base font-semibold text-foreground">Assets</h2>
        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      </button>

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
    </section>
  );
};
