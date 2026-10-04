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
import {
  useActiveJettons,
  useJettons,
  useRates,
  useWallet,
} from '@demo/wallet-core';

import type { AssetRowData } from '../components/asset-row';

import {
  getJettonsName,
  getJettonsSymbol,
  isFiJetton,
} from '@/features/jettons';
import { useIsNetworkMember } from '@/features/brotherhood';
import { useFiAccount } from '@/features/brotherhood/hooks/use-fi-account';
import { useFiMinterState, useFiWalletState } from '@/lib/brotherhood/queries';
import { parseOnchainMetadataCell } from '@/lib/brotherhood/jettonContent';
import { usePersonalJettonInfo } from '@/features/personal-jetton/hooks/use-personal-jetton-info';
import { isPersonalMinterContract, isZeroAddress } from '@/lib/brotherhood/ton';
import { useTrackedPersonalTokens } from './use-tracked-personal-tokens';
import { BRO_TREASURY_ADDRESS, FI_ADDRESS } from '@/lib/brotherhood/config';
import {
  assetUrl,
  findRate,
  formatRate,
  normalizeAddress,
  toDecimal,
  tokenImageUrls,
} from '@/core/utils';
import {
  normalizeAssetVisibilityKey,
  useAssetVisibilityStore,
} from '@/core/storage/useAssetVisibilityStore';

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
  /** Visible held jettons as rows, sorted with pinned first (in pin order), then FI, then fiat/amount desc. */
  jettonRows: AssetRowData[];
  /** Hidden held jettons as rows (shown inside the collapsible Hidden section on /wallet/assets). */
  hiddenJettonRows: AssetRowData[];
  assetsReady: boolean;
}

