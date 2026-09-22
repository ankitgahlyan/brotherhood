/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useCallback, useMemo } from 'react';
import { Copy } from 'lucide-react';
import { useWallet, useJettons, useRates } from '@demo/wallet-core';

import { useCountUp } from '@/core/hooks/use-count-up';
import { assetUrl, findRate, toDecimal } from '@/core/utils';
import { useFormatAddress } from '@/core/utils/formatters';
import { isFiJetton } from '@/features/jettons';
import { useFiAccount } from '@/features/brotherhood/hooks/use-fi-account';
import { usePersonalJettonInfo } from '@/features/personal-jetton/hooks/use-personal-jetton-info';
import { FI_ADDRESS } from '@/lib/brotherhood/config';

const fiFormat = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const usdFormat = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Formats a numeric value into integer and fraction parts. */
const formatNumberParts = (
  value: number,
): { intPart: string; fracPart: string } => {
  const [intPart, fracPart = '00'] = fiFormat.format(value).split('.');
  return { intPart, fracPart };
};

const GRAM_DECIMALS = 9;

export const BalanceTotal: React.FC = () => {
  const { address, balance } = useWallet();
  const { formatWalletAddress, copyWalletAddress } = useFormatAddress();
  const { userJettons } = useJettons();
  const { entries: rates, lastUpdated: ratesUpdated } = useRates();
  const fiAccount = useFiAccount(address ?? null);
  const { personalBalance } = usePersonalJettonInfo(address ?? null);

  const ready = balance !== undefined || Boolean(fiAccount.data);

  // Primary token for BrotherHood is FI
  const fiJetton = useMemo(
    () => userJettons.find((j) => isFiJetton(j)),
    [userJettons],
  );

  const fiAmount = useMemo(() => {
    if (fiJetton) {
      return toDecimal(fiJetton.balance, fiJetton.decimalsNumber ?? 9);
    }
    if (fiAccount.data?.jettonBalance !== undefined) {
      return toDecimal(fiAccount.data.jettonBalance, 9);
    }
    return 0;
  }, [fiJetton, fiAccount.data]);

  const hdJetton = useMemo(
    () =>
      userJettons.find((j) => {
        const sym = j.info?.symbol;
        return sym?.toUpperCase() === 'HD';
      }),
    [userJettons],
  );

  const hdAmount = useMemo(() => {
    if (hdJetton) {
      return toDecimal(hdJetton.balance, hdJetton.decimalsNumber ?? 9);
    }
    if (personalBalance !== null && personalBalance !== undefined) {
      return toDecimal(personalBalance, 9);
    }
    return 0;
  }, [hdJetton, personalBalance]);

  const totalUsd = useMemo(() => {
    if (!ready || ratesUpdated === 0) return 0;

    let total = 0;
    const tonRate = rates['GRAM']?.rate;
    if (tonRate && balance !== undefined) {
      total += toDecimal(balance, GRAM_DECIMALS) * tonRate;
    }
    for (const jetton of userJettons) {
      const rate = findRate(rates, jetton.address)?.rate;
      if (!rate) continue;
      total += toDecimal(jetton.balance, jetton.decimalsNumber ?? 9) * rate;
    }
    if (fiAmount > 0 && !userJettons.some((j) => isFiJetton(j))) {
      const fiRate = findRate(rates, FI_ADDRESS)?.rate;
      if (fiRate) {
        total += fiAmount * fiRate;
      }
    }
    return total;
  }, [ready, ratesUpdated, rates, balance, userJettons, fiAmount]);

  const [copied, setCopied] = React.useState(false);

  const handleCopy = useCallback(async () => {
    if (!address) return;
    await copyWalletAddress(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [address, copyWalletAddress]);

  const animatedFi = useCountUp(fiAmount);
  const { intPart, fracPart } = formatNumberParts(animatedFi);
  const tonDecimal =
    balance !== undefined ? toDecimal(balance, GRAM_DECIMALS) : 0;

  return (
    <section className="relative flex flex-col items-center pt-5 pb-5 text-center">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-24 rounded-full bg-primary/15 blur-3xl -z-10 pointer-events-none" />

      {ready ? (
        <>
          <div className="flex items-baseline justify-center font-display font-bold tabular-nums leading-none tracking-tight">
            <span className="text-5xl font-extrabold text-foreground tracking-tight drop-shadow-xs">
              {intPart}
            </span>
            <span className="text-5xl text-muted-foreground/70">.</span>
            <span className="text-3xl font-semibold text-muted-foreground">
              {fracPart}
            </span>
            <span className="ml-2 text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              FI
            </span>
          </div>

          <div className="mt-2.5 flex items-center gap-2 text-xs text-muted-foreground font-medium">
            {totalUsd > 0 && (
              <>
                <span className="font-semibold text-foreground/80">
                  ≈ ${usdFormat.format(totalUsd)} USD
                </span>
                <span className="text-muted-foreground/50">•</span>
              </>
            )}
            <span>{tonDecimal.toFixed(2)} TON</span>
            <span className="text-muted-foreground/50">•</span>
            <span>{hdAmount.toFixed(2)} HD</span>
          </div>
        </>
      ) : (
        <div className="h-12 w-56 rounded-2xl bg-muted/60 animate-pulse" />
      )}

      {address ? (
        <button
          type="button"
          onClick={handleCopy}
          className="mt-3.5 flex items-center gap-1.5 rounded-full px-3.5 py-1.5 bg-secondary/70 hover:bg-secondary border border-border/70 active:scale-[0.96] transition-all cursor-pointer shadow-2xs"
          aria-label="Copy address"
        >
          <span className="w-4 h-4 rounded-full overflow-hidden inline-block shrink-0 ring-1 ring-border/50">
            <img src={assetUrl('fi.svg')} alt="FI" className="w-full h-full" />
          </span>
          <span className="text-xs font-semibold text-foreground">
            {formatWalletAddress(address, true, 4)}
          </span>
          {copied ? (
            <span className="text-emerald-500 flex items-center gap-1 text-xs font-semibold">
              Copied
            </span>
          ) : (
            <Copy className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors" />
          )}
        </button>
      ) : (
        <div className="mt-3.5 h-7 w-32 rounded-full bg-muted/60 animate-pulse" />
      )}
    </section>
  );
};
