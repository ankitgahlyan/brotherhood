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

export function usePersonalJetton(ownerAddressStr?: string | null, net: Network = DEFAULT_NETWORK) {
  const enabled = Boolean(ownerAddressStr);

  return useContractQuery({
    queryKey: ['personal-jetton', ownerAddressStr, net],
    enabled,
    queryFn: async () => {
      if (!ownerAddressStr) return null;
      const owner = Address.parse(ownerAddressStr);
      const fiWalletAddr = await getFiWalletAddress(owner, net);
      const { getDeterministicPersonalMinter, getExpectedPersonalWalletAddress } = require('./deploy');
      const { PersonalMinter } = require('@wrappers/Personal.gen');
      const { PersonalWallet } = require('@wrappers/PersonalWallet.gen');
      const { getTonClient } = require('./ton');

      const { contractAddress: deterministicMinter, stateInit } = getDeterministicPersonalMinter({
        issuerWallet: fiWalletAddr,
        adminAddress: owner,
      });

      const isMinterDeployed = await checkIsContractDeployed(deterministicMinter, net);

      let minterData = null;
      let walletBalance = 0n;
      let personalWalletAddr = null;

      if (isMinterDeployed) {
        const client = getTonClient(net);
        const minterContract = client.open(PersonalMinter.fromAddress(deterministicMinter));
        try {
          minterData = await minterContract.getJettonData();
          personalWalletAddr = await minterContract.getWalletAddress(owner);
          const walletContract = client.open(PersonalWallet.fromAddress(personalWalletAddr));
          const walletData = await walletContract.getWalletData();
          walletBalance = walletData.balance;
        } catch {
          // ignore if child wallet not deployed yet
        }
      } else {
        personalWalletAddr = getExpectedPersonalWalletAddress({
          personalMinter: deterministicMinter,
          owner,
        });
      }

      return {
        isDeployed: isMinterDeployed,
        minterAddress: deterministicMinter,
        stateInit,
        personalWalletAddress: personalWalletAddr,
        minterData,
        walletBalance,
      };
    },
    network: net,
    staleTime: 30_000,
  });
}

export function invalidateFiState(ownerAddressStr?: string) {
  invalidateContractQuery('fi-wallet');
  invalidateContractQuery('fi-minter');
  invalidateContractQuery('personal-jetton');
}
