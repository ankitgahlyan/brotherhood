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
  Copy,
  Download,
  Fingerprint,
  KeyRound,
  Lock,
  Palette,
  QrCode,
  Share2,
  Trash2,
  X,
  Users,
  DatabaseZap,
  Radio,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useDeveloperMode,
  setDeveloperModalOpen,
} from '@/core/lib/developer-mode';
import { setSettingsModalOpen } from '@/core/lib/settings-modal-state';
import { InstallPromptDialog } from '@/core/components/pwa';
import { usePwaInstall } from '@/core/hooks/use-pwa-install';
import { useAuth, useWallet } from '@demo/wallet-core';
import { hasTelegramBiometricManager } from '@/core/security/biometrics';
import { useBiometrics } from '@/core/security/use-biometrics';
import { usePasskeyWallets } from '@/core/security/use-passkey-wallets';
import type { PasskeyWalletStatusItem } from '@/core/security/use-passkey-wallets';

import { ToggleRow } from '../toggle-row';
import { AppearanceModal } from '../appearance';
import { ContactsManagerModal } from '../contacts-manager';
import { StorageManagerModal } from '../storage-manager/storage-manager-modal';
import { TonconnectAppsModal } from '../tonconnect-apps/tonconnect-apps-modal';

import { MnemonicDisplay, StyledQrCode } from '@/features/wallets';
import { createComponentLogger } from '@/core/lib/logger';
import { Modal } from '@/core/components/ui/modal';
import { cn } from '@/core/lib/utils';
import { Button } from '@/core/components/ui/button';
import { SettingsIcon } from '@/core/components/ui/icons';

