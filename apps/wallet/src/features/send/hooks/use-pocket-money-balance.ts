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
import {
  calcSpendablePocketMoney,
  unwrapPocketMoneyEntry,
} from '@/lib/brotherhood/ton';
import type { PocketMoney } from '@/lib/brotherhood/deploy';
import { formatTonAddress, type AddressNetwork } from '@/core/utils/formatters';

export interface UsePocketMoneyBalanceParams {
  granterOwnerAddress: string | null | undefined;
  userWalletAddress: string | null | undefined;
  network?: AddressNetwork;
}

export type UseAllowanceBalanceParams = UsePocketMoneyBalanceParams;

export interface GranterPocketMoneyItem {
  address: Address;
  addressString: string;
  amount: bigint;
  pocketMoney?: PocketMoney;
}

export interface UsePocketMoneyBalanceResult {
  allowance: bigint;
  formattedAllowance: string;
  pocketMoney: PocketMoney | null;
  granterBalance: bigint;
  granterUsername: string;
  allGrantees: GranterPocketMoneyItem[];
  isLoading: boolean;
  isError: boolean;
}

export type UseAllowanceBalanceResult = UsePocketMoneyBalanceResult;

/**
 * Reads remaining spendable Pocket Money and full multi-slot configuration
 * granted by `granterOwnerAddress` to `userWalletAddress` (and all grantees on that wallet).
 * Uses in-memory deserialized state from the granter's Account (FossFiWallet).
 */
export function usePocketMoneyBalance({
  granterOwnerAddress,
  userWalletAddress,
  network = 'testnet',
}: UsePocketMoneyBalanceParams): UsePocketMoneyBalanceResult {
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

  const {
    allowance,
    pocketMoney,
    granterBalance,
    granterUsername,
    allGrantees,
  } = useMemo(() => {
    if (!store) {
      return {
        allowance: 0n,
        pocketMoney: null as PocketMoney | null,
        granterBalance: 0n,
        granterUsername: '',
        allGrantees: [] as GranterPocketMoneyItem[],
      };
    }
    const bal = store.jettonBalance ?? 0n;
    const uname = store.profile?.ref?.username ?? '';
    const granteesList: GranterPocketMoneyItem[] = [];
    let userSpendable = 0n;
    let userPm: PocketMoney | null = null;

    try {
      const maps = store.maps?.ref ?? (store.maps as any);
      const pocketMoneyMap = maps?.pocketMoney ?? (maps as any)?.allowances;
      if (pocketMoneyMap) {
        const keys = pocketMoneyMap.keys();
        for (const k of keys) {
          const rawVal = pocketMoneyMap.get(k);
          const unwrapped = unwrapPocketMoneyEntry(rawVal);
          const spendable = calcSpendablePocketMoney(rawVal, bal);
          const pmObj =
            unwrapped && typeof unwrapped === 'object' ? unwrapped : undefined;
          granteesList.push({
            address: k,
            addressString: formatTonAddress(k, {
              isContract: false,
              network,
            }),
            amount: spendable,
            pocketMoney: pmObj,
          });
        }
        if (parsedUser) {
          const entry = pocketMoneyMap.get(parsedUser);
          if (entry !== undefined && entry !== null) {
            userSpendable = calcSpendablePocketMoney(entry, bal);
            const unwrapped = unwrapPocketMoneyEntry(entry);
            userPm =
              unwrapped && typeof unwrapped === 'object' ? unwrapped : null;
          }
        }
      }
    } catch (e) {
      console.warn(
        '[usePocketMoneyBalance] Failed reading pocketMoney map:',
        e,
      );
    }

    return {
      allowance: userSpendable,
      pocketMoney: userPm,
      granterBalance: bal,
      granterUsername: uname,
      allGrantees: granteesList,
    };
  }, [store, parsedUser, network]);

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
    pocketMoney,
    granterBalance,
    granterUsername,
    allGrantees,
    isLoading: Boolean(parsedGranter && isLoading),
    isError: Boolean(error),
  };
}

export const useAllowanceBalance = usePocketMoneyBalance;
