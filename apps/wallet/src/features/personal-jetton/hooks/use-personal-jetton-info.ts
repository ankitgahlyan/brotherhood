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
  usePersonalMinterForIssuer,
  usePersonalWalletForIssuer,
  usePersonalWalletAddress,
  usePersonalWalletBalance,
} from '@/lib/brotherhood/queries';

export interface UsePersonalJettonInfoResult {
  personalMinterAddress: string | null;
  personalWalletAddress: string | null;
  personalBalance: bigint | null;
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

  const {
    data: minterAddrObj,
    isLoading: isMinterLoading,
    refetch: refetchMinter,
  } = usePersonalMinterForIssuer(ownerAddress);

  const {
    data: registeredWalletObj,
    isLoading: isIssuerWalletLoading,
    refetch: refetchIssuerWallet,
  } = usePersonalWalletForIssuer(ownerAddress);

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

  const resolvedWallet = registeredWalletObj || computedWalletAddrObj || null;

  const refetch = () => {
    refetchMinter();
    refetchIssuerWallet();
    refetchWalletAddr();
    refetchBalance();
  };

  return {
    personalMinterAddress: minterAddrObj?.toString() ?? null,
    personalWalletAddress: resolvedWallet?.toString() ?? null,
    personalBalance: balance ?? null,
    isRegistered: Boolean(minterAddrObj),
    isLoading:
      isMinterLoading ||
      isIssuerWalletLoading ||
      isWalletAddrLoading ||
      isBalanceLoading,
    refetch,
  };
}
