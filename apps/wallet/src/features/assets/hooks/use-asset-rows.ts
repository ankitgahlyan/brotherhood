/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useMemo } from 'react';
import { useJettons, useRates, useWallet } from '@demo/wallet-core';

import type { AssetRowData } from '../components/asset-row';

import {
  getJettonsName,
  getJettonsSymbol,
  isFiJetton,
} from '@/features/jettons';
import { useIsNetworkMember } from '@/features/brotherhood';
import {
  assetUrl,
  findRate,
  formatRate,
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
  const { balance } = useWallet();
  const { userJettons, lastJettonsUpdate } = useJettons();
  const { entries: rates, lastUpdated: ratesUpdated } = useRates();
  const { isMember } = useIsNetworkMember();

  const assetsReady =
    balance !== undefined && lastJettonsUpdate > 0 && ratesUpdated > 0;

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

  const jettonRows = useMemo<AssetRowData[]>(() => {
    if (!assetsReady) return [];
    return userJettons
      .filter((jetton) => (isMember ? true : !isFiJetton(jetton)))
      .map((jetton) => {
        const rateEntry = findRate(rates, jetton.address);
        const decimals = jetton.decimalsNumber ?? 9;
        const amount = toDecimal(jetton.balance, decimals);
        const symbol = getJettonsSymbol(jetton) ?? '';
        const isFi = isFiJetton(jetton);
        return {
          row: {
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
          } satisfies AssetRowData,
          isFi,
          isVerified: jetton.isVerified,
        };
      })
      .sort(
        (a, b) =>
          Number(b.isFi) - Number(a.isFi) ||
          (b.row.fiat ?? 0) - (a.row.fiat ?? 0) ||
          Number(b.isVerified) - Number(a.isVerified),
      )
      .map((entry) => entry.row);
  }, [assetsReady, userJettons, rates, isMember]);

  return { tonRow, jettonRows, assetsReady };
};
