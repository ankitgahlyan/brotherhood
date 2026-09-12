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
  getPersonalMinter,
  getExpectedPersonalWalletAddress,
} from '@/lib/brotherhood/deploy';

export interface UsePersonalJettonInfoResult {
  personalMinterAddress: string | null;
  personalWalletAddress: string | null;
  deterministicMinterAddress: string | null;
  expectedPersonalWalletAddress: string | null;
  registeredMinterAddress: string | null;
  registeredWalletAddress: string | null;
  personalBalance: bigint | null;
  minterDetails: PersonalMinterDetails | null;
  isRegistered: boolean;
  isDeployedOnChain: boolean;
  hasMismatchedRegistration: boolean;
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
    const addr = getFiWalletAddress(ownerAddress);
    if (!cancelled) setFiWalletAddr(addr);
    return () => {
      cancelled = true;
    };
  }, [ownerAddress]);

  const deterministicMinterAddrObj = useMemo(() => {
    if (!ownerAddress || !fiWalletAddr) return null;
    try {
      const { contractAddress } = getPersonalMinter({
        issuerWallet: fiWalletAddr,
        adminAddress: ownerAddress,
      });
      return contractAddress;
    } catch {
      return null;
    }
  }, [ownerAddress, fiWalletAddr]);

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

  const deterministicDeployedQuery = useIsContractDeployed(
    deterministicMinterAddrObj,
    Boolean(deterministicMinterAddrObj),
  );

  const registeredDeployedQuery = useIsContractDeployed(
    registeredMinterObj,
    Boolean(registeredMinterObj),
  );

  const isRegisteredMinterDeployed = Boolean(registeredDeployedQuery.data);

  // Active minter: if fiWallet has non-zero addresses that are deployed on-chain, use them;
  // otherwise use deterministic minter
  const activeMinterObj = useMemo(() => {
    if (registeredMinterObj && isRegisteredMinterDeployed) {
      return registeredMinterObj;
    }
    if (deterministicMinterAddrObj) {
      return deterministicMinterAddrObj;
    }
    return null;
  }, [
    registeredMinterObj,
    isRegisteredMinterDeployed,
    deterministicMinterAddrObj,
  ]);

  const fallbackWalletObj = useMemo(() => {
    const targetMinter = deterministicMinterAddrObj;
    if (!targetMinter || !ownerAddress) return null;
    try {
      return getExpectedPersonalWalletAddress({
        personalMinter: targetMinter,
        owner: ownerAddress,
      });
    } catch {
      return null;
    }
  }, [deterministicMinterAddrObj, ownerAddress]);

  const isMinterRegistered = Boolean(
    registeredMinterObj &&
    deterministicMinterAddrObj &&
    registeredMinterObj.equals(deterministicMinterAddrObj),
  );

  const isWalletRegistered = Boolean(
    registeredWalletObj &&
    fallbackWalletObj &&
    registeredWalletObj.equals(fallbackWalletObj),
  );

  const isRegistered = Boolean(isMinterRegistered && isWalletRegistered);

  const hasMismatchedRegistration = Boolean(
    (registeredMinterObj && !isMinterRegistered) ||
    (registeredWalletObj && !isWalletRegistered),
  );

  const {
    data: minterDetails,
    isLoading: isMinterDetailsLoading,
    refetch: refetchMinterDetails,
  } = usePersonalMinterDetails(activeMinterObj ?? null);

  const isDeployedOnChain = Boolean(
    (activeMinterObj &&
    registeredMinterObj &&
    activeMinterObj.equals(registeredMinterObj)
      ? isRegisteredMinterDeployed
      : deterministicDeployedQuery.data) || minterDetails,
  );

  const {
    data: computedWalletAddrObj,
    isLoading: isWalletAddrLoading,
    refetch: refetchWalletAddr,
  } = usePersonalWalletAddress(
    activeMinterObj ?? null,
    ownerAddress,
    isDeployedOnChain,
  );

  const {
    data: balance,
    isLoading: isBalanceLoading,
    refetch: refetchBalance,
  } = usePersonalWalletBalance(
    activeMinterObj ?? null,
    ownerAddress,
    isDeployedOnChain,
  );

  const resolvedWallet =
    (activeMinterObj &&
    registeredMinterObj &&
    activeMinterObj.equals(registeredMinterObj)
      ? registeredWalletObj
      : null) ||
    computedWalletAddrObj ||
    fallbackWalletObj ||
    null;

  const expectedWalletAddrStr = fallbackWalletObj
    ? fallbackWalletObj.toString()
    : null;

  const refetch = () => {
    fiWalletQuery.refetch();
    deterministicDeployedQuery.refetch();
    registeredDeployedQuery.refetch();
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
    registeredMinterAddress: registeredMinterObj?.toString() ?? null,
    registeredWalletAddress: registeredWalletObj?.toString() ?? null,
    personalBalance: balance ?? null,
    minterDetails: minterDetails ?? null,
    isRegistered,
    isDeployedOnChain,
    hasMismatchedRegistration,
    isLoading:
      fiWalletQuery.isLoading ||
      deterministicDeployedQuery.isLoading ||
      (Boolean(registeredMinterObj) && registeredDeployedQuery.isLoading) ||
      (Boolean(activeMinterObj) &&
        (isWalletAddrLoading || isBalanceLoading || isMinterDetailsLoading)),
    refetch,
  };
}
