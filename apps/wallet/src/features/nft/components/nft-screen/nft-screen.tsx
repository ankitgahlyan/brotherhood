/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useMemo, useState } from 'react';
import type { FC } from 'react';
import { useNavigate } from '@/core/routing';
import { useNfts, useWallet } from '@demo/wallet-core';
import type { NFT } from '@ton/walletkit';
import { RefreshButton } from '@/core/components/ui/refresh-button';
import {
  useDnsStore,
  selectOwnedDomains,
} from '@/features/dns/store/dns-store';
import type { Network } from '@/lib/brotherhood/config';

import { NftTile } from '../nft-tile';
import { NftTransferModal } from '../nft-transfer-modal';
import { NewLayout } from '@/core/components/shared/new-layout';
import { ScreenHeader } from '@/core/components/shared/screen-header';

/** Full NFTs page: every NFT held by the active wallet, as a grid. */
export const NftsScreen: FC = () => {
  const navigate = useNavigate();
  const {
    userNfts,
    formatNftIndex,
    isLoadingNfts,
    lastNftsUpdate,
    loadUserNfts,
    refreshNfts,
  } = useNfts();
  const { savedWallets, activeWalletId } = useWallet();

  const network = (savedWallets.find((w) => w.id === activeWalletId)?.network ??
    'testnet') as Network;

  const [selectedNft, setSelectedNft] = useState<NFT | null>(null);

  const ownedBroDomains = useDnsStore((s) => selectOwnedDomains(s, network));

  useEffect(() => {
    if (lastNftsUpdate === 0 && !isLoadingNfts) {
      void loadUserNfts();
    }
  }, [lastNftsUpdate, isLoadingNfts, loadUserNfts]);

  const allNfts = useMemo<NFT[]>(() => {
    const existingAddresses = new Set(userNfts.map((n) => n.address));
    const broNfts: NFT[] = ownedBroDomains
      .filter((d) => !existingAddresses.has(d.nftAddress))
      .map((d) => ({
        address: d.nftAddress,
        index: d.name,
        info: {
          name: `${d.name}.${d.zone}`,
          image: {
            url: 'https://ankitgahlyan.github.io/brotherhood/dns/bro-dns-logo.png',
          },
          description: `Brotherhood .${d.zone} domain`,
        },
      }));
    return [...userNfts, ...broNfts];
  }, [userNfts, ownedBroDomains]);

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
                await refreshNfts();
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
        <div className="grid grid-cols-2 gap-3">
          {allNfts.map((nft) => (
            <NftTile
              key={nft.address}
              nft={nft}
              formatNftIndex={formatNftIndex}
              onClick={() => setSelectedNft(nft)}
            />
          ))}
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
