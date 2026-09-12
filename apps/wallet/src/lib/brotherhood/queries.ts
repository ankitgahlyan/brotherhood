import { QueryClient, useQuery, useQueryClient } from '@tanstack/react-query';
import { type Address } from '@ton/core';
import {
  fetchJettonMaster,
  fetchWalletBalance,
  getCircle,
  getFiMinterState,
  getFiMinterTotalAccounts,
  getFiWalletState,
  getFiWalletStateByContractAddress,
  getPersonalMinterDetails,
  getPersonalWalletAddress,
  getPersonalWalletBalance,
  isZeroAddress,
  checkIsContractDeployed,
  type JettonMasterInfo,
  type Network,
  type PersonalMinterDetails,
} from './ton';
import {
  setContractCache,
  getContractCache,
  deleteContractCache,
  getNormalizedContractCacheKey,
  invalidateContractCache,
} from './contract-cache';
import { network } from './config';
import { isOnline } from '@/core/lib/network-status';

const forceFreshKeys = new Set<string>();
let forceFreshAll = false;

/**
 * Mark a specific cache key or contract address as needing fresh on-chain data.
 * When called with key, marks that specific key. When called without args (e.g. manual refresh button),
 * sets forceFreshAll = true.
 */
export function markForceFresh(key?: string) {
  if (key) {
    forceFreshKeys.add(key);
  } else {
    forceFreshAll = true;
  }
}

/**
 * Targeted invalidation for a specific contract.
 * Cleans IndexedDB cache and forces fresh fetch for matching TanStack Query keys.
 */
export async function invalidateContractState(
  contractAddress: Address | string,
  net: Network = 'testnet',
  queryClient?: QueryClient,
): Promise<void> {
  const addrStr =
    typeof contractAddress === 'string'
      ? contractAddress
      : contractAddress.toString();

  // 1. Purge from IndexedDB
  await invalidateContractCache(net, addrStr);
  await deleteContractCache(`fi-wallet-state-by-contract:${net}:${addrStr}`);

  // 2. Mark force fresh in memory
  const normalizedKey = getNormalizedContractCacheKey(net, addrStr);
  markForceFresh(normalizedKey);
  markForceFresh(`fi-wallet-state-by-contract:${net}:${addrStr}`);

  // 3. Selectively invalidate TanStack queries matching this contract
  if (queryClient) {
    queryClient.invalidateQueries({
      predicate: (query) => {
        const queryKey = query.queryKey;
        if (!Array.isArray(queryKey)) return false;
        // Matches ['fi-wallet-state-by-contract', net, addrStr]
        // or ['fi-wallet-state', owner] if key includes addrStr
        return queryKey.some(
          (k) =>
            typeof k === 'string' && k.toLowerCase() === addrStr.toLowerCase(),
        );
      },
    });
  }
}

export function createRefetchWrapper<T>(
  cacheKey: string,
  refetchFn: () => Promise<T>,
) {
  return async () => {
    markForceFresh(cacheKey);
    return await refetchFn();
  };
}

export async function cachedQueryFn<T>(
  cacheKey: string,
  fetcher: (options?: { forceFresh?: boolean }) => Promise<T>,
  forceFresh = false,
): Promise<T> {
  const online = isOnline();

  // If offline, never hit network; read strictly from IndexedDB
  if (!online) {
    const cached = await getContractCache<T>(cacheKey);
    if (cached && cached.data !== null && cached.data !== undefined) {
      return cached.data;
    }
    // Graceful fallback for uncached data when offline
    return null as unknown as T;
  }

  const shouldForce =
    forceFresh || forceFreshAll || forceFreshKeys.has(cacheKey);

  if (forceFreshKeys.has(cacheKey)) {
    forceFreshKeys.delete(cacheKey);
  }

  // If not forcing fresh data, serve from IndexedDB indefinitely
  if (!shouldForce) {
    const cached = await getContractCache<T>(cacheKey);
    if (cached && cached.data !== null && cached.data !== undefined) {
      return cached.data;
    }
  }

  // Otherwise fetch from network
  try {
    const data = await fetcher({ forceFresh: shouldForce });
    // Save to IndexedDB with updated timestamp
    await setContractCache(cacheKey, data);
    return data;
  } catch (err) {
    // Attempt fallback from IndexedDB cache on network error
    const cached = await getContractCache<T>(cacheKey);
    if (cached && cached.data !== null && cached.data !== undefined) {
      console.log(`[ContractCache] Serving cached fallback for ${cacheKey}`);
      return cached.data;
    }
    if (!isOnline()) {
      return null as unknown as T;
    }
    throw err;
  }
}

