/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState } from 'react';
import { ChevronDown, Moon, Sun, Sparkles } from 'lucide-react';
import { useTonConnect, useWallet } from '@demo/wallet-core';
import { useTheme } from '@/core/theme';

import { WalletSelectorModal } from '@/features/wallets';
import { SettingsDropdown } from '@/features/settings';
import { ConnectDappModal } from '@/features/ton-connect';
import { ScanIcon } from '@/core/components/ui/icons';
import { usePasteHandler } from '@/core/hooks';

export const DashboardHeader: React.FC = () => {
  const [isWalletSelectorOpen, setIsWalletSelectorOpen] = useState(false);
  const [isConnectOpen, setIsConnectOpen] = useState(false);

  const { handleTonConnectUrl } = useTonConnect();
  const { savedWallets, activeWalletId } = useWallet();
  const { resolvedTheme, toggleTheme } = useTheme();
  const activeWallet = savedWallets.find((w) => w.id === activeWalletId);

  usePasteHandler(handleTonConnectUrl, isConnectOpen);

  return (
    <header className="flex items-center justify-between px-4 py-3">
      <button
        type="button"
        onClick={() => setIsConnectOpen(true)}
        className="p-1.5 -ml-1.5 rounded-md hover:bg-secondary transition-colors text-foreground"
        aria-label="Scan"
        data-testid="connect-dapp-button"
      >
        <ScanIcon className="w-5 h-5 text-foreground" />
      </button>

      <button
        type="button"
        onClick={() => setIsWalletSelectorOpen(true)}
        className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-secondary cursor-pointer hover:bg-secondary/80 border border-border transition-colors"
        aria-label="Select wallet"
      >
        <span className="text-sm font-semibold text-foreground">
          {activeWallet?.name || 'No wallet'}
        </span>
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      </button>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={toggleTheme}
          className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
          aria-label={`Toggle theme (currently ${resolvedTheme})`}
          title={`Current theme: ${resolvedTheme}. Click to toggle.`}
          data-testid="header-theme-toggle"
        >
          {resolvedTheme === 'light' ? (
            <Moon className="w-5 h-5" />
          ) : resolvedTheme === 'oled' ? (
            <Sparkles className="w-5 h-5 text-amber-400" />
          ) : (
            <Sun className="w-5 h-5 text-yellow-500" />
          )}
        </button>
        <SettingsDropdown />
      </div>

      <WalletSelectorModal
        isOpen={isWalletSelectorOpen}
        onClose={() => setIsWalletSelectorOpen(false)}
      />
      <ConnectDappModal
        isOpen={isConnectOpen}
        onClose={() => setIsConnectOpen(false)}
      />
    </header>
  );
};
