/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState } from 'react';
import type { Address } from '@ton/core';
import { Copy, Check } from 'lucide-react';
import { useFormatAddress } from '@/core/utils/formatters';

export interface CopyButtonProps {
  address: Address | string | null | undefined;
  type?: 'wallet' | 'contract';
  label?: string;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
  iconClassName?: string;
  title?: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  address,
  type = 'wallet',
  label,
  size = 'sm',
  className = '',
  iconClassName = '',
  title,
}) => {
  const { copyWalletAddress, copyContractAddress } = useFormatAddress();
  const [copied, setCopied] = useState(false);

  if (!address) return null;

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const success =
      type === 'contract'
        ? await copyContractAddress(address)
        : await copyWalletAddress(address);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
  };

  const currentIconSize = iconSizes[size];

  return (
    <button
      type="button"
      onClick={handleClick}
      title={
        title ??
        (type === 'contract' ? 'Copy contract address' : 'Copy wallet address')
      }
      aria-label={
        title ??
        (type === 'contract' ? 'Copy contract address' : 'Copy wallet address')
      }
      className={`inline-flex items-center gap-1 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/70 transition-colors focus:outline-none focus:ring-1 focus:ring-primary/40 ${className}`}
      data-testid="copy-address-button"
    >
      {copied ? (
        <Check
          className={`${currentIconSize} text-emerald-500 animate-in fade-in duration-200 ${iconClassName}`}
        />
      ) : (
        <Copy className={`${currentIconSize} ${iconClassName}`} />
      )}
      {label && (
        <span
          className={`text-xs font-medium ${copied ? 'text-emerald-500' : ''}`}
        >
          {copied ? 'Copied' : label}
        </span>
      )}
    </button>
  );
};
