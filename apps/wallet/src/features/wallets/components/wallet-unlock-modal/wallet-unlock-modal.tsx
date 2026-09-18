import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@demo/wallet-core';
import { Modal } from '@/core/components/ui/modal';
import { Button } from '@/core/components/ui/button';
import { FingerprintIcon } from '@/core/components/ui/icons';
import { useBiometrics } from '@/core/security/use-biometrics';

interface WalletUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  targetWalletName?: string;
}

export const WalletUnlockModal: React.FC<WalletUnlockModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  targetWalletName,
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);

  const { unlock } = useAuth();
  const { isSupported, isEnabled, authenticate } = useBiometrics();
  const inputRef = useRef<HTMLInputElement>(null);

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setPassword('');
      setError('');
    }
  }

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleBiometricUnlock = useCallback(async () => {
    if (isLoading || isBiometricLoading) return;
    setIsBiometricLoading(true);
    setError('');
    try {
      const decryptedPassword = await authenticate();
      if (decryptedPassword) {
        setIsLoading(true);
        const ok = await unlock(decryptedPassword);
        if (ok) {
          onSuccess();
          onClose();
          return;
        } else {
          setError('Biometric authentication failed to verify passcode.');
        }
      }
    } catch (err) {
      if (
        err instanceof Error &&
        (err.name === 'NotAllowedError' ||
          err.name === 'AbortError' ||
          err.name === 'SecurityError')
      ) {
        return;
      }
      setError(err instanceof Error ? err.message : 'Biometric unlock failed');
    } finally {
      setIsBiometricLoading(false);
      setIsLoading(false);
    }
  }, [isLoading, isBiometricLoading, authenticate, unlock, onSuccess, onClose]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!password || isLoading) return;
    setError('');
    setIsLoading(true);
    try {
      const ok = await unlock(password);
      if (!ok) {
        setError('Incorrect password');
        return;
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unlock');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal.Container
      isOpened={isOpen}
      onOpenChange={(open) => !open && onClose()}
      className="px-2 max-w-sm mx-auto"
    >
      <Modal.Header onClose={onClose}>
        <Modal.Title>Unlock to Switch</Modal.Title>
      </Modal.Header>

      <Modal.Body className="px-4 py-3">
        <p className="text-sm text-muted-foreground mb-4">
          Enter your passcode to decrypt and switch to{' '}
          <strong className="text-foreground">
            {targetWalletName || 'this wallet'}
          </strong>
          .
        </p>

        {isSupported && isEnabled && (
          <div className="mb-4">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              loading={isBiometricLoading}
              onClick={() => void handleBiometricUnlock()}
              className="flex items-center justify-center gap-2"
            >
              <FingerprintIcon className="w-5 h-5 text-blue-500" />
              Unlock with Biometrics
            </Button>
            <div className="flex items-center gap-2 my-3 text-xs text-muted-foreground">
              <div className="h-px bg-border flex-1" />
              <span>or enter passcode</span>
              <div className="h-px bg-border flex-1" />
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            ref={inputRef}
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError('');
            }}
            placeholder="Enter wallet password"
            autoComplete="current-password"
            className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />

          {error && (
            <p className="text-xs text-destructive text-center">{error}</p>
          )}

          <div className="flex gap-2 justify-end pt-1">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" loading={isLoading} disabled={!password}>
              Unlock & Switch
            </Button>
          </div>
        </form>
      </Modal.Body>
    </Modal.Container>
  );
};
