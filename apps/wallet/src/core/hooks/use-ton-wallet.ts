/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { CreateTonMnemonic } from '@ton/walletkit';
import { useWallet, useAuth } from '@demo/wallet-core';
import type { NetworkType } from '@demo/wallet-core';

import { createComponentLogger } from '@/core/lib/logger';

// Create logger for TON wallet hook
const log = createComponentLogger('useTonWallet');

// Mock TON Kit type for demo purposes
interface MockTonKit {
  initialized: boolean;
}

interface UseTonWalletReturn {
  tonKit: MockTonKit | null;
  isInitialized: boolean;
  error: string | null;
  initializeWallet: () => Promise<void>;
  createNewWallet: () => Promise<string[]>;
  createLedgerWallet: (network?: NetworkType, name?: string) => Promise<void>;
  importWallet: (
    mnemonic: string[],
    version?: 'v5r1',
    network?: NetworkType,
    subwalletId?: number,
    name?: string,
  ) => Promise<void>;
}

export const useTonWallet = (): UseTonWalletReturn => {
  const [tonKit] = useState<MockTonKit | null>(() => ({ initialized: true }));
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    hasWallet,
    loadAllWallets,
    createWallet,
    createLedgerWallet: storeCreateLedgerWallet,
    importWallet: storeImportWallet,
  } = useWallet();
  const { isUnlocked, currentPassword } = useAuth();

  const initializeWallet = useCallback(async () => {
    try {
      // Load existing wallet if available
      if (hasWallet && isUnlocked && currentPassword) {
        await loadAllWallets();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      log.error('Error initializing TON wallet:', err);
    } finally {
      setIsInitialized(true);
    }
  }, [hasWallet, isUnlocked, currentPassword, loadAllWallets]);

  const createNewWallet = useCallback(async (): Promise<string[]> => {
    if (!tonKit) throw new Error('TON Kit not initialized');

    try {
      setError(null);
      const mnemonic = await CreateTonMnemonic();

      // Create wallet with mnemonic
      await createWallet(mnemonic);

      return mnemonic;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to create wallet';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [tonKit, createWallet]);

  const createLedgerWallet = useCallback(
    async (network?: NetworkType, name?: string): Promise<void> => {
      if (!tonKit) throw new Error('TON Kit not initialized');

      try {
        setError(null);

        // Create Ledger wallet
        await storeCreateLedgerWallet(name, network);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to create Ledger wallet';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [tonKit, storeCreateLedgerWallet],
  );

  const importWallet = useCallback(
    async (
      mnemonic: string[],
      version?: 'v5r1',
      network?: NetworkType,
      subwalletId?: number,
      name?: string,
    ): Promise<void> => {
      if (!tonKit) throw new Error('TON Kit not initialized');

      try {
        setError(null);

        // Mock mnemonic validation - just check if it's 12 or 24 words
        const isValid = mnemonic.length === 12 || mnemonic.length === 24;

        if (!isValid) {
          throw new Error('Invalid mnemonic phrase');
        }

        // Import wallet
        await storeImportWallet(mnemonic, name, version, network, subwalletId);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to import wallet';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [tonKit, storeImportWallet],
  );

  // Auto-initialize once when component mounts and wallet is unlocked
  const hasInitializedRef = useRef(false);
  useEffect(() => {
    if (
      !hasInitializedRef.current &&
      hasWallet &&
      isUnlocked &&
      currentPassword
    ) {
      hasInitializedRef.current = true;
      void initializeWallet();
    }
  }, [hasWallet, isUnlocked, currentPassword, initializeWallet]);

  return {
    tonKit,
    isInitialized,
    error,
    initializeWallet,
    createNewWallet,
    createLedgerWallet,
    importWallet,
  };
};
