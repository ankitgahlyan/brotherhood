/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import type { NFT } from '@ton/walletkit';

import { FallbackImage } from '@/core/components/ui/fallback-image';
import { BRO_DEFAULT_IMAGE_URI } from '@/core/lib/dns';
import { tokenImageUrls } from '@/core/utils';

const getNftImageSources = (nft: NFT): string[] => {
  const img = nft.info?.image;
  const sources = img
    ? [
        ...tokenImageUrls(img),
        ...(img.data ? [`data:image/png;base64,${img.data}`] : []),
      ]
    : [];
  if (
    nft.info?.name?.toLowerCase().endsWith('.bro') &&
    !sources.includes(BRO_DEFAULT_IMAGE_URI)
  ) {
    sources.push(BRO_DEFAULT_IMAGE_URI);
  }
  return sources;
};

const getNftName = (
  nft: NFT,
  formatNftIndex: (index: string) => string,
): string => {
  if (nft.info?.name) return nft.info.name;
  if (nft.index) return `NFT ${formatNftIndex(nft.index)}`;
  return 'NFT';
};

interface NftTileProps {
  nft: NFT;
  formatNftIndex: (index: string) => string;
  onClick?: () => void;
}

/**
 * NFT card (image + name + index). Width follows the container — wrapped for the
 * horizontal-scroll preview on the dashboard, gridded on the full NFTs page.
 */
export const NftTile: React.FC<NftTileProps> = ({
  nft,
  formatNftIndex,
  onClick,
}) => {
  const name = getNftName(nft, formatNftIndex);
  const indexLabel = nft.index ? formatNftIndex(nft.index) : null;

  return (
    <article
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`bg-secondary/70 border border-border rounded-2xl overflow-hidden text-left ${
        onClick
          ? 'cursor-pointer hover:border-primary/50 hover:shadow-md transition-all active:scale-[0.98]'
          : ''
      }`}
    >
      <div className="aspect-square w-full overflow-hidden bg-muted">
        <FallbackImage
          src={getNftImageSources(nft)}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-2">
        <div className="text-sm font-semibold text-foreground truncate">
          {name}
        </div>
        {indexLabel && (
          <div className="text-xs text-muted-foreground">
            {indexLabel.length > 10 ? `${indexLabel.slice(0, 6)}…` : indexLabel}
          </div>
        )}
      </div>
    </article>
  );
};
