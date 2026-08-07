import { useQuery, useQueryClient } from '@tanstack/react-query';
import { type Address } from '@ton/core';
import {
  fetchJettonMaster,
  fetchWalletBalance,
  getCircle,
  getFiWalletState,
  getPersonalMinterForIssuer,
  getPersonalWalletAddress,
  getPersonalWalletBalance,
  type JettonMasterInfo,
} from './ton';
import { setContractCache, getContractCache } from './contract-cache';

const CACHE_MAX_AGE_MS = 10 * 60 * 1000; // 10 minutes cache validity

async function cachedQueryFn<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  forceFresh = false,
): Promise<T> {
  if (!forceFresh) {
    const cached = await getContractCache<T>(cacheKey);
    if (
      cached &&
      cached.data !== null &&
      cached.data !== undefined &&
      Date.now() - cached.timestamp < CACHE_MAX_AGE_MS
    ) {
      return cached.data;
    }
  }

  try {
    const data = await fetcher();
    // Asynchronously save to IndexedDB
    setContractCache(cacheKey, data).catch(() => {});
    return data;
  } catch (err) {
    // Attempt fallback from IndexedDB cache even if older
    const cached = await getContractCache<T>(cacheKey);
    if (cached && cached.data !== null && cached.data !== undefined) {
      console.log(`[ContractCache] Serving cached fallback for ${cacheKey}`);
      return cached.data;
    }
    throw err;
  }
}

export function useJettonMaster(enabled = true) {
  return useQuery<JettonMasterInfo>({
    queryKey: ['jetton-master'],
    queryFn: () => cachedQueryFn('jetton-master', fetchJettonMaster),
    enabled,
  });
}

export function useFiWalletState(ownerAddress: Address | null) {
  const key = ownerAddress?.toString() ?? 'none';
  return useQuery({
    queryKey: ['fi-wallet-state', key],
    queryFn: () =>
      cachedQueryFn(`fi-wallet-state:${key}`, () =>
        getFiWalletState(ownerAddress!),
      ),
    enabled: !!ownerAddress,
  });
}

export function useWalletBalance(ownerAddress: Address | null) {
  const key = ownerAddress?.toString() ?? 'none';
  return useQuery({
    queryKey: ['wallet-balance', key],
    queryFn: () =>
      cachedQueryFn(`wallet-balance:${key}`, () =>
        fetchWalletBalance(ownerAddress!),
      ),
    enabled: !!ownerAddress,
  });
}

export function useCircle(invitedList: Address[] | null) {
  const key =
    invitedList && invitedList.length > 0
      ? invitedList
          .map((a) => a.toString())
          .sort()
          .join(',')
      : 'none';
  return useQuery({
    queryKey: ['circle', key],
    queryFn: () =>
      cachedQueryFn(`circle:${key}`, () => getCircle(invitedList!)),
    enabled: !!invitedList && invitedList.length > 0,
  });
}

export function usePersonalMinterForIssuer(ownerAddress: Address | null) {
  const key = ownerAddress?.toString() ?? 'none';
  return useQuery({
    queryKey: ['personal-minter', key],
    queryFn: () =>
      cachedQueryFn(`personal-minter:${key}`, () =>
        getPersonalMinterForIssuer(ownerAddress!),
      ),
    enabled: !!ownerAddress,
  });
}

export function usePersonalWalletAddress(
  personalMinter: Address | null,
  ownerAddress: Address | null,
) {
  const key = `${personalMinter?.toString() ?? 'none'}:${ownerAddress?.toString() ?? 'none'}`;
  return useQuery({
    queryKey: ['personal-wallet-address', key],
    queryFn: () =>
      cachedQueryFn(`personal-wallet-address:${key}`, () =>
        getPersonalWalletAddress(personalMinter!, ownerAddress!),
      ),
    enabled: !!personalMinter && !!ownerAddress,
  });
}

export function usePersonalWalletBalance(
  personalMinter: Address | null,
  ownerAddress: Address | null,
) {
  const key = `${personalMinter?.toString() ?? 'none'}:${ownerAddress?.toString() ?? 'none'}`;
  return useQuery({
    queryKey: ['personal-wallet-balance', key],
    queryFn: () =>
      cachedQueryFn(`personal-wallet-balance:${key}`, () =>
        getPersonalWalletBalance(personalMinter!, ownerAddress!),
      ),
    enabled: !!personalMinter && !!ownerAddress,
  });
}

export function useRefreshContractQueries() {
  const queryClient = useQueryClient();
  return async () => {
    await queryClient.refetchQueries({
      type: 'active',
    });
  };
}
