/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useMemo } from 'react';
import { Address } from '@ton/core';
import { useFiWalletState } from '@/lib/brotherhood/queries';
import type { AddressNetwork } from '@/core/utils/formatters';

interface UseAllowanceBalanceParams {
  granterOwnerAddress: string | null | undefined;
  userWalletAddress: string | null | undefined;
  network?: AddressNetwork;
}

export interface UseAllowanceBalanceResult {
  allowance: bigint;
  formattedAllowance: string;
  isLoading: boolean;
  isError: boolean;
}

/**
 * Reads remaining Allowance granted by `granterOwnerAddress` to `userWalletAddress`.
 * Uses in-memory deserialized state from the granter's Account (FossFiWallet).
 */
export function useAllowanceBalance({
  granterOwnerAddress,
  userWalletAddress,
  network = 'testnet',
}: UseAllowanceBalanceParams): UseAllowanceBalanceResult {
  const parsedGranter = useMemo(() => {
    if (!granterOwnerAddress?.trim()) return null;
    try {
      return Address.parse(granterOwnerAddress.trim());
    } catch {
      return null;
    }
  }, [granterOwnerAddress]);

  const parsedUser = useMemo(() => {
    if (!userWalletAddress?.trim()) return null;
    try {
      return Address.parse(userWalletAddress.trim());
    } catch {
      return null;
    }
  }, [userWalletAddress]);

  const {
    data: store,
    isLoading,
    error,
  } = useFiWalletState(
    parsedGranter,
    network === 'mainnet' ? 'mainnet' : 'testnet',
  );

  const allowance = useMemo<bigint>(() => {
    if (!store || !parsedUser) return 0n;
    try {
      const maps = store.maps?.ref ?? (store.maps as any);
      const allowancesMap = maps?.allowances;
      if (!allowancesMap) return 0n;
      const entry = allowancesMap.get(parsedUser);
      return entry ?? 0n;
    } catch (e) {
      console.warn('[useAllowanceBalance] Failed reading allowance map:', e);
      return 0n;
    }
  }, [store, parsedUser]);

  const formattedAllowance = useMemo(() => {
    const whole = allowance / 1_000_000_000n;
    const frac = allowance % 1_000_000_000n;
    if (frac === 0n) return whole.toString();
    const fracStr = frac.toString().padStart(9, '0').replace(/0+$/, '');
    return `${whole}.${fracStr}`;
  }, [allowance]);

  return {
    allowance,
    formattedAllowance,
    isLoading: Boolean(parsedGranter && isLoading),
    isError: Boolean(error),
  };
}
