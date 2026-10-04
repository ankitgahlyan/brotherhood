/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState } from 'react';
import { LayoutGrid, Eye } from 'lucide-react';
import { useNavigate } from '@/core/routing';
import { useAuth, usePreferences } from '@demo/wallet-core';

import { AddWalletModal } from '../add-wallet-modal';
import type { AddWalletMode } from '../add-wallet-modal';
import { WALLET_SETUP_ROUTE } from '../../routes';
import type { WalletSetupMode } from '../../routes';

import { CenteredScreen } from '@/core/components/shared/centered-screen';
import { Button } from '@/core/components/ui/button';
import { assetUrl } from '@/core/utils';

/** First screen for a brand-new user: intro + entry into wallet setup. */
export const WelcomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const { isPasswordSet, isUnlocked, currentPassword } = useAuth();
  const { viewMode, setViewMode } = usePreferences();
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Brand-new users set a PIN first; an already-authenticated user (no wallet) goes straight in.
  const start = (tab: WalletSetupMode) => {
    if (isPasswordSet && isUnlocked && currentPassword) {
      navigate(WALLET_SETUP_ROUTE[tab]);
    } else if (isPasswordSet) {
      navigate('/unlock', { state: { tab } });
    } else {
      navigate('/setup-password', { state: { tab } });
    }
  };

  const handleAddSelect = (mode: AddWalletMode) => {
    setIsAddOpen(false);
    start(mode);
  };

  const footer = (
    <div className="flex flex-col gap-2">
      <Button
        fullWidth
        onClick={() => setIsAddOpen(true)}
        data-testid="welcome-add-wallet"
      >
        Add wallet
      </Button>
      <p className="pt-1 text-center text-xs text-muted-foreground">
        By continuing, you agree to the{' '}
        <a href="#" className="text-primary hover:underline">
          Terms
        </a>{' '}
        and{' '}
        <a href="#" className="text-primary hover:underline">
          Privacy Policy
        </a>
      </p>
    </div>
  );

  return (
    <CenteredScreen footer={footer}>
      <div className="flex flex-col items-center text-center px-6">
        <img
          src={assetUrl('favicon.svg')}
          alt="BrotherHood Wallet"
          width={160}
          height={160}
          className="w-40 h-40 object-contain"
        />
        <h1 className="mt-6 text-2xl font-bold text-foreground">
          Your TON wallet
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          Create a new wallet or add an existing one to start sending and
          receiving GRAM.
        </p>

        {/* Global Accessibility Mode Switch (Standard vs Pictorial) */}
        <div className="mt-5 inline-flex items-center p-1 rounded-xl bg-secondary/80 border border-border text-xs">
          <button
            type="button"
            onClick={() => setViewMode('standard')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              viewMode !== 'icons_only'
                ? 'bg-card text-foreground shadow-xs font-semibold border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            data-testid="welcome-viewmode-standard"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-primary" />
            <span>Standard</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('icons_only')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              viewMode === 'icons_only'
                ? 'bg-card text-foreground shadow-xs font-semibold border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            data-testid="welcome-viewmode-pictorial"
          >
            <Eye className="w-3.5 h-3.5 text-amber-500" />
            <span>Pictorial</span>
          </button>
        </div>
      </div>

      <AddWalletModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSelect={handleAddSelect}
      />
    </CenteredScreen>
  );
};
