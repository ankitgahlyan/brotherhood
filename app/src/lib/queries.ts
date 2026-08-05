import { useQuery } from '@tanstack/react-query';
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

export function useJettonMaster(enabled = true) {
  return useQuery<JettonMasterInfo>({
    queryKey: ['jetton-master'],
    queryFn: fetchJettonMaster,
    enabled,
  });
}

export function useFiWalletState(ownerAddress: Address | null) {
  return useQuery({
    queryKey: ['fi-wallet-state', ownerAddress?.toString() ?? 'none'],
    queryFn: () => getFiWalletState(ownerAddress!),
    enabled: !!ownerAddress,
  });
}

export function useWalletBalance(ownerAddress: Address | null) {
  return useQuery({
    queryKey: ['wallet-balance', ownerAddress?.toString() ?? 'none'],
    queryFn: () => fetchWalletBalance(ownerAddress!),
    enabled: !!ownerAddress,
  });
}

export function useCircle(invitedList: Address[] | null) {
  return useQuery({
    queryKey: ['circle', invitedList?.map((a) => a.toString()).join(',') ?? 'none'],
    queryFn: () => getCircle(invitedList!),
    enabled: !!invitedList && invitedList.length > 0,
  });
}

export function usePersonalMinterForIssuer(ownerAddress: Address | null) {
  return useQuery({
    queryKey: ['personal-minter', ownerAddress?.toString() ?? 'none'],
    queryFn: () => getPersonalMinterForIssuer(ownerAddress!),
    enabled: !!ownerAddress,
  });
}

export function usePersonalWalletAddress(
  personalMinter: Address | null,
  ownerAddress: Address | null,
) {
  return useQuery({
    queryKey: [
      'personal-wallet-address',
      personalMinter?.toString() ?? 'none',
      ownerAddress?.toString() ?? 'none',
    ],
    queryFn: () => getPersonalWalletAddress(personalMinter!, ownerAddress!),
    enabled: !!personalMinter && !!ownerAddress,
  });
}

export function usePersonalWalletBalance(
  personalMinter: Address | null,
  ownerAddress: Address | null,
) {
  return useQuery({
    queryKey: [
      'personal-wallet-balance',
      personalMinter?.toString() ?? 'none',
      ownerAddress?.toString() ?? 'none',
    ],
    queryFn: () => getPersonalWalletBalance(personalMinter!, ownerAddress!),
    enabled: !!personalMinter && !!ownerAddress,
  });
}
