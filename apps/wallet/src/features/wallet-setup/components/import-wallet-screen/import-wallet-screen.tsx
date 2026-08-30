/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from '@/core/routing';
import { useAuth, useWalletKit } from '@demo/wallet-core';
import type { NetworkType } from '@demo/wallet-core';

import { CenteredScreen } from '@/core/components/shared/centered-screen';
import { Button } from '@/core/components/ui/button';
import { Segmented } from '@/core/components/ui/segmented';
import type { SegmentedOption } from '@/core/components/ui/segmented';
import { NetworkSelector } from '@/features/wallets';
import { useTonWallet } from '@/core/hooks';
import {
  applyMnemonicPaste,
  evaluateBip39Slots,
  extractMnemonicWordsFromPaste,
  isImportableBip39,
  scanMnemonicWallets,
  type DiscoveredWalletVersion,
} from '@/features/wallets';

type WalletVersion = 'v5r1' | 'v4r2';
type WalletInterface = 'mnemonic' | 'signer';

const TOTAL_WORDS = 24;
const VERSIONS: SegmentedOption<WalletVersion>[] = [
  { value: 'v5r1', label: 'V5R1', testId: 'version-select-v5r1' },
  { value: 'v4r2', label: 'V4R2', testId: 'version-select-v4r2' },
];
const INTERFACES: SegmentedOption<WalletInterface>[] = [
  { value: 'mnemonic', label: 'Mnemonic', testId: 'interface-select-mnemonic' },
  { value: 'signer', label: 'Signer', testId: 'interface-select-signer' },
];

