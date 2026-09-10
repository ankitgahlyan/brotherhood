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

export function calculateLocationAddress(
  h3Cell: string,
  minterAddress: Address = Address.parse(FI_ADDRESS),
): Address {
  const { Location } = require('@wrappers/Location.gen');
  const { Dictionary } = require('@ton/core');
  const loc = Location.fromStorage(
    {
      h3Cell,
      minterAddress,
      memberCount: 0n,
      members: Dictionary.empty(
        Dictionary.Keys.Address(),
        Dictionary.Values.Bool(),
      ),
      version: 0n,
    },
    {
      toShard: { fixedPrefixLength: 8, closeTo: minterAddress },
    },
  );
  return loc.address;
}

export function getH3ViewerUrl(h3Cell?: string | null): string {
  const clean = h3Cell?.trim();
  if (!clean) {
    return 'https://ankitgahlyan.github.io/h3-viewer/?lockRes=1&layer=satellite';
  }
  return `https://ankitgahlyan.github.io/h3-viewer/?h3=${encodeURIComponent(clean)}&lockRes=1&layer=satellite`;
}

export interface LocationCellDetails {
  h3Cell: string;
  contractAddress: string;
  memberCount: number;
  version: number | null;
  minterAddress: string | null;
  members: string[];
  isDeployed: boolean;
}

export function useLocationByH3Cell(
  h3Cell?: string | null,
  minterAddressStr?: string | null,
  net: Network = DEFAULT_NETWORK,
) {
  const cleanCell = h3Cell?.trim() ?? '';
  let calculatedAddress: string | null = null;
  if (cleanCell) {
    try {
      const minter = minterAddressStr ? Address.parse(minterAddressStr) : Address.parse(FI_ADDRESS);
      calculatedAddress = calculateLocationAddress(cleanCell, minter).toString();
    } catch {
      calculatedAddress = null;
    }
  }

  const query = useContractQuery({
    queryKey: ['location-h3-details', cleanCell, calculatedAddress, net],
    enabled: Boolean(cleanCell && calculatedAddress),
    queryFn: async (): Promise<LocationCellDetails | null> => {
      if (!cleanCell || !calculatedAddress) return null;
      const { Location } = require('@wrappers/Location.gen');
      const { getTonClient } = require('./ton');
      const locAddr = Address.parse(calculatedAddress);
      const client = getTonClient(net);
      const contract = client.open(Location.fromAddress(locAddr));

      try {
        const [queriedH3Cell, memberCount, version, minterAddr, membersDict] = await Promise.all([
          contract.getH3Cell().catch(() => null),
          contract.getMemberCount().catch(() => null),
          contract.getVersion().catch(() => null),
          contract.getMinterAddress().catch(() => null),
          contract.getMembers().catch(() => null),
        ]);

        const isDeployed = queriedH3Cell !== null || memberCount !== null;
        const memberAddrs: string[] = [];
        if (membersDict) {
          try {
            for (const k of membersDict.keys()) {
              memberAddrs.push(k.toString());
            }
          } catch {
            /* ignore dict parse */
          }
        }

        return {
          h3Cell: queriedH3Cell ?? cleanCell,
          contractAddress: calculatedAddress,
          memberCount: memberCount !== null ? Number(memberCount) : 0,
          version: version !== null ? Number(version) : null,
          minterAddress: minterAddr ? minterAddr.toString() : null,
          members: memberAddrs,
          isDeployed,
        };
      } catch {
        return {
          h3Cell: cleanCell,
          contractAddress: calculatedAddress,
          memberCount: 0,
          version: null,
          minterAddress: null,
          members: [],
          isDeployed: false,
        };
      }
    },
    network: net,
    staleTime: 30_000,
  });

  return {
    ...query,
    calculatedAddress,
  };
}

export function useLocation(
  locationAddressStr?: string | null,
  net: Network = DEFAULT_NETWORK,
) {
  const enabled = Boolean(locationAddressStr);

  return useContractQuery({
    queryKey: ['location-info', locationAddressStr, net],
    enabled,
    queryFn: async () => {
      if (!locationAddressStr) return null;
      const { Location } = require('@wrappers/Location.gen');
      const { getTonClient } = require('./ton');
      const locAddr = Address.parse(locationAddressStr);
      const client = getTonClient(net);
      const contract = client.open(Location.fromAddress(locAddr));

      try {
        const [h3Cell, memberCount, version, minterAddress, dict] = await Promise.all([
          contract.getH3Cell().catch(() => null),
          contract.getMemberCount().catch(() => null),
          contract.getVersion().catch(() => null),
          contract.getMinterAddress().catch(() => null),
          contract.getMembers().catch(() => null),
        ]);

        const memberAddrs: string[] = [];
        if (dict) {
          try {
            for (const key of dict.keys()) {
              memberAddrs.push(key.toString());
            }
          } catch {
            /* ignore dict parse */
          }
        }

        const isDeployed = h3Cell !== null || memberCount !== null;
        return {
          h3Cell,
          memberCount: memberCount !== null ? Number(memberCount) : null,
          version: version !== null ? Number(version) : null,
          minterAddress: minterAddress ? minterAddress.toString() : null,
          members: memberAddrs,
          isDeployed,
        };
      } catch {
        return null;
      }
    },
    network: net,
    staleTime: 30_000,
  });
}

export function useLocationMembers(
  locationAddressStr?: string | null,
  targetMemberAddressStr?: string | null,
  net: Network = DEFAULT_NETWORK,
) {
  const enabled = Boolean(locationAddressStr);

  return useContractQuery({
    queryKey: ['location-members', locationAddressStr, targetMemberAddressStr, net],
    enabled,
    queryFn: async () => {
      if (!locationAddressStr) return null;
      const { Location } = require('@wrappers/Location.gen');
      const { getTonClient } = require('./ton');
      const locAddr = Address.parse(locationAddressStr);
      const client = getTonClient(net);
      const contract = client.open(Location.fromAddress(locAddr));

      const [h3Cell, dict] = await Promise.all([
        contract.getH3Cell().catch(() => null),
        contract.getMembers().catch(() => null),
      ]);

      let isTargetMember: boolean | null = null;
      if (targetMemberAddressStr) {
        try {
          const target = Address.parse(targetMemberAddressStr);
          isTargetMember = await contract.getIsMember(target);
        } catch {
          isTargetMember = false;
        }
      }

      const memberAddrs: string[] = [];
      if (dict) {
        for (const key of dict.keys()) {
          memberAddrs.push(key.toString());
        }
      }

      return {
        h3Cell,
        members: memberAddrs,
        isTargetMember,
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
  invalidateContractQuery('location-h3-details');
  invalidateContractQuery('location-info');
  invalidateContractQuery('location-members');
}
