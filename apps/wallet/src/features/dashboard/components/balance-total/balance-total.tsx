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

  const ready = balance !== undefined;

  // Primary token for BrotherHood is FI
  const fiJetton = useMemo(
    () => userJettons.find((j) => isFiJetton(j)),
    [userJettons],
  );

  const fiAmount = useMemo(() => {
    if (!fiJetton) return 0;
    return toDecimal(fiJetton.balance, fiJetton.decimalsNumber ?? 9);
  }, [fiJetton]);

  const totalUsd = useMemo(() => {
    if (!ready || ratesUpdated === 0) return 0;

    let total = 0;
    const tonRate = rates['GRAM']?.rate;
    if (tonRate) {
      total += toDecimal(balance, GRAM_DECIMALS) * tonRate;
    }
    for (const jetton of userJettons) {
      const rate = findRate(rates, jetton.address)?.rate;
      if (!rate) continue;
      total += toDecimal(jetton.balance, jetton.decimalsNumber ?? 9) * rate;
    }
    return total;
  }, [ready, ratesUpdated, rates, balance, userJettons]);

  const handleCopy = useCallback(async () => {
    if (!address) return;
    await copyWalletAddress(address);
  }, [address, copyWalletAddress]);

  const animatedFi = useCountUp(fiAmount);
  const { intPart, fracPart } = formatNumberParts(animatedFi);
  const tonDecimal =
    balance !== undefined ? toDecimal(balance, GRAM_DECIMALS) : 0;

  return (
    <section className="flex flex-col items-center pt-6 pb-6 text-center">
      {ready ? (
        <>
          <div className="flex items-baseline justify-center font-display font-bold tabular-nums leading-none tracking-[-2%]">
            <span className="text-5xl text-foreground">{intPart}</span>
            <span className="text-5xl text-muted-foreground">.</span>
            <span className="text-3xl text-muted-foreground">{fracPart}</span>
            <span className="ml-2 text-2xl font-semibold text-primary">FI</span>
          </div>

          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground font-medium">
            {totalUsd > 0 && (
              <>
                <span>≈ ${usdFormat.format(totalUsd)} USD</span>
                <span>•</span>
              </>
            )}
            <span>{tonDecimal.toFixed(2)} TON</span>
          </div>
        </>
      ) : (
        <div className="h-12 w-56 rounded-lg bg-muted animate-pulse" />
      )}

      {address ? (
        <button
          type="button"
          onClick={handleCopy}
          className="mt-3 flex items-center gap-1.5 rounded-full px-3 py-1 bg-secondary/60 hover:bg-secondary transition-colors"
          aria-label="Copy address"
        >
          <span className="w-4 h-4 rounded-full overflow-hidden inline-block shrink-0">
            <img src={assetUrl('fi.svg')} alt="FI" className="w-full h-full" />
          </span>
          <span className="text-xs font-medium text-foreground">
            {formatWalletAddress(address, true, 4)}
          </span>
          <Copy className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      ) : (
        <div className="mt-3 h-4 w-32 rounded-full bg-muted animate-pulse" />
      )}
    </section>
  );
};
