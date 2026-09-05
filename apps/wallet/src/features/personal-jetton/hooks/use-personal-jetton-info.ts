/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useState, useEffect, useMemo } from 'react';
import { Address } from '@ton/core';
import {
  useFiWalletState,
  usePersonalMinterDetails,
  usePersonalWalletAddress,
  usePersonalWalletBalance,
  useIsContractDeployed,
} from '@/lib/brotherhood/queries';
import {
  isZeroAddress,
  getFiWalletAddress,
  type PersonalMinterDetails,
} from '@/lib/brotherhood/ton';
import {
  getDeterministicPersonalMinter,
  getExpectedPersonalWalletAddress,
} from '@/lib/brotherhood/deploy';

export interface UsePersonalJettonInfoResult {
  personalMinterAddress: string | null;
  personalWalletAddress: string | null;
  deterministicMinterAddress: string | null;
  expectedPersonalWalletAddress: string | null;
  personalBalance: bigint | null;
  minterDetails: PersonalMinterDetails | null;
  isRegistered: boolean;
  isDeployedOnChain: boolean;
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

  const [fiWalletAddr, setFiWalletAddr] = useState<Address | null>(null);

  useEffect(() => {
    if (!ownerAddress) {
      setFiWalletAddr(null);
      return;
    }
    let cancelled = false;
    getFiWalletAddress(ownerAddress)
      .then((addr) => {
        if (!cancelled) setFiWalletAddr(addr);
      })
      .catch(() => {
        if (!cancelled) setFiWalletAddr(null);
      });
    return () => {
      cancelled = true;
    };
  }, [ownerAddress]);

  const deterministicMinterAddrObj = useMemo(() => {
    if (!ownerAddress || !fiWalletAddr) return null;
    try {
      const { contractAddress } = getDeterministicPersonalMinter({
        issuerWallet: fiWalletAddr,
        adminAddress: ownerAddress,
      });
      return contractAddress;
    } catch {
      return null;
    }
  }, [ownerAddress, fiWalletAddr]);

  const deployedCheckQuery = useIsContractDeployed(
    deterministicMinterAddrObj,
    Boolean(deterministicMinterAddrObj),
  );

  const fiWalletQuery = useFiWalletState(ownerAddress);

  const registeredMinterObj = useMemo(() => {
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

  const isDeployedOnChain = Boolean(deployedCheckQuery.data);
  const isRegistered = Boolean(registeredMinterObj);

  // Active minter is registered minter if available; otherwise deterministic minter if deployed on-chain
  const activeMinterObj = useMemo(() => {
    if (registeredMinterObj) return registeredMinterObj;
    if (isDeployedOnChain && deterministicMinterAddrObj) {
      return deterministicMinterAddrObj;
    }
    return null;
  }, [registeredMinterObj, isDeployedOnChain, deterministicMinterAddrObj]);

  const {
    data: computedWalletAddrObj,
    isLoading: isWalletAddrLoading,
    refetch: refetchWalletAddr,
  } = usePersonalWalletAddress(activeMinterObj ?? null, ownerAddress);

  const {
    data: balance,
    isLoading: isBalanceLoading,
    refetch: refetchBalance,
  } = usePersonalWalletBalance(activeMinterObj ?? null, ownerAddress);

  const {
    data: minterDetails,
    isLoading: isMinterDetailsLoading,
    refetch: refetchMinterDetails,
  } = usePersonalMinterDetails(activeMinterObj ?? null);

  const fallbackWalletObj = useMemo(() => {
    const targetMinter = activeMinterObj || deterministicMinterAddrObj;
    if (!targetMinter || !ownerAddress) return null;
    try {
      return getExpectedPersonalWalletAddress({
        personalMinter: targetMinter,
        owner: ownerAddress,
      });
    } catch {
      return null;
    }
  }, [activeMinterObj, deterministicMinterAddrObj, ownerAddress]);

  const resolvedWallet =
    registeredWalletObj || computedWalletAddrObj || fallbackWalletObj || null;

  const expectedWalletAddrStr = fallbackWalletObj
    ? fallbackWalletObj.toString()
    : null;

  const refetch = () => {
    fiWalletQuery.refetch();
    deployedCheckQuery.refetch();
    if (activeMinterObj) {
      refetchWalletAddr();
      refetchBalance();
      refetchMinterDetails();
    }
  };

  return {
    personalMinterAddress: activeMinterObj?.toString() ?? null,
    personalWalletAddress: resolvedWallet?.toString() ?? null,
    deterministicMinterAddress: deterministicMinterAddrObj?.toString() ?? null,
    expectedPersonalWalletAddress: expectedWalletAddrStr,
    personalBalance: balance ?? null,
    minterDetails: minterDetails ?? null,
    isRegistered,
    isDeployedOnChain,
    isLoading:
      fiWalletQuery.isLoading ||
      deployedCheckQuery.isLoading ||
      (Boolean(activeMinterObj) &&
        (isWalletAddrLoading || isBalanceLoading || isMinterDetailsLoading)),
    refetch,
  };
}
