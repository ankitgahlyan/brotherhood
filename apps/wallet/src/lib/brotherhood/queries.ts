/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useMemo, useCallback } from 'react';
import { Address } from '@ton/core';
import {
  useContractState,
  getContractCache,
  setContractCache,
} from './contract-cache';
import { FI_ADDRESS, network as defaultNetwork, type Network } from './config';
import {
  getFiWalletAddress,
  isZeroAddress,
  type PersonalMinterDetails,
} from './ton';
import { computePersonalWalletAddress } from './account-state-hydrator';
import { parseOnchainMetadataCell } from './jettonContent';
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

  const refetch = useCallback(async () => {
    if (fiWalletAddress) {
      const { batchHydrateUniversal } =
        await import('./account-state-hydrator');
      await batchHydrateUniversal([fiWalletAddress], net, {
        knownTypes: { [fiWalletAddress.toString()]: 'fiWallet' },
      });
    }
  }, [fiWalletAddress, net]);

  return {
    data,
    isLoading: isLoading && !!ownerAddress,
    isFetching: isLoading && !!ownerAddress,
    error: null as Error | null,
    timestamp,
    refetch,
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

  const refetch = useCallback(async () => {
    if (contractAddress) {
      const { batchHydrateUniversal } =
        await import('./account-state-hydrator');
      const parsed =
        typeof contractAddress === 'string'
          ? Address.parse(contractAddress.trim())
          : contractAddress;
      const std = parsed.toString();
      await batchHydrateUniversal([parsed], net, {
        knownTypes: { [std]: 'fiWallet' },
      });
    }
  }, [contractAddress, net]);

  return {
    data,
    isLoading: isLoading && !!contractAddress,
    isFetching: isLoading && !!contractAddress,
    error: null as Error | null,
    timestamp,
    refetch,
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
    data !== null ? BigInt(data.others.ref.totalAccounts) : 0n;

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

  const refetch = useCallback(async () => {
    if (!personalMinter) return;
    const { batchHydrateUniversal } = await import('./account-state-hydrator');
    const parsed =
      typeof personalMinter === 'string'
        ? Address.parse(personalMinter.trim())
        : personalMinter;
    const std = parsed.toString();
    await batchHydrateUniversal([parsed], net, {
      knownTypes: { [std]: 'personalMinter' },
    });
  }, [personalMinter, net]);

  const minterDetails: PersonalMinterDetails | null = useMemo(
    () =>
      data
        ? {
            totalSupply: data.totalSupply ?? 0n,
            fiJettonAddress: data.fiJettonAddress,
            adminAddress: data.adminAddress,
            mintable: true,
            metadata: parseOnchainMetadataCell(data.metadataUri),
          }
        : null,
    [data],
  );

  return {
    data: minterDetails,
    isLoading: enabled && isLoading,
    isFetching: enabled && isLoading,
    error: null as Error | null,
    timestamp,
    refetch,
  };
}

export function usePersonalWalletAddress(
  personalMinter: Address | null | undefined,
  ownerAddress: Address | null | undefined,
  enabled = true,
  net: Network = defaultNetwork,
  adminAddressOverride?: Address | null,
) {
  const { data: minterStore, isLoading: isMinterLoading } =
    useContractState<PersonalStore>(
      enabled && !adminAddressOverride ? personalMinter : null,
      net,
    );
  const resolvedAdmin =
    adminAddressOverride || minterStore?.adminAddress || ownerAddress;
  const address = useMemo(() => {
    if (!enabled || !personalMinter || !ownerAddress || !resolvedAdmin) {
      return null;
    }
    try {
      return computePersonalWalletAddress(
        personalMinter,
        ownerAddress,
        resolvedAdmin,
      );
    } catch {
      return null;
    }
  }, [enabled, personalMinter, ownerAddress, resolvedAdmin]);

  const isLoading = enabled && !adminAddressOverride && isMinterLoading;

  return {
    data: address,
    isLoading,
    isFetching: isLoading,
    error: null as Error | null,
    refetch: async () => {},
  };
}

export function usePersonalWalletBalance(
  personalMinter: Address | null | undefined,
  ownerAddress: Address | null | undefined,
  enabled = true,
  net: Network = defaultNetwork,
  adminAddressOverride?: Address | null,
) {
  const walletAddr = usePersonalWalletAddress(
    personalMinter,
    ownerAddress,
    enabled,
    net,
    adminAddressOverride,
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

export function useJettonMaster(enabled = true, net: Network = defaultNetwork) {
  const {
    data: fiStore,
    isLoading,
    isFetching,
  } = useFiMinterState(enabled, net);
  const meta = useMemo(
    () => parseOnchainMetadataCell(fiStore?.metadata),
    [fiStore?.metadata],
  );
  return {
    data: {
      address: FI_ADDRESS,
      name: meta.name?.trim() || 'BroTherHOOD',
      symbol: meta.symbol?.trim() || 'HD',
      image: meta.image?.trim() || undefined,
      description: meta.description?.trim() || undefined,
      decimals: 9,
    },
    isLoading,
    isFetching,
    error: null as Error | null,
    refetch: async () => {},
  };
}

export function useRefreshContractQueries() {
  return useCallback(async (_keys?: string[]) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('brotherhood_manual_wallet_refresh', {
          detail: { isPostTx: true },
        }),
      );
    }
  }, []);
}

export function markForceFresh(_key?: string) {}

export async function invalidateContractState(
  contractAddress: Address | string,
  net: Network = defaultNetwork,
  queryClientInstance?: any,
): Promise<void> {
  try {
    const { batchHydrateUniversal } = await import('./account-state-hydrator');
    const clean =
      typeof contractAddress === 'string'
        ? contractAddress.trim()
        : contractAddress.toRawString();
    await batchHydrateUniversal([clean], net, { force: true });

    if (queryClientInstance?.invalidateQueries) {
      queryClientInstance.invalidateQueries({ queryKey: ['member-profiles'] });
      queryClientInstance.invalidateQueries({
        queryKey: ['tracked-personal-tokens'],
      });
      queryClientInstance.invalidateQueries({
        queryKey: ['verified-personal-minters'],
      });
      queryClientInstance.invalidateQueries({
        queryKey: ['is-personal-minter'],
      });
    }
  } catch (err) {
    console.warn(
      '[invalidateContractState] Failed to rehydrate contract in background:',
      err,
    );
  }
}

export function createRefetchWrapper<T>(
  _cacheKey: string,
  refetchFn: () => Promise<T>,
) {
  return refetchFn;
}

const DEFAULT_QUERY_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function cachedQueryFn<T>(
  cacheKey: string,
  fetcher: (options?: any) => Promise<T>,
  ttlMs: number = DEFAULT_QUERY_CACHE_TTL_MS,
): Promise<T> {
  const cached = await getContractCache<T>(cacheKey);
  const isFresh =
    cached && cached.timestamp && Date.now() - cached.timestamp < ttlMs;

  if (cached?.data !== undefined && cached.data !== null && isFresh) {
    return cached.data;
  }
  const fresh = await fetcher();
  await setContractCache(cacheKey, fresh);
  return fresh;
}