export function useJettonMaster(enabled = true) {
  const cacheKey = 'jetton-master';
  const query = useQuery<JettonMasterInfo>({
    queryKey: ['jetton-master'],
    queryFn: () => cachedQueryFn(cacheKey, fetchJettonMaster),
    enabled,
  });
  return {
    ...query,
    refetch: createRefetchWrapper(cacheKey, query.refetch),
  };
}

export function useFiMinterState(enabled = true) {
  const cacheKey = 'fi-minter-state';
  const query = useQuery({
    queryKey: ['fi-minter-state'],
    queryFn: () => cachedQueryFn(cacheKey, getFiMinterState),
    enabled,
  });
  return {
    ...query,
    refetch: createRefetchWrapper(cacheKey, query.refetch),
  };
}

export function useFiTotalAccounts(enabled = true) {
  const cacheKey = 'fi-total-accounts';
  const query = useQuery({
    queryKey: ['fi-total-accounts'],
    queryFn: () => cachedQueryFn(cacheKey, getFiMinterTotalAccounts),
    enabled,
  });
  return {
    ...query,
    refetch: createRefetchWrapper(cacheKey, query.refetch),
  };
}

export function useFiWalletState(ownerAddress: Address | null) {
  const key = ownerAddress?.toString() ?? 'none';
  const cacheKey = `fi-wallet-state:${key}`;
  const query = useQuery({
    queryKey: ['fi-wallet-state', key],
    queryFn: () =>
      cachedQueryFn(cacheKey, (opts) => getFiWalletState(ownerAddress!, opts)),
    enabled: !!ownerAddress,
  });
  return {
    ...query,
    refetch: createRefetchWrapper(cacheKey, query.refetch),
  };
}

export function useFiWalletStateByContract(
  contractAddress: Address | null,
  net?: Network,
) {
  const key = contractAddress?.toString() ?? 'none';
  const cacheKey = `fi-wallet-state-by-contract:${net ?? 'default'}:${key}`;
  const query = useQuery({
    queryKey: ['fi-wallet-state-by-contract', net ?? 'default', key],
    queryFn: () =>
      cachedQueryFn(cacheKey, () =>
        getFiWalletStateByContractAddress(contractAddress!, net),
      ),
    enabled: !!contractAddress,
  });
  return {
    ...query,
    refetch: createRefetchWrapper(cacheKey, query.refetch),
  };
}

export function useWalletBalance(ownerAddress: Address | null) {
  const key = ownerAddress?.toString() ?? 'none';
  const cacheKey = `wallet-balance:${key}`;
  const query = useQuery({
    queryKey: ['wallet-balance', key],
    queryFn: () =>
      cachedQueryFn(cacheKey, () => fetchWalletBalance(ownerAddress!)),
    enabled: !!ownerAddress,
  });
  return {
    ...query,
    refetch: createRefetchWrapper(cacheKey, query.refetch),
  };
}

export function useCircle(invitedList: Address[] | null) {
  const key =
    invitedList && invitedList.length > 0
      ? invitedList
          .map((a) => a.toString())
          .sort()
          .join(',')
      : 'none';
  const cacheKey = `circle:${key}`;
  const query = useQuery({
    queryKey: ['circle', key],
    queryFn: () => cachedQueryFn(cacheKey, () => getCircle(invitedList!)),
    enabled: !!invitedList && invitedList.length > 0,
  });
  return {
    ...query,
    refetch: createRefetchWrapper(cacheKey, query.refetch),
  };
}

