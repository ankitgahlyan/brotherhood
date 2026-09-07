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
import { ChangeProfile } from '@wrappers/FossFiWallet.gen';
import { getFiWalletAddress } from '@/lib/brotherhood/ton';
import type { Network } from '@/lib/brotherhood/config';
import { useBrotherhoodTransaction, GAS } from './use-brotherhood-transaction';
import type { FiAccountData } from './use-fi-account';
import { getAccountActionError } from './use-is-network-member';
import { cleanTelegramUsername } from '@/core/utils/telegram';

export interface UseProfileParams {
  wallet: Wallet | null | undefined;
  walletKit: ITonWalletKit | null;
  walletAddress: string | null;
  username: string;
  h3Cell: string;
  country: number | null;
  nominee?: string;
  network: Network;
  accountData?: FiAccountData | null;
}

export interface UseProfileResult {
  updateProfile: () => Promise<void>;
  isDisabled: boolean;
  isSending: boolean;
  isDirty: boolean;
  error: string | null;
  usernameValidationError: string | null;
  locationValidationError: string | null;
  countryValidationError: string | null;
  nomineeValidationError: string | null;
  canChangeCountry: boolean;
}

export function useProfile({
  wallet,
  walletKit,
  walletAddress,
  username,
  h3Cell,
  country,
  nominee = '',
  network,
  accountData,
}: UseProfileParams): UseProfileResult {
  const {
    send: sendTx,
    isSending,
    error,
  } = useBrotherhoodTransaction(wallet, walletKit);

  const cleanUsername = cleanTelegramUsername(username);
  const isUsernameDirty = Boolean(username.trim());

  const trimmedH3Cell = h3Cell.trim();
  const isLocationDirty = Boolean(trimmedH3Cell);

  const currentCountry = accountData?.country ?? 0;
  const isCountryDirty = country !== null && country !== currentCountry;

  const trimmedNominee = nominee.trim();
  const isNomineeDirty = Boolean(trimmedNominee);

  const { parsedNominee, nomineeValidationError } = useMemo<{
    parsedNominee: Address | null;
    nomineeValidationError: string | null;
  }>(() => {
    if (!isNomineeDirty) {
      return {
        parsedNominee: null,
        nomineeValidationError: null,
      };
    }
    try {
      const parsed = Address.parse(trimmedNominee);
      return {
        parsedNominee: parsed,
        nomineeValidationError: null,
      };
    } catch {
      return {
        parsedNominee: null,
        nomineeValidationError: 'Invalid nominee TON address format',
      };
    }
  }, [isNomineeDirty, trimmedNominee]);

  const usernameValidationError = useMemo<string | null>(() => {
    if (!wallet || !walletAddress) return 'Connect wallet first';
    const actionErr = getAccountActionError(accountData);
    if (actionErr) return actionErr;
    if (isUsernameDirty && !cleanUsername) {
      return 'Enter a valid Telegram username';
    }
    return null;
  }, [wallet, walletAddress, accountData, isUsernameDirty, cleanUsername]);

  const locationValidationError = useMemo<string | null>(() => {
    if (!wallet || !walletAddress) return 'Connect wallet first';
    const actionErr = getAccountActionError(accountData);
    if (actionErr) return actionErr;
    if (isLocationDirty && !trimmedH3Cell) {
      return 'Enter a non-empty H3 spatial cell';
    }
    return null;
  }, [wallet, walletAddress, accountData, isLocationDirty, trimmedH3Cell]);

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
    if (country !== null && (country < 0 || isNaN(country))) {
      return {
        countryValidationError: 'Select a valid country code',
        canChangeCountry: false,
      };
    }
    return { countryValidationError: null, canChangeCountry: true };
  }, [wallet, walletAddress, accountData, country]);

  const isDirty =
    isUsernameDirty || isLocationDirty || isCountryDirty || isNomineeDirty;

  const hasValidationError =
    (isUsernameDirty && Boolean(usernameValidationError)) ||
    (isLocationDirty && Boolean(locationValidationError)) ||
    (isCountryDirty && Boolean(countryValidationError)) ||
    (isNomineeDirty && Boolean(nomineeValidationError));

  const isDisabled =
    !wallet || !walletAddress || isSending || !isDirty || hasValidationError;

  const updateProfile = useCallback(async () => {
    if (!walletAddress) throw new Error('No wallet address');
    if (!isDirty) throw new Error('No profile fields modified');
    if (hasValidationError) throw new Error('Resolve validation errors first');

    const ownerAddr = Address.parse(walletAddress);
    const fiWalletAddr = await getFiWalletAddress(ownerAddr, network);

    const payload = ChangeProfile.toCell(
      ChangeProfile.create({
        queryId: 0n,
        username: isUsernameDirty ? cleanUsername : null,
        h3Cell: isLocationDirty ? trimmedH3Cell : null,
        country: isCountryDirty ? BigInt(country!) : null,
        nominee: isNomineeDirty ? parsedNominee : null,
      }),
    );

    await sendTx([
      { toAddress: fiWalletAddr.toString(), amount: GAS.PROFILE, payload },
    ]);
  }, [
    walletAddress,
    isDirty,
    hasValidationError,
    network,
    isUsernameDirty,
    cleanUsername,
    isLocationDirty,
    trimmedH3Cell,
    isCountryDirty,
    country,
    isNomineeDirty,
    parsedNominee,
    sendTx,
  ]);

  return {
    updateProfile,
    isDisabled,
    isSending,
    isDirty,
    error,
    usernameValidationError,
    locationValidationError,
    countryValidationError,
    nomineeValidationError,
    canChangeCountry,
  };
}
