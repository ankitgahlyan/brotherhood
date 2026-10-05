/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useMemo } from 'react';
import { Address } from '@ton/core';
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
import {
  getContractCacheSync,
  getNormalizedContractCacheKey,
} from '@/lib/brotherhood/contract-cache';
import { useFiMinterState, useFiWalletState } from '@/lib/brotherhood/queries';
import { parseOnchainMetadataCell } from '@/lib/brotherhood/jettonContent';
import type { PersonalStore } from '@wrappers/Personal.gen';
import { usePersonalJettonInfo } from '@/features/personal-jetton/hooks/use-personal-jetton-info';
import { useTrackedPersonalTokens } from '@/features/assets/hooks/use-tracked-personal-tokens';
import { imageSources } from '@/features/assets/hooks/use-asset-rows';
import {
  assetUrl,
  findRate,
  normalizeAddress,
  toDecimal,
  tokenImageUrls,
} from '@/core/utils';
import { BRO_TREASURY_ADDRESS, FI_ADDRESS } from '@/lib/brotherhood/config';
import { isZeroAddress } from '@/lib/brotherhood/ton';

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
  const fiAdminAddr = fiMinterState.data?.adminAddress;
  const fiOnchainMeta = useMemo(
    () => parseOnchainMetadataCell(fiMetadataCell),
    [fiMetadataCell],
  );
  const adminOwnerAddress = useMemo(() => {
    if (fiAdminAddr && !isZeroAddress(fiAdminAddr)) {
      return fiAdminAddr;
    }
    try {
      return Address.parse(BRO_TREASURY_ADDRESS);
    } catch {
      return null;
    }
  }, [fiAdminAddr]);
  const adminFiWalletState = useFiWalletState(adminOwnerAddress, net);
  const adminPersonalMinterRaw =
    adminFiWalletState.data?.addresses?.ref?.trustedJettonAddrs?.ref
      ?.personalJettonMinter ?? null;
  const adminPtMinterNorm = useMemo(() => {
    if (!adminPersonalMinterRaw || isZeroAddress(adminPersonalMinterRaw)) {
      return null;
    }
    const rawStr = adminPersonalMinterRaw.toString();
    return normalizeAddress(rawStr) || rawStr;
  }, [adminPersonalMinterRaw]);
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

    const personalTokenByNorm = new Map<
      string,
      (typeof personalTokens)[number]
    >();
    for (const pt of personalTokens) {
      const normPt = normalizeAddress(pt.minterAddress) || pt.minterAddress;
      personalTokenByNorm.set(normPt, pt);
    }

    for (const jetton of activeJettons) {
      if (isFiJetton(jetton)) continue;
      const normAddr = normalizeAddress(jetton.address) || jetton.address;
      if (seenAddresses.has(normAddr)) continue;

      const decimals = jetton.decimalsNumber ?? GRAM_DECIMALS;
      const amount = toDecimal(jetton.balance, decimals);
      if (amount <= 0) continue;
      seenAddresses.add(normAddr);

      const cachedPtStore = getContractCacheSync<PersonalStore>(
        getNormalizedContractCacheKey(net, jetton.address),
      )?.data;
      const ptOnchainMeta = cachedPtStore?.metadataUri
        ? parseOnchainMetadataCell(cachedPtStore.metadataUri)
        : null;
      const trackedPt = personalTokenByNorm.get(normAddr);

      const isAdminPt = Boolean(
        adminPtMinterNorm && normAddr === adminPtMinterNorm,
      );
      const symbol =
        ptOnchainMeta?.symbol?.trim() ||
        trackedPt?.symbol?.trim() ||
        getJettonsSymbol(jetton) ||
        '';
      const name =
        ptOnchainMeta?.name?.trim() ||
        trackedPt?.name?.trim() ||
        getJettonsName(jetton) ||
        symbol;
      const ptImage =
        ptOnchainMeta?.image?.trim() || trackedPt?.image?.trim() || '';
      const iconUrls = [
        ...(ptImage ? [ptImage] : []),
        ...tokenImageUrls(jetton.info?.image),
      ];

      otherJettons.push({
        token: { type: 'JETTON', data: jetton },
        id: jetton.address,
        icon: imageSources(iconUrls, jetton.info?.image?.data),
        fallbackText: symbol.slice(0, 2).toUpperCase() || '??',
        name,
        symbol,
        decimals,
        balance: amount,
        maxSendable: amount,
        rate: findRate(rates, jetton.address)?.rate,
        isVerified: isAdminPt,
      });
    }

    const normOwnPersonal = personalMinterAddress
      ? normalizeAddress(personalMinterAddress) || personalMinterAddress
      : null;
    for (const pt of personalTokens) {
      if (isFiJetton({ address: pt.minterAddress, symbol: pt.symbol })) {
        continue;
      }
      const normAddr = normalizeAddress(pt.minterAddress) || pt.minterAddress;
      if (seenAddresses.has(normAddr)) continue;

      const amount = toDecimal(pt.balance, GRAM_DECIMALS);
      const isOwnPersonal = Boolean(
        normOwnPersonal && normAddr === normOwnPersonal,
      );
      if (amount <= 0 && !isOwnPersonal) continue;
      seenAddresses.add(normAddr);

      const cachedPtStore = getContractCacheSync<PersonalStore>(
        getNormalizedContractCacheKey(net, pt.minterAddress),
      )?.data;
      const ptOnchainMeta = cachedPtStore?.metadataUri
        ? parseOnchainMetadataCell(cachedPtStore.metadataUri)
        : null;

      const isAdminPt = Boolean(
        adminPtMinterNorm && normAddr === adminPtMinterNorm,
      );
      const symbol = ptOnchainMeta?.symbol?.trim() || pt.symbol?.trim() || 'PT';
      const name =
        ptOnchainMeta?.name?.trim() || pt.name?.trim() || 'Personal Token';
      const ptImage = ptOnchainMeta?.image?.trim() || pt.image?.trim() || '';

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
              name,
              symbol,
              decimals: GRAM_DECIMALS,
              image: ptImage ? { url: ptImage } : undefined,
            },
          } as any,
        },
        id: pt.minterAddress,
        icon: ptImage ? imageSources([ptImage]) : undefined,
        fallbackText: symbol.slice(0, 2).toUpperCase() || 'PT',
        name,
        symbol,
        decimals: GRAM_DECIMALS,
        balance: amount,
        maxSendable: amount,
        rate: findRate(rates, pt.minterAddress)?.rate,
        isVerified: isAdminPt,
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
    const fiPrimaryIcon =
      fiOnchainMeta.image?.trim() ||
      (fiJetton && getJettonsImage(fiJetton)) ||
      assetUrl('fi.svg');
    const fiIconUrls = [
      ...(fiOnchainMeta.image?.trim() ? [fiOnchainMeta.image.trim()] : []),
      ...(fiJetton ? tokenImageUrls(fiJetton.info?.image) : []),
      assetUrl('fi.svg'),
    ];

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
              image: { url: fiPrimaryIcon },
            },
          } as any),
      },
      id: fiJetton?.address ?? FI_ADDRESS,
      icon: imageSources(fiIconUrls, fiJetton?.info?.image?.data),
      fallbackText: fiSymbol.slice(0, 2).toUpperCase() || 'HD',
      name: fiName,
      symbol: fiSymbol,
      decimals: fiDecimals,
      balance: fiAmount,
      maxSendable: fiAmount,
      rate: findRate(rates, fiJetton?.address ?? FI_ADDRESS)?.rate,
      isVerified: true,
    };

    return [fiOption, tonOption, ...otherJettons];
  }, [
    balance,
    activeJettons,
    personalTokens,
    personalMinterAddress,
    adminPtMinterNorm,
    rates,
    isMember,
    fiJettonBalance,
    fiOnchainMeta,
    net,
  ]);
};
