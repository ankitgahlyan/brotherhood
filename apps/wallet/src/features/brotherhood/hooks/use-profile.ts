/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useCallback, useMemo } from 'react';
import { Address } from '@ton/core';
import type { ITonWalletKit, Wallet } from '@ton/walletkit';
import {
  ChangeUsername,
  ChangeLocation,
  ChangeCountry,
} from '@wrappers/FossFiWallet.gen';
import { getFiWalletAddress } from '@/lib/brotherhood/ton';
import type { Network } from '@/lib/brotherhood/config';
import { useBrotherhoodTransaction, GAS } from './use-brotherhood-transaction';
import type { FiAccountData } from './use-fi-account';
import { getAccountActionError } from './use-is-network-member';

export interface UseProfileParams {
  wallet: Wallet | null | undefined;
  walletKit: ITonWalletKit | null;
  walletAddress: string | null;
  username: string;
  h3Cell: string;
  country: number;
  network: Network;
  accountData?: FiAccountData | null;
}

export interface UseProfileResult {
  updateUsername: () => Promise<void>;
  updateLocation: () => Promise<void>;
  updateCountry: () => Promise<void>;
  isDisabled: boolean;
  isSending: boolean;
  error: string | null;
  usernameValidationError: string | null;
  locationValidationError: string | null;
  countryValidationError: string | null;
  canChangeCountry: boolean;
}

export function useProfile({
  wallet,
  walletKit,
  walletAddress,
  username,
  h3Cell,
  country,
  network,
  accountData,
}: UseProfileParams): UseProfileResult {
  const {
    send: sendTx,
    isSending,
    error,
  } = useBrotherhoodTransaction(wallet, walletKit);

  const usernameValidationError = useMemo<string | null>(() => {
    if (!wallet || !walletAddress) return 'Connect wallet first';
    const actionErr = getAccountActionError(accountData);
    if (actionErr) return actionErr;
    if (!username.trim()) return 'Enter a non-empty username';
    return null;
  }, [wallet, walletAddress, accountData, username]);

  const locationValidationError = useMemo<string | null>(() => {
    if (!wallet || !walletAddress) return 'Connect wallet first';
    const actionErr = getAccountActionError(accountData);
    if (actionErr) return actionErr;
    if (!h3Cell.trim()) return 'Enter a non-empty H3 spatial cell';
    return null;
  }, [wallet, walletAddress, accountData, h3Cell]);

  const { countryValidationError, canChangeCountry } = useMemo<{
    countryValidationError: string | null;
    canChangeCountry: boolean;
  }>(() => {
    if (!wallet || !walletAddress) {
      return {
        countryValidationError: 'Connect wallet first',
        canChangeCountry: false,
      };
    }
    const actionErr = getAccountActionError(accountData);
    if (actionErr) {
      return {
        countryValidationError: actionErr,
        canChangeCountry: false,
      };
    }
    if (accountData) {
      // Contract rule: assert (store.votes == 10) throw Errors.HasActiveVotes;
      if (accountData.votes < 10) {
        return {
          countryValidationError: `Cannot change country while having active votes (${10 - accountData.votes} votes cast). Please unvote all candidates first.`,
          canChangeCountry: false,
        };
      }
    }
    if (country < 0 || isNaN(country)) {
      return {
        countryValidationError: 'Select a valid country code',
        canChangeCountry: false,
      };
    }
    return { countryValidationError: null, canChangeCountry: true };
  }, [wallet, walletAddress, accountData, country]);

  const updateUsername = useCallback(async () => {
    if (!walletAddress) throw new Error('No wallet address');
    const ownerAddr = Address.parse(walletAddress);
    const fiWalletAddr = await getFiWalletAddress(ownerAddr, network);

    const payload = ChangeUsername.toCell(
      ChangeUsername.create({
        newUsername: username.trim(),
      }),
    );

    await sendTx([
      { toAddress: fiWalletAddr.toString(), amount: GAS.PROFILE, payload },
    ]);
  }, [walletAddress, username, network, sendTx]);

  const updateLocation = useCallback(async () => {
    if (!walletAddress) throw new Error('No wallet address');
    const ownerAddr = Address.parse(walletAddress);
    const fiWalletAddr = await getFiWalletAddress(ownerAddr, network);

    const payload = ChangeLocation.toCell(
      ChangeLocation.create({
        newH3Cell: h3Cell.trim(),
      }),
    );

    await sendTx([
      { toAddress: fiWalletAddr.toString(), amount: GAS.PROFILE, payload },
    ]);
  }, [walletAddress, h3Cell, network, sendTx]);

  const updateCountry = useCallback(async () => {
    if (!walletAddress) throw new Error('No wallet address');
    const ownerAddr = Address.parse(walletAddress);
    const fiWalletAddr = await getFiWalletAddress(ownerAddr, network);

    const payload = ChangeCountry.toCell(
      ChangeCountry.create({
        newCountry: BigInt(country),
      }),
    );

    await sendTx([
      { toAddress: fiWalletAddr.toString(), amount: GAS.PROFILE, payload },
    ]);
  }, [walletAddress, country, network, sendTx]);

  const isDisabled = !wallet || !walletAddress || isSending;

  return {
    updateUsername,
    updateLocation,
    updateCountry,
    isDisabled,
    isSending,
    error,
    usernameValidationError,
    locationValidationError,
    countryValidationError,
    canChangeCountry,
  };
}
