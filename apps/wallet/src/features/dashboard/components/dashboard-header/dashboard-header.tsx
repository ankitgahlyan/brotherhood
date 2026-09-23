/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState, useMemo } from 'react';
import {
  Moon,
  Sun,
  Sparkles,
  Wallet as WalletIcon,
  ChevronDown,
} from 'lucide-react';
import { useTonConnect, useWallet } from '@demo/wallet-core';
import { useTheme } from '@/core/theme';

import { SettingsDropdown, SettingsWalletsModal } from '@/features/settings';
import { NotificationBell } from '@/features/notifications';
import { ConnectDappModal } from '@/features/ton-connect';
import { ScanIcon } from '@/core/components/ui/icons';
import { usePasteHandler } from '@/core/hooks';
import { NetworkIndicator } from '@/core/components/shared/network-indicator';
import { SyncStatusButton } from '../sync-status-button';

export const DashboardHeader: React.FC = () => {
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [isManageWalletsOpen, setIsManageWalletsOpen] = useState(false);

  const { savedWallets, activeWalletId } = useWallet();
  const activeWallet = useMemo(
    () => savedWallets.find((w) => w.id === activeWalletId) || savedWallets[0],
    [savedWallets, activeWalletId],
  );

  const { handleTonConnectUrl } = useTonConnect();
  const { resolvedTheme, toggleTheme } = useTheme();

  usePasteHandler(handleTonConnectUrl, isConnectOpen);

  return (
    <header className="flex items-center justify-between px-4 py-3">
      <button
        type="button"
        onClick={() => setIsConnectOpen(true)}
        className="w-10 h-10 flex items-center justify-center rounded-xl bg-secondary/50 hover:bg-secondary border border-border/60 active:scale-95 transition-all text-foreground cursor-pointer shadow-2xs"
        aria-label="Scan"
        data-testid="connect-dapp-button"
      >
        <ScanIcon className="w-5 h-5 text-foreground" />
      </button>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsManageWalletsOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/80 hover:bg-secondary border border-border/80 active:scale-95 transition-all shadow-2xs cursor-pointer group"
          aria-label="Manage Wallets"
          title="Click to manage or switch wallets"
          data-testid="header-wallet-switcher"
        >
          <WalletIcon className="w-3.5 h-3.5 text-primary group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold text-foreground tracking-tight max-w-28 sm:max-w-36 truncate">
            {activeWallet?.name || 'My Wallet'}
          </span>
          <ChevronDown className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors" />
        </button>

        <NetworkIndicator />
        <SyncStatusButton />
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={toggleTheme}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-secondary/50 hover:bg-secondary border border-border/60 active:scale-95 transition-all text-muted-foreground hover:text-foreground cursor-pointer shadow-2xs"
          aria-label={`Toggle theme (currently ${resolvedTheme})`}
          title={`Current theme: ${resolvedTheme}. Click to toggle.`}
          data-testid="header-theme-toggle"
        >
          {resolvedTheme === 'light' ? (
            <Moon className="w-4.5 h-4.5 text-primary" />
          ) : resolvedTheme === 'oled' ? (
            <Sparkles className="w-4.5 h-4.5 text-amber-400" />
          ) : (
            <Sun className="w-4.5 h-4.5 text-yellow-400" />
          )}
        </button>
        <NotificationBell />
        <SettingsDropdown />
      </div>

      <ConnectDappModal
        isOpen={isConnectOpen}
        onClose={() => setIsConnectOpen(false)}
      />

      <SettingsWalletsModal
        isOpen={isManageWalletsOpen}
        onClose={() => setIsManageWalletsOpen(false)}
      />
    </header>
  );
};
