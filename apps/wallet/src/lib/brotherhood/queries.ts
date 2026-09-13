/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useMemo } from 'react';
import { type Address } from '@ton/core';
import {
  useContractState,
  getNormalizedContractCacheKey,
  invalidateContractCache,
  getContractCache,
  setContractCache,
} from './contract-cache';
import { FI_ADDRESS, network as defaultNetwork, type Network } from './config';
import {
  getFiWalletAddress,
  isZeroAddress,
  type JettonMasterInfo,
  type PersonalMinterDetails,
} from './ton';
import { computePersonalWalletAddress } from './account-state-hydrator';
import type { FiWalletStore } from '@wrappers/FossFiWallet.gen';
import type { FiStore } from '@wrappers/FossFi.gen';
import type { PersonalStore } from '@wrappers/Personal.gen';
import type { PersonalWalletStore } from '@wrappers/PersonalWallet.gen';

/**
 * Universal Contract Selectors powered by synchronous L1 in-memory cache
 */

export function useFiWalletState(
  ownerAddress: Address | null | undefined,
  net: Network = defaultNetwork,
) {
  const fiWalletAddress = useMemo(() => {
    if (!ownerAddress) return null;
    try {
      return getFiWalletAddress(ownerAddress, net);
    } catch {
      return null;
    }
  }, [ownerAddress, net]);

  const { data, timestamp, isLoading } = useContractState<FiWalletStore>(
    fiWalletAddress,
    net,
  );

  return {
    data,
    isLoading: isLoading && !!ownerAddress,
    isFetching: isLoading && !!ownerAddress,
    error: null as Error | null,
    timestamp,
    refetch: async () => {},
  };
}

export function useFiWalletStateByContract(
  contractAddress: Address | string | null | undefined,
  net: Network = defaultNetwork,
) {
  const { data, timestamp, isLoading } = useContractState<FiWalletStore>(
    contractAddress,
    net,
  );
  return {
    data,
    isLoading: isLoading && !!contractAddress,
    isFetching: isLoading && !!contractAddress,
    error: null as Error | null,
    timestamp,
    refetch: async () => {},
  };
}

export function useFiMinterState(
  enabled = true,
  net: Network = defaultNetwork,
) {
  const { data, timestamp, isLoading } = useContractState<FiStore>(
    enabled ? FI_ADDRESS : null,
    net,
  );
  return {
    data,
    isLoading: enabled && isLoading,
    isFetching: enabled && isLoading,
    error: null as Error | null,
    timestamp,
    refetch: async () => {},
  };
}

export function useFiTotalAccounts(
  enabled = true,
  net: Network = defaultNetwork,
) {
  const { data, timestamp, isLoading } = useContractState<FiStore>(
    enabled ? FI_ADDRESS : null,
    net,
  );
  const totalAccounts =
    data && (data as any).totalAccounts !== undefined
      ? BigInt((data as any).totalAccounts)
      : (data?.totalSupply ?? null);

  return {
    data: totalAccounts,
    isLoading: enabled && isLoading,
    isFetching: enabled && isLoading,
    error: null as Error | null,
    timestamp,
    refetch: async () => {},
  };
}

export function usePersonalMinterForIssuer(
  ownerAddress: Address | null | undefined,
  net: Network = defaultNetwork,
) {
  const { data, isLoading, isFetching } = useFiWalletState(ownerAddress, net);
  const minter =
    data?.addresses?.ref?.trustedJettonAddrs?.ref?.personalJettonMinter;
  const personalMinter = minter && !isZeroAddress(minter) ? minter : null;
  return {
    data: personalMinter,
    isLoading,
    isFetching,
    error: null as Error | null,
    refetch: async () => {},
  };
}

export function usePersonalWalletForIssuer(
  ownerAddress: Address | null | undefined,
  net: Network = defaultNetwork,
) {
  const { data, isLoading, isFetching } = useFiWalletState(ownerAddress, net);
  const wallet =
    data?.addresses?.ref?.trustedJettonAddrs?.ref?.personalJettonWallet;
  const personalWallet = wallet && !isZeroAddress(wallet) ? wallet : null;
  return {
    data: personalWallet,
    isLoading,
    isFetching,
    error: null as Error | null,
    refetch: async () => {},
  };
}

