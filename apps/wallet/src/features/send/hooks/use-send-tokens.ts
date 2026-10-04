/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useMemo } from 'react';
import { useActiveJettons, useRates, useWallet } from '@demo/wallet-core';

import type { TokenOption } from '../types';

import {
  getJettonsImage,
  getJettonsName,
  getJettonsSymbol,
  isFiJetton,
} from '@/features/jettons';
import { useIsNetworkMember } from '@/features/brotherhood';
import { useFiAccount } from '@/features/brotherhood/hooks/use-fi-account';
import { usePersonalJettonInfo } from '@/features/personal-jetton/hooks/use-personal-jetton-info';
import { useTrackedPersonalTokens } from '@/features/assets/hooks/use-tracked-personal-tokens';
import { assetUrl, findRate, normalizeAddress, toDecimal } from '@/core/utils';
import { FI_ADDRESS } from '@/lib/brotherhood/config';

const GRAM_DECIMALS = 9;
/** Kept aside on a MAX TON send so the transfer still has gas to pay for itself. */
const TON_GAS_RESERVE = 0.01;

/** Builds the selectable send assets: FI first for members, then TON, then other held jettons. */
export const useSendTokens = (): TokenOption[] => {
  const { balance, currentWallet, address, getActiveWallet } = useWallet();
  const walletAddress =
    address || currentWallet?.getAddress() || getActiveWallet()?.address;
  const activeJettons = useActiveJettons();
  const { entries: rates } = useRates();
  const { isMember } = useIsNetworkMember();
  const fiAccount = useFiAccount(walletAddress ?? null);
  const fiJettonBalance = fiAccount.data?.jettonBalance;
  const { personalMinterAddress } = usePersonalJettonInfo(
    walletAddress ?? null,
  );
  const { personalTokens } = useTrackedPersonalTokens(
    personalMinterAddress ? [personalMinterAddress] : undefined,
  );

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

    const seenAddresses = new Set<string>();
    const otherJettons: TokenOption[] = [];

    for (const jetton of activeJettons) {
      if (isFiJetton(jetton)) continue;
      const normAddr = normalizeAddress(jetton.address) || jetton.address;
      seenAddresses.add(normAddr);

      const decimals = jetton.decimalsNumber ?? GRAM_DECIMALS;
      const amount = toDecimal(jetton.balance, decimals);
      const symbol = getJettonsSymbol(jetton) ?? '';
      otherJettons.push({
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
      });
    }

    for (const pt of personalTokens) {
      const normAddr = normalizeAddress(pt.minterAddress) || pt.minterAddress;
      if (seenAddresses.has(normAddr)) continue;
      seenAddresses.add(normAddr);

      const amount = toDecimal(pt.balance, GRAM_DECIMALS);
      const symbol = pt.symbol || 'PT';
      otherJettons.push({
        token: {
          type: 'JETTON',
          data: {
            address: pt.minterAddress,
            walletAddress: pt.walletAddress,
            balance: pt.balance,
            decimalsNumber: GRAM_DECIMALS,
            isVerified: true,
            info: {
              name: pt.name || 'Personal Token',
              symbol,
              decimals: GRAM_DECIMALS,
              image: pt.image ? { url: pt.image } : undefined,
            },
          } as any,
        },
        id: pt.minterAddress,
        icon: pt.image,
        fallbackText: symbol.slice(0, 2).toUpperCase() || 'PT',
        name: pt.name || 'Personal Token',
        symbol,
        decimals: GRAM_DECIMALS,
        balance: amount,
        maxSendable: amount,
        rate: findRate(rates, pt.minterAddress)?.rate,
      });
    }

    if (!isMember) {
      return [tonOption, ...otherJettons];
    }

    const fiJetton = activeJettons.find(isFiJetton);
    const fiDecimals = fiJetton?.decimalsNumber ?? GRAM_DECIMALS;
    const fiAmount = fiJetton
      ? toDecimal(fiJetton.balance, fiDecimals)
      : fiJettonBalance
        ? toDecimal(fiJettonBalance, GRAM_DECIMALS)
        : 0;
    const fiOption: TokenOption = {
      token: {
        type: 'JETTON',
        data:
          fiJetton ??
          ({
            address: FI_ADDRESS,
            walletAddress: '',
            balance: String(fiJettonBalance ?? '0'),
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
  }, [
    balance,
    activeJettons,
    personalTokens,
    rates,
    isMember,
    fiJettonBalance,
  ]);
};
