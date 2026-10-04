/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useState, type FC } from 'react';
import { ChevronDown, EyeOff, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshButton } from '@/core/components/ui/refresh-button';
import { useNavigate } from '@/core/routing';
import { useJettons } from '@demo/wallet-core';
import { useAnimationSettings } from '@/core/motion/motion-provider';
import { useAssetVisibilityStore } from '@/core/storage/useAssetVisibilityStore';
import { cn } from '@/core/lib/utils';

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
  const { isReduced, isRich } = useAnimationSettings();
  const { jettonRows, hiddenJettonRows, assetsReady } = useAssetRows();
  const { loadUserJettons } = useJettons();
  const togglePinToken = useAssetVisibilityStore((s) => s.togglePinToken);
  const toggleHideToken = useAssetVisibilityStore((s) => s.toggleHideToken);

  const [selectedAsset, setSelectedAsset] = useState<AssetRowData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showHiddenSection, setShowHiddenSection] = useState(false);

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
              <RefreshButton
                iconOnly
                onRefresh={async () => {
                  await loadUserJettons(undefined, true);
                }}
                className="rounded-full bg-secondary p-1"
                title="Refresh and discover tokens"
                ariaLabel="Refresh and discover tokens"
                testId="assets-refresh-btn"
              />
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="p-1 rounded-full bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors cursor-pointer"
                title="Add personal token by minter address"
                aria-label="Add personal token by minter address"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          }
        />
      }
    >
      <div className="space-y-3">
        <div className="space-y-1">
          {assetsReady ||
          jettonRows.length > 0 ||
          hiddenJettonRows.length > 0 ? (
            jettonRows.length > 0 ? (
              <AnimatePresence initial={false}>
                {jettonRows.map((row) => (
                  <motion.div
                    key={row.id}
                    layout={isRich ? 'position' : undefined}
                    initial={isReduced ? false : { opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={isReduced ? undefined : { opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                  >
                    <AssetRow
                      {...row}
                      onClick={() => handleAssetClick(row)}
                      onTogglePin={() => togglePinToken(row.id)}
                      onToggleHide={() => toggleHideToken(row.id)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No visible tokens.{' '}
                {hiddenJettonRows.length > 0
                  ? 'Expand Hidden below to restore tokens to your dashboard.'
                  : ''}
              </div>
            )
          ) : (
            <>
              <AssetRowSkeleton />
              <AssetRowSkeleton />
            </>
          )}
        </div>

        {hiddenJettonRows.length > 0 && (
          <div className="pt-2 border-t border-border/60 space-y-2">
            <button
              type="button"
              onClick={() => setShowHiddenSection((prev) => !prev)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-secondary/50 hover:bg-secondary/80 border border-border/60 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              data-testid="assets-hidden-section-toggle"
            >
              <span className="flex items-center gap-1.5">
                <EyeOff className="w-3.5 h-3.5" />
                <span>Hidden ({hiddenJettonRows.length})</span>
              </span>
              <ChevronDown
                className={cn(
                  'w-4 h-4 transition-transform duration-200',
                  showHiddenSection && 'rotate-180',
                )}
              />
            </button>

            {showHiddenSection && (
              <div className="space-y-1 pl-1">
                {hiddenJettonRows.map((row) => (
                  <AssetRow
                    key={row.id}
                    {...row}
                    onClick={() => handleAssetClick(row)}
                    onTogglePin={() => togglePinToken(row.id)}
                    onToggleHide={() => toggleHideToken(row.id)}
                  />
                ))}
              </div>
            )}
          </div>
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
