/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  KeyRound,
  Fingerprint,
  Lock,
  ChevronRight,
  Check,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useAuth,
  useWallet,
  useWalletStoreApi,
  SimpleEncryption,
} from '@demo/wallet-core';
import { useBiometrics } from '@/core/security/use-biometrics';
import { usePasskeyWallets } from '@/core/security/use-passkey-wallets';
import { Modal } from '@/core/components/ui/modal';
import { Button } from '@/core/components/ui/button';
import { ToggleRow } from '../toggle-row';
import { cn } from '@/core/lib/utils';
import { createComponentLogger } from '@/core/lib/logger';

const log = createComponentLogger('SecurityModal');

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewRecoveryPhrase: () => void;
  onBackupToPasskey: () => void;
  isBackingUpPasskey?: boolean;
}

export const SecurityModal: React.FC<SecurityModalProps> = ({
  isOpen,
  onClose,
  onViewRecoveryPhrase,
  onBackupToPasskey,
  isBackingUpPasskey = false,
}) => {
  const storeApi = useWalletStoreApi();
  const {
    isPasswordSet,
    currentPassword,
    setPassword,
    unlock,
    persistPassword,
    setPersistPassword,
    holdToSign,
    setHoldToSign,
    slideToSign,
    setSlideToSign,
  } = useAuth();

  const { savedWallets, activeWalletId } = useWallet();
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
    authenticate: authenticateBiometrics,
  } = useBiometrics();

  const { syncEncryptedVault } = usePasskeyWallets();

  // Change Passcode Form state
  const [isChangingPasscode, setIsChangingPasscode] = useState(false);
  const [currentPasscodeInput, setCurrentPasscodeInput] = useState('');
  const [newPasscodeInput, setNewPasscodeInput] = useState('');
  const [confirmPasscodeInput, setConfirmPasscodeInput] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [isBiometricVerifying, setIsBiometricVerifying] = useState(false);
  const [isCurrentVerified, setIsCurrentVerified] = useState(false);
  const [isUpdatingPasscode, setIsUpdatingPasscode] = useState(false);

  // Biometric registration without active currentPassword in memory
  const [isBiometricPromptOpen, setIsBiometricPromptOpen] = useState(false);
  const [biometricPasscode, setBiometricPasscode] = useState('');
  const [biometricError, setBiometricError] = useState('');
  const [isBiometricRegistering, setIsBiometricRegistering] = useState(false);

  const mnemonicWalletsCount = savedWallets.filter(
    (w) => Boolean(w.encryptedMnemonic) && !w.isWatchOnly,
  ).length;

  const resetChangePasscodeForm = () => {
    setIsChangingPasscode(false);
    setCurrentPasscodeInput('');
    setNewPasscodeInput('');
    setConfirmPasscodeInput('');
    setPasscodeError('');
    setIsCurrentVerified(false);
    setIsUpdatingPasscode(false);
    setIsBiometricVerifying(false);
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
      toast.info('Biometric unlock disabled');
    } else {
      if (currentPassword) {
        try {
          await registerBiometrics(currentPassword);
          toast.success('Biometric unlock enabled');
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

  const handleVerifyBiometricsForChange = async () => {
    setPasscodeError('');
    setIsBiometricVerifying(true);
    try {
      const bioPass = await authenticateBiometrics();
      if (bioPass) {
        const ok = await unlock(bioPass);
        if (ok) {
          setIsCurrentVerified(true);
          setCurrentPasscodeInput(bioPass);
          toast.success('Identity verified with biometrics');
        } else {
          setPasscodeError('Biometric verification failed to verify passcode.');
        }
      } else {
        setPasscodeError('Biometric verification cancelled.');
      }
    } catch (err) {
      setPasscodeError(
        err instanceof Error ? err.message : 'Biometric verification failed',
      );
    } finally {
      setIsBiometricVerifying(false);
    }
  };

  const handleSaveNewPasscode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPasscodeError('');

    const newPass = newPasscodeInput.trim();
    const confirmPass = confirmPasscodeInput.trim();
    const currentPass = currentPasscodeInput.trim();

    if (!isCurrentVerified && !currentPass) {
      setPasscodeError('Please enter your current passcode.');
      return;
    }
    if (newPass.length < 4) {
      setPasscodeError('New passcode must be at least 4 characters.');
      return;
    }
    if (newPass !== confirmPass) {
      setPasscodeError('New passcodes do not match.');
      return;
    }

    setIsUpdatingPasscode(true);
    try {
      // 1. Verify current passcode if not already verified via biometrics
      if (!isCurrentVerified) {
        const ok = await unlock(currentPass);
        if (!ok) {
          setPasscodeError('Current passcode is incorrect.');
          setIsUpdatingPasscode(false);
          return;
        }
      }

      // 2. Source password to decrypt current wallets
      const sourcePass = currentPassword || currentPass;

      // 3. Re-encrypt all saved wallets
      const state = storeApi.getState();
      const updatedWallets = await Promise.all(
        state.walletManagement.savedWallets.map(async (w) => {
          if (!w.encryptedMnemonic) return w;
          let mnemonicJson: string;
          try {
            mnemonicJson = await SimpleEncryption.decrypt(
              w.encryptedMnemonic,
              sourcePass,
            );
          } catch {
            if (currentPassword && currentPassword !== sourcePass) {
              mnemonicJson = await SimpleEncryption.decrypt(
                w.encryptedMnemonic,
                currentPassword,
              );
            } else {
              throw new Error(`Failed to decrypt wallet ${w.name}`);
            }
          }
          const newEncrypted = await SimpleEncryption.encrypt(
            mnemonicJson,
            newPass,
          );
          return {
            ...w,
            encryptedMnemonic: newEncrypted,
          };
        }),
      );

      // 4. Update saved wallets in store
      storeApi.setState((s) => ({
        walletManagement: {
          ...s.walletManagement,
          savedWallets: updatedWallets,
        },
      }));

      // 5. Update auth state with new password
      await setPassword(newPass);

      // 6. Update biometrics if enabled
      if (isBiometricsEnabled) {
        try {
          await registerBiometrics(newPass);
        } catch (bioErr) {
          log.warn(
            'Failed to re-register biometrics with new passcode:',
            bioErr,
          );
        }
      }

      // 7. Sync encrypted vault
      try {
        await syncEncryptedVault();
      } catch {
        /* ignore */
      }

      toast.success('Master passcode updated successfully!');
      resetChangePasscodeForm();
    } catch (err) {
      setPasscodeError(
        err instanceof Error ? err.message : 'Failed to update passcode',
      );
    } finally {
      setIsUpdatingPasscode(false);
    }
  };

  return (
    <>
      <Modal.Container
        isOpened={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            resetChangePasscodeForm();
            onClose();
          }
        }}
        className="px-2 max-w-md"
      >
        <Modal.Header
          onClose={() => {
            resetChangePasscodeForm();
            onClose();
          }}
        >
          <Modal.Title className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <span>Security &amp; Passcode</span>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="gap-5 p-4 max-h-[80vh] overflow-y-auto">
          {/* Section 1: Master Passcode */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1 block">
              Master Passcode
            </span>

            <div className="rounded-2xl bg-secondary/60 p-3.5 border border-border flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-foreground truncate">
                      Vault Protection
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {isPasswordSet ? 'Passcode is configured' : 'No passcode'}
                    </div>
                  </div>
                </div>
                <Button
                  variant={isChangingPasscode ? 'gray' : 'secondary'}
                  size="sm"
                  onClick={() => {
                    if (isChangingPasscode) {
                      resetChangePasscodeForm();
                    } else {
                      setIsChangingPasscode(true);
                    }
                  }}
                  data-testid="toggle-change-passcode-btn"
                >
                  {isChangingPasscode ? 'Cancel' : 'Change Passcode'}
                </Button>
              </div>

              {/* Change Passcode Form */}
              {isChangingPasscode && (
                <form
                  onSubmit={handleSaveNewPasscode}
                  className="pt-2 border-t border-border/60 space-y-3"
                  data-testid="change-passcode-form"
                >
                  {!isCurrentVerified ? (
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground block">
                        Current Passcode
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="password"
                          value={currentPasscodeInput}
                          onChange={(e) => {
                            setCurrentPasscodeInput(e.target.value);
                            setPasscodeError('');
                          }}
                          placeholder="Enter current passcode"
                          className="flex-1 rounded-xl border border-border bg-card px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          data-testid="current-passcode-input"
                        />
                        {isBiometricsSupported && isBiometricsEnabled && (
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            loading={isBiometricVerifying}
                            onClick={handleVerifyBiometricsForChange}
                            className="shrink-0 flex items-center gap-1.5 px-3"
                            title="Verify with Biometrics"
                            data-testid="verify-biometrics-change-btn"
                          >
                            <Fingerprint className="w-4 h-4 text-primary" />
                            <span className="hidden sm:inline text-xs">
                              Scan
                            </span>
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                      <div className="flex items-center gap-1.5">
                        <Check className="w-4 h-4" />
                        <span>Current passcode verified via biometrics</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCurrentVerified(false);
                          setCurrentPasscodeInput('');
                        }}
                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Type
                      </button>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground block">
                      New Passcode (min 4 characters)
                    </label>
                    <input
                      type="password"
                      value={newPasscodeInput}
                      onChange={(e) => {
                        setNewPasscodeInput(e.target.value);
                        setPasscodeError('');
                      }}
                      placeholder="Enter new passcode"
                      className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      data-testid="new-passcode-input"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground block">
                      Confirm New Passcode
                    </label>
                    <input
                      type="password"
                      value={confirmPasscodeInput}
                      onChange={(e) => {
                        setConfirmPasscodeInput(e.target.value);
                        setPasscodeError('');
                      }}
                      placeholder="Repeat new passcode"
                      className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      data-testid="confirm-new-passcode-input"
                    />
                  </div>

                  {passcodeError && (
                    <p className="text-xs text-red-500 font-medium">
                      {passcodeError}
                    </p>
                  )}

                  <Button
                    type="submit"
                    fullWidth
                    size="sm"
                    loading={isUpdatingPasscode}
                    disabled={
                      (!isCurrentVerified && !currentPasscodeInput.trim()) ||
                      newPasscodeInput.trim().length < 4 ||
                      newPasscodeInput.trim() !== confirmPasscodeInput.trim()
                    }
                    data-testid="save-new-passcode-btn"
                  >
                    Save New Passcode
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* Section 2: Biometrics & Auto-Lock */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1 block">
              Authentication &amp; Lock
            </span>

            <div className="rounded-2xl bg-secondary/60 divide-y divide-border overflow-hidden border border-border">
              {(isBiometricsSupported || isBiometricsInsecure) && (
                <ToggleRow
                  testId="security-biometric-unlock"
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
                testId="security-auto-lock"
                label="Auto-Lock"
                description="Lock wallet on app reload"
                checked={!persistPassword}
                onChange={(checked) => setPersistPassword(!checked)}
              />
            </div>
          </div>

          {/* Section 3: Action Confirmation */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1 block">
              Signing Confirmation
            </span>

            <div className="rounded-2xl bg-secondary/60 p-3.5 border border-border flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-foreground">
                  Action Confirmation
                </div>
                <div className="text-xs text-muted-foreground mt-0.5 leading-snug">
                  {slideToSign
                    ? 'Slide to approve sends and signing'
                    : holdToSign
                      ? 'Hold action buttons to approve sends and signing'
                      : 'Click action buttons normally'}
                </div>
              </div>
              <div className="inline-flex items-center rounded-xl bg-background/80 p-1 border border-border shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setHoldToSign(false);
                    setSlideToSign(false);
                  }}
                  className={cn(
                    'px-2.5 py-1.5 min-h-8 text-[11px] font-semibold rounded-lg transition-all cursor-pointer',
                    !holdToSign && !slideToSign
                      ? 'bg-primary text-primary-foreground shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                  data-testid="security-click-to-sign"
                >
                  Off
                </button>
                <button
                  type="button"
                  onClick={() => setHoldToSign(true)}
                  className={cn(
                    'px-2.5 py-1.5 min-h-8 text-[11px] font-semibold rounded-lg transition-all cursor-pointer',
                    holdToSign && !slideToSign
                      ? 'bg-primary text-primary-foreground shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                  data-testid="security-hold-to-sign"
                >
                  Hold
                </button>
                <button
                  type="button"
                  onClick={() => setSlideToSign(true)}
                  className={cn(
                    'px-2.5 py-1.5 min-h-8 text-[11px] font-semibold rounded-lg transition-all cursor-pointer',
                    slideToSign
                      ? 'bg-primary text-primary-foreground shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                  data-testid="security-slide-to-sign"
                >
                  Slide
                </button>
              </div>
            </div>
          </div>

          {/* Section 4: Wallet Backups */}
          {!isWatchOnly && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1 block">
                Backups &amp; Recovery
              </span>

              <div className="rounded-2xl bg-secondary/60 divide-y divide-border overflow-hidden border border-border">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onViewRecoveryPhrase();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors cursor-pointer select-none hover:bg-muted/80"
                  data-testid="security-view-recovery-phrase"
                >
                  <KeyRound className="w-5 h-5 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground truncate">
                      View Recovery Phrase
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      Reveal seed phrase backup
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </button>

                {mnemonicWalletsCount > 0 &&
                  (isBiometricsSupported || isBiometricsInsecure) && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onBackupToPasskey();
                      }}
                      disabled={isBackingUpPasskey}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors cursor-pointer select-none hover:bg-muted/80 disabled:opacity-50"
                      data-testid="security-backup-passkey"
                    >
                      <Fingerprint className="w-5 h-5 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-foreground truncate">
                          {isBackingUpPasskey
                            ? 'Saving to Passkey…'
                            : 'Backup Wallets to Passkey'}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {mnemonicWalletsCount > 1
                            ? `Save all ${mnemonicWalletsCount} wallet phrases to mobile keystore`
                            : 'Save recovery phrase to mobile keystore'}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    </button>
                  )}
              </div>
            </div>
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
                  toast.success('Biometric unlock enabled');
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
    </>
  );
};
