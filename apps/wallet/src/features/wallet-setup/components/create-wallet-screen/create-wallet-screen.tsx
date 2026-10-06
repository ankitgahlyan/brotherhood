/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Fingerprint } from 'lucide-react';
import { useNavigate } from '@/core/routing';
import { CreateTonMnemonic } from '@ton/walletkit';
import { useAuth, useWallet, generateWalletName } from '@demo/wallet-core';
import type { NetworkType } from '@demo/wallet-core';
import { toast } from 'sonner';

import { SavePhraseConfirmModal } from '../save-phrase-confirm-modal';

import { CenteredScreen } from '@/core/components/shared/centered-screen';
import { Button } from '@/core/components/ui/button';
import { NetworkSelector } from '@/features/wallets';
import { useTonWallet } from '@/core/hooks';
import { usePasskeyWallets } from '@/core/security/use-passkey-wallets';

/** Dedicated "Recovery phrase" screen for creating a new wallet. */
export const CreateWalletScreen: React.FC = () => {
  const navigate = useNavigate();
  const { importWallet } = useTonWallet();
  const { setUseWalletInterfaceType } = useAuth();
  const { savedWallets } = useWallet();
  const {
    isSupported: isPasskeySupported,
    isInsecureContext: isPasskeyInsecure,
    isBackingUp: isSavingPasskey,
    backupAllWallets,
  } = usePasskeyWallets();

  const defaultName = useMemo(
    () => generateWalletName(savedWallets, 'mnemonic'),
    [savedWallets],
  );

  const [mnemonic, setMnemonic] = useState<string[]>([]);
  const [walletName, setWalletName] = useState('');
  const [network, setNetwork] = useState<NetworkType>('testnet');
  const [revealed, setRevealed] = useState(false);
  const [saveToPasskey, setSaveToPasskey] = useState(true);
  const [savedToPasskey, setSavedToPasskey] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    void (async () => {
      try {
        setMnemonic(await CreateTonMnemonic());
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to generate recovery phrase',
        );
      }
    })();
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(mnemonic.join(' '));
      toast.success('Recovery phrase copied');
    } catch {
      toast.error('Failed to copy');
    }
  }, [mnemonic]);

  const handleSaveToPasskey = useCallback(async () => {
    if (mnemonic.length === 0) return;
    if (isPasskeyInsecure) {
      toast.error(
        'Passkeys require a secure connection (HTTPS). On mobile browsers, please access via HTTPS or use Telegram.',
      );
      return;
    }
    try {
      const subwalletId = network === 'testnet' ? 2147483645 : 2147483409;
      const finalName = walletName.trim() || defaultName;
      const count = await backupAllWallets([
        {
          mnemonic,
          name: finalName,
          network,
          version: 'v5r1',
          subwalletId,
          interfaceType: 'mnemonic',
        },
      ]);
      if (count > 0) {
        setRevealed(true);
        setSavedToPasskey(true);
        toast.success('Recovery phrase saved to Passkey');
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Failed to save recovery phrase to Passkey',
      );
    }
  }, [
    mnemonic,
    isPasskeyInsecure,
    network,
    walletName,
    defaultName,
    backupAllWallets,
  ]);

  const handleContinue = async () => {
    setError('');
    setIsLoading(true);
    try {
      const subwalletId = network === 'testnet' ? 2147483645 : 2147483409;
      const finalName = walletName.trim() || defaultName;
      if (
        saveToPasskey &&
        !savedToPasskey &&
        isPasskeySupported &&
        !isPasskeyInsecure
      ) {
        try {
          const savedCount = await backupAllWallets([
            {
              mnemonic,
              name: finalName,
              network,
              version: 'v5r1',
              subwalletId,
              interfaceType: 'mnemonic',
            },
          ]);
          if (savedCount > 0) {
            setSavedToPasskey(true);
            toast.success('Recovery phrase saved to Passkey');
          }
        } catch (passkeyErr) {
          toast.error(
            passkeyErr instanceof Error
              ? passkeyErr.message
              : 'Failed to save to Passkey; continuing wallet creation',
          );
        }
      }
      setUseWalletInterfaceType('mnemonic');
      await importWallet(mnemonic, 'v5r1', network, subwalletId, finalName);
      navigate('/wallet', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create wallet');
      setConfirmOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const ready = mnemonic.length > 0;
  const columns = [0, 12];

  const footer = (
    <Button
      fullWidth
      onClick={() => setConfirmOpen(true)}
      disabled={!revealed || isLoading}
      data-testid="create-wallet-confirm"
    >
      Continue
    </Button>
  );

  return (
    <CenteredScreen onBack={() => navigate(-1)} footer={footer}>
      <div className="px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">
            Recovery phrase
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            This is the only way you will be able to recover your account.
            Please store it somewhere safe!
          </p>
        </div>

        <div className="mt-4 space-y-3">
          <NetworkSelector value={network} onChange={setNetwork} compact />
          <div className="space-y-1 text-left">
            <label className="text-xs font-medium text-foreground block">
              Wallet name
            </label>
            <input
              type="text"
              value={walletName}
              onChange={(e) => setWalletName(e.target.value)}
              placeholder={defaultName}
              className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              data-testid="wallet-name-input"
            />
          </div>
        </div>

        <div className="relative mt-6">
          <div className={revealed ? 'select-text' : 'blur-sm'}>
            <div className="flex gap-6" data-testid="mnemonic-grid">
              {columns.map((offset) => (
                <div key={offset} className="flex-1 space-y-4">
                  {(ready ? mnemonic : Array.from({ length: 24 }).map(() => ''))
                    .slice(offset, offset + 12)
                    .map((word, idx) => {
                      const n = offset + idx + 1;
                      return (
                        <div key={n} className="flex items-baseline gap-3">
                          <span className="w-6 text-muted-foreground tabular-nums">
                            {n}
                          </span>
                          <span
                            className="font-bold text-foreground"
                            data-testid={`mnemonic-word-${n}`}
                          >
                            {word || '—'}
                          </span>
                        </div>
                      );
                    })}
                </div>
              ))}
            </div>
          </div>

          {!revealed && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setRevealed(true)}
                disabled={!ready}
                data-testid="reveal-mnemonic"
              >
                Click to reveal
              </Button>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Button
            variant="gray"
            size="sm"
            onClick={handleCopy}
            disabled={!revealed}
          >
            Copy phrase
          </Button>
          {(isPasskeySupported || isPasskeyInsecure) && (
            <Button
              variant="gray"
              size="sm"
              onClick={() => {
                void handleSaveToPasskey();
              }}
              loading={isSavingPasskey}
              disabled={!ready || isSavingPasskey}
              data-testid="save-mnemonic-passkey"
            >
              {savedToPasskey ? 'Saved to Passkey ✓' : 'Save to Passkey'}
            </Button>
          )}
        </div>

        {isPasskeySupported && !isPasskeyInsecure && (
          <div className="mt-4 flex items-center justify-between rounded-xl border border-border bg-card px-3.5 py-2.5">
            <div className="flex items-center gap-2 text-left">
              <Fingerprint className="w-4 h-4 text-primary shrink-0" />
              <span className="text-xs font-medium text-foreground">
                Save recovery phrase to Passkey
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={saveToPasskey}
              onClick={() => setSaveToPasskey((prev) => !prev)}
              data-testid="toggle-save-passkey"
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full p-0.5 ring-1 ring-inset transition-colors ${
                saveToPasskey
                  ? 'bg-primary ring-primary'
                  : 'bg-secondary ring-border'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 rounded-full bg-background shadow-xs transition-transform ${
                  saveToPasskey ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        )}

        {error && (
          <p className="mt-4 text-center text-sm text-red-500">{error}</p>
        )}
      </div>

      <SavePhraseConfirmModal
        isOpen={confirmOpen}
        loading={isLoading}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleContinue}
      />
    </CenteredScreen>
  );
};
