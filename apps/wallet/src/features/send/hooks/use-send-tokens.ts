/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useMemo } from 'react';
import { useJettons, useRates, useWallet } from '@demo/wallet-core';

import type { TokenOption } from '../types';

import {
  getJettonsImage,
  getJettonsName,
  getJettonsSymbol,
  isFiJetton,
} from '@/features/jettons';
import { useIsNetworkMember } from '@/features/brotherhood';
import { assetUrl, findRate, toDecimal } from '@/core/utils';
import { FI_ADDRESS } from '@/lib/brotherhood/config';

const GRAM_DECIMALS = 9;
/** Kept aside on a MAX TON send so the transfer still has gas to pay for itself. */
const TON_GAS_RESERVE = 0.01;

/** Builds the selectable send assets: FI first for members, then TON, then other held jettons. */
export const useSendTokens = (): TokenOption[] => {
  const { balance } = useWallet();
  const { userJettons } = useJettons();
  const { entries: rates } = useRates();
  const { isMember } = useIsNetworkMember();

  return useMemo<TokenOption[]>(() => {
    const tonAmount = toDecimal(balance, GRAM_DECIMALS);
    const tonOption: TokenOption = {
      token: { type: 'TON' },
      id: 'TON',
      icon: assetUrl('gram.svg'),
      fallbackText: 'GR',
      name: 'Gram',
      symbol: 'GRAM',
      decimals: GRAM_DECIMALS,
      balance: tonAmount,
      maxSendable: Math.max(0, tonAmount - TON_GAS_RESERVE),
      rate: rates['GRAM']?.rate,
    };

    const otherJettons = userJettons
      .filter((j) => !isFiJetton(j))
      .map((jetton): TokenOption => {
        const decimals = jetton.decimalsNumber ?? GRAM_DECIMALS;
        const amount = toDecimal(jetton.balance, decimals);
        const symbol = getJettonsSymbol(jetton) ?? '';
        return {
          token: { type: 'JETTON', data: jetton },
          id: jetton.address,
          icon: getJettonsImage(jetton),
          fallbackText: symbol.slice(0, 2).toUpperCase() || '??',
          name: getJettonsName(jetton) ?? symbol,
          symbol,
          decimals,
          balance: amount,
          maxSendable: amount,
          rate: findRate(rates, jetton.address)?.rate,
        };
      });

    if (!isMember) {
      return [tonOption, ...otherJettons];
    }

    const fiJetton = userJettons.find(isFiJetton);
    const fiDecimals = fiJetton?.decimalsNumber ?? GRAM_DECIMALS;
    const fiAmount = fiJetton ? toDecimal(fiJetton.balance, fiDecimals) : 0;
    const fiOption: TokenOption = {
      token: {
        type: 'JETTON',
        data:
          fiJetton ??
          ({
            address: FI_ADDRESS,
            walletAddress: '',
            balance: '0',
            decimalsNumber: 9,
            isVerified: true,
            info: {
              name: 'BrotherHood FI',
              symbol: 'FI',
              decimals: 9,
              image: { url: assetUrl('fi.svg') },
            },
          } as any),
      },
      id: fiJetton?.address ?? FI_ADDRESS,
      icon: fiJetton
        ? getJettonsImage(fiJetton) || assetUrl('fi.svg')
        : assetUrl('fi.svg'),
      fallbackText: 'FI',
      name: (fiJetton && getJettonsName(fiJetton)) || 'BrotherHood FI',
      symbol: (fiJetton && getJettonsSymbol(fiJetton)) || 'FI',
      decimals: fiDecimals,
      balance: fiAmount,
      maxSendable: fiAmount,
      rate: fiJetton ? findRate(rates, fiJetton.address)?.rate : undefined,
    };

    return [fiOption, tonOption, ...otherJettons];
  }, [balance, userJettons, rates, isMember]);
};
