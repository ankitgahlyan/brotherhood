/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { ChevronRight, Globe, Plus } from 'lucide-react';
import { useNavigate } from '@/core/routing';
import { useNfts, useWallet } from '@demo/wallet-core';
import type { NFT } from '@ton/walletkit';
import { useMyDomains } from '@/features/dns/hooks/use-my-domains';
import type { Network } from '@/lib/brotherhood/config';

import { mergeAndEnrichBroNfts } from '../../lib/nft-transfer';
import { NftTile } from '../nft-tile';
import { NftTransferModal } from '../nft-transfer-modal';

interface NftsCardProps {
  /** If true, hides the internal header (useful when rendered inside a parent tab like DashboardAssets) */
  hideHeader?: boolean;
}

/** Dashboard NFTs preview: a horizontal-scroll strip; renders preview or empty state. */
export const NftsCard: React.FC<NftsCardProps> = ({ hideHeader = false }) => {
  const navigate = useNavigate();
  const { userNfts, formatNftIndex, isLoadingNfts, loadUserNfts } = useNfts();
  const { address, savedWallets, activeWalletId } = useWallet();

  const network = (savedWallets.find((w) => w.id === activeWalletId)?.network ??
    'testnet') as Network;

  const [selectedNft, setSelectedNft] = useState<NFT | null>(null);

  const { domains: ownedBroDomains } = useMyDomains(network, address);

  // Trigger session-cached load on mount
  useEffect(() => {
    void loadUserNfts();
  }, [loadUserNfts]);

  // Unify standard indexer NFTs with local .bro domains and enrich missing .bro images
  const allNfts = useMemo<NFT[]>(
    () => mergeAndEnrichBroNfts(userNfts, ownedBroDomains),
    [userNfts, ownedBroDomains],
  );

  const header = (
    <button
      type="button"
      onClick={() => navigate('/wallet/nft')}
      className="flex items-center gap-1 mb-2 group cursor-pointer"
      aria-label="View all NFTs"
    >
      <h2 className="text-base font-semibold text-foreground">NFTs</h2>
      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
    </button>
  );

  if (isLoadingNfts && allNfts.length === 0) {
    return (
      <section>
        {!hideHeader && header}
        <div
          className="no-swipe flex gap-3 overflow-x-auto -mx-4 px-4 pb-1 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]"
          data-swipe-ignore="true"
        >
          <div className="w-36 flex-shrink-0 aspect-square rounded-2xl bg-muted/60 animate-pulse border border-border" />
          <div className="w-36 flex-shrink-0 aspect-square rounded-2xl bg-muted/60 animate-pulse border border-border" />
        </div>
      </section>
    );
  }

  if (allNfts.length === 0) {
    return (
      <section>
        {!hideHeader && header}
        <div className="p-4 bg-secondary/40 border border-border/70 rounded-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                No NFTs yet
              </p>
              <p className="text-xs text-muted-foreground">
                Register a sovereign .bro domain to start your collection.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/dns')}
            className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>.bro</span>
          </button>
        </div>
      </section>
    );
  }

  return (
    <section>
      {!hideHeader && header}
      <div
        className="no-swipe flex gap-3 overflow-x-auto -mx-4 px-4 pb-1 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]"
        data-swipe-ignore="true"
      >
        {allNfts.map((nft) => (
          <div key={nft.address} className="w-36 flex-shrink-0">
            <NftTile
              nft={nft}
              formatNftIndex={formatNftIndex}
              onClick={() => setSelectedNft(nft)}
            />
          </div>
        ))}
      </div>

      <NftTransferModal
        nft={selectedNft}
        isOpen={Boolean(selectedNft)}
        onClose={() => setSelectedNft(null)}
        formatNftIndex={formatNftIndex}
      />
    </section>
  );
};
