/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from '@/core/routing';
import { useAuth } from '@demo/wallet-core';

import { CenteredScreen } from '@/core/components/shared/centered-screen';
import { ConfirmModal } from '@/core/components/shared/confirm-modal';
import { Button } from '@/core/components/ui/button';
import { useBiometrics } from '@/core/security/use-biometrics';
import { WALLET_SETUP_ROUTE } from '@/features/wallet-setup';
import type { WalletSetupMode } from '@/features/wallet-setup';

const MIN_LENGTH = 4;

const INPUT_CLASS =
  'w-full rounded-xl border border-border bg-card px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500';

export const SetupPasswordScreen: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showBiometricPrompt, setShowBiometricPrompt] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { setPassword: setStorePassword } = useAuth();
  const { isSupported, register } = useBiometrics();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const tooShort = password.length > 0 && password.length < MIN_LENGTH;
  const mismatch = confirmPassword.length > 0 && confirmPassword !== password;
  const canSubmit =
    password.length >= MIN_LENGTH && password === confirmPassword && !isLoading;

  const finishSetup = () => {
    const tab = (location.state as { tab?: WalletSetupMode } | null)?.tab;
    navigate(WALLET_SETUP_ROUTE[tab ?? 'create']);
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setError('');
    setIsLoading(true);
    try {
      await setStorePassword(password);
      if (isSupported) {
        setShowBiometricPrompt(true);
      } else {
        finishSetup();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnableBiometrics = async () => {
    try {
      await register(password);
    } catch {
      /* ignore if user cancelled native dialog */
    } finally {
      setShowBiometricPrompt(false);
      finishSetup();
    }
  };

  const handleSkipBiometrics = () => {
    setShowBiometricPrompt(false);
    finishSetup();
  };

  const footer = (
    <Button
      data-testid="password-submit"
      fullWidth
      loading={isLoading}
      onClick={handleSubmit}
      disabled={!canSubmit}
    >
      Continue
    </Button>
  );

  return (
    <CenteredScreen onBack={() => navigate(-1)} footer={footer}>
      <div className="flex flex-col items-center text-center px-6">
        <h1
          className="text-2xl font-bold text-foreground"
          data-testid="subtitle"
        >
          Create a passcode
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          Create a passcode / password to protect your wallet.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit();
          }}
          className="mt-8 w-full space-y-3 text-left"
        >
          <input
            ref={inputRef}
            type="password"
            data-testid="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            placeholder="Passcode / Password"
            autoComplete="new-password"
            aria-label="Password"
            className={INPUT_CLASS}
          />
          <input
            type="password"
            data-testid="password-confirm"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setError('');
            }}
            placeholder="Confirm passcode / password"
            autoComplete="new-password"
            aria-label="Confirm password"
            className={INPUT_CLASS}
          />
        </form>

        {(error || tooShort || mismatch) && (
          <p className="mt-4 text-sm text-red-500">
            {error ||
              (tooShort
                ? `Passcode must be at least ${MIN_LENGTH} characters`
                : 'Passcodes do not match')}
          </p>
        )}

        <p className="mt-6 text-xs text-muted-foreground">
          Make sure to remember your passcode — it cannot be recovered if
          forgotten.
        </p>
      </div>

      <ConfirmModal
        isOpen={showBiometricPrompt}
        title="Enable Fingerprint Unlock?"
        description="Unlock your wallet quickly and securely using your fingerprint or biometric authentication."
        confirmLabel="Enable Fingerprint"
        cancelLabel="Skip for Now"
        onConfirm={handleEnableBiometrics}
        onClose={handleSkipBiometrics}
      />
    </CenteredScreen>
  );
};
