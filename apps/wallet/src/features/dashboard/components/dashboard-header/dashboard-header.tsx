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
  Coffee,
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
    <header className="flex items-center justify-between gap-2 px-4 py-3">
      <button
        type="button"
        onClick={() => setIsConnectOpen(true)}
        className="relative min-w-10 min-h-10 flex items-center justify-center rounded-xl bg-secondary/30 hover:bg-secondary/50 border border-border/60 active:scale-95 transition-all text-foreground cursor-pointer shadow-2xs shrink-0"
        aria-label="Scan"
        data-testid="connect-dapp-button"
      >
        <span className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <NetworkIndicator className="pointer-events-none" />
        </span>
        <ScanIcon className="relative z-10 w-5 h-5 text-foreground/85 pointer-events-none" />
      </button>

      <div className="flex items-center gap-2 min-w-0">
        <SyncStatusButton />

        <button
          type="button"
          onClick={() => setIsManageWalletsOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-10 rounded-full bg-secondary/80 hover:bg-secondary border border-border/80 active:scale-95 transition-all shadow-2xs cursor-pointer group min-w-0"
          aria-label="Manage Wallets"
          title="Click to manage or switch wallets"
          data-testid="header-wallet-switcher"
        >
          <WalletIcon className="w-3.5 h-3.5 text-primary group-hover:scale-110 transition-transform shrink-0" />
          <span className="text-xs font-bold text-foreground tracking-tight max-w-28 sm:max-w-36 truncate">
            {activeWallet?.name || 'My Wallet'}
          </span>
          <ChevronDown className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
        </button>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={toggleTheme}
          className="min-w-10 min-h-10 flex items-center justify-center rounded-xl bg-secondary/50 hover:bg-secondary border border-border/60 active:scale-95 transition-all text-muted-foreground hover:text-foreground cursor-pointer shadow-2xs"
          aria-label={`Toggle theme (currently ${resolvedTheme})`}
          title={`Current theme: ${resolvedTheme}. Click to toggle.`}
          data-testid="header-theme-toggle"
        >
          {resolvedTheme === 'light' ? (
            <Sun className="w-4.5 h-4.5 text-amber-500" />
          ) : resolvedTheme === 'warm' ? (
            <Coffee className="w-4.5 h-4.5 text-amber-600" />
          ) : resolvedTheme === 'oled' ? (
            <Sparkles className="w-4.5 h-4.5 text-amber-400" />
          ) : (
            <Moon className="w-4.5 h-4.5 text-primary" />
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