const log = createComponentLogger('SettingsDropdown');
const BROTHERHOOD_WEB_APP_URL =
  'https://ankitgahlyan.github.io/brotherhood/web/';

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
    className={`w-full flex items-center gap-3 px-4 py-3 min-h-(--touch-target) text-left transition-colors cursor-pointer select-none disabled:opacity-50 ${
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

export const SettingsDropdown: React.FC = () => {
  const {
    lock,
    reset,
    currentPassword,
    persistPassword,
    setPersistPassword,
    holdToSign,
    setHoldToSign,
    slideToSign,
    setSlideToSign,
    showFastSend,
    setShowFastSend,
  } = useAuth();
  const { getDecryptedMnemonic, savedWallets, activeWalletId } = useWallet();
  const activeSavedWallet = savedWallets.find((w) => w.id === activeWalletId);
  const isWatchOnly =
    activeSavedWallet?.walletType === 'watch-only' ||
    Boolean(activeSavedWallet?.isWatchOnly);
  const {
    isSupported: isBiometricsSupported,
    isEnabled: isBiometricsEnabled,
    isInsecureContext: isBiometricsInsecure,
    register: registerBiometrics,
    disable: disableBiometrics,
  } = useBiometrics();
  const {
    isBackingUp: isBackingUpPasskey,
    backupAllWallets,
    getWalletBackupStatuses,
    syncEncryptedVault,
  } = usePasskeyWallets();
  const mnemonicWalletsCount = savedWallets.filter(
    (w) => Boolean(w.encryptedMnemonic) && !w.isWatchOnly,
  ).length;

  const [panel, setPanelState] = useState<
    'menu' | 'mnemonic' | 'passkey' | null
  >(null);

  const setPanel = (next: 'menu' | 'mnemonic' | 'passkey' | null) => {
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
  const { deferredPrompt, isStandalone, isInstalled, installStandalone } =
    usePwaInstall();
  const [isAppearanceOpen, setIsAppearanceOpen] = useState(false);
  const [isContactsOpen, setIsContactsOpen] = useState(false);
  const [isStorageManagerOpen, setIsStorageManagerOpen] = useState(false);
  const [isTonConnectAppsOpen, setIsTonConnectAppsOpen] = useState(false);
  const [isShareAppOpen, setIsShareAppOpen] = useState(false);

  const handleCopyAppUrl = async () => {
    try {
      await navigator.clipboard.writeText(BROTHERHOOD_WEB_APP_URL);
      toast.success('App link copied');
    } catch {
      toast.error('Failed to copy app link');
    }
  };

  const handleShareAppUrl = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: 'Brotherhood Wallet',
          url: BROTHERHOOD_WEB_APP_URL,
        });
      } else {
        await handleCopyAppUrl();
      }
    } catch (err: unknown) {
      if ((err as { name?: string })?.name !== 'AbortError') {
        await handleCopyAppUrl();
      }
    }
  };

  const [mnemonic, setMnemonic] = useState<string[]>([]);
  const [isLoadingMnemonic, setIsLoadingMnemonic] = useState(false);
  const [mnemonicError, setMnemonicError] = useState('');
  const [passkeyStatuses, setPasskeyStatuses] = useState<
    PasskeyWalletStatusItem[]
  >([]);
  const [savingPasskeyWalletId, setSavingPasskeyWalletId] = useState<
    string | null
  >(null);

  const [isDeveloperMode, setDeveloperMode] = useDeveloperMode();
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
      const nextDevMode = !isDeveloperMode;
      setDeveloperMode(nextDevMode);
      if (nextDevMode) {
        setDeveloperModalOpen(true);
        toast.success('Developer Mode enabled!');
      } else {
        setDeveloperModalOpen(false);
        toast.info('Developer Mode disabled');
      }
      setPanel(null);
    } else if (nextCount >= 4) {
      const remaining = 7 - nextCount;
      toast.info(
        `You are ${remaining} ${remaining === 1 ? 'step' : 'steps'} away from ${isDeveloperMode ? 'disabling' : 'enabling'} Developer Mode`,
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

  const handleBackupToPasskey = async () => {
    if (isBiometricsInsecure) {
      toast.error(
        'Passkeys require a secure connection (HTTPS). On mobile browsers, please access via HTTPS or use Telegram.',
      );
      return;
    }
    try {
      if (mnemonicWalletsCount > 1 && !hasTelegramBiometricManager()) {
        await syncEncryptedVault();
        const statuses = await getWalletBackupStatuses();
        setPasskeyStatuses(statuses);
        setPanel('passkey');
        return;
      }

      const savedCount = await backupAllWallets();
      if (savedCount > 0) {
        toast.success(
          savedCount === 1
            ? 'Wallet recovery phrase saved to Passkey'
            : `Saved ${savedCount} wallets to Passkey`,
        );
      }
    } catch (error) {
      log.error('Failed to backup wallets to Passkey:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to back up wallets to Passkey',
      );
    }
  };

  const handleSaveSingleWalletToPasskey = async (walletId: string) => {
    setSavingPasskeyWalletId(walletId);
    try {
      const savedCount = await backupAllWallets([], walletId);
      const statuses = await getWalletBackupStatuses();
      setPasskeyStatuses(statuses);
      if (savedCount > 0) {
        toast.success(
          `Passkey saved & all ${savedCount} wallets synced to encrypted vault`,
        );
      }
    } catch (error) {
      log.error('Failed to save wallet Passkey:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to save wallet to Passkey',
      );
    } finally {
      setSavingPasskeyWalletId(null);
    }
  };

  return (
    <>
      <button
        onClick={handleOpenMenu}
        className="min-w-10 min-h-10 flex items-center justify-center rounded-xl bg-secondary/50 hover:bg-secondary border border-border/60 active:scale-95 transition-all text-foreground cursor-pointer shadow-2xs"
        aria-label="Settings"
        data-testid="wallet-menu"
      >
        <SettingsIcon className="w-5 h-5 text-foreground" />
      </button>

      <Modal.Container
        isOpened={panel === 'menu'}
        onOpenChange={(open) => !open && handleCloseMenu()}
        className="max-w-md h-[90vh] md:h-[85vh] flex flex-col p-0 overflow-hidden"
      >
        <div className="flex-1 flex flex-col min-h-0 bg-background text-foreground overflow-hidden">
          {/* Header */}
          <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border px-4 py-3 pt-[calc(0.75rem+var(--tg-safe-area-top,0px))] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-primary" />
              <h2 className="text-base font-bold text-foreground">Settings</h2>
            </div>
            <button
              type="button"
              onClick={() => setPanel(null)}
              className="px-3 py-1.5 min-h-10 rounded-lg bg-secondary hover:bg-secondary/80 text-xs font-semibold border border-border transition-colors flex items-center gap-1 cursor-pointer"
              aria-label="Close settings"
            >
              <X className="w-3.5 h-3.5" />
              <span>Close</span>
            </button>
          </header>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto min-h-0 overscroll-contain px-4 py-4 flex flex-col gap-4 pb-12">
            {/* Section 1: Appearance & Motion */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1 mb-1.5 block">
                Appearance &amp; Accessibility
              </span>
              <div className="rounded-2xl bg-secondary/60 divide-y divide-border overflow-hidden border border-border">
                <ActionRow
                  icon={<Palette className="w-5 h-5 text-primary" />}
                  label="Appearance & Accessibility"
                  subtitle="Themes, Liquid Glass, text size & motion"
                  onClick={() => {
                    setPanel(null);
                    setIsAppearanceOpen(true);
                  }}
                />
              </div>
            </div>

            {/* Section 2: Security & Signing */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1 mb-1.5 block">
                Security &amp; Signing
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
                  />
                )}
                <ToggleRow
                  testId="auto-lock"
                  label="Auto-Lock"
                  description="Lock wallet on app reload"
                  checked={!persistPassword}
                  onChange={(checked) => setPersistPassword(!checked)}
                />
                <div className="flex items-center justify-between gap-3 px-4 py-3 min-h-(--touch-target)">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-foreground">
                      Action Confirmation
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 leading-snug">
                      {slideToSign
                        ? 'Slide left to right to approve sends and signing'
                        : holdToSign
                          ? 'Hold action buttons to approve sends and signing'
                          : 'Click action buttons normally'}
                    </div>
                  </div>
                  <div className="inline-flex items-center rounded-xl bg-secondary/80 p-1 border border-border/60 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setHoldToSign(false);
                        setSlideToSign(false);
                      }}
                      className={cn(
                        'px-2.5 py-1.5 min-h-9 text-[11px] font-semibold rounded-lg transition-all cursor-pointer',
                        !holdToSign && !slideToSign
                          ? 'bg-primary text-primary-foreground shadow-2xs'
                          : 'text-muted-foreground hover:text-foreground',
                      )}
                      data-testid="click-to-sign"
                    >
                      Off
                    </button>
                    <button
                      type="button"
                      onClick={() => setHoldToSign(true)}
                      className={cn(
                        'px-2.5 py-1.5 min-h-9 text-[11px] font-semibold rounded-lg transition-all cursor-pointer',
                        holdToSign && !slideToSign
                          ? 'bg-primary text-primary-foreground shadow-2xs'
                          : 'text-muted-foreground hover:text-foreground',
                      )}
                      data-testid="hold-to-sign"
                    >
                      Hold
                    </button>
                    <button
                      type="button"
                      onClick={() => setSlideToSign(true)}
                      className={cn(
                        'px-2.5 py-1.5 min-h-9 text-[11px] font-semibold rounded-lg transition-all cursor-pointer',
                        slideToSign
                          ? 'bg-primary text-primary-foreground shadow-2xs'
                          : 'text-muted-foreground hover:text-foreground',
                      )}
                      data-testid="slide-to-sign"
                    >
                      Slide
                    </button>
                  </div>
                </div>
                <ToggleRow
                  testId="show-fast-send"
                  label="Fast Send"
                  description="Sign transactions instantly without modal popups"
                  checked={showFastSend ?? false}
                  onChange={setShowFastSend}
                />
                {isDeveloperMode && (
                  <ToggleRow
                    testId="developer-mode-toggle"
                    label="Developer Mode"
                    description="Show contract routing details & diagnostics"
                    checked={isDeveloperMode}
                    onChange={(checked) => {
                      setDeveloperMode(checked);
                      if (!checked) {
                        setDeveloperModalOpen(false);
                        toast.info('Developer Mode disabled');
                      }
                    }}
                  />
                )}
                {!isWatchOnly && (
                  <ActionRow
                    icon={<KeyRound className="w-5 h-5 text-primary" />}
                    label={
                      isLoadingMnemonic ? 'Decrypting…' : 'View Recovery Phrase'
                    }
                    subtitle="Reveal seed phrase backup"
                    onClick={handleViewRecoveryPhrase}
                    disabled={isLoadingMnemonic}
                  />
                )}
                {!isWatchOnly &&
                  mnemonicWalletsCount > 0 &&
                  (isBiometricsSupported || isBiometricsInsecure) && (
                    <ActionRow
                      icon={<Fingerprint className="w-5 h-5 text-primary" />}
                      label={
                        isBackingUpPasskey
                          ? 'Saving to Passkey…'
                          : 'Backup Wallets to Passkey'
                      }
                      subtitle={
                        mnemonicWalletsCount > 1
                          ? `Save all ${mnemonicWalletsCount} wallet phrases to mobile keystore`
                          : 'Save recovery phrase to mobile keystore'
                      }
                      onClick={() => {
                        void handleBackupToPasskey();
                      }}
                      disabled={isBackingUpPasskey}
                    />
                  )}
                <ActionRow
                  icon={<Lock className="w-5 h-5 text-muted-foreground" />}
                  label="Lock Wallet"
                  subtitle="Require passcode on next action"
                  onClick={handleLockWallet}
                />
              </div>
            </div>

            {/* Section 3: Data & Connected Apps */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1 mb-1.5 block">
                Data & Connections
              </span>
              <div className="rounded-2xl bg-secondary/60 divide-y divide-border overflow-hidden border border-border">
                <ActionRow
                  icon={<Radio className="w-5 h-5 text-primary" />}
                  label="Connected dApps"
                  subtitle="Manage TonConnect active sessions"
                  onClick={() => {
                    setPanel(null);
                    setIsTonConnectAppsOpen(true);
                  }}
                />
                <ActionRow
                  icon={<Users className="w-5 h-5 text-primary" />}
                  label="Address Book & Contacts"
                  subtitle="Manage and export saved contacts"
                  onClick={() => {
                    setPanel(null);
                    setIsContactsOpen(true);
                  }}
                />
                <ActionRow
                  icon={<DatabaseZap className="w-5 h-5 text-primary" />}
                  label="Storage & Cache Manager"
                  subtitle="Manage local storage, history & traces"
                  onClick={() => {
                    setPanel(null);
                    setIsStorageManagerOpen(true);
                  }}
                />
                {!isStandalone && !isInstalled && (
                  <ActionRow
                    icon={<Download className="w-5 h-5 text-primary" />}
                    label="Install App"
                    subtitle="Install standalone app on your device"
                    onClick={async () => {
                      setPanel(null);
                      if (deferredPrompt) {
                        await installStandalone();
                      } else {
                        setIsInstallOpen(true);
                      }
                    }}
                  />
                )}
                <ActionRow
                  icon={<QrCode className="w-5 h-5 text-primary" />}
                  label="Share App"
                  subtitle="Show QR code & link to Brotherhood web app"
                  onClick={() => {
                    setPanel(null);
                    setIsShareAppOpen(true);
                  }}
                />
              </div>
            </div>

            {/* Section 4: Danger Zone */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-red-400/80 px-1 mb-1.5 block">
                Danger Zone
              </span>
              <div className="rounded-2xl bg-secondary/60 divide-y divide-border overflow-hidden border border-border">
                <ActionRow
                  icon={<Trash2 className="w-5 h-5 text-red-500" />}
                  label="Delete Wallet"
                  subtitle="Wipe this wallet from device"
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
            className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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

      <Modal.Container
        isOpened={panel === 'passkey'}
        onOpenChange={(open) => !open && setPanel(null)}
        className="px-2 max-w-md"
      >
        <Modal.Header onClose={() => setPanel(null)}>
          <div className="flex items-center gap-2">
            <Fingerprint className="w-5 h-5 text-primary" />
            <Modal.Title>Passkey Backup</Modal.Title>
          </div>
        </Modal.Header>
        <Modal.Body className="gap-3 px-3 pb-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Saving any wallet below encrypts all {passkeyStatuses.length}{' '}
            wallets into your local Passkey vault for instant 1-tap restore. You
            can also save each wallet individually so every wallet has its own
            Passkey in your mobile keystore for cross-device recovery.
          </p>

          <div className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-secondary/40 overflow-hidden max-h-[48dvh] overflow-y-auto">
            {passkeyStatuses.map((item, idx) => {
              const shortAddr =
                item.address.length > 12
                  ? `${item.address.slice(0, 6)}…${item.address.slice(-4)}`
                  : item.address;
              const isSavingThis = savingPasskeyWalletId === item.id;
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 px-3.5 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground truncate">
                        {idx + 1}. {item.payload.name}
                      </span>
                      <span className="text-[10px] font-medium uppercase px-1.5 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
                        {item.payload.network}
                      </span>
                      {item.isBackedUp ? (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                          Saved ✓
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25">
                          Pending
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono mt-0.5">
                      {shortAddr}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={item.isBackedUp ? 'gray' : 'primary'}
                    loading={isSavingThis}
                    disabled={isBackingUpPasskey}
                    onClick={() => {
                      void handleSaveSingleWalletToPasskey(item.id);
                    }}
                    data-testid={`passkey-save-wallet-${idx}`}
                  >
                    {item.isBackedUp ? 'Update' : 'Save'}
                  </Button>
                </div>
              );
            })}
          </div>

          {(() => {
            const nextPendingIdx = passkeyStatuses.findIndex(
              (w) => !w.isBackedUp,
            );
            const backedUpTotal = passkeyStatuses.filter(
              (w) => w.isBackedUp,
            ).length;
            if (nextPendingIdx !== -1) {
              const nextItem = passkeyStatuses[nextPendingIdx];
              return (
                <Button
                  fullWidth
                  loading={isBackingUpPasskey}
                  disabled={isBackingUpPasskey}
                  onClick={() => {
                    void handleSaveSingleWalletToPasskey(nextItem.id);
                  }}
                  data-testid="passkey-save-next"
                >
                  Save &ldquo;{nextItem.payload.name}&rdquo; (
                  {backedUpTotal + 1} of {passkeyStatuses.length})
                </Button>
              );
            }
            return (
              <Button
                fullWidth
                variant="gray"
                onClick={() => setPanel(null)}
                data-testid="passkey-backup-done"
              >
                All {passkeyStatuses.length} wallets backed up ✓ — Done
              </Button>
            );
          })()}
        </Modal.Body>
      </Modal.Container>

      <InstallPromptDialog
        open={isInstallOpen}
        onOpenChange={setIsInstallOpen}
      />

      <AppearanceModal
        isOpen={isAppearanceOpen}
        onClose={() => setIsAppearanceOpen(false)}
      />

      <ContactsManagerModal
        isOpen={isContactsOpen}
        onClose={() => setIsContactsOpen(false)}
      />

      <StorageManagerModal
        isOpen={isStorageManagerOpen}
        onClose={() => setIsStorageManagerOpen(false)}
      />

      <TonconnectAppsModal
        isOpen={isTonConnectAppsOpen}
        onClose={() => setIsTonConnectAppsOpen(false)}
      />

      <Modal.Container
        isOpened={isShareAppOpen}
        onOpenChange={(open) => !open && setIsShareAppOpen(false)}
        className="px-2"
      >
        <Modal.Header onClose={() => setIsShareAppOpen(false)}>
          <Modal.Title>Share App</Modal.Title>
        </Modal.Header>

        <Modal.Body className="items-center gap-4">
          <div className="rounded-2xl border border-border p-4 bg-card shadow-sm">
            <StyledQrCode
              value={BROTHERHOOD_WEB_APP_URL}
              walletKey="brotherhood_app_url"
            />
          </div>

          <button
            type="button"
            onClick={() => void handleCopyAppUrl()}
            className="w-full flex items-center gap-2 bg-secondary/70 border border-border rounded-2xl px-4 py-3 text-left hover:bg-secondary transition-colors cursor-pointer"
            aria-label="Copy app link"
            data-testid="share-app-copy-url"
          >
            <span className="flex-1 min-w-0 text-sm font-mono text-foreground break-all">
              {BROTHERHOOD_WEB_APP_URL}
            </span>
            <Copy className="w-4 h-4 text-muted-foreground shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => void handleShareAppUrl()}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-primary text-primary-foreground hover:opacity-90 font-semibold text-xs shadow-xs transition-opacity cursor-pointer"
            data-testid="share-app-link-button"
          >
            <Share2 className="w-4 h-4 shrink-0" />
            <span>Share Link</span>
          </button>
        </Modal.Body>
      </Modal.Container>
    </>
  );
};
