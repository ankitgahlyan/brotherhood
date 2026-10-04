/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useMemo } from 'react';
import { Address } from '@ton/core';
import { useFiWalletState } from '@/lib/brotherhood/queries';
import { useFormatAddress } from '@/core/utils/formatters';
import {
  useContactBookStore,
  EMPTY_CONTACTS_MAP,
} from '@/core/storage/useContactBookStore';
import { useDnsStore } from '@/features/dns/store/dns-store';
import {
  projectFiAccountData,
  type VotedCandidateEntry,
  type InvitedMemberEntry,
  type AllowanceEntry,
  type FiAccountData,
} from '@/lib/brotherhood/domain/fi-account-projector';

export type {
  VotedCandidateEntry,
  InvitedMemberEntry,
  AllowanceEntry,
  FiAccountData,
};

export interface UseFiAccountResult {
  data: FiAccountData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useFiAccount(walletAddress: string | null): UseFiAccountResult {
  const { network } = useFormatAddress();
  const net = network === 'mainnet' ? 'mainnet' : 'testnet';
  const contactsForNet = useContactBookStore(
    (s) => s.contactsByNetwork[net] || EMPTY_CONTACTS_MAP,
  );
  const domainsForNet = useDnsStore((s) => s.domainsByNetwork[net]);

  const ownerAddress = useMemo(() => {
    if (!walletAddress) return null;
    try {
      return Address.parse(walletAddress);
    } catch {
      return null;
    }
  }, [walletAddress]);

  const {
    data: rawData,
    isLoading,
    error,
    refetch,
  } = useFiWalletState(ownerAddress);

  const formattedData = useMemo<FiAccountData | null>(() => {
    try {
      return projectFiAccountData(rawData, {
        network,
        contactsForNet,
        domainsForNet,
        candidateAddresses: [walletAddress],
      });
    } catch (e) {
      console.error('[useFiAccount] Error projecting FiWallet store:', e);
      return null;
    }
  }, [rawData, network, walletAddress, contactsForNet, domainsForNet]);

  return {
    data: formattedData,
    isLoading,
    error: (error as Error | null) ?? null,
    refetch,
  };
}
