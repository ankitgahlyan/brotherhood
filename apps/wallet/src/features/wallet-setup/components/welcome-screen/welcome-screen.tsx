/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState } from 'react';
import { LayoutGrid, Eye, ALargeSmall } from 'lucide-react';
import { useNavigate } from '@/core/routing';
import { useAuth, usePreferences } from '@demo/wallet-core';

import { AddWalletModal } from '../add-wallet-modal';
import type { AddWalletMode } from '../add-wallet-modal';
import { WALLET_SETUP_ROUTE } from '../../routes';
import type { WalletSetupMode } from '../../routes';

import { CenteredScreen } from '@/core/components/shared/centered-screen';
import { Button } from '@/core/components/ui/button';
import {
  useTheme,
  MIN_TEXT_SCALE,
  MAX_TEXT_SCALE,
  TEXT_SCALE_STEP,
} from '@/core/theme';
import { assetUrl } from '@/core/utils';

const WELCOME_TEXT_PRESETS: { label: string; scale: number }[] = [
  { label: 'Compact', scale: 90 },
  { label: 'Standard', scale: 100 },
  { label: 'Large', scale: 115 },
  { label: 'Senior', scale: 130 },
];

/** First screen for a brand-new user: intro + entry into wallet setup. */
export const WelcomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const { isPasswordSet, isUnlocked, currentPassword } = useAuth();
  const { viewMode, setViewMode } = usePreferences();
  const { textScale, setTextScale, stepTextScale } = useTheme();
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

        {/* Compact Text Size Control (Presets + A− / A+) */}
        <div
          className="mt-3 w-full max-w-xs rounded-2xl bg-secondary/70 border border-border p-2.5 flex flex-col gap-2"
          data-testid="welcome-text-size-control"
        >
          <div className="flex items-center justify-between px-1">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
              <ALargeSmall className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>Text Size: {textScale}%</span>
            </span>
            <div className="inline-flex items-center gap-1">
              <button
                type="button"
                onClick={() => stepTextScale(-TEXT_SCALE_STEP)}
                disabled={textScale <= MIN_TEXT_SCALE}
                className="min-w-8 min-h-7 px-2 rounded-lg bg-card border border-border text-[11px] font-bold text-foreground hover:bg-secondary/80 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Decrease text size"
                data-testid="welcome-text-scale-dec"
              >
                A−
              </button>
              <button
                type="button"
                onClick={() => stepTextScale(TEXT_SCALE_STEP)}
                disabled={textScale >= MAX_TEXT_SCALE}
                className="min-w-8 min-h-7 px-2 rounded-lg bg-card border border-border text-[11px] font-bold text-foreground hover:bg-secondary/80 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Increase text size"
                data-testid="welcome-text-scale-inc"
              >
                A+
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 keep-cols gap-1">
            {WELCOME_TEXT_PRESETS.map((preset) => {
              const isActive = textScale === preset.scale;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setTextScale(preset.scale)}
                  className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-[10px] font-medium border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-card text-foreground border-primary/40 shadow-xs font-semibold ring-1 ring-primary/30'
                      : 'bg-background/50 text-muted-foreground border-border hover:text-foreground'
                  }`}
                  aria-label={`Set text scale to ${preset.label} (${preset.scale}%)`}
                  aria-pressed={isActive}
                  data-testid={`welcome-text-preset-${preset.label.toLowerCase()}`}
                >
                  <span className="truncate w-full text-center">
                    {preset.label}
                  </span>
                </button>
              );
            })}
          </div>
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
