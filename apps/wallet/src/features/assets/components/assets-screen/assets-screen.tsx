/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useState, type FC } from 'react';
import { useNavigate } from '@/core/routing';

import { AssetRow, AssetRowSkeleton } from '../asset-row';
import { AssetDetailsModal } from '../asset-details-modal';
import type { AssetRowData } from '../asset-row';
import { useAssetRows } from '../../hooks/use-asset-rows';

import { NewLayout } from '@/core/components/shared/new-layout';
import { ScreenHeader } from '@/core/components/shared/screen-header';

/** Full assets page: every token on the active wallet's balance (TON + member jettons). */
export const AssetsScreen: FC = () => {
  const navigate = useNavigate();
  const { tonRow, jettonRows, assetsReady } = useAssetRows();

  const [selectedAsset, setSelectedAsset] = useState<AssetRowData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAssetClick = (asset: AssetRowData) => {
    setSelectedAsset(asset);
    setIsModalOpen(true);
  };

  return (
    <NewLayout
      header={
        <ScreenHeader title="Assets" onBack={() => navigate('/wallet')} />
      }
    >
      <div className="space-y-1">
        {assetsReady && tonRow ? (
          <>
            <AssetRow {...tonRow} onClick={() => handleAssetClick(tonRow)} />
            {jettonRows.map((row) => (
              <AssetRow
                key={row.id}
                {...row}
                onClick={() => handleAssetClick(row)}
              />
            ))}
          </>
        ) : (
          <>
            <AssetRowSkeleton />
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
    </NewLayout>
  );
};
