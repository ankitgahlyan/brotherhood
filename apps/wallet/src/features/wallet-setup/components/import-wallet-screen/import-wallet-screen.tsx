/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Fingerprint } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from '@/core/routing';
import { useAuth, useWallet, generateWalletName } from '@demo/wallet-core';
import type { NetworkType } from '@demo/wallet-core';

import { CenteredScreen } from '@/core/components/shared/centered-screen';
import { Button } from '@/core/components/ui/button';
import { Segmented } from '@/core/components/ui/segmented';
import type { SegmentedOption } from '@/core/components/ui/segmented';
import { NetworkSelector } from '@/features/wallets';
import { useTonWallet } from '@/core/hooks';
import { usePasskeyWallets } from '@/core/security/use-passkey-wallets';
import {
  applyMnemonicPaste,
  evaluateBip39Slots,
  extractMnemonicWordsFromPaste,
  isImportableBip39,
} from '@/features/wallets';
import { readTelegramClipboardText } from '@/core/lib/telegram';

type WalletInterface = 'mnemonic' | 'signer';

const TOTAL_WORDS = 24;
const INTERFACES: SegmentedOption<WalletInterface>[] = [
  { value: 'mnemonic', label: 'Mnemonic', testId: 'interface-select-mnemonic' },
  { value: 'signer', label: 'Signer', testId: 'interface-select-signer' },
];

