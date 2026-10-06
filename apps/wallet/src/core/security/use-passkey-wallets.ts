/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useState, useCallback } from 'react';
import { useWalletStoreApi } from '@demo/wallet-core';

import {
  authenticateBiometrics,
  enrollBiometricVaultWithCredentialId,
} from './biometrics';
import {
  generateRandomVaultPassword,
  restoreWalletsFromPasskey,
  saveWalletsToPasskey,
} from './passkey-wallets';
import type { PasskeyWalletPayload } from './passkey-wallets';
import { useBiometrics } from './use-biometrics';

export interface UsePasskeyWalletsResult {
  isSupported: boolean;
  isInsecureContext: boolean;
  isBackingUp: boolean;
  isRestoring: boolean;
  backupAllWallets: (
    extraWallets?: readonly PasskeyWalletPayload[],
  ) => Promise<number>;
  restoreFromPasskey: () => Promise<{
    importedCount: number;
    totalFound: number;
  } | null>;
}

export function usePasskeyWallets(): UsePasskeyWalletsResult {
  const storeApi = useWalletStoreApi();
  const { isSupported, isInsecureContext } = useBiometrics();
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const backupAllWallets = useCallback(
    async (
      extraWallets: readonly PasskeyWalletPayload[] = [],
    ): Promise<number> => {
      setIsBackingUp(true);
      try {
        const state = storeApi.getState();
        const payloads: PasskeyWalletPayload[] = [...extraWallets];

        if (state.auth.currentPassword) {
          const activeId = state.walletManagement.activeWalletId;
          const orderedSaved = [...state.walletManagement.savedWallets].sort(
            (a, b) => (a.id === activeId ? -1 : b.id === activeId ? 1 : 0),
          );

          for (const saved of orderedSaved) {
            if (!saved.encryptedMnemonic || saved.isWatchOnly) continue;
            const words = await state.getDecryptedMnemonic(saved.id);
            if (words && (words.length === 12 || words.length === 24)) {
              payloads.push({
                mnemonic: words,
                name: saved.name,
                network: saved.network,
                version: saved.version || 'v5r1',
                subwalletId:
                  saved.subwalletId ??
                  (saved.network === 'testnet' ? 2147483645 : 2147483409),
                interfaceType:
                  saved.walletInterfaceType === 'signer'
                    ? 'signer'
                    : 'mnemonic',
              });
            }
          }
        }

        const result = await saveWalletsToPasskey(
          payloads,
          state.auth.currentPassword,
        );
        return result.savedCount;
      } finally {
        setIsBackingUp(false);
      }
    },
    [storeApi],
  );

  const restoreFromPasskey = useCallback(async (): Promise<{
    importedCount: number;
    totalFound: number;
  } | null> => {
    setIsRestoring(true);
    try {
      const result = await restoreWalletsFromPasskey();
      if (!result || result.wallets.length === 0) {
        return null;
      }

      let state = storeApi.getState();
      if (!state.walletCore.walletKit) {
        await state.initializeWalletKit();
        state = storeApi.getState();
      }

      // Ensure local vault password is initialized & unlocked (1-tap passwordless on fresh devices)
      if (!state.auth.currentPassword) {
        if (
          !state.auth.isPasswordSet ||
          state.walletManagement.savedWallets.length === 0
        ) {
          const autoPassword =
            result.vaultPassword || generateRandomVaultPassword();
          await state.setPassword(autoPassword);
        } else {
          let unlocked = false;
          if (result.vaultPassword) {
            unlocked = await state.unlock(result.vaultPassword);
          }
          if (!unlocked) {
            const bioPassword = await authenticateBiometrics();
            if (bioPassword) {
              unlocked = await state.unlock(bioPassword);
            }
          }
          if (!unlocked && !storeApi.getState().auth.currentPassword) {
            throw new Error(
              'Please unlock your existing wallet first before importing additional Passkey wallets.',
            );
          }
        }
      }

      const activePassword = storeApi.getState().auth.currentPassword;
      if (result.credentialId && activePassword) {
        await enrollBiometricVaultWithCredentialId(
          result.credentialId,
          activePassword,
        );
      }

      state = storeApi.getState();
      const existingKeys = new Map<string, string>();
      for (const saved of state.walletManagement.savedWallets) {
        if (!saved.encryptedMnemonic) continue;
        const words = await state.getDecryptedMnemonic(saved.id);
        if (words && words.length > 0) {
          const subId =
            saved.subwalletId ??
            (saved.network === 'testnet' ? 2147483645 : 2147483409);
          const key = `${words.map((w) => w.trim().toLowerCase()).join(' ')}:${saved.network}:${subId}`;
          existingKeys.set(key, saved.id);
        }
      }

      let importedCount = 0;
      let targetWalletId: string | undefined;

      for (const wallet of result.wallets) {
        const subId =
          wallet.subwalletId ??
          (wallet.network === 'testnet' ? 2147483645 : 2147483409);
        const key = `${wallet.mnemonic.map((w) => w.trim().toLowerCase()).join(' ')}:${wallet.network}:${subId}`;
        const existingId = existingKeys.get(key);
        if (existingId) {
          if (!targetWalletId) targetWalletId = existingId;
          continue;
        }

        storeApi
          .getState()
          .setUseWalletInterfaceType(wallet.interfaceType || 'mnemonic');
        const createdId = await storeApi
          .getState()
          .importWallet(
            wallet.mnemonic,
            wallet.name,
            'v5r1',
            wallet.network,
            subId,
          );
        existingKeys.set(key, createdId);
        if (!targetWalletId) targetWalletId = createdId;
        importedCount++;
      }

      if (
        targetWalletId &&
        storeApi.getState().walletManagement.activeWalletId !== targetWalletId
      ) {
        await storeApi.getState().switchWallet(targetWalletId);
      }

      return {
        importedCount,
        totalFound: result.wallets.length,
      };
    } finally {
      setIsRestoring(false);
    }
  }, [storeApi]);

  return {
    isSupported,
    isInsecureContext,
    isBackingUp,
    isRestoring,
    backupAllWallets,
    restoreFromPasskey,
  };
}
