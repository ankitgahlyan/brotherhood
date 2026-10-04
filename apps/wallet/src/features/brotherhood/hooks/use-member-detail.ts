/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useMemo } from 'react';
import { Address } from '@ton/core';
import { useFiWalletStateByContract } from '@/lib/brotherhood/queries';
import { useFormatAddress } from '@/core/utils/formatters';
import {
  useContactBookStore,
  EMPTY_CONTACTS_MAP,
} from '@/core/storage/useContactBookStore';
import { useDnsStore } from '@/features/dns/store/dns-store';
import {
  projectMemberDetailData,
  type MemberDetailData,
} from '@/lib/brotherhood/domain/fi-account-projector';

export type { MemberDetailData };

export interface UseMemberDetailResult {
  data: MemberDetailData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useMemberDetail(
  addressInput: Address | string | null,
): UseMemberDetailResult {
  const { network } = useFormatAddress();
  const net = network === 'mainnet' ? 'mainnet' : 'testnet';
  const contactsForNet = useContactBookStore(
    (s) => s.contactsByNetwork[net] || EMPTY_CONTACTS_MAP,
  );
  const domainsForNet = useDnsStore((s) => s.domainsByNetwork[net]);

  const parsedAddress = useMemo(() => {
    if (!addressInput) return null;
    if (typeof addressInput === 'string') {
      try {
        return Address.parse(addressInput.trim());
      } catch {
        return null;
      }
    }
    return addressInput;
  }, [addressInput]);

  const {
    data: rawData,
    isLoading,
    error,
    refetch,
  } = useFiWalletStateByContract(parsedAddress, net);

  const formattedData = useMemo<MemberDetailData | null>(() => {
    try {
      return projectMemberDetailData(rawData, parsedAddress, {
        network,
        contactsForNet,
        domainsForNet,
      });
    } catch (e) {
      console.error('[useMemberDetail] Error projecting FiWallet store:', e);
      return null;
    }
  }, [rawData, parsedAddress, network, contactsForNet, domainsForNet]);

  return {
    data: formattedData,
    isLoading,
    error: (error as Error | null) ?? null,
    refetch,
  };
}
