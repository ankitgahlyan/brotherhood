/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useState, useMemo, useCallback } from 'react';
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
  parseUnits,
} from '@/lib/brotherhood/deploy';
import {
  getFiWalletAddress,
  getPersonalWalletAddress,
  isZeroAddress,
} from '@/lib/brotherhood/ton';
import {
  useFiWalletState,
  usePersonalWalletBalance,
  useRefreshContractQueries,
} from '@/lib/brotherhood/queries';
import {
  deleteContractCache,
  getContractCacheSync,
  getNormalizedContractCacheKey,
} from '@/lib/brotherhood/contract-cache';
import { computePersonalWalletAddress } from '@/lib/brotherhood/account-state-hydrator';
import {
  useFiAccount,
  useMemberProfiles,
  useBrotherhoodTransaction,
  GAS,
  getAccountActionError,
} from '@/features/brotherhood';
import { formatFi } from '@/features/brotherhood/components/credit/credit-member-card';
import { getJettonsImage, getJettonsSymbol } from '@/features/jettons';
import { formatUnits, assetUrl } from '@/core/utils';
import { useFormatAddress, formatTonAddress } from '@/core/utils/formatters';
import { useNowSeconds } from '@/core/hooks';
import {
  encryptMessageComment,
  packBytesAsSnakeForEncryptedData,
} from '@/core/utils/encryption';
import { resolveRecipientPublicKey } from '@/core/storage/publicKeyCache';
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
  const refreshQueries = useRefreshContractQueries();

  const {
    send: sendTx,
    isSending: isSwapping,
    error: txError,
  } = useBrotherhoodTransaction(currentWallet, walletKit);

  // 1. User's own FI Account
  const { data: accountData, refetch: refetchUserAccount } = useFiAccount(
    address ?? null,
  );

  const userOwnerAddress = useMemo(() => {
    if (!address) return null;
    try {
      return Address.parse(address);
    } catch {
      return null;
    }
  }, [address]);

  // 2. Treasury Reserve Token (BRO_TREASURY_ADDRESS)
  const treasuryOwnerAddress = useMemo(() => {
    try {
      return Address.parse(BRO_TREASURY_ADDRESS);
    } catch {
      return null;
    }
  }, []);

  const treasuryFiState = useFiWalletState(treasuryOwnerAddress, net);
  const treasuryMinterAddr = useMemo(() => {
    const m =
      treasuryFiState.data?.addresses?.ref?.trustedJettonAddrs?.ref
        ?.personalJettonMinter;
    return m && !isZeroAddress(m) ? m : null;
  }, [treasuryFiState.data]);

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

  // Build unified list of EcosystemTokens
  const tokens = useMemo<EcosystemToken[]>(() => {
    const list: EcosystemToken[] = [];

    // Pinned #1: BrotherHood FI (Gram)
    const userFiBalance = accountData?.jettonBalance ?? 0n;
    const userFiWalletAddr = userOwnerAddress
      ? formatTonAddress(getFiWalletAddress(userOwnerAddress, net), {
          isContract: true,
          network: net,
        })
      : FI_ADDRESS;

    list.push({
      id: 'FI',
      kind: 'fi',
      symbol: 'FI',
      name: 'BrotherHood FI (Gram)',
      icon: assetUrl('gram.svg'),
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

    // Pinned #2: Reserve Token (Treasury Stablecoin)
    const treasuryStore = treasuryFiState.data;
    const treasuryFiWalletStr = treasuryOwnerAddress
      ? formatTonAddress(getFiWalletAddress(treasuryOwnerAddress, net), {
          isContract: true,
          network: net,
        })
      : BRO_TREASURY_ADDRESS;
    const treasuryMinterStr = treasuryMinterAddr
      ? formatTonAddress(treasuryMinterAddr, { isContract: true, network: net })
      : null;

    let reserveUserBal = userReserveBalanceQuery.data ?? 0n;
    if (reserveUserBal === 0n && treasuryMinterStr) {
      const matchingJetton = activeJettons.find((j) => {
        try {
          return Address.parse(j.address).equals(treasuryMinterAddr!);
        } catch {
          return false;
        }
      });
      if (matchingJetton?.balance) {
        try {
          reserveUserBal = BigInt(matchingJetton.balance);
        } catch {
          // ignore
        }
      }
    }

    const treasuryMultiplier = normalizeOnchainMultiplier(
      treasuryStore?.multiplier,
    );

    list.push({
      id: 'RESERVE',
      kind: 'reserve',
      symbol: 'RESERVE',
      name: 'Reserve Token (Fiat Stablecoin)',
      ownerAddress: BRO_TREASURY_ADDRESS,
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

      // Check user's held balance of this member's Personal Token
      let userPtBal = 0n;
      let jettonSymbol: string | undefined;
      let jettonIcon: string | undefined;

      if (hasPt && minterParsed) {
        const matchingJetton = activeJettons.find((j) => {
          try {
            return Address.parse(j.address).equals(minterParsed!);
          } catch {
            return false;
          }
        });
        if (matchingJetton) {
          jettonSymbol = getJettonsSymbol(matchingJetton);
          jettonIcon = getJettonsImage(matchingJetton);
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
      const displayName = cleanUsername
        ? `@${cleanUsername} Personal Token`
        : `Member Personal Token (${prof.ownerAddress.slice(0, 6)}…)`;

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
    treasuryFiState.data,
    treasuryOwnerAddress,
    treasuryMinterAddr,
    userReserveBalanceQuery.data,
    activeJettons,
    memberProfilesQuery.data,
    circleFiWalletAddrs,
    ringFiWalletAddrs,
    votedFiWalletAddrs,
    allMemberFiWalletAddrs,
  ]);

  const [fromTokenId, setFromTokenId] = useState<string>('FI');
  const [toTokenId, setToTokenId] = useState<string>('RESERVE');
  const [amountInput, setAmountInput] = useState<string>('');
  const [isReverseInput, setIsReverseInput] = useState<boolean>(false);

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
        setToTokenId(fromToken.id);
      }
      setFromTokenId(id);
    },
    [fromToken.id, toToken.id],
  );

  const handleSelectToToken = useCallback(
    (id: string) => {
      if (id === fromToken.id) {
        setFromTokenId(toToken.id);
      }
      setToTokenId(id);
    },
    [fromToken.id, toToken.id],
  );

  const flipDirection = useCallback(() => {
    setFromTokenId(toToken.id);
    setToTokenId(fromToken.id);
    setIsReverseInput(false);
  }, [fromToken.id, toToken.id]);

  // Compute deterministic Swap Quote
  const quote = useMemo<EcosystemSwapQuote>(() => {
    const mode: EcosystemSwapMode =
      fromToken.kind === 'fi'
        ? 'buy-credit'
        : toToken.kind === 'fi'
          ? 'payback'
          : 'multi-hop';

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
      // Payback is strictly 1:1 in FI
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
          ? `${fromToken.symbol} → FI (Payback)`
          : `${fromToken.symbol} → FI → ${toToken.symbol} (Atomic Multi-Hop)`;

    const routeDescription =
      mode === 'buy-credit'
        ? `Sends FI to ${toToken.symbol} issuer's FossFiWallet and mints ${toToken.symbol} at ${toToken.multiplier}x.`
        : mode === 'payback'
          ? `Burns ${fromToken.symbol} and redeems 1:1 FI from the issuer's FossFiWallet.`
          : `Single-signature atomic hop: burns ${fromToken.symbol} for 1:1 FI, then automatically forwards FI to mint ${toToken.symbol} at ${toToken.multiplier}x.`;

    const gasTon = mode === 'payback' ? '0.6' : '1.5';

    // Validation checks
    let validationError: string | null = null;
    if (!currentWallet || !address) {
      validationError = 'Connect wallet first';
    } else if (fromToken.id === toToken.id) {
      validationError = 'Select two different tokens';
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
        validationError = `${fromToken.symbol} matures on ${formatMaturityDate(fromToken.creditMaturity)} — cannot redeem for FI before maturity`;
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
          validationError = `Amount exceeds ${fromToken.symbol} issuer's available FI reserve (${formatFi(fromToken.issuerFiBalanceNano)} FI)`;
        } else if (
          (mode === 'buy-credit' || mode === 'multi-hop') &&
          intermediateFiNano > toToken.creditNeedNano
        ) {
          validationError = `Amount exceeds ${toToken.symbol} issuer's Credit Need capacity (${formatFi(toToken.creditNeedNano)} FI available)`;
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
      const payload = buildBuyCreditBody({
        transferRecipient: targetOwnerAddr,
        amount: quote.inputNano,
        responseAddress: userOwnerAddress,
      });

      await sendTx([
        {
          toAddress: userFiWalletAddr.toString(),
          amount: GAS.CREDIT,
          payload,
        },
      ]);
    } else if (quote.mode === 'payback') {
      if (!fromToken.minterAddress) {
        throw new Error('Personal token minter address missing');
      }
      const personalWalletAddr = await getPersonalWalletAddress(
        Address.parse(fromToken.minterAddress),
        userOwnerAddress,
        net,
      );
      const payload = buildBurnBody(
        quote.inputNano,
        userOwnerAddress,
        0n,
        null,
      );

      await sendTx([
        {
          toAddress: personalWalletAddr.toString(),
          amount: GAS.BURN,
          payload,
        },
      ]);
    } else {
      // Atomic Multi-Hop: P_A -> FI -> P_B
      if (!fromToken.minterAddress) {
        throw new Error('Source personal token minter address missing');
      }
      const personalWalletAddr = await getPersonalWalletAddress(
        Address.parse(fromToken.minterAddress),
        userOwnerAddress,
        net,
      );
      const targetOwnerAddr = Address.parse(toToken.ownerAddress);
      const swapTargetPayload = buildSwapTargetPayload(targetOwnerAddr);
      const payload = buildBurnBody(
        quote.inputNano,
        userOwnerAddress,
        0n,
        swapTargetPayload,
      );

      await sendTx([
        {
          toAddress: personalWalletAddr.toString(),
          amount: GAS.CREDIT, // 1.5 TON covers both legs; excess returns to user
          payload,
        },
      ]);
    }

    await deleteContractCache(`fi-wallet-state:${userOwnerAddress.toString()}`);
    await refreshQueries([
      `fi-wallet-state:${userOwnerAddress.toString()}`,
      `member-profiles:${net}`,
    ]);
    refetchUserAccount();
    setAmountInput('');
    toast.success(`Swapped ${fromToken.symbol} for ${toToken.symbol}!`);
    return true;
  }, [
    address,
    userOwnerAddress,
    quote,
    net,
    toToken,
    fromToken,
    sendTx,
    refreshQueries,
    refetchUserAccount,
  ]);

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
        throw new Error('Reserve Token minter is not deployed yet');
      }
      const amountNano = parseUnits(offRampAmount.trim(), 9);
      if (amountNano <= 0n) {
        throw new Error('Enter amount to sell');
      }
      if (amountNano > reserveToken.userBalanceNano) {
        throw new Error('Insufficient Reserve Token balance');
      }

      const personalWalletAddr = await getPersonalWalletAddress(
        Address.parse(reserveToken.minterAddress),
        userOwnerAddress,
        net,
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
              BRO_TREASURY_ADDRESS,
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

      // Normal burn (sendExcessesTo = null) notifies BRO_TREASURY_ADDRESS with customPayload
      const payload = buildBurnBody(amountNano, null, 0n, customPayload);

      await sendTx([
        {
          toAddress: personalWalletAddr.toString(),
          amount: toNano('0.6'),
          payload,
        },
      ]);

      await refreshQueries([`fi-wallet-state:${userOwnerAddress.toString()}`]);
      toast.success(
        'Reserve Token burned for fiat settlement! Treasury has been notified.',
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
      refreshQueries,
    ],
  );

  return {
    tokens,
    fromToken,
    toToken,
    quote,
    isSwapping,
    txError,
    fiatBuyUrl: RESERVE_TOKEN_FIAT_BUY_URL,
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