export function usePersonalMinterDetails(
  personalMinter: Address | string | null | undefined,
  enabled = true,
  net: Network = defaultNetwork,
) {
  const { data, timestamp, isLoading } = useContractState<PersonalStore>(
    enabled ? personalMinter : null,
    net,
  );

  const minterDetails: PersonalMinterDetails | null = data
    ? {
        totalSupply: data.totalSupply ?? 0n,
        fiJettonAddress: data.fiJettonAddress,
        adminAddress: data.adminAddress,
        mintable: true,
      }
    : null;

  return {
    data: minterDetails,
    isLoading: enabled && isLoading,
    isFetching: enabled && isLoading,
    error: null as Error | null,
    timestamp,
    refetch: async () => {},
  };
}

export function usePersonalWalletAddress(
  personalMinter: Address | null | undefined,
  ownerAddress: Address | null | undefined,
  enabled = true,
  net: Network = defaultNetwork,
) {
  const minterDetails = usePersonalMinterDetails(personalMinter, enabled, net);
  const address = useMemo(() => {
    if (!enabled || !personalMinter || !ownerAddress) return null;
    const adminAddress = minterDetails.data?.adminAddress || ownerAddress;
    try {
      return computePersonalWalletAddress(
        personalMinter,
        ownerAddress,
        adminAddress,
      );
    } catch {
      return null;
    }
  }, [enabled, personalMinter, ownerAddress, minterDetails.data?.adminAddress]);

  return {
    data: address,
    isLoading: minterDetails.isLoading,
    isFetching: minterDetails.isFetching,
    error: null as Error | null,
    refetch: async () => {},
  };
}

export function usePersonalWalletBalance(
  personalMinter: Address | null | undefined,
  ownerAddress: Address | null | undefined,
  enabled = true,
  net: Network = defaultNetwork,
) {
  const walletAddr = usePersonalWalletAddress(
    personalMinter,
    ownerAddress,
    enabled,
    net,
  );
  const { data: walletStore, isLoading } =
    useContractState<PersonalWalletStore>(walletAddr.data, net);

  return {
    data: walletStore?.jettonBalance ?? 0n,
    isLoading: walletAddr.isLoading || isLoading,
    isFetching: walletAddr.isFetching || isLoading,
    error: null as Error | null,
    refetch: async () => {},
  };
}

export function useIsContractDeployed(
  address: Address | string | null | undefined,
  enabled = true,
  net: Network = defaultNetwork,
) {
  const { data, isLoading } = useContractState<any>(
    enabled ? address : null,
    net,
  );
  return {
    data: Boolean(data),
    isLoading: enabled && isLoading,
    isFetching: enabled && isLoading,
    error: null as Error | null,
    refetch: async () => {},
  };
}

export function useJettonMaster(_enabled = true) {
  return {
    data: {
      address: FI_ADDRESS,
      name: 'Brotherhood FossFi',
      symbol: 'FI',
      decimals: 9,
    },
    isLoading: false,
    isFetching: false,
    error: null as Error | null,
    refetch: async () => {},
  };
}

export function useRefreshContractQueries() {
  return async (_keys?: string[]) => {};
}

export function markForceFresh(_key?: string) {}

export async function invalidateContractState(
  contractAddress: Address | string,
  net: Network = defaultNetwork,
  _queryClient?: any,
): Promise<void> {
  await invalidateContractCache(net, contractAddress);
}

export function createRefetchWrapper<T>(
  _cacheKey: string,
  refetchFn: () => Promise<T>,
) {
  return refetchFn;
}

export async function cachedQueryFn<T>(
  cacheKey: string,
  fetcher: (options?: any) => Promise<T>,
): Promise<T> {
  const cached = await getContractCache<T>(cacheKey);
  if (cached?.data !== undefined && cached.data !== null) {
    return cached.data;
  }
  const fresh = await fetcher();
  await setContractCache(cacheKey, fresh);
  return fresh;
}
