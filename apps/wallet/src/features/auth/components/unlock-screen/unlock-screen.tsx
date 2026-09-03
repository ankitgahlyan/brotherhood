/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from '@/core/routing';
import { useAuth, useWallet } from '@demo/wallet-core';

import { CenteredScreen } from '@/core/components/shared/centered-screen';
import { ConfirmModal } from '@/core/components/shared/confirm-modal';
import { Button } from '@/core/components/ui/button';
import { FingerprintIcon } from '@/core/components/ui/icons';
import { useBiometrics } from '@/core/security/use-biometrics';

const INPUT_CLASS =
  'w-full rounded-xl border border-border bg-card px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500';

export const UnlockScreen: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);

  const navigate = useNavigate();
  const { unlock, reset } = useAuth();
  const { loadAllWallets } = useWallet();
  const { isSupported, isEnabled, authenticate, disable } = useBiometrics();
  const inputRef = useRef<HTMLInputElement>(null);
  const autoPromptTriggered = useRef(false);

  const handleBiometricUnlock = useCallback(async () => {
    if (isLoading || isBiometricLoading) return;
    setIsBiometricLoading(true);
    setError('');
    try {
      const decryptedPassword = await authenticate();
      if (decryptedPassword) {
        setIsLoading(true);
        const success = await unlock(decryptedPassword);
        if (success) {
          await loadAllWallets();
          navigate('/wallet');
          return;
        } else {
          setError('Biometric authentication failed to verify passcode.');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Biometric unlock failed');
    } finally {
      setIsBiometricLoading(false);
      setIsLoading(false);
    }
  }, [isLoading, isBiometricLoading, authenticate, unlock, loadAllWallets, navigate]);

  // Auto-prompt biometrics once on mobile/supported devices if registered
  useEffect(() => {
    if (isSupported && isEnabled && !autoPromptTriggered.current) {
      autoPromptTriggered.current = true;
      void handleBiometricUnlock();
    } else if (!isEnabled) {
      inputRef.current?.focus();
    }
  }, [isSupported, isEnabled, handleBiometricUnlock]);

  const handleSubmit = async () => {
    if (!password || isLoading) return;
    setError('');
    setIsLoading(true);
    try {
      const success = await unlock(password);
      if (!success) {
        throw new Error('Incorrect password');
      }
      await loadAllWallets();
      navigate('/wallet');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unlock wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setIsResetOpen(false);
    disable();
    reset();
    navigate('/welcome');
  };

  const footer = (
    <div className="space-y-3">
      {isEnabled && (
        <Button
          type="button"
          variant="secondary"
          fullWidth
          loading={isBiometricLoading}
          onClick={handleBiometricUnlock}
          disabled={isLoading || isBiometricLoading}
          data-testid="biometric-unlock-button"
          className="flex items-center justify-center gap-2 py-3"
        >
          <FingerprintIcon className="w-5 h-5 text-primary" />
          <span>Unlock with Fingerprint</span>
        </Button>
      )}

      <Button
        data-testid="password-submit"
        fullWidth
        loading={isLoading}
        onClick={handleSubmit}
        disabled={!password || isLoading}
      >
        Unlock with Passcode
      </Button>

      <Button
        variant="ghost"
        size="sm"
        fullWidth
        onClick={() => setIsResetOpen(true)}
      >
        Reset Wallet
      </Button>
    </div>
  );

  return (
    <CenteredScreen footer={footer}>
      <div className="flex flex-col items-center text-center px-6">
        <h1
          className="text-2xl font-bold text-foreground"
          data-testid="subtitle"
        >
          Enter your passcode
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          {isEnabled
            ? 'Use your fingerprint or enter your passcode to unlock.'
            : 'Enter your passcode to unlock your wallet.'}
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit();
          }}
          className="mt-8 w-full text-left"
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
            autoComplete="current-password"
            aria-label="Password"
            className={INPUT_CLASS}
          />
        </form>

        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
      </div>

      <ConfirmModal
        isOpen={isResetOpen}
        title="Reset wallet"
        description="This will permanently delete all wallet data on this device. Make sure you have your recovery phrase."
        confirmLabel="Reset"
        cancelLabel="Cancel"
        danger
        onConfirm={handleReset}
        onClose={() => setIsResetOpen(false)}
      />
    </CenteredScreen>
  );
};
