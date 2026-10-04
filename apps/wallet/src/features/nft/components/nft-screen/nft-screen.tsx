/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useMemo, useState } from 'react';
import type { FC } from 'react';
import { ChevronDown, EyeOff } from 'lucide-react';
import { useNavigate } from '@/core/routing';
import { useNfts, useWallet } from '@demo/wallet-core';
import type { NFT } from '@ton/walletkit';
import { RefreshButton } from '@/core/components/ui/refresh-button';
import { useMyDomains } from '@/features/dns/hooks/use-my-domains';
import type { Network } from '@/lib/brotherhood/config';
import {
  normalizeAssetVisibilityKey,
  useAssetVisibilityStore,
} from '@/core/storage/useAssetVisibilityStore';
import { cn } from '@/core/lib/utils';

import { mergeAndEnrichBroNfts } from '../../lib/nft-transfer';
import { NftTile } from '../nft-tile';
import { NftTransferModal } from '../nft-transfer-modal';
import { NewLayout } from '@/core/components/shared/new-layout';
import { ScreenHeader } from '@/core/components/shared/screen-header';

/** Full NFTs page: every NFT held by the active wallet, as a grid. */
export const NftsScreen: FC = () => {
  const navigate = useNavigate();
  const { userNfts, formatNftIndex, loadUserNfts, refreshNfts } = useNfts();
  const { address, savedWallets, activeWalletId } = useWallet();
  const pinnedNftIds = useAssetVisibilityStore((s) => s.pinnedNftIds);
  const hiddenNftIds = useAssetVisibilityStore((s) => s.hiddenNftIds);
  const togglePinNft = useAssetVisibilityStore((s) => s.togglePinNft);
  const toggleHideNft = useAssetVisibilityStore((s) => s.toggleHideNft);

  const network = (savedWallets.find((w) => w.id === activeWalletId)?.network ??
    'testnet') as Network;

  const [selectedNft, setSelectedNft] = useState<NFT | null>(null);
  const [showHiddenSection, setShowHiddenSection] = useState(false);

  const { domains: ownedBroDomains, refresh: refreshMyDomains } = useMyDomains(
    network,
    address,
  );

  useEffect(() => {
    void loadUserNfts();
  }, [loadUserNfts]);

  const allNfts = useMemo<NFT[]>(
    () => mergeAndEnrichBroNfts(userNfts, ownedBroDomains),
    [userNfts, ownedBroDomains],
  );

  const { visibleNfts, hiddenNfts } = useMemo<{
    visibleNfts: NFT[];
    hiddenNfts: NFT[];
  }>(() => {
    const compareNfts = (a: NFT, b: NFT) => {
      const aIdx = pinnedNftIds.indexOf(normalizeAssetVisibilityKey(a.address));
      const bIdx = pinnedNftIds.indexOf(normalizeAssetVisibilityKey(b.address));
      const aPinned = aIdx !== -1;
      const bPinned = bIdx !== -1;
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      if (aPinned && bPinned) return aIdx - bIdx;
      return 0;
    };

    const visible = allNfts
      .filter(
        (nft) =>
          !hiddenNftIds.includes(normalizeAssetVisibilityKey(nft.address)),
      )
      .sort(compareNfts);
    const hidden = allNfts.filter((nft) =>
      hiddenNftIds.includes(normalizeAssetVisibilityKey(nft.address)),
    );

    return { visibleNfts: visible, hiddenNfts: hidden };
  }, [allNfts, pinnedNftIds, hiddenNftIds]);

  return (
    <NewLayout
      header={
        <ScreenHeader
          title="NFTs"
          onBack={() => navigate('/wallet')}
          rightElement={
            <RefreshButton
              iconOnly
              onRefresh={async () => {
                await Promise.all([refreshNfts(), refreshMyDomains()]);
              }}
              className="rounded-full bg-secondary p-1"
              title="Refresh NFTs"
              ariaLabel="Refresh NFTs"
              testId="nfts-screen-refresh-btn"
            />
          }
        />
      }
    >
      {allNfts.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-3xl mb-2">🖼️</p>
          <p className="text-base font-semibold text-foreground">No NFTs yet</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
            Collect NFTs or register a sovereign .bro domain to see your items
            here.
          </p>
          <button
            type="button"
            onClick={() => navigate('/dns')}
            className="mt-4 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors cursor-pointer"
          >
            Explore .bro Domains
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleNfts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {visibleNfts.map((nft) => {
                const visKey = normalizeAssetVisibilityKey(nft.address);
                return (
                  <NftTile
                    key={nft.address}
                    nft={nft}
                    formatNftIndex={formatNftIndex}
                    isPinned={pinnedNftIds.includes(visKey)}
                    isHidden={false}
                    onClick={() => setSelectedNft(nft)}
                    onTogglePin={() => togglePinNft(nft.address)}
                    onToggleHide={() => toggleHideNft(nft.address)}
                  />
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No visible NFTs.{' '}
              {hiddenNfts.length > 0
                ? 'Expand Hidden below to restore NFTs to your dashboard.'
                : ''}
            </div>
          )}

          {hiddenNfts.length > 0 && (
            <div className="pt-2 border-t border-border/60 space-y-3">
              <button
                type="button"
                onClick={() => setShowHiddenSection((prev) => !prev)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-secondary/50 hover:bg-secondary/80 border border-border/60 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                data-testid="nfts-hidden-section-toggle"
              >
                <span className="flex items-center gap-1.5">
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Hidden ({hiddenNfts.length})</span>
                </span>
                <ChevronDown
                  className={cn(
                    'w-4 h-4 transition-transform duration-200',
                    showHiddenSection && 'rotate-180',
                  )}
                />
              </button>

              {showHiddenSection && (
                <div className="grid grid-cols-2 gap-3">
                  {hiddenNfts.map((nft) => (
                    <NftTile
                      key={nft.address}
                      nft={nft}
                      formatNftIndex={formatNftIndex}
                      isPinned={false}
                      isHidden
                      onClick={() => setSelectedNft(nft)}
                      onTogglePin={() => togglePinNft(nft.address)}
                      onToggleHide={() => toggleHideNft(nft.address)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <NftTransferModal
        nft={selectedNft}
        isOpen={Boolean(selectedNft)}
        onClose={() => setSelectedNft(null)}
        formatNftIndex={formatNftIndex}
      />
    </NewLayout>
  );
};
