/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { getNetworkLabel } from '@demo/wallet-core';
import type { SavedWallet } from '@demo/wallet-core';
import { formatTonAddress } from '@/core/utils/formatters';

/**
 * WalletPreview - A reusable component for displaying wallet information in lists
 *
 * Features:
 * - Displays wallet name, address, version, interface type
 * - Optional balance display (formatted from nanotons to TON)
 * - Two display modes: compact (for lists) and full (for cards)
 * - Supports active state highlighting
 * - Clickable with optional onClick handler
 * - Shows Ledger account info when applicable
 *
 * @example
 * // Compact mode for lists
 * <WalletPreview
 *   wallet={savedWallet}
 *   balance={balance}
 *   isCompact={true}
 *   isActive={isActive}
 *   onClick={() => handleSelect(wallet)}
 * />
 *
 * @example
 * // Full mode for cards
 * <WalletPreview
 *   wallet={savedWallet}
 *   balance={balance}
 *   showFullAddress={true}
 * />
 */

interface WalletPreviewProps {
  wallet: SavedWallet;
  balance?: string | null;
  isActive?: boolean;
  isCompact?: boolean;
  showFullAddress?: boolean;
  onClick?: () => void;
  className?: string;
}

export const WalletPreview: React.FC<WalletPreviewProps> = ({
  wallet,
  balance,
  isActive = false,
  isCompact = false,
  showFullAddress = false,
  onClick,
  className = '',
}) => {
  const formatAddress = (address: string, length: number = 16): string => {
    if (!address) return '';
    const normalized = formatTonAddress(address, {
      isContract: false,
      network: wallet.network,
    });
    if (showFullAddress) return normalized;

    const halfLength = Math.floor(length / 2);
    return `${normalized.slice(0, halfLength)}...${normalized.slice(-halfLength)}`;
  };

  const formatBalance = (balanceStr?: string | null): string => {
    if (!balanceStr || balanceStr === '0') return '0 GRAM';

    try {
      // Balance is in nanotons, convert to TON (1 TON = 1e9 nanotons)
      const balanceNum = BigInt(balanceStr);
      const ton = Number(balanceNum) / 1e9;

      // Format with appropriate decimal places
      if (ton >= 1000) {
        return `${ton.toFixed(2)} GRAM`;
      } else if (ton >= 1) {
        return `${ton.toFixed(4)} GRAM`;
      } else if (ton > 0) {
        return `${ton.toFixed(6)} GRAM`;
      }
      return '0 GRAM';
    } catch (_error) {
      return '- GRAM';
    }
  };

  const formatWalletType = (type: string): string => {
    const typeMap: Record<string, string> = {
      mnemonic: 'Mnemonic',
      signer: 'Signer',
      ledger: 'Ledger',
    };
    return typeMap[type] || type;
  };

  const formatVersion = (version?: string): string => {
    if (!version) return 'v5r1';
    return version.toUpperCase();
  };

  const getWalletIcon = (type: string) => {
    if (type === 'ledger') {
      return (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
          />
        </svg>
      );
    }
    return (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
        />
      </svg>
    );
  };

  if (isCompact) {
    return (
      <div
        onClick={onClick}
        className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
          isActive
            ? 'bg-blue-50 border border-blue-200'
            : 'bg-gray-50 hover:bg-gray-100'
        } ${onClick ? 'cursor-pointer' : ''} ${className}`}
      >
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600'
          }`}
        >
          {getWalletIcon(wallet.walletInterfaceType)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium text-gray-900 truncate">
              {wallet.name}
            </p>
            {isActive && (
              <span className="text-xs text-blue-600 font-medium">Active</span>
            )}
          </div>
          <p className="text-xs text-gray-600 font-mono truncate">
            {formatAddress(wallet.address, 12)}
          </p>
        </div>
        {balance !== undefined && (
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">
              {formatBalance(balance)}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`border rounded-2xl transition-all ${
        isActive
          ? 'border-blue-500 bg-blue-500/10 shadow-md ring-1 ring-blue-500'
          : 'border-border bg-card text-card-foreground hover:border-border/80 hover:shadow-sm'
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isActive
                  ? 'bg-blue-500/20 text-blue-500'
                  : 'bg-secondary text-muted-foreground'
              }`}
            >
              {getWalletIcon(wallet.walletInterfaceType)}
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">
                {wallet.name}
              </h3>
              {isActive && (
                <span className="inline-block px-2 py-0.5 text-xs font-medium text-blue-500 bg-blue-500/10 rounded-full">
                  Active
                </span>
              )}
            </div>
          </div>
          {balance !== undefined && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-1">Balance</p>
              <p className="text-lg font-bold text-foreground">
                {formatBalance(balance)}
              </p>
            </div>
          )}
        </div>

        {/* Wallet Details */}
        <div className="space-y-2">
          {/* Address */}
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Address:
            </span>
            <span className="text-xs text-foreground font-mono text-right break-all ml-2">
              {showFullAddress
                ? wallet.address
                : formatAddress(wallet.address, 20)}
            </span>
          </div>

          {/* Version, Network & Interface Type */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-medium text-muted-foreground">
                Version:
              </span>
              <span className="text-xs text-foreground px-2 py-0.5 bg-secondary border border-border/50 rounded-lg">
                {formatVersion(wallet.version)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-medium text-muted-foreground">
                Network:
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded ${
                  wallet.network === 'testnet'
                    ? 'bg-amber-500/10 text-amber-500'
                    : wallet.network === 'tetra'
                      ? 'bg-purple-500/10 text-purple-500'
                      : 'bg-emerald-500/10 text-emerald-500'
                }`}
              >
                {getNetworkLabel(wallet.network)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-medium text-muted-foreground">
                Type:
              </span>
              <span className="text-xs text-foreground px-2 py-0.5 bg-secondary border border-border/50 rounded-lg">
                {formatWalletType(wallet.walletInterfaceType)}
              </span>
            </div>
          </div>

          {/* Ledger Info */}
          {wallet.ledgerConfig && (
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="text-xs font-medium text-muted-foreground">
                Ledger Account:
              </span>
              <span className="text-xs text-foreground">
                #{wallet.ledgerConfig.accountIndex}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