/** Builds the TON row + visible and hidden jetton rows. Shared by the dashboard preview and the full assets page. */
export const useAssetRows = (): AssetRows => {
  const { balance, currentWallet, address, getActiveWallet } = useWallet();
  const activeWallet = getActiveWallet();
  const walletAddress =
    address || currentWallet?.getAddress() || activeWallet?.address;
  const network = activeWallet?.network ?? 'testnet';
  const net = network === 'mainnet' ? 'mainnet' : 'testnet';
  const { lastJettonsUpdate } = useJettons();
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
  const pinnedTokenIds = useAssetVisibilityStore((s) => s.pinnedTokenIds);
  const hiddenTokenIds = useAssetVisibilityStore((s) => s.hiddenTokenIds);

  const assetsReady =
    Boolean(walletAddress) &&
    (balance !== undefined ||
      activeJettons.length > 0 ||
      personalTokens.length > 0 ||
      lastJettonsUpdate > 0);

  // Other jetton addresses (not FI and not user's own personal minter)
  const candidatePersonalAddresses = useMemo(() => {
    return activeJettons
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
  }, [activeJettons, personalMinterAddress]);

  const { data: verifiedPersonalMinterSet } = useQuery({
    queryKey: [
      'verified-personal-minters',
      network,
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

  const { jettonRows, hiddenJettonRows } = useMemo<{
    jettonRows: AssetRowData[];
    hiddenJettonRows: AssetRowData[];
  }>(() => {
    if (!assetsReady) return { jettonRows: [], hiddenJettonRows: [] };

    const rows: AssetRowData[] = [];
    const seenAddresses = new Set<string>();
    const normFi = normalizeAddress(FI_ADDRESS) || FI_ADDRESS;

    // 1. Process activeJettons (FI + any personal tokens indexed by walletkit)
    for (const jetton of activeJettons) {
      const isFi = isFiJetton(jetton);
      const normAddr = isFi
        ? normFi
        : normalizeAddress(jetton.address) || jetton.address;
      if (seenAddresses.has(normAddr)) continue;

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

      const rateEntry = findRate(rates, jetton.address);
      const decimals = jetton.decimalsNumber ?? 9;
      const amount = toDecimal(jetton.balance, decimals);
      const symbol = isFi
        ? fiOnchainMeta.symbol?.trim() || getJettonsSymbol(jetton) || 'HD'
        : (getJettonsSymbol(jetton) ?? '');
      const name = isFi
        ? fiOnchainMeta.name?.trim() || getJettonsName(jetton) || symbol
        : (getJettonsName(jetton) ?? symbol);

      // Per user rule: only show tokens if balance > 0 (FI is shown if member)
      if (!isFi && amount <= 0) continue;

      seenAddresses.add(normAddr);

      const visKey = normalizeAssetVisibilityKey(
        isFi ? FI_ADDRESS : jetton.address,
      );
      const iconUrls = isFi
        ? [
            ...(fiOnchainMeta.image?.trim()
              ? [fiOnchainMeta.image.trim()]
              : []),
            ...tokenImageUrls(jetton.info?.image),
            assetUrl('fi.svg'),
          ]
        : tokenImageUrls(jetton.info?.image);

      const isAdminPt = Boolean(
        adminPtMinterNorm && normAddr === adminPtMinterNorm,
      );

      rows.push({
        id: jetton.address,
        icon: imageSources(iconUrls, jetton.info?.image?.data),
        fallbackText: symbol.slice(0, 2).toUpperCase() || '??',
        name,
        symbol,
        amount,
        rateLabel: rateEntry ? formatRate(rateEntry.rate) : undefined,
        fiat: rateEntry ? amount * rateEntry.rate : undefined,
        isVerified: isFi || isAdminPt,
        isPinned: pinnedTokenIds.includes(visKey),
        isHidden: hiddenTokenIds.includes(visKey),
      });
    }

    // 1.5 Ensure FI is included for members even if not indexed in activeJettons
    if (isMember && !seenAddresses.has(normFi)) {
      const fiBal = fiJettonBalance ? toDecimal(fiJettonBalance, 9) : 0;
      const rateEntry = findRate(rates, FI_ADDRESS);
      const visKey = normalizeAssetVisibilityKey(FI_ADDRESS);
      const fiSymbol = fiOnchainMeta.symbol?.trim() || 'HD';
      const fiName = fiOnchainMeta.name?.trim() || fiSymbol;
      const fiIconList = [
        ...(fiOnchainMeta.image?.trim() ? [fiOnchainMeta.image.trim()] : []),
        assetUrl('fi.svg'),
      ];
      rows.push({
        id: FI_ADDRESS,
        icon: imageSources(fiIconList),
        fallbackText: fiSymbol.slice(0, 2).toUpperCase() || 'HD',
        name: fiName,
        symbol: fiSymbol,
        amount: fiBal,
        rateLabel: rateEntry ? formatRate(rateEntry.rate) : undefined,
        fiat: rateEntry ? fiBal * rateEntry.rate : undefined,
        isVerified: true,
        isPinned: pinnedTokenIds.includes(visKey),
        isHidden: hiddenTokenIds.includes(visKey),
      });
      seenAddresses.add(normFi);
    }

    // 2. Process personalTokens (discovered on-chain and manually tracked)
    const normOwnPersonal = personalMinterAddress
      ? normalizeAddress(personalMinterAddress) || personalMinterAddress
      : null;
    for (const pt of personalTokens) {
      if (isFiJetton({ address: pt.minterAddress, symbol: pt.symbol })) {
        continue;
      }
      const normAddr = normalizeAddress(pt.minterAddress) || pt.minterAddress;
      if (seenAddresses.has(normAddr)) continue;

      const amount = toDecimal(pt.balance, 9);
      const isOwnPersonal = Boolean(
        normOwnPersonal && normAddr === normOwnPersonal,
      );
      if (amount <= 0 && !isOwnPersonal) {
        continue;
      }
      seenAddresses.add(normAddr);

      const isAdminPt = Boolean(
        adminPtMinterNorm && normAddr === adminPtMinterNorm,
      );
      const symbol = pt.symbol || 'PT';
      const visKey = normalizeAssetVisibilityKey(pt.minterAddress);
      rows.push({
        id: pt.minterAddress,
        icon: pt.image ? imageSources([pt.image]) : undefined,
        fallbackText: symbol.slice(0, 2).toUpperCase() || 'PT',
        name: pt.name || 'Personal Token',
        symbol,
        amount,
        isVerified: isAdminPt,
        isPinned: pinnedTokenIds.includes(visKey),
        isHidden: hiddenTokenIds.includes(visKey),
      });
    }

    const compareRows = (a: AssetRowData, b: AssetRowData) => {
      const aPinIdx = pinnedTokenIds.indexOf(normalizeAssetVisibilityKey(a.id));
      const bPinIdx = pinnedTokenIds.indexOf(normalizeAssetVisibilityKey(b.id));
      const aPinned = aPinIdx !== -1;
      const bPinned = bPinIdx !== -1;
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      if (aPinned && bPinned) return aPinIdx - bPinIdx;

      const aIsFi = isFiJetton({ address: a.id, symbol: a.symbol });
      const bIsFi = isFiJetton({ address: b.id, symbol: b.symbol });
      if (aIsFi && !bIsFi) return -1;
      if (!aIsFi && bIsFi) return 1;
      return (b.fiat ?? 0) - (a.fiat ?? 0) || b.amount - a.amount;
    };

    const visible = rows.filter((r) => !r.isHidden).sort(compareRows);
    const hidden = rows.filter((r) => r.isHidden).sort(compareRows);

    return { jettonRows: visible, hiddenJettonRows: hidden };
  }, [
    assetsReady,
    activeJettons,
    rates,
    isMember,
    personalMinterAddress,
    adminPtMinterNorm,
    verifiedPersonalMinterSet,
    personalTokens,
    fiJettonBalance,
    fiOnchainMeta,
    pinnedTokenIds,
    hiddenTokenIds,
  ]);

  return { tonRow, jettonRows, hiddenJettonRows, assetsReady };
};
