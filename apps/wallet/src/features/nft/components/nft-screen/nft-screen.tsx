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
import { useMyDomains } from '@/features/dns/hooks/use-my-domains';
import type { Network } from '@/lib/brotherhood/config';

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

  const network = (savedWallets.find((w) => w.id === activeWalletId)?.network ??
    'testnet') as Network;

  const [selectedNft, setSelectedNft] = useState<NFT | null>(null);

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