/** Dedicated "Recovery phrase" screen for importing an existing wallet via mnemonic. */
export const ImportWalletScreen: React.FC = () => {
  const navigate = useNavigate();
  const { importWallet } = useTonWallet();
  const { setUseWalletInterfaceType } = useAuth();
  const { savedWallets } = useWallet();
  const {
    isSupported: isPasskeySupported,
    isInsecureContext: isPasskeyInsecure,
    isRestoring: isRestoringPasskey,
    backupAllWallets,
    restoreFromPasskey,
  } = usePasskeyWallets();

  const defaultName = useMemo(
    () => generateWalletName(savedWallets, 'mnemonic'),
    [savedWallets],
  );

  const [words, setWords] = useState<string[]>(Array(TOTAL_WORDS).fill(''));
  const [walletName, setWalletName] = useState('');
  const [activeInput, setActiveInput] = useState(0);
  const [interfaceType, setInterfaceType] =
    useState<WalletInterface>('mnemonic');
  const [network, setNetwork] = useState<NetworkType>('testnet');
  const [saveToPasskey, setSaveToPasskey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const focusCell = (index: number) => {
    setTimeout(() => inputRefs.current[index]?.focus(), 0);
  };

  const handleWordChange = (index: number, value: string) => {
    const tokens = extractMnemonicWordsFromPaste(value);
    if (tokens.length > 1) {
      const { nextWords, focusIndex } = applyMnemonicPaste(
        words,
        index,
        tokens,
      );
      setWords(nextWords);
      focusCell(focusIndex);
      return;
    }

    if (
      tokens.length === 1 &&
      (value.includes(' ') || value.includes('\n') || value.includes('\t'))
    ) {
      const cleanWord = tokens[0];
      setWords((prev) => {
        const next = [...prev];
        next[index] = cleanWord;
        return next;
      });
      if (index < TOTAL_WORDS - 1) {
        focusCell(index + 1);
      }
      return;
    }

    const cleanValue = value.toLowerCase().replace(/[^a-z]/g, '');
    setWords((prev) => {
      const next = [...prev];
      next[index] = cleanValue;
      return next;
    });
  };

  const validation = useMemo(() => evaluateBip39Slots(words), [words]);
  const isValid = isImportableBip39(validation);

  const handleImportFromPasskey = async () => {
    if (isPasskeyInsecure) {
      toast.error(
        'Passkeys require a secure connection (HTTPS). On mobile browsers, please access via HTTPS or use Telegram.',
      );
      return;
    }
    setError('');
    try {
      const result = await restoreFromPasskey();
      if (!result) return;
      if (result.importedCount > 0) {
        toast.success(
          result.importedCount === 1
            ? 'Wallet restored from Passkey'
            : `Restored ${result.importedCount} wallets from Passkey`,
        );
      } else {
        toast.info('Wallet is already imported — switched to wallet');
      }
      navigate('/wallet', { replace: true });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to restore wallet from Passkey',
      );
    }
  };

  const handleImport = async () => {
    if (!isValid) return;
    setError('');
    setIsLoading(true);
    try {
      const subwalletId = network === 'testnet' ? 2147483645 : 2147483409;
      const finalName = walletName.trim() || defaultName;
      if (saveToPasskey && isPasskeySupported && !isPasskeyInsecure) {
        try {
          const savedCount = await backupAllWallets([
            {
              mnemonic: validation.nonEmptyWords,
              name: finalName,
              network,
              version: 'v5r1',
              subwalletId,
              interfaceType,
            },
          ]);
          if (savedCount > 0) {
            toast.success('Recovery phrase saved to Passkey');
          }
        } catch (passkeyErr) {
          toast.error(
            passkeyErr instanceof Error
              ? passkeyErr.message
              : 'Failed to save to Passkey; continuing wallet import',
          );
        }
      }
      setUseWalletInterfaceType(interfaceType);
      await importWallet(
        validation.nonEmptyWords,
        'v5r1',
        network,
        subwalletId,
        finalName,
      );
      navigate('/wallet', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent) => {
    const isFirst = index === 0;
    const isLast = index === TOTAL_WORDS - 1;
    const value = inputRefs.current[index]?.value ?? '';

    switch (event.key) {
      case 'Backspace':
        if (value.length === 0 && !isFirst) {
          const prev = inputRefs.current[index - 1];
          if (prev) {
            prev.focus();
            const end = prev.value.length;
            prev.setSelectionRange(end, end);
          }
        }
        return;
      case 'Enter':
        event.preventDefault();
        if (isLast) void handleImport();
        else inputRefs.current[index + 1]?.focus();
        return;
      case 'ArrowLeft':
        if (!isFirst) inputRefs.current[index - 1]?.focus();
        return;
      case 'ArrowRight':
        if (!isLast) inputRefs.current[index + 1]?.focus();
        return;
      case ' ':
        if (!isLast && value.length > 0) {
          event.preventDefault();
          inputRefs.current[index + 1]?.focus();
        }
        return;
    }
  };

  const handlePaste = (index: number, event: React.ClipboardEvent) => {
    const text =
      event.clipboardData.getData('text/plain') ||
      event.clipboardData.getData('text');
    const tokens = extractMnemonicWordsFromPaste(text);

    if (tokens.length === 0) {
      if (text.trim().length > 0) {
        event.preventDefault();
        handleWordChange(index, text);
      }
      return;
    }

    event.preventDefault();
    const { nextWords, focusIndex } = applyMnemonicPaste(words, index, tokens);
    setWords(nextWords);
    focusCell(focusIndex);
  };

  const handleClickPaste = () => {
    void readTelegramClipboardText().then((text) => {
      const tokens = extractMnemonicWordsFromPaste(text ?? '');
      if (tokens.length === 0) return;
      const { nextWords, focusIndex } = applyMnemonicPaste(
        words,
        activeInput,
        tokens,
      );
      setWords(nextWords);
      focusCell(focusIndex);
    });
  };

  const clearAll = () => {
    setWords(Array(TOTAL_WORDS).fill(''));
    inputRefs.current[0]?.focus();
  };

  const cellClassName = (index: number) => {
    if (validation.invalidIndices.includes(index))
      return 'border-red-500/60 bg-red-500/10 text-red-500';
    if (words[index])
      return 'border-emerald-500/60 bg-emerald-500/10 text-emerald-500';
    if (activeInput === index)
      return 'border-primary/60 bg-primary/10 text-foreground';
    return 'border-border bg-card text-foreground';
  };

  const footer = (
    <Button
      fullWidth
      onClick={handleImport}
      disabled={!isValid || isLoading}
      loading={isLoading}
      data-testid="import-wallet-process"
    >
      Import wallet
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
            Enter the 12 or 24 words of your recovery phrase.
          </p>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <NetworkSelector value={network} onChange={setNetwork} compact />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              Interface
            </span>
            <Segmented
              value={interfaceType}
              onChange={setInterfaceType}
              options={INTERFACES}
            />
          </div>
          <div className="flex flex-col gap-1 text-left pt-1">
            <label className="text-xs font-medium text-foreground block">
              Wallet name
            </label>
            <input
              type="text"
              value={walletName}
              onChange={(e) => setWalletName(e.target.value)}
              placeholder={defaultName}
              className="w-full rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
              data-testid="wallet-name-input"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span
            className="text-sm text-muted-foreground"
            data-testid="word-count"
          >
            {validation.nonEmptyWords.length}/24 words
          </span>
          <div className="flex items-center gap-3">
            {(isPasskeySupported || isPasskeyInsecure) && (
              <button
                type="button"
                onClick={() => {
                  void handleImportFromPasskey();
                }}
                disabled={isRestoringPasskey || isLoading}
                className="inline-flex items-center gap-1 text-xs text-primary hover:opacity-80 font-semibold disabled:opacity-50 cursor-pointer"
                data-testid="import-from-passkey"
              >
                <Fingerprint className="w-3.5 h-3.5" />
                <span>
                  {isRestoringPasskey ? 'Restoring…' : 'Import from Passkey'}
                </span>
              </button>
            )}
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              data-testid="clear-mnemonic"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleClickPaste}
              className="text-xs text-primary hover:opacity-80 font-medium"
              data-testid="paste-mnemonic"
            >
              Paste
            </button>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-4 gap-1.5">
          {words.map((word, index) => (
            <div key={index} className="relative">
              <input
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                data-testid={`mnemonic-input-${index}`}
                value={word}
                onChange={(e) => handleWordChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={(e) => handlePaste(index, e)}
                onFocus={() => setActiveInput(index)}
                placeholder={`${index + 1}`}
                className={`w-full px-1.5 py-1.5 text-xs border rounded text-center font-mono transition-colors ${cellClassName(index)} focus:outline-none focus:ring-1 focus:ring-ring focus:border-primary`}
                autoComplete="off"
                spellCheck={false}
              />
              <span className="absolute -top-1 left-0.5 text-[10px] text-muted-foreground bg-card px-0.5">
                {index + 1}
              </span>
            </div>
          ))}
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
    </CenteredScreen>
  );
};
