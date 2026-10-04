/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { Eye, EyeOff, Pin } from 'lucide-react';

import { FallbackImage } from '@/core/components/ui/fallback-image';
import { useCountUp } from '@/core/hooks/use-count-up';
import { cn } from '@/core/lib/utils';
import { formatLargeValue } from '@/core/utils';

/** View-model for a single balance row (TON or a jetton). */
export interface AssetRowData {
  id: string;
  /** One or more candidate icon URLs, tried in order until one loads. */
  icon?: string | string[];
  fallbackText: string;
  name: string;
  symbol: string;
  amount: number;
  rateLabel?: string;
  /** Fiat value to display on the right; omit to hide (asset has no rate). */
  fiat?: number;
  isPinned?: boolean;
  isHidden?: boolean;
  onClick?: () => void;
  onTogglePin?: () => void;
  onToggleHide?: () => void;
}

export const AssetRow: React.FC<AssetRowData> = ({
  icon,
  fallbackText,
  name,
  symbol,
  amount,
  rateLabel,
  fiat,
  isPinned,
  isHidden,
  onClick,
  onTogglePin,
  onToggleHide,
}) => {
  const animatedAmount = useCountUp(amount);
  const animatedFiat = useCountUp(fiat ?? 0);
  const hasFiat = fiat !== undefined;
  const hasActions = Boolean(onTogglePin || onToggleHide);

  const isClickable = Boolean(onClick);
  const OuterTag = isClickable && !hasActions ? 'button' : 'div';
  const InnerTag = isClickable && hasActions ? 'button' : 'div';

  return (
    <OuterTag
      {...(OuterTag === 'button'
        ? { type: 'button' as const, onClick }
        : isClickable
          ? { onClick }
          : {})}
      className={cn(
        'w-full flex items-center gap-3 py-2 text-left rounded-xl transition-colors',
        isClickable &&
          'hover:bg-secondary/50 active:bg-secondary/80 px-2 -mx-2 cursor-pointer',
        isHidden && 'opacity-65',
      )}
    >
      <InnerTag
        {...(InnerTag === 'button'
          ? {
              type: 'button' as const,
              onClick: (e: React.MouseEvent) => {
                e.stopPropagation();
                onClick?.();
              },
            }
          : {})}
        className={cn(
          'flex-1 min-w-0 flex items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg',
          InnerTag === 'button' && 'cursor-pointer',
        )}
      >
        <span className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-secondary border border-border flex items-center justify-center">
          <FallbackImage
            src={icon}
            alt=""
            className="w-full h-full object-cover"
            fallback={
              <span className="w-full h-full bg-linear-to-br from-blue-500 to-purple-600 text-white text-xs font-bold flex items-center justify-center">
                {fallbackText}
              </span>
            }
          />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-foreground truncate">
              {name}
            </span>
            {isPinned && (
              <Pin
                className="w-3 h-3 text-primary shrink-0 fill-primary/20"
                aria-label="Pinned to top"
              />
            )}
          </div>
          <div className="text-xs text-muted-foreground truncate tabular-nums">
            {formatLargeValue(String(animatedAmount), 4)} {symbol}
            {rateLabel && ` · ${rateLabel}`}
          </div>
        </div>
        {hasFiat && (
          <div className="text-right shrink-0 tabular-nums">
            <div className="text-sm font-semibold text-foreground">
              ${formatLargeValue(String(animatedFiat), 2, 2)}
            </div>
          </div>
        )}
      </InnerTag>

      {hasActions && (
        <div className="flex items-center gap-1 shrink-0">
          {onTogglePin && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin();
              }}
              className={cn(
                'p-1.5 rounded-lg border transition-colors cursor-pointer',
                isPinned
                  ? 'bg-primary/15 border-primary/40 text-primary'
                  : 'bg-secondary/70 border-border/60 text-muted-foreground hover:text-foreground hover:bg-secondary',
              )}
              title={isPinned ? 'Unpin token' : 'Pin token to top'}
              aria-label={isPinned ? 'Unpin token' : 'Pin token to top'}
              data-testid={`token-pin-btn-${symbol}`}
            >
              <Pin className={cn('w-3.5 h-3.5', isPinned && 'fill-current')} />
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
                'p-1.5 rounded-lg border transition-colors cursor-pointer',
                isHidden
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400'
                  : 'bg-secondary/70 border-border/60 text-muted-foreground hover:text-foreground hover:bg-secondary',
              )}
              title={
                isHidden
                  ? 'Show token on dashboard'
                  : 'Hide token from dashboard'
              }
              aria-label={
                isHidden
                  ? 'Show token on dashboard'
                  : 'Hide token from dashboard'
              }
              data-testid={`token-hide-btn-${symbol}`}
            >
              {isHidden ? (
                <Eye className="w-3.5 h-3.5" />
              ) : (
                <EyeOff className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
      )}
    </OuterTag>
  );
};

export const AssetRowSkeleton: React.FC = () => (
  <div className="flex items-center gap-3 py-2">
    <span className="w-10 h-10 rounded-full bg-muted animate-pulse shrink-0" />
    <div className="flex-1 min-w-0 space-y-1.5">
      <div className="h-4 w-24 rounded bg-muted animate-pulse" />
      <div className="h-3 w-32 rounded bg-muted animate-pulse" />
    </div>
    <div className="text-right space-y-1.5">
      <div className="h-4 w-16 rounded bg-muted animate-pulse ml-auto" />
      <div className="h-3 w-12 rounded bg-muted animate-pulse ml-auto" />
    </div>
  </div>
);
