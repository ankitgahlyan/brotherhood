/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { Jetton } from '@ton/walletkit';

import { tokenImageUrls, normalizeAddress } from '@/core/utils';
import { FI_ADDRESS } from '@/lib/brotherhood/config';

export const isFiJetton = (
  jetton:
    | { address?: string; symbol?: string; info?: { symbol?: string } }
    | undefined
    | null,
): boolean => {
  if (!jetton) return false;
  const sym = jetton.symbol || jetton.info?.symbol;
  if (sym && sym.toUpperCase() === 'FI') return true;
  if (jetton.address) {
    if (jetton.address === FI_ADDRESS) return true;
    const norm = normalizeAddress(jetton.address);
    if (norm && norm === normalizeAddress(FI_ADDRESS)) return true;
  }
  return false;
};

export const getJettonsSymbol = (jetton: Jetton): string | undefined => {
  if (!jetton?.info?.symbol) {
    return;
  }

  return jetton.info.symbol;
};

export const getJettonsName = (jetton: Jetton): string | undefined => {
  if (!jetton?.info?.name && !jetton?.info?.symbol) {
    return;
  }

  return jetton.info?.name || jetton.info?.symbol || '';
};

export const getJettonsImage = (jetton: Jetton): string | undefined => {
  if (!jetton?.info?.image) {
    return;
  }

  const img = jetton.info.image;
  return (
    tokenImageUrls(img)[0] ||
    (img.data ? `data:image/png;base64,${img.data}` : undefined) ||
    ''
  );
};

export const getFormattedJettonInfo =
  (formatJettonAmount: (balance: string, decimals: number) => string) =>
  (jetton: Jetton) => {
    const jettonName = getJettonsName(jetton);
    const jettonSymbol = getJettonsSymbol(jetton);
    const jettonImage = getJettonsImage(jetton);
    const jettonBalance = jetton.balance || '0';
    const jettonDecimals = jetton.decimalsNumber;
    const formattedBalance = jettonDecimals
      ? formatJettonAmount(jettonBalance, jettonDecimals)
      : '0';

    return {
      address: jetton.address,
      walletAddress: jetton.walletAddress,
      description: jetton.info?.description,
      name: jettonName,
      symbol: jettonSymbol,
      image: jettonImage,
      balance: formattedBalance,
      decimals: jettonDecimals,
    };
  };