export function usePersonalMinterForIssuer(ownerAddress: Address | null) {
  const key = ownerAddress?.toString() ?? 'none';
  const cacheKey = `fi-wallet-state:${key}`;
  const query = useQuery({
    queryKey: ['fi-wallet-state', key],
    queryFn: () =>
      cachedQueryFn(cacheKey, () => getFiWalletState(ownerAddress!)),
    enabled: !!ownerAddress,
    select: (state) => {
      const minter =
        state?.addresses?.ref?.trustedJettonAddrs?.ref?.personalJettonMinter;
      return minter && !isZeroAddress(minter) ? minter : null;
    },
  });
  return {
    ...query,
    refetch: createRefetchWrapper(cacheKey, query.refetch),
  };
}

export function usePersonalWalletForIssuer(ownerAddress: Address | null) {
  const key = ownerAddress?.toString() ?? 'none';
  const cacheKey = `fi-wallet-state:${key}`;
  const query = useQuery({
    queryKey: ['fi-wallet-state', key],
    queryFn: () =>
      cachedQueryFn(cacheKey, () => getFiWalletState(ownerAddress!)),
    enabled: !!ownerAddress,
    select: (state) => {
      const wallet =
        state?.addresses?.ref?.trustedJettonAddrs?.ref?.personalJettonWallet;
      return wallet && !isZeroAddress(wallet) ? wallet : null;
    },
  });
  return {
    ...query,
    refetch: createRefetchWrapper(cacheKey, query.refetch),
  };
}

export function usePersonalWalletAddress(
  personalMinter: Address | null,
  ownerAddress: Address | null,
  enabled = true,
) {
  const key = `${personalMinter?.toString() ?? 'none'}:${ownerAddress?.toString() ?? 'none'}`;
  const cacheKey = `personal-wallet-address:${key}`;
  const query = useQuery({
    queryKey: ['personal-wallet-address', key],
    queryFn: () =>
      cachedQueryFn(cacheKey, () =>
        getPersonalWalletAddress(personalMinter!, ownerAddress!),
      ),
    enabled: enabled && !!personalMinter && !!ownerAddress,
  });
  return {
    ...query,
    refetch: createRefetchWrapper(cacheKey, query.refetch),
  };
}

export function usePersonalWalletBalance(
  personalMinter: Address | null,
  ownerAddress: Address | null,
  enabled = true,
) {
  const key = `${personalMinter?.toString() ?? 'none'}:${ownerAddress?.toString() ?? 'none'}`;
  const cacheKey = `personal-wallet-balance:${key}`;
  const query = useQuery({
    queryKey: ['personal-wallet-balance', key],
    queryFn: () =>
      cachedQueryFn(cacheKey, () =>
        getPersonalWalletBalance(personalMinter!, ownerAddress!),
      ),
    enabled: enabled && !!personalMinter && !!ownerAddress,
  });
  return {
    ...query,
    refetch: createRefetchWrapper(cacheKey, query.refetch),
  };
}

export function usePersonalMinterDetails(
  personalMinter: Address | null,
  enabled = true,
) {
  const key = personalMinter?.toString() ?? 'none';
  const cacheKey = `personal-minter-details:${key}`;
  const query = useQuery<PersonalMinterDetails | null>({
    queryKey: ['personal-minter-details', key],
    queryFn: () =>
      cachedQueryFn(cacheKey, () => getPersonalMinterDetails(personalMinter!)),
    enabled: enabled && !!personalMinter,
  });
  return {
    ...query,
    refetch: createRefetchWrapper(cacheKey, query.refetch),
  };
}

export function useIsContractDeployed(address: Address | null, enabled = true) {
  const key =
    address?.toString({ testOnly: network == 'mainnet' ? false : true }) ??
    'none';
  return useQuery<boolean>({
    queryKey: ['contract-deployed', key],
    queryFn: () => (address ? checkIsContractDeployed(address) : false),
    enabled: enabled && !!address,
  });
}

export function useRefreshContractQueries() {
  const queryClient = useQueryClient();
  return async (keys?: string[]) => {
    if (!isOnline()) {
      return;
    }
    if (keys && keys.length > 0) {
      keys.forEach((k) => forceFreshKeys.add(k));
    } else {
      forceFreshAll = true;
    }
    try {
      await queryClient.refetchQueries({
        type: 'active',
      });
    } finally {
      forceFreshAll = false;
      forceFreshKeys.clear();
    }
  };
}
