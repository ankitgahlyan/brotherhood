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
import { useFiMinterState } from '@/lib/brotherhood/queries';
import { parseOnchainMetadataCell } from '@/lib/brotherhood/jettonContent';
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
  const activeWallet = getActiveWallet();
  const walletAddress =
    address || currentWallet?.getAddress() || activeWallet?.address;
  const net = activeWallet?.network === 'mainnet' ? 'mainnet' : 'testnet';
  const activeJettons = useActiveJettons();
  const { entries: rates } = useRates();
  const { isMember } = useIsNetworkMember();
  const fiAccount = useFiAccount(walletAddress ?? null);
  const fiJettonBalance = fiAccount.data?.jettonBalance;
  const fiMinterState = useFiMinterState(true, net);
  const fiMetadataCell = fiMinterState.data?.metadata;
  const fiOnchainMeta = useMemo(
    () => parseOnchainMetadataCell(fiMetadataCell),
    [fiMetadataCell],
  );
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

    const normFi = normalizeAddress(FI_ADDRESS) || FI_ADDRESS;
    const seenAddresses = new Set<string>([normFi]);
    const otherJettons: TokenOption[] = [];

    for (const jetton of activeJettons) {
      if (isFiJetton(jetton)) continue;
      const normAddr = normalizeAddress(jetton.address) || jetton.address;
      if (seenAddresses.has(normAddr)) continue;
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
      if (isFiJetton({ address: pt.minterAddress, symbol: pt.symbol })) {
        continue;
      }
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

    const fiJetton =
      activeJettons.find(
        (j) => (normalizeAddress(j.address) || j.address) === normFi,
      ) ?? activeJettons.find(isFiJetton);
    const fiDecimals = fiJetton?.decimalsNumber ?? GRAM_DECIMALS;
    const fiAmount = fiJetton
      ? toDecimal(fiJetton.balance, fiDecimals)
      : fiJettonBalance
        ? toDecimal(fiJettonBalance, GRAM_DECIMALS)
        : 0;
    const fiSymbol =
      fiOnchainMeta.symbol?.trim() ||
      (fiJetton && getJettonsSymbol(fiJetton)) ||
      'HD';
    const fiName =
      fiOnchainMeta.name?.trim() ||
      (fiJetton && getJettonsName(fiJetton)) ||
      fiSymbol;
    const fiIcon =
      fiOnchainMeta.image?.trim() ||
      (fiJetton && getJettonsImage(fiJetton)) ||
      assetUrl('fi.svg');

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
              name: fiName,
              symbol: fiSymbol,
              decimals: 9,
              image: { url: fiIcon },
            },
          } as any),
      },
      id: fiJetton?.address ?? FI_ADDRESS,
      icon: fiIcon,
      fallbackText: fiSymbol.slice(0, 2).toUpperCase() || 'HD',
      name: fiName,
      symbol: fiSymbol,
      decimals: fiDecimals,
      balance: fiAmount,
      maxSendable: fiAmount,
      rate: findRate(rates, fiJetton?.address ?? FI_ADDRESS)?.rate,
    };

    return [fiOption, tonOption, ...otherJettons];
  }, [
    balance,
    activeJettons,
    personalTokens,
    rates,
    isMember,
    fiJettonBalance,
    fiOnchainMeta,
  ]);
};
