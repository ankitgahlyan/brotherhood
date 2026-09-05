/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Address } from '@ton/core';
import { useJettons, useRates, useWallet } from '@demo/wallet-core';

import type { AssetRowData } from '../components/asset-row';

import {
  getJettonsName,
  getJettonsSymbol,
  isFiJetton,
} from '@/features/jettons';
import { useIsNetworkMember } from '@/features/brotherhood';
import { usePersonalJettonInfo } from '@/features/personal-jetton';
import { isPersonalMinterContract } from '@/lib/brotherhood/ton';
import { useTrackedPersonalTokens } from './use-tracked-personal-tokens';
import {
  assetUrl,
  findRate,
  formatRate,
  normalizeAddress,
  toDecimal,
  tokenImageUrls,
} from '@/core/utils';

const GRAM_DECIMALS = 9;

/** Candidate icon URLs (best-first), appending the inline base64 image as a last resort. */
export const imageSources = (
  urls: string[] | undefined,
  dataBase64?: string,
): string[] => [
  ...(urls ?? []),
  ...(dataBase64 ? [`data:image/png;base64,${dataBase64}`] : []),
];

interface AssetRows {
  tonRow: AssetRowData | null;
  /** All held jettons as rows, sorted by fiat value desc (verified first as a tiebreaker). */
  jettonRows: AssetRowData[];
  assetsReady: boolean;
}

/** Builds the TON row + a row per held jetton. Shared by the dashboard preview and the full assets page. */
export const useAssetRows = (): AssetRows => {
  const { balance, currentWallet, address, getActiveWallet } = useWallet();
  const walletAddress = address || currentWallet?.address || getActiveWallet()?.address;
  const { userJettons, lastJettonsUpdate } = useJettons();
  const { entries: rates, lastUpdated: ratesUpdated } = useRates();
  const { isMember } = useIsNetworkMember();
  const { personalMinterAddress } = usePersonalJettonInfo(
    walletAddress ?? null,
  );

  const assetsReady =
    balance !== undefined && lastJettonsUpdate > 0 && ratesUpdated > 0;

  // Other jetton addresses (not FI and not user's own personal minter)
  const candidatePersonalAddresses = useMemo(() => {
    return userJettons
      .filter((j) => {
        if (isFiJetton(j)) return false;
        if (
          personalMinterAddress &&
          normalizeAddress(j.address) ===
            normalizeAddress(personalMinterAddress)
        ) {
          return false;
        }
        return true;
      })
      .map((j) => j.address);
  }, [userJettons, personalMinterAddress]);

  const { data: verifiedPersonalMinterSet } = useQuery({
    queryKey: [
      'verified-personal-minters',
      [...candidatePersonalAddresses].sort().join(','),
    ],
    queryFn: async () => {
      const set = new Set<string>();
      await Promise.all(
        candidatePersonalAddresses.map(async (addr) => {
          try {
            const isPersonal = await isPersonalMinterContract(
              Address.parse(addr),
            );
            if (isPersonal) set.add(addr);
          } catch {
            // ignore non-contracts
          }
        }),
      );
      return set;
    },
    enabled: candidatePersonalAddresses.length > 0,
    staleTime: Infinity,
  });

  const tonRow = useMemo<AssetRowData | null>(() => {
    if (!assetsReady) return null;
    const rateEntry = rates['GRAM'];
    const amount = toDecimal(balance, GRAM_DECIMALS);
    return {
      id: 'TON',
      icon: assetUrl('gram.svg'),
      fallbackText: 'GR',
      name: 'Gram',
      symbol: 'GRAM',
      amount,
      rateLabel: rateEntry ? formatRate(rateEntry.rate) : undefined,
      fiat: rateEntry ? amount * rateEntry.rate : undefined,
    };
  }, [assetsReady, balance, rates]);

  const { personalTokens } = useTrackedPersonalTokens();

  const jettonRows = useMemo<AssetRowData[]>(() => {
    if (!assetsReady) return [];

    const rows: AssetRowData[] = [];
    const seenAddresses = new Set<string>();

    // 1. Process userJettons (FI + any personal tokens indexed by walletkit)
    for (const jetton of userJettons) {
      const isFi = isFiJetton(jetton);
      const isUserPersonal = Boolean(
        personalMinterAddress &&
          normalizeAddress(jetton.address) ===
            normalizeAddress(personalMinterAddress),
      );
      const isVerifiedPersonal = Boolean(
        verifiedPersonalMinterSet?.has(jetton.address),
      );

      // Only include FI (if member) or verified Personal Tokens
      if (isFi ? !isMember : !isUserPersonal && !isVerifiedPersonal) {
        continue;
      }

      const normAddr = normalizeAddress(jetton.address) || jetton.address;
      seenAddresses.add(normAddr);

      const rateEntry = findRate(rates, jetton.address);
      const decimals = jetton.decimalsNumber ?? 9;
      const amount = toDecimal(jetton.balance, decimals);
      const symbol = getJettonsSymbol(jetton) ?? '';

      // Per user rule: only show tokens if balance > 0 (FI is shown if member)
      if (!isFi && amount <= 0) continue;

      rows.push({
        id: jetton.address,
        icon: imageSources(
          tokenImageUrls(jetton.info?.image),
          jetton.info?.image?.data,
        ),
        fallbackText: symbol.slice(0, 2).toUpperCase() || '??',
        name: getJettonsName(jetton) ?? symbol,
        symbol,
        amount,
        rateLabel: rateEntry ? formatRate(rateEntry.rate) : undefined,
        fiat: rateEntry ? amount * rateEntry.rate : undefined,
      });
    }

    // 2. Process personalTokens (discovered on-chain and manually tracked where balance > 0)
    for (const pt of personalTokens) {
      const normAddr = normalizeAddress(pt.minterAddress) || pt.minterAddress;
      if (seenAddresses.has(normAddr)) continue;
      seenAddresses.add(normAddr);

      const amount = toDecimal(pt.balance, 9);
      if (amount <= 0) continue;

      const symbol = pt.symbol || 'PT';
      rows.push({
        id: pt.minterAddress,
        icon: pt.image ? imageSources([pt.image]) : undefined,
        fallbackText: symbol.slice(0, 2).toUpperCase() || 'PT',
        name: pt.name || 'Personal Token',
        symbol,
        amount,
      });
    }

    return rows.sort((a, b) => {
      const aIsFi = isFiJetton({ address: a.id, symbol: a.symbol });
      const bIsFi = isFiJetton({ address: b.id, symbol: b.symbol });
      if (aIsFi && !bIsFi) return -1;
      if (!aIsFi && bIsFi) return 1;
      return (b.fiat ?? 0) - (a.fiat ?? 0) || b.amount - a.amount;
    });
  }, [
    assetsReady,
    userJettons,
    rates,
    isMember,
    personalMinterAddress,
    verifiedPersonalMinterSet,
    personalTokens,
  ]);

  return { tonRow, jettonRows, assetsReady };
};
