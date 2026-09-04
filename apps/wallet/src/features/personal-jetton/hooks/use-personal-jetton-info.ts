/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useMemo } from 'react';
import { Address } from '@ton/core';
import {
  useFiWalletState,
  usePersonalMinterDetails,
  usePersonalWalletAddress,
  usePersonalWalletBalance,
} from '@/lib/brotherhood/queries';
import { isZeroAddress, type PersonalMinterDetails } from '@/lib/brotherhood/ton';

export interface UsePersonalJettonInfoResult {
  personalMinterAddress: string | null;
  personalWalletAddress: string | null;
  personalBalance: bigint | null;
  minterDetails: PersonalMinterDetails | null;
  isRegistered: boolean;
  isLoading: boolean;
  refetch: () => void;
}

export function usePersonalJettonInfo(
  walletAddress: string | null,
): UsePersonalJettonInfoResult {
  const ownerAddress = useMemo(() => {
    if (!walletAddress) return null;
    try {
      return Address.parse(walletAddress);
    } catch {
      return null;
    }
  }, [walletAddress]);

  const fiWalletQuery = useFiWalletState(ownerAddress);

  const minterAddrObj = useMemo(() => {
    const minter =
      fiWalletQuery.data?.addresses?.ref?.trustedJettonAddrs?.ref
        ?.personalJettonMinter;
    return minter && !isZeroAddress(minter) ? minter : null;
  }, [fiWalletQuery.data]);

  const registeredWalletObj = useMemo(() => {
    const wallet =
      fiWalletQuery.data?.addresses?.ref?.trustedJettonAddrs?.ref
        ?.personalJettonWallet;
    return wallet && !isZeroAddress(wallet) ? wallet : null;
  }, [fiWalletQuery.data]);

  const {
    data: computedWalletAddrObj,
    isLoading: isWalletAddrLoading,
    refetch: refetchWalletAddr,
  } = usePersonalWalletAddress(minterAddrObj ?? null, ownerAddress);

  const {
    data: balance,
    isLoading: isBalanceLoading,
    refetch: refetchBalance,
  } = usePersonalWalletBalance(minterAddrObj ?? null, ownerAddress);

  const {
    data: minterDetails,
    isLoading: isMinterDetailsLoading,
    refetch: refetchMinterDetails,
  } = usePersonalMinterDetails(minterAddrObj ?? null);

  const resolvedWallet = registeredWalletObj || computedWalletAddrObj || null;

  const refetch = () => {
    fiWalletQuery.refetch();
    if (minterAddrObj) {
      refetchWalletAddr();
      refetchBalance();
      refetchMinterDetails();
    }
  };

  return {
    personalMinterAddress: minterAddrObj?.toString() ?? null,
    personalWalletAddress: resolvedWallet?.toString() ?? null,
    personalBalance: balance ?? null,
    minterDetails: minterDetails ?? null,
    isRegistered: Boolean(minterAddrObj),
    isLoading:
      fiWalletQuery.isLoading ||
      (Boolean(minterAddrObj) &&
        (isWalletAddrLoading || isBalanceLoading || isMinterDetailsLoading)),
    refetch,
  };
}
