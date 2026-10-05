/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Address, type Cell, toNano } from '@ton/core';
import { mnemonicToPrivateKey } from '@ton/crypto';
import { createCommentPayload } from '@ton/walletkit';
import {
  useActiveJettons,
  useWallet,
  useWalletKit,
  useWalletStore,
  getChainNetwork,
} from '@demo/wallet-core';
import { toast } from 'sonner';

import {
  BRO_TREASURY_ADDRESS,
  FI_ADDRESS,
  MULTIPLIER_SCALE,
  RESERVE_TOKEN_FIAT_BUY_URL,
  normalizeOnchainMultiplier,
  type Network,
} from '@/lib/brotherhood/config';
import {
  buildBuyCreditBody,
  buildBurnBody,
  buildSwapTargetPayload,
  getPersonalMinter,
  parseUnits,
} from '@/lib/brotherhood/deploy';
import { getFiWalletAddress, isZeroAddress } from '@/lib/brotherhood/ton';
import {
  useFiMinterState,
  useFiWalletState,
  usePersonalMinterDetails,
  usePersonalWalletBalance,
} from '@/lib/brotherhood/queries';
import { parseOnchainMetadataCell } from '@/lib/brotherhood/jettonContent';
import {
  getContractCacheSync,
  getNormalizedContractCacheKey,
} from '@/lib/brotherhood/contract-cache';
import {
  batchHydrateUniversal,
  computePersonalWalletAddress,
  type KnownContractType,
} from '@/lib/brotherhood/account-state-hydrator';
import {
  useFiAccount,
  useMemberProfiles,
  useBrotherhoodTransaction,
  GAS,
  getAccountActionError,
} from '@/features/brotherhood';
import { formatFi } from '@/features/brotherhood/components/credit/credit-member-card';
import {
  getJettonsImage,
  getJettonsName,
  getJettonsSymbol,
  isFiJetton,
} from '@/features/jettons';
import { formatUnits, assetUrl } from '@/core/utils';
import { useFormatAddress, formatTonAddress } from '@/core/utils/formatters';
import { useNowSeconds } from '@/core/hooks';
import {
  encryptMessageComment,
  packBytesAsSnakeForEncryptedData,
} from '@/core/utils/encryption';
import { resolveRecipientPublicKey } from '@/core/storage/publicKeyCache';
import type { PersonalStore } from '@wrappers/Personal.gen';
import type { PersonalWalletStore } from '@wrappers/PersonalWallet.gen';

export type EcosystemTokenKind = 'fi' | 'reserve' | 'personal';

export interface EcosystemToken {
  id: string;
  kind: EcosystemTokenKind;
  symbol: string;
  name: string;
  icon?: string;
  ownerAddress: string;
  fiWalletAddress: string;
  minterAddress: string | null;
  userBalanceNano: bigint;
  userBalanceFormatted: string;
  creditNeedNano: bigint;
  issuerFiBalanceNano: bigint;
  creditMaturity: number;
  multiplier: number;
  degree: 'fi' | 'reserve' | 'circle' | 'ring' | 'voted' | 'custom';
  hasPersonalToken: boolean;
}

export type EcosystemSwapMode = 'buy-credit' | 'payback' | 'multi-hop';

export interface EcosystemSwapQuote {
  mode: EcosystemSwapMode;
  routeLabel: string;
  routeDescription: string;
  inputNano: bigint;
  outputNano: bigint;
  intermediateFiNano: bigint;
  fromAmountFormatted: string;
  toAmountFormatted: string;
  effectiveRate: number;
  feeOrBonusPercent: number;
  gasTon: string;
  maxInputNano: bigint;
  validationError: string | null;
}

function formatNanoToken(amountNano: bigint, decimals = 9): string {
  if (amountNano <= 0n) return '0';
  return formatUnits(amountNano.toString(), decimals);
}

