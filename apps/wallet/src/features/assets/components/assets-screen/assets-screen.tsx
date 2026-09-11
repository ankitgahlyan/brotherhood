/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useState, type FC } from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from '@/core/routing';

import { AssetRow, AssetRowSkeleton } from '../asset-row';
import { AssetDetailsModal } from '../asset-details-modal';
import { AddTokenModal } from '../add-token-modal';
import type { AssetRowData } from '../asset-row';
import { useAssetRows } from '../../hooks/use-asset-rows';

import { NewLayout } from '@/core/components/shared/new-layout';
import { ScreenHeader } from '@/core/components/shared/screen-header';
import { SyncStatusButton } from '@/features/dashboard/components/sync-status-button';

/** Full assets page: every token on the active wallet's balance (TON + member jettons). */
export const AssetsScreen: FC = () => {
  const navigate = useNavigate();
  const { tonRow, jettonRows, assetsReady } = useAssetRows();

  const [selectedAsset, setSelectedAsset] = useState<AssetRowData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAssetClick = (asset: AssetRowData) => {
    setSelectedAsset(asset);
    setIsModalOpen(true);
  };

  return (
    <NewLayout
      header={
        <ScreenHeader
          title="Assets"
          onBack={() => navigate('/wallet')}
          rightElement={
            <div className="flex items-center gap-1.5">
              <SyncStatusButton />
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="p-1 rounded-full bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors cursor-pointer"
                title="Add personal token by minter address"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          }
        />
      }
    >
      <div className="space-y-1">
        {tonRow ? (
          <AssetRow {...tonRow} onClick={() => handleAssetClick(tonRow)} />
        ) : (
          <AssetRowSkeleton />
        )}
        {assetsReady || jettonRows.length > 0 ? (
          jettonRows.map((row) => (
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
    </NewLayout>
  );
};
