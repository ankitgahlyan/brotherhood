/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { ChevronsUpDown, Wallet } from 'lucide-react';

import { cn } from '@/core/lib/utils';
import { useFormatAddress } from '@/core/utils/formatters';

interface WalletPlateProps {
  name: string;
  address: string;
  /** Shows the selector chevron and turns the plate into a button (connect modal only). */
  selectable?: boolean;
  onClick?: () => void;
}

/** The "Wallet" row in a dApp request: icon + name + truncated address, with an optional selector. */
export const WalletPlate: React.FC<WalletPlateProps> = ({
  name,
  address,
  selectable,
  onClick,
}) => {
  const { formatWalletAddress } = useFormatAddress();
  const formatted = formatWalletAddress(address, true, 6);

  const className =
    'flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3.5 text-left';
  const content = (
    <>
      <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
        <Wallet className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-bold text-foreground">{name}</span>
        <span className="block truncate text-sm text-muted-foreground font-mono">
          {formatted || address}
        </span>
      </span>
      {selectable && (
        <ChevronsUpDown className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
      )}
    </>
  );

  if (selectable && onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(className, 'transition-colors hover:border-primary/50')}
      >
        {content}
      </button>
    );
  }
  return <div className={className}>{content}</div>;
};
