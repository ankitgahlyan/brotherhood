/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState } from 'react';
import { useNavigate } from '@/core/routing';
import {
  ChevronRight,
  KeyRound,
  Lock,
  Moon,
  Monitor,
  Plus,
  Sun,
  Sparkles,
  Trash2,
  Check,
} from 'lucide-react';
import { useAuth, useWallet } from '@demo/wallet-core';
import { useTheme } from '@/core/theme';
import type { ThemeMode } from '@/core/theme';
import { useExplorer, type ExplorerChoice } from '@/core/explorer';

import { ToggleRow } from '../toggle-row';

import { MnemonicDisplay } from '@/features/wallets';
import { createComponentLogger } from '@/core/lib/logger';
import { Modal } from '@/core/components/ui/modal';
import { Button } from '@/core/components/ui/button';
import { SettingsIcon } from '@/core/components/ui/icons';
import { useBiometrics } from '@/core/security/use-biometrics';
import { CreateWalletModal, WALLET_SETUP_ROUTE } from '@/features/wallet-setup';
import type { CreateWalletMode } from '@/features/wallet-setup';

const log = createComponentLogger('SettingsDropdown');

interface ActionRowProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

const ActionRow: React.FC<ActionRowProps> = ({
  icon,
  label,
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
    <span className="flex-shrink-0 text-muted-foreground">{icon}</span>
    <span className="flex-1 text-sm font-semibold">{label}</span>
    <ChevronRight
      className={`w-4 h-4 flex-shrink-0 ${danger ? 'text-red-400' : 'text-muted-foreground'}`}
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

const getExplorerHost = (choice: ExplorerChoice, network: string): string => {
  const prefix =
    network === 'testnet' ? 'testnet.' : network === 'tetra' ? 'tetra.' : '';
  return choice === 'tonviewer'
    ? `${prefix}tonviewer.com`
    : `${prefix}tonscan.org`;
};

export const SettingsDropdown: React.FC = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { explorer, setExplorer } = useExplorer();
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
  const { getDecryptedMnemonic, network = 'testnet' } = useWallet();
  const {
    isSupported: isBiometricsSupported,
    isEnabled: isBiometricsEnabled,
    register: registerBiometrics,
    disable: disableBiometrics,
  } = useBiometrics();

  const [panel, setPanel] = useState<'menu' | 'create' | 'mnemonic' | null>(
    null,
  );
  const [isBiometricPromptOpen, setIsBiometricPromptOpen] = useState(false);
  const [biometricPasscode, setBiometricPasscode] = useState('');
  const [biometricError, setBiometricError] = useState('');
  const [isBiometricRegistering, setIsBiometricRegistering] = useState(false);

  const [mnemonic, setMnemonic] = useState<string[]>([]);
  const [isLoadingMnemonic, setIsLoadingMnemonic] = useState(false);
  const [mnemonicError, setMnemonicError] = useState('');

  const handleToggleBiometrics = async (checked: boolean) => {
    if (!checked) {
      disableBiometrics();
    } else {
      if (currentPassword) {
        try {
          await registerBiometrics(currentPassword);
        } catch (e) {
          log.error('Failed to enable biometrics:', e);
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

  const handleCreateNewWallet = () => setPanel('create');

  const handleSelectCreateMode = (mode: CreateWalletMode) => {
    setPanel(null);
    navigate(WALLET_SETUP_ROUTE[mode]);
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
        onClick={() => setPanel('menu')}
        className="p-1.5 -mr-1.5 rounded-md hover:bg-secondary transition-colors text-foreground"
        aria-label="Settings"
        data-testid="wallet-menu"
      >
        <SettingsIcon className="w-6 h-6 text-foreground" />
      </button>

      <Modal.Container
        isOpened={panel === 'menu'}
        onOpenChange={(open) => !open && setPanel(null)}
        className="px-2"
      >
        <Modal.Header onClose={() => setPanel(null)}>
          <Modal.Title>Settings</Modal.Title>
        </Modal.Header>

        <Modal.Body className="gap-3">
          {/* Appearance Section */}
          <div className="rounded-2xl bg-secondary/60 p-3 border border-border">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1 mb-2 block">
              Appearance
            </span>
            <div className="grid grid-cols-4 gap-1.5 bg-background/60 p-1 rounded-xl border border-border">
              {THEME_OPTIONS.map((opt) => {
                const isSelected = theme === opt.mode;
                return (
                  <button
                    key={opt.mode}
                    type="button"
                    onClick={() => setTheme(opt.mode)}
                    className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-card text-foreground shadow-sm font-semibold border border-border'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                    data-testid={`theme-option-${opt.mode}`}
                  >
                    <div className="flex items-center gap-1">
                      {opt.icon}
                      {isSelected && (
                        <Check className="w-3 h-3 text-blue-500" />
                      )}
                    </div>
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Block Explorer Section */}
          <div className="rounded-2xl bg-secondary/60 p-3 border border-border">
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Block Explorer
              </span>
              <span className="text-[10px] font-medium text-muted-foreground/80 bg-background/60 px-2 py-0.5 rounded-full border border-border">
                {network}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 bg-background/60 p-1.5 rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setExplorer('tonscan')}
                className={`flex flex-col p-2.5 rounded-lg text-left transition-all cursor-pointer ${
                  explorer === 'tonscan'
                    ? 'bg-card text-foreground shadow-sm font-semibold border border-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent'
                }`}
                data-testid="explorer-option-tonscan"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">
                    TonScan
                  </span>
                  {explorer === 'tonscan' ? (
                    <Check className="w-3.5 h-3.5 text-primary" />
                  ) : (
                    <span className="text-[10px] text-muted-foreground font-normal">
                      Default
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground mt-0.5 truncate font-mono">
                  {getExplorerHost('tonscan', network)}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setExplorer('tonviewer')}
                className={`flex flex-col p-2.5 rounded-lg text-left transition-all cursor-pointer ${
                  explorer === 'tonviewer'
                    ? 'bg-card text-foreground shadow-sm font-semibold border border-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent'
                }`}
                data-testid="explorer-option-tonviewer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">
                    TonViewer
                  </span>
                  {explorer === 'tonviewer' && (
                    <Check className="w-3.5 h-3.5 text-primary" />
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground mt-0.5 truncate font-mono">
                  {getExplorerHost('tonviewer', network)}
                </span>
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-secondary/60 divide-y divide-border overflow-hidden border border-border">
            {isBiometricsSupported && (
              <ToggleRow
                testId="biometric-unlock"
                label="Fingerprint / Biometric Unlock"
                description="Unlock wallet using device fingerprint or Face ID"
                checked={isBiometricsEnabled}
                onChange={handleToggleBiometrics}
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
                  <strong>Security notice:</strong> when auto-lock is off, your
                  password is stored locally and the wallet stays unlocked. Only
                  use for development.
                </>
              }
            />
            <ToggleRow
              testId="hold-to-sign"
              label="Hold to Sign"
              description="Hold the button for 3 seconds to approve transactions"
              checked={holdToSign ?? true}
              onChange={setHoldToSign}
              info={
                <>
                  <strong>Security notice:</strong> disabling hold-to-sign makes
                  it easier to accidentally approve transactions. Only use for
                  testing.
                </>
              }
            />
            <ToggleRow
              testId="show-fast-send"
              label="Show fast send"
              description="Show “Send Fast” button (1 nano, no confirmation)"
              checked={showFastSend ?? false}
              onChange={setShowFastSend}
            />
          </div>

          <div className="rounded-2xl bg-secondary/60 divide-y divide-border overflow-hidden border border-border">
            <ActionRow
              icon={<Plus className="w-5 h-5" />}
              label="Create New Wallet"
              onClick={handleCreateNewWallet}
            />
            <ActionRow
              icon={<KeyRound className="w-5 h-5" />}
              label={isLoadingMnemonic ? 'Loading…' : 'View Recovery Phrase'}
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

          {mnemonicError && (
            <p className="text-red-500 text-sm text-center bg-red-500/10 p-3 rounded-xl border border-red-500/20">
              {mnemonicError}
            </p>
          )}
        </Modal.Body>
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
            Enter your wallet passcode to register biometric authentication on this device.
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

      <CreateWalletModal
        isOpen={panel === 'create'}
        onClose={() => setPanel(null)}
        onSelect={handleSelectCreateMode}
      />

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
    </>
  );
};
