/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useMemo, useEffect } from 'react';
import { Address } from '@ton/core';
import type { LotteryStorage } from '@wrappers/Lottery.gen';
import { network } from '@/lib/brotherhood/config';
import { useNowSeconds } from '@/core/hooks';
import {
  useContractState,
  getContractCache,
  getNormalizedContractCacheKey,
} from '@/lib/brotherhood/contract-cache';
import { batchHydrateUniversal } from '@/lib/brotherhood/account-state-hydrator';

export interface UseLotteryStateResult {
  participantCount: number | null;
  prizePool: bigint | null;
  currentPhase: number | null;
  deadline: number | null;
  isParticipant: boolean;
  isLoading: boolean;
  refetch: () => void;
}

export function useLotteryState(
  lotteryAddressString: string | null,
  userAddressString: string | null,
): UseLotteryStateResult {
  const cleanAddr = lotteryAddressString?.trim() || null;

  // Auto-hydrate on valid address input only if not yet cached
  useEffect(() => {
    if (!cleanAddr) return;
    let isCancelled = false;
    getContractCache(getNormalizedContractCacheKey(network, cleanAddr)).then(
      (cached) => {
        if (isCancelled || cached?.data) return;
        try {
          const targetAddr = Address.parse(cleanAddr);
          batchHydrateUniversal([targetAddr], network, {
            knownTypes: { [targetAddr.toString()]: 'lottery' },
          }).catch((err) => {
            console.warn('[useLotteryState] Auto-hydration error:', err);
          });
        } catch {
          /* ignore */
        }
      },
    );
    return () => {
      isCancelled = true;
    };
  }, [cleanAddr]);

  const { data: store, isLoading } = useContractState<LotteryStorage>(
    cleanAddr,
    network,
  );

  const now = useNowSeconds();

  const result = useMemo(() => {
    if (!store) {
      return {
        participantCount: null,
        prizePool: null,
        currentPhase: null,
        deadline: null,
        isParticipant: false,
      };
    }

    let isParticipant = false;
    if (userAddressString && store.participants) {
      try {
        const uAddr = Address.parse(userAddressString.trim());
        if (typeof store.participants.has === 'function') {
          isParticipant = store.participants.has(uAddr);
        } else if (typeof store.participants.get === 'function') {
          isParticipant = store.participants.get(uAddr) !== undefined;
        }
      } catch {
        isParticipant = false;
      }
    }

    const deadlineNum = store.revealDeadline ? Number(store.revealDeadline) : 0;
    const phase = deadlineNum > 0 && now > deadlineNum ? 1 : 0;

    return {
      participantCount:
        store.participantCount !== undefined
          ? Number(store.participantCount)
          : null,
      prizePool: store.prizePool ?? null,
      currentPhase: phase,
      deadline: deadlineNum || null,
      isParticipant,
    };
  }, [store, userAddressString, now]);

  return {
    ...result,
    isLoading: isLoading && Boolean(cleanAddr),
    refetch: () => {
      if (cleanAddr) {
        batchHydrateUniversal([cleanAddr], network, {
          knownTypes: { [cleanAddr]: 'lottery' },
        }).catch(() => {});
      }
    },
  };
}
