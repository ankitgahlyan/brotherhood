/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState, useRef } from 'react';
import {
  ChevronRight,
  Download,
  KeyRound,
  Lock,
  Moon,
  Monitor,
  Palette,
  Sun,
  Sparkles,
  Trash2,
  Check,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useDeveloperMode,
  setDeveloperModalOpen,
} from '@/core/lib/developer-mode';
import { setSettingsModalOpen } from '@/core/lib/settings-modal-state';
import { InstallPromptDialog } from '@/core/components/pwa';
import { useAuth, useWallet } from '@demo/wallet-core';
import { useTheme } from '@/core/theme';
import type { ThemeMode, ColorPalette } from '@/core/theme';
import { useBiometrics } from '@/core/security/use-biometrics';

import { ToggleRow } from '../toggle-row';
import { AnimationSettingsCard } from '../animation-settings-card';

import { MnemonicDisplay } from '@/features/wallets';
import { createComponentLogger } from '@/core/lib/logger';
import { Modal } from '@/core/components/ui/modal';
import { Button } from '@/core/components/ui/button';
import { SettingsIcon } from '@/core/components/ui/icons';

const log = createComponentLogger('SettingsDropdown');

interface ActionRowProps {
  icon: React.ReactNode;
  label: string;
  subtitle?: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

const ActionRow: React.FC<ActionRowProps> = ({
  icon,
  label,
  subtitle,
  onClick,
  danger = false,
  disabled = false,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors disabled:opacity-50 ${
      danger
        ? 'text-red-500 hover:bg-red-500/10'
        : 'text-foreground hover:bg-muted/80'
    }`}
  >
    <span className="shrink-0 text-muted-foreground">{icon}</span>
    <div className="flex-1 min-w-0">
      <div className="text-sm font-semibold truncate">{label}</div>
      {subtitle && (
        <div className="text-xs text-muted-foreground truncate">{subtitle}</div>
      )}
    </div>
    <ChevronRight
      className={`w-4 h-4 shrink-0 ${danger ? 'text-red-400' : 'text-muted-foreground'}`}
    />
  </button>
);

const THEME_OPTIONS: {
  mode: ThemeMode;
  label: string;
  icon: React.ReactNode;
}[] = [
  { mode: 'system', label: 'System', icon: <Monitor className="w-4 h-4" /> },
  { mode: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
  { mode: 'dark', label: 'Midnight', icon: <Moon className="w-4 h-4" /> },
  { mode: 'oled', label: 'OLED', icon: <Sparkles className="w-4 h-4" /> },
];

const PALETTE_OPTIONS: {
  id: ColorPalette;
  name: string;
  gradientClass: string;
}[] = [
  {
    id: 'violet',
    name: 'Brotherhood',
    gradientClass: 'from-purple-600 to-indigo-600',
  },
  {
    id: 'ton',
    name: 'TON Ocean',
    gradientClass: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'emerald',
    name: 'Emerald',
    gradientClass: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'sunset',
    name: 'Sunset',
    gradientClass: 'from-amber-500 to-rose-500',
  },
  {
    id: 'fuchsia',
    name: 'Fuchsia',
    gradientClass: 'from-pink-500 to-fuchsia-600',
  },
];

export const SettingsDropdown: React.FC = () => {
  const { theme, setTheme, palette, setPalette } = useTheme();

  const {
    lock,
    reset,
    currentPassword,
    persistPassword,
    setPersistPassword,
    holdToSign,
    setHoldToSign,
    showFastSend,
    setShowFastSend,
  } = useAuth();
  const { getDecryptedMnemonic } = useWallet();
  const {
    isSupported: isBiometricsSupported,
    isEnabled: isBiometricsEnabled,
    isInsecureContext: isBiometricsInsecure,
    register: registerBiometrics,
    disable: disableBiometrics,
  } = useBiometrics();

  const [panel, setPanelState] = useState<'menu' | 'mnemonic' | null>(null);

  const setPanel = (next: 'menu' | 'mnemonic' | null) => {
    setPanelState(next);
    setSettingsModalOpen(next !== null);
  };

  const handleOpenMenu = () => {
    setPanel('menu');
  };

  const handleCloseMenu = () => {
    setPanel(null);
  };
  const [isBiometricPromptOpen, setIsBiometricPromptOpen] = useState(false);
  const [biometricPasscode, setBiometricPasscode] = useState('');
  const [biometricError, setBiometricError] = useState('');
  const [isBiometricRegistering, setIsBiometricRegistering] = useState(false);
  const [isInstallOpen, setIsInstallOpen] = useState(false);

  const [mnemonic, setMnemonic] = useState<string[]>([]);
  const [isLoadingMnemonic, setIsLoadingMnemonic] = useState(false);
  const [mnemonicError, setMnemonicError] = useState('');

  const [, setDeveloperMode] = useDeveloperMode();
  const [devTapCount, setDevTapCount] = useState(0);
  const devTapTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleBrotherhoodTap = () => {
    if (devTapTimerRef.current) {
      clearTimeout(devTapTimerRef.current);
    }

    devTapTimerRef.current = setTimeout(() => {
      setDevTapCount(0);
    }, 2500);

    const nextCount = devTapCount + 1;
    setDevTapCount(nextCount);

    if (nextCount >= 7) {
      setDevTapCount(0);
      setDeveloperMode(true);
      setDeveloperModalOpen(true);
      toast.success('Developer Mode enabled!');
      setPanel(null);
    } else if (nextCount >= 4) {
      const remaining = 7 - nextCount;
      toast.info(
        `You are ${remaining} ${remaining === 1 ? 'step' : 'steps'} away from Developer Mode`,
      );
    }
  };

  const handleToggleBiometrics = async (checked: boolean) => {
    if (isBiometricsInsecure) {
      toast.error(
        'Biometrics requires a secure connection (HTTPS). On mobile browsers, please access via HTTPS or use Telegram.',
      );
      return;
    }
    if (!checked) {
      disableBiometrics();
    } else {
      if (currentPassword) {
        try {
          await registerBiometrics(currentPassword);
        } catch (e) {
          log.error('Failed to enable biometrics:', e);
          toast.error(
            e instanceof Error ? e.message : 'Failed to enable biometrics',
          );
        }
      } else {
        setBiometricPasscode('');
        setBiometricError('');
        setIsBiometricPromptOpen(true);
      }
    }
  };

  const handleLockWallet = () => {
    setPanel(null);
    lock();
  };

  const handleDeleteWallet = () => {
    if (
      window.confirm(
        'Are you sure you want to delete your wallet? This action cannot be undone.',
      )
    ) {
      setPanel(null);
      disableBiometrics();
      reset();
    }
  };

  const handleViewRecoveryPhrase = async () => {
    setIsLoadingMnemonic(true);
    setMnemonicError('');

    try {
      const decryptedMnemonic = await getDecryptedMnemonic();
      if (decryptedMnemonic) {
        setMnemonic(decryptedMnemonic);
        setPanel('mnemonic');
      } else {
        setMnemonicError(
          'Unable to retrieve recovery phrase. Please ensure you are logged in.',
        );
      }
    } catch (error) {
      setMnemonicError('Failed to decrypt recovery phrase. Please try again.');
      log.error('Error retrieving mnemonic:', error);
    } finally {
      setIsLoadingMnemonic(false);
    }
  };

  const handleCloseMnemonicModal = () => {
    setPanel(null);
    setMnemonic([]);
    setMnemonicError('');
  };

  return (
    <>
      <button
        onClick={handleOpenMenu}
        className="p-1.5 -mr-1.5 rounded-md hover:bg-secondary transition-colors text-foreground cursor-pointer"
        aria-label="Settings"
        data-testid="wallet-menu"
      >
        <SettingsIcon className="w-6 h-6 text-foreground" />
      </button>

      <Modal.Container
        isOpened={panel === 'menu'}
        onOpenChange={(open) => !open && handleCloseMenu()}
        className="max-w-md h-[90vh] md:h-[85vh] flex flex-col p-0 overflow-hidden"
      >
        <div className="flex-1 flex flex-col min-h-0 bg-background text-foreground overflow-hidden">
          {/* Header styled like DeveloperScreen with Close button */}
          <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border px-4 py-3 pt-[calc(0.75rem+var(--tg-safe-area-top,0px))] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-blue-500" />
              <h2 className="text-base font-bold text-foreground">Settings</h2>
            </div>
            <button
              type="button"
              onClick={() => setPanel(null)}
              className="px-2.5 py-1 rounded-lg bg-secondary hover:bg-secondary/80 text-xs font-semibold border border-border transition-colors flex items-center gap-1 cursor-pointer"
              aria-label="Close settings"
            >
              <X className="w-3.5 h-3.5" />
              <span>Close</span>
            </button>
          </header>

          {/* Scrollable body matching DeveloperScreen flex-1 overflow-y-auto min-h-0 */}
          <div className="flex-1 overflow-y-auto min-h-0 overscroll-contain px-4 py-4 flex flex-col gap-4 pb-12">
            {/* Section 1: Appearance */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1 block">
                Appearance & Theme
              </span>
              <div className="rounded-2xl bg-secondary/60 p-3 border border-border flex flex-col gap-3">
                {/* Mode Selector */}
                <div>
                  <span className="text-[11px] font-medium text-muted-foreground mb-1.5 block">
                    Display Mode
                  </span>
                  <div className="grid grid-cols-4 gap-1.5 bg-background/60 p-1 rounded-xl border border-border">
                    {THEME_OPTIONS.map((opt) => {
                      const isSelected = theme === opt.mode;
                      return (
                        <button
                          key={opt.mode}
                          type="button"
                          onClick={() => setTheme(opt.mode)}
                          className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-card text-foreground shadow-sm font-semibold border border-border'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                          }`}
                          data-testid={`theme-option-${opt.mode}`}
                        >
                          <div className="flex items-center gap-1">
                            {opt.icon}
                            {isSelected && (
                              <Check className="w-3 h-3 text-primary" />
                            )}
                          </div>
                          <span>{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Color Palette Selector */}
                <div>
                  <span className="text-[11px] font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                    <Palette className="w-3 h-3 text-primary" />
                    Color Palette
                  </span>
                  <div className="grid grid-cols-5 gap-1.5 bg-background/60 p-1.5 rounded-xl border border-border">
                    {PALETTE_OPTIONS.map((pal) => {
                      const isSelected = palette === pal.id;
                      return (
                        <button
                          key={pal.id}
                          type="button"
                          onClick={() => setPalette(pal.id)}
                          className={`flex flex-col items-center gap-1.5 py-2 px-0.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-card text-foreground shadow-sm font-semibold border border-border'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                          }`}
                          data-testid={`palette-option-${pal.id}`}
                        >
                          <span
                            className={`w-6 h-6 rounded-full bg-linear-to-tr ${pal.gradientClass} flex items-center justify-center shadow-sm transition-transform ${
                              isSelected
                                ? 'scale-110 ring-2 ring-primary ring-offset-2 ring-offset-card'
                                : 'opacity-85 hover:opacity-100 hover:scale-105'
                            }`}
                          >
                            {isSelected && (
                              <Check
                                className="w-3.5 h-3.5 text-white"
                                strokeWidth={3}
                              />
                            )}
                          </span>
                          <span className="truncate w-full text-center text-[10px] leading-tight">
                            {pal.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Animations & Motion */}
            <AnimationSettingsCard />

            {/* Section 3: Security & Preferences */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1 mb-1.5 block">
                Security & Preferences
              </span>
              <div className="rounded-2xl bg-secondary/60 divide-y divide-border overflow-hidden border border-border">
                {(isBiometricsSupported || isBiometricsInsecure) && (
                  <ToggleRow
                    testId="biometric-unlock"
                    label="Fingerprint / Biometric Unlock"
                    description={
                      isBiometricsInsecure
                        ? 'Unavailable on plain HTTP. Access via HTTPS or Telegram.'
                        : 'Unlock wallet using device fingerprint or Face ID'
                    }
                    checked={isBiometricsEnabled && !isBiometricsInsecure}
                    disabled={isBiometricsInsecure}
                    badge={
                      isBiometricsInsecure ? (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25">
                          Requires HTTPS
                        </span>
                      ) : undefined
                    }
                    onChange={handleToggleBiometrics}
                    info={
                      isBiometricsInsecure ? (
                        <>
                          <strong>HTTPS Required:</strong> Web browsers strictly
                          restrict WebAuthn platform biometrics to secure
                          contexts (HTTPS or localhost). Run dev with HTTPS or
                          open in Telegram.
                        </>
                      ) : undefined
                    }
                  />
                )}
                <ToggleRow
                  testId="auto-lock"
                  label="Auto-Lock"
                  description="Lock wallet on app reload (more secure)"
                  checked={!persistPassword}
                  onChange={(checked) => setPersistPassword(!checked)}
                  info={
                    <>
                      <strong>Security notice:</strong> when auto-lock is off,
                      your password is stored locally and the wallet stays
                      unlocked. Only use for development.
                    </>
                  }
                />
                <ToggleRow
                  testId="hold-to-sign"
                  label="Hold to Sign"
                  description="Require holding buttons to approve transactions or broadcast fast sends. Prevents accidental touches."
                  checked={holdToSign ?? true}
                  onChange={setHoldToSign}
                  info={
                    <>
                      <strong>Security notice:</strong> disabling hold-to-sign
                      makes it easier to accidentally approve transactions. Only
                      use for testing.
                    </>
                  }
                />
                <ToggleRow
                  testId="show-fast-send"
                  label="Fast send"
                  description="Automatically sign and broadcast transactions without confirmation dialogs"
                  checked={showFastSend ?? false}
                  onChange={setShowFastSend}
                />
              </div>
            </div>

            {/* Section 3: Management & Actions */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1 mb-1.5 block">
                Management & Actions
              </span>
              <div className="rounded-2xl bg-secondary/60 divide-y divide-border overflow-hidden border border-border">
                <ActionRow
                  icon={<Download className="w-5 h-5" />}
                  label="Install App / Add Shortcut"
                  onClick={() => {
                    setPanel(null);
                    setIsInstallOpen(true);
                  }}
                />
                <ActionRow
                  icon={<KeyRound className="w-5 h-5" />}
                  label={
                    isLoadingMnemonic ? 'Loading…' : 'View Recovery Phrase'
                  }
                  onClick={handleViewRecoveryPhrase}
                  disabled={isLoadingMnemonic}
                />
                <ActionRow
                  icon={<Lock className="w-5 h-5" />}
                  label="Lock Wallet"
                  onClick={handleLockWallet}
                />
                <ActionRow
                  icon={<Trash2 className="w-5 h-5" />}
                  label="Delete Wallet"
                  onClick={handleDeleteWallet}
                  danger
                />
              </div>
            </div>

            {mnemonicError && (
              <p className="text-red-500 text-sm text-center bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                {mnemonicError}
              </p>
            )}

            <div className="pt-2 pb-1 text-center">
              <button
                type="button"
                onClick={handleBrotherhoodTap}
                className="text-xs font-mono text-muted-foreground/60 hover:text-muted-foreground transition-colors select-none tracking-widest uppercase cursor-pointer py-1 px-3 rounded-md hover:bg-muted/40"
                data-testid="brotherhood-tap-easter-egg"
              >
                brotherhood
              </button>
            </div>
          </div>
        </div>
      </Modal.Container>

      <Modal.Container
        isOpened={isBiometricPromptOpen}
        onOpenChange={(open) => !open && setIsBiometricPromptOpen(false)}
        className="px-2"
      >
        <Modal.Header onClose={() => setIsBiometricPromptOpen(false)}>
          <Modal.Title>Enable Fingerprint Unlock</Modal.Title>
        </Modal.Header>
        <Modal.Body className="gap-3 p-4">
          <p className="text-xs text-muted-foreground">
            Enter your wallet passcode to register biometric authentication on
            this device.
          </p>
          <input
            type="password"
            value={biometricPasscode}
            onChange={(e) => {
              setBiometricPasscode(e.target.value);
              setBiometricError('');
            }}
            placeholder="Enter Passcode"
            className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {biometricError && (
            <p className="text-xs text-red-500">{biometricError}</p>
          )}
          <div className="flex gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              fullWidth
              onClick={() => setIsBiometricPromptOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              fullWidth
              loading={isBiometricRegistering}
              disabled={!biometricPasscode || isBiometricRegistering}
              onClick={async () => {
                setIsBiometricRegistering(true);
                try {
                  await registerBiometrics(biometricPasscode);
                  setIsBiometricPromptOpen(false);
                } catch (err) {
                  setBiometricError(
                    err instanceof Error ? err.message : 'Registration failed',
                  );
                } finally {
                  setIsBiometricRegistering(false);
                }
              }}
            >
              Enable
            </Button>
          </div>
        </Modal.Body>
      </Modal.Container>

      <Modal.Container
        isOpened={panel === 'mnemonic'}
        onOpenChange={(open) => !open && handleCloseMnemonicModal()}
        className="px-2"
      >
        <Modal.Header onClose={handleCloseMnemonicModal}>
          <Modal.Title>Recovery Phrase</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {mnemonic.length > 0 && (
            <MnemonicDisplay
              mnemonic={mnemonic}
              showWarning
              warningType="red"
              warningText="Never share your recovery phrase with anyone. Anyone with access to these words can control your wallet."
            />
          )}
        </Modal.Body>
      </Modal.Container>

      <InstallPromptDialog
        open={isInstallOpen}
        onOpenChange={setIsInstallOpen}
      />
    </>
  );
};