function formatMaturityDate(ts: number): string {
  if (!ts || ts <= 0) return 'Instant (2-Way Liquid)';
  return new Date(ts * 1000).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export { formatMaturityDate };

export function useEcosystemSwap() {
  const { currentWallet, address, getActiveWallet, getDecryptedMnemonic } =
    useWallet();
  const walletKit = useWalletKit();
  const savedWallets = useWalletStore(
    (state) => state.walletManagement.savedWallets,
  );
  const activeJettons = useActiveJettons();
  const { network: addrNetwork } = useFormatAddress();
  const net: Network =
    (getActiveWallet()?.network ?? addrNetwork) === 'mainnet'
      ? 'mainnet'
      : 'testnet';
  const nowSec = useNowSeconds();

  const {
    send: sendTx,
    isSending: isSwapping,
    error: txError,
  } = useBrotherhoodTransaction(currentWallet, walletKit);

  // 1. User's own FI Account & FI Minter State (for on-chain FI metadata & admin address)
  const { data: accountData } = useFiAccount(address ?? null);
  const fiMinterState = useFiMinterState(true, net);
  const fiOnchainMeta = useMemo(
    () => parseOnchainMetadataCell(fiMinterState.data?.metadata),
    [fiMinterState.data?.metadata],
  );

  const userOwnerAddress = useMemo(() => {
    if (!address) return null;
    try {
      return Address.parse(address);
    } catch {
      return null;
    }
  }, [address]);

  // 2. FI Admin Personal Token (resolved from FiStore.adminAddress or BRO_TREASURY_ADDRESS)
  const treasuryOwnerAddress = useMemo(() => {
    const minterAdmin = fiMinterState.data?.adminAddress;
    if (minterAdmin && !isZeroAddress(minterAdmin)) {
      return minterAdmin;
    }
    try {
      return Address.parse(BRO_TREASURY_ADDRESS);
    } catch {
      return null;
    }
  }, [fiMinterState.data?.adminAddress]);

  const treasuryFiState = useFiWalletState(treasuryOwnerAddress, net);
  const treasuryMinterAddr = useMemo(() => {
    const m =
      treasuryFiState.data?.addresses?.ref?.trustedJettonAddrs?.ref
        ?.personalJettonMinter;
    return m && !isZeroAddress(m) ? m : null;
  }, [treasuryFiState.data]);

  const treasuryMinterDetails = usePersonalMinterDetails(
    treasuryMinterAddr,
    Boolean(treasuryMinterAddr),
    net,
  );

  const userReserveBalanceQuery = usePersonalWalletBalance(
    treasuryMinterAddr,
    userOwnerAddress,
    Boolean(treasuryMinterAddr && userOwnerAddress),
    net,
  );

  // 3. Discover Member Personal Tokens from Circle, Ring, Voted For, and Custom Lookups
  const [customOwnerAddresses, setCustomOwnerAddresses] = useState<string[]>(
    [],
  );

  const circleFiWalletAddrs = useMemo(
    () => (accountData?.invited ?? []).map((i) => i.addressString),
    [accountData?.invited],
  );

  const ringFiWalletAddrs = useMemo(() => {
    const out: string[] = [];
    for (const circleAddr of circleFiWalletAddrs) {
      try {
        const cached = getContractCacheSync<any>(
          getNormalizedContractCacheKey(net, circleAddr),
        );
        const invitedMap = cached?.data?.maps?.ref?.invited;
        const keys =
          typeof invitedMap?.keys === 'function' ? invitedMap.keys() : [];
        for (const k of keys) {
          out.push(formatTonAddress(k, { isContract: true, network: net }));
        }
      } catch {
        // Ignore dict parse errors
      }
    }
    return out;
  }, [circleFiWalletAddrs, net]);

  const votedFiWalletAddrs = useMemo(
    () => (accountData?.votedFor ?? []).map((v) => v.addressString),
    [accountData?.votedFor],
  );

  const customFiWalletAddrs = useMemo(() => {
    const out: string[] = [];
    for (const ownerStr of customOwnerAddresses) {
      try {
        const parsed = Address.parse(ownerStr);
        const fw = getFiWalletAddress(parsed, net);
        out.push(formatTonAddress(fw, { isContract: true, network: net }));
      } catch {
        // Ignore invalid
      }
    }
    return out;
  }, [customOwnerAddresses, net]);

  const allMemberFiWalletAddrs = useMemo(() => {
    const set = new Set<string>([
      ...circleFiWalletAddrs,
      ...ringFiWalletAddrs,
      ...votedFiWalletAddrs,
      ...customFiWalletAddrs,
    ]);
    return Array.from(set);
  }, [
    circleFiWalletAddrs,
    ringFiWalletAddrs,
    votedFiWalletAddrs,
    customFiWalletAddrs,
  ]);

  const memberProfilesQuery = useMemberProfiles(allMemberFiWalletAddrs, net);

  // Ensure discovered member PersonalMinters are hydrated for metadata if not yet in contract-cache
  useEffect(() => {
    const toHydrate: (Address | string)[] = [];
    const knownTypes: Record<string, KnownContractType> = {};

    const queueIfUncached = (
      addr: Address | string | null | undefined,
      type: KnownContractType,
    ) => {
      if (!addr) return;
      try {
        const parsed = typeof addr === 'string' ? Address.parse(addr) : addr;
        if (isZeroAddress(parsed)) return;
        const std = parsed.toString();
        const key = getNormalizedContractCacheKey(net, parsed);
        if (getContractCacheSync(key) === null && !knownTypes[std]) {
          knownTypes[std] = type;
          toHydrate.push(parsed);
        }
      } catch {
        // ignore invalid address
      }
    };

    const profiles = memberProfilesQuery.data ?? {};
    for (const fwAddr of allMemberFiWalletAddrs) {
      const minterStr = profiles[fwAddr]?.personalJettonMinter;
      if (minterStr) {
        queueIfUncached(minterStr, 'personalMinter');
      }
    }

    if (toHydrate.length > 0) {
      void batchHydrateUniversal(toHydrate, net, { knownTypes });
    }
  }, [net, allMemberFiWalletAddrs, memberProfilesQuery.data]);

  const addCustomMemberOwner = useCallback((ownerAddrStr: string) => {
    try {
      const parsed = Address.parse(ownerAddrStr.trim());
      const formatted = parsed.toString();
      setCustomOwnerAddresses((prev) =>
        prev.includes(formatted) ? prev : [formatted, ...prev],
      );
    } catch {
      // Ignore
    }
  }, []);

  // Build unified list of EcosystemTokens using original on-chain metadata names & symbols
  const tokens = useMemo<EcosystemToken[]>(() => {
    const list: EcosystemToken[] = [];

    // Pinned #1: FI Contract Token (symbol/name/icon fetched from FiStore.metadata)
    const userFiBalance = accountData?.jettonBalance ?? 0n;
    const userFiWalletAddr = userOwnerAddress
      ? formatTonAddress(getFiWalletAddress(userOwnerAddress, net), {
          isContract: true,
          network: net,
        })
      : FI_ADDRESS;

    const matchingFiJetton = activeJettons.find((j) => isFiJetton(j));
    const fiSymbol =
      fiOnchainMeta.symbol?.trim() ||
      (matchingFiJetton ? getJettonsSymbol(matchingFiJetton) : '') ||
      'HD';
    const fiName =
      fiOnchainMeta.name?.trim() ||
      (matchingFiJetton ? getJettonsName(matchingFiJetton) : '') ||
      fiSymbol;
    const fiIcon =
      fiOnchainMeta.image?.trim() ||
      (matchingFiJetton ? getJettonsImage(matchingFiJetton) : '') ||
      assetUrl('fi.svg');

    list.push({
      id: 'FI',
      kind: 'fi',
      symbol: fiSymbol,
      name: fiName,
      icon: fiIcon,
      ownerAddress: address ?? FI_ADDRESS,
      fiWalletAddress: userFiWalletAddr,
      minterAddress: FI_ADDRESS,
      userBalanceNano: userFiBalance,
      userBalanceFormatted: formatNanoToken(userFiBalance),
      creditNeedNano: 0n,
      issuerFiBalanceNano: userFiBalance,
      creditMaturity: 0,
      multiplier: 1,
      degree: 'fi',
      hasPersonalToken: true,
    });

    // Pinned #2: FI Admin Personal Token (symbol/name/icon fetched from PersonalStore.metadataUri)
    const treasuryStore = treasuryFiState.data;
    const treasuryOwnerStr = treasuryOwnerAddress
      ? formatTonAddress(treasuryOwnerAddress, {
          isContract: false,
          network: net,
        })
      : BRO_TREASURY_ADDRESS;
    const treasuryFiWalletStr = treasuryOwnerAddress
      ? formatTonAddress(getFiWalletAddress(treasuryOwnerAddress, net), {
          isContract: true,
          network: net,
        })
      : BRO_TREASURY_ADDRESS;
    const treasuryMinterStr = treasuryMinterAddr
      ? formatTonAddress(treasuryMinterAddr, { isContract: true, network: net })
      : null;

    const matchingAdminJetton = treasuryMinterAddr
      ? activeJettons.find((j) => {
          try {
            return Address.parse(j.address).equals(treasuryMinterAddr);
          } catch {
            return false;
          }
        })
      : undefined;

    let reserveUserBal = userReserveBalanceQuery.data ?? 0n;
    if (reserveUserBal === 0n && matchingAdminJetton?.balance) {
      try {
        reserveUserBal = BigInt(matchingAdminJetton.balance);
      } catch {
        // ignore
      }
    }

    const adminOnchainMeta = treasuryMinterDetails.data?.metadata;
    const treasuryUsername =
      treasuryStore?.profile?.ref?.username?.replace(/^@/, '') ?? '';
    const adminSymbol =
      adminOnchainMeta?.symbol?.trim() ||
      (matchingAdminJetton ? getJettonsSymbol(matchingAdminJetton) : '') ||
      (treasuryUsername
        ? `@${treasuryUsername}`
        : `${treasuryOwnerStr.slice(0, 4)}…${treasuryOwnerStr.slice(-4)}`);
    const adminName =
      adminOnchainMeta?.name?.trim() ||
      (matchingAdminJetton ? getJettonsName(matchingAdminJetton) : '') ||
      adminSymbol;
    const adminIcon =
      adminOnchainMeta?.image?.trim() ||
      (matchingAdminJetton ? getJettonsImage(matchingAdminJetton) : undefined);

    const treasuryMultiplier = normalizeOnchainMultiplier(
      treasuryStore?.multiplier,
    );

    list.push({
      id: 'RESERVE',
      kind: 'reserve',
      symbol: adminSymbol,
      name: adminName,
      icon: adminIcon,
      ownerAddress: treasuryOwnerStr,
      fiWalletAddress: treasuryFiWalletStr,
      minterAddress: treasuryMinterStr,
      userBalanceNano: reserveUserBal,
      userBalanceFormatted: formatNanoToken(reserveUserBal),
      creditNeedNano: treasuryStore?.creditNeed ?? 0n,
      issuerFiBalanceNano: treasuryStore?.jettonBalance ?? 0n,
      creditMaturity: Number(treasuryStore?.creditMaturity ?? 0),
      multiplier: treasuryMultiplier,
      degree: 'reserve',
      hasPersonalToken: Boolean(treasuryMinterStr),
    });

    // Member Personal Tokens
    const profiles = memberProfilesQuery.data ?? {};
    const circleSet = new Set(circleFiWalletAddrs);
    const ringSet = new Set(ringFiWalletAddrs);
    const votedSet = new Set(votedFiWalletAddrs);
    const seenOwners = new Set<string>();
    if (treasuryOwnerAddress) {
      seenOwners.add(treasuryOwnerAddress.toRawString());
    }
    if (userOwnerAddress) {
      seenOwners.add(userOwnerAddress.toRawString());
    }

    for (const fwAddr of allMemberFiWalletAddrs) {
      const prof = profiles[fwAddr];
      if (!prof || !prof.ownerAddress) continue;

      let ownerParsed: Address;
      try {
        ownerParsed = Address.parse(prof.ownerAddress);
      } catch {
        continue;
      }
      if (seenOwners.has(ownerParsed.toRawString())) continue;
      seenOwners.add(ownerParsed.toRawString());

      const minterStr = prof.personalJettonMinter ?? null;
      let hasPt = false;
      let minterParsed: Address | null = null;
      if (minterStr) {
        try {
          minterParsed = Address.parse(minterStr);
          hasPt = !isZeroAddress(minterParsed);
        } catch {
          hasPt = false;
        }
      }

      // Check on-chain PersonalStore metadata & user's held balance of this member's Personal Token
      let userPtBal = 0n;
      let jettonSymbol: string | undefined;
      let jettonName: string | undefined;
      let jettonIcon: string | undefined;

      if (hasPt && minterParsed) {
        try {
          const cachedMinter = getContractCacheSync<PersonalStore>(
            getNormalizedContractCacheKey(net, minterParsed),
          );
          if (cachedMinter?.data?.metadataUri) {
            const meta = parseOnchainMetadataCell(
              cachedMinter.data.metadataUri,
            );
            if (meta.symbol?.trim()) jettonSymbol = meta.symbol.trim();
            if (meta.name?.trim()) jettonName = meta.name.trim();
            if (meta.image?.trim()) jettonIcon = meta.image.trim();
          }
        } catch {
          // ignore
        }

        const matchingJetton = activeJettons.find((j) => {
          try {
            return Address.parse(j.address).equals(minterParsed!);
          } catch {
            return false;
          }
        });
        if (matchingJetton) {
          if (!jettonSymbol) jettonSymbol = getJettonsSymbol(matchingJetton);
          if (!jettonName) jettonName = getJettonsName(matchingJetton);
          if (!jettonIcon) jettonIcon = getJettonsImage(matchingJetton);
          if (matchingJetton.balance) {
            try {
              userPtBal = BigInt(matchingJetton.balance);
            } catch {
              // ignore
            }
          }
        }
        if (userPtBal === 0n && userOwnerAddress) {
          try {
            const pwAddr = computePersonalWalletAddress(
              minterParsed,
              userOwnerAddress,
              ownerParsed,
            );
            const cachedPw = getContractCacheSync<PersonalWalletStore>(
              getNormalizedContractCacheKey(net, pwAddr),
            );
            if (cachedPw?.data?.jettonBalance) {
              userPtBal = cachedPw.data.jettonBalance;
            }
          } catch {
            // ignore
          }
        }
      }

      const cleanUsername = prof.username
        ? prof.username.replace(/^@/, '')
        : '';
      const displaySymbol =
        jettonSymbol ||
        (cleanUsername
          ? `@${cleanUsername}`
          : `${prof.ownerAddress.slice(0, 4)}…${prof.ownerAddress.slice(-4)}`);
      const displayName =
        jettonName ||
        (cleanUsername
          ? `@${cleanUsername}`
          : `${prof.ownerAddress.slice(0, 6)}…`);

      const degree: EcosystemToken['degree'] = circleSet.has(fwAddr)
        ? 'circle'
        : ringSet.has(fwAddr)
          ? 'ring'
          : votedSet.has(fwAddr)
            ? 'voted'
            : 'custom';

      list.push({
        id: prof.ownerAddress,
        kind: 'personal',
        symbol: displaySymbol,
        name: displayName,
        icon: jettonIcon,
        ownerAddress: prof.ownerAddress,
        fiWalletAddress: fwAddr,
        minterAddress: hasPt ? minterStr : null,
        userBalanceNano: userPtBal,
        userBalanceFormatted: formatNanoToken(userPtBal),
        creditNeedNano: prof.creditNeed ?? 0n,
        issuerFiBalanceNano: prof.jettonBalance ?? 0n,
        creditMaturity: prof.creditMaturity ?? 0,
        multiplier: prof.multiplier ?? 1,
        degree,
        hasPersonalToken: hasPt,
      });
    }

    return list;
  }, [
    accountData?.jettonBalance,
    userOwnerAddress,
    net,
    address,
    fiOnchainMeta,
    treasuryFiState.data,
    treasuryOwnerAddress,
    treasuryMinterAddr,
    treasuryMinterDetails.data,
    userReserveBalanceQuery.data,
    activeJettons,
    memberProfilesQuery.data,
    circleFiWalletAddrs,
    ringFiWalletAddrs,
    votedFiWalletAddrs,
    allMemberFiWalletAddrs,
  ]);

  // Default direction: from FI Admin PT ('RESERVE') -> FI ('FI') since swapping PT -> FI is always allowed,
  // whereas swapping into FI Admin PT is disallowed unless FI Admin FiWallet sets creditNeed > 0.
  const [fromTokenId, setFromTokenId] = useState<string>('RESERVE');
  const [toTokenId, setToTokenId] = useState<string>('FI');
  const [amountInput, setAmountInput] = useState<string>('');
  const [isReverseInput, setIsReverseInput] = useState<boolean>(false);

  const fiToken = useMemo(
    () => tokens.find((t) => t.kind === 'fi') ?? tokens[0],
    [tokens],
  );

  const fromToken = useMemo(
    () => tokens.find((t) => t.id === fromTokenId) ?? tokens[0],
    [tokens, fromTokenId],
  );

  const toToken = useMemo(
    () =>
      tokens.find((t) => t.id === toTokenId) ??
      tokens.find((t) => t.id !== fromToken.id) ??
      tokens[1] ??
      tokens[0],
    [tokens, toTokenId, fromToken.id],
  );

  const handleSelectFromToken = useCallback(
    (id: string) => {
      if (id === toToken.id) {
        if (fromToken.kind === 'reserve' && fromToken.creditNeedNano <= 0n) {
          const fallbackTo =
            tokens.find(
              (t) =>
                t.id !== id &&
                !(t.kind === 'reserve' && t.creditNeedNano <= 0n),
            ) ?? fiToken;
          setToTokenId(fallbackTo.id);
        } else {
          setToTokenId(fromToken.id);
        }
      }
      setFromTokenId(id);
    },
    [fromToken, toToken.id, tokens, fiToken],
  );

  const handleSelectToToken = useCallback(
    (id: string) => {
      const candidate = tokens.find((t) => t.id === id);
      if (candidate?.kind === 'reserve' && candidate.creditNeedNano <= 0n) {
        toast.error(
          `Swap to ${candidate.symbol} is disabled unless its FiWallet sets credit required`,
        );
        return;
      }
      if (id === fromToken.id) {
        setFromTokenId(toToken.id);
      }
      setToTokenId(id);
    },
    [tokens, fromToken.id, toToken.id],
  );

  const flipDirection = useCallback(() => {
    if (fromToken.kind === 'reserve' && fromToken.creditNeedNano <= 0n) {
      toast.error(
        `Swap from ${toToken.symbol} to ${fromToken.symbol} is disabled unless ${fromToken.symbol} FiWallet sets credit required`,
      );
      return;
    }
    setFromTokenId(toToken.id);
    setToTokenId(fromToken.id);
    setIsReverseInput(false);
  }, [fromToken, toToken]);

  // Compute deterministic Swap Quote
  const quote = useMemo<EcosystemSwapQuote>(() => {
    const mode: EcosystemSwapMode =
      fromToken.kind === 'fi'
        ? 'buy-credit'
        : toToken.kind === 'fi'
          ? 'payback'
          : 'multi-hop';

    const fiSym = fiToken.symbol;

    const targetMultScaled = BigInt(
      Math.max(1, Math.round(toToken.multiplier * MULTIPLIER_SCALE)),
    );
    const scaleBig = BigInt(MULTIPLIER_SCALE);

    let rawInputNano = 0n;
    const trimmed = amountInput.trim();
    if (trimmed && parseFloat(trimmed) > 0) {
      try {
        rawInputNano = parseUnits(trimmed, 9);
      } catch {
        rawInputNano = 0n;
      }
    }

    let inputNano = 0n;
    let outputNano = 0n;
    let intermediateFiNano = 0n;

    if (mode === 'buy-credit') {
      if (!isReverseInput) {
        inputNano = rawInputNano;
        intermediateFiNano = inputNano;
        outputNano = (inputNano * targetMultScaled) / scaleBig;
      } else {
        outputNano = rawInputNano;
        inputNano =
          targetMultScaled > 0n
            ? (outputNano * scaleBig + targetMultScaled - 1n) / targetMultScaled
            : outputNano;
        intermediateFiNano = inputNano;
      }
    } else if (mode === 'payback') {
      // Payback is strictly 1:1
      inputNano = rawInputNano;
      outputNano = rawInputNano;
      intermediateFiNano = rawInputNano;
    } else {
      // Multi-hop: P_A -> FI (1:1) -> P_B (multiplier_B)
      if (!isReverseInput) {
        inputNano = rawInputNano;
        intermediateFiNano = inputNano;
        outputNano = (intermediateFiNano * targetMultScaled) / scaleBig;
      } else {
        outputNano = rawInputNano;
        intermediateFiNano =
          targetMultScaled > 0n
            ? (outputNano * scaleBig + targetMultScaled - 1n) / targetMultScaled
            : outputNano;
        inputNano = intermediateFiNano;
      }
    }

    // Calculate max possible input based on user balance, Leg-1 FI reserve, and Leg-2 creditNeed
    let maxInputNano = fromToken.userBalanceNano;
    if (mode === 'payback' || mode === 'multi-hop') {
      if (fromToken.issuerFiBalanceNano < maxInputNano) {
        maxInputNano = fromToken.issuerFiBalanceNano;
      }
    }
    if (mode === 'buy-credit' || mode === 'multi-hop') {
      if (toToken.creditNeedNano < maxInputNano) {
        maxInputNano = toToken.creditNeedNano;
      }
    }

    const effectiveRate =
      mode === 'payback' ? 1 : Number(targetMultScaled) / MULTIPLIER_SCALE;
    const feeOrBonusPercent =
      mode === 'payback' ? 0 : Number(((effectiveRate - 1) * 100).toFixed(3));

    const routeLabel =
      mode === 'buy-credit'
        ? `${fromToken.symbol} → ${toToken.symbol} (BuyCredit)`
        : mode === 'payback'
          ? `${fromToken.symbol} → ${fiSym} (Payback)`
          : `${fromToken.symbol} → ${fiSym} → ${toToken.symbol} (Atomic Multi-Hop)`;

    const routeDescription =
      mode === 'buy-credit'
        ? `Sends ${fiSym} to ${toToken.symbol} issuer's FossFiWallet and mints ${toToken.symbol} at ${toToken.multiplier}x.`
        : mode === 'payback'
          ? `Burns ${fromToken.symbol} and redeems 1:1 ${fiSym} from the issuer's FossFiWallet.`
          : `Single-signature atomic hop: burns ${fromToken.symbol} for 1:1 ${fiSym}, then automatically forwards ${fiSym} to mint ${toToken.symbol} at ${toToken.multiplier}x.`;

    const gasTon = mode === 'payback' ? '0.6' : '1.5';

    // Validation checks
    let validationError: string | null = null;
    if (!currentWallet || !address) {
      validationError = 'Connect wallet first';
    } else if (fromToken.id === toToken.id) {
      validationError = 'Select two different tokens';
    } else if (
      (mode === 'buy-credit' || mode === 'multi-hop') &&
      toToken.kind === 'reserve' &&
      toToken.creditNeedNano <= 0n
    ) {
      validationError = `Swap from ${fromToken.symbol} to ${toToken.symbol} is disabled unless ${toToken.symbol} FiWallet sets credit required`;
    } else {
      const actionErr = getAccountActionError(accountData);
      if (actionErr && (mode === 'buy-credit' || mode === 'multi-hop')) {
        validationError = actionErr;
      } else if (
        (mode === 'buy-credit' || mode === 'multi-hop') &&
        (accountData?.debt ?? 0n) > 0n
      ) {
        validationError = 'Cannot buy credit while having outstanding debt';
      } else if (
        (mode === 'buy-credit' || mode === 'multi-hop') &&
        !toToken.hasPersonalToken
      ) {
        validationError = `${toToken.symbol} issuer has not deployed a Personal Token minter yet`;
      } else if (
        (mode === 'payback' || mode === 'multi-hop') &&
        !fromToken.hasPersonalToken
      ) {
        validationError = `${fromToken.symbol} minter is not registered`;
      } else if (
        (mode === 'payback' || mode === 'multi-hop') &&
        fromToken.creditMaturity > nowSec
      ) {
        validationError = `${fromToken.symbol} matures on ${formatMaturityDate(fromToken.creditMaturity)} — cannot redeem for ${fiSym} before maturity`;
      } else if (
        (mode === 'buy-credit' || mode === 'multi-hop') &&
        toToken.multiplier > 1 &&
        toToken.creditMaturity > 0 &&
        nowSec >= toToken.creditMaturity
      ) {
        validationError = `${toToken.symbol} bonus credit offer (${toToken.multiplier}x) has already matured`;
      } else if (inputNano > 0n) {
        if (inputNano > fromToken.userBalanceNano) {
          validationError = `Insufficient ${fromToken.symbol} balance (available: ${formatFi(fromToken.userBalanceNano)} ${fromToken.symbol})`;
        } else if (
          (mode === 'payback' || mode === 'multi-hop') &&
          inputNano > fromToken.issuerFiBalanceNano
        ) {
          validationError = `Amount exceeds ${fromToken.symbol} issuer's available ${fiSym} reserve (${formatFi(fromToken.issuerFiBalanceNano)} ${fiSym})`;
        } else if (
          (mode === 'buy-credit' || mode === 'multi-hop') &&
          intermediateFiNano > toToken.creditNeedNano
        ) {
          validationError = `Amount exceeds ${toToken.symbol} issuer's Credit Need capacity (${formatFi(toToken.creditNeedNano)} ${fiSym} available)`;
        } else if (outputNano <= 0n) {
          validationError = 'Output amount is too small';
        }
      }
    }

    return {
      mode,
      routeLabel,
      routeDescription,
      inputNano,
      outputNano,
      intermediateFiNano,
      fromAmountFormatted: !isReverseInput
        ? amountInput
        : inputNano > 0n
          ? formatNanoToken(inputNano)
          : '',
      toAmountFormatted: isReverseInput
        ? amountInput
        : outputNano > 0n
          ? formatNanoToken(outputNano)
          : '',
      effectiveRate,
      feeOrBonusPercent,
      gasTon,
      maxInputNano,
      validationError,
    };
  }, [
    fromToken,
    toToken,
    fiToken,
    amountInput,
    isReverseInput,
    currentWallet,
    address,
    accountData,
    nowSec,
  ]);

  const handleFromAmountChange = useCallback((val: string) => {
    setAmountInput(val);
    setIsReverseInput(false);
  }, []);

  const handleToAmountChange = useCallback((val: string) => {
    setAmountInput(val);
    setIsReverseInput(true);
  }, []);

  const handleMaxFrom = useCallback(() => {
    if (quote.maxInputNano <= 0n) return;
    setAmountInput(formatNanoToken(quote.maxInputNano));
    setIsReverseInput(false);
  }, [quote.maxInputNano]);

  const executeSwap = useCallback(async (): Promise<boolean> => {
    if (!address || !userOwnerAddress) {
      throw new Error('Connect wallet first');
    }
    if (quote.validationError) {
      throw new Error(quote.validationError);
    }
    if (quote.inputNano <= 0n) {
      throw new Error('Enter swap amount');
    }

    if (quote.mode === 'buy-credit') {
      const userFiWalletAddr = getFiWalletAddress(userOwnerAddress, net);
      const targetOwnerAddr = Address.parse(toToken.ownerAddress);
      const targetFiWalletAddr = getFiWalletAddress(targetOwnerAddr, net);
      const targetMinterAddr = toToken.minterAddress
        ? Address.parse(toToken.minterAddress)
        : getPersonalMinter({
            issuerWallet: targetFiWalletAddr,
            adminAddress: targetOwnerAddr,
          }).contractAddress;
      const buyerPersonalWalletAddr = computePersonalWalletAddress(
        targetMinterAddr,
        userOwnerAddress,
        targetOwnerAddr,
      );
      const payload = buildBuyCreditBody({
        transferRecipient: targetOwnerAddr,
        amount: quote.inputNano,
        responseAddress: userOwnerAddress,
      });

      await sendTx(
        [
          {
            toAddress: userFiWalletAddr.toString(),
            amount: GAS.CREDIT,
            payload,
          },
        ],
        {
          affectedContracts: [
            userFiWalletAddr,
            targetFiWalletAddr,
            targetMinterAddr,
            buyerPersonalWalletAddr,
          ],
        },
      );
    } else if (quote.mode === 'payback') {
      if (!fromToken.minterAddress) {
        throw new Error('Personal token minter address missing');
      }
      const fromMinterAddr = Address.parse(fromToken.minterAddress);
      const fromOwnerAddr = Address.parse(fromToken.ownerAddress);
      const personalWalletAddr = computePersonalWalletAddress(
        fromMinterAddr,
        userOwnerAddress,
        fromOwnerAddr,
      );
      const payload = buildBurnBody(
        quote.inputNano,
        userOwnerAddress,
        0n,
        null,
      );

      await sendTx(
        [
          {
            toAddress: personalWalletAddr.toString(),
            amount: GAS.BURN,
            payload,
          },
        ],
        {
          affectedContracts: [
            personalWalletAddr,
            fromMinterAddr,
            getFiWalletAddress(fromOwnerAddr, net),
            getFiWalletAddress(userOwnerAddress, net),
          ],
        },
      );
    } else {
      // Atomic Multi-Hop: P_A -> FI -> P_B
      if (!fromToken.minterAddress) {
        throw new Error('Source personal token minter address missing');
      }
      const fromMinterAddr = Address.parse(fromToken.minterAddress);
      const fromOwnerAddr = Address.parse(fromToken.ownerAddress);
      const personalWalletAddr = computePersonalWalletAddress(
        fromMinterAddr,
        userOwnerAddress,
        fromOwnerAddr,
      );
      const targetOwnerAddr = Address.parse(toToken.ownerAddress);
      const targetFiWalletAddr = getFiWalletAddress(targetOwnerAddr, net);
      const targetMinterAddr = toToken.minterAddress
        ? Address.parse(toToken.minterAddress)
        : getPersonalMinter({
            issuerWallet: targetFiWalletAddr,
            adminAddress: targetOwnerAddr,
          }).contractAddress;
      const buyerPersonalWalletAddr = computePersonalWalletAddress(
        targetMinterAddr,
        userOwnerAddress,
        targetOwnerAddr,
      );
      const swapTargetPayload = buildSwapTargetPayload(targetOwnerAddr);
      const payload = buildBurnBody(
        quote.inputNano,
        userOwnerAddress,
        0n,
        swapTargetPayload,
      );

      await sendTx(
        [
          {
            toAddress: personalWalletAddr.toString(),
            amount: GAS.CREDIT, // 1.5 TON covers both legs; excess returns to user
            payload,
          },
        ],
        {
          affectedContracts: [
            personalWalletAddr,
            fromMinterAddr,
            getFiWalletAddress(fromOwnerAddr, net),
            getFiWalletAddress(userOwnerAddress, net),
            targetFiWalletAddr,
            targetMinterAddr,
            buyerPersonalWalletAddr,
          ],
        },
      );
    }

    setAmountInput('');
    toast.success(`Swapped ${fromToken.symbol} for ${toToken.symbol}!`);
    return true;
  }, [address, userOwnerAddress, quote, net, toToken, fromToken, sendTx]);

  // Off-Ramp: Normal Burn of Reserve Token with Encrypted Bank Details to BRO_TREASURY_ADDRESS
  const executeFiatOffRampBurn = useCallback(
    async (
      offRampAmount: string,
      bankDetailsComment: string,
      isEncrypted = true,
    ): Promise<boolean> => {
      if (!address || !userOwnerAddress) {
        throw new Error('Connect wallet first');
      }
      const reserveToken = tokens.find((t) => t.kind === 'reserve');
      if (!reserveToken?.minterAddress) {
        throw new Error(
          `${reserveToken?.symbol ?? 'Token'} minter is not deployed yet`,
        );
      }
      const amountNano = parseUnits(offRampAmount.trim(), 9);
      if (amountNano <= 0n) {
        throw new Error('Enter amount to sell');
      }
      if (amountNano > reserveToken.userBalanceNano) {
        throw new Error(`Insufficient ${reserveToken.symbol} balance`);
      }

      const reserveMinterAddr = Address.parse(reserveToken.minterAddress);
      const reserveOwnerAddr = Address.parse(reserveToken.ownerAddress);
      const personalWalletAddr = computePersonalWalletAddress(
        reserveMinterAddr,
        userOwnerAddress,
        reserveOwnerAddr,
      );

      let customPayload: Cell | null = null;
      const trimmedComment = bankDetailsComment.trim();
      if (trimmedComment) {
        let didEncrypt = false;
        if (isEncrypted) {
          try {
            let tonClient: any;
            if (walletKit) {
              try {
                const targetNet = getChainNetwork(net);
                tonClient =
                  typeof walletKit.getApiClient === 'function'
                    ? walletKit.getApiClient(targetNet)
                    : (walletKit as any).getClient?.();
              } catch {
                tonClient = undefined;
              }
            }
            const theirPublicKey = await resolveRecipientPublicKey(
              reserveToken.ownerAddress,
              net,
              tonClient,
              savedWallets,
            );
            if (theirPublicKey) {
              const mnemonic = await getDecryptedMnemonic();
              if (mnemonic && mnemonic.length > 0) {
                const keyPair = await mnemonicToPrivateKey(mnemonic);
                const encryptedBytes = await encryptMessageComment(
                  trimmedComment,
                  keyPair.publicKey,
                  theirPublicKey,
                  keyPair.secretKey,
                  address,
                );
                customPayload =
                  packBytesAsSnakeForEncryptedData(encryptedBytes);
                didEncrypt = true;
              }
            }
          } catch (err) {
            console.warn(
              '[useEcosystemSwap] Encrypted off-ramp memo fallback to plain:',
              err,
            );
          }
        }
        if (!didEncrypt) {
          customPayload = createCommentPayload(trimmedComment);
        }
      }

      // Normal burn (sendExcessesTo = null) notifies adminAddress with customPayload
      const payload = buildBurnBody(amountNano, null, 0n, customPayload);

      await sendTx(
        [
          {
            toAddress: personalWalletAddr.toString(),
            amount: toNano('0.6'),
            payload,
          },
        ],
        {
          affectedContracts: [personalWalletAddr, reserveMinterAddr],
        },
      );

      toast.success(
        `${reserveToken.symbol} burned for fiat settlement! Issuer has been notified.`,
      );
      return true;
    },
    [
      address,
      userOwnerAddress,
      tokens,
      net,
      walletKit,
      savedWallets,
      getDecryptedMnemonic,
      sendTx,
    ],
  );

  const userWalletAddress = useMemo(() => {
    if (!userOwnerAddress) return address ?? '';
    return formatTonAddress(userOwnerAddress, {
      isContract: false,
      network: net,
    });
  }, [userOwnerAddress, address, net]);

  return {
    tokens,
    fiToken,
    fromToken,
    toToken,
    quote,
    isSwapping,
    txError,
    fiatBuyUrl: RESERVE_TOKEN_FIAT_BUY_URL,
    userWalletAddress,
    net,
    handleSelectFromToken,
    handleSelectToToken,
    flipDirection,
    handleFromAmountChange,
    handleToAmountChange,
    handleMaxFrom,
    addCustomMemberOwner,
    executeSwap,
    executeFiatOffRampBurn,
  };
}