/** Dedicated "Recovery phrase" screen for importing an existing wallet via mnemonic. */
export const ImportWalletScreen: React.FC = () => {
  const navigate = useNavigate();
  const walletKit = useWalletKit();
  const { importWallet } = useTonWallet();
  const { setUseWalletInterfaceType } = useAuth();

  const [words, setWords] = useState<string[]>(Array(TOTAL_WORDS).fill(''));
  const [activeInput, setActiveInput] = useState(0);
  const [version, setVersion] = useState<WalletVersion>('v5r1');
  const [interfaceType, setInterfaceType] =
    useState<WalletInterface>('mnemonic');
  const [network, setNetwork] = useState<NetworkType>('testnet');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [discoveredWallets, setDiscoveredWallets] = useState<
    DiscoveredWalletVersion[] | null
  >(null);
  const [selectedWalletIds, setSelectedWalletIds] = useState<Set<string>>(
    new Set(),
  );
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!discoveredWallets) {
      inputRefs.current[0]?.focus();
    }
  }, [discoveredWallets]);

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

  const handleScanAndDiscover = async () => {
    if (!isValid) return;
    setError('');
    setIsLoading(true);
    try {
      setUseWalletInterfaceType(interfaceType);
      const found = await scanMnemonicWallets({
        mnemonic: validation.nonEmptyWords,
        network,
        walletKit,
      });

      setDiscoveredWallets(found);

      // Pre-select all versions that have activity or non-zero balance
      const activeSet = new Set<string>();
      for (const w of found) {
        if (w.hasActivity || w.balanceNano > 0n) {
          activeSet.add(w.id);
        }
      }
      if (activeSet.size === 0) {
        const defaultMatch =
          found.find(
            (w) =>
              w.version === version &&
              (network === 'testnet'
                ? w.subwalletId === 2147483645
                : w.subwalletId === 2147483409),
          ) ?? found[0];
        if (defaultMatch) {
          activeSet.add(defaultMatch.id);
        }
      }
      setSelectedWalletIds(activeSet);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to scan on-chain wallets',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportSelected = async () => {
    if (selectedWalletIds.size === 0) {
      setError('Please select at least one wallet version to import');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      for (const id of Array.from(selectedWalletIds)) {
        const target = discoveredWallets?.find((w) => w.id === id);
        if (target) {
          await importWallet(
            validation.nonEmptyWords,
            target.version,
            network,
            target.subwalletId,
          );
        }
      }
      navigate('/wallet');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleWalletId = (id: string) => {
    setSelectedWalletIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 1) next.delete(id); // Keep at least one selected
      } else {
        next.add(id);
      }
      return next;
    });
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
        if (isLast) void handleScanAndDiscover();
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
    void navigator.clipboard
      ?.readText()
      .then((text) => {
        const tokens = extractMnemonicWordsFromPaste(text ?? '');
        if (tokens.length === 0) return;
        const { nextWords, focusIndex } = applyMnemonicPaste(
          words,
          activeInput,
          tokens,
        );
        setWords(nextWords);
        focusCell(focusIndex);
      })
      .catch(() => {
        /* Clipboard API missing or denied; user can still Ctrl+V into a cell. */
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
      return 'border-blue-500/60 bg-blue-500/10 text-foreground';
    return 'border-border bg-card text-foreground';
  };

  // If wallets discovered, render discovery selection view
  if (discoveredWallets) {
    const footer = (
      <div className="flex gap-2">
        <Button
          variant="secondary"
          onClick={() => setDiscoveredWallets(null)}
          disabled={isLoading}
        >
          Back
        </Button>
        <Button
          fullWidth
          onClick={handleImportSelected}
          disabled={selectedWalletIds.size === 0 || isLoading}
          loading={isLoading}
          data-testid="confirm-import-selected-wallets"
        >
          Import Selected ({selectedWalletIds.size})
        </Button>
      </div>
    );

    return (
      <CenteredScreen onBack={() => setDiscoveredWallets(null)} footer={footer}>
        <div className="px-6 space-y-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">
              Select Wallet(s)
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Discovered on-chain contracts derived from your recovery phrase:
            </p>
          </div>

          <div className="space-y-3">
            {discoveredWallets.map((w) => {
              const isSelected = selectedWalletIds.has(w.id);
              return (
                <div
                  key={w.id}
                  onClick={() => toggleWalletId(w.id)}
                  className={`p-3.5 border rounded-2xl cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500/10 shadow-sm ring-1 ring-blue-500'
                      : 'border-border bg-card text-card-foreground hover:border-border/80'
                  }`}
                  data-testid={`discovered-wallet-${w.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleWalletId(w.id)}
                        className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                      />
                      <span className="font-semibold text-sm text-gray-900">
                        {w.versionLabel}
                      </span>
                    </div>
                    {w.hasActivity ? (
                      <span className="px-2 py-0.5 text-[10px] font-semibold text-green-700 bg-green-100 rounded-full">
                        Active ({w.eventCount} Txs)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-medium text-gray-500 bg-gray-100 rounded-full">
                        Uninitialized
                      </span>
                    )}
                  </div>

                  <div className="mt-2.5 text-xs space-y-1 pl-6">
                    <div className="flex justify-between items-center text-gray-600">
                      <span>Address:</span>
                      <span className="font-mono text-[11px] text-gray-800 truncate max-w-[200px]">
                        {w.address}
                      </span>
                    </div>
                    <div className="flex justify-between items-center font-medium pt-0.5">
                      <span className="text-gray-600">Balance:</span>
                      <span
                        className={
                          w.balanceNano > 0n
                            ? 'text-green-600 font-bold text-sm'
                            : 'text-gray-900'
                        }
                      >
                        {w.balanceFormatted} TON
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {error && <p className="text-center text-sm text-red-500">{error}</p>}
        </div>
      </CenteredScreen>
    );
  }

  const footer = (
    <Button
      fullWidth
      onClick={handleScanAndDiscover}
      disabled={!isValid || isLoading}
      loading={isLoading}
      data-testid="import-wallet-process"
    >
      Continue
    </Button>
  );

  return (
    <CenteredScreen onBack={() => navigate(-1)} footer={footer}>
      <div className="px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Recovery phrase</h1>
          <p className="mt-2 text-base text-gray-500">
            Enter the 12 or 24 words of your recovery phrase.
          </p>
        </div>

        <div className="mt-4 space-y-2">
          <NetworkSelector value={network} onChange={setNetwork} compact />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Version</span>
            <Segmented
              value={version}
              onChange={setVersion}
              options={VERSIONS}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Interface</span>
            <Segmented
              value={interfaceType}
              onChange={setInterfaceType}
              options={INTERFACES}
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-gray-500" data-testid="word-count">
            {validation.nonEmptyWords.length}/24 words
          </span>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-gray-500 hover:text-gray-700"
              data-testid="clear-mnemonic"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleClickPaste}
              className="text-xs text-blue-600 hover:text-blue-800"
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
                className={`w-full px-1.5 py-1.5 text-xs border rounded text-center font-mono transition-colors ${cellClassName(index)} focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                autoComplete="off"
                spellCheck={false}
              />
              <span className="absolute -top-1 left-0.5 text-[10px] text-muted-foreground bg-card px-0.5">
                {index + 1}
              </span>
            </div>
          ))}
        </div>

        {error && (
          <p className="mt-4 text-center text-sm text-red-500">{error}</p>
        )}
      </div>
    </CenteredScreen>
  );
};
