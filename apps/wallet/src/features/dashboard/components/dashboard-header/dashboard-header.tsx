/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState } from 'react';
import { Moon, Sun, Sparkles } from 'lucide-react';
import { useTonConnect } from '@demo/wallet-core';
import { useTheme } from '@/core/theme';

import { SettingsDropdown } from '@/features/settings';
import { NotificationBell } from '@/features/notifications';
import { ConnectDappModal } from '@/features/ton-connect';
import { ScanIcon } from '@/core/components/ui/icons';
import { usePasteHandler } from '@/core/hooks';
import { NetworkIndicator } from '@/core/components/shared/network-indicator';
import { SyncStatusButton } from '../sync-status-button';

export const DashboardHeader: React.FC = () => {
  const [isConnectOpen, setIsConnectOpen] = useState(false);

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
    </header>
  );
};
