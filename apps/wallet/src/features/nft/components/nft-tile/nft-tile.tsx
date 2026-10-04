/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { Eye, EyeOff, Pin } from 'lucide-react';
import type { NFT } from '@ton/walletkit';

import { FallbackImage } from '@/core/components/ui/fallback-image';
import { BRO_DEFAULT_IMAGE_URI } from '@/core/lib/dns';
import { cn } from '@/core/lib/utils';
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
  isPinned?: boolean;
  isHidden?: boolean;
  onClick?: () => void;
  onTogglePin?: () => void;
  onToggleHide?: () => void;
}

/**
 * NFT card (image + name + index). Width follows the container — wrapped for the
 * horizontal-scroll preview on the dashboard, gridded on the full NFTs page.
 */
export const NftTile: React.FC<NftTileProps> = ({
  nft,
  formatNftIndex,
  isPinned,
  isHidden,
  onClick,
  onTogglePin,
  onToggleHide,
}) => {
  const name = getNftName(nft, formatNftIndex);
  const indexLabel = nft.index ? formatNftIndex(nft.index) : null;
  const hasActions = Boolean(onTogglePin || onToggleHide);

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
      className={cn(
        'relative bg-secondary/70 border border-border rounded-2xl overflow-hidden text-left',
        onClick &&
          'cursor-pointer hover:border-primary/50 hover:shadow-md transition-all active:scale-[0.98]',
        isHidden && 'opacity-65',
      )}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        <FallbackImage
          src={getNftImageSources(nft)}
          alt={name}
          className="w-full h-full object-cover"
        />

        {hasActions ? (
          <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
            {onTogglePin && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePin();
                }}
                className={cn(
                  'p-1.5 rounded-lg border backdrop-blur-md shadow-xs transition-colors cursor-pointer',
                  isPinned
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background/80 hover:bg-background text-foreground border-border/70',
                )}
                title={isPinned ? 'Unpin NFT' : 'Pin NFT to top'}
                aria-label={isPinned ? 'Unpin NFT' : 'Pin NFT to top'}
                data-testid={`nft-pin-btn-${name}`}
              >
                <Pin
                  className={cn('w-3.5 h-3.5', isPinned && 'fill-current')}
                />
              </button>
            )}
            {onToggleHide && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleHide();
                }}
                className={cn(
                  'p-1.5 rounded-lg border backdrop-blur-md shadow-xs transition-colors cursor-pointer',
                  isHidden
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-background/80 hover:bg-background text-foreground border-border/70',
                )}
                title={
                  isHidden ? 'Show NFT on dashboard' : 'Hide NFT from dashboard'
                }
                aria-label={
                  isHidden ? 'Show NFT on dashboard' : 'Hide NFT from dashboard'
                }
                data-testid={`nft-hide-btn-${name}`}
              >
                {isHidden ? (
                  <Eye className="w-3.5 h-3.5" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>
        ) : (
          isPinned && (
            <div
              className="absolute top-2 right-2 p-1 rounded-md bg-background/85 backdrop-blur-md border border-border/60 text-primary shadow-2xs"
              title="Pinned to top"
            >
              <Pin className="w-3 h-3 fill-current" />
            </div>
          )
        )}
      </div>
      <div className="p-2">
        <div className="flex items-center gap-1">
          <div className="text-sm font-semibold text-foreground truncate">
            {name}
          </div>
          {isPinned && (
            <Pin
              className="w-3 h-3 text-primary shrink-0 fill-primary/20"
              aria-hidden="true"
            />
          )}
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
