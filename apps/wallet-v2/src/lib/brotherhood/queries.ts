import { Address } from '@ton/core';
import { useContractQuery, invalidateContractQuery } from './useContractQuery';
import { getFiWalletState, getFiMinterState, getFiWalletAddress, checkIsContractDeployed } from './ton';
import { FI_ADDRESS, DEFAULT_NETWORK, type Network } from './config';

export function useFiWallet(ownerAddressStr?: string | null, net: Network = DEFAULT_NETWORK) {
  const enabled = Boolean(ownerAddressStr);

  return useContractQuery({
    queryKey: ['fi-wallet', ownerAddressStr, net],
    enabled,
    queryFn: async () => {
      if (!ownerAddressStr) return null;
      const owner = Address.parse(ownerAddressStr);
      return getFiWalletState(owner, net);
    },
    network: net,
    staleTime: 30_000,
  });
}

export function useFiMinter(net: Network = DEFAULT_NETWORK) {
  return useContractQuery({
    queryKey: ['fi-minter', FI_ADDRESS, net],
    queryFn: async () => {
      return getFiMinterState(net);
    },
    network: net,
    staleTime: 60_000,
  });
}

export function invalidateFiState(ownerAddressStr?: string) {
  invalidateContractQuery('fi-wallet');
  invalidateContractQuery('fi-minter');
}
